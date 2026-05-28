using Newtonsoft.Json;

namespace Buzzhive.Tests;

public class ApiClient
{
    private readonly HttpClient _http;
    private readonly string _baseUrl;

    public ApiClient(string baseUrl)
    {
        _baseUrl = baseUrl.TrimEnd('/');
        _http = new HttpClient { Timeout = TimeSpan.FromSeconds(15) };
    }

    public string BaseUrl => _baseUrl;

    public Task<HttpResponseMessage> Get(string path) =>
        _http.GetAsync(_baseUrl + path);

    public Task<HttpResponseMessage> Post(string path, object? body = null)
    {
        var content = body is null
            ? null
            : new StringContent(JsonConvert.SerializeObject(body), System.Text.Encoding.UTF8, "application/json");
        return _http.PostAsync(_baseUrl + path, content);
    }

    public Task<HttpResponseMessage> PostRaw(string path, string rawJson)
    {
        var content = new StringContent(rawJson, System.Text.Encoding.UTF8, "application/json");
        return _http.PostAsync(_baseUrl + path, content);
    }

    public Task<HttpResponseMessage> Patch(string path, object body)
    {
        var content = new StringContent(JsonConvert.SerializeObject(body), System.Text.Encoding.UTF8, "application/json");
        var request = new HttpRequestMessage(HttpMethod.Patch, _baseUrl + path) { Content = content };
        return _http.SendAsync(request);
    }

    public Task<HttpResponseMessage> PatchRaw(string path, string rawJson)
    {
        var content = new StringContent(rawJson, System.Text.Encoding.UTF8, "application/json");
        var request = new HttpRequestMessage(HttpMethod.Patch, _baseUrl + path) { Content = content };
        return _http.SendAsync(request);
    }

    public Task<HttpResponseMessage> Delete(string path)
    {
        var request = new HttpRequestMessage(HttpMethod.Delete, _baseUrl + path);
        return _http.SendAsync(request);
    }

    public async Task<LoginResult?> Login(string email, string password)
    {
        var resp = await Post("/auth/login", new { email, password });
        if (!resp.IsSuccessStatusCode) return null;
        var json = await resp.Content.ReadAsStringAsync();
        return JsonConvert.DeserializeObject<LoginResult>(json);
    }

    public async Task<Dictionary<string, object?>> LoginToDict(string email, string password)
    {
        var resp = await Post("/auth/login", new { email, password });
        var json = await resp.Content.ReadAsStringAsync();
        return JsonConvert.DeserializeObject<Dictionary<string, object?>>(json) ?? [];
    }

    public ApiClient WithToken(string token)
    {
        _http.DefaultRequestHeaders.Remove("Authorization");
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {token}");
        return this;
    }

    public ApiClient WithoutToken()
    {
        _http.DefaultRequestHeaders.Remove("Authorization");
        return this;
    }
}

public class LoginResult
{
    [JsonProperty("access_token")]
    public string? AccessToken { get; set; }

    [JsonProperty("refresh_token")]
    public string? RefreshToken { get; set; }

    [JsonProperty("token_type")]
    public string? TokenType { get; set; }
}
