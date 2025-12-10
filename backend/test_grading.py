"""
Test AI grading of short answers
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.llm_service import LLMService
import json

llm = LLMService()

# Test grading
question = "Describe the primary goal of the Web Scraping Data Collection module and name two specific frameworks it utilizes."
expected_answer = "The primary goal is to automatically gather competitor-related data from multiple online sources. It utilizes scraping frameworks such as BeautifulSoup and Scrapy."
key_points = [
    "Automatically gathers competitor-related data from online sources",
    "BeautifulSoup",
    "Scrapy"
]

test_answers = [
    "The module collects competitor data from the web using BeautifulSoup and Scrapy.",
    "It gathers data automatically. Uses BeautifulSoup and Scrapy frameworks.",
    "The goal is web scraping. It uses Python libraries.",
    "BeautifulSoup and Scrapy are used to collect competitor information from websites automatically."
]

print("Testing AI Grading of Short Answers")
print("=" * 60)
print(f"\nQuestion: {question}")
print(f"\nExpected Answer: {expected_answer}")
print(f"\nKey Points: {key_points}")
print("\n" + "=" * 60)

for i, user_answer in enumerate(test_answers, 1):
    print(f"\n\nTest Answer {i}: {user_answer}")
    print("-" * 60)
    
    prompt = f"""You are grading a short answer question. Evaluate the student's answer and provide a score.

Question: {question}

Expected Answer: {expected_answer}

Key Points to Cover:
{chr(10).join(f"- {point}" for point in key_points)}

Student's Answer: {user_answer}

Provide your evaluation in JSON format:
{{
    "score": <number from 0-100>,
    "feedback": "<brief feedback on the answer>",
    "points_covered": ["<key points that were covered>"],
    "points_missed": ["<key points that were missed>"]
}}

Be fair but strict. Award full points if all key concepts are covered even if wording differs."""

    try:
        response = llm.generate(prompt, max_tokens=500, temperature=0.3)
        
        # Parse JSON
        import re
        cleaned_response = response.strip()
        if cleaned_response.startswith('```'):
            match = re.search(r'```(?:json)?\s*\n?(.*?)\n?```', cleaned_response, re.DOTALL)
            if match:
                cleaned_response = match.group(1).strip()
        
        json_start = cleaned_response.find('{')
        json_end = cleaned_response.rfind('}') + 1
        if json_start != -1 and json_end > json_start:
            result = json.loads(cleaned_response[json_start:json_end])
            print(f"\n✓ Score: {result['score']}/100")
            print(f"Feedback: {result['feedback']}")
            print(f"Points Covered: {result.get('points_covered', [])}")
            print(f"Points Missed: {result.get('points_missed', [])}")
        else:
            print("\n✗ Failed to parse JSON response")
            print(f"Raw response: {response}")
            
    except Exception as e:
        print(f"\n✗ Error: {str(e)}")
