import aiofiles
import os
import time
from typing import Optional
from fastapi import UploadFile, HTTPException
from PyPDF2 import PdfReader
from docx import Document
import io

from app.core.config import settings
from app.models.schemas import FileUploadResponse

class FileService:
    def __init__(self):
        self.upload_dir = settings.UPLOAD_DIR
        self.max_file_size = settings.MAX_FILE_SIZE
        self.allowed_types = settings.ALLOWED_FILE_TYPES
    
    async def process_file(self, file: UploadFile) -> FileUploadResponse:
        """Process uploaded file and extract text content"""
        
        start_time = time.time()
        
        # Validate file
        await self._validate_file(file)
        
        # Read file content
        content = await file.read()
        file_size = len(content)
        
        # Extract text based on file type
        extracted_text = await self._extract_text(content, file.filename or "unknown")
        
        # Calculate metrics
        word_count = len(extracted_text.split())
        character_count = len(extracted_text)
        processing_time = time.time() - start_time
        
        return FileUploadResponse(
            filename=file.filename or "unknown",
            file_size=file_size,
            content=extracted_text,
            word_count=word_count,
            character_count=character_count,
            processing_time=processing_time
        )
    
    async def _validate_file(self, file: UploadFile) -> None:
        """Validate uploaded file"""
        
        if not file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")
        
        # Check file extension
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext not in self.allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f"File type {file_ext} not supported. Allowed types: {', '.join(self.allowed_types)}"
            )
        
        # Check file size
        file.file.seek(0, 2)  # Seek to end
        file_size = file.file.tell()
        file.file.seek(0)  # Reset to beginning
        
        if file_size > self.max_file_size:
            raise HTTPException(
                status_code=400,
                detail=f"File size ({file_size} bytes) exceeds maximum allowed size ({self.max_file_size} bytes)"
            )
        
        if file_size == 0:
            raise HTTPException(status_code=400, detail="File is empty")
    
    async def _extract_text(self, content: bytes, filename: str) -> str:
        """Extract text from file content based on file type"""
        
        file_ext = os.path.splitext(filename)[1].lower()
        
        try:
            if file_ext == '.pdf':
                return await self._extract_pdf_text(content)
            elif file_ext == '.docx':
                return await self._extract_docx_text(content)
            elif file_ext == '.txt':
                return await self._extract_txt_text(content)
            else:
                raise HTTPException(status_code=400, detail=f"Unsupported file type: {file_ext}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to extract text: {str(e)}")
    
    async def _extract_pdf_text(self, content: bytes) -> str:
        """Extract text from PDF content"""
        
        try:
            pdf_file = io.BytesIO(content)
            pdf_reader = PdfReader(pdf_file)
            
            text_parts = []
            for page in pdf_reader.pages:
                text = page.extract_text()
                if text.strip():
                    text_parts.append(text.strip())
            
            extracted_text = "\n\n".join(text_parts)
            
            if not extracted_text.strip():
                raise HTTPException(status_code=400, detail="No text could be extracted from PDF")
            
            return extracted_text.strip()
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to parse PDF: {str(e)}")
    
    async def _extract_docx_text(self, content: bytes) -> str:
        """Extract text from DOCX content"""
        
        try:
            docx_file = io.BytesIO(content)
            doc = Document(docx_file)
            
            text_parts = []
            for paragraph in doc.paragraphs:
                text = paragraph.text.strip()
                if text:
                    text_parts.append(text)
            
            extracted_text = "\n\n".join(text_parts)
            
            if not extracted_text.strip():
                raise HTTPException(status_code=400, detail="No text could be extracted from DOCX")
            
            return extracted_text.strip()
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to parse DOCX: {str(e)}")
    
    async def _extract_txt_text(self, content: bytes) -> str:
        """Extract text from TXT content"""
        
        try:
            # Try different encodings
            encodings = ['utf-8', 'utf-16', 'iso-8859-1', 'cp1252']
            
            for encoding in encodings:
                try:
                    text = content.decode(encoding).strip()
                    if text:
                        return text
                except UnicodeDecodeError:
                    continue
            
            raise HTTPException(status_code=400, detail="Could not decode text file with any supported encoding")
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to parse text file: {str(e)}")

# Create a singleton instance
file_service = FileService()