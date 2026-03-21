namespace DocuMind.Domain;

public record ExperienceItem
{
    public string Title { get; init; } = string.Empty;
    public string Company {get; init; } = string.Empty;
    public string Location {get; init; } = string.Empty;
    
    public string Start { get; init; } = string.Empty;
    public string End { get; init; } = string.Empty;

    public IReadOnlyList<string> Highlights { get; init; } = [];
}