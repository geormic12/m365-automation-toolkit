# Microsoft 365 MCP Server — Admin Consent Guide

How Claude Code connects to Microsoft 365, what needs to be approved, and the two options for your IT team.

## How It Works

Claude Code uses a local MCP server to interact with Microsoft 365 (email, calendar, Teams, OneDrive, etc.) via Microsoft's Graph API. The data flow is:

```
Your machine  →  MCP server (runs locally)  →  Microsoft Graph API  →  Your M365 data
```

Nothing goes through Softeria or any third party. The MCP server is open-source software that runs entirely on the user's machine. It just needs an OAuth token to prove the user's identity when talking to Microsoft.

## The Consent Problem

Every OAuth token is issued through a **registered app** in Microsoft Entra ID (formerly Azure AD). The MCP server uses a pre-registered app provided by Softeria (the open-source developers). Your Entra tenant may be configured to block users from consenting to third-party apps — which is good security practice, but it means an admin must approve the app first.

## What "Approving Softeria's App" Actually Means

**It does NOT mean:**
- Softeria gets access to your organization's data
- Anyone outside your organization can read your email
- The MCP server phones home to Softeria
- Your data leaves your machines

**It DOES mean:**
- Your Entra tenant recognizes Softeria's app ID (`084a3e9f-a9f4-43f7-89f9-d229cf97853e`) as a valid OAuth client
- Your users can authenticate through it to get tokens for their own data
- The app uses **delegated permissions only** — it can only do what the signed-in user can already do
- It's a **public client** (no client secret) — it cannot act without a user physically present and authenticated

**Analogy:** Approving the app is like adding a badge reader to a door. The badge reader (app) doesn't decide who gets in — your user directory does. Only people with valid credentials can use it, and they can only access what their own account is allowed to access.

## The Two Paths

### Path 1: Approve Softeria's App (Recommended — 2 minutes)

An admin clicks one URL and accepts:

```
https://login.microsoftonline.com/common/adminconsent?client_id=084a3e9f-a9f4-43f7-89f9-d229cf97853e
```

**Who needs to do this:** Someone with **Global Administrator** or **Cloud Application Administrator** role in your Entra ID.

**What happens after:**
- All users can authenticate via `--login` and get tokens for their own data
- The app appears in Entra ID > Enterprise applications with the permissions listed below
- Admin can revoke consent at any time (Entra ID > Enterprise applications > delete it)

**Permissions requested (all delegated — user-scoped):**

| Permission | What It Allows |
|-----------|---------------|
| Mail.ReadWrite, Mail.Send | Read, write, and send email as the signed-in user |
| Mail.Read.Shared, Mail.Send.Shared | Access shared mailboxes and send-on-behalf |
| Calendars.ReadWrite | Read and manage the user's calendar |
| Calendars.Read.Shared | Read shared calendars and find meeting times |
| Files.ReadWrite | Access the user's OneDrive files |
| Files.Read.All | Search across files the user can access |
| Contacts.ReadWrite | Access the user's Outlook contacts |
| Tasks.ReadWrite | Access the user's To Do and Planner tasks |
| Notes.Read, Notes.Create | Read and create OneNote notebooks |
| Sites.Read.All | Read SharePoint sites the user has permission to |
| Team.ReadBasic.All, TeamMember.Read.All | Read team names, descriptions, and membership |
| Channel.ReadBasic.All, ChannelMessage.Read.All, ChannelMessage.Send | Read and post in Teams channels the user belongs to |
| Chat.Read, ChatMessage.Read, ChatMessage.Send | Read and send Teams chat messages |
| Group.Read.All, Group.ReadWrite.All | Read and manage Microsoft 365 groups |
| User.Read, User.Read.All | Read the user's own profile and directory profiles |
| People.Read | Read the user's relevant people list |
| offline_access | Keep tokens valid across sessions (standard for any app that stays logged in) |

