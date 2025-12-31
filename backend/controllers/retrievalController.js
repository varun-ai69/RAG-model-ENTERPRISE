/**
 * Retrieval & Generation Controller (RAG System – Query Pipeline)
 *
 * This controller represents the second stage of the RAG architecture.
 * It is responsible for handling user queries and generating intelligent,
 * context-aware responses using previously ingested knowledge.
 *
 * Core responsibilities:
 * - Accepts a user query (question or prompt)
 * - Converts the query into a vector embedding
 * - Performs similarity search on the vector database
 * - Retrieves the most relevant document chunks
 * - Constructs a contextual prompt using retrieved knowledge
 * - Sends the context + query to an LLM for answer generation
 * - Returns a final, grounded response to the user
 *
 * This module does NOT store or modify documents.
 * It strictly operates on already indexed vector data.
 *
 * In short:
 * Query → Embed → Retrieve → Generate → Respond
 */

const { embedQuery } = require("../services/embeddingService");
const { searchVectors } = require("../services/vectorDB")
const { askLLM } = require("../services/llmService")

exports.askQuestion = async (req, res) => {

    try {
        const { question } = req.body;
        if (!question) {
            return res.status(400).json({ error: "Question is required" });
        }
        // 1. Embed question - embeded the the question into embededQuery (numerical)
        const queryEmbedding = await embedQuery(question);

        // 2. Retrieve relevant chunks - search the embededQuery into vectorDB and return most relevant chunks
        const results = await searchVectors(queryEmbedding, 5);

        // 3. Build context - Building context that generated from searchingChunks
        const context = results.map(r => r.payload.text).join("\n");

        // 4. Ask LLM - final call to LLM model to answer the query given with the context we retrieve
        const answer = await askLLM(context, question);
         
        res.json({
            question,
            answer,
            sources: results.map(r => ({
                chunk_id: r.id,
                source: r.payload.source
            }))
        });
    } catch (err) {
        console.error("RAG ERROR:", err);
        res.status(500).json({ error: "Failed to generate answer" });
    }


};
