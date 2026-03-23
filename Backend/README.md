# DocuMind

DocuMind is an AI-powered document analysis backend system that extracts, analyses, and structures information from PDF documents such as resumes.

## Overview

This project demonstrates how AI can be integrated into real-world backend systems to process unstructured data and convert it into structured, actionable information.

It focuses on building API-driven workflows that combine document processing, AI inference, and structured data generation.

## Key Features

- Extract text from PDF documents using PdfPig
- Process unstructured resume data into structured JSON
- Generate AI-powered summaries and key insights using OpenAI API
- Separate raw data (sourceSummary) from AI-generated output (summary)
- Design structured data models for downstream applications
- Provide REST APIs for integration with external systems

## Architecture

The system follows a service-based architecture:

- **PdfService**: Handles PDF parsing and text extraction
- **OpenAiService**: Manages AI integration and response handling
- **PromptBuilder**: Controls AI output format and consistency
- **API Layer**: Exposes endpoints for document analysis

## API

### POST /analyze

Uploads a PDF resume and returns structured analysis.

**Response Example:**

    {
      "summary": "...",
      "sourceSummary": "...",
      "keyInsights": ["..."],
      "structuredResume": { ... }
    }

## Tech Stack

- .NET / C#
- ASP.NET Core (Minimal API)
- OpenAI API
- PdfPig
- Swagger / OpenAPI

## Why This Project

This project focuses on practical AI integration rather than model training.

It demonstrates:

- Integrating LLMs into backend systems
- Designing structured outputs from unstructured input
- Building automation pipelines for document processing
- Handling real-world API responses and errors

## Status

🚧 In Progress  
Currently improving output stability, error handling, and structured data extraction.

## Future Work

- Resume tailoring based on job descriptions
- HTML / PDF resume generation
- Frontend interface for editing structured data
- Advanced validation and fallback handling for AI responses

## Author

Jin Liu (Leo)  
Backend & AI Integration Engineer