from openai import OpenAI
from typing import List, Dict, Any, Optional
import json
import time
from app.core.config import settings
from app.models.schemas import Question, QuestionType, QuestionDifficulty

class OpenAIService:
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL

    async def generate_questions(
        self,
        resume_text: Optional[str] = None,
        job_description: Optional[str] = None,
        question_count: int = 10,
        include_answers: bool = False
    ) -> List[Question]:
        """Generate interview questions based on resume and/or job description"""

        start_time = time.time()

        # Build context based on available inputs
        context_parts = []
        if resume_text:
            context_parts.append(f"Resume/CV:\n{resume_text}")
        if job_description:
            context_parts.append(f"Job Description:\n{job_description}")

        if not context_parts:
            raise ValueError("Either resume_text or job_description must be provided")

        context = "\n\n".join(context_parts)

        # Create the prompt
        if include_answers:
            system_prompt = f"""You are an expert interview coach. Generate {question_count} relevant interview questions based on the provided context.

Instructions:
- Generate a mix of technical, behavioral, and experience-based questions
- Assign appropriate difficulty levels (beginner, intermediate, advanced)
- Rate relevance from 0.0 to 1.0 based on how well the question matches the context
- Each question should be unique and valuable for interview preparation
- Include sample answers for each question

Return the response as a JSON array with this exact structure:
[
  {{
    "id": "unique_question_id",
    "question": "Question text here?",
    "type": "technical" | "behavioral" | "experience",
    "difficulty": "beginner" | "intermediate" | "advanced",
    "relevance_score": 0.85,
    "answer": "Sample answer here"
  }}
]

Context:
{context}"""
        else:
            system_prompt = f"""You are an expert interview coach. Generate {question_count} relevant interview questions based on the provided context.

Instructions:
- Generate a mix of technical, behavioral, and experience-based questions
- Assign appropriate difficulty levels (beginner, intermediate, advanced)
- Rate relevance from 0.0 to 1.0 based on how well the question matches the context
- Each question should be unique and valuable for interview preparation

Return the response as a JSON array with this exact structure:
[
  {{
    "id": "unique_question_id",
    "question": "Question text here?",
    "type": "technical" | "behavioral" | "experience",
    "difficulty": "beginner" | "intermediate" | "advanced",
    "relevance_score": 0.85
  }}
]

Context:
{context}"""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an expert interview coach."},
                    {"role": "user", "content": system_prompt}
                ],
                temperature=0.7,
                max_tokens=3000
            )

            content = response.choices[0].message.content
            if not content:
                raise ValueError("No content received from OpenAI")

            print(f"DEBUG: OpenAI response content: {content}")  # Debug logging

            # Clean the content (remove any markdown formatting)
            content = content.strip()
            if content.startswith('```json'):
                content = content[7:]
            if content.endswith('```'):
                content = content[:-3]
            content = content.strip()

            # Parse the JSON response
            try:
                questions_data = json.loads(content)
            except json.JSONDecodeError as e:
                print(f"DEBUG: Failed to parse JSON. Content was: {repr(content)}")
                raise ValueError(f"Failed to parse OpenAI response as JSON: {e}")

            # Convert to Question objects
            questions = []
            for i, q_data in enumerate(questions_data):
                question = Question(
                    id=q_data.get('id', f'q_{i+1}'),
                    question=q_data['question'],
                    type=QuestionType(q_data['type']),
                    difficulty=QuestionDifficulty(q_data['difficulty']),
                    relevance_score=q_data['relevance_score'],
                    answer=q_data.get('answer') if include_answers else None
                )
                questions.append(question)

            return questions

        except Exception as e:
            print(f"DEBUG: OpenAI API error: {e}")
            raise ValueError(f"OpenAI API error: {e}")

    async def generate_answer(
        self,
        question: str,
        resume_text: Optional[str] = None,
        job_description: Optional[str] = None
    ) -> str:
        """Generate a sample answer for a specific question"""

        # Build context
        context_parts = []
        if resume_text:
            context_parts.append(f"Resume/CV:\n{resume_text}")
        if job_description:
            context_parts.append(f"Job Description:\n{job_description}")

        context = "\n\n".join(context_parts) if context_parts else ""

        context_section = f"Context to consider:\n{context}" if context else ""

        system_prompt = f"""You are an expert interview coach. Generate a professional, well-structured answer to the interview question.

Instructions:
- Provide a comprehensive but concise answer
- Use the STAR method (Situation, Task, Action, Result) for behavioral questions when appropriate
- Make the answer relevant to the provided context when available
- Keep the answer professional and interview-appropriate
- Aim for 100-200 words

Question: {question}

{context_section}

Provide only the answer, no additional formatting or labels."""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt}
                ],
                temperature=0.7,
                max_tokens=500
            )

            content = response.choices[0].message.content
            if not content:
                raise ValueError("No content received from OpenAI")

            return content.strip()

        except Exception as e:
            raise ValueError(f"OpenAI API error: {e}")

# Create a singleton instance
openai_service = OpenAIService()
