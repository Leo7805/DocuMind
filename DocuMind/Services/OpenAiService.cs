using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using DocuMind.Configuration;
using DocuMind.Dtos.Internal;
using DocuMind.Exceptions;
using DocuMind.Services.Prompts;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi;

namespace DocuMind.Services;

public class OpenAiService(
    HttpClient httpClient,
    IOptions<OpenAiOptions> openAiOptions,
    ILogger<OpenAiService> logger)
{
    private readonly HttpClient _httpClient = httpClient;
    private readonly OpenAiOptions _openAiOptions = openAiOptions.Value;
    private readonly ILogger<OpenAiService> _logger = logger;
    
    private static readonly JsonSerializerOptions JsonSerializerOptions = new(JsonSerializerDefaults.Web);

    // Analyze resume using OpenAI
    public async Task<AiResumeAnalysisResult> AnalyzeResumeAsync(string extractedText)
    {
        if (string.IsNullOrWhiteSpace(extractedText))
        {
            throw new AiIntegrationException("Extracted text is empty.");
        }

        try
        {
            // Prevent sending excessively large payloads in MVG stage
            var inputText = extractedText.Length > 12_000
                ? extractedText[..12_000]
                : extractedText;

            var prompt = ResumePromptBuilder.BuildResumeAnalysisPrompt(inputText);

            var requestBody = new
            {
                model = _openAiOptions.Model,
                input = prompt,
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

            var response = await _httpClient.SendAsync(request);
            var rawJson = await response.Content.ReadAsStringAsync();
            // Console.WriteLine("✅ response body below:");
            // Console.WriteLine(rawJson);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError(
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

            using var document = JsonDocument.Parse(rawJson);

            // Responses API commonly returns output_text / text content in the response payload.
            // For MVP, we try a few safe extraction patterns.
            var outputText = TryExtractOutputText(document.RootElement);

            if (string.IsNullOrWhiteSpace(outputText))
            {
                _logger.LogError("Failed to extract output text from OpenAI response. Raw response: {ResponseBody}",
                    rawJson);
                throw new AiResponseParseException("Failed to extract text output from OpenAI response.");
            }

            var aiResult = JsonSerializer.Deserialize<AiResumeAnalysisResult>(outputText, JsonSerializerOptions);

            if (aiResult is null)
            {
                _logger.LogError(
                    "Failed to deserialize AI output into AiResumeAnalysisResult. OutputText: {OutputText}",
                    outputText);
                throw new PdfExtractionException("Failed to parse AI JSON output.");
            }

            return aiResult;
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
            _logger.LogError(ex, "HTTP error while calling OpenAI API.");
            throw new AiIntegrationException("Network error while calling OpenAI API.");
        }
        catch (TaskCanceledException ex)
        {
            _logger.LogError(ex, "Timeout while calling OpenAI API.");
            throw new AiIntegrationException("OpenAI API request timed out.");
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "JSON parsing error while processing OpenAI response.");
            throw new AiResponseParseException("Invalid JSON received from OpenAI.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error in OpenAiService.");
            throw new AiIntegrationException("Unexpected error while processing AI analysis.");
        }
    }

    private static string TryExtractOutputText(JsonElement root)
    {
        // Pattern 1: top-level output_text
        if (root.TryGetProperty("output_text", out var outputTextElement) &&
            outputTextElement.ValueKind == JsonValueKind.String)
        {
            return outputTextElement.GetString() ?? string.Empty;
        }

        // Pattern 2: nested output -> content -> text
        if (!root.TryGetProperty("output", out var outputArray) || outputArray.ValueKind != JsonValueKind.Array)
            return string.Empty;

        foreach (var item in outputArray.EnumerateArray())
        {
            if (!item.TryGetProperty("content", out var contentArray) ||
                contentArray.ValueKind != JsonValueKind.Array) continue;

            foreach (var content in contentArray.EnumerateArray())
            {
                if (content.TryGetProperty("text", out var textElement) &&
                    textElement.ValueKind == JsonValueKind.String)
                {
                    return textElement.GetString() ?? string.Empty;
                }
            }
        }

        return string.Empty;
    }
}