import os
import time
from datetime import datetime
from typing import List, Dict
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY

from app.core.config import settings
from app.models.schemas import Question, PDFExportRequest, PDFExportResponse

class PDFExportService:
    def __init__(self):
        self.export_dir = settings.EXPORT_DIR
        os.makedirs(self.export_dir, exist_ok=True)
    
    async def export_interview_prep(
        self,
        questions: List[Question],
        answers: Dict[str, str],
        resume_filename: str = None,
        job_title: str = None
    ) -> PDFExportResponse:
        """Export interview questions and answers to PDF"""
        
        start_time = time.time()
        
        # Generate filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"interview_prep_{timestamp}.pdf"
        filepath = os.path.join(self.export_dir, filename)
        
        # Create PDF document
        doc = SimpleDocTemplate(
            filepath,
            pagesize=A4,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=72
        )
        
        # Build content
        story = []
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor='#2563eb'
        )
        
        subtitle_style = ParagraphStyle(
            'CustomSubtitle',
            parent=styles['Heading2'],
            fontSize=16,
            spaceAfter=20,
            textColor='#1f2937'
        )
        
        question_style = ParagraphStyle(
            'QuestionStyle',
            parent=styles['Normal'],
            fontSize=12,
            spaceAfter=10,
            textColor='#374151',
            fontName='Helvetica-Bold'
        )
        
        answer_style = ParagraphStyle(
            'AnswerStyle',
            parent=styles['Normal'],
            fontSize=11,
            spaceAfter=20,
            textColor='#4b5563',
            alignment=TA_JUSTIFY,
            leftIndent=20
        )
        
        info_style = ParagraphStyle(
            'InfoStyle',
            parent=styles['Normal'],
            fontSize=10,
            textColor='#6b7280',
            spaceAfter=15
        )
        
        # Title
        story.append(Paragraph("Interview Preparation Guide", title_style))
        story.append(Spacer(1, 12))
        
        # Metadata
        metadata_parts = []
        if job_title:
            metadata_parts.append(f"Position: {job_title}")
        if resume_filename:
            metadata_parts.append(f"Resume: {resume_filename}")
        metadata_parts.append(f"Generated: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}")
        metadata_parts.append(f"Total Questions: {len(questions)}")
        
        for meta in metadata_parts:
            story.append(Paragraph(meta, info_style))
        
        story.append(Spacer(1, 20))
        
        # Questions and Answers
        story.append(Paragraph("Questions & Answers", subtitle_style))
        
        for i, question in enumerate(questions, 1):
            # Question number and text
            question_text = f"Q{i}. {question.question}"
            story.append(Paragraph(question_text, question_style))
            
            # Question metadata
            metadata_text = f"Type: {question.type.value.title()} | Difficulty: {question.difficulty.value.title()} | Relevance: {question.relevance_score:.1f}/1.0"
            story.append(Paragraph(metadata_text, info_style))
            
            # Answer
            answer_text = answers.get(question.id) or question.answer
            if answer_text:
                story.append(Paragraph(f"<b>Answer:</b>", answer_style))
                story.append(Paragraph(answer_text, answer_style))
            else:
                story.append(Paragraph("<i>No answer provided</i>", answer_style))
            
            story.append(Spacer(1, 15))
            
            # Page break every 3-4 questions to avoid cramming
            if i % 4 == 0 and i < len(questions):
                story.append(PageBreak())
        
        # Summary section
        if len(questions) > 5:
            story.append(PageBreak())
            story.append(Paragraph("Preparation Summary", subtitle_style))
            
            # Question type breakdown
            type_counts = {}
            difficulty_counts = {}
            
            for q in questions:
                type_counts[q.type.value] = type_counts.get(q.type.value, 0) + 1
                difficulty_counts[q.difficulty.value] = difficulty_counts.get(q.difficulty.value, 0) + 1
            
            story.append(Paragraph("<b>Question Types:</b>", question_style))
            for qtype, count in type_counts.items():
                story.append(Paragraph(f"• {qtype.title()}: {count} questions", info_style))
            
            story.append(Spacer(1, 10))
            story.append(Paragraph("<b>Difficulty Distribution:</b>", question_style))
            for diff, count in difficulty_counts.items():
                story.append(Paragraph(f"• {diff.title()}: {count} questions", info_style))
            
            # Preparation tips
            story.append(Spacer(1, 20))
            story.append(Paragraph("Preparation Tips", subtitle_style))
            
            tips = [
                "Practice your answers out loud, not just in your head",
                "Use the STAR method (Situation, Task, Action, Result) for behavioral questions",
                "Research the company and role thoroughly before the interview",
                "Prepare thoughtful questions to ask the interviewer",
                "Review technical concepts relevant to the position",
                "Practice with mock interviews to build confidence"
            ]
            
            for tip in tips:
                story.append(Paragraph(f"• {tip}", info_style))
        
        # Build PDF
        doc.build(story)
        
        # Calculate file size
        file_size = os.path.getsize(filepath)
        generation_time = time.time() - start_time
        
        # Generate download URL
        download_url = f"/exports/{filename}"
        
        return PDFExportResponse(
            filename=filename,
            download_url=download_url,
            file_size=file_size,
            generation_time=generation_time
        )

# Create singleton instance
pdf_export_service = PDFExportService()