# PnP CLI for Microsoft 365 MCP Server — Deep-Dive Research

**Date:** March 3, 2026
**Purpose:** Evaluate for deployment on business Mac computers

---

## 1. How It Actually Works

The PnP CLI for Microsoft 365 MCP Server is a **three-tool MCP wrapper** around the CLI for Microsoft 365. The AI does NOT get direct access to 800+ commands as individual MCP tools. Instead, it gets three meta-tools and must figure out the right command through a search-then-execute workflow.

### The Three MCP Tools

| Tool | Purpose | What It Does |
|------|---------|-------------|
| `m365_search_commands` | Discover commands | Fuzzy search (Fuse.js) against a JSON index of all CLI commands. Weighted: name 0.7, description 0.3. Threshold 0.4. Returns up to 50 results. |
| `m365_get_command_docs` | Read command docs | Reads markdown documentation from the globally-installed `@pnp/cli-microsoft365` npm package on disk (`docs/docs/cmd/{path}`). |
| `m365_run_command` | Execute a command | Spawns a child process (`child_process.spawn()`) with a 120-second timeout. Auto-appends `--output json` or `--output csv`. Compacts JSON to reduce tokens. |

### Typical AI Interaction Flow

```
User: "Show me all SharePoint sites"
  AI → m365_search_commands("SharePoint sites list")
  AI ← Gets matching commands with names and descriptions
  AI → m365_get_command_docs("spo site list", "spo/site/site-list.mdx")
  AI ← Gets full docs with parameters, examples, options
  AI → m365_run_command("m365 spo site list")
  AI ← Gets JSON results
  AI → Presents results to user
```

This is fundamentally different from Softeria, where the AI calls a discrete, pre-defined tool like `list-mail-messages` with typed parameters.

### Source Architecture

- **Dependencies:** Only 2 runtime deps — `@modelcontextprotocol/sdk` and `fuse.js`
- **Unpacked size:** ~13 MB (mostly the bundled command index/docs)
- **Transport:** stdio (standard for MCP)
- **Execution:** The CLI itself runs as a subprocess, not imported as a library

---

## 2. Security Model

### Authentication Flow

The MCP server does **zero authentication**. It relies entirely on the CLI for Microsoft 365's existing auth.

```
Step 1: User runs "m365 setup" → Creates Entra ID app registration in their tenant
Step 2: User runs "m365 login" → Interactive device code flow (default)
Step 3: MCP server spawns CLI commands → They inherit the stored auth token
```

### Critical v9 Change (2025)

Starting with CLI for Microsoft 365 v9, the old shared multi-tenant PnP Management Shell app (`31359c7f-bd7e-475c-86db-fdb8c937548e`) was **deprecated and removed**. Every organization must now create their own single-tenant Entra ID app registration.

