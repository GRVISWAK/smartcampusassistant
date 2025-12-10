"""
Test study plan generation
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.llm_service import LLMService
import json

llm = LLMService()

print("Testing Study Plan Generation")
print("=" * 60)

# Test parameters
syllabus = """
Python Programming:
- Basic syntax and data types
- Functions and modules
- Object-oriented programming
- File handling
- Exception handling
- Libraries (NumPy, Pandas)
"""

result = llm.generate_study_plan(
    syllabus=syllabus,
    total_days=14,
    difficulty="medium",
    daily_hours=3
)

print("\n✓ Study Plan Generation Result:")
print(json.dumps(result, indent=2))

if "error" in result:
    print(f"\n⚠ ERROR: {result['error']}")
    if "raw_response" in result:
        print(f"\nRaw Response:\n{result['raw_response'][:500]}...")
else:
    print(f"\n✓ Overview: {result.get('overview', 'N/A')}")
    print(f"✓ Daily breakdown: {len(result.get('daily_breakdown', []))} days")
    print(f"✓ Weekly summary: {len(result.get('weekly_summary', []))} weeks")
    print(f"✓ Tips: {len(result.get('tips', []))} tips")
