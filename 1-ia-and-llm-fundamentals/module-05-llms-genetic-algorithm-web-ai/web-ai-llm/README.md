# Web AI — Question Answering in the Browser

A minimal demo of **Web AI**: running a machine-learning model **entirely inside
the browser**, with no backend server, no API keys, and no data ever leaving the
user's device.

The whole application lives in a single file — [index.html](index.html) — and
answers questions about a passage of text using a transformer model that is
downloaded once and then runs locally on the user's machine.

---

## What is "Web AI"?

Traditionally, when a web page needs AI, it sends the user's input to a remote
server (or a cloud API like OpenAI/Anthropic), the model runs *there*, and the
answer comes back over the network:

```
Browser  ──request──►  Server / Cloud API  ──►  Model runs here  ──response──►  Browser
```

**Web AI** flips this around. The model itself is shipped to the browser and
executed **client-side**, using the device's own CPU/GPU:

```
Browser  ──►  Download model once (cached)  ──►  Model runs INSIDE the browser
```

This is made possible by a few web technologies working together:

- **WebAssembly (WASM)** — runs the model's math at near-native speed.
- **WebGPU / WebGL** — optionally offloads computation to the GPU.
- **JavaScript ML runtimes** — libraries such as
  [Transformers.js](https://huggingface.co/docs/transformers.js),
  ONNX Runtime Web, and TensorFlow.js that load and execute models in JS.

### Why run models in the browser?

| Benefit | Why it matters |
| --- | --- |
| **Privacy** | Input never leaves the device — nothing is sent to a server. |
| **No server costs** | There is no backend to host, scale, or pay for inference. |
| **Offline capable** | Once the model is cached, it works without a network. |
| **Low latency** | No round trip to a data center for each request. |
| **Easy to deploy** | It's just static files — host it anywhere (even GitHub Pages). |

### Trade-offs

- Models must be **small enough** to download and fit in browser memory
  (this demo uses a ~65 MB model, quantized for the web).
- **First load is slower** because the model has to be downloaded once.
- Heavy models are still better served by a backend or cloud API.

---

## How `index.html` demonstrates this

This app performs **extractive question answering**: given a *context*
(a paragraph) and a *question*, the model finds the span of text in the context
that answers the question.

It uses `Xenova/distilbert-base-cased-distilled-squad`, a distilled BERT model
fine-tuned on the SQuAD dataset — small and fast enough to run in a browser.

### Walking through the code

**1. Import the runtime directly from a CDN** — no build step, no `npm install`:

```js
import { pipeline } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers';
```

**2. Load the model into a `pipeline` (this is the "download once" step).**
The `progress_callback` reports download progress so the UI can show it:

```js
const answerer = await pipeline(
  'question-answering',
  'Xenova/distilbert-base-cased-distilled-squad',
  {
    progress_callback: (p) => {
      if (p.status === 'progress') {
        setStatus(`Downloading ${p.file}: ${Math.round(p.progress)}%`);
      }
    },
  }
);
```

After this first download, the browser **caches** the model files, so
subsequent visits load instantly and work offline.

**3. Run inference locally** when the user clicks the button. The `answerer`
function does *all* the work on-device — there is no `fetch` to any AI server:

```js
const output = await answerer(question, context);
// output = { answer: "...", score: 0.98 }
```

**4. Show the result** — the extracted answer plus a confidence score:

```js
outputEl.textContent = `Answer: ${output.answer}\nScore:  ${output.score.toFixed(4)}`;
```

### The UI

- A **Context** textarea (pre-filled with the "Three Little Pigs" story).
- A **Question** input (pre-filled with *"What did the third pig build his
  house out of?"*).
- An **Answer** button, disabled until the model finishes loading.
- A **status line** showing download progress and inference state.
- An **output box** showing the answer and its confidence score.

Everything — the model download, the tokenization, and the inference — happens
in the browser tab.

---

## Running it

Because it uses ES modules and fetches the model over the network, open it
through a local web server (opening the file directly with `file://` may be
blocked by the browser):

```bash
# From this folder, using any static server, e.g.:
python3 -m http.server 8000
# then open http://localhost:8000 in your browser
```

Or serve it with any static host (Vite, `npx serve`, VS Code Live Server, GitHub
Pages, etc.).

The **first run** downloads the model (~65 MB) — watch the status line for
progress. After that, ask any question whose answer appears in the context and
you'll get an extracted span plus a confidence score, all computed locally.

---

## Try this

- Change the **question** to something else answerable from the story
  (e.g. *"Who came along one day?"*).
- Replace the **context** with your own paragraph and ask about it.
- Open the browser **DevTools → Network** tab and confirm that clicking
  **Answer** makes **no network request** — proof the model is running locally.
- Open **DevTools → Console** to see the full `output` object logged after each
  answer.

---

## Key takeaways

- **Web AI** means the model runs *in the browser*, not on a server.
- Libraries like **Transformers.js** make this possible with a few lines of JS.
- You get **privacy, offline support, and zero inference cost** in exchange for
  a **one-time model download** and a limit on model size.
- This entire capability fits in a **single static HTML file**.
