using System.Net.Http.Headers;
using System.Runtime.ExceptionServices;
using System.Text;
using System.Text.Json;
using DocuMind.Configuration;
using DocuMind.Domain;
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
        var parsed = new List<AiResumeAnalysisResult>();
        var errors = new List<string>();
        
        for (var index = 0; index < candidates.Count; index++)
        {
            var candidate = candidates[index];
            var displayIndex = index + 1;

            try
            {
                var aiResult = aiJsonParser.ParseOrThrow<AiResumeAnalysisResult>(candidate);

                if (!LooksLikeResume(aiResult))
                {
                    errors.Add($"Candidate #{displayIndex}: JSON parsed but not a resume.");
                    logger.LogDebug("Candidate #{I} parsed but not resume", displayIndex);
                    continue;
                }

                parsed.Add(aiResult);
            }        
            catch (Exception ex)
            {
                errors.Add($"Candidate #{displayIndex}: {ex.Message}");
            }
        }
            
        if (parsed.Count == 0)
        {
            logger.LogError(
                "❌ All {Count} candidates failed to produce a resume. Errors: {Errors}. Raw (truncated): {Raw}",
                candidates.Count,
                string.Join(" | ", errors),
                rawJson.Length > 500 ? rawJson[..500] + "..." : rawJson
            );
            
            throw new AiResponseParseException(
                "Failed to parse AI output into AiResumeAnalysisResult.",
                ExtractFallbackSummary(rawJson)
            );
        }
        
        // Merge all valid candidates
        var merged = MergeCandidates(parsed);

        logger.LogInformation(
            "✅ Successfully merged {Count} resume candidates into final result.",
            parsed.Count
        );
        
        return merged;
    }

    private static string ExtractFallbackSummary(string rawJson)
    {
        try
        {
            using var doc = JsonDocument.Parse(rawJson);
            var root = doc.RootElement;

            // 1. Try top-level output_text
            var fromOutputText = TryExtractFromOutputText(root);
            if (!string.IsNullOrWhiteSpace(fromOutputText))
                return Truncate(fromOutputText);

            // 2. Try output[].content[].text
            var fromOutput = TryExtractFromOutput(root);
            if (!string.IsNullOrWhiteSpace(fromOutput))
                return Truncate(fromOutput);
        }
        catch
        {
            // ignore parsing errors
        }

        // 3. Fallback to raw JSON
        return Truncate(rawJson);
        
        string Truncate(string text)
        {
            return text.Length > 500 ? text[..500] + "..." : text;
        }
    }

