# Claude Code Setup (Mac)

Get Claude Code running inside VS Code on a Mac. Assumes VS Code is already installed.

## Before You Start

- **macOS 13.0 (Ventura) or higher** — check in System Settings > General > About
- **VS Code 1.98.0 or higher** — check in VS Code > Help > About. Update if needed.

## 1. Create a Claude Account

1. Go to [claude.ai](https://claude.ai)
2. Click **"Continue with email"** or **"Continue with Google"**
3. Enter your name, email, and password
4. Verify your email (check inbox for a link)
5. Enter your mobile phone number for SMS verification

This creates a free account. The free plan does **not** include Claude Code — you need Pro.

## 2. Upgrade to Claude Pro

1. Go to [claude.ai/upgrade](https://claude.ai/upgrade)
2. Select **Pro** ($20/month)
3. Enter payment information

| Plan | Price | Claude Code | Usage |
|------|-------|-------------|-------|
| **Free** | $0 | No | Web chat only |
| **Pro** | $20/mo | **Yes** | 5x free capacity |
| **Max 5x** | $100/mo | **Yes** | 25x free capacity |
| **Max 20x** | $200/mo | **Yes** | 100x free capacity |

Each person using Claude Code needs their own Claude Pro subscription at minimum. Start with Pro — upgrade to Max later if you hit rate limits during heavy sessions.

## 3. Install the Claude Code Extension

1. Open VS Code
2. Press **Cmd+Shift+X** to open Extensions
3. Search for **"Claude Code"**
4. Find the one published by **Anthropic** (verified publisher, 5.6M+ installs)
5. Click **Install**

**Marketplace ID:** `anthropic.claude-code`

Or install from the terminal:
```bash
code --install-extension anthropic.claude-code
```

The extension bundles the Claude Code CLI — no separate CLI installation needed.

## 4. Authenticate

1. Open a project folder in VS Code (File > Open Folder)
2. Open a file so the editor is active
3. Click the **Spark icon** in the top-right of the editor toolbar

   Or click **"Claude Code"** in the bottom-right status bar

   Or press **Cmd+Shift+P** and type **"Claude Code: Open in New Tab"**

4. Claude Code opens and launches a **browser window** for authentication
5. Log in with your Claude.ai account (the one you created in Step 1)
6. The browser redirects back — Claude Code is now authenticated

**If the browser doesn't open automatically:** Press `c` in the Claude Code panel to copy the login URL, then paste it into your browser manually.

**Credentials are stored in macOS Keychain** — encrypted, OS-protected. You won't need to log in again unless you explicitly log out.

## 5. Verify It Works

In the Claude Code panel, type a simple prompt:

```
What files are in this project?
```

Claude should respond with a list of files. If it does, you're set.

**Check MCP servers:** Type `/mcp` in the Claude Code panel to see connected servers.

## 6. Install the CLI (Optional)

The VS Code extension includes the CLI, but if you want Claude Code available in any terminal (outside VS Code):

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

Verify:
```bash
claude --version
```

This is the native installer — signed by Anthropic and notarized by Apple. It auto-updates in the background. No Node.js required.

## Opening Claude Code

Multiple ways to open it:

| Method | How |
|--------|-----|
| **Spark icon** | Top-right of editor toolbar (requires a file to be open) |
| **Status bar** | Click "Claude Code" in bottom-right (always available) |
| **Command Palette** | Cmd+Shift+P > "Claude Code: Open in New Tab" |
| **Keyboard shortcut** | Cmd+Shift+Esc |

## Adding MCP Servers

MCP servers are added via the terminal (inside VS Code's integrated terminal), not through the extension UI.

```bash
# Add an MCP server
claude mcp add <name> -- <command> [args...]

# Example: Add the MS 365 MCP server
claude mcp add ms365 -- npx -y @softeria/ms-365-mcp-server@0.44.0 --org-mode

# List configured servers
claude mcp list

# Remove a server
claude mcp remove <name>
```

After adding a server, restart Claude Code and type `/mcp` to confirm it appears.

See [SETUP-MSDEV-MAC.md](SETUP-MSDEV-MAC.md) for the full list of MCP servers to configure.

## Useful Commands Inside Claude Code

Type these at the Claude Code prompt:

| Command | What It Does |
|---------|-------------|
| `/mcp` | Show connected MCP servers and their status |
| `/help` | Show all available commands |
| `/clear` | Clear the conversation |
| `/logout` | Log out of your Claude account |
| `/compact` | Summarize the conversation to free up context |

## Troubleshooting

**Extension doesn't appear after install** — Restart VS Code completely (Cmd+Q, then reopen).

**"Claude Code requires a Pro subscription"** — Make sure you upgraded to Pro at [claude.ai/upgrade](https://claude.ai/upgrade) and that you're logged in with the same account.

**Browser doesn't open for authentication** — Press `c` in the Claude Code panel to copy the login URL. Paste it in Safari or Chrome.

**"developer cannot be verified" macOS warning** — Go to System Settings > Privacy & Security > scroll down and click "Allow Anyway". This shouldn't happen with the current notarized build, but if it does, that's the fix.

**Spark icon missing** — The spark icon only appears when a file is open in the editor. Open any file, or use the status bar button instead.

**Rate limited** — You've hit your plan's usage cap. Wait for it to reset, or upgrade from Pro ($20) to Max 5x ($100) for 5x more capacity.

## Next Steps

After Claude Code is working:

1. **[SETUP-MSDEV-MAC.md](SETUP-MSDEV-MAC.md)** — Install dev tools and MCP servers (Node.js, .NET, MS 365 MCP, Playwright, etc.)
2. **[SETUP-PYTHON-MAC.md](SETUP-PYTHON-MAC.md)** — Install Python and document processing libraries (Excel, Word, PDF)