> **Scope source:** These are the exact scopes requested by `@softeria/ms-365-mcp-server@0.44.0` with `--org-mode`, as defined in the package's `endpoints.json`. The server applies hierarchy optimization at runtime (e.g., `Mail.ReadWrite` subsumes `Mail.Read`, so `Mail.Read` is not requested separately).

None of these are **application-level** permissions. They are all **delegated** — scoped to what the individual user can already do in M365.

**Why this is safe:**
- Open source (MIT license) — [source code on GitHub](https://github.com/Softeria/ms-365-mcp-server)
- 500+ GitHub stars, actively maintained by Softeria (Norwegian company)
- Uses Microsoft's own MSAL authentication library
- Public client — no secret, cannot operate without a user present
- Tokens stored in OS credential store (macOS Keychain / Windows Credential Manager)
- Version pinned to 0.44.0 to prevent unexpected updates
- Can be revoked instantly by deleting the enterprise app in Entra ID

---

### Path 2: Register Your Own App (15–20 minutes)

Your IT team creates a custom app registration inside your own Entra tenant. The MCP server is then configured to authenticate through your app instead of Softeria's.

**When to choose this:**
- Your IT team has a blanket policy against third-party app consents
- You want to control exactly which permissions are granted
- You want the app to appear under your own name in audit logs

#### Steps for your IT team

1. **Azure Portal** > **Entra ID** > **App registrations** > **New registration**
2. **Name:** `Claude Code M365 Access` (or any name you prefer)
3. **Supported account types:** Accounts in this organizational directory only (single tenant)
4. **Redirect URI:** Leave blank for now (added in step 6)
5. Click **Register**

6. **Authentication** tab:
   - Click **Add a platform** > **Mobile and desktop applications**
   - Add: `https://login.microsoftonline.com/common/oauth2/nativeclient`
   - Under "Advanced settings", set **Allow public client flows** to **Yes**
   - **Do NOT add a Web redirect URI** — it interferes with the admin consent flow
   - Save

7. **API permissions** tab:
   - Click **Add a permission** > **Microsoft Graph** > **Delegated permissions**
   - Add the permissions from the table below
   - Click **Grant admin consent for [your org]**

8. **Overview** tab — copy these two values:
   - **Application (client) ID** — e.g., `a1b2c3d4-e5f6-...`
   - **Directory (tenant) ID** — e.g., `f7g8h9i0-j1k2-...`

**No client secret is needed.** The app is a public client using device code flow.

#### Required delegated permissions

These are the exact scopes `@softeria/ms-365-mcp-server@0.44.0` requests with `--org-mode`:

| Category | Permissions |
|----------|------------|
| Mail | `Mail.ReadWrite`, `Mail.Send`, `Mail.Read.Shared`, `Mail.Send.Shared` |
| Calendar | `Calendars.ReadWrite`, `Calendars.Read.Shared` |
| Files | `Files.ReadWrite`, `Files.Read.All` |
| OneNote | `Notes.Read`, `Notes.Create` |
| Tasks | `Tasks.ReadWrite` |
| Contacts | `Contacts.ReadWrite` |
| User | `User.Read`, `User.Read.All`, `People.Read` |
| Teams Chat | `Chat.Read`, `ChatMessage.Read`, `ChatMessage.Send` |
| Teams | `Team.ReadBasic.All`, `Channel.ReadBasic.All`, `ChannelMessage.Read.All`, `ChannelMessage.Send`, `TeamMember.Read.All` |
| SharePoint | `Sites.Read.All` |
| Groups | `Group.Read.All`, `Group.ReadWrite.All` |
| Session | `offline_access` |

**Total: 26 delegated permissions** (25 explicit + `offline_access`)

> **Note:** You do NOT need `Mail.Read`, `Calendars.Read`, `Files.Read`, `Tasks.Read`, or `Contacts.Read` — the ReadWrite versions already include read access. The server's hierarchy optimization handles this automatically.

#### Granting admin consent

**Option A: Azure Portal GUI (recommended)**

1. **App registrations** > **Claude Code M365 Access** > **API permissions**
2. Click **"Grant admin consent for [your org]"**
3. Confirm

If this fails (redirect errors), use Option B or C.

**Option B: Enterprise Applications GUI**

1. **Enterprise Applications** > search for **Claude Code M365 Access**
2. **Permissions** (left sidebar)
3. Click **"Grant admin consent for [your org]"**
4. Sign in as admin and accept

> **Important:** This is a different "Grant admin consent" button than Option A. The Enterprise Application is the service principal that enforces consent at runtime. If Option A doesn't propagate, try this one.

**Option C: PowerShell script (bypasses all browser/redirect issues)**

If the portal buttons fail due to redirect URI errors, use the included script:

```powershell
# Prerequisites (one-time)
Install-Module Microsoft.Graph -Scope CurrentUser

# Run the script
.\scripts\Grant-AdminConsent.ps1
```

See [`scripts/Grant-AdminConsent.ps1`](../scripts/Grant-AdminConsent.ps1) for the full script. It:
- Connects as admin via browser sign-in
- Reads all delegated permissions from the app registration
- Removes any stale/partial consent grants
- Creates a clean admin consent grant for all permissions
- Verifies the grant was applied
- Runs a configuration health check (redirect URIs, public client flows, assignment settings)

#### Configuration on each machine

**Option A: Environment variables in `.mcp.json` (recommended for Claude Code)**

```json
{
  "mcpServers": {
    "ms365": {
      "command": "npx",
      "args": ["-y", "@softeria/ms-365-mcp-server@0.44.0", "--org-mode"],
      "env": {
        "MS365_MCP_CLIENT_ID": "<application-client-id>",
        "MS365_MCP_TENANT_ID": "<directory-tenant-id>"
      }
    }
  }
}
```

**Option B: Shell environment variables**

macOS/Linux — add to `~/.zshrc` or `~/.bashrc`:
```bash
export MS365_MCP_CLIENT_ID="<application-client-id>"
export MS365_MCP_TENANT_ID="<directory-tenant-id>"
```

Windows — add to user environment variables or PowerShell profile.

Then log in:
```bash
npx -y @softeria/ms-365-mcp-server@0.44.0 --login
```

The MCP server detects the environment variables and authenticates through your app instead of Softeria's default.

#### Advantages over Path 1
- App registration lives in your tenant — full ownership
- IT can grant a subset of permissions (e.g., read-only email, no Teams)
- Audit logs show your app name, not a third-party ID
- No dependency on Softeria's app registration continuing to exist

#### Disadvantages
- More setup time (15–20 minutes for IT)
- IT must add permissions manually
- If new MCP server features need new permissions, IT must add them

---

## Troubleshooting

### "Approval required" after admin consent

The admin consent was granted on the **App Registration** but hasn't propagated to the **Enterprise Application** (service principal). These are separate objects in Entra ID.

**Fix:** Grant consent from the Enterprise Applications blade (Option B above), or use the PowerShell script (Option C).

Also check:
- **Enterprise Applications** > **Properties** > **"Assignment required?"** must be **No** (or assign users explicitly under Users and groups)
- **Enterprise Applications** > **Properties** > **"Enabled for users to sign-in?"** must be **Yes**

### "This is not the right page" / phishing warning during admin consent

The admin consent flow redirects to a registered redirect URI after completion. If a **Web** redirect URI (e.g., `http://localhost`) is registered, Azure picks it and the redirect fails.

**Fix:**
- Remove any **Web** redirect URIs from the app registration
- Only keep the **Mobile and desktop** redirect: `https://login.microsoftonline.com/common/oauth2/nativeclient`
- Use the **Azure Portal GUI** button to grant consent (no redirect needed), or use the **PowerShell script**

### "AADSTS500113: No reply address is registered"

The app registration has no redirect URI configured.

**Fix:** Add `https://login.microsoftonline.com/common/oauth2/nativeclient` under **Authentication** > **Mobile and desktop applications**.

### Admin consent URL if needed

Replace `{tenant-id}` and `{client-id}` with your values:

```
https://login.microsoftonline.com/{tenant-id}/adminconsent?client_id={client-id}
```

> **Warning:** This URL requires a redirect URI to work. If you only have the native client redirect, this flow may fail with the "wrong page" error. Use the Portal GUI or PowerShell script instead.

---

## Azure App Configuration Checklist

| Setting | Value | Location |
|---------|-------|----------|
| Redirect URI | `https://login.microsoftonline.com/common/oauth2/nativeclient` | App registrations > Authentication > Mobile and desktop |
| Web redirect URIs | **None** (remove if present) | App registrations > Authentication > Web |
| Allow public client flows | **Yes** | App registrations > Authentication > Advanced |
| API permissions | 26 delegated Graph scopes (see table above) | App registrations > API permissions |
| Admin consent granted | **Yes** (green checkmarks) | App registrations > API permissions |
| Assignment required | **No** (unless restricting to specific users) | Enterprise Applications > Properties |
| Enabled for sign-in | **Yes** | Enterprise Applications > Properties |

---

## What to Send Your IT Team

### If requesting Path 1 (recommended):

> We're setting up a local development tool (Claude Code) that needs to interact with Microsoft 365 via the Graph API. It uses an open-source MCP server that authenticates through a pre-registered public client app. The app uses delegated permissions only — it can only access what the signed-in user can access. No data leaves the local machine.
>
> We need admin consent granted for this app:
>
> - **App ID:** `084a3e9f-a9f4-43f7-89f9-d229cf97853e`
> - **Publisher:** Softeria (Norwegian company, MIT-licensed open source)
> - **Source code:** https://github.com/Softeria/ms-365-mcp-server
> - **Admin consent URL:** https://login.microsoftonline.com/common/adminconsent?client_id=084a3e9f-a9f4-43f7-89f9-d229cf97853e
>
> This can be revoked at any time by deleting the enterprise app in Entra ID.

### If requesting Path 2:

> We need a custom app registration in our Entra ID tenant for a local development tool. Requirements:
>
> - **Name:** Claude Code M365 Access
> - **Type:** Public client (no secret needed)
> - **Account type:** Single tenant (this org only)
> - **Redirect URI:** `https://login.microsoftonline.com/common/oauth2/nativeclient` (Mobile and desktop — NOT Web)
> - **Allow public client flows:** Yes
> - **Delegated Graph permissions needed:** Mail.ReadWrite, Mail.Send, Mail.Read.Shared, Mail.Send.Shared, Calendars.ReadWrite, Calendars.Read.Shared, Files.ReadWrite, Files.Read.All, Notes.Read, Notes.Create, Tasks.ReadWrite, Contacts.ReadWrite, User.Read, User.Read.All, People.Read, Chat.Read, ChatMessage.Read, ChatMessage.Send, Team.ReadBasic.All, Channel.ReadBasic.All, ChannelMessage.Read.All, ChannelMessage.Send, TeamMember.Read.All, Sites.Read.All, Group.Read.All, Group.ReadWrite.All, offline_access
> - **Grant admin consent** for all listed permissions
> - **Do NOT add Web redirect URIs** — only the native client redirect above
>
> If the portal consent button has issues, we have a PowerShell script that grants consent via the Graph API directly (see `scripts/Grant-AdminConsent.ps1`).
>
> After creation, we need the **Application (client) ID** and **Directory (tenant) ID**.

---

## Revoking Access

Either path can be revoked instantly:

- **Path 1:** Entra ID > Enterprise applications > find `084a3e9f...` > Delete
- **Path 2:** Entra ID > App registrations > find "Claude Code M365 Access" > Delete

Deleting the app immediately invalidates all tokens. No user can authenticate again until a new consent or app is set up.
