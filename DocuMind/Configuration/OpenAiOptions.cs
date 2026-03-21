namespace DocuMind.Configuration;

public class OpenAiOptions
{
    public string ApiKey { get; set; } = string.Empty;
    public string Model { get; set; } = "gpt-5.4";
    public string BaseUrl { get; set; } = "https://api.openai.com/";
    public string Endpoint { get; set; } = "v1/responses";
}
