namespace DocuMind.Services.Prompts;

public static class ResumePromptBuilder
{
    public static string BuildResumeAnalysisPrompt(string inputText)
    {
        return $$"""
                 You are an assistant that analyses resume/CV text and converts it into structured JSON.

                 Your tasks:
                 1. Generate a professional summary (3–5 sentences).
                 2. Extract exactly 5 key insights as short bullet-style phrases.
                 3. Extract the original summary/profile/objective section from the resume if present.
                 4. Extract structured resume information.

                 Rules:
                 - Only use information explicitly present in the resume.
                 - Do NOT invent or assume missing data.
                 - If a field is missing or unclear, return an empty string "".
                 - If a list has no reliable data, return an empty array [].
                 - Do NOT merge unrelated sections.
                 - Keep information concise and structured.
                 - Return valid JSON ONLY.
                 - Do NOT include markdown (e.g. ```json).
                 - Do NOT include any explanation before or after the JSON.

                 Field-specific instructions:
                 - "summary": a rewritten professional summary based on the resume.
                 - "sourceSummary": extract the original summary/profile/objective section WITHOUT rewriting. If not present, return "".
                 - "keyInsights": exactly 5 short bullet-style phrases.
                 - "skills": extract technical and professional skills only (avoid soft fluff unless clearly stated).
                 - "experience": include ONLY real work experience (exclude projects).
                 - "projects": include personal, academic, or non-work projects.
                 - "education": include degrees and academic history.
                 - "additionalSections": include sections such as certifications, awards, languages, publications, volunteering, etc.

                 Important extraction rules:
                 - Do NOT guess missing dates.
                 - Do NOT infer company names or roles.
                 - Do NOT duplicate content across sections.
                 - Prefer structured, minimal text over long paragraphs.

                 Output JSON format:
                 {
                   "summary": "string",
                   "sourceSummary": "string",
                   "keyInsights": ["string"],
                   "structuredResume": {
                     "basicInfo": {
                       "name": "string",
                       "resumeTitle": "string",
                       "email": "string",
                       "phone": "string",
                       "location": "string",
                       "linkedin": "string",
                       "website": "string",
                       "github": "string"
                     },
                     "skills": ["string"],
                     "experience": [
                       {
                         "title": "string",
                         "company": "string",
                         "location": "string",
                         "start": "string",
                         "end": "string",
                         "highlights": ["string"]
                       }
                     ],
                     "projects": [
                       {
                         "name": "string",
                         "description": "string",
                         "technologies": ["string"],
                         "highlights": ["string"],
                         "start": "string",
                         "end": "string"
                       }
                     ],
                     "education": [
                       {
                         "degree": "string",
                         "major": "string",
                         "institution": "string",
                         "location": "string",
                         "start": "string",
                         "end": "string"
                       }
                     ],
                     "additionalSections": [
                       {
                         "sectionName": "string",
                         "items": ["string"]
                       }
                     ]
                   }
                 }

                 The following is raw resume text:
                 <Resume>
                 {{inputText}}
                 </Resume>
                 """;
    }
}