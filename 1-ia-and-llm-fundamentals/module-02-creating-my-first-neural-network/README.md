# Module 02 — Creating My First Neural Network

A small, fully-commented example of building, training, and using a neural
network in **Node.js** with [TensorFlow.js](https://www.tensorflow.org/js)
(`@tensorflow/tfjs-node`).

The model is a **binary classifier** that predicts whether an employee will
**stay** or **leave**, based on attributes like education, city, age, payment
tier, and experience.

## What it does

1. Loads and preprocesses an employee CSV dataset.
2. Trains a feed-forward network (or loads a previously saved one).
3. Evaluates accuracy on a sample of the test set.
4. Persists the trained model to disk so the next run skips training.

## Project structure

```
.
├── app/
│   ├── index.js      # Entry point: loads data, trains/loads, evaluates
│   ├── data.js       # CSV loading, feature encoding, and min-max scaling
│   ├── model.js      # Model definition, training, save/load, and predict
│   └── polyfill.js   # Restores Node util helpers removed in Node 23+
├── datasets/
│   ├── employee-training.csv
│   └── employee-test.csv
├── saved-model/      # Generated after first run (model.json + weights.bin)
└── package.json
```

## Requirements

- Node.js (works on modern versions; `polyfill.js` patches `util` helpers that
  `tfjs-node` 4.x still relies on, which were removed in Node 23+).
- Dependencies installed via npm.

## Getting started

```bash
# Install dependencies
npm install

# Run the demo (trains on first run, then reuses the saved model)
npm start
```

`npm start` runs `node --watch app/index.js`. On the **first run** it trains a
new model and saves it to `saved-model/`. On **subsequent runs** it loads that
saved model instead of retraining. To force a fresh training run, delete the
`saved-model/` directory.

## How it works

### Data preprocessing (`data.js`)

Each CSV row is turned into a **14-feature** numeric vector:

| Feature                     | Encoding              | Size |
| --------------------------- | --------------------- | ---- |
| Education                   | one-hot               | 3    |
| JoiningYear                 | min-max scaled        | 1    |
| City                        | one-hot               | 3    |
| PaymentTier                 | one-hot               | 3    |
| Age                         | min-max scaled        | 1    |
| Gender                      | binary                | 1    |
| EverBenched                 | binary                | 1    |
| ExperienceInCurrentDomain   | min-max scaled        | 1    |

The target `LeaveOrNot` is one-hot encoded: `[1, 0]` = stays, `[0, 1]` = leaves.

Continuous columns are min-max scaled to `~[0, 1]` so they don't dominate the
one-hot/binary features. The scaling bounds (`stats`) are computed from the
**training** set and reused on the test set so both are scaled identically.

### Model (`model.js`)

A `tf.sequential` network with three ReLU hidden layers and a softmax output:

```
Input (14) → Dense 112 (ReLU) → Dense 56 (ReLU) → Dense 28 (ReLU) → Dense 2 (softmax)
```

- **Loss:** categorical crossentropy (pairs with softmax + one-hot targets)
- **Optimizer:** Adam
- **Training:** 50 epochs, batch size 32, 20% validation split, shuffled

The output is a probability distribution `[P(stays), P(leaves)]`; the predicted
class is the argmax of the two.

## Output

Running the demo prints per-epoch loss/accuracy during training, then the
predicted vs. actual class for the first 100 test rows and the overall accuracy
on that sample.