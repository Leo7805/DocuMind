using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using DocuMind.Configuration;
using DocuMind.Dtos.Internal;
using DocuMind.Exceptions;
using DocuMind.Services.Prompts;
using Microsoft.Extensions.Options;

namespace DocuMind.Services;

public sealed class OpenAiService(
    HttpClient httpClient,
    IAiJsonParser aiJsonParser,
    IOptions<OpenAiOptions> openAiOptions,
    ILogger<OpenAiService> logger) : IOpenAiService
{
    private readonly OpenAiOptions _openAiOptions = openAiOptions.Value;
    private const int MaxResumeInputLength = 12_000;

    // Analyze resume using OpenAI
    public async Task<AiResumeAnalysisResult> AnalyzeResumeAsync(string extractedText)
    {
        // Empty resume
        if (string.IsNullOrWhiteSpace(extractedText))
        {
            throw new AiIntegrationException("Extracted text is empty.");
        }

        // Resume too long
        if (extractedText.Length > MaxResumeInputLength)
        {
            throw new AiIntegrationException(
                $"Resume text too long: {extractedText.Length} characters. Limit: {MaxResumeInputLength}.");
        }

        try
        {
            var prompt = ResumePromptBuilder.BuildResumeAnalysisPrompt(extractedText);
            var rawJson = await SendResponsesRequestAsync(prompt);
            return ParseAiResumeAnalysisResult(rawJson);
        }
        catch (AiIntegrationException)
        {
            throw;
        }
        catch (AiResponseParseException)
        {
            throw;
        }
        catch (HttpRequestException ex)
        {
            logger.LogError(ex, "HTTP error while calling OpenAI API.");
            throw new AiIntegrationException("Network error while calling OpenAI API.");
        }
        catch (TaskCanceledException ex)
        {
            logger.LogError(ex, "Timeout while calling OpenAI API.");
            throw new AiIntegrationException("OpenAI API request timed out.");
        }
        catch (JsonException ex)
        {
            logger.LogError(ex, "JSON parsing error while processing OpenAI response.");
            throw new AiResponseParseException("Invalid JSON received from OpenAI.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unexpected error in OpenAiService.");
            throw new AiIntegrationException("Unexpected error while processing AI analysis.");
        }
    }

    private AiResumeAnalysisResult ParseAiResumeAnalysisResult(string rawJson)
    {
        using var document = JsonDocument.Parse(rawJson);
        var candidates = ExtractResponsePayloadCandidates(document.RootElement);

        if (candidates.Count == 0)
        {
            logger.LogError(
                "❌ No JSON candidates extracted from OpenAI response. Raw (truncated): {Raw}",
                rawJson.Length > 500 ? rawJson[..500] + "..." : rawJson
            );

            throw new AiResponseParseException("No usable JSON found in OpenAI response.");
        }

        var errors = new List<string>();

        for (var i = 0; i < candidates.Count; i++)
        {
            var candidate = candidates[i];

            try
            {
                var aiResult = aiJsonParser.ParseOrThrow<AiResumeAnalysisResult>(candidate);

                if (!LooksLikeResume(aiResult))
                {
                    throw new AiResponseParseException("Parsed JSON is not a valid resume structure.");                
                }

                logger.LogInformation(
                    "✅ Candidate #{CandidateIndex} succeeded for type {Type}.",
                    i + 1,
                    nameof(AiResumeAnalysisResult)
                );

                return aiResult;
            }
            catch (Exception ex)
            {
                logger.LogWarning(
                    "⚠️ Candidate #{CandidateIndex} failed: {Message}. Raw (truncated): {Raw}",
                    i + 1,
                    ex.Message,
                    candidate.Length > 300 ? candidate[..300] + "..." : candidate
                );

                errors.Add($"Candidate #{i + 1}: {ex.Message}");
            }
        }

        logger.LogError(
            "❌ All {Count} candidates failed to parse {Type}. Errors: {Errors}. Raw (truncated): {Raw}",
            candidates.Count,
            nameof(AiResumeAnalysisResult),
            string.Join(" | ", errors),
            rawJson.Length > 500 ? rawJson[..500] + "..." : rawJson
        );

        throw new AiResponseParseException("Failed to parse AI output into AiResumeAnalysisResult.");
    }

    private static bool LooksLikeResume(AiResumeAnalysisResult aiResult)
    {
        throw new NotImplementedException();
    }

    private async Task<string> SendResponsesRequestAsync(string prompt)
    {
        var requestBody = new
        {
            model = _openAiOptions.Model,
            input = prompt
        };

        // Send HTTP Request
        var baseUrl = _openAiOptions.BaseUrl;
        var endpoint = _openAiOptions.Endpoint;
        using var request = new HttpRequestMessage(HttpMethod.Post, $"{baseUrl}{endpoint}");

        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _openAiOptions.ApiKey);
        request.Content = new StringContent(
            JsonSerializer.Serialize(requestBody),
            Encoding.UTF8,
            "application/json"
        );

        var response = await httpClient.SendAsync(request);
        var rawJson = await response.Content.ReadAsStringAsync();

        if (response.IsSuccessStatusCode) return rawJson;

        logger.LogError(
            "OpenAI API call failed. StatusCode: {StatusCode}. ResponseBody: {ResponseBody}",
            (int)response.StatusCode,
            rawJson);

        if ((int)response.StatusCode == 429 && rawJson.Contains("insufficient_quota"))
        {
            throw new AiIntegrationException("OpenAI quota exceeded. Please check billing.");
        }

        throw new AiIntegrationException(
            $"OpenAI API request failed with status code {(int)response.StatusCode}.");
    }

    private static IReadOnlyList<string> ExtractResponsePayloadCandidates(JsonElement root)
    {
        var candidates = new List<string>();

        AddCandidate(TryExtractFromOutputText(root));
        AddCandidate(TryExtractFromOutput(root));

        return candidates;

        void AddCandidate(string? candidate)
        {
            if (string.IsNullOrEmpty(candidate))
            {
                return;
            }

            var trimmedCandidate = candidate.Trim();
            candidates.Add(trimmedCandidate);
        }
    }

    // Pattern 2: nested "output" -> "content" -> "text"
    private static string? TryExtractFromOutput(JsonElement root)
    {
        // If it's not an output[] structure
        if (!root.TryGetProperty("output", out var outputArray) || outputArray.ValueKind != JsonValueKind.Array)
        {
            return null;
        }

        var parts = new List<string>();

        // Walk through each "output" item
        foreach (var item in outputArray.EnumerateArray())
        {
            // If it's not a content[] structure
            if (!item.TryGetProperty("content", out var contentArray) ||
                contentArray.ValueKind != JsonValueKind.Array) continue;

            // Walk through each "content" item
            foreach (var content in contentArray.EnumerateArray())
            {
                // Only process content blocks whose "type" is output_text/text; skip reasoning, tool calls, and other block types.
                if (content.TryGetProperty("type", out var typeElement) &&
                    typeElement.ValueKind == JsonValueKind.String)
                {
                    var type = typeElement.GetString();
                    if (type is not null && type != "output_text" && type != "text")
                    {
                        continue;
                    }
                }

                var part = ConvertElementToPayload(content);
                if (!string.IsNullOrWhiteSpace(part))
                {
                    parts.Add(part);
                }
            }
        }

        return parts.Count > 0 ? string.Concat(parts) : null;
    }

    // Pattern 1: top-level "output_text"
    private static string? TryExtractFromOutputText(JsonElement root)
    {
        return !root.TryGetProperty("output_text", out var outputTextElement)
            ? null
            : ConvertElementToPayload(outputTextElement);
    }


    private static string? ConvertElementToPayload(JsonElement element)
    {
        return element.ValueKind switch
        {
            JsonValueKind.String => element.GetString(),
            JsonValueKind.Null => null,
            JsonValueKind.Undefined => null,
            _ => element.GetRawText() // Object, Array, Number, True, False
        };
    }
}