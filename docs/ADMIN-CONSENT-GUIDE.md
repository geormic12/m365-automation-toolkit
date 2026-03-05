# Microsoft 365 MCP Server — Admin Consent Guide

How Claude Code connects to Microsoft 365, what needs to be approved, and the two options for your IT team.

## How It Works

Claude Code uses a local MCP server to interact with Microsoft 365 (email, calendar, Teams, OneDrive, etc.) via Microsoft's Graph API. The data flow is:

```
Your Mac  →  MCP server (runs locally)  →  Microsoft Graph API  →  Your M365 data
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
| Mail.Read, Mail.ReadWrite, Mail.Send | Read and send email as the signed-in user |
| Calendars.Read, Calendars.ReadWrite | Read and manage the user's calendar |
| Files.Read, Files.ReadWrite | Access the user's OneDrive files |
| Contacts.Read, Contacts.ReadWrite | Access the user's Outlook contacts |
| Tasks.Read, Tasks.ReadWrite | Access the user's To Do and Planner tasks |
| Notes.Read, Notes.ReadWrite | Access the user's OneNote |
| Sites.Read.All, Sites.ReadWrite.All | Access SharePoint sites the user has permission to |
| Channel.ReadBasic.All, ChannelMessage.Read.All, ChannelMessage.Send | Read and post in Teams channels the user belongs to |
| Chat.Read, Chat.ReadWrite, ChatMessage.Send | Read and send Teams chat messages |
| User.Read, User.ReadBasic.All | Read the user's own profile and basic directory info |
| offline_access | Keep tokens valid across sessions (standard for any app that stays logged in) |

None of these are **application-level** permissions. They are all **delegated** — scoped to what the individual user can already do in M365.

**Why this is safe:**
- Open source (MIT license) — [source code on GitHub](https://github.com/Softeria/ms-365-mcp-server)
- 500+ GitHub stars, actively maintained by Softeria (Norwegian company)
- Uses Microsoft's own MSAL authentication library
- Public client — no secret, cannot operate without a user present
- Tokens stored in macOS Keychain (encrypted, OS-protected)
- Version pinned to 0.44.0 to prevent unexpected updates
- Can be revoked instantly by deleting the enterprise app in Entra ID

---

### Path 2: Register Your Own App (15–20 minutes)

Your IT team creates a custom app registration inside your own Entra tenant. The MCP server is then configured to authenticate through your app instead of Softeria's.

**When to choose this:**
- Your IT team has a blanket policy against third-party app consents
- You want to control exactly which permissions are granted
- You want the app to appear under your own name in audit logs

**Steps for your IT team:**

1. **Azure Portal** > **Entra ID** > **App registrations** > **New registration**
2. **Name:** `Claude Code M365 Access` (or any name you prefer)
3. **Supported account types:** Accounts in this organizational directory only (single tenant)
4. **Redirect URI:** Select "Mobile and desktop applications" > `http://localhost`
5. Click **Register**

6. **Authentication** tab:
   - Under "Advanced settings", set **Allow public client flows** to **Yes**
   - Save

7. **API permissions** tab:
   - Click **Add a permission** > **Microsoft Graph** > **Delegated permissions**
   - Add the permissions from the table above (or a subset — you control what to allow)
   - Click **Grant admin consent for [your org]**

8. **Overview** tab — copy these two values:
   - **Application (client) ID** — e.g., `a1b2c3d4-e5f6-...`
   - **Directory (tenant) ID** — e.g., `f7g8h9i0-j1k2-...`

**No client secret is needed.** The app is a public client using device code flow.

**Configuration on each Mac:**

Add to `~/.zshrc`:
```bash
export MS365_MCP_CLIENT_ID="<application-client-id>"
export MS365_MCP_TENANT_ID="<directory-tenant-id>"
```

Then reload and log in:
```bash
source ~/.zshrc
npx -y @softeria/ms-365-mcp-server@0.44.0 --login
```

The MCP server detects the environment variables and authenticates through your app instead of Softeria's default.

**Advantages over Path 1:**
- App registration lives in your tenant — full ownership
- IT can grant a subset of permissions (e.g., read-only email, no Teams)
- Audit logs show your app name, not a third-party ID
- No dependency on Softeria's app registration continuing to exist

**Disadvantages:**
- More setup time (15–20 minutes for IT)
- IT must add permissions manually
- If new MCP server features need new permissions, IT must add them

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
> - **Redirect URI:** http://localhost (Mobile and desktop applications)
> - **Allow public client flows:** Yes
> - **Delegated Graph permissions needed:** Mail.Read, Mail.ReadWrite, Mail.Send, Calendars.Read, Calendars.ReadWrite, Files.Read, Files.ReadWrite, Contacts.Read, Contacts.ReadWrite, Tasks.Read, Tasks.ReadWrite, Notes.Read, Notes.ReadWrite, Sites.Read.All, Sites.ReadWrite.All, Channel.ReadBasic.All, ChannelMessage.Read.All, ChannelMessage.Send, Chat.Read, Chat.ReadWrite, ChatMessage.Send, User.Read, User.ReadBasic.All, offline_access
> - **Grant admin consent** for all listed permissions
>
> After creation, we need the **Application (client) ID** and **Directory (tenant) ID**.

---

## Revoking Access

Either path can be revoked instantly:

- **Path 1:** Entra ID > Enterprise applications > find `084a3e9f...` > Delete
- **Path 2:** Entra ID > App registrations > find "Claude Code M365 Access" > Delete

Deleting the app immediately invalidates all tokens. No user can authenticate again until a new consent or app is set up.
