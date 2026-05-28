using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Xunit;

namespace Buzzhive.Tests;

[Trait("Category", "Schema")]
public class SchemaTests : IClassFixture<WarmupFixture>
{
    private readonly ApiClient _api;

    public SchemaTests(WarmupFixture warmup)
    {
        _api = new ApiClient(warmup.BaseUrl);
    }

    // ── Helpers ──

    private async Task<string> Login()
    {
        var token = await _api.Login("alice@buzzhive.com", "alice123");
        Assert.NotNull(token);
        return token!.AccessToken!;
    }

    private static async Task<JObject> ParseJson(HttpResponseMessage resp)
    {
        var raw = await resp.Content.ReadAsStringAsync();
        return JObject.Parse(raw);
    }

    private static async Task<JArray> ParseArray(HttpResponseMessage resp)
    {
        var raw = await resp.Content.ReadAsStringAsync();
        return JArray.Parse(raw);
    }

    // ── 1. Login response schema ──

    [Fact]
    public async Task Schema_LoginResponse()
    {
        var dict = await _api.LoginToDict("alice@buzzhive.com", "alice123");

        Assert.True(dict.ContainsKey("access_token"));
        Assert.True(dict.ContainsKey("refresh_token"));
        Assert.True(dict.ContainsKey("token_type"));

        Assert.IsType<string>(dict["access_token"]);
        Assert.IsType<string>(dict["refresh_token"]);
        Assert.IsType<string>(dict["token_type"]);

        Assert.NotEmpty((string)dict["access_token"]!);
        Assert.NotEmpty((string)dict["refresh_token"]!);
        Assert.Equal("bearer", ((string)dict["token_type"]!).ToLowerInvariant());

        // JWT format: header.payload.signature
        var parts = ((string)dict["access_token"]!).Split('.');
        Assert.Equal(3, parts.Length);
    }

    // ── 2. Profile response schema ──

    [Fact]
    public async Task Schema_ProfileResponse()
    {
        var token = await Login();
        _api.WithToken(token);

        var resp = await _api.Get("/auth/me");
        Assert.Equal(200, (int)resp.StatusCode);

        var json = await ParseJson(resp);

        // Required fields: id, email, username, role
        Assert.NotNull(json["id"]);
        Assert.NotNull(json["email"]);
        Assert.NotNull(json["username"]);
        Assert.NotNull(json["role"]);

        Assert.Equal(JTokenType.String, json["id"]!.Type);
        Assert.Equal(JTokenType.String, json["email"]!.Type);
        Assert.Equal(JTokenType.String, json["username"]!.Type);
        Assert.Equal(JTokenType.String, json["role"]!.Type);

        Assert.NotEmpty(json["id"]!.ToString());
        Assert.NotEmpty(json["email"]!.ToString());
        Assert.NotEmpty(json["username"]!.ToString());
        Assert.NotEmpty(json["role"]!.ToString());

        // Optional but typed fields
        Assert.NotNull(json["display_name"]);
        Assert.NotNull(json["is_active"]);
        Assert.NotNull(json["is_verified"]);
        Assert.NotNull(json["is_private"]);

        Assert.Equal(JTokenType.Boolean, json["is_active"]!.Type);
        Assert.Equal(JTokenType.Boolean, json["is_verified"]!.Type);
        Assert.Equal(JTokenType.Boolean, json["is_private"]!.Type);
    }

    // ── 3. Posts list response schema ──

    [Fact]
    public async Task Schema_PostsListResponse()
    {
        var token = await Login();
        _api.WithToken(token);

        var resp = await _api.Get("/posts");
        Assert.Equal(200, (int)resp.StatusCode);

        var json = await ParseJson(resp);

        // Paginated response: items, total, page, per_page, pages
        Assert.NotNull(json["items"]);
        Assert.NotNull(json["total"]);
        Assert.NotNull(json["page"]);

        Assert.Equal(JTokenType.Array, json["items"]!.Type);
        Assert.Equal(JTokenType.Integer, json["total"]!.Type);

        if (json["items"]!.HasValues)
        {
            var first = json["items"]![0]!;
            Assert.NotNull(first["id"]);
            Assert.NotNull(first["content"]);
            Assert.NotNull(first["author"]);
            Assert.Equal(JTokenType.String, first["id"]!.Type);
            Assert.Equal(JTokenType.String, first["content"]!.Type);
            Assert.Equal(JTokenType.Object, first["author"]!.Type);
            Assert.NotEmpty(first["id"]!.ToString());
        }
    }

    // ── 4. Post detail response schema ──

    [Fact]
    public async Task Schema_PostDetailResponse()
    {
        var token = await Login();
        _api.WithToken(token);

        // Create a post first
        var body = new { title = "Schema Test Post", content = "Testing schema validation" };
        var createResp = await _api.Post("/posts", body);
        Assert.Equal(201, (int)createResp.StatusCode);

        var createJson = await ParseJson(createResp);
        var postId = createJson["id"]?.ToString();
        Assert.NotNull(postId);

        // Get post by ID
        var getResp = await _api.Get($"/posts/{postId}");
        Assert.Equal(200, (int)getResp.StatusCode);

        var json = await ParseJson(getResp);

        Assert.NotNull(json["id"]);
        Assert.NotNull(json["content"]);
        Assert.NotNull(json["author"]);

        Assert.Equal(postId, json["id"]!.ToString());
        Assert.NotNull(json["content"]);
        Assert.NotEmpty(json["content"]!.ToString());

        // author is an object with at least id, username, display_name
        Assert.Equal(JTokenType.Object, json["author"]!.Type);
        Assert.NotNull(json["author"]!["id"]);
        Assert.NotNull(json["author"]!["username"]);
        Assert.NotNull(json["author"]!["display_name"]);

        // Cleanup
        var delResp = await _api.Delete($"/posts/{postId}");
        Assert.Equal(204, (int)delResp.StatusCode);
    }

    // ── 5. Health response schema ──

    [Fact]
    public async Task Schema_HealthResponse()
    {
        var resp = await _api.Get("/health");
        Assert.Equal(200, (int)resp.StatusCode);

        var json = await ParseJson(resp);

        Assert.NotNull(json["status"]);
        Assert.NotNull(json["database"]);

        Assert.Equal(JTokenType.String, json["status"]!.Type);
        Assert.Equal(JTokenType.String, json["database"]!.Type);

        Assert.Equal("healthy", json["status"]!.ToString().ToLowerInvariant());
        Assert.Equal("connected", json["database"]!.ToString().ToLowerInvariant());
    }
}
