import "./polyfill.js"; // must run before any module that imports @tensorflow/tfjs-node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadData } from "./data.js";
import { train, predict, saveModel, loadModel } from "./model.js";

// __dirname does not exist in ESM, so recreate it from import.meta.url
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Where the trained model is persisted between runs.
const MODEL_DIR = path.join(__dirname, "..", "saved-model");

// Quick demo when run directly: node index.js
if (import.meta.url === `file://${process.argv[1]}`) {
    const { inputs, targets, stats } = loadData(
        path.join(__dirname, "..", "datasets", "employee-training.csv")
    );

    console.log(`Loaded ${inputs.length} rows`);
    console.log(`Each input has ${inputs[0].length} features`);
    console.log("Scaling bounds:", stats);
    console.log("First input:", inputs[0]);
    console.log("First target:", targets[0]); // one-hot: [1,0]=stays, [0,1]=leaves

    // Load the saved model if one exists; otherwise train a fresh one and save it.
    let model;
    if (fs.existsSync(path.join(MODEL_DIR, "model.json"))) {
        model = await loadModel(MODEL_DIR);
    } else {
        console.log("No saved model found — training a new one.");
        model = await train(inputs, targets);
        await saveModel(model, MODEL_DIR);
        console.log("Training complete.");
    }

    // --- Test on the first SAMPLE_SIZE rows of the test set ---
    // Reuse the training `stats` so the test rows are scaled with the exact
    // same min/max bounds the model learned on.
    const { inputs: testInputs, targets: testTargets } = loadData(
        path.join(__dirname, "..", "datasets", "employee-test.csv"),
        stats
    );

    const SAMPLE_SIZE = 100;
    const sampleInputs = testInputs.slice(0, SAMPLE_SIZE);
    const sampleTargets = testTargets.slice(0, SAMPLE_SIZE);

    console.log(`\nPredictions for the first ${SAMPLE_SIZE} test rows:`);
    let correct = 0;
    sampleInputs.forEach((input, i) => {
        const probs = predict(model, input); // softmax: [P(stays), P(leaves)]
        // argmax over the two outputs -> 0 = stays, 1 = leaves
        const predicted = probs[1] >= probs[0] ? 1 : 0;
        // one-hot target back to a class index
        const actual = sampleTargets[i][1] === 1 ? 1 : 0;
        if (predicted === actual) correct++;
        console.log(
            `Row ${i + 1}: probs=[${probs[0].toFixed(4)}, ${probs[1].toFixed(4)}] -> predicted=${predicted}, actual=${actual} ${predicted === actual ? "✓" : "✗"}`
        );
    });

    console.log(`\nAccuracy on first ${SAMPLE_SIZE} test rows: ${correct}/${SAMPLE_SIZE} (${(correct * 100 / SAMPLE_SIZE).toFixed(2)}%)`);
}
