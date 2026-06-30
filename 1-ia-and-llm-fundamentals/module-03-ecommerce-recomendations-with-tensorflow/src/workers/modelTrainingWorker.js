import 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js';
import { workerEvents } from '../events/constants.js';

const WEIGHTS = {
    category: 0.4,
    color: 0.3,
    price: 0.2,
    age: 0.1,
}

let _globalCtx = null;
let _model = null;

// 🔢 Normalize continuous values (price, age) to 0–1 range
// Why? Keeps all features balanced so no one dominates training
// Formula: (val - min) / (max - min)
// Example: price=129.99, minPrice=39.99, maxPrice=199.99 → 0.56
const normalize = (value, min, max) => (value - min) / ((max - min) || 1)

function makeContext(products, users) {
    const ages = users.map(u => u.age)
    const prices = products.map(p => p.price)

    const minAge = Math.min(...ages)
    const maxAge = Math.max(...ages)

    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)

    const colors = [...new Set(products.map(p => p.color))]
    const categories = [...new Set(products.map(p => p.category))]

    const colorsIndex = Object.fromEntries(
        colors.map((color, index) => {
            return [color, index]
        }))
    const categoriesIndex = Object.fromEntries(
        categories.map((category, index) => {
            return [category, index]
        }))

    // Computar a média de idade dos comprados por produto
    // (ajuda a personalizar)
    const midAge = (minAge + maxAge) / 2
    const ageSums = {}
    const ageCounts = {}

    users.forEach(user => {
        user.purchases.forEach(p => {
            ageSums[p.name] = (ageSums[p.name] || 0) + user.age
            ageCounts[p.name] = (ageCounts[p.name] || 0) + 1
        })
    })

    const productAvgAgeNorm = Object.fromEntries(
        products.map(product => {
            const avg = ageCounts[product.name] ?
                ageSums[product.name] / ageCounts[product.name] :
                midAge

            return [product.name, normalize(avg, minAge, maxAge)]
        })
    )

    return {
        products,
        users,
        colorsIndex,
        categoriesIndex,
        productAvgAgeNorm,
        minAge,
        maxAge,
        minPrice,
        maxPrice,
        numCategories: categories.length,
        numColors: colors.length,
        // price + age + colors + categories
        dimentions: 2 + categories.length + colors.length
    }
}

function oneHotWeighted(index, length, weight) {
    return tf.oneHot(index, length).cast('float32').mul(weight);
}

function encodeProduct(product, context) {
    const { colorsIndex, categoriesIndex, minPrice, maxPrice, productAvgAgeNorm } = context;

    const price = tf.tensor1d([
        normalize(product.price, minPrice, maxPrice) * WEIGHTS.price
    ]);

    const age = tf.tensor1d([
        (productAvgAgeNorm[product.name] ?? 0.5) * WEIGHTS.age
    ]);
    const color = oneHotWeighted(colorsIndex[product.color], context.numColors, WEIGHTS.color)
    const category = oneHotWeighted(categoriesIndex[product.category], context.numCategories, WEIGHTS.category)

    return tf.concat([price, age, color, category]);
}

function encodeUser(user, context) {
    if (user.purchases.length) {
        return tf.stack(user.purchases.map(product => encodeProduct(product, context)))
            .mean(0)
            .reshape([1, context.dimentions]);
    }

    return tf.concat1d([
        tf.zeros([1]), // prices ignored for users with no purchases
        tf.tensor1d([normalize(user.age, context.minAge, context.maxAge) * WEIGHTS.age]), // age 
        tf.zeros([context.numCategories]).mul(WEIGHTS.category), // categories ignored for users with no purchases
        tf.zeros([context.numColors]), // colors ignored for users with no purchases
    ]).reshape([1, context.dimentions]);
}

function createTrainingData(context) {
    const { users } = context;
    const inputs = [];
    const outputs = [];

    users
        .filter(user => user.purchases.length > 0)
        .forEach(user => {
            const userVector = encodeUser(user, context).dataSync();
            context.products.forEach(product => {
                const productVector = encodeProduct(product, context).dataSync();
                const label = user.purchases.some(p => p.name === product.name) ? 1 : 0;
                inputs.push([...userVector, ...productVector]);
                outputs.push(label);
            });
        });

    return {
        xs: tf.tensor2d(inputs),
        ys: tf.tensor2d(outputs, [outputs.length, 1]),
        inputDimensions: context.dimentions * 2 // userVector + productVector
    };
}

async function configureNeuralNetAndTrain({ xs, ys, inputDimensions }) {
    const model = tf.sequential();

    model.add(tf.layers.dense({ inputShape: [inputDimensions], units: 128, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));

    model.compile({ loss: 'binaryCrossentropy', optimizer: 'adam', metrics: ['accuracy'] })

    model.fit(xs, ys, {
        epochs: 100,
        batchSize: 32,
        validationSplit: 0.2,
        shuffle: true,
        callbacks: {
            onEpochEnd: (epoch, logs) => {
                postMessage({
                    type: workerEvents.trainingLog,
                    epoch: epoch + 1,
                    loss: logs.loss.toFixed(4),
                    accuracy: logs.acc.toFixed(4)
                });
                console.log(`Epoch ${epoch + 1}: loss = ${logs.loss.toFixed(4)}, accuracy = ${logs.acc.toFixed(4)}`);
            },
        },
    });

    return model;
}

async function trainModel({ users }) {
    console.log('Training model with users:', users);
    postMessage({ type: workerEvents.progressUpdate, progress: { progress: 1 } });
    const products = await (await fetch('/data/products.json')).json()

    const context = makeContext(products, users)

    _globalCtx = context; // Store the context globally for later use in recommendations

    context.productVectors = products.map(product => {
        return {
            name: product.name,
            meta: { ...product },
            vector: encodeProduct(product, context).dataSync()
        }
    });

    const traindata = createTrainingData(context);
    _model = await configureNeuralNetAndTrain(traindata);

    postMessage({ type: workerEvents.progressUpdate, progress: { progress: 100 } });
    postMessage({ type: workerEvents.trainingComplete });
}
function recommend({ user }) {
    const context = _globalCtx;
    const model = _model;

    const userVector = encodeUser(user, _globalCtx).dataSync();

    const inputs = context.productVectors.map(({ vector }) => [...userVector, ...vector]);
    const inputsTensor = tf.tensor2d(inputs);

    const predictions = model.predict(inputsTensor);
    const scores = predictions.dataSync();

    const recommendations = context.productVectors.map((product, index) => ({
        ...product.meta,
        score: scores[index]
    }))
        .sort((a, b) => b.score - a.score);

    postMessage({
        type: workerEvents.recommend,
        user,
        recommendations
    });
}
const handlers = {
    [workerEvents.trainModel]: trainModel,
    [workerEvents.recommend]: recommend,
};

self.onmessage = e => {
    const { action, ...data } = e.data;
    if (handlers[action]) handlers[action](data);
};
