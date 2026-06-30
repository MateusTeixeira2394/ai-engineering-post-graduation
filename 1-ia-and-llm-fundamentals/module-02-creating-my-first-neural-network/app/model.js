import tf from "@tensorflow/tfjs-node";

export async function train(inputXs, outputYs) {
    // model.fit expects tf.Tensors, not raw JS arrays.
    // inputXs: number[][] -> [rows, 14] ; outputYs: number[][] -> [rows, 2] (one-hot)
    const xs = tf.tensor2d(inputXs);
    const ys = tf.tensor2d(outputYs);

    const model = tf.sequential();

    // Add a hidden layer with 112 neurons and ReLU activation
    model.add(tf.layers.dense(
        {
            inputShape: [14],
            units: 112,
            activation: 'relu',
        }));


    // Add a hidden layer with 56 neurons and ReLU activation   
    model.add(tf.layers.dense(
        {
            inputShape: [14],
            units: 56,
            activation: 'relu',
        }));

    // Add a hidden layer with 28 neurons and ReLU activation
    model.add(tf.layers.dense(
        {
            inputShape: [14],
            units: 28,
            activation: 'relu',
        }));

    // Add an output layer with 2 neurons (one per class) and softmax activation,
    // so the outputs form a probability distribution over [stays, leaves].
    model.add(tf.layers.dense(
        {
            units: 2,
            activation: 'softmax',
        }));

    // Compile the model with categorical crossentropy loss and Adam optimizer.
    // categoricalCrossentropy pairs with softmax + one-hot targets.
    model.compile({
        loss: 'categoricalCrossentropy',
        optimizer: 'adam',
        metrics: ['accuracy'],
    });

    // Train the model with the input and output data
    await model.fit(xs, ys, {
        verbose: 0,
        epochs: 50,
        batchSize: 32,
        validationSplit: 0.2,
        shuffle: true,
        callbacks: {
            onEpochEnd: (epoch, logs) => {
                console.log(`Epoch ${epoch + 1}: loss = ${logs.loss.toFixed(4)}, accuracy = ${logs.acc.toFixed(4)}`);
            },
        },
    });

    return model;
}

export async function saveModel(model, dirPath) {
    // tfjs-node requires the file:// scheme. Creates <dirPath>/model.json + weights.bin
    await model.save(`file://${dirPath}`);
    console.log(`Model saved to ${dirPath}`);
}

export async function loadModel(dirPath) {
    const model = await tf.loadLayersModel(`file://${dirPath}/model.json`);

    // Loaded models come back uncompiled. Re-compile with the same settings as
    // train() so the model can be used (and re-trained) consistently.
    model.compile({
        loss: 'categoricalCrossentropy',
        optimizer: 'adam',
        metrics: ['accuracy'],
    });

    console.log(`Model loaded from ${dirPath}`);
    return model;
}

export function predict(model, input) {
    // Convert the input to a tensor
    const inputTensor = tf.tensor2d([input]);

    // Make a prediction
    const outputTensor = model.predict(inputTensor);

    // Convert the output tensor to a JavaScript array.
    // Two softmax outputs: [P(stays), P(leaves)].
    const outputArray = outputTensor.dataSync();

    // Return both class probabilities.
    return [outputArray[0], outputArray[1]];
}