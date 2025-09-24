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
        include_answers: bool = False,
        question_types: Optional[List[QuestionType]] = None,
        difficulty_levels: Optional[List[QuestionDifficulty]] = None,
        focus_areas: Optional[List[str]] = None,
        company_name: Optional[str] = None,
        position_level: Optional[str] = None
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

        # Build additional constraints
        constraints = []
        if question_types:
            type_list = ", ".join([t.value for t in question_types])
            constraints.append(f"- Focus on these question types: {type_list}")

        if difficulty_levels:
            diff_list = ", ".join([d.value for d in difficulty_levels])
            constraints.append(f"- Use these difficulty levels: {diff_list}")

        if focus_areas:
            focus_list = ", ".join(focus_areas)
            constraints.append(f"- Focus on these areas: {focus_list}")

        if company_name:
            constraints.append(f"- Consider this company: {company_name}")

        if position_level:
            constraints.append(f"- Target this position level: {position_level}")

        additional_constraints = "\n".join(constraints) if constraints else ""

        # Create the prompt
        if include_answers:
            system_prompt = f"""You are an expert interview coach. Generate {question_count} relevant interview questions based on the provided context.

Instructions:
- Generate a mix of technical, behavioral, and experience-based questions
- Assign appropriate difficulty levels (beginner, intermediate, advanced, expert)
- Rate relevance from 0.0 to 1.0 based on how well the question matches the context
- Each question should be unique and valuable for interview preparation
- Include sample answers for each question
{additional_constraints}

Return the response as a JSON array with this exact structure:
[
  {{
    "id": "unique_question_id",
    "question": "Question text here?",
    "type": "technical" | "behavioral" | "experience" | "problem-solving" | "leadership" | "situational" | "company-culture" | "general",
    "difficulty": "beginner" | "intermediate" | "advanced" | "expert",
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
- Assign appropriate difficulty levels (beginner, intermediate, advanced, expert)
- Rate relevance from 0.0 to 1.0 based on how well the question matches the context
- Each question should be unique and valuable for interview preparation
{additional_constraints}

Return the response as a JSON array with this exact structure:
[
  {{
    "id": "unique_question_id",
    "question": "Question text here?",
    "type": "technical" | "behavioral" | "experience" | "problem-solving" | "leadership" | "situational" | "company-culture" | "general",
    "difficulty": "beginner" | "intermediate" | "advanced" | "expert",
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

    async def generate_bulk_answers(
        self,
        questions: List[Question],
        resume_text: Optional[str] = None,
        job_description: Optional[str] = None,
        answer_style: str = "professional"
    ) -> Dict[str, str]:
        """Generate answers for multiple questions at once"""

        if not questions:
            return {}

        # Build context
        context_parts = []
        if resume_text:
            context_parts.append(f"Resume/CV:\n{resume_text}")
        if job_description:
            context_parts.append(f"Job Description:\n{job_description}")

        context = "\n\n".join(context_parts) if context_parts else ""
        context_section = f"Context to consider:\n{context}" if context else ""

        # Prepare questions list for the prompt
        questions_list = []
        for i, q in enumerate(questions, 1):
            questions_list.append(f"{i}. {q.question} (Type: {q.type.value}, Difficulty: {q.difficulty.value})")

        questions_text = "\n".join(questions_list)

        # Style-specific instructions
        style_instructions = {
            "professional": "Use a formal, professional tone suitable for corporate interviews",
            "conversational": "Use a friendly, conversational tone while remaining professional",
            "detailed": "Provide comprehensive, detailed answers with specific examples and metrics",
            "concise": "Keep answers brief and to the point while covering key aspects"
        }

        style_instruction = style_instructions.get(answer_style, style_instructions["professional"])

        system_prompt = f"""You are an expert interview coach. Generate well-structured answers for the following interview questions.

Instructions:
- {style_instruction}
- Use the STAR method (Situation, Task, Action, Result) for behavioral questions when appropriate
- Make answers relevant to the provided context when available
- Keep answers interview-appropriate and compelling
- Aim for 100-200 words per answer unless the style is "concise" (then 50-100 words) or "detailed" (then 200-300 words)

{context_section}

Questions:
{questions_text}

Return the response as a JSON object mapping question numbers to answers:
{{
  "1": "Answer to question 1...",
  "2": "Answer to question 2...",
  "3": "Answer to question 3...",
  ...
}}"""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt}
                ],
                temperature=0.7,
                max_tokens=4000
            )

            content = response.choices[0].message.content
            if not content:
                raise ValueError("No content received from OpenAI")

            # Clean the content
            content = content.strip()
            if content.startswith('```json'):
                content = content[7:]
            if content.endswith('```'):
                content = content[:-3]
            content = content.strip()

            # Parse the JSON response
            try:
                answers_data = json.loads(content)
            except json.JSONDecodeError as e:
                raise ValueError(f"Failed to parse OpenAI response as JSON: {e}")

            # Map question numbers back to question IDs
            result = {}
            for i, question in enumerate(questions, 1):
                answer_key = str(i)
                if answer_key in answers_data:
                    result[question.id] = answers_data[answer_key]

            return result

        except Exception as e:
            raise ValueError(f"OpenAI API error: {e}")

# Create a singleton instance
openai_service = OpenAIService()
