# Tech Stack Translation: Playwright Migration Rule

## 🎯 Objective
Translate all existing web automation test patterns from Python/TypeScript Playwright into native, type-safe Go and C# (.NET) Playwright implementations.

## 🚀 1. Go Playwright Requirements
When writing or porting tests to Go, use the official `playwright-go` library.
- **Framework**: Use the standard Go `testing` package or `stretchr/testify` for assertions.
- **Concurrency**: Leverage Go routines and channel sync patterns for parallel execution runner setups.
- **Pattern Structure**: 
  ```go
  package main_test

  import (
      "testing"
      "github.com/playwright-community/playwright-go"
      "github.com/stretchr/testify/assert"
  )

  func TestLoginFlow(t *testing.T) {
      pw, err := playwright.Run()
      assert.NoError(t, err)
      defer pw.Stop()

      browser, err := pw.Chromium.Launch(playwright.BrowserTypeLaunchOptions{
          Headless: playwright.Bool(true),
      })
      assert.NoError(t, err)
      defer browser.Close()

      page, err := browser.NewPage()
      assert.NoError(t, err)

      _, err = page.Goto("http://localhost:3000/login")
      assert.NoError(t, err)
      
      // Strict Locator Strategy
      err = page.Locator("input[name='user']").Fill("test_user")
      assert.NoError(t, err)
  }
  ```

## ⚡ 2. C# (.NET) Playwright Requirements
When writing or porting tests to C#, use the Microsoft Playwright ecosystem.
- **Framework**: Use **NUnit** or **xUnit** as the primary test runner.
- **Async Pattern**: Every single interaction call must use `async/await` syntax explicitly.
- **Pattern Structure**:
  ```csharp
  using Microsoft.Playwright.NUnit;
  using Microsoft.Playwright;
  using NUnit.Framework;

  namespace QASandbox.Tests;

  [TestFixture]
  public class LoginTests : PageTest
  {
      [Test]
      public async Task TestLoginFlowAsync()
      {
          await Page.GotoAsync("http://localhost:3000/login");
          
          // Strict Locator Strategy
          var usernameInput = Page.Locator("input[name='user']");
          await usernameInput.FillAsync("test_user");

          // Web Assertions
          await Expect(Page.Locator(".dashboard-welcome")).ToBeVisibleAsync();
      }
  }
  ```

## ⚠️ Absolute Constraints
1. **No Python or TS:** Do not write any new tests using `.py`, `.ts`, or `.js` files. Any requests to update tests must happen strictly inside the language of the targeted microservice folder (`Go Services` or `C# Services`).
2. **Auto-Install Dependencies:** Before running test pipelines via worktrees, ensure the agent executes `go get ://github.com` or `dotnet add package Microsoft.Playwright.NUnit` to prevent compilation breaks.
