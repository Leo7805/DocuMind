namespace DocuMind.Domain;

public record EducationItem
{
    public string Degree { get; init; } = string.Empty;
    public string Major { get; init; } = string.Empty;
    public string Institution { get; init; } = string.Empty;
    public string Location { get; init; } = string.Empty;

    public string Start { get; init; } = string.Empty;
    public string End { get; init; } = string.Empty;
}