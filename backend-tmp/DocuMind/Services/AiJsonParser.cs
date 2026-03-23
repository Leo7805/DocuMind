using System.Text.Json;
using DocuMind.Exceptions;

namespace DocuMind.Services;

public sealed class AiJsonParser (ILogger<AiJsonParser> logger) : IAiJsonParser
{

    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    
    public T ParseOrThrow<T>(string rawText)
    {
        if (string.IsNullOrWhiteSpace(rawText))
            throw new AiResponseParseException("AI returned empty output.");

        try
        {
            var result = JsonSerializer.Deserialize<T>(rawText, JsonOptions);
            return result ?? throw new AiResponseParseException("AI JSON deserialized to null.");
        }
        catch (Exception ex)
        {
            logger.LogWarning(
                ex,
                "⚠️ JSON parsing failed for type {Type}. Raw (truncated): {Raw}",
                typeof(T).Name,
                rawText.Length > 300 ? rawText[..300] + "..." : rawText
            );

            throw; // preserve original exception
        }
    }
}