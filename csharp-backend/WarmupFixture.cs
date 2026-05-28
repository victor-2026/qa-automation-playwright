using Xunit;

namespace Buzzhive.Tests;

public class WarmupFixture
{
    public string BaseUrl { get; }

    public WarmupFixture()
    {
        BaseUrl = Environment.GetEnvironmentVariable("API_BASE_URL")
                  ?? "http://localhost:8000/api";
        WarmUp(BaseUrl.TrimEnd('/') + "/health").GetAwaiter().GetResult();
    }

    private static async Task WarmUp(string healthUrl)
    {
        using var http = new HttpClient { Timeout = TimeSpan.FromSeconds(30) };
        for (var i = 0; i < 3; i++)
        {
            try
            {
                var resp = await http.GetAsync(healthUrl);
                if (resp.IsSuccessStatusCode) return;
            }
            catch
            {
                // retry
            }
            await Task.Delay(2000);
        }
    }
}
