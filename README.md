# DocuMind

DocuMind is an AI-powered document analysis backend system designed to extract, analyse, and structure information from PDF documents such as resumes.

## Overview

This project focuses on integrating AI capabilities into real-world backend systems. It demonstrates how unstructured document data can be processed and transformed into structured, usable information through API-based workflows.

## Features

- PDF text extraction using PdfPig
- AI-powered analysis using OpenAI API
- Structured resume parsing (skills, experience, education)
- Automated summary and key insights generation
- REST API built with ASP.NET Core (Minimal API)
- Swagger/OpenAPI integration for testing and documentation
- Service-layer architecture for scalability and maintainability

## Tech Stack

- .NET / C#
- ASP.NET Core (Minimal API)
- OpenAI API
- PdfPig (PDF parsing)
- Swagger / OpenAPI

## API Endpoints

### POST /analyze

Upload a PDF resume and receive structured analysis.

**Input:**
- multipart/form-data
- file: PDF

**Output:**
```json
{
  "summary": "...",
  "sourceSummary": "...",
  "keyInsights": ["..."],
  "structuredResume": { ... }
}
```

## Project Goal

This project is built to demonstrate:

AI integration into backend systems
API-driven architecture
Document processing pipelines
Real-world application of LLMs


## Status

### 🚧 In Progress
Currently improving AI output stability and expanding structured data extraction.

## Future Improvements
HTML / PDF resume generation
Frontend interface for editing structured data
Advanced prompt tuning and response validation
Deployment to Azure


## Author

Jin Liu (Leo)
Backend & AI Integration Engineer