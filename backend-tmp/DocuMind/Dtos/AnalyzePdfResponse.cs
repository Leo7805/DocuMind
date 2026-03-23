using DocuMind.Domain;

namespace DocuMind.Dtos;

public record AnalyzePdfResponse
{
    public string FileName { get; init; } =  string.Empty;
    public int ExtractedLength { get; init; }
    public string Preview { get; init; } = string.Empty;
    
    public string Summary { get; init; } = string.Empty;
    public IReadOnlyList<string> KeyInsights { get; init; } = [];
    
    public StructuredResume StructuredResume { get; init; } = new();
}
