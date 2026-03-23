using DocuMind.Configuration;
using DocuMind.Dtos;
using DocuMind.Exceptions;
using DocuMind.Services;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

/* Add services to the container.*/
// Add built‑in .NET OpenAPI services (used for Minimal API metadata generation).
builder.Services.AddOpenApi();

// Register services used to generate API metadata and Swagger UI.
builder.Services.AddEndpointsApiExplorer(); // Discovers Minimal API endpoints for OpenAPI.
builder.Services.AddSwaggerGen();           // Generates the Swagger JSON and Swagger UI.

// Bind the "OpenAi" section of appsettings.json to the OpenAiOptions class,
// so it can be injected via IOptions<OpenAiOptions> throughout the application.
builder.Services.Configure<OpenAiOptions>(
    builder.Configuration.GetSection("OpenAi")
    );

builder.Services.AddScoped<IPdfService, PdfService>();
builder.Services.AddHttpClient<IOpenAiService, OpenAiService>();
builder.Services.AddScoped<IAiJsonParser, AiJsonParser>();

// builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
// builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    // Enable Swagger middleware so the app can expose API docs and UI.
    app.UseSwagger();
    app.UseSwaggerUI();
    // app.MapOpenApi();
}

app.UseHttpsRedirection();

// app.UseAuthorization();

// app.MapControllers();
app.MapGet("/", ()=> Results.Ok("DocuMind is running..."));

app.MapPost("/analyze", async (
        IFormFile file, 
        IPdfService pdfService,
        IOpenAiService openAiService,
        ILogger<Program> logger) =>
    {
        try
        {
            if (file.Length == 0)
            {
                return Results.BadRequest(new { error = "Uploaded file is empty." });
            }

            if (!file.FileName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase))
            {
                return Results.BadRequest(new { error = "Only PDF files are supported." });
            }

            await using var pdfStream = file.OpenReadStream();
            var extractedText = pdfService.ExtractText(pdfStream);

            var preview = extractedText.Length > 500
                ? extractedText[..500]
                : extractedText;

            // Analyze Resume using AI
            var aiResult = await openAiService.AnalyzeResumeAsync(extractedText);

            var response = new AnalyzePdfResponse
            {
                FileName = file.FileName,
                ExtractedLength = extractedText.Length,
                Preview = preview,
                Summary = aiResult.Summary,
                KeyInsights = aiResult.KeyInsights,
                StructuredResume = aiResult.StructuredResume
            };

            return Results.Ok(response);
        }
        catch (AiResponseParseException ex)
        {
            logger.LogError(ex, "Resume parsing failed during /analyze.");

            return Results.Problem(
                title: "Resume parsing failed",
                detail: ex.Message,
                statusCode: ex.StatusCode,
                extensions: new Dictionary<string, object?>
                {
                    ["fallbackSummary"] = ex.FallbackSummary
                });
        }
        catch (AppException ex)
        {
            logger.LogError(ex, "Application error during /analyze.");
            return Results.Problem(
                title: "Requests failed",
                detail: ex.Message,
                statusCode: ex.StatusCode);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unexpected unhandled error during /analyze.");
            return Results.Problem(
                title: "Internal server error",
                detail: "An unexpected error occurred.",
                statusCode: StatusCodes.Status500InternalServerError);
        } 
    })
    .Accepts<IFormFile>("multipart/form-data") // Swagger: file upload endpoint
    .DisableAntiforgery(); // Disable CSRF validation for this endpoint

app.Run();