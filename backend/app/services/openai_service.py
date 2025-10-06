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

        # Validate inputs
        if not resume_text and not job_description:
            raise ValueError("Either resume_text or job_description must be provided")

        # Determine generation mode for better context understanding
        if resume_text and job_description:
            generation_mode = "combined"
        elif resume_text:
            generation_mode = "resume"
        else:
            generation_mode = "job_description"

        # Build context based on available inputs with better formatting
        context_parts = []
        if resume_text:
            context_parts.append(f"**CANDIDATE RESUME/CV:**\n{resume_text.strip()}")
        if job_description:
            context_parts.append(f"**TARGET JOB DESCRIPTION:**\n{job_description.strip()}")

        context = "\n\n".join(context_parts)

        # Build enhanced constraints with better categorization
        constraints = []
        
        # Company and position context
        if company_name:
            constraints.append(f"- Target Company: {company_name}")
        if position_level:
            constraints.append(f"- Position Level: {position_level} (adjust question complexity accordingly)")
            
        # Question type filtering
        if question_types:
            type_list = ", ".join([t.value.replace('_', ' ').title() for t in question_types])
            constraints.append(f"- Question Types: Focus primarily on {type_list}")
        else:
            constraints.append("- Question Types: Include a balanced mix of technical, behavioral, and experience-based questions")

        # Difficulty level targeting
        if difficulty_levels:
            diff_list = ", ".join([d.value.title() for d in difficulty_levels])
            constraints.append(f"- Difficulty Levels: Target {diff_list} level questions")
        else:
            constraints.append("- Difficulty Levels: Include a range from intermediate to advanced")

        # Focus areas for targeted questioning
        if focus_areas:
            focus_list = ", ".join(focus_areas)
            constraints.append(f"- Focus Areas: Emphasize questions related to {focus_list}")

        # Generation mode specific instructions
        if generation_mode == "combined":
            constraints.append("- Context: Use both resume and job description to create highly relevant, personalized questions")
        elif generation_mode == "resume":
            constraints.append("- Context: Focus on candidate's background, skills, and experiences from their resume")
        else:
            constraints.append("- Context: Focus on job requirements and role-specific competencies")

        additional_constraints = "\n".join(constraints) if constraints else ""

        # Create enhanced prompt with better structure
        if include_answers:
            system_prompt = f"""You are an expert technical recruiter and interview coach with extensive experience across various industries. Generate {question_count} highly relevant interview questions based on the provided context.

**GENERATION REQUIREMENTS:**
- Create strategic questions that assess both technical competence and cultural fit
- Ensure each question serves a specific evaluation purpose
- Questions should be appropriate for the target role and company context
- Avoid generic questions that could apply to any position
- Include progressive difficulty to thoroughly evaluate candidate depth
- Each question must be unique and add distinct value to the interview process

**ASSESSMENT CRITERIA:**
- Relevance Score: Rate 0.0-1.0 based on alignment with resume/job requirements
- Question Types: Use strategic mix based on role requirements
- Difficulty Progression: Match complexity to position level and requirements
- Answer Quality: Provide comprehensive sample answers with specific examples

**FORMATTING CONSTRAINTS:**
{additional_constraints}

**RESPONSE FORMAT:**
Return ONLY a valid JSON array with this exact structure:
[
  {{
    "id": "q_001",
    "question": "[Specific, targeted question text ending with appropriate punctuation]",
    "type": "technical" | "behavioral" | "experience" | "problem-solving" | "leadership" | "situational" | "company-culture" | "general",
    "difficulty": "beginner" | "intermediate" | "advanced" | "expert",
    "relevance_score": 0.85,
    "answer": "[Comprehensive sample answer with specific examples and key points]"
  }}
]

**CONTEXT FOR ANALYSIS:**
{context}"""
        else:
            system_prompt = f"""You are an expert technical recruiter and interview coach with extensive experience across various industries. Generate {question_count} highly relevant interview questions based on the provided context.

**GENERATION REQUIREMENTS:**
- Create strategic questions that assess both technical competence and cultural fit
- Ensure each question serves a specific evaluation purpose
- Questions should be appropriate for the target role and company context
- Avoid generic questions that could apply to any position
- Include progressive difficulty to thoroughly evaluate candidate depth
- Each question must be unique and add distinct value to the interview process

**ASSESSMENT CRITERIA:**
- Relevance Score: Rate 0.0-1.0 based on alignment with resume/job requirements
- Question Types: Use strategic mix based on role requirements
- Difficulty Progression: Match complexity to position level and requirements

**FORMATTING CONSTRAINTS:**
{additional_constraints}

**RESPONSE FORMAT:**
Return ONLY a valid JSON array with this exact structure:
[
  {{
    "id": "q_001",
    "question": "[Specific, targeted question text ending with appropriate punctuation]",
    "type": "technical" | "behavioral" | "experience" | "problem-solving" | "leadership" | "situational" | "company-culture" | "general",
    "difficulty": "beginner" | "intermediate" | "advanced" | "expert",
    "relevance_score": 0.85
  }}
]

**CONTEXT FOR ANALYSIS:**
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

            print(f"DEBUG: OpenAI response content length: {len(content)} chars")  # Debug logging

            # Clean the content using helper method
            cleaned_content = self._clean_json_response(content)

            # Parse the JSON response
            try:
                questions_data = json.loads(cleaned_content)
                if not isinstance(questions_data, list):
                    raise ValueError("Response must be a JSON array of questions")
            except json.JSONDecodeError as e:
                print(f"DEBUG: Failed to parse JSON. Cleaned content was: {repr(cleaned_content[:500])}")
                raise ValueError(f"Failed to parse OpenAI response as JSON: {e}")

            # Convert to Question objects with enhanced validation
            questions = []
            for i, q_data in enumerate(questions_data):
                try:
                    # Generate consistent question ID if not provided
                    question_id = q_data.get('id', f'q_{str(i+1).zfill(3)}')
                    
                    # Validate required fields
                    if not q_data.get('question'):
                        print(f"DEBUG: Skipping question {i+1}: missing question text")
                        continue
                    
                    # Validate and normalize question type
                    question_type = q_data.get('type', 'general')
                    if question_type not in [t.value for t in QuestionType]:
                        print(f"DEBUG: Invalid question type '{question_type}', defaulting to 'general'")
                        question_type = 'general'
                    
                    # Validate and normalize difficulty
                    difficulty = q_data.get('difficulty', 'intermediate')
                    if difficulty not in [d.value for d in QuestionDifficulty]:
                        print(f"DEBUG: Invalid difficulty '{difficulty}', defaulting to 'intermediate'")
                        difficulty = 'intermediate'
                    
                    # Validate relevance score
                    relevance_score = q_data.get('relevance_score', 0.5)
                    if not isinstance(relevance_score, (int, float)) or not (0.0 <= relevance_score <= 1.0):
                        print(f"DEBUG: Invalid relevance score '{relevance_score}', defaulting to 0.5")
                        relevance_score = 0.5
                    
                    question = Question(
                        id=question_id,
                        question=q_data['question'].strip(),
                        type=QuestionType(question_type),
                        difficulty=QuestionDifficulty(difficulty),
                        relevance_score=float(relevance_score),
                        answer=q_data.get('answer', '').strip() if include_answers and q_data.get('answer') else None
                    )
                    questions.append(question)
                    
                except Exception as e:
                    print(f"DEBUG: Error processing question {i+1}: {e}")
                    continue

            # Validate we have enough questions
            if len(questions) == 0:
                raise ValueError("No valid questions were generated. Please try again with different parameters.")
            
            if len(questions) < question_count * 0.5:  # At least 50% success rate
                print(f"DEBUG: Only generated {len(questions)} out of {question_count} requested questions")
            
            # Sort by relevance score for better quality
            questions.sort(key=lambda q: q.relevance_score, reverse=True)
            
            return questions

        except Exception as e:
            print(f"DEBUG: OpenAI API error: {e}")
            # Provide more specific error messages
            if "rate limit" in str(e).lower():
                raise ValueError("API rate limit exceeded. Please try again in a moment.")
            elif "invalid api key" in str(e).lower():
                raise ValueError("Invalid API configuration. Please contact support.")
            elif "timeout" in str(e).lower():
                raise ValueError("Request timed out. Please try again with fewer questions.")
            else:
                raise ValueError(f"Question generation failed: {str(e)}")

    async def generate_answer(
        self,
        question: str,
        resume_text: Optional[str] = None,
        job_description: Optional[str] = None
    ) -> str:
        """Generate a sample answer for a specific question"""

        # Validate input
        if not question or not question.strip():
            raise ValueError("Question text is required for answer generation")

        # Build enhanced context
        context_parts = []
        if resume_text and resume_text.strip():
            context_parts.append(f"**CANDIDATE BACKGROUND:**\n{resume_text.strip()}")
        if job_description and job_description.strip():
            context_parts.append(f"**TARGET ROLE:**\n{job_description.strip()}")

        context = "\n\n".join(context_parts) if context_parts else ""
        context_section = f"**CONTEXT FOR PERSONALIZATION:**\n{context}\n\n" if context else ""

        # Determine question type for better answer structuring
        question_lower = question.lower()
        is_behavioral = any(keyword in question_lower for keyword in 
                          ['tell me about', 'describe a time', 'give an example', 'how did you', 'when have you'])
        is_technical = any(keyword in question_lower for keyword in 
                         ['how would you', 'what is', 'explain', 'implement', 'design', 'algorithm', 'code'])

        # Create enhanced prompt based on question type
        answer_structure = ""
        if is_behavioral:
            answer_structure = "\n- Use the STAR method (Situation, Task, Action, Result) for optimal structure"
        elif is_technical:
            answer_structure = "\n- Provide technical depth while remaining accessible\n- Include practical examples or approaches"
        else:
            answer_structure = "\n- Structure your response logically with clear main points"

        system_prompt = f"""You are an expert career coach and interview strategist. Generate a compelling, professional answer that demonstrates strong candidacy.

