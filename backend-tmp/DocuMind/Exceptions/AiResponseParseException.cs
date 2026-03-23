namespace DocuMind.Exceptions;

public class AiResponseParseException(
    string message,
    string? fallbackSummary = null
) : AppException(message, StatusCodes.Status502BadGateway)
{
    public string? FallbackSummary { get; } = fallbackSummary;
}
