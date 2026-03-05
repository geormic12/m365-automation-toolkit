# M365 Automation Toolkit

Development toolkit for building Microsoft 365 automations with [Claude Code](https://claude.ai/code). Generates importable packages for Copilot Studio agents and Power Automate flows from natural language descriptions.

## Quick Start

1. **Clone this repo**
   ```bash
   git clone https://github.com/geormic12/m365-automation-toolkit.git
   cd m365-automation-toolkit
   ```

2. **Install Claude Code** — see [docs/SETUP-CLAUDE-CODE-MAC.md](docs/SETUP-CLAUDE-CODE-MAC.md)

3. **Set up the MS365 MCP server** (connects Claude to your Microsoft 365 data)
   ```bash
   npx -y @softeria/ms-365-mcp-server --login
   ```
   Full guide: [docs/SETUP-MS365-MCP.md](docs/SETUP-MS365-MCP.md)

4. **Open this folder in VS Code with Claude Code**

5. **Try it:**
   ```
   /generate-copilot-agent A scheduling assistant that checks calendar availability and books meetings
   ```

## What's Inside

### Skills (Claude Code Slash Commands)

| Command | What It Does |
|---------|-------------|
| `/generate-copilot-agent` | Describe an agent → get a Dataverse solution .zip for Copilot Studio |
| `/generate-agent-flow` | Describe a workflow → get a Dataverse solution .zip for Copilot Studio |
| `/generate-pa-package` | Describe a flow → get a Power Automate legacy import .zip |

### Documentation

| Directory | Contents |
|-----------|----------|
| [docs/](docs/) | Setup guides, development approach, connector index |
| [knowledge/](knowledge/) | Best practices (14 sections), MCP tools catalog |
| [reference/](reference/) | Connector reference docs (OneDrive, Outlook, SharePoint, Teams, Dataverse) |
| [research/](research/) | Security reports, MCP server comparisons |

### Generators & Examples

| Directory | Contents |
|-----------|----------|
| [scripts/copilot-studio/](scripts/copilot-studio/) | Agent generator, flow generator, example agent definitions |
| [scripts/power-automate/](scripts/power-automate/) | PA flow generator, example flow definitions |

## How It Works

**Start in Claude World. Promote when needed.**

1. **Prototype** — Build and test automations directly with Claude using the MS365 MCP server
2. **Package** — When it needs to run org-wide, generate an importable .zip with a slash command
3. **Import** — Import into Copilot Studio or Power Automate
4. **Configure** — Add MCP tools, knowledge sources, triggers, and publish

See [docs/DEVELOPMENT-APPROACH.md](docs/DEVELOPMENT-APPROACH.md) for the full development guide.

## Requirements

- [Claude Code](https://claude.ai/code) (Pro subscription or higher)
- [Node.js](https://nodejs.org/) 20+
- Microsoft 365 work/school account
- (Optional) [.NET SDK 8.0+](https://dotnet.microsoft.com/download) for PAC CLI fallback imports
