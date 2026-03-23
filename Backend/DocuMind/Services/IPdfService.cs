namespace DocuMind.Services;

public interface IPdfService
{
    string ExtractText(Stream pdfStream);
}