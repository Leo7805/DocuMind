namespace DocuMind.Exceptions;

public class AiResponseParseException(string message) :AppException(message, StatusCodes.Status502BadGateway);
