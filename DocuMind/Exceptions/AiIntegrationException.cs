namespace DocuMind.Exceptions;

public class AiIntegrationException(string message) :AppException(message, StatusCodes.Status502BadGateway);
