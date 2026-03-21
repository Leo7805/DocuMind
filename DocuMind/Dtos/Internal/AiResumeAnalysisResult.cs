using DocuMind.Domain;

namespace DocuMind.Dtos.Internal;

public record AiResumeAnalysisResult
{
    public string Summary { get; init; } = string.Empty;
    public IReadOnlyList<string> KeyInsights { get; init; } = [];
    public StructuredResume StructuredResume { get; init; } = new();
}