# MCP Tools & Connectors Catalog — Copilot Studio

Reference catalog for all MCP servers, connectors, and tools available in the Microsoft Copilot Studio agent framework. Use this when designing agents to select the right tools for the job.

**Last updated:** 2026-03-05
**Sources:** Shervin Shaffie tutorials, Microsoft Power Platform official (Agent Operative series), DamoBird365, Reza Dorrani, Copilot Studio tutorial playlist, and our generator audit.

---

## MCP Servers in Copilot Studio

MCP (Model Context Protocol) servers are the preferred integration method in Copilot Studio. They replace custom connectors and Power Automate flows with a standardized, pre-configured interface.

**Access:** Copilot Studio > Agent > Tools > Add Tool > MCP tab
**Required URL:** `copilotstudio.preview.microsoft.com` (preview features)

### Confirmed MCP Servers

| MCP Server | Tools Available | Demonstrated In |
|------------|----------------|-----------------|
| **Outlook Mail MCP** | Draft emails, send emails, add attachments, manage recipients | Dec 2025 automation tutorial |
| **Microsoft Word MCP** | Create new Word documents, populate with structured content | Dec 2025 automation tutorial |
| **Meeting Management MCP** | Create calendar invitations, find schedule openings | Dec 2025 automation tutorial |
| **Microsoft Teams MCP** | Send Teams messages, create/reuse chats | Jan 2026 autonomous agent tutorial |
| **Dataverse MCP Server** | `list_tables`, `describe_tables`, `read_query` (NL→SQL), `create_record`, `update_record`, `delete_record` | Reza Dorrani Dec 2025, Copilot Studio playlist Jul 2025 |
| **DocuSign MCP Server** | `send_envelope`, `get_envelope_templates`, `get_current_docusign_account` | Jul 2025 MCP tutorial |
| **Box MCP Server** | File management (newly added Jul 2025) | Jul 2025 MCP tutorial |
| **Microsoft Learn MCP** | `microsoft_doc_search` (semantic vector search against MS docs) | DamoBird365 Jul 2025 — requires custom connector setup |

**Dataverse MCP Server setup:** Requires TDS (Tabular Data Stream) endpoint enabled in environment settings. Admin must configure MCP Client Allow List — Copilot Studio is pre-whitelisted; Power Apps must be added manually with its application ID.

### Coming Soon (MCP Pipeline)

From Microsoft Agent 365 security team (Feb 2026): Dynamics 365, Planner, Fabric IQ, Sentinel, Project, Windows MCP (local + remote) MCP servers are in the pipeline. Tooling Gateway provides standardized control and MCP servers are tested across multiple LLMs for deterministic output.

### Adding External MCP Servers

Copilot Studio only supports **Streamable HTTP** transport — SSE is NOT supported. To add external MCP servers not natively listed, use the custom connector import path from GitHub. See BEST-PRACTICES.md §4.4 for step-by-step process.

### Growing List

Shervin notes "every time I come here I see a new one" — the MCP server list is actively expanding. Check the Add Tool > MCP tab in Copilot Studio for the latest.

### Known Limitations

| MCP Server | Limitation | Workaround |
|------------|-----------|------------|
| Meeting Management MCP | Cannot generate a Teams meeting link | Tell recipient "I'll update with a Teams link after acceptance" |
| Outlook Mail MCP | Connection manager may show "not connected" after auth | Re-authenticate via connection manager in test panel |
| All MCP servers | Per-user authentication required on first use | Include setup instructions in agent deployment docs |

---

## Traditional Connectors (Power Platform)

### In Our Generator's CONNECTOR_CATALOG (Copilot Studio)

These connectors have validated operation IDs in our `generate-copilot-agent.js`:

| Connector | API Name | Operations |
|-----------|----------|-----------|
| **Office 365 Outlook** | `shared_office365` | `V4CalendarGetItems`, `V4CalendarPostItem`, `V4CalendarPatchItem`, `GetEventsCalendarViewV3`, `GetOutlookCategoryNames`, `CalendarDeleteItemV2`, `FindMeetingTimes`, `SendEmailV2`, `GetEmailsV3` |
| **SharePoint Online** | `shared_sharepointonline` | `GetItems`, `PostItem` |
| **Microsoft Teams** | `shared_teams` | `PostMessageToConversation` |
| **Office 365 Users** | `shared_office365users` | `SearchUserV2`, `UserProfile_V2`, `MyProfile_V2` |

