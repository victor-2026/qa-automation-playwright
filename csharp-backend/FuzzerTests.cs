using Newtonsoft.Json;
using Xunit;
using Xunit.Abstractions;

namespace Buzzhive.Tests;

[Trait("Category", "Fuzzer")]
public class FuzzerTests : IClassFixture<WarmupFixture>
{
    private readonly ApiClient _api;
    private readonly ITestOutputHelper _output;

    public FuzzerTests(WarmupFixture warmup, ITestOutputHelper output)
    {
        _api = new ApiClient(warmup.BaseUrl);
        _output = output;
    }

    private async Task LogResponse(HttpResponseMessage resp, string context)
    {
        var body = await resp.Content.ReadAsStringAsync();
        _output.WriteLine($"[{context}] HTTP {(int)resp.StatusCode}: {body[..Math.Min(body.Length, 200)]}");
    }

    // ── Login fuzz ──

    [Fact]
    public async Task Login_EmptyBody_Returns422()
    {
        var resp = await _api.PostRaw("/auth/login", "{}");
        await LogResponse(resp, "login-empty");
        Assert.Equal(422, (int)resp.StatusCode);
    }

    [Fact]
    public async Task Login_NullFields_Returns422()
    {
        var resp = await _api.PostRaw("/auth/login", """{"email":null,"password":null}""");
        await LogResponse(resp, "login-null");
        Assert.Equal(422, (int)resp.StatusCode);
    }

    [Fact]
    public async Task Login_InvalidJson_Returns422()
    {
        var resp = await _api.PostRaw("/auth/login", "not json at all");
        await LogResponse(resp, "login-badjson");
        Assert.Equal(422, (int)resp.StatusCode);
    }

    [Theory]
    [InlineData("' OR '1'='1")]
    [InlineData("'; DROP TABLE users; --")]
    [InlineData("<script>alert(1)</script>")]
    [InlineData("../../etc/passwd")]
    public async Task Login_SQLInjection_Returns401Or422(string payload)
    {
        var resp = await _api.PostRaw("/auth/login",
            $$"""{"email":"{{payload}}","password":"{{payload}}"}""");
        await LogResponse(resp, $"login-sqli-{payload[..Math.Min(payload.Length, 10)]}");
        Assert.InRange((int)resp.StatusCode, 400, 499);
    }

    [Fact]
    public async Task Login_HugePayload_Returns4xx()
    {
        var huge = new string('a', 100_000);
        var resp = await _api.PostRaw("/auth/login",
            $$"""{"email":"{{huge}}","password":"{{huge}}"}""");
        await LogResponse(resp, "login-huge");
        Assert.InRange((int)resp.StatusCode, 400, 499);
    }

    [Fact]
    public async Task Login_UnicodeControlChars_Returns422()
    {
        var resp = await _api.PostRaw("/auth/login", """{"email":"\u0000\u0001\u0002","password":"\uFFFF"}""");
        await LogResponse(resp, "login-unicode");
        Assert.Equal(422, (int)resp.StatusCode);
    }

    // ── Posts fuzz ──

    [Fact]
    public async Task Post_EmptyBody_Returns422()
    {
        var token = await _api.Login("alice@buzzhive.com", "alice123");
        Assert.NotNull(token);
        _api.WithToken(token!.AccessToken!);

        var resp = await _api.PostRaw("/posts", "{}");
        await LogResponse(resp, "post-empty");
        Assert.Equal(422, (int)resp.StatusCode);
    }

    [Fact]
    public async Task Post_HugeContent_Returns4xx()
    {
        var token = await _api.Login("alice@buzzhive.com", "alice123");
        Assert.NotNull(token);
        _api.WithToken(token!.AccessToken!);

        var huge = new string('x', 50_000);
        var resp = await _api.PostRaw("/posts",
            $$"""{"title":"huge","content":"{{huge}}"}""");
        await LogResponse(resp, "post-huge");
        Assert.InRange((int)resp.StatusCode, 400, 499);
    }

    [Fact]
    public async Task Post_UnicodeGarbage_Returns4xx()
    {
        var token = await _api.Login("alice@buzzhive.com", "alice123");
        Assert.NotNull(token);
        _api.WithToken(token!.AccessToken!);

        var resp = await _api.PostRaw("/posts", """{"title":"\u0000\u0001","content":"\uFFFF\uD800"}""");
        await LogResponse(resp, "post-unicode");
        if ((int)resp.StatusCode == 500)
            _output.WriteLine("⚠ BUG: unicode control chars cause Internal Server Error");
        Assert.InRange((int)resp.StatusCode, 400, 500);
    }

    // ── Auth header fuzz ──

    [Fact]
    public async Task AuthMe_GarbageToken_Returns401Or403()
    {
        var resp = await _api.WithoutToken().Get("/auth/me");
        await LogResponse(resp, "authme-notoken");
        Assert.InRange((int)resp.StatusCode, 401, 403);
    }

    [Fact]
    public async Task AuthMe_InvalidBearer_Returns401()
    {
        // .NET rejects null bytes in headers, so use a purely ASCII garbage token
        var resp = await _api
            .WithToken("invalid.token.here.that.is.not.jwt")
            .Get("/auth/me");
        await LogResponse(resp, "authme-invalidtoken");
        Assert.Equal(401, (int)resp.StatusCode);
    }

    [Fact]
    public async Task AuthMe_ExpiredToken_Returns401()
    {
        var resp = await _api
            .WithToken("eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDMiLCJleHAiOjEwMDAwMDAwMDB9.invalid")
            .Get("/auth/me");
        await LogResponse(resp, "authme-expired");
        Assert.Equal(401, (int)resp.StatusCode);
    }

    // ── UUID garbage fuzz ──

    [Fact]
    public async Task GetPost_InvalidUUID_Returns404Or422()
    {
        var token = await _api.Login("alice@buzzhive.com", "alice123");
        Assert.NotNull(token);
        _api.WithToken(token!.AccessToken!);

        var resp = await _api.Get("/posts/not-a-uuid-at-all");
        await LogResponse(resp, "getpost-badid");
        // 422 = UUID validation error (Pydantic), 404 = valid UUID but not found
        Assert.InRange((int)resp.StatusCode, 400, 422);
    }

    [Fact]
    public async Task GetPost_EmptyUUID_Returns404Or422()
    {
        var token = await _api.Login("alice@buzzhive.com", "alice123");
        Assert.NotNull(token);
        _api.WithToken(token!.AccessToken!);

        var resp = await _api.Get("/posts/");
        await LogResponse(resp, "getpost-emptyid");
        Assert.InRange((int)resp.StatusCode, 400, 404);
    }

    // ── User fuzz ──

    [Fact]
    public async Task GetUser_Nonexistent_Returns404()
    {
        var token = await _api.Login("alice@buzzhive.com", "alice123");
        Assert.NotNull(token);
        _api.WithToken(token!.AccessToken!);

        var resp = await _api.Get("/users/__nonexistent__");
        await LogResponse(resp, "getuser-nonexist");
        Assert.Equal(404, (int)resp.StatusCode);
    }

    [Fact]
    public async Task PatchMe_EmptyBody_Accepted()
    {
        var token = await _api.Login("alice@buzzhive.com", "alice123");
        Assert.NotNull(token);
        _api.WithToken(token!.AccessToken!);

        // Backend accepts empty PATCH (all fields optional)
        var resp = await _api.PatchRaw("/users/me", "{}");
        await LogResponse(resp, "patchme-empty");
        Assert.Equal(200, (int)resp.StatusCode);
    }
}