**ANSWER REQUIREMENTS:**
- Create a response that showcases relevant skills and experience
- Align the answer with the target role when context is provided
- Demonstrate problem-solving ability and professional competence
- Use specific examples and quantifiable results when possible
- Maintain confidence while being authentic and relatable
- Length: 150-250 words for optimal impact{answer_structure}

{context_section}**INTERVIEW QUESTION:**
{question.strip()}

**SAMPLE ANSWER:**"""

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

            # Clean and validate the answer
            answer = content.strip()
            if not answer:
                raise ValueError("Empty answer received from OpenAI")
                
            return answer

        except Exception as e:
            print(f"DEBUG: Single answer generation error: {e}")
            if "rate limit" in str(e).lower():
                raise ValueError("API rate limit exceeded. Please try again in a moment.")
            elif "invalid api key" in str(e).lower():
                raise ValueError("Invalid API configuration. Please contact support.")
            elif "timeout" in str(e).lower():
                raise ValueError("Request timed out. Please try again.")
            else:
                raise ValueError(f"Answer generation failed: {str(e)}")

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

        # Enhanced style-specific instructions with better targeting
        style_instructions = {
            "professional": {
                "tone": "formal, corporate-appropriate tone with industry terminology",
                "length": "150-200 words",
                "focus": "Emphasize achievements, metrics, and business impact"
            },
            "conversational": {
                "tone": "friendly yet professional, approachable and relatable",
                "length": "120-180 words",
                "focus": "Balance professionalism with personality and authenticity"
            },
            "detailed": {
                "tone": "comprehensive and thorough, demonstrating deep expertise",
                "length": "200-300 words",
                "focus": "Include specific examples, metrics, methodologies, and lessons learned"
            },
            "concise": {
                "tone": "direct and impactful, highlighting key points efficiently",
                "length": "80-120 words",
                "focus": "Focus on most relevant achievements and core competencies"
            }
        }

        style_config = style_instructions.get(answer_style, style_instructions["professional"])

        system_prompt = f"""You are a senior executive coach specializing in interview preparation across multiple industries. Generate strategic, compelling answers that position the candidate for success.

