"""
Complete RAG Pipeline for Indian Legal AI Chatbot
Reads final_train.jsonl, cleans Q&A pairs, creates smart chunks, and uses GROQ API
"""

import json
import os
import re
from pathlib import Path
from typing import List, Dict, Tuple, Optional
import numpy as np
from sentence_transformers import SentenceTransformer
import faiss
from groq import Groq
from pypdf import PdfReader

from dotenv import load_dotenv
load_dotenv()

# ==================== CONFIGURATION ====================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
DATA_FILE = os.path.join(BASE_DIR, "final_train.jsonl")
INDEX_FOLDER = os.path.join(BASE_DIR, "legal_index")
EMBEDDING_MODEL = "all-MiniLM-L6-v2"
GROQ_MODEL = "llama-3.1-8b-instant"
CHUNK_SIZE = 3  # Q&A pairs per chunk
MIN_RELEVANCE_SCORE = 0.1
TOP_K = 5

# ==================== DATA CLEANING ====================

def clean_text(text: str) -> str:
    """Remove all training tags from text"""
    if not text:
        return ""
    
    # Remove all special tags
    tags_to_remove = [
        r'\[INST\]',
        r'\[/INST\]',
        r'<<SYS>>',
        r'<</SYS>>',
        r'<s>',
        r'</s>',
        r'\[SYS\]',
        r'\[/SYS\]'
    ]
    
    cleaned = text
    for tag_pattern in tags_to_remove:
        cleaned = re.sub(tag_pattern, '', cleaned)
    
    # Clean up extra spaces but preserve newlines
    cleaned = re.sub(r'[ \t]+', ' ', cleaned).strip()
    return cleaned


def extract_qa_pairs(file_path: str) -> List[Dict[str, str]]:
    """
    Read final_train.jsonl and extract clean Q&A pairs
    Returns list of dicts with 'question' and 'answer' keys
    """
    qa_pairs = []
    seen_questions = set()
    
    print(f"Reading {file_path}...")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            for line_num, line in enumerate(f, 1):
                try:
                    record = json.loads(line.strip())
                    
                    # Get text content
                    text = record.get('text', '')
                    
                    if not text:
                        continue
                    
                    # Extract question (between <</SYS>> and [/INST])
                    question_match = re.search(r'<</SYS>>(.*?)\[/INST\]', text, re.DOTALL)
                    if not question_match:
                        continue
                    
                    question = clean_text(question_match.group(1))
                    
                    # Extract answer (after [/INST])
                    answer_parts = text.split('[/INST]')
                    if len(answer_parts) < 2:
                        continue
                    
                    answer = clean_text(answer_parts[1])
                    
                    # Validate length
                    if len(question) < 10 or len(answer) < 15:
                        continue
                    
                    # Ensure uniqueness
                    q_lower = question.lower()
                    if q_lower in seen_questions:
                        continue
                    seen_questions.add(q_lower)
                    
                    qa_pairs.append({
                        'question': question,
                        'answer': answer
                    })
                    
                except json.JSONDecodeError:
                    print(f"Warning: Invalid JSON on line {line_num}")
                    continue
                except Exception as e:
                    print(f"Warning: Error processing line {line_num}: {e}")
                    continue
        
        print(f"[OK] Extracted {len(qa_pairs)} valid Q&A pairs")
        return qa_pairs
        
    except FileNotFoundError:
        raise Exception(f"Data file not found: {file_path}")


# ==================== SMART CHUNKING ====================

def categorize_record(qa_pair: Dict[str, str]) -> str:
    """Categorize Q&A pair by legal topic"""
    text = f"{qa_pair['question']} {qa_pair['answer']}".lower()
    
    # IPC category
    if any(keyword in text for keyword in ['ipc', 'indian penal', 'murder', 'theft', 'rape', 'assault', 'cheating', 'section']):
        return 'IPC'
    
    # CrPC category
    if any(keyword in text for keyword in ['crpc', 'criminal procedure', 'fir', 'arrest', 'bail', 'magistrate', 'warrant', 'summons']):
        return 'CRPC'
    
    # Constitution category
    if any(keyword in text for keyword in ['article', 'constitution', 'fundamental right', 'parliament', 'supreme court', 'high court']):
        return 'CONSTITUTION'
    
    # Cases category
    if any(keyword in text for keyword in ['petitioner', 'respondent', 'judgment', 'appeal', 'plaintiff', 'defendant']):
        return 'CASES'
    
    # General category
    return 'GENERAL'


