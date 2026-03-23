namespace DocuMind.Exceptions;

public class PdfExtractionException(string message) : AppException(message, StatusCodes.Status400BadRequest);
