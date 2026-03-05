# MS 365 MCP Server — Security & Alternatives Report

**Prepared:** March 3, 2026
**Purpose:** Due diligence before deploying on your organization's business Mac computers
**Prepared by:** Claude Code research (7 parallel research agents, 50+ sources)

---

## Executive Summary

**Recommendation: Stay with Softeria `@softeria/ms-365-mcp-server`, but harden the deployment.**

Softeria is the most actively maintained, most widely adopted, and most purpose-built MS 365 MCP server available. No alternative is better for your use case (email, calendar, Teams, SharePoint, OneDrive on work/school accounts). The alternatives either lack features, are stale, route data through third-party clouds, or cost money.

The risks are real but manageable. The biggest concern is **not the MCP server itself** — it's the inherent fact that data accessed via MCP gets sent to Anthropic's API for processing. Your emails, calendar entries, and files will transit Anthropic's infrastructure. This is true regardless of which MCP server you use.

---

## Part 1: Softeria Deep-Dive

### Who Makes It

| Detail | Value |
|--------|-------|
| **Company** | Softeria AS (org #930796352) |
| **Location** | Alesund, Norway |
| **Incorporated** | January 18, 2023 |
| **Primary developer** | Eirik Brandtzaeg (GitHub: `eirikb`, 15+ year history, 110+ repos) |
| **Team** | 3 shareholders (Terje Woldseth 38%, Christian Hormazabal Martin 34%, Eirik Brandtzaeg 28%) |
| **License** | MIT (fully open-source, auditable) |

**Assessment:** Small Norwegian software consultancy. Single primary developer with a long, public track record. Not a large company with a security team — but the code is open-source, auditable, and the developer is responsive.

### GitHub & npm Stats

| Metric | Value |
|--------|-------|
| **GitHub stars** | 502 |
| **Forks** | 175 |
| **Contributors** | 27 |
| **Open issues** | ~15 (mostly feature requests) |
| **Last commit** | March 3, 2026 (today) |
| **npm version** | 0.44.0 |
| **Total releases** | ~110 |
| **Weekly downloads** | 6,099 |
| **Monthly downloads** | 23,625 |

### Security Model

**Authentication:** Device code flow (OAuth 2.0) via Microsoft's own MSAL library (`@azure/msal-node`). This is the same authentication library Microsoft recommends for all Graph API integrations.

**Token storage priority:**
1. **macOS Keychain** via `keytar` (encrypted, OS-protected) ← preferred path
2. **File-based fallback** with `0600` permissions if keytar unavailable

**Default Azure app registration:** The server ships with Softeria's pre-registered Entra app (`084a3e9f-a9f4-43f7-89f9-d229cf97853e`). When users authenticate, they grant permissions to this Softeria-controlled app. **This is the single biggest security consideration.**

**Graph API scopes requested (org-mode):** 31 total scopes including `Group.ReadWrite.All` (broad). Can be reduced with `--preset` or `--enabled-tools` flags.

**Built-in security controls:**
- `--read-only` mode (blocks all write operations)
- `--preset <category>` (only load scopes for specific services)
- `--enabled-tools <regex>` (filter which tools are exposed)
- Multi-account support with per-account scoping

### Data Handling

- **No telemetry.** Zero phone-home, analytics, or tracking code found in source.
- **No third-party data routing.** Data flows: `local machine → Microsoft Graph API → local machine`. The MCP server is a local process (stdio transport).
- **BUT:** Data retrieved via MCP is sent to Anthropic's API as conversation context. This is inherent to using Claude Code, not specific to MCP.

### Known Vulnerabilities

- **No CVEs** filed against this package.
- **No security advisories** on the GitHub repo.
- **npm supply chain risk** is the primary concern (see Part 3).

### Dependencies (Clean)

| Package | Purpose |
|---------|---------|
| `@azure/msal-node` | Microsoft's official auth library |
| `@modelcontextprotocol/sdk` | Official MCP SDK |
| `@toon-format/toon` | Token-efficient output format |
| `commander` | CLI argument parsing |
| `dotenv` | Environment variable loading |
| `express` | HTTP server (for HTTP mode) |
| `js-yaml` | YAML parsing |
| `winston` | Logging |
| `zod` | Schema validation |

**Optional:** `keytar` (OS credential store), `@azure/identity` + `@azure/keyvault-secrets` (Azure Key Vault)

All critical auth libraries are from Microsoft's official SDKs. No suspicious or obscure dependencies.

---

## Part 2: Alternatives Comparison

### The Landscape

I researched **every MS 365 MCP server** available — official Microsoft options, community servers, and commercial platforms. Here's the full picture.

### Tier 1: Serious Contenders

#### Lokka (by Merill Fernando, Microsoft PM)

| Metric | Value |
|--------|-------|
| **GitHub** | 222 stars, 68 forks |
| **npm** | `@merill/lokka` v0.3.0 |
| **Last npm publish** | July 15, 2025 (8 months ago) |
| **Last commit** | October 2025 (typo fix) |
| **Auth** | 4 modes: interactive, client secret, certificate, client token |
| **Design** | 1 generic Graph API tool (AI constructs raw API calls) |

**The good:** Built by a Microsoft PM who deeply knows Graph API. Supports client credentials (service-to-service auth). Zero telemetry, tokens stored in memory only (no disk persistence).

**The bad:** Explicitly states in FAQ "NOT production-ready." Development has stalled — no releases in 8 months, open issues unanswered. The single-tool architecture means the AI must guess Graph API endpoints — no guardrails, no input validation per operation. The AI can call any Graph endpoint, including destructive ones.

**Verdict:** Not recommended. Proof-of-concept that got popular. Softeria is safer, more reliable, and actively maintained.

#### PnP CLI for Microsoft 365 MCP Server

| Metric | Value |
|--------|-------|
| **GitHub** | 86 stars, 20 forks |
| **npm** | `@pnp/cli-microsoft365-mcp-server` v0.1.17 |
| **Last updated** | January 2026 |
| **Auth** | Separate `m365 login` via CLI for Microsoft 365 |
| **Design** | 3 tools: search commands, get docs, execute command |

**The good:** Wraps the battle-tested CLI for Microsoft 365 (8+ years old, 800+ commands, 65K monthly downloads). Covers admin operations Softeria doesn't touch — Power Automate, Entra ID, SPFx, tenant reporting. Backed by PnP community (Microsoft-adjacent, led by Microsoft PMs and MVPs). New v9 has each tenant creating its own Entra app (more secure).

**The bad:** The AI has to search for commands, read docs, then construct CLI strings — minimum 3 tool calls per operation vs. 1 with Softeria. 26x fewer downloads than Softeria. PnP team recommends Claude Sonnet 4+ for "best results" — implying lesser models struggle.

**Verdict:** Not a replacement for Softeria, but could run alongside it for admin operations. Consider adding it later if you need Power Automate management or tenant reporting.

#### Composio (Commercial, SOC 2)

| Metric | Value |
|--------|-------|
| **GitHub** | 26,500+ stars (whole platform) |
| **Type** | Cloud gateway (data routes through Composio's servers) |
| **SOC 2** | Claims Type 2 via Vanta trust center |
| **Pricing** | Free: 100 actions/mo, Starter: $49/mo, Growth: $149/mo |
| **Funding** | $29M (Lightspeed, Elevation Capital) |

**The good:** Only option with SOC 2 certification. 300+ app integrations. Professional setup with RBAC, audit trails, sandboxed execution.

**The bad:** **All data routes through Composio's cloud servers.** Your emails, calendars, and files would transit a third-party cloud -- a meaningful security downgrade from Softeria's direct-to-Microsoft local architecture. Free tier (100 actions/mo) is unusable for real work. Setup requires Python SDK, API key, generated URLs — much more complex than Softeria's single JSON block. SharePoint coverage is thin (6 tools vs. Softeria's deeper Graph coverage). 2.5-year-old startup — if they pivot or fold, your integration breaks.

**Verdict:** Only makes sense if SOC 2 certification is a hard requirement from your IT team. Otherwise, Softeria is simpler, cheaper (free), and keeps data local.

### Tier 2: Not Viable

| Server | Stars | Why Not |
|--------|-------|---------|
| **Microsoft MCP Server (Preview)** | 2,690 | Read-only, Entra ID admin only — no email, no calendar, no files |
| **Microsoft Agent 365** | N/A | Requires M365 gateway + Agent 365 SDK — not a drop-in MCP server |
| **elyxlz/microsoft-mcp** | 39 | Python, narrow scope (mail/calendar only), tiny community |
| **Aanerud/MCP-Microsoft-Office** | 37 | Too small, unproven |
| **DynamicEndpoints/m365-core-mcp** | 15 | Experimental, auto-generated tools = unpredictable |
| **MintMCP** | N/A | SOC 2, but Outlook-only and opaque pricing |
| **CData** | N/A | SQL-over-Graph API — wrong abstraction for productivity tasks |

### Head-to-Head Summary

| Dimension | Softeria | Lokka | PnP CLI | Composio |
|-----------|----------|-------|---------|----------|
| **Active development** | Releases weekly | Stalled 8 months | Quarterly | Active |
| **M365 tool coverage** | 90+ specialized tools | 1 generic tool | 800+ CLI commands (indirect) | Split across 4+ toolkits |
| **Data routing** | Local → Microsoft | Local → Microsoft | Local → Microsoft | Local → Composio Cloud → Microsoft |
| **Setup complexity** | 1 JSON block | 1 JSON block | Global CLI install + setup wizard + login | Python SDK + API key + script |
| **Cost** | Free | Free | Free | $49+/mo for real use |
| **SOC 2** | No | No | No | Yes (claimed) |
| **Work/school accounts** | `--org-mode` flag | `common` tenant | Per-tenant app | Via Connect Links |
| **Reliability for AI** | High (typed tools) | Low (raw API) | Medium (command guessing) | High (typed tools) |
| **Monthly npm downloads** | 23,625 | N/A | 891 | N/A |

---

## Part 3: MCP Security Landscape — What You Need to Know

### Real, Documented Attacks

These are not theoretical — they have happened:

1. **Tool Poisoning (Invariant Labs):** Malicious MCP server silently exfiltrated a user's entire WhatsApp history by injecting crafted tool descriptions.

2. **Malicious MCP on npm (Semgrep):** `postmark-mcp` package silently BCC'd all emails to an attacker's server. First confirmed malicious MCP server.

3. **Anthropic's Own MCP Server Had Bugs:** Three vulnerabilities in `mcp-server-git` (CVE-reported, fixed December 2025) allowed remote code execution via prompt injection.

4. **EchoLeak (CVE-2025-32711):** Hidden prompts in a Word document could exfiltrate data when Microsoft 365 Copilot summarized the document.

5. **npm Supply Chain Attack (September 2025):** CISA advisory. Compromised packages including `chalk`, `debug`, `ansi-styles` — billions of weekly downloads affected. These are transitive dependencies of the MCP TypeScript SDK.

### Astrix Security Analysis (5,200+ MCP Servers Studied)

- **88%** require credentials
- **53%** rely on insecure, long-lived static secrets
- **Only 8.5%** use OAuth
- **36.7%** have latent SSRF exposure
- **22%** allow file access outside intended boundaries

### Anthropic's Official Position

> "MCP enables powerful capabilities through arbitrary data access and code execution paths, and with this power comes important security and trust considerations."

The protocol does **not enforce security** — it provides guidance. Community servers are "untested and should be used at your own risk, not affiliated with or endorsed by Anthropic."

### The Data Flow You Must Explain

```
Claude Code (local)
  → MCP server (local process, stdio)
    → Microsoft Graph API (Microsoft's cloud)
    ← Response data (emails, calendar, files)
  ← Data back to Claude Code
    → Sent to Anthropic's API for LLM processing  ← THIS IS THE KEY POINT
```

Your business data (email content, calendar entries, file contents) will transit Anthropic's infrastructure. This is inherent to using any cloud AI assistant -- not specific to MCP or Softeria. Your organization should review Anthropic's data retention and privacy policies.

---

## Part 4: Mac Dependencies & Setup Guide

### Complete Dependency List

| # | Dependency | Required? | How to Install | Notes |
|---|-----------|-----------|----------------|-------|
| 1 | **Homebrew** | Prerequisite | Already installed | Assumed per your scenario |
| 2 | **Node.js 18+** (recommend 22 LTS) | **Required** | `brew install node` | Provides `node` and `npm` |
| 3 | **npm** | **Required** | Bundled with Node.js | No separate install |
| 4 | **Xcode Command Line Tools** | Recommended | `xcode-select --install` | Likely already installed (Homebrew requires it). Safety net if keytar prebuilt download fails |
| 5 | **keytar 7.9.0** | Optional (auto-installed) | Part of npm install | Prebuilt binary exists for Apple Silicon (darwin-arm64). Graceful fallback to file storage if unavailable |
| 6 | **Claude Code** | **Required** | `curl -fsSL https://claude.ai/install.sh \| bash` | Does NOT need Node.js itself |
| 7 | **@softeria/ms-365-mcp-server** | **Required** | `npx -y @softeria/ms-365-mcp-server` | Auto-downloaded on first run |
| 8 | **Azure AD app registration** | Not required (built-in) | Built-in app included | Only needed if tenant blocks third-party apps |

### Node.js Engine Requirement

From the package's `package.json`:
```json
"engines": { "node": ">=18" }
```

README recommends Node.js 20+. Current LTS options: Node.js 22.x (Maintenance LTS) or 24.x (Active LTS).

### keytar on Apple Silicon — Confirmed Working

Prebuilt binary `keytar-v7.9.0-napi-v3-darwin-arm64.tar.gz` exists on the keytar releases page. No compilation needed on M1/M2/M3/M4 Macs. If the prebuilt download fails, it falls back to `node-gyp rebuild` (needs Xcode CLI Tools). If keytar fails entirely, the server gracefully falls back to file-based token storage with `0600` permissions.

### macOS Keychain Prompt

When keytar first stores a token, macOS will prompt: **"node wants to use the 'login' keychain"**. The user must click **"Always Allow"** to avoid repeated prompts. Document this in the setup guide.

### Step-by-Step Installation (Fresh Mac, Homebrew Installed)

```bash
# Step 1: Install Node.js
brew install node
node --version    # Should show v22.x or v24.x
npm --version     # Should show 10.x+

# Step 2: Install Claude Code
curl -fsSL https://claude.ai/install.sh | bash
claude --version

# Step 3: Verify Xcode CLI Tools (safety net for keytar)
xcode-select --install
# "already installed" is fine

# Step 4: Test MCP server install
npx -y @softeria/ms-365-mcp-server --version
# First run downloads everything. Watch for keytar warnings.

# Step 5: Authenticate with Microsoft 365
npx -y @softeria/ms-365-mcp-server --login
# 1. Displays a URL and code
# 2. Open URL in browser
# 3. Enter code, sign in with M365 work account
# 4. Token stored in macOS Keychain
# NOTE: Click "Always Allow" on Keychain prompt

# Step 6: Verify login
npx -y @softeria/ms-365-mcp-server --verify-login

# Step 7: Configure Claude Code (from project directory)
claude mcp add ms365 -- npx -y @softeria/ms-365-mcp-server --org-mode

# Step 8: Launch and verify
claude
# Inside Claude Code: /mcp → should show ms365 connected
```

### Potential Failure Points

| Issue | Likelihood | Mitigation |
|-------|-----------|------------|
| Keytar prebuilt download fails | Low | Xcode CLI Tools installed = node-gyp can build from source |
| Tenant blocks built-in app consent | **Medium** | Create custom Azure AD app registration with admin consent |
| Tokens lost on npx package update | Low (if Keychain works) | Set `MS365_MCP_TOKEN_CACHE_PATH` as insurance |
| "node wants to use keychain" confuses user | Medium | Document it — click "Always Allow" |
| Node.js version too old | Low | `brew install node` gets latest |

---

## Part 5: Recommended Hardening for Deployment

### Must-Do (Before Tomorrow)

1. **Pin the npm version.** Change from `npx -y @softeria/ms-365-mcp-server` to `npx -y @softeria/ms-365-mcp-server@0.44.0`. This prevents auto-updating to a potentially compromised version.

2. **Give them full power.** Use `--org-mode` with all tools enabled -- no `--preset` or `--read-only` restrictions. Your organization needs the full 90+ tool set (email, calendar, Teams, SharePoint, OneDrive, Planner, Excel, etc.) to get real value from the integration.

3. **Set token cache path.** Add environment variable so tokens persist across npx updates:
   ```bash
   export MS365_MCP_TOKEN_CACHE_PATH="$HOME/.config/ms365-mcp/.token-cache.json"
   ```

5. **Verify keytar works on their Macs.** After install, confirm tokens are in Keychain, not file-based fallback. Check for the "node wants to use keychain" prompt.

### Should-Do (When Your IT Admin Is Available)

6. **Register your own Azure AD app** in your Entra ID tenant. Set `MS365_MCP_CLIENT_ID` in the MCP config. This removes Softeria's default app from the trust chain entirely.

7. **Set Conditional Access policies** in M365 admin to restrict the app by location, device compliance, and MFA requirements.

8. **Monitor Azure AD sign-in logs** for the registered app to audit who's using it and when.

### Good Practice (Ongoing)

9. **Run `npm audit`** before deployment and periodically after.

10. **Review Anthropic's data policies** and confirm your organization is comfortable with business data transiting Anthropic's infrastructure.

11. **Consider the PnP CLI MCP server alongside Softeria** if your organization later needs admin-level M365 management (Power Automate, Entra ID, tenant reporting). They can run side by side.

---

## Part 6: What to Tell Your Organization

### The Honest Pitch

"The Softeria MCP server is the most widely used, actively maintained, and purpose-built tool for connecting AI assistants to Microsoft 365. It's open-source, runs entirely on your local machine, and talks directly to Microsoft's Graph API using Microsoft's own authentication library. Your credentials are stored in macOS Keychain.

The main thing to understand is that when Claude Code reads your email or calendar through this tool, that content becomes part of the AI conversation — which means it's processed by Anthropic's servers. This is true of any AI assistant that accesses your data, not just this tool.

We can lock it down further by limiting which operations are allowed, using read-only mode, and registering our own app in your Azure AD so you control the permissions entirely."

### If They Ask About Risks

Be honest about:
- **npm supply chain** — real attacks have happened (September 2025 CISA advisory). We mitigate by pinning versions.
- **Data flows to Anthropic** — inherent to using Claude Code, not specific to this MCP server.
- **Single developer** — Softeria is primarily maintained by one person. MIT license means it can be forked if needed.
- **No SOC 2** — if that's a hard requirement, Composio ($49+/mo) is the only certified alternative, but it routes data through their cloud.

---

## Sources

### Softeria
- [GitHub Repository](https://github.com/Softeria/ms-365-mcp-server)
- [npm Package](https://www.npmjs.com/package/@softeria/ms-365-mcp-server)
- [Softeria AS (Norwegian business registry)](https://forvalt.no/Nettbutikk/produkter/930796352)

### Alternatives
- [Lokka GitHub](https://github.com/merill/lokka) | [lokka.dev](https://lokka.dev/docs/intro/)
- [PnP CLI MCP GitHub](https://github.com/pnp/cli-microsoft365-mcp-server) | [Docs](https://pnp.github.io/cli-microsoft365/user-guide/using-cli-mcp-server/)
- [Composio](https://composio.dev) | [Pricing](https://composio.dev/pricing) | [Trust Center](https://trust.composio.dev/)
- [Microsoft MCP Server (Preview)](https://learn.microsoft.com/en-us/graph/mcp-server/overview)
- [Microsoft Agent 365](https://learn.microsoft.com/en-us/microsoft-agent-365/tooling-servers-overview)
- [CData MCP for Office 365](https://www.cdata.com/drivers/office365/mcp/)
- [MintMCP](https://www.mintmcp.com/outlook)

### Security Research
- [Red Hat: MCP Security Risks](https://www.redhat.com/en/blog/model-context-protocol-mcp-understanding-security-risks-and-controls)
- [Pillar Security: MCP Risks](https://www.pillar.security/blog/the-security-risks-of-model-context-protocol-mcp)
- [Palo Alto Unit 42: MCP Attack Vectors](https://unit42.paloaltonetworks.com/model-context-protocol-attack-vectors/)
- [Semgrep: First Malicious MCP on npm](https://semgrep.dev/blog/2025/so-the-first-malicious-mcp-server-has-been-found-on-npm-what-does-this-mean-for-mcp-security/)
- [Astrix: State of MCP Server Security 2025](https://astrix.security/learn/blog/state-of-mcp-server-security-2025/)
- [CISA: npm Supply Chain Advisory](https://www.cisa.gov/news-events/alerts/2025/09/23/widespread-supply-chain-compromise-impacting-npm-ecosystem)
- [CoSAI: Practical Guide to MCP Security](https://www.coalitionforsecureai.org/securing-the-ai-agent-revolution-a-practical-guide-to-mcp-security/)
- [MCP Official Security Best Practices](https://modelcontextprotocol.io/specification/draft/basic/security_best_practices)
- [Anthropic MCP Git Server Flaws](https://thehackernews.com/2026/01/three-flaws-in-anthropic-mcp-git-server.html)

### Dependencies
- [keytar GitHub releases](https://github.com/atom/node-keytar/releases/tag/v7.9.0)
- [Node.js release schedule](https://nodejs.org/en/about/previous-releases)