def create_smart_chunks(qa_pairs: List[Dict[str, str]], chunk_size: int = 3) -> List[str]:
    """
    Group Q&A pairs into chunks by category
    Each chunk contains chunk_size Q&A pairs from the same category
    """
    print("Creating smart chunks by category...")
    
    # Categorize all pairs
    categories = {
        'IPC': [],
        'CRPC': [],
        'CONSTITUTION': [],
        'CASES': [],
        'GENERAL': []
    }
    
    for qa in qa_pairs:
        category = categorize_record(qa)
        categories[category].append(qa)
    
    # Log category distribution
    for cat, items in categories.items():
        print(f"  {cat}: {len(items)} pairs")
    
    # Create chunks within each category
    chunks = []
    separator = "\n\n---\n\n"
    
    for category, pairs in categories.items():
        for i in range(0, len(pairs), chunk_size):
            chunk_pairs = pairs[i:i + chunk_size]
            
            # Format chunk content
            chunk_content = f"[{category} LEGAL CONTEXT]\n"
            for j, qa in enumerate(chunk_pairs, 1):
                chunk_content += f"\nQ{j}: {qa['question']}\nA{j}: {qa['answer']}"
            
            chunks.append(chunk_content)
    
    print(f"[OK] Created {len(chunks)} smart chunks")
    return chunks


# ==================== VECTOR STORE ====================

class VectorStore:
    def __init__(self, model_name: str = EMBEDDING_MODEL):
        self.model = SentenceTransformer(model_name, device='cpu')
        self.index = None
        self.chunks = []
        self.is_loaded = False
    
    def build_index(self, chunks: List[str], save_path: str = INDEX_FOLDER):
        """Build FAISS index from chunks"""
        print("Building FAISS index...")
        
        self.chunks = chunks
        
        # Generate embeddings
        print(f"Generating embeddings for {len(chunks)} chunks...")
        embeddings = self.model.encode(chunks, convert_to_numpy=True, show_progress_bar=True)
        
        # Normalize embeddings for cosine similarity
        norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
        embeddings = embeddings / norms
        
        # Create FAISS index
        dimension = embeddings.shape[1]
        self.index = faiss.IndexFlatIP(dimension)
        self.index.add(embeddings.astype('float32'))
        
        # Save index
        os.makedirs(save_path, exist_ok=True)
        faiss.write_index(self.index, os.path.join(save_path, 'legal_index.faiss'))
        
        # Save chunks
        import pickle
        with open(os.path.join(save_path, 'chunks.pkl'), 'wb') as f:
            pickle.dump(chunks, f)
        
        print(f"[OK] Index saved to {save_path}")
        self.is_loaded = True
    
    def load_index(self, load_path: str = INDEX_FOLDER) -> bool:
        """Load existing index from disk"""
        try:
            index_file = os.path.join(load_path, 'legal_index.faiss')
            chunks_file = os.path.join(load_path, 'chunks.pkl')
            
            if not os.path.exists(index_file) or not os.path.exists(chunks_file):
                return False
            
            print(f"Loading index from {load_path}...")
            
            self.index = faiss.read_index(index_file)
            
            import pickle
            with open(chunks_file, 'rb') as f:
                self.chunks = pickle.load(f)
            
            self.is_loaded = True
            print(f"[OK] Loaded {len(self.chunks)} chunks from index")
            return True
            
        except Exception as e:
            print(f"Error loading index: {e}")
            return False
    
    def search(self, query: str, top_k: int = TOP_K, min_score: float = MIN_RELEVANCE_SCORE) -> List[Tuple[str, float]]:
        """Search for relevant chunks"""
        if not self.is_loaded:
            raise Exception("Index not loaded")
        
        # Generate query embedding
        query_embedding = self.model.encode([query], convert_to_numpy=True)
        
        # Normalize
        query_embedding = query_embedding / np.linalg.norm(query_embedding)
        
        # Search
        scores, indices = self.index.search(query_embedding.astype('float32'), top_k)
        
        # Filter by minimum score and return results
        results = []
        for score, idx in zip(scores[0], indices[0]):
            if score >= min_score:
                results.append((self.chunks[idx], float(score)))
        
        return results


# ==================== GROQ INTEGRATION ====================

SYSTEM_PROMPT = """You are an expert Indian legal assistant. Answer using EXACTLY this format:

📌 Applicable Section: [section number and law name]

📖 Brief Explanation:
[2-3 sentences explaining the provision in simple language]

⚖️ Reference Case:
[Case name and citation, or "No specific case mentioned in context"]

Always put a blank line between each section. Never merge sections into one line."""


def generate_answer_groq(question: str, context: str, api_key: str = GROQ_API_KEY) -> str:
    """Generate answer using GROQ API"""
    
    try:
        client = Groq(api_key=api_key)
        
        # Build prompt
        prompt = f"""Context from Indian Legal Documents:
{context}

Question: {question}

Please provide a comprehensive answer using the exact format specified."""
        
        # Call GROQ API
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=600
        )
        
        answer = response.choices[0].message.content
        
        # Handle None or empty response
        if not answer or answer.strip() == '':
            # Fallback: Generate a basic response
            answer = f"Based on Indian legal knowledge, your question about '{question}' requires specific legal research. Please consult relevant legal texts or case law for detailed information."
        
        # Clean any remaining tags
        answer = clean_text(answer)
        
        return answer
        
    except Exception as e:
        error_msg = str(e)
        
        if "invalid_api_key" in error_msg.lower():
            raise Exception("Invalid GROQ API key")
        elif "rate_limit" in error_msg.lower():
            raise Exception("GROQ rate limit exceeded. Please try again.")
        elif "connection" in error_msg.lower():
            raise Exception("Connection error. Please check your internet.")
        else:
            raise Exception(f"GROQ API error: {error_msg}")


