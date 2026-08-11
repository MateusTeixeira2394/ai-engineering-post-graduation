# E-commerce Recommendation System

A web application that displays user profiles and product listings, with the ability to track user purchases for future machine learning recommendations using TensorFlow.js.

## Project Structure

- `index.html` - Main HTML file for the application
- `index.js` - Entry point for the application
- `view/` - Contains classes for managing the DOM and templates
- `controller/` - Contains controllers to connect views and services
- `service/` - Contains business logic for data handling
- `data/` - Contains JSON files with user and product data

## Setup and Run

1. Install dependencies:
```
npm install
```

2. Start the application:
```
npm start
```

3. Open your browser and navigate to `http://localhost:8080`

## Features

- User profile selection with details display
- Past purchase history display
- Product listing with "Buy Now" functionality
- Purchase tracking using sessionStorage

## How `trainModel` works

All the machine learning lives in [src/workers/modelTrainingWorker.js](src/workers/modelTrainingWorker.js), inside a Web Worker so the UI thread never freezes while TensorFlow.js is training.

The entry point is [`trainModel`](src/workers/modelTrainingWorker.js#L172-L194), triggered by a `trainModel` message from the main thread with the current list of users (including purchases made in this session). It runs six steps:

```
users ──┐
        ├─► makeContext ──► encodeProduct (cache) ──► createTrainingData ──► train ──► ready
products┘
```

1. Report progress (`1%`) so the UI can show that something started.
2. Fetch `/data/products.json` — the product catalog is loaded inside the worker, not passed in.
3. Build the **context** (`makeContext`).
4. Pre-encode every product into a vector and cache it on the context (`context.productVectors`).
5. Build the **training dataset** (`createTrainingData`).
6. Define, compile and fit the **neural network** (`configureNeuralNetAndTrain`), then report `100%` and `trainingComplete`.

The `context` and the trained model are stored in module-level variables (`_globalCtx`, `_model`) so the later `recommend` message can reuse them without retraining.

### 1. The context — what it is and why it exists

A neural network only accepts numbers. The context is the **dictionary that converts the dataset's vocabulary into numbers**, and it must be computed once and reused everywhere, otherwise the same product would be encoded differently at training time and at recommendation time.

[`makeContext(products, users)`](src/workers/modelTrainingWorker.js#L20-L80) computes:

| Field | What it is | Used for |
| --- | --- | --- |
| `minAge` / `maxAge` | age range across users | normalizing ages |
| `minPrice` / `maxPrice` | price range across products | normalizing prices |
| `colorsIndex` | `{ "preto": 0, "prata": 1, ... }` | one-hot position of each color |
| `categoriesIndex` | `{ "eletrônicos": 0, "vestuário": 1, ... }` | one-hot position of each category |
| `productAvgAgeNorm` | per product, the normalized average age of the people who bought it | a weak "who buys this" signal |
| `numColors` / `numCategories` | vocabulary sizes | one-hot vector lengths |
| `dimentions` | `2 + numCategories + numColors` | length of every feature vector |

**Normalization.** `normalize(value, min, max) = (value - min) / (max - min)` maps a continuous value into `0–1`. Without it, price (`39.99–199.99`) would numerically dwarf age (`22–30`) and dominate the gradients. The `|| 1` guard avoids a division by zero when every value is identical.

**Average buyer age per product.** The function walks every purchase of every user, accumulating `ageSums[productName]` and `ageCounts[productName]`, then divides to get the mean buyer age per product. Products nobody bought get the midpoint `(minAge + maxAge) / 2` — a neutral value that pulls the model in no direction. The result is normalized to `0–1`.

**Vector size.** With the shipped dataset (10 products, 4 categories, 8 colors), `dimentions = 2 + 4 + 8 = 14`: one slot for price, one for age, 4 for the category one-hot, 8 for the color one-hot.

### 2. Feature weights

```js
const WEIGHTS = { category: 0.4, color: 0.3, price: 0.2, age: 0.1 }
```

These are **manual priors**: every feature block is multiplied by its weight after normalization, so a category match contributes up to `0.4` and an age signal at most `0.1`. This is domain knowledge injected by hand ("category matters more than age"), not something the network learns — the network can still re-weigh things internally, but it starts from a scale that already favors category and color.

### 3. Encoding a product

[`encodeProduct(product, context)`](src/workers/modelTrainingWorker.js#L86-L100) turns one product object into a single 1D tensor of length `dimentions`, by concatenating four blocks **in this exact order**:

```
[ price | age | color one-hot | category one-hot ]
   1        1      numColors      numCategories
```

- **price** — `normalize(price, minPrice, maxPrice) * 0.2`
- **age** — `productAvgAgeNorm[name] * 0.1`, falling back to `0.5` (neutral) when the product is unknown
- **color** — `oneHotWeighted(colorsIndex[color], numColors, 0.3)`
- **category** — `oneHotWeighted(categoriesIndex[category], numCategories, 0.4)`

`oneHotWeighted` uses `tf.oneHot(index, length)`, which produces a vector of zeros with a single `1` at `index` (e.g. `preto` → `[1,0,0,0,0,0,0,0]`), casts it to `float32` and multiplies it by the weight, so the "hot" slot becomes the weight itself (`0.3`).

Concrete example — *Fones de Ouvido Sem Fio* (`preto`, `eletrônicos`, `129.99`), with `minPrice=39.99`, `maxPrice=199.99`:

```
price    (129.99 - 39.99) / 160 = 0.5625  → 0.5625 * 0.2 = 0.1125
age      3 buyers, avg age 26.67 → (26.67 - 22) / 8 = 0.5833
                                          → 0.5833 * 0.1 = 0.0583
color    index 0 of 8                     → [0.3, 0, 0, 0, 0, 0, 0, 0]
category index 0 of 4                     → [0.4, 0, 0, 0]

vector = [0.1125, 0.0583, 0.3, 0, 0, 0, 0, 0, 0, 0, 0.4, 0, 0, 0]   // 14 numbers
```

The ordering matters more than it looks: the network learns "slot 4 means the color *azul*". Any encoder that emits the same information in a different slot order produces garbage predictions.

### 4. Encoding a user

A user has no color or price of their own — their taste is defined by **what they bought**. [`encodeUser(user, context)`](src/workers/modelTrainingWorker.js#L102-L115) has two branches:

**With purchases** — encode every purchased product, stack them into a matrix of shape `[numPurchases, dimentions]`, and take `.mean(0)`: the column-wise average, i.e. the **centroid of the user's taste**. Someone who bought two black electronics ends up with high values in the `eletrônicos` and `preto` slots; someone with mixed purchases gets a diluted, flatter vector. It's finally reshaped to `[1, dimentions]` so it can be concatenated with a product row.

```
purchase 1 → [0.1125, 0.0583, 0.3,  0,    ... 0.4, 0, 0, 0]
purchase 2 → [0.2000, 0.0400, 0,    0.3,  ... 0.4, 0, 0, 0]
              ────────────────── mean(0) ──────────────────
user       → [0.1562, 0.0491, 0.15, 0.15, ... 0.4, 0, 0, 0]
```

**Without purchases** — a cold-start vector: zeros everywhere except the normalized age slot. There is no evidence about preferred color, category or price range, so those blocks stay neutral and the model falls back to whatever it learned about age.

The key property is that **users and products live in the same vector space with the same length** — that's what makes the next step possible.

### 5. Building the training dataset

[`createTrainingData(context)`](src/workers/modelTrainingWorker.js#L117-L139) frames the problem as **binary classification over (user, product) pairs**, not as a ranking or a regression:

- Iterate over every user who has at least one purchase (a user with no purchases carries no label information).
- Encode the user once, then pair them with **every product in the catalog**.
- Concatenate the two vectors into one input row: `[...userVector, ...productVector]` → length `dimentions * 2` (28 with this dataset).
- Label it `1` if the user actually bought that product, `0` otherwise.

```
xs (inputs)                                    ys (labels)
[ user Ana | Fones de Ouvido ]  ← 28 numbers        1
[ user Ana | Relógio         ]                      1
[ user Ana | Camiseta        ]                      0
[ user Ana | ...             ]                      0
[ user Bruno | ...           ]                      ...
```

`.dataSync()` pulls the tensor values into a plain `Float32Array` so they can be spread with `...` into a JS array; the arrays are then converted back into tensors: `xs` as a `tensor2d` of shape `[rows, 28]` and `ys` as a `tensor2d` of shape `[rows, 1]`.

With the shipped data this yields 5 users × 10 products = **50 rows**, of which only a handful are positive. Note this is a heavily imbalanced, very small dataset — fine as a teaching exercise, not representative of a production recommender.

### 6. The neural network

[`configureNeuralNetAndTrain`](src/workers/modelTrainingWorker.js#L141-L170) builds a sequential fully-connected network:

| Layer | Units | Activation | Role |
| --- | --- | --- | --- |
| input dense | 128 | `relu` | reads the 28-number user+product pair |
| hidden dense | 64 | `relu` | compresses interactions |
| hidden dense | 32 | `relu` | compresses further |
| output dense | 1 | `sigmoid` | outputs a probability `0–1` |

- **`relu`** (`max(0, x)`) introduces non-linearity so the model can learn *combinations* ("this user's category centroid matches this product's category"), which a linear model could not.
- **`sigmoid`** squashes the final value into `0–1`, readable as "probability that this user buys this product".
- **`binaryCrossentropy`** is the matching loss for a 0/1 target; **`adam`** is the optimizer (adaptive learning rate).

Training runs for `100` epochs with `batchSize: 32`, `shuffle: true` and `validationSplit: 0.2` (the last 20% of rows is held out for validation). The `onEpochEnd` callback posts a `trainingLog` message per epoch with loss and accuracy so the UI can plot progress.

### 7. What is cached for inference

Before training, `trainModel` pre-computes `context.productVectors`:

```js
{ name, meta: { ...product }, vector: encodeProduct(product, context).dataSync() }
```

This is a pure optimization: the catalog never changes between predictions, so encoding it once avoids redoing the whole tensor pipeline on every recommendation. `meta` keeps the raw product so [`recommend`](src/workers/modelTrainingWorker.js#L195-L218) can return display-ready objects.

At recommendation time the flow mirrors training exactly: encode the user, concatenate them with each cached product vector, run a single batched `model.predict`, read the scores with `dataSync()`, and sort the products descending by score.

### Known rough edges

A few things worth being aware of when reading or extending this code:

- **`model.fit` is not awaited** in `configureNeuralNetAndTrain`, so `trainModel` posts `trainingComplete` while training is still running. The `recommend` handler can therefore run against a partially trained model.
- **Block order mismatch in the cold-start branch** of `encodeUser`: it emits `price, age, categories, colors` while `encodeProduct` emits `price, age, colors, categories`. With `numCategories !== numColors` the vector is still the right length but semantically misaligned (it happens to be all zeros here, which hides the bug).
- **Tensors are never disposed.** `encodeProduct` is called `users × products` times and every intermediate tensor stays in memory; `tf.tidy()` would clean this up.
- **`dimentions`** is a typo for `dimensions`, kept consistent throughout the file.

## Future Enhancements

- TensorFlow.js-based recommendation engine
- User similarity analysis
- Product recommendation based on purchase history
