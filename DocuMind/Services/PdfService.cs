using DocuMind.Exceptions;
using UglyToad.PdfPig;

namespace DocuMind.Services;

public class PdfService
{
    public string ExtractText(IFormFile file)
    {
        try
        {
            if (file == null || file.Length == 0)
            {
                throw new PdfExtractionException("Uploaded PDF is empty.");
            }

            using var document = PdfDocument.Open(file.OpenReadStream());
            var pages = document.GetPages();
            var text = string.Join("\n", pages.Select(p => p.Text));

            if (string.IsNullOrWhiteSpace(text))
            {
                throw new PdfExtractionException("No text could be extracted from the PDF.");
            }

            return text;
        }
        catch (PdfExtractionException e)
        {
            throw;
        }
        catch (Exception ex)
        {
            throw new PdfExtractionException($"Failed to extract text from PDF: {ex.Message}");
        }
    }
}