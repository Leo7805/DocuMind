namespace DocuMind.Domain;

public record StructuredResume
{
    public BasicInfo BasicInfo { get; init; } = new();
    public IReadOnlyList<string> Skills { get; init; } = [];
    public IReadOnlyList<ExperienceItem> Experience { get; init; } = [];
    public IReadOnlyList<ProjectItem> Projects { get; init; } = [];
    public IReadOnlyList<EducationItem> Education { get; init; } = [];
    public IReadOnlyList<AdditionalSectionItem> AdditionalSections { get; init; } = [];
}
