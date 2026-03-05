# Microsoft Development Environment Setup (Windows)

Set up Windows for Power Automate, Copilot Studio, and Microsoft Graph API development in VS Code with Claude Code.

## Prerequisites

### 1. Install .NET SDK 8.0+

Required by PAC CLI, Kiota CLI, and Dataverse MCP server.

Download from [dotnet.microsoft.com/download](https://dotnet.microsoft.com/download) and run the installer.

```powershell
dotnet --version
```

### 2. Install Node.js

Required for the MS 365 MCP server, Azure Functions Core Tools, Playwright, and Graph API SDKs. The MS 365 MCP server requires Node.js 20+.

Download from [nodejs.org](https://nodejs.org/) (LTS version) and run the installer.

```powershell
# Verify — should show v22.x or higher
node --version
npm --version
```

If Node.js is already installed at v22 or higher, skip this step.

## VS Code Extensions

### Essential (GA, production-ready)

| Extension | Marketplace ID | Status |
|-----------|---------------|--------|
| **Power Platform Tools** | `microsoft-IsvExpTools.powerplatform-vscode` | GA. 283K installs. Bundles PAC CLI. |
| **Copilot Studio** | `ms-CopilotStudio.vscode-copilotstudio` | GA (Jan 2026). Edit agents locally, Git version control. |
| **Azure Functions** | `ms-azuretools.vscode-azurefunctions` | GA. 5.8M installs. Local Azure Functions development. |

Install from the terminal:

```powershell
code --install-extension microsoft-IsvExpTools.powerplatform-vscode
code --install-extension ms-CopilotStudio.vscode-copilotstudio
code --install-extension ms-azuretools.vscode-azurefunctions
```

### Optional (Preview)

| Extension | Marketplace ID | Status |
|-----------|---------------|--------|
| **Kiota** | `ms-graph.kiota` | Public Preview. Generate type-safe Graph API clients. The Kiota CLI is GA — this VS Code extension is not yet. |

```powershell
code --install-extension ms-graph.kiota
```

**Note on Copilot Studio:** Agents must be created in the Copilot Studio portal first — the extension cannot create them from scratch. You clone existing agents locally for editing.

## CLI Tools

### Azure Functions Core Tools

```powershell
npm install -g azure-functions-core-tools@4

# Verify
func --version
```

### Kiota CLI (GA — stable, recommended over the Preview VS Code extension)

```powershell
dotnet tool install --global Microsoft.OpenApi.Kiota

# Verify
kiota --version
```

### Playwright (Browser Automation)

Enables Claude Code to control a browser — navigate websites, click buttons, fill forms, take screenshots. Used for automating web-based setup tasks, testing, and interacting with portals like Copilot Studio and Power Automate.

```powershell
npm install -g @anthropic-ai/claude-code-playwright

# Verify
npx playwright --version
```

After installing, install browser binaries:

```powershell
npx playwright install chromium
```

**Why this matters:** With Playwright, Claude Code can directly interact with Copilot Studio and Power Automate portals — creating agents, configuring flows, and verifying deployments without you needing to click through the UI manually.

## Node.js SDKs (Graph API)

Install per-project in your project directory:

```powershell
npm install @microsoft/microsoft-graph-client @microsoft/microsoft-graph-types @azure/msal-node @azure/identity
```

| Package | Version | Status | Purpose |
|---------|---------|--------|---------|
| **@microsoft/microsoft-graph-client** | 3.0.7 | GA | Microsoft Graph API client (official, production SDK) |
| **@microsoft/microsoft-graph-types** | — | GA | TypeScript type definitions for Graph API |
| **@azure/msal-node** | 5.0.5 | GA | OAuth 2.0 authentication flows |
| **@azure/identity** | 4.13.0 | GA | Simplified auth — auto-discovers credentials |

**Do NOT use `@microsoft/msgraph-sdk`** — it is the next-gen Kiota-based SDK but has never shipped a GA release (80+ preview versions). Microsoft's own docs still recommend `@microsoft/microsoft-graph-client` for production.

## MCP Servers for Claude Code

These let Claude Code interact directly with the Microsoft stack during development sessions.

### Microsoft 365 MCP (Email, Calendar, Teams, SharePoint, OneDrive)

**This is the primary MCP server.** Connects Claude Code to your full Microsoft 365 environment via the Microsoft Graph API.

**Package:** [`@softeria/ms-365-mcp-server`](https://github.com/Softeria/ms-365-mcp-server) (MIT license, 500+ GitHub stars, actively maintained)
**Requires:** Node.js 20+ (installed above)

#### What Claude Code Gets

| Category | Capabilities |
|----------|-------------|
| **Email** | Read, send, draft, manage folders, attachments |
| **Calendar** | List/create/update/delete events, calendar views, find meeting times |
| **OneDrive** | List, download, upload, delete files |
| **Excel** | Worksheet operations, ranges, charts, formatting |
| **Contacts** | Outlook contact management |
| **To Do** | Task CRUD |
| **Planner** | Task planning |
| **OneNote** | Notebooks, sections, pages |
| **Search** | Universal Microsoft Search |
| **Teams** | Channels, messages, replies |
| **SharePoint** | Sites, drives, lists |
| **Shared Mailboxes** | Delegated access |

90+ tools total — full read and write access.

#### Step 1: Authenticate

```powershell
npx -y @softeria/ms-365-mcp-server@0.44.0 --login
```

This uses **device code flow**:
1. Displays a code and a URL
2. Open your browser to `https://microsoft.com/devicelogin`
3. Paste the code and sign in with your M365 work/school account
4. Tokens are cached in Windows Credential Manager (auto-refresh)

No Azure AD app registration needed — the server uses a built-in app registration.

#### Step 2: Verify Login

```powershell
npx -y @softeria/ms-365-mcp-server@0.44.0 --verify-login
```

#### Step 3: Set Token Cache Path

So tokens persist across package updates, set these environment variables permanently:

```powershell
[Environment]::SetEnvironmentVariable("MS365_MCP_TOKEN_CACHE_PATH", "$env:USERPROFILE\.config\ms365-mcp\.token-cache.json", "User")
[Environment]::SetEnvironmentVariable("MS365_MCP_SELECTED_ACCOUNT_PATH", "$env:USERPROFILE\.config\ms365-mcp\.selected-account.json", "User")
```

Then create the directory and restart your terminal:

```powershell
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.config\ms365-mcp"
```

#### Step 4: Add to Claude Code

```powershell
claude mcp add ms365 -- npx -y @softeria/ms-365-mcp-server@0.44.0 --org-mode
```

The `--org-mode` flag enables work/school account features (Teams, SharePoint, shared mailboxes). Required for Microsoft 365 Business accounts.

#### Step 5: Verify in Claude Code

Launch Claude Code and run `/mcp` — you should see `ms365` in the server list.

#### What You Can Ask Claude Code After Setup

- "Show me all meetings this week"
- "Find a time that works for me and a coworker next Tuesday afternoon"
- "Show me unread emails from the last 24 hours"
- "Draft a follow-up email to a coworker about the sprint progress"
- "List recent files in my OneDrive folder"
- "Show recent messages in the Teams channel"
- "Upload this report to OneDrive"
- "Create a 30-minute meeting with the team tomorrow at 2pm"

#### Account Management

```powershell
# List all cached accounts
npx -y @softeria/ms-365-mcp-server@0.44.0 --list-accounts

# Switch between accounts
npx -y @softeria/ms-365-mcp-server@0.44.0 --select-account <accountId>

# Remove an account
npx -y @softeria/ms-365-mcp-server@0.44.0 --remove-account <accountId>

# Log out completely
npx -y @softeria/ms-365-mcp-server@0.44.0 --logout
```

#### Troubleshooting

**"Login required" errors** — Run `--login` again. Tokens may have expired if the machine was offline for an extended period.

**MCP server not appearing in `/mcp`** — Restart Claude Code completely. Run `npx -y @softeria/ms-365-mcp-server@0.44.0 --version` to confirm Node can find the package.

**"Admin approval required" or consent denied** — Your Entra admin has restricted third-party app consent. You'll need a custom Azure AD app registration with admin consent. See [SETUP-MS365-MCP.md](SETUP-MS365-MCP.md) for the custom app registration walkthrough.

#### Security Notes

- Tokens stored in **Windows Credential Manager** (OS-protected)
- Tokens auto-refresh but can be revoked with `--logout`
- The server runs **locally** — no data is sent to Softeria or any third party
- Data flows directly from your machine to Microsoft's Graph API
- Uses Microsoft's own MSAL authentication library (`@azure/msal-node`)
- All permissions are **delegated** — the server can only access what the signed-in user can access
- Version is **pinned to 0.44.0** to prevent unexpected updates
- For tighter control, your IT team can register their own Azure AD app (see [SETUP-MS365-MCP.md](SETUP-MS365-MCP.md))

---

### Microsoft Learn MCP (recommended — zero setup)

Free, no authentication, immediate value. Gives Claude Code access to all Microsoft documentation.

```powershell
claude mcp add-json microsoft-learn '{\"type\":\"sse\",\"url\":\"https://learn.microsoft.com/api/mcp\"}'
```

### PAC CLI MCP (Power Platform)

The Power Platform Tools extension installs PAC CLI automatically. Register its MCP server:

```powershell
claude mcp add-json pac-cli '{\"type\":\"stdio\",\"command\":\"pac\",\"args\":[\"copilot\",\"mcp\",\"--run\"]}'
```

Included with existing Power Platform licensing. No extra cost.

### Azure MCP Server (GA 1.0 — 170+ Azure tools)

Uses your existing Azure credentials (RBAC). No extra cost beyond standard Azure resource usage.

```powershell
code --install-extension ms-azuretools.vscode-azure-mcp-server
```

### Playwright MCP (Browser Control)

Gives Claude Code direct browser control — navigate, click, type, screenshot. Essential for interacting with Power Platform portals.

```powershell
claude mcp add playwright -- npx @anthropic-ai/claude-code-playwright
```

No authentication needed — Claude Code launches a local Chromium browser. You can watch it work in real time.

### Dataverse MCP (use with caution)

```powershell
dotnet tool install --global --add-source https://api.nuget.org/v3/index.json Microsoft.PowerPlatform.Dataverse.MCP
```

**Before deploying:** Dataverse MCP charges Copilot Credits ($0.01/call) when accessed from non-Copilot Studio agents like Claude Code. Requires:
- Power Platform Admin Center > Environments > Settings > Features > "Allow MCP clients to interact with Dataverse MCP server" enabled
- A Power Automate Dataverse connection configured
- .NET SDK 8.0

Discuss billing implications with your Microsoft licensing contact before rolling this out.

## Verify Everything

```powershell
Write-Host "=== .NET ===" ; dotnet --version
Write-Host "=== Node.js ===" ; node --version
Write-Host "=== npm ===" ; npm --version
Write-Host "=== Azure Functions ===" ; func --version
Write-Host "=== Kiota CLI ===" ; kiota --version
Write-Host "=== Playwright ===" ; npx playwright --version
Write-Host "=== VS Code Extensions ==="
code --list-extensions | Select-String -Pattern "powerplatform|copilotstudio|azurefunctions|kiota"
```

Expected: version numbers for .NET, Node, npm, func, kiota, and Playwright; extension IDs listed.

## Do NOT Install (Retiring Aug 2026)

- **Microsoft Graph CLI (`mgc`)** — use the Node.js SDK or Graph PowerShell instead
- **Microsoft Graph Toolkit (MGT)** — use the Graph SDKs directly
- **`@microsoft/msgraph-sdk`** (npm) — preview-only, never GA. Use `@microsoft/microsoft-graph-client` instead
