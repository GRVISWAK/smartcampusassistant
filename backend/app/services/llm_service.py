"""
LLM service for interacting with different AI models
"""
from typing import Optional, List, Dict
from ..core.config import settings
import google.generativeai as genai
from openai import OpenAI


class LLMService:
    """Service to interact with different LLM providers"""
    
    def __init__(self, provider: Optional[str] = None):
        """
        Initialize LLM service
        
        Args:
            provider: LLM provider (gemini, openai)
        """
        self.provider = provider or settings.DEFAULT_LLM
        
        # Initialize based on provider
        if self.provider == "gemini":
            genai.configure(api_key=settings.GOOGLE_API_KEY)
            self.model = genai.GenerativeModel('gemini-2.5-flash')
        elif self.provider == "openai":
            self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
            self.model_name = "gpt-3.5-turbo"
    
    def generate(
        self,
        prompt: str,
        context: Optional[str] = None,
        max_tokens: int = 1000,
        temperature: float = 0.7
    ) -> str:
        """
        Generate text using the configured LLM
        
        Args:
            prompt: User prompt/question
            context: Additional context for RAG
            max_tokens: Maximum tokens to generate
            temperature: Sampling temperature
            
        Returns:
            Generated text response
        """
        # Build full prompt with context
        full_prompt = prompt
        if context:
            full_prompt = f"Context:\n{context}\n\nQuestion: {prompt}\n\nAnswer:"
        
        try:
            if self.provider == "gemini":
                response = self.model.generate_content(
                    full_prompt,
                    generation_config=genai.types.GenerationConfig(
                        max_output_tokens=max_tokens,
                        temperature=temperature
                    )
                )
                # Handle response safely
                try:
                    return response.text
                except Exception as e:
                    # Fallback to parts if .text doesn't work
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.warning(f"Could not access response.text: {e}")
                    logger.warning(f"Response object: {response}")
                    logger.warning(f"Candidates: {response.candidates}")
                    if response.candidates and response.candidates[0].content.parts:
                        text = "".join([part.text for part in response.candidates[0].content.parts])
                        logger.info(f"Extracted text from parts: {len(text)} chars")
                        return text
                    logger.error("No valid response text found, returning empty string")
                    return ""
            
            elif self.provider == "openai":
                response = self.client.chat.completions.create(
                    model=self.model_name,
                    messages=[
                        {"role": "system", "content": "You are a helpful AI tutor assistant."},
                        {"role": "user", "content": full_prompt}
                    ],
                    max_tokens=max_tokens,
                    temperature=temperature
                )
                return response.choices[0].message.content
            
            else:
                return "Unsupported LLM provider"
                
        except Exception as e:
            raise Exception(f"LLM generation failed: {str(e)}")
    
    def generate_summary(
        self,
        text: str,
        summary_type: str = "concise"
    ) -> str:
        """
        Generate summary of text
        
        Args:
            text: Text to summarize
            summary_type: Type of summary (concise, detailed, bullet_points)
            
        Returns:
            Generated summary
        """
        prompts = {
            "concise": f"Provide a concise summary of the following text:\n\n{text}",
            "detailed": f"Provide a detailed summary covering all key points:\n\n{text}",
            "bullet_points": f"Summarize the following text in bullet points:\n\n{text}"
        }
        
        prompt = prompts.get(summary_type, prompts["concise"])
        return self.generate(prompt, max_tokens=2048)
    
    def generate_quiz(
        self,
        text: str,
        num_questions: int = 5,
        difficulty: str = "medium",
        question_types: Optional[List[str]] = None
    ) -> Dict:
        """
        Generate quiz questions from text
        
        Args:
            text: Source text for questions
            num_questions: Number of questions
            difficulty: Difficulty level (easy, medium, hard)
            question_types: Types of questions (mcq, fill_blank, short_answer, or mix for all)
            
        Returns:
            Dictionary with quiz questions
        """
        # Handle question type filtering
        if not question_types or "mix" in question_types:
            question_types = ["mcq", "fill_blank", "short_answer"]
        else:
            # Validate and use specified types
            valid_types = {"mcq", "fill_blank", "short_answer"}
            question_types = [qt for qt in question_types if qt in valid_types]
            if not question_types:
                question_types = ["mcq", "fill_blank", "short_answer"]
        
        types_str = ", ".join(question_types)
        
        prompt = f"""Generate {num_questions} quiz questions from the following text.
Difficulty level: {difficulty}
Question types to include: {types_str}

IMPORTANT: 
- Return ONLY valid JSON, nothing else
- Keep explanations concise (1-2 sentences max)
- For MCQ: options should be full sentences WITHOUT letter prefixes (A, B, C, D)
- For MCQ: correct_answer must be the EXACT FULL TEXT of the correct option, not just a letter

Format the response as JSON with this structure:
{{
    "questions": [
        {{
            "type": "mcq",
            "question": "Question text?",
            "options": ["First option text", "Second option text", "Third option text", "Fourth option text"],
            "correct_answer": "Second option text",
            "explanation": "Brief explanation"
        }},
        {{
            "type": "fill_blank",
            "question": "Question with ____ blank",
            "correct_answer": "answer",
            "explanation": "Brief explanation"
        }},
        {{
            "type": "short_answer",
            "question": "Question text?",
            "expected_answer": "Expected response",
            "key_points": ["point1", "point2"]
        }}
    ]
}}

Text:
{text}
"""
        
        response = self.generate(prompt, max_tokens=3000, temperature=0.8)
        
        # Parse JSON response
        try:
            import json
            import re
            
            # Remove markdown code blocks if present
            cleaned_response = response.strip()
            if cleaned_response.startswith('```'):
                # Extract content between ```json and ```
                match = re.search(r'```(?:json)?\s*\n?(.*?)\n?```', cleaned_response, re.DOTALL)
                if match:
                    cleaned_response = match.group(1).strip()
            
            # Extract JSON from response (might have additional text)
            json_start = cleaned_response.find('{')
            json_end = cleaned_response.rfind('}') + 1
            if json_start != -1 and json_end > json_start:
                quiz_data = json.loads(cleaned_response[json_start:json_end])
                return quiz_data
            else:
                return {"questions": [], "error": "Failed to parse quiz - no JSON found"}
        except Exception as e:
            return {"questions": [], "error": f"JSON parse error: {str(e)}", "raw_response": response}
    
    def generate_study_plan(
        self,
        syllabus: str,
        total_days: int,
        difficulty: str = "medium",
        daily_hours: int = 2
    ) -> Dict:
        """
        Generate personalized study plan
        
        Args:
            syllabus: Topics to cover
            total_days: Days until exam
            difficulty: Student's comfort level
            daily_hours: Hours available per day
            
        Returns:
            Structured study plan
        """
        # Calculate weeks
        weeks = max(1, (total_days + 6) // 7)  # Round up to nearest week
        
        prompt = f"""Create a concise study plan with the following details:

Syllabus/Topics: {syllabus}
Total days: {total_days} (approximately {weeks} weeks)
Difficulty: {difficulty}
Daily study hours: {daily_hours}

Create a structured weekly plan in JSON format. Be concise and focused.

{{
    "overview": "2-3 sentence overview",
    "weekly_breakdown": [
        {{
            "week": 1,
            "topics": ["Topic 1", "Topic 2"],
            "daily_focus": "Brief description of daily activities",
            "hours_per_day": {daily_hours},
            "milestones": "What to achieve this week"
        }}
    ],
    "key_dates": [
        {{
            "date": "Day X",
            "activity": "Important milestone or review"
        }}
    ],
    "tips": ["Tip 1", "Tip 2", "Tip 3"]
}}

Return ONLY the JSON. Create {weeks} weeks of content, distributing topics evenly.
"""
        
        response = self.generate(prompt, max_tokens=3000, temperature=0.7)
        
        # Parse JSON response
        try:
            import json
            import re
            
            # Remove markdown code blocks if present
            cleaned_response = response.strip()
            if cleaned_response.startswith('```'):
                match = re.search(r'```(?:json)?\s*\n?(.*?)\n?```', cleaned_response, re.DOTALL)
                if match:
                    cleaned_response = match.group(1).strip()
            
            # Extract JSON from response
            json_start = cleaned_response.find('{')
            json_end = cleaned_response.rfind('}') + 1
            if json_start != -1 and json_end > json_start:
                plan_data = json.loads(cleaned_response[json_start:json_end])
                return plan_data
            else:
                return {"error": "Failed to parse study plan - no JSON found", "raw_response": response}
        except Exception as e:
            return {"error": f"JSON parse error: {str(e)}", "raw_response": response}

