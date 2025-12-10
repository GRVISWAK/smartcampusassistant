import sys
sys.path.insert(0, 'D:\\studypilot\\backend')

from app.services.rag_pipeline import RAGPipeline

rag = RAGPipeline()

print("=== Testing Summary Generation ===")
try:
    result = rag.generate_summary(
        collection_name="doc_80def9726fa34297",
        summary_type="concise"
    )
    print("Summary Result:")
    print(result)
except Exception as e:
    print("ERROR:", str(e))
    import traceback
    traceback.print_exc()