**ANSWER STYLE: {answer_style.upper()}**
- Tone: {style_config['tone']}
- Length: {style_config['length']} per answer
- Focus: {style_config['focus']}

**ANSWER STRATEGY:**
- Tailor responses to demonstrate alignment with role requirements
- Use the STAR method for behavioral questions (Situation, Task, Action, Result)
- Include quantifiable achievements and specific examples when possible
- Show progression, learning, and impact in your responses
- Demonstrate both technical competence and leadership potential
- End strong with results, learning, or future application

{context_section}
**QUESTIONS TO ANSWER:**
{questions_text}

**RESPONSE FORMAT:**
Return ONLY a valid JSON object mapping question numbers to complete answers:
{{
  "1": "[Complete answer following the style guidelines]",
  "2": "[Complete answer following the style guidelines]",
  "3": "[Complete answer following the style guidelines]"
}}"""        
        # Validate we have questions to process
        if not questions:
            return {}

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

            # Clean the content using helper method
            cleaned_content = self._clean_json_response(content)

            # Parse the JSON response
            try:
                answers_data = json.loads(cleaned_content)
                if not isinstance(answers_data, dict):
                    raise ValueError("Response must be a JSON object mapping question numbers to answers")
            except json.JSONDecodeError as e:
                print(f"DEBUG: Failed to parse bulk answers JSON. Content was: {repr(cleaned_content[:500])}")
                raise ValueError(f"Failed to parse OpenAI response as JSON: {e}")

            # Map question numbers back to question IDs
            result = {}
            for i, question in enumerate(questions, 1):
                answer_key = str(i)
                if answer_key in answers_data:
                    result[question.id] = answers_data[answer_key]

            return result

        except Exception as e:
            print(f"DEBUG: Bulk answer generation error: {e}")
            if "rate limit" in str(e).lower():
                raise ValueError("API rate limit exceeded. Please try again in a moment.")
            elif "invalid api key" in str(e).lower():
                raise ValueError("Invalid API configuration. Please contact support.")
            elif "timeout" in str(e).lower():
                raise ValueError("Request timed out. Please try with fewer questions.")
            else:
                raise ValueError(f"Bulk answer generation failed: {str(e)}")

    def _clean_json_response(self, content: str) -> str:
        """Clean and prepare JSON response content"""
        if not content:
            return content
            
        content = content.strip()
        
        # Remove common markdown formatting
        if content.startswith('```json'):
            content = content[7:]
        elif content.startswith('```'):
            content = content[3:]
            
        if content.endswith('```'):
            content = content[:-3]
            
        return content.strip()

    def _validate_question_data(self, q_data: dict, index: int) -> bool:
        """Validate individual question data structure"""
        required_fields = ['question', 'type', 'difficulty', 'relevance_score']
        
        for field in required_fields:
            if field not in q_data:
                print(f"DEBUG: Question {index+1} missing required field: {field}")
                return False
                
        # Validate question text
        if not q_data['question'] or not q_data['question'].strip():
            print(f"DEBUG: Question {index+1} has empty question text")
            return False
            
        # Validate type
        if q_data['type'] not in [t.value for t in QuestionType]:
            print(f"DEBUG: Question {index+1} has invalid type: {q_data['type']}")
            return False
            
        # Validate difficulty
        if q_data['difficulty'] not in [d.value for d in QuestionDifficulty]:
            print(f"DEBUG: Question {index+1} has invalid difficulty: {q_data['difficulty']}")
            return False
            
        # Validate relevance score
        score = q_data['relevance_score']
        if not isinstance(score, (int, float)) or not (0.0 <= score <= 1.0):
            print(f"DEBUG: Question {index+1} has invalid relevance score: {score}")
            return False
            
        return True

# Create a singleton instance
openai_service = OpenAIService()
