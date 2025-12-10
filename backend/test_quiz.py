"""
Test quiz generation to debug the 500 error
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.rag_pipeline import RAGPipeline
import json

# Initialize pipeline
rag = RAGPipeline()

# Test with document collection
collection_name = "doc_80def9726fa34297"

print(f"Testing quiz generation for collection: {collection_name}")
print("=" * 60)

try:
    result = rag.generate_quiz(
        collection_name=collection_name,
        num_questions=5,
        difficulty="medium",
        topic=None
    )
    
    print("\n✓ Quiz generation completed!")
    print(f"\nResult keys: {result.keys()}")
    print(f"\nFull result:")
    print(json.dumps(result, indent=2))
    
    if "error" in result:
        print(f"\n⚠ WARNING: Error in result: {result['error']}")
        
    if "questions" in result:
        print(f"\n✓ Generated {len(result['questions'])} questions")
        for i, q in enumerate(result['questions'], 1):
            print(f"\n  Question {i}:")
            print(f"    Type: {q.get('type', 'N/A')}")
            print(f"    Question: {q.get('question', 'N/A')[:80]}...")
    else:
        print("\n⚠ WARNING: No questions in result!")
        
except Exception as e:
    print(f"\n✗ Error: {str(e)}")
    import traceback
    traceback.print_exc()
