namespace DocuMind.Domain;

public record AdditionalSectionItem
{
    public string SectionName { get; init; } = string.Empty;
    public IReadOnlyList<string> Items { get; init; } = [];
}