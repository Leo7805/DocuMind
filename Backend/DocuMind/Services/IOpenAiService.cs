using System.Reflection.Metadata;
using DocuMind.Dtos.Internal;

namespace DocuMind.Services;

public interface IOpenAiService
{
    Task<AiResumeAnalysisResult> AnalyzeResumeAsync(string extractedText);
}
