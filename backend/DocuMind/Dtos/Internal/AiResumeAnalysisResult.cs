using DocuMind.Domain;

namespace DocuMind.Dtos.Internal;

public class AiResumeAnalysisResult
{
    public string Summary { get; set; } = string.Empty;
    public List<string> KeyInsights { get; set; } = [];
    public StructuredResume StructuredResume { get; set; } = new();
}