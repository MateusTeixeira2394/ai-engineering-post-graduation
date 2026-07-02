# How Large Language Models (LLMs) Work

## High-Level Pipeline

```text
Raw Text
    ↓
Tokenization
    ↓
Token IDs
    ↓
Embeddings
    ↓
Positional Encoding
    ↓
Transformer Layers
    ├── Multi-Head Self-Attention
    ├── Feed-Forward Network
    ├── Residual Connections
    └── Layer Normalization
    ↓
Final Hidden Representation
    ↓
Linear Projection
    ↓
Logits
    ↓
Softmax
    ↓
Temperature (optional)
    ↓
Sampling Strategy
    ↓
Next Token
```

---

# 1. Raw Text

An LLM starts with plain text.

Example:

```text
I love transformers.
```

At this point, the model has no understanding of letters or words.

---

# 2. Tokenization

## What is a Token?

A token is the smallest unit processed by the model.

A token is **not necessarily a word**. It can be:

- A single character
- Part of a word
- A complete word
- Multiple words
- Punctuation
- An emoji

Examples:

```text
"computer"
→ ["computer"]

"unbelievable"
→ ["un", "believable"]

"New York"
→ ["New York"]

"😊"
→ ["😊"]
```

---

## Why Tokenize?

Neural networks cannot directly process text.

Instead of processing raw characters, the tokenizer converts text into meaningful pieces.

Benefits:

- Smaller vocabulary than storing every possible word.
- Better handling of rare or unseen words.
- Shorter sequences than character-level models.
- Better semantic representation.

---

## How Tokenizers Build Tokens

Modern tokenizers (BPE, WordPiece, SentencePiece) learn tokens from a massive text corpus.

Instead of using grammar rules, they learn statistically frequent character sequences.

Example:

Corpus:

```text
computer
computers
computing
compute
```

The tokenizer gradually merges frequent sequences:

```text
c + o
↓

co

↓

com

↓

comp

↓

comput

↓

computer
```

Very frequent words become single tokens.

Rare words remain split into smaller pieces.

---

## Token IDs

Each token has an integer ID.

Example:

| Token | ID |
|--------|---:|
| I | 15 |
| love | 382 |
| transformers | 18932 |
| . | 9 |

The sentence becomes:

```text
[15, 382, 18932, 9]
```

---

# 3. Embeddings

Neural networks cannot work with token IDs directly.

Each token ID indexes an **embedding matrix**.

Example:

```text
Token ID

382

↓

Embedding Matrix

↓

[-0.32, 0.84, ..., 1.21]
```

An embedding is simply a dense vector.

Typical embedding dimensions:

- 768
- 1024
- 1536
- 4096
- etc.

The embedding vectors are learned during training.

Words used in similar contexts tend to have similar embeddings.

Example:

```text
dog  → close to cat

Paris → close to London

apple (fruit) → close to orange
```

---

# 4. Positional Encoding

Self-attention alone has no notion of order.

Without positional information:

```text
Dog bites man

Man bites dog
```

would look identical.

Positional encoding injects the position of every token.

Example:

```text
Token      Position

I             0
love          1
transformers  2
.             3
```

This allows the Transformer to understand sequence order.

---

# 5. Transformer

A Transformer is the neural network architecture introduced in the paper:

> **Attention Is All You Need (2017)**

Instead of reading tokens sequentially like RNNs/LSTMs, every token can interact with every other token simultaneously.

Each Transformer layer contains:

```
Input
 ↓
Multi-Head Self-Attention
 ↓
Residual Connection
 ↓
LayerNorm
 ↓
Feed-Forward Network
 ↓
Residual Connection
 ↓
LayerNorm
```

Modern LLMs stack dozens or even hundreds of Transformer layers.

---

# 6. Self-Attention

Self-attention determines which tokens are important for understanding another token.

Example:

```text
The dog chased the cat because it was scared.
```

For the token:

```text
it
```

the model looks at every previous token:

```
The      2%
dog     35%
chased   8%
the      1%
cat     44%
because  5%
was      5%
```

These attention weights are computed dynamically for every token.

---

## Query, Key and Value

Each embedding is projected into three vectors:

- Query (Q)
- Key (K)
- Value (V)

Conceptually:

- Query → What information am I looking for?
- Key → What information do I provide?
- Value → What information should be passed forward?

Attention score:

```text
Attention(Q,K)
    ↓
Softmax
    ↓
Weights
    ↓
Weighted Sum of Values
```

The mathematical formula is:

```
Attention(Q,K,V) = softmax(QKᵀ / √d)V
```

---

# 7. Multi-Head Attention

Instead of computing one attention matrix, Transformers compute multiple attention heads simultaneously.

