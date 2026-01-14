const { QdrantClient } = require("@qdrant/js-client-rest");
const { v4: uuidv4 } = require("uuid");
const client = new QdrantClient({
  url: "http://localhost:6333"
});

const COLLECTION_NAME = "documents";

// Create collection (run once)
async function initVectorDB() {
  const collections = await client.getCollections();

  const exists = collections.collections.find(
    (c) => c.name === COLLECTION_NAME
  );

  if (!exists) {
    await client.createCollection(COLLECTION_NAME, {
      vectors: {
        size: 384, // for all-MiniLM-L6-v2
        distance: "Cosine"
      }
    });

    console.log(" Vector collection created:", COLLECTION_NAME);
  } else {
    console.log(" Vector collection already exists");
  }
}

// Insert embeddings into vector DB
async function insertVectors(chunks,companyId) {
  const points = chunks.map((chunk) => ({
    id: uuidv4(),
    vector: chunk.embedding,
    payload: {
      companyId: companyId,
      document_id: chunk.document_id,
      source: chunk.source,
      chunk_index: chunk.chunk_index,
      text: chunk.text,
      created_at: chunk.created_at
    }
  }));

  await client.upsert(COLLECTION_NAME, {
    wait: true,
    points
  });

  console.log(`✅ Inserted ${points.length} vectors into Qdrant`);
}

async function searchVectors(queryEmbedding, companyId ,topK = 5) {
  const result = await client.search(COLLECTION_NAME, {
    vector: queryEmbedding,
    limit: topK,
    filter: {
      must: [
        {
          key: "companyId",
          match: { value: companyId }
        }
      ]
    },
    with_payload: true
  });

  return result;
}

async function deleteVectorsByDocument(documentId) {
  await client.delete(COLLECTION_NAME, {
    filter: {
      must: [
        {
          key: "document_id",
          match: { value: documentId }
        }
      ]
    }
  });
}

module.exports = {
  initVectorDB,
  insertVectors,
  searchVectors,
  deleteVectorsByDocument
};