**This is actually good for your organization** -- it means:
- Your organization controls exactly what permissions are granted
- No shared multi-tenant app with broad permissions
- The `m365 setup` wizard creates the app automatically
- Permissions can be minimal (only what's needed) or full (everything)

### Where Tokens Are Stored

- Credentials stored in the **platform-specific credential store** (macOS Keychain on Mac)
- When using password or certificate auth, credentials/keys are persisted locally
- `m365 logout` removes stored credentials

### Auth Methods Supported

| Method | Type | Best For |
|--------|------|----------|
| Device Code (default) | Interactive | Human users, MFA-compatible |
| Browser | Interactive | Human users |
| Certificate | Non-interactive | Automation, CI/CD |
| Client Secret | Non-interactive | Automation (NOT SharePoint) |
| Password | Non-interactive | Legacy, no MFA support |
| Managed Identity | Non-interactive | Azure-hosted services |

### Scopes/Permissions

The `m365 setup` wizard offers two options:
- **Minimal permissions** — Only basic scopes
- **Full permissions** — Broad access across all M365 services (admin consent required)

For your use case (email, calendar, SharePoint), you'd want to create a custom app registration with only the specific Graph API delegated permissions needed.

---

## 3. Reliability for Claude Code

### The Fundamental Problem

With the PnP MCP server, the AI must:
1. **Guess what to search for** — Natural language to search query
2. **Pick the right command** from fuzzy search results
3. **Read the docs** to understand parameters
4. **Construct the full CLI command string** with correct flags and values
5. **Parse the output** (JSON or text)

Each step introduces a failure point. If the AI searches for the wrong thing, picks the wrong command, or constructs the command string incorrectly, it fails.

### With Softeria (Discrete Tools)

The AI gets a tool like `list-mail-messages` with a typed schema:
```json
{
  "folder_id": "string (optional)",
  "top": "number (optional)",
  "filter": "string (optional)"
}
```

There is no guessing. The tool name IS the action. The parameters are typed and documented. The AI fills in the blanks.

### Reliability Assessment

| Factor | PnP CLI MCP | Softeria |
|--------|------------|----------|
| Command discovery | Fuzzy search (can miss) | Pre-defined tools (always available) |
| Parameter handling | AI constructs CLI string | Typed schema with validation |
| Error messages | CLI error output (sometimes cryptic) | Graph API errors (structured) |
| Multi-step needed | Yes (search → docs → run) | No (one tool call) |
| Token cost per operation | Higher (3 tool calls minimum) | Lower (1 tool call) |
| Scope of operations | 800+ commands (admin-level) | ~90 tools (user-level) |
| Risk of wrong command | Real — fuzzy search is imprecise | Minimal — tools are explicit |

### Model Recommendation

The PnP team recommends **Claude Sonnet 4 or Claude Sonnet 3.7** for best results. This suggests the search-then-execute pattern requires a capable model. Less capable models would likely struggle more.

### Bottom Line on Reliability

For **routine tasks** (read email, check calendar, list SharePoint sites), Softeria is significantly more reliable because the AI makes fewer decisions. For **admin tasks** (create app registrations, manage Power Automate flows, configure Teams governance), PnP is the only option that covers that breadth.

---

## 4. npm Package Details

### @pnp/cli-microsoft365-mcp-server

| Field | Value |
|-------|-------|
| **Version** | 0.1.17 |
| **First published** | July 4, 2025 |
| **Last updated** | January 22, 2026 |
| **License** | MIT |
| **Node.js requirement** | >= 20.0.0 |
| **Runtime dependencies** | 2 (`@modelcontextprotocol/sdk`, `fuse.js`) |
| **Unpacked size** | ~13 MB |
| **Monthly downloads** | ~891 (Feb 2026) |
| **Weekly downloads** | ~218 |
| **Maintainers** | 9 (waldekm, garry.trinder, appieschot, officedevpnp, arjunumenon, adam-it, martinlingstuyl, jwaegebaert, milanholemans) |
| **Total versions** | 17 |

### @softeria/ms-365-mcp-server (for comparison)

| Field | Value |
|-------|-------|
| **Version** | 0.44.0 |
| **First published** | April 3, 2025 |
| **Last updated** | March 3, 2026 (today) |
| **License** | (not checked) |
| **Node.js requirement** | >= 18 |
| **Runtime dependencies** | 8 (MSAL, MCP SDK, commander, dotenv, express, js-yaml, winston, zod) |
| **Monthly downloads** | ~23,625 (Feb 2026) |
| **Weekly downloads** | ~6,099 |
| **Total versions** | 100+ |

**Softeria has 26x more monthly downloads and ships updates far more frequently.**

---

## 5. The CLI for Microsoft 365 Itself

### Maturity

| Aspect | Detail |
|--------|--------|
| **Started** | October 2017 (as Office 365 CLI) |
| **Renamed** | To "CLI for Microsoft 365" when Microsoft rebranded |
| **Current version** | 11.5.0 |
| **npm first publish** | July 2020 (under @pnp scope) |
| **Monthly downloads** | ~65,000 (Feb 2026) |
| **GitHub stars** | ~1,100 |
| **Age** | 8+ years |

### Command Coverage

The CLI covers **800+ commands** across these Microsoft 365 services:

- Entra ID (identity, app registrations, users, groups)
- SharePoint Online (sites, lists, pages, content types, web parts)
- Microsoft Teams (teams, channels, tabs, apps)
- OneDrive
- OneNote
- Outlook (mail)
- Planner
- Power Apps
- Power Automate
- Power Platform
- SharePoint Embedded
- Viva Engage (formerly Yammer)
- Tenant administration and reporting

### What It Does Well

- **Admin operations** that Softeria doesn't touch: creating app registrations, managing tenant settings, deploying SPFx solutions, configuring Power Platform
- **SharePoint deep operations**: content types, site designs, web parts, page layout
- **Reporting**: usage reports, active user counts, tenant health
- **Scripting**: designed for automation, CI/CD pipelines, batch operations

---

## 6. Mac Setup

### Prerequisites

1. **Node.js 20+** (LTS recommended)
   - Install via Homebrew: `brew install node@20`
   - Or via nvm: `nvm install 20`

2. **CLI for Microsoft 365** (global install)
   ```bash
   npm install -g @pnp/cli-microsoft365
   ```

3. **Initial setup**
   ```bash
   m365 setup          # Creates Entra ID app registration (requires Azure CLI auth)
   m365 login          # Interactive device code login
   ```

4. **CLI configuration for MCP**
   ```bash
   m365 cli config set --key prompt --value false
   m365 cli config set --key output --value text
   m365 cli config set --key helpMode --value full
   ```

5. **MCP server** (either global install or npx)
   ```bash
   # Option A: Use npx (no install needed)
   npx -y @pnp/cli-microsoft365-mcp-server@latest

   # Option B: Global install
   npm install -g @pnp/cli-microsoft365-mcp-server
   ```

### Claude Code Configuration (.mcp.json)

```json
{
  "mcpServers": {
    "CLI-Microsoft365": {
      "command": "npx",
      "args": ["-y", "@pnp/cli-microsoft365-mcp-server@latest"]
    }
  }
}
```

### Total Dependencies on Mac

- Node.js 20+ (the only system-level dependency)
- npm (comes with Node.js)
- No Python, no Docker, no Azure CLI required for basic use
- Azure CLI only needed if using `m365 setup` to auto-create app registration

---

## 7. Community Backing

### PnP (Patterns and Practices)

PnP is the **Microsoft 365 & Power Platform Community** — a collaboration between Microsoft employees and community members. It is:

- **Microsoft-adjacent** but NOT Microsoft-owned
- **NOT covered by Microsoft support**
- An **open-source community initiative**
- Active since 2017 (8+ years)
- 1,100+ GitHub stars on the CLI repo
- 9 active maintainers on the MCP server
- Regular release cadence (CLI itself: monthly releases)

### Key Maintainers

- **Waldek Mastykarz** (Microsoft, Principal PM) — project lead
- **Garry Trinder** (Microsoft MVP)
- Multiple other MVPs and community contributors

### Community Channels

- GitHub Discussions
- Discord
- Bluesky / X (Twitter)

### Strength Assessment

The community is **strong for the CLI itself** (8 years, 65K monthly downloads, active development). The **MCP server is newer and smaller** (891 monthly downloads, 10 open issues, 17 versions). The MCP server is essentially maintained by the same team as the CLI, which is a good sign for longevity.

---

## 8. Comparison with Softeria

### For Your Use Cases

| Use Case | PnP CLI MCP | Softeria | Winner |
|----------|------------|----------|--------|
| **Read email** | m365 outlook mail message list | list-mail-messages (typed tool) | **Softeria** — discrete tool, no guessing |
| **Send email** | m365 outlook mail send | send-mail (typed tool) | **Softeria** — typed params |
| **Calendar events** | m365 outlook event list | list-calendar-events (typed tool) | **Softeria** — simpler |
| **SharePoint sites** | m365 spo site list | list-sharepoint-site-items (typed tool) | **Tie** — both work |
| **SharePoint lists** | m365 spo list add/get/set | list-sharepoint-site-lists (typed tool) | **PnP** — more operations |
| **Teams messages** | m365 teams message send | send-channel-message (typed tool) | **Tie** |
| **OneDrive files** | m365 onedrive ... | list-folder-files, download, upload | **Softeria** — typed tools |
| **Excel operations** | Limited | get-excel-range, create-chart, format, sort | **Softeria** — much deeper |
| **Power Automate** | m365 flow run list/resubmit | Not available | **PnP** — only option |
| **Entra ID admin** | m365 entra ... (dozens of commands) | Not available | **PnP** — only option |
| **SPFx deployment** | m365 spo app add/deploy | Not available | **PnP** — only option |
| **Tenant reporting** | m365 tenant report ... | Not available | **PnP** — only option |
| **Planner tasks** | m365 planner task add/list | list-planner-tasks, create, update | **Softeria** — typed tools |
| **Multi-account** | One connection at a time | Multi-account with account switching | **Softeria** |
| **Read-only mode** | Not available | Built-in safety flag | **Softeria** |
| **Token efficiency** | 3+ tool calls per operation | 1 tool call per operation | **Softeria** |

### Architecture Comparison

| Aspect | PnP CLI MCP | Softeria |
|--------|------------|----------|
| **Approach** | CLI wrapper (shell out) | Graph API client (native HTTP) |
| **Tool count** | 3 meta-tools | 90+ discrete tools |
| **Auth** | External (m365 login) | Built-in (MSAL, device code) |
| **Org mode** | Always (it's admin-focused) | Optional flag (--org-mode) |
| **Output format** | JSON/CSV/text | JSON or TOON (token-saving) |
| **Error handling** | CLI stderr + exit codes | Graph API error objects |
| **Update frequency** | Monthly (CLI), quarterly (MCP) | Weekly |
| **Package size** | ~13 MB | Smaller |

### Recommendation

**Use Softeria for day-to-day operations** (email, calendar, files, SharePoint content, Excel). It is more reliable, has discrete tools the AI can call directly, and has 26x the adoption.

**Consider PnP CLI for admin operations** if/when your organization needs automation of: Power Automate management, Entra ID operations, SPFx deployments, tenant reporting, or SharePoint site provisioning.

They are **not mutually exclusive** — you can run both MCP servers simultaneously.

---

## 9. Known Issues and Limitations

### PnP CLI MCP Server Issues

1. **Only 10 open issues on GitHub** — all are feature requests or documentation tasks, no bug reports. This is either good (stable) or means low adoption hasn't surfaced bugs yet.

2. **AI reliability concern:** The search-then-execute pattern means the AI can:
   - Search for the wrong thing and get irrelevant commands
   - Pick the wrong command from results
   - Construct the CLI string with wrong parameters
   - Miss required parameters entirely

3. **120-second timeout** on command execution — some long-running admin operations could time out.

4. **No authentication** — if the user's `m365 login` session expires, commands silently fail until re-authentication.

5. **Global install required** for the CLI itself — the MCP server reads docs from the globally installed package path.

6. **v9 breaking change** — users upgrading from older versions must create their own app registration. The old PnP Management Shell app no longer works.

### Softeria Issues (for comparison)

- More dependencies (8 runtime deps including Express, MSAL)
- MSAL token caching can be finicky
- `--org-mode` must be set at startup, not toggleable at runtime

### General MCP + Claude Code Issues

- Claude Code on Windows has documented issues with MCP server configuration (wrong config file paths, silent failures)
- MCP tool calls can hang for 5+ minutes then fail in some environments
- These are Claude Code platform issues, not specific to either M365 MCP server

---

## Summary Decision Matrix

| Factor | Weight | PnP CLI MCP | Softeria |
|--------|--------|-------------|----------|
| Reliability for routine tasks | High | 6/10 | 9/10 |
| Breadth of operations | Medium | 10/10 | 7/10 |
| Setup simplicity on Mac | Medium | 6/10 | 8/10 |
| Community/adoption | Medium | 5/10 | 8/10 |
| Security model | High | 8/10 (own app reg) | 7/10 |
| Token efficiency | Low | 4/10 | 9/10 |
| Admin capabilities | Low (for now) | 10/10 | 2/10 |

**For your current needs: Stick with Softeria. Revisit PnP CLI when admin automation becomes a requirement.**
