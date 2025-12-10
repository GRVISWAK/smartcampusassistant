import sys
sys.path.insert(0, 'D:\\studypilot\\backend')

from app.services.rag_pipeline import RAGPipeline
from app.services.llm_service import LLMService

# Test LLM directly first
print("=== Testing LLM directly ===")
llm = LLMService()
try:
    answer = llm.generate("What is 2+2?", context="")
    print(f"Direct LLM response: {answer}")
except Exception as e:
    print(f"LLM Error: {e}")

print("\n=== Testing RAG Pipeline ===")
rag = RAGPipeline()

try:
    result = rag.query(
        collection_name="doc_80def9726fa34297",
        question="What is this document about?",
        n_results=3
    )
    print("RAG Result:", result)
except Exception as e:
    print("ERROR:", str(e))
    import traceback
    traceback.print_exc()
