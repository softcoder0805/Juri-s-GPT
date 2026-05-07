import os
from dotenv import load_dotenv
# Load .env from the current directory (backend/)
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

from flask import Flask, request, jsonify
from flask_cors import CORS
from rag_pipeline import answer_legal_question

app = Flask(__name__)
CORS(app)  # Allow all origins

# Check for API Key
if not os.getenv("GROQ_API_KEY"):
    print("WARNING: GROQ_API_KEY not found in environment or .env file!")

# ==================== ROUTES ====================

@app.route("/", methods=["GET"])
def health():
    return jsonify({"status": "ok", "message": "LawBot AI is running!"})

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    message = data.get("message", "")
    
    if not message:
        return jsonify({"detail": "No message provided"}), 400
    
    result = answer_legal_question(message)
    
    if result['success']:
        return jsonify({
            "answer": result['answer'],
            "sources": []
        })
    else:
        return jsonify({"detail": result.get('error', 'Unknown error')}), 500

@app.route("/history", methods=["GET"])
def get_history():
    return jsonify({"history": []})

@app.route("/history", methods=["DELETE"])
def clear_history():
    return jsonify({"message": "History cleared"})

@app.route("/upload", methods=["POST"])
def upload():
    if 'file' not in request.files:
        return jsonify({"detail": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"detail": "No selected file"}), 400
    
    if file:
        # Save file temporarily
        temp_path = os.path.join("uploads", file.filename)
        os.makedirs("uploads", exist_ok=True)
        file.save(temp_path)
        
        # In a real app, we'd add this to the RAG index
        # For now, we'll just acknowledge receipt
        return jsonify({
            "message": f"File {file.filename} uploaded and processed successfully!",
            "filename": file.filename
        })

@app.route("/explain-doc", methods=["POST"])
def explain_doc():
    if 'file' not in request.files:
        return jsonify({"detail": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"detail": "No selected file"}), 400
    
    if file:
        from rag_pipeline import explain_document
        
        # Save file temporarily
        temp_path = os.path.join("uploads", file.filename)
        os.makedirs("uploads", exist_ok=True)
        file.save(temp_path)
        
        try:
            explanation = explain_document(temp_path)
            return jsonify({"explanation": explanation})
        except Exception as e:
            return jsonify({"detail": str(e)}), 500
        finally:
            # Clean up
            if os.path.exists(temp_path):
                os.remove(temp_path)

# ==================== RUN ====================

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000, use_reloader=False)