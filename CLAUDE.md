# M365 Automation Toolkit

Development toolkit for building Microsoft 365 automations with Claude Code. Generates importable packages for Copilot Studio agents, Agent Flows, and Power Automate flows.

## What This Workspace Does

- Copilot Studio agents (generated as Dataverse solution .zip packages)
- Copilot Studio Agent Flows (generated as Dataverse solution .zip packages)
- Power Automate flows (generated as legacy import .zip packages)
- Python scripts for Excel/Word document processing
- Claude Code automations via Microsoft 365 MCP (calendars, email, files, Teams)

## Skills Available

| Skill | Command | What It Does |
|-------|---------|-------------|
| **Copilot Agent Generator** | `/generate-copilot-agent` | Natural language → importable Copilot Studio agent .zip |
| **Agent Flow Generator** | `/generate-agent-flow` | Natural language → importable Copilot Studio agent flow .zip |
| **Power Automate Generator** | `/generate-pa-package` | Natural language → importable Power Automate flow .zip |

## Key Directories

| Path | Purpose |
|------|---------|
| `docs/` | Setup guides, development approach, connector index |
| `docs/skills/` | Human-readable skill documentation |
| `scripts/copilot-studio/` | Agent/flow generators + example definitions |
| `scripts/power-automate/` | Power Automate flow generator + example definitions |
| `knowledge/` | Best practices (14 sections), MCP tools catalog |
| `reference/` | Connector reference docs (OneDrive, Outlook, SharePoint, Teams, Dataverse) |
| `research/` | Security reports, MCP server comparisons |
| `.claude/skills/` | Claude Code skill definitions (machine-readable) |
| `output/` | Generated packages go here (gitignored) |

## Environment Details

**Target environment:** Mac machines, Microsoft 365, Power Platform

**Publisher (for Copilot Studio solutions):**
```json
{
  "uniqueName": "DefaultPublisherorg60ae70f3",
  "displayName": "Default Publisher for org60ae70f3",
  "prefix": "cr449",
  "optionValuePrefix": 10000
}
```

**Import paths:**
- Copilot Studio agents: Power Platform admin > Solutions > Import
- Power Automate flows: Power Automate > My flows > Import > Import Package (Legacy)

## Development Approach

Full guide: `docs/DEVELOPMENT-APPROACH.md`

### The Principle

**Start in Claude World. Promote when needed.** Build and test locally first, then package for Microsoft's platform only when the solution needs org-wide access (Teams, scheduled triggers, etc.).

### Tiers (most power → most org reach)

| Tier | Method | When to Use |
|------|--------|-------------|
| **1A** | OneDrive Sync | Claude reads/writes files directly — document processing, templates |
| **1B** | MS365 MCP Server (optional) | Claude accesses calendars, email, Teams, files via Graph API — Claude IS the agent. Skip if MCP unavailable. |
| **2A** | Copilot Studio Agent Packages (PREFERRED) | `/generate-copilot-agent` → import. Org-wide AI agents via Teams |
| **2B** | Power Automate Flow Packages (LAST RESORT) | `/generate-pa-package` → import. Only when agents/workflows can't handle it |
| **3A** | Copilot Agent Creator | Natural language agent creation — lowest friction |
| **3B** | Copilot Workflow Creator | Natural language workflows — prefer over Power Automate |
| **3C** | Copilot Studio Agent | Full control agent design — refining imports, triggers, multi-agent |
| **3D** | Copilot Studio Agent Flows | AI-powered flows within agents — approvals, RFI, conditional routing |
| **3E** | Power Automate Portal (LAST RESORT) | Only when nothing above works |

### Platform Investment Hierarchy

**Agents first, Power Automate last.** Microsoft is investing heavily in Copilot Studio and agents — that's where the latest models, MCP servers, and integrations land first. Preference order:

1. Copilot Agents (easiest, most integrated)
2. Copilot Workflows (natural language automation)
3. Copilot Studio Agent Flows (AI-powered flows within agents)
4. Power Automate (last resort — mature but legacy)

### Tool Preference

**Always prefer MCP servers over native connectors.** MCP provides a stabilized, predefined interface — one protocol for calendars, email, files, Teams, SharePoint. Only fall back to native connectors when no MCP server covers the capability needed.

### Decision Flow

1. Does it need to run without Claude? → No: Tier 1. Yes: continue.
2. Does it need AI reasoning? → No: Copilot Workflow (3B) first, Power Automate only as last resort. Yes: continue.
3. Does it need org-wide access via Teams? → No: Claude World. Yes: Copilot Studio agent.
4. How complex is the AI? → Simple: Copilot Agent Creator (3A). Medium: Copilot Studio + Agent Flows (3C/3D). Complex: build in Claude, expose via simpler interface.
5. Does the team need to own/modify it? → Yes: Tier 3 portal. No: Tier 2 package.
6. What tools? → Cross-app: MCP. Single-app: native connector may suffice.
7. (Optional) MS365 MCP available? → Use it for environment discovery and prototyping before packaging.

### Agent Instructions

Copilot agents stall when instructions are ambiguous — they stop and ask instead of proceeding. Write autonomous-first instructions: imperative language, explicit action chains, declared defaults for missing info. Only add user input points where you specifically need them. See full guide in `docs/DEVELOPMENT-APPROACH.md` and `knowledge/BEST-PRACTICES.md`.

## MCP Servers

| Server | Package | What It Does |
|--------|---------|-------------|
| **ms365** | `@softeria/ms-365-mcp-server` | Microsoft 365 access via Graph API — email, calendars, OneDrive, SharePoint, Teams, contacts |

Config: `.mcp.json` in project root. Uses `--org-mode` for work/school accounts.

**First-time auth:** `npx -y @softeria/ms-365-mcp-server --login`

Full setup guide: `docs/SETUP-MS365-MCP.md`

## Knowledge Base

| Document | Purpose |
|----------|---------|
| `knowledge/BEST-PRACTICES.md` | 14-section guide — agent instructions, architecture, knowledge sources, MCP, evaluation, licensing |
| `knowledge/MCP-TOOLS-CATALOG.md` | 8 confirmed MCP servers + pipeline, connectors, tools, triggers, generator gap analysis |

Sourced from 87 video tutorials across 5 channels (Shervin Shaffie, Microsoft Power Platform, Copilot Studio playlist, DamoBird365, Reza Dorrani).

## Setup Docs

- Claude Code (Mac): `docs/SETUP-CLAUDE-CODE-MAC.md`
- MS Dev environment (Mac): `docs/SETUP-MSDEV-MAC.md`
- MS Dev environment (Win): `docs/SETUP-MSDEV-WIN.md`
- Python for Excel/Word (Mac): `docs/SETUP-PYTHON-MAC.md`
- Python for Excel/Word (Win): `docs/SETUP-PYTHON-WIN.md`
- MS365 MCP (Graph API): `docs/SETUP-MS365-MCP.md`
- Admin consent (for IT): `docs/ADMIN-CONSENT-GUIDE.md`
- Power Platform skills: `docs/POWER-PLATFORM-SKILLS.md`
- Connector reference index: `docs/CONNECTOR-REFERENCE-INDEX.md`
