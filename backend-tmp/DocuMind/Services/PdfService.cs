using DocuMind.Exceptions;
using UglyToad.PdfPig;

namespace DocuMind.Services;

public sealed class PdfService : IPdfService
{
    public string ExtractText(Stream pdfStream)
    {
        try
        {
            if (pdfStream == null || pdfStream.Length == 0)
            {
                throw new PdfExtractionException("Uploaded PDF is empty.");
            }

            using var document = PdfDocument.Open(pdfStream);
            var pages = document.GetPages();
            var text = string.Join("\n", pages.Select(p => p.Text));

            if (string.IsNullOrWhiteSpace(text))
            {
                throw new PdfExtractionException("No text could be extracted from the PDF.");
            }

            return text;
        }
        catch (PdfExtractionException)
        {
            throw;
        }
        catch (Exception ex)
        {
            throw new PdfExtractionException($"Failed to extract text from PDF: {ex.Message}");
        }
    }
}