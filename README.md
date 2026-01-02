# WOFO ~ RAG-Based Enterprise Knowledge Offline Assistant 

<img width="1919" height="1079" alt="Screenshot 2025-12-30 214946" src="https://github.com/user-attachments/assets/2c529fc6-95a8-4ebc-996a-43e144438103" />
<img width="1919" height="1079" alt="Screenshot 2025-12-30 214939" src="https://github.com/user-attachments/assets/525673d8-52ef-4b92-a195-8ca7d6232253" />
<img width="1919" height="1079" alt="Screenshot 2025-12-30 215007" src="https://github.com/user-attachments/assets/149f3481-db26-4d9b-8acf-6ae97133f91a" />
<img width="1919" height="1079" alt="Screenshot 2025-12-30 215032" src="https://github.com/user-attachments/assets/6b9c9b9b-2738-4c53-b4ed-2c788765c584" />
<img width="1919" height="1079" alt="Screenshot 2025-12-30 215041" src="https://github.com/user-attachments/assets/f62ae156-751a-4046-b089-94ab46100809" />
<img width="1917" height="1079" alt="image" src="https://github.com/user-attachments/assets/db3e4f92-e543-4130-89de-11ee8d5c8011" />
<img width="1919" height="965" alt="image" src="https://github.com/user-attachments/assets/e88db51d-b427-4f06-bb46-d7b47e38bf49" />



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

## 3. File Management APIs

### 3.1 Get All Files

`GET /api/files`

Returns a list of all uploaded documents (Admin only).

### 3.2 Get File Details

`GET /api/files/:id`

Returns metadata of a specific file.

### 3.3 Delete File

`DELETE /api/files/:id`

Deletes a file and its associated data.

### 3.4 File Statistics

`GET /api/files/stats/overview`

Returns file-level statistics such as total files and processing status.

---

## 4. Search & Chat APIs

### 4.1 Conversational Query

`POST /api/chatbot/query`

Allows users to interact with the system using natural language.

### 4.2 Chatbot Health

`GET /api/chatbot/status`

Checks the availability and health of the chat service.

---

## 5. User Management APIs

### 5.1 Get All Users

`GET /api/users`

Returns all registered users (Admin only).

### 5.2 Test Endpoint

`GET /api/users/test`

Used for system testing and validation.

### 5.3 User Analytics

`GET /api/analytics/user/:id`

Returns usage analytics for a specific user.

---

## 6. Analytics APIs

### 6.1 System Analytics

`GET /api/analytics/system`

Provides system-level metrics and usage statistics.

### 6.2 Query Analytics

`GET /api/analytics/queries/recent`

Returns recent search and query activity.

---

## 7. Monitoring APIs

### 7.1 Trigger Manual Scan

`POST /api/monitor/scan`

Manually triggers background scanning or re-indexing.

### 7.2 Monitor Status

`GET /api/monitor/status`

Returns the health and status of background services.

---

## 8. Employee Registration

### 8.1 Employee Registration

`POST /api/auth/employee-register`

Registers a new employee account under the organization.

---

This structure keeps the API clean, modular, and easy to understand while clearly separating **core RAG functionality**, **authentication**, **analytics**, and **system management**.

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

## Team Members

| Name                  | Role                      |
| --------------------- | ------------------------- |
| **Varun Kushwaha**    | Backend Developer         |
| **Ahad Dangarwavala** | Backend Developer         |
| **Dhruv Gohel**       | Frontend Developer        |
| **Nikunj Makwana**    | Frontend Developer        |
| **Vishmayraj Zala**   | Authentication & Database |

---

## Future Enhancements

* Multi-company isolation
* Streaming responses
* Model switching (Gemini ↔ LLaMA)
* UI dashboard for admins

---

## Final Notes

This system is designed to be:

* Secure
*  Fast
*  Intelligent
*  Scalable

It enables organizations to **safely query their private data using AI** — without leaking information externally.

---
