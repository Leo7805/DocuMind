namespace DocuMind.Domain;

public record BasicInfo
{
    public string ResumeTitle { get; set; } = string.Empty;
    
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;

    public string Linkedin { get; set; } = string.Empty;
    public string Website { get; set; } = string.Empty;
    public string Github { get; set; } = string.Empty;
    
    public string WorkRights { get; set; } = string.Empty;
    public string? Address { get; set; }
}