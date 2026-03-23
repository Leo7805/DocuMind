namespace DocuMind.Services;

public interface IAiJsonParser
{
    T ParseOrThrow<T>(string rawText);
}