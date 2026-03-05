# Microsoft 365 MCP Server Setup

Connect Claude Code to Outlook, calendars, OneDrive, SharePoint, Teams, and other M365 services via the Microsoft Graph API.

**Package:** [`@softeria/ms-365-mcp-server`](https://github.com/Softeria/ms-365-mcp-server) (v0.43.2, MIT license)
**Requires:** Node.js 20+ (you have v22)

## What This Gives Claude Code

| Category | Capabilities |
|----------|-------------|
| **Email** | Read, send, manage folders, attachments |
| **Calendar** | List/create/update/delete events, calendar views |
| **OneDrive** | List, download, upload, delete files |
| **Excel** | Worksheet operations, ranges, charts |
| **Contacts** | Outlook contact management |
| **To Do** | Task CRUD |
| **Planner** | Task planning |
| **OneNote** | Notebooks, sections, pages |
| **Search** | Universal Microsoft Search |
| **Teams** | Channels, messages, replies (org-mode) |
| **SharePoint** | Sites, drives, lists (org-mode) |
| **Shared Mailboxes** | Delegated access (org-mode) |

## Quick Start (5 minutes)

### Step 1: Verify the MCP Config

The project already has `.mcp.json` configured. Verify it exists:

```
.mcp.json
```

Contents:
```json
{
  "mcpServers": {
    "ms365": {
      "command": "npx",
      "args": ["-y", "@softeria/ms-365-mcp-server", "--org-mode"]
    }
  }
}
```

The `--org-mode` flag enables work/school account features (Teams, SharePoint, shared mailboxes). This is required for Microsoft 365 Business accounts.

### Step 2: Authenticate

Run this command to log in with your Microsoft work/school account:

```bash
npx -y @softeria/ms-365-mcp-server --login
```

This uses **device code flow** — it will:
1. Display a code and a URL
2. Open your browser to `https://microsoft.com/devicelogin`
3. You paste the code and sign in with your M365 account
4. Tokens are cached in your OS credential store (auto-refresh)

No Azure AD app registration needed — the server uses a built-in app registration.

### Step 3: Verify Login

```bash
npx -y @softeria/ms-365-mcp-server --verify-login
```

### Step 4: Restart Claude Code

After authenticating, restart Claude Code so it picks up the MCP server. Run `/mcp` inside Claude Code to confirm `ms365` appears in the server list.

## What You Can Ask Claude Code After Setup

**Calendar:**
- "Show me all meetings this week"
- "Find a time that works for me and a coworker next Tuesday afternoon"
- "Create a 30-minute meeting with a coworker tomorrow at 2pm"
- "What scheduling conflicts do I have this week?"

**Email:**
- "Show me unread emails from the last 24 hours"
- "Draft a follow-up email to a coworker about the sprint progress"
- "Find the last email thread about the proposal"

**Files:**
- "List recent files in my OneDrive folder"
- "Upload this report to OneDrive"

**Teams (org-mode):**
- "Show recent messages in the Teams channel"
- "Post an update to the team channel"

## Tool Presets

You can limit which tools are active using `--preset` to reduce noise:

| Preset | What's Included |
|--------|----------------|
| `mail` | Email operations |
| `calendar` | Calendar and events |
| `files` | OneDrive files |
| `personal` | Mail + calendar + files + contacts + tasks + notes + search |
| `work` | Teams + SharePoint + shared mailboxes + search (requires org-mode) |
| `excel` | Excel spreadsheet operations |
| `contacts` | Outlook contacts |
| `tasks` | To Do + Planner |
| `onenote` | OneNote |
| `search` | Microsoft Search |
| `users` | User directory (requires org-mode) |
| `all` | Everything |

Example — calendar and mail only:
```json
{
  "mcpServers": {
    "ms365": {
      "command": "npx",
      "args": ["-y", "@softeria/ms-365-mcp-server", "--org-mode", "--preset", "calendar,mail"]
    }
  }
}
```

## Authentication Options

### Option 1: Device Code Flow (Default — Recommended to Start)

Simplest setup. Uses the built-in Softeria app registration. No Azure admin work required.

```bash
npx -y @softeria/ms-365-mcp-server --login
```

### Option 2: Custom Azure AD App (For Production / Tighter Control)

Your IT team may prefer their own app registration for security control.

1. Go to **Azure Portal** > **Azure Active Directory** > **App registrations** > **New registration**
2. Name: `Claude Code M365 Access` (or similar)
3. Supported account types: **Accounts in this organizational directory only**
4. Redirect URI: `http://localhost:3000/callback` (Web)
5. Under **API permissions**, add Microsoft Graph **delegated** permissions:
   - `Mail.Read`, `Mail.Send`, `Mail.ReadWrite`
   - `Calendars.Read`, `Calendars.ReadWrite`
   - `Files.Read`, `Files.ReadWrite`
   - `Contacts.Read`, `Contacts.ReadWrite`
   - `User.Read`
   - `offline_access`
6. Under **Certificates & secrets**, create a client secret
7. Set environment variables before running:

```bash
export MS365_MCP_CLIENT_ID=your-app-client-id
export MS365_MCP_CLIENT_SECRET=your-secret
export MS365_MCP_TENANT_ID=your-tenant-id
```

On Windows (PowerShell):
```powershell
$env:MS365_MCP_CLIENT_ID = "your-app-client-id"
$env:MS365_MCP_CLIENT_SECRET = "your-secret"
$env:MS365_MCP_TENANT_ID = "your-tenant-id"
```

### Option 3: Read-Only Mode

For safety during initial testing, start in read-only mode:

```json
{
  "mcpServers": {
    "ms365": {
      "command": "npx",
      "args": ["-y", "@softeria/ms-365-mcp-server", "--org-mode", "--read-only"]
    }
  }
}
```

This disables all write operations (send mail, create events, delete files, etc.).

## Account Management

```bash
# List all cached accounts
npx -y @softeria/ms-365-mcp-server --list-accounts

# Switch between accounts
npx -y @softeria/ms-365-mcp-server --select-account <accountId>

# Remove an account
npx -y @softeria/ms-365-mcp-server --remove-account <accountId>

# Log out completely
npx -y @softeria/ms-365-mcp-server --logout
```

## Troubleshooting

### "Login required" errors
Run `--login` again. Tokens may have expired if the machine was offline for an extended period.

### MCP server not appearing in `/mcp`
1. Check `.mcp.json` exists in the project root
2. Restart Claude Code completely
3. Run `npx -y @softeria/ms-365-mcp-server --version` to confirm Node can find the package

### Permission denied errors
The built-in app registration requests broad permissions. If your Entra admin has restricted third-party app consent, you'll need to use Option 2 (custom Azure AD app) and have the admin grant consent.

### Limiting tool noise
If Claude Code is loading too many tools, use `--preset` to limit to only what you need (e.g., `--preset calendar,mail`).

## Security Notes

- **Device code flow** tokens are stored in the OS credential store (Windows Credential Manager / macOS Keychain)
- Tokens auto-refresh but can be revoked with `--logout`
- For production use, consider a custom Azure AD app with minimal permissions
- Use `--read-only` during initial testing to prevent accidental changes
- The server runs locally — no data is sent to Softeria's servers
