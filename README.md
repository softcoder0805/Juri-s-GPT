# Indian Legal AI Chatbot (LawBot AI)

A full-stack RAG (Retrieval-Augmented Generation) application designed to provide information on Indian Law.

## 🚀 Features
- **AI Chat**: Ask questions about Indian legal provisions (IPC, CrPC, Constitution).
- **Document Analysis**: Upload legal documents (PDF/Text) for AI-powered explanation and summarization.
- **RAG Pipeline**: Uses FAISS for efficient vector search and GROQ (Llama 3) for high-quality responses.
- **Modern UI**: Built with React, Tailwind CSS, and Framer Motion.

## 📁 Project Structure
- `backend/`: Flask server with RAG logic and FAISS index.
- `frontend/`: React application (Vite).
- `rag_pipeline.py`: Core RAG logic (duplicate in backend for reliability).

## 🛠️ Setup Instructions

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file from `.env.example` and add your `GROQ_API_KEY`.
5. Start the server:
   ```bash
   python app.py
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file from `.env.example` (optional, defaults to localhost:5000).
4. Start the development server:
   ```bash
   npm run dev
   ```

## 🚀 Quick Start (Windows)
Run the provided batch files in the root directory:
- `run_backend.bat`: Sets up and starts the backend.
- `run_frontend.bat`: Sets up and starts the frontend.

## 📄 License
MIT