Each head may learn different relationships.

For example:

Head 1:

- Subject ↔ Verb

Head 2:

- Pronoun resolution

Head 3:

- Long-distance dependencies

Head 4:

- Semantic similarity

Outputs from all heads are concatenated and projected into a single representation.

This enables the model to learn many different linguistic patterns simultaneously.

---

# 8. Feed-Forward Network (FFN)

After attention, each token independently passes through a small neural network.

Purpose:

- Increase model capacity.
- Learn more complex representations.
- Transform attended information into richer features.

The FFN is applied independently to every token.

---

# 9. Residual Connections

Each major block adds its input back to its output.

```
Output = Layer(Input) + Input
```

Benefits:

- Easier optimization.
- Better gradient flow.
- Allows extremely deep networks.

---

# 10. Layer Normalization

LayerNorm stabilizes activations during training.

Benefits:

- Faster convergence.
- More stable gradients.
- Improved training of deep Transformers.

---

# 11. Final Hidden Representation

After passing through all Transformer layers, every token has a contextual representation.

Example:

```
Token

cat

↓

Final Hidden Vector

[0.42, -0.81, ..., 0.77]
```

Unlike the original embedding, this vector now contains contextual information from the entire sentence.

---

# 12. Linear Projection

The final hidden vector is projected into the vocabulary size.

Example:

Vocabulary size:

```
100,000 tokens
```

Output:

```
100,000 logits
```

Each logit represents how likely each token is to be the next token.

---

# 13. Softmax

Softmax converts logits into probabilities.

Example:

| Token | Probability |
|--------|------------:|
| is | 0.42 |
| was | 0.18 |
| will | 0.09 |
| has | 0.05 |

The probabilities always sum to 1.

---

# 14. Temperature

Temperature controls randomness during generation.

Formula:

```
Softmax(logits / temperature)
```

### Low Temperature (0.1–0.3)

- More deterministic
- More repetitive
- Less creative

Good for:

- Coding
- Math
- Documentation

---

### Medium Temperature (~0.7)

Balanced output.

Common default for chat models.

---

### High Temperature (1.2–2.0)

- More creative
- More diverse
- More surprising
- Higher chance of mistakes

Useful for:

- Brainstorming
- Story writing
- Creative tasks

---

# 15. Sampling

After probabilities are computed, the next token is selected.

Common strategies:

## Greedy Decoding

Always select the highest probability.

Pros:

- Deterministic

Cons:

- Can become repetitive.

---

## Top-k Sampling

Keep only the k most probable tokens.

Example:

```
Top 5 tokens only.
```

Randomly sample among them.

---

## Top-p (Nucleus Sampling)

Instead of fixing k, keep enough tokens until cumulative probability reaches p.

Example:

```
0.90 cumulative probability
```

The number of candidate tokens changes dynamically.

This is the most common sampling strategy in modern LLMs.

---

# 16. Autoregressive Generation

The model predicts one token at a time.

```
Input

↓

Predict Token 1

↓

Append Token 1

↓

Predict Token 2

↓

Append Token 2

↓

...
```

The generated token becomes part of the next input.

This repeats until:

- End-of-sequence token
- Maximum length reached
- User interruption

---

# Summary

```
Text
 ↓
Tokenization
 ↓
Token IDs
 ↓
Embeddings
 ↓
Positional Encoding
 ↓
Transformer Layers
    ├── Multi-Head Self-Attention
    ├── Feed-Forward Network
    ├── Residual Connections
    └── Layer Normalization
 ↓
Final Hidden Representation
 ↓
Linear Projection
 ↓
Logits
 ↓
Softmax
 ↓
Temperature
 ↓
Sampling
 ↓
Next Token
 ↓
Repeat
```

## Key Concepts

| Component | Purpose |
|----------|---------|
| Tokenization | Splits text into processable units (tokens). |
| Token IDs | Maps each token to an integer index in the vocabulary. |
| Embeddings | Converts token IDs into dense vector representations. |
| Positional Encoding | Encodes token order within the sequence. |
| Self-Attention | Determines how much each token should attend to every other token. |
| Multi-Head Attention | Learns multiple types of relationships in parallel. |
| Feed-Forward Network | Refines token representations after attention. |
| Residual Connections | Improve optimization and enable very deep networks. |
| Layer Normalization | Stabilizes activations during training. |
| Transformer | The architecture that combines all these components. |
| Linear Projection | Maps hidden vectors back to vocabulary logits. |
| Softmax | Converts logits into probabilities. |
| Temperature | Controls randomness during generation. |
| Sampling | Selects the next token based on probabilities. |
| Autoregressive Decoding | Generates text one token at a time. |