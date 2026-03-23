namespace DocuMind.Domain;

public class StructuredResume
{
    public BasicInfo BasicInfo { get; set; } = new();
    public List<string> Skills { get; set; } = [];
    public List<ExperienceItem> Experience { get; set; } = [];
    public List<ProjectItem> Projects { get; set; } = [];
    public List<EducationItem> Education { get; set; } = [];
    public List<AdditionalSectionItem> AdditionalSections { get; set; } = [];
}
