namespace DocuMind.Domain;

public record BasicInfo
{
    public string ResumeTitle { get; init; } = string.Empty;
    
    public string Name { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string Phone { get; init; } = string.Empty;
    public string Location { get; init; } = string.Empty;

    public string Linkedin { get; init; } = string.Empty;
    public string Website { get; init; } = string.Empty;
    public string Github { get; init; } = string.Empty;
    
    public string WorkRights { get; init; } = string.Empty;
}