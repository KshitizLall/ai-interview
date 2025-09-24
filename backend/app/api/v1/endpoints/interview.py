from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from typing import List
import time

from app.models.schemas import (
    FileUploadResponse,
    QuestionGenerationRequest,
    QuestionGenerationResponse,
    AnswerGenerationRequest,
    AnswerGenerationResponse,
    BulkAnswerGenerationRequest,
    BulkAnswerGenerationResponse,
    PDFExportRequest,
    PDFExportResponse,
    ErrorResponse
)
from app.services.file_service import file_service
from app.services.openai_service import openai_service
from app.services.pdf_service import pdf_export_service

router = APIRouter()

@router.post("/upload-file", response_model=FileUploadResponse)
async def upload_file(file: UploadFile = File(...)):
    """
    Upload and process a resume file (PDF, DOCX, or TXT)
    Returns extracted text content and metadata
    """
    try:
        return await file_service.process_file(file)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File processing failed: {str(e)}")

@router.post("/generate-questions", response_model=QuestionGenerationResponse)
async def generate_questions(request: QuestionGenerationRequest):
    """
    Generate interview questions based on resume and/or job description
    """
    start_time = time.time()

    try:
        questions = await openai_service.generate_questions(
            resume_text=request.resume_text,
            job_description=request.job_description,
            question_count=request.question_count,
            include_answers=request.include_answers,
            question_types=request.question_types,
            difficulty_levels=request.difficulty_levels,
            focus_areas=request.focus_areas,
            company_name=request.company_name,
            position_level=request.position_level
        )

        generation_time = time.time() - start_time

        return QuestionGenerationResponse(
            questions=questions,
            generation_time=generation_time,
            total_questions=len(questions)
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Question generation failed: {str(e)}")

@router.post("/generate-answer", response_model=AnswerGenerationResponse)
async def generate_answer(request: AnswerGenerationRequest):
    """
    Generate a sample answer for a specific interview question
    """
    start_time = time.time()

    try:
        answer = await openai_service.generate_answer(
            question=request.question,
            resume_text=request.resume_text,
            job_description=request.job_description
        )

        generation_time = time.time() - start_time

        return AnswerGenerationResponse(
            question=request.question,
            answer=answer,
            generation_time=generation_time
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Answer generation failed: {str(e)}")

@router.post("/generate-bulk-answers", response_model=BulkAnswerGenerationResponse)
async def generate_bulk_answers(request: BulkAnswerGenerationRequest):
    """
    Generate sample answers for multiple interview questions at once
    """
    start_time = time.time()

    try:
        answers = await openai_service.generate_bulk_answers(
            questions=request.questions,
            resume_text=request.resume_text,
            job_description=request.job_description,
            answer_style=request.answer_style
        )

        generation_time = time.time() - start_time

        return BulkAnswerGenerationResponse(
            answers=answers,
            generation_time=generation_time,
            total_answers=len(answers)
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Bulk answer generation failed: {str(e)}")

@router.post("/export-pdf", response_model=PDFExportResponse)
async def export_pdf(request: PDFExportRequest):
    """
    Export interview questions and answers to PDF
    """
    try:
        return await pdf_export_service.export_interview_prep(
            questions=request.questions,
            answers=request.answers,
            resume_filename=request.resume_filename,
            job_title=request.job_title
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF export failed: {str(e)}")

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "interview-prep-api"}