### Known Connectors NOT Yet in Our Catalog (Need Adding)

These are referenced in tutorials and used in Power Automate but not yet in our Copilot Studio generator:

| Connector | API Name | Key Operations | Source |
|-----------|----------|---------------|--------|
| **Excel Online** | `shared_excelonlinebusiness` | GetRow, AddRow, UpdateRow, GetTable | Shervin's Excel tutorials |
| **OneDrive for Business** | `shared_onedriveforbusiness` | GetFileContent, CreateFile, ListFolder | Multiple tutorials |
| **Planner** | `shared_planner` | CreateTask, ListTasks, UpdateTask | Workflows Agent tutorial |
| **Approvals** | `shared_approvals` | CreateApproval, WaitForApproval | Workflows Agent tutorial |
| **Dataverse** | `shared_commondataserviceforapps` | GetItems, CreateRecord, UpdateRecord | Multi-agent tutorial |
| **ServiceNow** | `shared_service_now` | ListRecords, CreateRecord, UpdateRecord | ServiceNow connector tutorial |

### Connector Counts in Copilot Studio

| Category | Approximate Count | Notes |
|----------|------------------|-------|
| Total triggers | 869 | Search under "All", not "Featured" (11) |
| Total connectors | 1,800+ | Pre-built, searchable in Add Tool |
| DocuSign connectors (traditional) | 100+ | Replaced by single MCP server |
| Featured triggers | 11 | Most commonly used |

---

## Agent Tool Types (Copilot Studio)

When adding tools to an agent, Copilot Studio offers these categories:

| Tool Type | What It Is | When to Use |
|-----------|------------|-------------|
| **MCP Servers** | Pre-configured external service connections | **First choice.** Replaces custom flows and expressions. |
| **Connectors** | Traditional Power Platform connectors (1,800+ searchable) | When no MCP server exists for the service |
| **REST APIs** | Direct OpenAPI spec 2.0 upload | When you have an API spec but no pre-built connector |
| **Agent Flows** | AI-powered flows with prompts, RFI, approvals | Multi-step operations requiring AI reasoning or human-in-the-loop |
| **Multimodal Prompts** | PDF/image processing with structured output | Document extraction, resume parsing, invoice processing |
| **Prompts** | AI prompt templates | Reusable prompt patterns |
| **Custom Connectors** | User-built API connectors | Proprietary databases/APIs with no pre-built connector |
| **Computer Use** | Virtual mouse + keyboard via hosted browser | Last resort — when only a web UI exists (no API/connector) |

### Tool Selection Decision Tree

```
Need to connect to external service?
├── MCP server available? → Use MCP server
├── Pre-built connector available? → Use connector
├── API exists? → Build custom connector
├── Only web UI? → Use Computer Use (slow, ~5 min per action)
└── None of the above → Build in Claude, expose result via simpler interface
```

---

## Computer Use Tools

Computer Use drives a virtual mouse and keyboard in a hosted browser (powered by Windows 365).

### Pre-Built Templates

| Template | Purpose |
|----------|---------|
| Invoice Processing | Process invoices via web UI |
| Data Entry | Fill forms and enter data |
| Data Extraction | Scrape and extract data from web pages |

### Configuration

| Setting | Value | Notes |
|---------|-------|-------|
| Content moderation | LOW | HIGH blocks credentials in instructions |
| Stored Credentials | Azure Key Vault | Don't put creds in instructions in production |
| Website restrictions | Configure per agent | Can limit which sites the browser accesses |
| Hosted browser | Not Entra-joined | Cannot access internal SharePoint/OneDrive/intranet |

### Performance

