/**
 * Embedding Service
 * -----------------
 * Converts text chunks into numerical vectors using
 * a high-quality open-source embedding model.
 */

const { pipeline } = require("@xenova/transformers");

let embedder = null;

// Load model once (singleton)
async function loadModel() {
  if (!embedder) {
    embedder = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
  }
  return embedder;
}

/**
 * Generate embeddings for chunked text
 * @param {Array} chunks - array of chunk objects
 */
async function generateEmbeddings(chunks) {
  const model = await loadModel();
  const results = [];

  for (const chunk of chunks) {
    const embeddingTensor = await model(chunk.text, {
      pooling: "mean",
      normalize: true
    });

    results.push({
      ...chunk,
      embedding: Array.from(embeddingTensor.data)
    });
  }

  return results;
}

//for embedding query 
async function embedQuery(text) {
  const model = await loadModel();

  const embedding = await model(text, {
    pooling: "mean",
    normalize: true
  });

  return Array.from(embedding.data);
}



module.exports = { generateEmbeddings,embedQuery };
