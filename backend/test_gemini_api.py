import google.generativeai as genai

# Configure with your API key
genai.configure(api_key='AIzaSyBiyk123iCN49zTzk5BvM33ns1dHQ4rqWE')

# Test with gemini-2.5-flash
model = genai.GenerativeModel('gemini-2.5-flash')

try:
    response = model.generate_content("What is 2+2? Answer in one sentence.")
    print("✓ API is working!")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"✗ API Error: {e}")
