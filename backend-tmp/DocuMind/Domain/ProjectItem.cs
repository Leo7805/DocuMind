namespace DocuMind.Domain;

public record ProjectItem
{
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;

    public IReadOnlyList<string> Technologies { get; init; } = [];
    public IReadOnlyList<string> Highlights { get; init; } = [];

    public string Start { get; init; } = string.Empty;
    public string End { get; init; } = string.Empty;
}