- Topic/question flow: ~5 seconds
- Computer Use single action: ~283 seconds (~5 minutes)
- Computer Use full multi-step task: ~786 seconds (~13 minutes, DamoBird365 real demo)
- **Design for autonomous triggers, not real-time interaction**
- CUA is NOT script-based RPA — it makes decisions based on visual screen understanding. If UI changes or error popups appear, it adapts. Script-based RPA would break.

---

## Triggers Reference

### Most Common Triggers for Autonomous Agents

| Trigger | Name in Studio | Notes |
|---------|---------------|-------|
| New email arrives | "When a new email arrives V3" | Search "Outlook email" in All triggers (not Featured) |
| File created | OneDrive/SharePoint triggers | Event-based |
| Schedule | Recurrence trigger | Time-based |
| Teams message | Teams triggers | Message-based |
| Button press | Manual/Button trigger | User-initiated |

### Trigger Best Practices

- Search in "All" tab — only 11 triggers are "Featured" out of 869 total
- Triggers can be filtered (e.g., only emails from specific senders)
- **Delete the trigger to disable an agent** — three dots on trigger > delete. Stops agent without deleting it.

---

## Connection Authentication

### How It Works

1. Agent creator authenticates during build
2. Each end user authenticates on first interaction via Teams
3. MCP servers, connectors, and custom connectors each have their own auth
4. Connection manager accessible via test panel > three dots > manage connections

### Common Issues

| Issue | Fix |
|-------|-----|
| "Not connected" after auth | Re-authenticate via connection manager |
| "Waiting for user" error | Use Developer Tools (F12) > search `copilotstudio.microsoft.com/c2` > open URL > manage connections |
| "Additional permissions required" | Re-authenticate the specific connector |
| Agent sends emails, triggers itself | Create Outlook rule: from [me] → move to [separate folder] |

---

## What Our Generators Support vs. What's Available

### Copilot Studio Agent Generator (`/generate-copilot-agent`)

| Capability | Generator Support | Gap |
|------------|------------------|-----|
| Connectors (4 types) | YES — Outlook, SharePoint, Teams, Users | Need Excel, OneDrive, Planner, Dataverse |
| MCP servers | NO — not in generator | MCP tools are added manually post-import |
| Knowledge sources | NO — componenttype 16 not implemented | Must configure in Studio post-import |
| Autonomous triggers | NO — componenttype 17 not implemented | Must add triggers in Studio post-import |
| Custom topics | PARTIAL — basic SendActivity, Question, BeginDialog | No ConditionGroup, SetVariable, ForEach |
| System topics | YES — 13 hard-coded | Not customizable per agent |
| AI settings | YES — useModelKnowledge, webBrowsing, fileAnalysis | No model selection |
| Orchestration | YES — generative or classic mode | Works |

### Power Automate Generator (`/generate-pa-package`)

| Capability | Generator Support | Gap |
|------------|------------------|-----|
| Any connector | YES — pass-through actions | Must know exact action schema |
| Triggers | YES — any Logic Apps trigger | Works |
| Actions | YES — any Logic Apps actions | No validation |
| Connection references | YES — auto-generated | Environment-specific IDs not portable |

### Actionable Pathway: Best Practices → Package Generation

When using our generators, follow this workflow to ensure best practices are applied:

1. **Write instructions using the template** from Section 1.3 — autonomous-first, explicit tool refs
2. **Select MCP servers first** from the catalog above — only fall back to connectors
3. **Generate the base package** with `/generate-copilot-agent`
4. **Import into Copilot Studio** — the package creates the agent skeleton
5. **Post-import in Studio:**
   - Add MCP tools (Studio > Tools > Add Tool > MCP)
   - Add knowledge sources (SharePoint sites, uploaded docs, URLs)
   - Add triggers for autonomous operation
   - For autonomous agents, change tool auth to "Copilot Author" (not "User Authentication")
   - Enable "Only use specified sources"
   - Disable "Allow AI general knowledge" for focused agents
   - Set model to GPT-5 Auto (or as needed)
   - Configure content moderation level
6. **Test using the 5-scenario protocol** from BEST-PRACTICES.md Section 10
7. **Publish and deploy** to Teams

This hybrid approach (generated skeleton + manual Studio configuration) is the current best path until the generator adds MCP, knowledge source, and trigger support.
