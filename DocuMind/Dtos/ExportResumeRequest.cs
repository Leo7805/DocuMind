using DocuMind.Domain;

namespace DocuMind.Dtos;

public record ExportResumeRequest
{
    public StructuredResume StructuredResume { get; init; } = new();
    public string TargetRole { get; init; } = string.Empty;
    public string TemplateName { get; init; } = "default";
}