# ==================== MAIN RAG PIPELINE ====================

class RAGPipeline:
    def __init__(self):
        self.vector_store = VectorStore()
        self.is_initialized = False
    
    def initialize(self, data_file: str = DATA_FILE, rebuild: bool = False):
        """Initialize the RAG pipeline"""
        print("\n" + "="*60)
        print("INITIALIZING RAG PIPELINE")
        print("="*60)
        
        # Try to load existing index
        if not rebuild and self.vector_store.load_index():
            print("[OK] Using existing index")
        else:
            # Build new index
            qa_pairs = extract_qa_pairs(data_file)
            chunks = create_smart_chunks(qa_pairs, CHUNK_SIZE)
            self.vector_store.build_index(chunks)
        
        self.is_initialized = True
        print("[OK] RAG Pipeline initialized successfully!\n")
    
    def answer_question(self, question: str) -> Dict:
        """Answer a legal question using RAG"""
        
        if not self.is_initialized:
            return {
                'success': False,
                'answer': 'RAG pipeline not initialized. Please restart the server.',
                'question': question,
                'chunks_used': 0,
                'error': 'RAG pipeline not initialized'
            }
        
        try:
            # Search for relevant chunks
            results = self.vector_store.search(question)
            
            if not results:
                # Try with lower threshold
                results = self.vector_store.search(question, min_score=0.1)
            
            if not results:
                return {
                    'success': True,
                    'answer': f"I don't have specific information about '{question}' in my current knowledge base. However, I can tell you that this is an important legal topic. Please consult primary legal sources or a qualified legal professional for accurate information.",
                    'question': question,
                    'chunks_used': 0,
                    'error': None
                }
            
            # Combine context
            context = "\n\n".join([chunk for chunk, score in results])
            
            # Generate answer
            answer = generate_answer_groq(question, context)
            
            return {
                'success': True,
                'answer': answer,
                'question': question,
                'chunks_used': len(results),
                'error': None
            }
            
        except Exception as e:
            return {
                'success': False,
                'answer': '',
                'question': question,
                'chunks_used': 0,
                'error': str(e)
            }


# ==================== GLOBAL INSTANCE ====================

_rag_instance: Optional[RAGPipeline] = None


def get_rag_pipeline() -> RAGPipeline:
    """Get or create RAG pipeline instance"""
    global _rag_instance
    if _rag_instance is None:
        _rag_instance = RAGPipeline()
        _rag_instance.initialize()
    return _rag_instance


def answer_legal_question(question: str) -> Dict:
    """
    Main function to answer legal questions
    Returns dict with: success, answer, question, chunks_used, error
    """
    pipeline = get_rag_pipeline()
    return pipeline.answer_question(question)


def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract text from a PDF file"""
    try:
        reader = PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        print(f"Error extracting PDF: {e}")
        return ""


def explain_document(file_path: str) -> str:
    """Generate a summary and legal explanation of a document"""
    # Extract text
    if file_path.lower().endswith('.pdf'):
        content = extract_text_from_pdf(file_path)
    else:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
    
    if not content or len(content.strip()) < 50:
        return "The document appears to be empty or could not be read properly."
    
    # Limit content length for the model
    truncated_content = content[:4000]
    
    try:
        client = Groq(api_key=GROQ_API_KEY)
        
        system_prompt = """You are an expert Indian legal advisor. 
Analyze the provided document and provide:
1. A clear summary of the document's purpose.
2. Key legal points or obligations mentioned.
3. Any potential risks or important deadlines.
Use markdown formatting with headers."""

        prompt = f"""Document Content (First 4000 characters):
{truncated_content}

Please explain this document in simple legal terms."""

        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=1000
        )
        
        return response.choices[0].message.content
    except Exception as e:
        return f"Error analyzing document: {str(e)}"


# ==================== INITIALIZATION ON IMPORT ====================

if __name__ == "__main__":
    # Test the pipeline
    print("\nTesting RAG Pipeline...")
    test_question = "What is IPC 302?"
    result = answer_legal_question(test_question)
    
    if result['success']:
        print(f"\nQuestion: {result['question']}")
        print(f"Answer: {result['answer']}")
        print(f"Chunks used: {result['chunks_used']}")
    else:
        print(f"Error: {result['error']}")