private static AiResumeAnalysisResult MergeCandidates(List<AiResumeAnalysisResult> candidates)
{
    // Pick the candidate with the highest completeness score
    var baseCandidate = candidates
        .OrderByDescending(ScoreResumeCandidate)
        .First();

    foreach (var candidate in candidates)
    {
        if (candidate == baseCandidate) continue;

        var baseSr = baseCandidate.StructuredResume;
        var sr = candidate.StructuredResume;

        // Merge BasicInfo fields only when missing in the base candidate
        if (string.IsNullOrWhiteSpace(baseSr.BasicInfo.Name))
            baseSr.BasicInfo.Name = sr.BasicInfo.Name;

        if (string.IsNullOrWhiteSpace(baseSr.BasicInfo.Email))
            baseSr.BasicInfo.Email = sr.BasicInfo.Email;

        if (string.IsNullOrWhiteSpace(baseSr.BasicInfo.Phone))
            baseSr.BasicInfo.Phone = sr.BasicInfo.Phone;

        if (string.IsNullOrWhiteSpace(baseSr.BasicInfo.Address))
            baseSr.BasicInfo.Address = sr.BasicInfo.Address;

        if (string.IsNullOrWhiteSpace(baseSr.BasicInfo.ResumeTitle))
            baseSr.BasicInfo.ResumeTitle = sr.BasicInfo.ResumeTitle;

        if (string.IsNullOrWhiteSpace(baseSr.BasicInfo.Location))
            baseSr.BasicInfo.Location = sr.BasicInfo.Location;

        if (string.IsNullOrWhiteSpace(baseSr.BasicInfo.Linkedin))
            baseSr.BasicInfo.Linkedin = sr.BasicInfo.Linkedin;

        if (string.IsNullOrWhiteSpace(baseSr.BasicInfo.Website))
            baseSr.BasicInfo.Website = sr.BasicInfo.Website;

        if (string.IsNullOrWhiteSpace(baseSr.BasicInfo.Github))
            baseSr.BasicInfo.Github = sr.BasicInfo.Github;

        if (string.IsNullOrWhiteSpace(baseSr.BasicInfo.WorkRights))
            baseSr.BasicInfo.WorkRights = sr.BasicInfo.WorkRights;

        // Merge summary if the base candidate does not have one
        if (string.IsNullOrWhiteSpace(baseCandidate.Summary))
            baseCandidate.Summary = candidate.Summary;

        // Merge KeyInsights without duplicates
        baseCandidate.KeyInsights ??= [];
        foreach (var insight in candidate.KeyInsights)
        {
            if (baseCandidate.KeyInsights != null && !baseCandidate.KeyInsights.Contains(insight))
                baseCandidate.KeyInsights.Add(insight);
        }

        // Merge Skills without duplicates
        baseSr.Skills ??= [];
        foreach (var skill in sr.Skills.Where(skill => !baseSr.Skills.Contains(skill)))
        {
            baseSr.Skills.Add(skill);
        }

        // Merge Experience entries
        baseSr.Experience ??= [];
        baseSr.Experience.AddRange(sr.Experience);

        // Merge Education entries
        baseSr.Education ??= [];
        baseSr.Education.AddRange(sr.Education);

        // Merge Projects entries
        baseSr.Projects ??= [];
        baseSr.Projects.AddRange(sr.Projects);

        // Merge AdditionalSections entries
        baseSr.AdditionalSections ??= [];
        baseSr.AdditionalSections.AddRange(sr.AdditionalSections);
    }

    return baseCandidate;
}


    private static int ScoreResumeCandidate(AiResumeAnalysisResult result)
    {
        var score = 0;
        var sr = result.StructuredResume;

        if (!string.IsNullOrWhiteSpace(result.Summary)) score++;
        if (!string.IsNullOrWhiteSpace(sr.BasicInfo?.Name)) score++;
        if (!string.IsNullOrWhiteSpace(sr.BasicInfo?.Email)) score++;
        if (!string.IsNullOrWhiteSpace(sr.BasicInfo?.Phone)) score++;
        if (!string.IsNullOrWhiteSpace(sr.BasicInfo?.Location)) score++;
        if (!string.IsNullOrWhiteSpace(sr.BasicInfo?.Linkedin)) score++;
        if (!string.IsNullOrWhiteSpace(sr.BasicInfo?.Website)) score++;
        if (!string.IsNullOrWhiteSpace(sr.BasicInfo?.Github)) score++;
        if (!string.IsNullOrWhiteSpace(sr.BasicInfo?.WorkRights)) score++;
        if (sr.Skills?.Count > 0) score++;
        if (sr.Experience?.Count > 0) score++;
        if (sr.Education?.Count > 0) score++;
        if (sr.Projects?.Count > 0) score++;
        if (sr.AdditionalSections?.Count > 0) score++;

        return score;
    }

    private static bool LooksLikeResume(AiResumeAnalysisResult aiResult)
    {
        var sr = aiResult.StructuredResume;

        if (sr is null)
            return false;

        // At least one keyword is non-empty
        return
            // Summary
            !string.IsNullOrWhiteSpace(aiResult.Summary) ||

            // BasicInfo
            !string.IsNullOrWhiteSpace(sr.BasicInfo?.Name) ||
            !string.IsNullOrWhiteSpace(sr.BasicInfo?.Email) ||
            !string.IsNullOrWhiteSpace(sr.BasicInfo?.Phone) ||
            !string.IsNullOrWhiteSpace(sr.BasicInfo?.Location) ||
            !string.IsNullOrWhiteSpace(sr.BasicInfo?.Linkedin) ||
            !string.IsNullOrWhiteSpace(sr.BasicInfo?.Website) ||
            !string.IsNullOrWhiteSpace(sr.BasicInfo?.Github) ||

            // Main resume sections
            (sr.Skills?.Count > 0) ||
            (sr.Experience?.Count > 0) ||
            (sr.Education?.Count > 0) ||
            (sr.Projects?.Count > 0) ||

            // Additional sections
            (sr.AdditionalSections?.Count > 0);

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
                
                // ⭐⭐ NEW: extract content.text instead of passing the whole content object
                if (!content.TryGetProperty("text", out var textElement) ||
                    textElement.ValueKind != JsonValueKind.String)
                {
                    continue;
                }

                var part = ConvertElementToPayload(textElement);
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