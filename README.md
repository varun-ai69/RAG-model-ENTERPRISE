# WOFO ~ RAG-Based Enterprise Knowledge Offline Assistant 





A **Retrieval-Augmented Generation (RAG)** system designed for organizations to securely upload internal documents (policies, manuals, legal docs, FAQs, etc.) and allow employees to query them using natural language.

This system converts private documents into searchable vector embeddings and uses a Large Language Model (LLM) to generate accurate, context-aware answers — **strictly based on company data**.

---

## Key Features

*  Upload PDFs, DOCX, TXT files
*  Automatic text extraction & chunking
*  Semantic search using vector embeddings
*  LLM-powered question answering
*  Company-wise isolated data access
*  Role-based access (Admin/Employee)
*  Chat and memory stores in database
*  Fast similarity search using Qdrant
*  Modular & scalable architecture

---

## System Architecture (High-Level)

```
                ┌────────────────────────┐
                │   Admin Uploads Docs   │
                └──────────┬─────────────┘
                           │
                  Text Extraction & Chunking
                           │
                  Embedding Generation (HF)
                           │
                ┌──────────▼───────────┐
                │   Vector Database     │  ← Qdrant
                └──────────┬───────────┘
                           │
       User Query → Embed → Similarity Search
                           │
                    Relevant Context
                           │
                   LLM (Gemini / LLaMA)
                           │
                     Final Answer
```

---

##  Tech Stack

### Backend

* **Node.js**
* **Express.js**

### Frontend

* **React**

### AI / ML

* **Embedding Model:** HuggingFace Sentence Transformer
* **LLM:** Gemini 3 Flash (can be replaced with LLaMA)
* **Vector DB:** Qdrant

### Database

* **MongoDB** – Users, Chats, Metadata

### Tools

* **Docker** – Running Qdrant
* **Postman** – API Testing

---

## 🔄 RAG FLOW EXPLAINED

### 1️⃣ Ingestion Pipeline

Used when **admin uploads documents**.

1. Extract text from PDF/DOCX 
2. Clean & normalize text 
3. Split into semantic chunks 
4. Convert chunks into embeddings for embedding we are using HuggingFace Sentence Transformer model 
5. Store embeddings in **Qdrant** (Qdrant is our VectorDB that stores the embededChunks and its metadata)

---

### 2️⃣ Query Pipeline (User Chat)

1. User enters a question
2. Question is converted to vector using same embedding model 
3. Vector similarity search in Qdrant
4. Top-N relevant chunks retrieved
5. It filter the chunks and create context for LLM 
6. Context + question passed to LLM ( currently we use gemini-3-flash-preview )
7. LLM generates accurate answer

---

## 🧠 Example Flow

```
User: "What is the company leave policy?"

→ Embed question 
→ Search vector DB
→ Retrieve related policy chunks
→ Send to LLM
→ Return summarized answer
```

---

## 🔧 Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone <repo-url>
cd project
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Setup Environment Variables

Create `.env` file:

```env
PORT=3000
MONGO_URI=your_mongodb_url
JWT_SECRET=your_secret
GEMINI_API_KEY=your_gemini_key
```

---

### 4️⃣ Run Vector Database (Qdrant)

```bash
docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant
```

---

### 5️⃣ Start Backend Server

```bash
node server.js
```

---

## 🧪 API Endpoints

## 1. Core RAG APIs (Primary APIs)

These are the **main APIs** responsible for document ingestion and intelligent querying.

### 1.1 Upload Document (Ingestion)

**Endpoint:**

`POST /api/upload/ingestion`

**Description:**

Uploads documents (PDF, DOCX, etc.) and processes them through the ingestion pipeline.

The system extracts text, creates embeddings, and stores them in the vector database.

---

### 1.2 Ask Question (Retrieval)

**Endpoint:**

`POST /api/search/retrieval`

**Request Body:**

```json
{
  "question": "What is the leave policy?"
}

```

**Description:**

Processes the user query by generating embeddings, retrieving relevant document chunks, and generating an answer using the LLM.

---

## 2. Authentication APIs

### 2.1 User Login

`POST /api/auth/login`

Authenticates a user and returns a JWT token.

---

### 2.2 User Registration

`POST /api/auth/register`

Registers a new user in the system.

---

## Technologies Used

| Component      | Technology       |
| -------------- | ---------------- |
| Backend        | Node.js, Express |
| Vector DB      | Qdrant           |
| Embeddings     | HuggingFace      |
| LLM            | Gemini 3 Flash   |
| Database       | MongoDB          |
| Authentication | JWT              |
| Deployment     | Docker           |

---


## Final Notes

This system is designed to be:

* Secure
*  Fast
*  Intelligent
*  Scalable

It enables organizations to **safely query their private data using AI** — without leaking information externally.

---
