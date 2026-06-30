import fs from "fs";
import Papa from "papaparse";

// --- Encoding maps for the categorical columns ---
// One-hot for nominal features (no natural ordering)
const EDUCATION = { Bachelors: [1, 0, 0], Masters: [0, 1, 0], PHD: [0, 0, 1] };
const CITY = { Bangalore: [1, 0, 0], "New Delhi": [0, 1, 0], Pune: [0, 0, 1] };
// One-hot: 3 tiers whose ordering / spacing isn't a meaningful magnitude
const PAYMENT_TIER = { 1: [1, 0, 0], 2: [0, 1, 0], 3: [0, 0, 1] };
// Binary for two-value features
const GENDER = { Male: 0, Female: 1 };
const EVER_BENCHED = { No: 0, Yes: 1 };

// One-hot for the target so the model has one output neuron per class.
// Index 0 = stays, index 1 = leaves -> [1, 0] = stays, [0, 1] = leaves.
const LEAVE_OR_NOT = { 0: [1, 0], 1: [0, 1] };

// Continuous columns that must be min-max scaled to ~[0, 1] so they don't
// dominate the one-hot / binary features (which are already 0/1).
const CONTINUOUS_COLUMNS = ["JoiningYear", "Age", "ExperienceInCurrentDomain"];

/**
 * Computes per-column { min, max } for the given numeric columns.
 * @param {object[]} rows - parsed CSV rows
 * @param {string[]} columns - column names to summarize
 * @returns {Record<string, { min: number, max: number }>}
 */
function computeStats(rows, columns) {
    const stats = {};
    for (const col of columns) {
        let min = Infinity;
        let max = -Infinity;
        for (const row of rows) {
            const v = row[col];
            if (v < min) min = v;
            if (v > max) max = v;
        }
        stats[col] = { min, max };
    }
    return stats;
}

/**
 * Min-max scales a value into [0, 1] using precomputed bounds.
 * Returns 0 when the column is constant (max === min) to avoid div-by-zero.
 * @param {number} value
 * @param {{ min: number, max: number }} bounds
 * @returns {number}
 */
function normalize(value, { min, max }) {
    return max === min ? 0 : (value - min) / (max - min);
}

/**
 * Reads an employee CSV and returns numeric inputs and targets ready for a NN.
 * Continuous columns are min-max scaled to [0, 1]. The bounds used are returned
 * as `stats` so the exact same scaling can be reapplied at inference time.
 * @param {string} filePath - path to the CSV file
 * @param {Record<string, { min: number, max: number }>} [stats] - precomputed
 *   bounds (e.g. from the training set); when omitted they are derived from this file
 * @returns {{ inputs: number[][], targets: number[][], stats: Record<string, { min: number, max: number }> }}
 */
export function loadData(filePath, stats) {
    const file = fs.readFileSync(filePath, "utf8");

    const { data, errors } = Papa.parse(file, {
        header: true, // each row becomes an object keyed by the header names
        dynamicTyping: true, // numeric strings -> numbers
        skipEmptyLines: true,
    });

    if (errors.length > 0) {
        throw new Error(`CSV parse error in ${filePath}: ${errors[0].message}`);
    }

    // First pass: derive scaling bounds from this dataset unless caller supplied
    // them (use the training bounds when loading validation/test data).
    const bounds = stats ?? computeStats(data, CONTINUOUS_COLUMNS);

    const inputs = [];
    const targets = [];

    // Second pass: build the numeric feature vectors with scaling applied.
    for (const row of data) {
        inputs.push([
            ...EDUCATION[row.Education], // 3 values (one-hot)
            normalize(row.JoiningYear, bounds.JoiningYear),
            ...CITY[row.City], // 3 values (one-hot)
            ...PAYMENT_TIER[row.PaymentTier], // 3 values (one-hot)
            normalize(row.Age, bounds.Age),
            GENDER[row.Gender],
            EVER_BENCHED[row.EverBenched],
            normalize(row.ExperienceInCurrentDomain, bounds.ExperienceInCurrentDomain),
        ]);

        targets.push(LEAVE_OR_NOT[row.LeaveOrNot]); // [1, 0] = stays, [0, 1] = leaves
    }

    return { inputs, targets, stats: bounds };
}
