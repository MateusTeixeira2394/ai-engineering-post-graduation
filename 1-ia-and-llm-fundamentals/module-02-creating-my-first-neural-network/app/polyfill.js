// @tensorflow/tfjs-node 4.x still calls util.isNullOrUndefined / util.isArray,
// legacy helpers that were removed from Node's `util` module in Node 23+.
// Restore them before TensorFlow is imported so its kernels don't crash.
import util from "util";

if (typeof util.isNullOrUndefined !== "function") {
    util.isNullOrUndefined = (value) => value === null || value === undefined;
}

if (typeof util.isArray !== "function") {
    util.isArray = Array.isArray;
}
