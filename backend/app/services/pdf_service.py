import os
import time
from datetime import datetime
from typing import List, Dict
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, Image
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY, TA_RIGHT
from reportlab.lib import colors
from reportlab.graphics.shapes import Drawing, Rect, Line
from reportlab.platypus.flowables import HRFlowable
from reportlab.lib.colors import HexColor

from app.core.config import settings
from app.models.schemas import Question, PDFExportRequest, PDFExportResponse

class PDFExportService:
    def __init__(self):
        self.export_dir = settings.EXPORT_DIR
        os.makedirs(self.export_dir, exist_ok=True)

        # Premium color palette
        self.colors = {
            'primary': HexColor('#2563eb'),      # Blue
            'secondary': HexColor('#64748b'),    # Slate
            'accent': HexColor('#0ea5e9'),       # Sky blue
            'success': HexColor('#10b981'),      # Emerald
            'text_dark': HexColor('#0f172a'),    # Slate 900
            'text_medium': HexColor('#334155'),  # Slate 700
            'text_light': HexColor('#64748b'),   # Slate 500
            'background': HexColor('#f8fafc'),   # Slate 50
            'border': HexColor('#e2e8f0'),       # Slate 200
        }

    def _create_premium_styles(self):
        """Create premium styling for the PDF"""
        styles = getSampleStyleSheet()

        # Main title - Premium gradient-like effect with larger size
        title_style = ParagraphStyle(
            'PremiumTitle',
            parent=styles['Heading1'],
            fontSize=32,
            spaceAfter=20,
            spaceBefore=20,
            alignment=TA_CENTER,
            textColor=self.colors['primary'],
            fontName='Helvetica-Bold',
            leading=36
        )

        # Subtitle with elegant spacing
        subtitle_style = ParagraphStyle(
            'PremiumSubtitle',
            parent=styles['Heading2'],
            fontSize=20,
            spaceAfter=25,
            spaceBefore=25,
            textColor=self.colors['text_dark'],
            fontName='Helvetica-Bold',
            leading=24
        )

        # Section headers with premium styling
        section_header_style = ParagraphStyle(
            'SectionHeader',
            parent=styles['Heading3'],
            fontSize=16,
            spaceAfter=15,
            spaceBefore=20,
            textColor=self.colors['primary'],
            fontName='Helvetica-Bold',
            leftIndent=0,
            borderPadding=8,
            borderWidth=0,
            borderColor=self.colors['border']
        )

        # Question styling with enhanced readability
        question_style = ParagraphStyle(
            'PremiumQuestion',
            parent=styles['Normal'],
            fontSize=13,
            spaceAfter=8,
            spaceBefore=15,
            textColor=self.colors['text_dark'],
            fontName='Helvetica-Bold',
            leading=16,
            leftIndent=0,
            rightIndent=0
        )

        # Answer styling with professional appearance
        answer_style = ParagraphStyle(
            'PremiumAnswer',
            parent=styles['Normal'],
            fontSize=11,
            spaceAfter=18,
            spaceBefore=5,
            textColor=self.colors['text_medium'],
            alignment=TA_JUSTIFY,
            leftIndent=15,
            rightIndent=10,
            leading=14,
            fontName='Helvetica'
        )

        # Metadata styling
        metadata_style = ParagraphStyle(
            'PremiumMetadata',
            parent=styles['Normal'],
            fontSize=10,
            textColor=self.colors['text_light'],
            spaceAfter=8,
            fontName='Helvetica-Oblique',
            leftIndent=15
        )

        # Info box styling for highlights
        info_box_style = ParagraphStyle(
            'InfoBox',
            parent=styles['Normal'],
            fontSize=10,
            textColor=self.colors['text_medium'],
            spaceAfter=12,
            leftIndent=20,
            rightIndent=20,
            fontName='Helvetica'
        )

        # Footer style
        footer_style = ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=9,
            textColor=self.colors['text_light'],
            alignment=TA_CENTER,
            fontName='Helvetica-Oblique'
        )

        return {
            'title': title_style,
            'subtitle': subtitle_style,
            'section_header': section_header_style,
            'question': question_style,
            'answer': answer_style,
            'metadata': metadata_style,
            'info_box': info_box_style,
            'footer': footer_style
        }

    def _create_header_table(self, job_title: str = None, resume_filename: str = None):
        """Create a professional header table"""
        data = []

        # Header row with logo placeholder and title
        header_data = [
            ['🎯 INTERVIEW PREPARATION GUIDE', f"Generated: {datetime.now().strftime('%B %d, %Y')}"]
        ]
        data.extend(header_data)

        if job_title or resume_filename:
            details = []
            if job_title:
                details.append(f"Position: {job_title}")
            if resume_filename:
                details.append(f"Resume: {resume_filename}")

            data.append([details[0] if details else '', details[1] if len(details) > 1 else ''])

        table = Table(data, colWidths=[4*inch, 2.5*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), self.colors['background']),
            ('TEXTCOLOR', (0, 0), (0, 0), self.colors['primary']),
            ('TEXTCOLOR', (1, 0), (1, 0), self.colors['text_light']),
            ('FONTNAME', (0, 0), (0, 0), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, 0), 'Helvetica'),
            ('FONTSIZE', (0, 0), (0, 0), 18),
            ('FONTSIZE', (1, 0), (1, 0), 10),
            ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 12),
            ('RIGHTPADDING', (0, 0), (-1, -1), 12),
            ('TOPPADDING', (0, 0), (-1, -1), 15),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 15),
            ('LINEBELOW', (0, 0), (-1, 0), 2, self.colors['primary']),
        ]))

        return table

    def _create_stats_summary(self, questions: List[Question], answers: Dict[str, str]):
        """Create a visual statistics summary"""
        answered_count = len([q for q in questions if answers.get(q.id) or q.answer])
        completion_rate = (answered_count / len(questions)) * 100 if questions else 0

        # Question type breakdown
        type_counts = {}
        difficulty_counts = {}

        for q in questions:
            type_counts[q.type.value] = type_counts.get(q.type.value, 0) + 1
            difficulty_counts[q.difficulty.value] = difficulty_counts.get(q.difficulty.value, 0) + 1

        # Create summary table
        summary_data = [
            ['📊 PREPARATION SUMMARY', ''],
            ['Total Questions', str(len(questions))],
            ['Questions Answered', f"{answered_count} ({completion_rate:.1f}%)"],
            ['Average Relevance', f"{sum(q.relevance_score for q in questions) / len(questions):.2f}/1.0" if questions else "N/A"],
        ]

        table = Table(summary_data, colWidths=[3*inch, 2*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), self.colors['primary']),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 14),
            ('BACKGROUND', (0, 1), (-1, -1), self.colors['background']),
            ('TEXTCOLOR', (0, 1), (-1, -1), self.colors['text_dark']),
            ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 1), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 11),
            ('ALIGN', (1, 1), (1, -1), 'RIGHT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 12),
            ('RIGHTPADDING', (0, 0), (-1, -1), 12),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 1, self.colors['border']),
        ]))

        return table

    def _create_question_card(self, question: Question, answer_text: str, question_num: int, styles: dict):
        """Create a premium question card layout"""
        elements = []

        # Question header with number and difficulty badge
        difficulty_colors = {
            'beginner': HexColor('#10b981'),    # Green
            'intermediate': HexColor('#f59e0b'), # Yellow
            'advanced': HexColor('#ef4444'),     # Red
            'expert': HexColor('#8b5cf6')        # Purple
        }

        # Question number and title
        question_header = f"<font size='14' color='{self.colors['primary']}'><b>Question {question_num}</b></font>"
        elements.append(Paragraph(question_header, styles['question']))

        # Question text with premium formatting
        question_text = f"<font size='12' color='{self.colors['text_dark']}'>{question.question}</font>"
        elements.append(Paragraph(question_text, styles['answer']))

        # Metadata badges
        difficulty_color = difficulty_colors.get(question.difficulty.value, self.colors['secondary'])
        metadata_text = f"""
        <font size='9' color='{self.colors['text_light']}'>
        <b>Type:</b> {question.type.value.title()} •
        <b>Difficulty:</b> <font color='{difficulty_color}'>{question.difficulty.value.title()}</font> •
        <b>Relevance:</b> {question.relevance_score:.1f}/1.0
        </font>
        """
        elements.append(Paragraph(metadata_text, styles['metadata']))

        elements.append(Spacer(1, 8))

        # Answer section with enhanced styling
        if answer_text:
            answer_header = f"<font size='11' color='{self.colors['success']}'><b>💡 Your Answer:</b></font>"
            elements.append(Paragraph(answer_header, styles['metadata']))

            # Format answer with better typography
            formatted_answer = answer_text.replace('\n', '<br/>')
            elements.append(Paragraph(formatted_answer, styles['answer']))
        else:
            no_answer = f"<font size='10' color='{self.colors['text_light']}'><i>💭 Practice space - write your answer here</i></font>"
            elements.append(Paragraph(no_answer, styles['info_box']))

        # Add separator line
        elements.append(Spacer(1, 10))
        elements.append(HRFlowable(width="100%", thickness=1, color=self.colors['border']))
        elements.append(Spacer(1, 15))

        return elements

    async def export_interview_prep(
        self,
        questions: List[Question],
        answers: Dict[str, str],
        resume_filename: str = None,
        job_title: str = None
    ) -> PDFExportResponse:
        """Export interview questions and answers to premium PDF"""

        start_time = time.time()

        # Generate filename with better naming
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_job_title = "".join(c for c in (job_title or "Interview_Prep") if c.isalnum() or c in (' ', '-', '_')).rstrip()
        safe_job_title = safe_job_title.replace(' ', '_')
        filename = f"{safe_job_title}_{timestamp}.pdf"
        filepath = os.path.join(self.export_dir, filename)

        # Create premium PDF document with better margins
        doc = SimpleDocTemplate(
            filepath,
            pagesize=A4,
            rightMargin=50,
            leftMargin=50,
            topMargin=60,
            bottomMargin=60,
            title=f"Interview Preparation - {job_title or 'Professional'}",
            author="AI Interview Prep",
            subject="Interview Preparation Guide",
            keywords="interview, preparation, questions, answers"
        )

        # Get premium styles
        styles = self._create_premium_styles()

        # Build premium content
        story = []

        # Professional header
        story.append(self._create_header_table(job_title, resume_filename))
        story.append(Spacer(1, 30))

        # Executive summary if we have enough questions
        if len(questions) >= 3:
            story.append(self._create_stats_summary(questions, answers))
            story.append(Spacer(1, 25))

        # Table of contents for longer documents
        if len(questions) > 8:
            story.append(Paragraph("📋 Contents Overview", styles['section_header']))

            # Group questions by type for TOC
            questions_by_type = {}
            for i, q in enumerate(questions, 1):
                if q.type.value not in questions_by_type:
                    questions_by_type[q.type.value] = []
                questions_by_type[q.type.value].append(f"Q{i}")

            for qtype, q_nums in questions_by_type.items():
                toc_entry = f"<b>{qtype.title()} Questions:</b> {', '.join(q_nums)}"
                story.append(Paragraph(toc_entry, styles['info_box']))

            story.append(Spacer(1, 20))
            story.append(PageBreak())

        # Questions and Answers section
        story.append(Paragraph("🎯 Interview Questions & Practice Answers", styles['subtitle']))
        story.append(Spacer(1, 15))

        # Group questions by type for better organization
        questions_by_type = {}
        for q in questions:
            if q.type.value not in questions_by_type:
                questions_by_type[q.type.value] = []
            questions_by_type[q.type.value].append(q)

        question_counter = 1
        for qtype, type_questions in questions_by_type.items():
            if len(questions_by_type) > 1:  # Only show type headers if multiple types
                type_header = f"📂 {qtype.title()} Questions"
                story.append(Paragraph(type_header, styles['section_header']))
                story.append(Spacer(1, 10))

            for question in type_questions:
                # Get answer text
                answer_text = answers.get(question.id) or question.answer or ""

                # Create premium question card
                question_elements = self._create_question_card(
                    question, answer_text, question_counter, styles
                )
                story.extend(question_elements)

                question_counter += 1

                # Smart page breaks - avoid orphaned questions
                if question_counter % 3 == 0 and question_counter < len(questions):
                    story.append(PageBreak())

        # Professional preparation guide section
        if len(questions) > 5:
            story.append(PageBreak())
            story.append(Paragraph("🚀 Your Preparation Strategy", styles['subtitle']))
            story.append(Spacer(1, 15))

            # Detailed analytics
            story.append(Paragraph("📈 Question Analysis", styles['section_header']))

            # Question type breakdown table
            type_counts = {}
            difficulty_counts = {}
            avg_relevance_by_type = {}

            for q in questions:
                type_counts[q.type.value] = type_counts.get(q.type.value, 0) + 1
                difficulty_counts[q.difficulty.value] = difficulty_counts.get(q.difficulty.value, 0) + 1

                if q.type.value not in avg_relevance_by_type:
                    avg_relevance_by_type[q.type.value] = []
                avg_relevance_by_type[q.type.value].append(q.relevance_score)

            # Create detailed breakdown table
            breakdown_data = [['Question Type', 'Count', 'Avg. Relevance']]
            for qtype, count in type_counts.items():
                avg_rel = sum(avg_relevance_by_type[qtype]) / len(avg_relevance_by_type[qtype])
                breakdown_data.append([qtype.title(), str(count), f"{avg_rel:.2f}"])

            breakdown_table = Table(breakdown_data, colWidths=[2.5*inch, 1*inch, 1.5*inch])
            breakdown_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), self.colors['primary']),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 11),
                ('BACKGROUND', (0, 1), (-1, -1), self.colors['background']),
                ('TEXTCOLOR', (0, 1), (-1, -1), self.colors['text_dark']),
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 1), (-1, -1), 10),
                ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('GRID', (0, 0), (-1, -1), 1, self.colors['border']),
                ('LEFTPADDING', (0, 0), (-1, -1), 8),
                ('RIGHTPADDING', (0, 0), (-1, -1), 8),
                ('TOPPADDING', (0, 0), (-1, -1), 6),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ]))
            story.append(breakdown_table)
            story.append(Spacer(1, 20))

            # Professional preparation tips
            story.append(Paragraph("💡 Expert Preparation Tips", styles['section_header']))

            premium_tips = [
                "<b>🎯 Master the STAR Method:</b> Structure behavioral answers with Situation, Task, Action, Result framework",
                "<b>🔍 Research Deep:</b> Know the company's mission, recent news, competitors, and industry trends",
                "<b>🗣️ Practice Out Loud:</b> Record yourself answering questions to identify filler words and improve flow",
                "<b>❓ Prepare Smart Questions:</b> Ask about team dynamics, growth opportunities, and company challenges",
                "<b>📝 Quantify Achievements:</b> Use specific numbers, percentages, and metrics in your examples",
                "<b>🤝 Mock Interviews:</b> Practice with professionals in your network for realistic feedback",
                "<b>⏰ Time Management:</b> Keep answers concise (2-3 minutes) while covering key points",
                "<b>🎭 Body Language:</b> Maintain eye contact, confident posture, and engaged facial expressions"
            ]

            for tip in premium_tips:
                story.append(Paragraph(tip, styles['info_box']))
                story.append(Spacer(1, 8))

            # Difficulty-specific advice
            story.append(Spacer(1, 15))
            story.append(Paragraph("🎚️ Difficulty-Based Strategy", styles['section_header']))

            difficulty_advice = {
                'beginner': "Focus on clear communication and demonstrating your learning mindset",
                'intermediate': "Showcase your problem-solving process and collaboration skills",
                'advanced': "Highlight leadership experiences and complex technical decisions",
                'expert': "Discuss strategic thinking, mentoring others, and industry innovation"
            }

            for diff, count in difficulty_counts.items():
                if count > 0:
                    advice_text = f"<b>{diff.title()} Questions ({count}):</b> {difficulty_advice.get(diff, 'Tailor your responses to this difficulty level.')}"
                    story.append(Paragraph(advice_text, styles['info_box']))
                    story.append(Spacer(1, 6))

        # Professional footer
        story.append(Spacer(1, 30))
        footer_text = f"""
        <font size='9' color='{self.colors['text_light']}'>
        Generated by AI Interview Prep • {datetime.now().strftime('%B %d, %Y')} •
        Total Questions: {len(questions)} • Preparation Time: ~{len(questions) * 3} minutes
        </font>
        """
        story.append(Paragraph(footer_text, styles['footer']))

        # Build the premium PDF
        doc.build(story)

        # Calculate file size and generation time
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
