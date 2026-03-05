# Power Platform Package Generation Skills

Claude Code skills that generate importable packages for Copilot Studio agents and Power Automate flows — no manual portal clicking required.

## What's Available

| Skill | Command | Output | Import via |
|-------|---------|--------|------------|
| **Copilot Studio Agent Generator** | `/generate-copilot-agent` | Dataverse solution .zip | Power Platform admin > Solutions > Import |
| **Power Automate Flow Generator** | `/generate-pa-package` | Legacy import package .zip | Power Automate > My flows > Import > Import Package (Legacy) |

Both skills take natural-language descriptions and produce valid .zip packages. No portal work needed to build the package — just describe what you want and Claude Code generates it.

## Copilot Studio Agent Generator

Generates a complete Dataverse solution package containing a Copilot Studio agent. Reverse-engineered from real Copilot Studio exports (Feb 2026).

**Supports:**
- Generative or classic orchestration
- All 13 system topics (ConversationStart, Escalate, Fallback, etc.)
- Connector actions (Office 365 Outlook, SharePoint, Teams, etc.)
- Custom topics
- Agent instructions (system prompt)
- AI settings (model knowledge, file analysis, web browsing)
- Proper connection reference linkage

**Usage:** Tell Claude Code what agent you need:
```
/generate-copilot-agent A scheduling assistant that checks calendar availability, books meetings, and sends confirmation emails using Office 365 Outlook
```

**Post-import:** Open the agent in Copilot Studio to configure connections and publish.

**Full skill reference:** [docs/skills/generate-copilot-agent.md](skills/generate-copilot-agent.md)

## Power Automate Flow Generator

Generates a Power Automate legacy import package with all 5 required files and proper GUID cross-references.

**Supports:**
- Any trigger type (manual button, scheduled, webhook)
- Any connector combination (Outlook, Excel, SharePoint, Teams, Planner, Approvals, Dataverse, etc.)
- Conditions, loops (Apply to each), and action chains
- Proper connection reference mapping

**Usage:** Tell Claude Code what flow you need:
```
/generate-pa-package A daily flow that runs at 8am, reads rows from an Excel table, and creates Outlook calendar events for each row
```

**Post-import:** Configure connector accounts and any environment-specific references (Excel file IDs, SharePoint sites, etc.).

**Full skill reference:** [docs/skills/generate-pa-package.md](skills/generate-pa-package.md)

## Installation

To add these skills to a Claude Code environment, copy the skill files into the project's `.claude/skills/` directory:

```
your-project/
└── .claude/
    └── skills/
        ├── generate-copilot-agent/
        │   └── SKILL.md
        └── generate-pa-package/
            └── SKILL.md
```

The skill files are included in this docs directory at:
- `docs/skills/generate-copilot-agent.md` — copy to `.claude/skills/generate-copilot-agent/SKILL.md`
- `docs/skills/generate-pa-package.md` — copy to `.claude/skills/generate-pa-package/SKILL.md`

### Generator Scripts

The skills call Node.js generator scripts that must also be present in the target project:

| Script | Copy from | Purpose |
|--------|-----------|---------|
| `generate-copilot-agent.js` | `scripts/copilot-studio/generate-copilot-agent.js` | Builds Dataverse solution .zip from agent JSON |
| `generate-pa-package.js` | `scripts/power-automate/generate-pa-package.js` | Builds PA import .zip from flow JSON |

Copy the full `scripts/copilot-studio/` and `scripts/power-automate/` directories to the target project. These are included in this repo.

### Example Definitions

Working examples are included to use as reference:

**Copilot Studio** (`scripts/copilot-studio/scheduling-agent/`):
- `scheduling-agent.json` — Agent definition with Office 365 Outlook connector
- `agent-instructions.md` — Agent system prompt with calendar logic
- `setup-guide.md` — Step-by-step import and configuration guide

**Power Automate** (`scripts/power-automate/flows/`):
- `scheduling-calendar-query.json` — Manual trigger, Outlook calendar query
- `scheduling-find-times.json` — FindMeetingTimes API flow
- `excel-to-calendar.json` — Excel to Outlook calendar integration

## Dataverse as a Connector

Both Copilot Studio agents and Power Automate flows can use Dataverse as a data source. The connector API name is:

```
shared_commondataserviceforapps
```

Common Dataverse operations available in flows:

| Operation | What it does |
|-----------|-------------|
| `ListRecords` | Query rows from a Dataverse table |
| `CreateRecord` | Create a new row |
| `UpdateRecord` | Update an existing row |
| `DeleteRecord` | Delete a row |
| `GetItem` | Get a single row by ID |

For Copilot Studio agents, Dataverse tables can also be added as **knowledge sources** — the agent can search and reason over table data without explicit connector actions.

## Environment Configuration

### Publisher Settings

Each Copilot Studio solution needs a publisher. When deploying to a new environment, update the publisher block in the agent definition JSON:

```json
{
  "publisher": {
    "uniqueName": "YourPublisher",
    "displayName": "Your Publisher Name",
    "prefix": "your_prefix",
    "optionValuePrefix": 10000
  }
}
```

Find your environment's publisher in Power Platform admin center > Solutions > look at existing solutions.

### Required Licensing

- **Copilot Studio agents:** Require Microsoft Copilot Studio license for the environment
- **Power Automate flows:** Require Power Automate license (per-user or per-flow)
- **Dataverse connector:** Included with Power Platform licensing, but premium connectors may require Power Apps/Automate Premium
