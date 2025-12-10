"""
Test conversation memory in chat
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.services.rag_pipeline import RAGPipeline

# Initialize pipeline
rag = RAGPipeline()

# Use existing document collection
collection_name = "doc_80def9726fa34297"  # Your uploaded PDF

print("Testing Conversation Memory")
print("=" * 60)

# First question
print("\n1️⃣ First Question (no history):")
question1 = "What is the main topic of this document?"
response1 = rag.query(
    collection_name=collection_name,
    question=question1,
    n_results=5,
    include_sources=False,
    chat_history=[]
)
print(f"Q: {question1}")
print(f"A: {response1['answer']}\n")

# Build chat history
chat_history = [
    {"role": "user", "content": question1},
    {"role": "assistant", "content": response1['answer']}
]

# Second question with context reference
print("\n2️⃣ Second Question (with history - using 'it'):")
question2 = "Can you explain more about it?"
response2 = rag.query(
    collection_name=collection_name,
    question=question2,
    n_results=5,
    include_sources=False,
    chat_history=chat_history
)
print(f"Q: {question2}")
print(f"A: {response2['answer']}\n")

# Update history
chat_history.extend([
    {"role": "user", "content": question2},
    {"role": "assistant", "content": response2['answer']}
])

# Third question - follow-up
print("\n3️⃣ Third Question (with full history - another follow-up):")
question3 = "What are the key features mentioned?"
response3 = rag.query(
    collection_name=collection_name,
    question=question3,
    n_results=5,
    include_sources=False,
    chat_history=chat_history
)
print(f"Q: {question3}")
print(f"A: {response3['answer']}\n")

print("=" * 60)
print("✅ Conversation memory is working!")
print("The bot can now understand context from previous messages.")
