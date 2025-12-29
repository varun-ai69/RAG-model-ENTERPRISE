/**
 * Universal Chunk Generator
 * Works for ANY text 
 * Designed for RAG systems
 */

const MAX_CHUNK_SIZE = 1000;   // Ideal for embeddings
const MIN_CHUNK_SIZE = 200;
const OVERLAP_SIZE = 150;

function normalizeText(text) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .replace(/\s+/g, " ")
    .trim();
}

function splitIntoSentences(text) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean);
}

function chunkText(rawText, options = {}) {
  const documentId = options.documentId || `doc_${Date.now()}`;
  const cleaned = normalizeText(rawText);
  const sentences = splitIntoSentences(cleaned);
  const source = options.source || "unknown";


  let chunks = [];
  let buffer = "";
  let chunkIndex = 0;

  for (let sentence of sentences) {
    if ((buffer + " " + sentence).length <= MAX_CHUNK_SIZE) {
      buffer += " " + sentence;
    } else {
      if (buffer.length >= MIN_CHUNK_SIZE) {
        chunks.push(buildChunk(buffer, documentId, chunkIndex++, source));
      }
      buffer = sentence;
    }
  }

  if (buffer.length >= MIN_CHUNK_SIZE) {
    chunks.push(buildChunk(buffer, documentId, chunkIndex,source));
  }

  return chunks;
}

function buildChunk(text, documentId, index,source) {
  return {
    chunk_id: `${documentId}_chunk_${index}`,
    document_id: documentId,
    chunk_index: index,
    source: source,
    text: text.trim(),
    length: text.length,
    created_at: new Date().toISOString()
  };
}

module.exports = { chunkText };
