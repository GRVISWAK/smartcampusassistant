"""
Direct test of summary generation to debug empty response issue
"""
import sys
import os

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.rag_pipeline import RAGPipeline

# Initialize pipeline
rag = RAGPipeline()

# Test with document collection
collection_name = "doc_80def9726fa34297"

print(f"Testing summary generation for collection: {collection_name}")
print("=" * 60)

try:
    result = rag.generate_summary(
        collection_name=collection_name,
        summary_type="concise",
        page_number=None
    )
    
    print("\n✓ Summary generation successful!")
    print(f"\nSummary Type: {result.get('summary_type', 'N/A')}")
    print(f"Chunks Used: {result.get('chunks_used', 'N/A')}")
    print(f"Page Number: {result.get('page_number', 'N/A')}")
    print(f"\nSummary Length: {len(result.get('summary', ''))} characters")
    print(f"\nSummary Content:\n{'-' * 60}")
    print(result.get('summary', '(empty)'))
    print("-" * 60)
    
    if not result.get('summary'):
        print("\n⚠ WARNING: Summary is empty!")
        print("This suggests an issue with the LLM service response handling")
        
except Exception as e:
    print(f"\n✗ Error: {str(e)}")
    import traceback
    traceback.print_exc()
