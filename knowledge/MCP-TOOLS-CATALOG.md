# MCP Tools & Connectors Catalog — Copilot Studio

Reference catalog for all MCP servers, connectors, and tools available in the Microsoft Copilot Studio agent framework. Use this when designing agents to select the right tools for the job.

**Last updated:** 2026-03-05
**Sources:** Copilot Studio Add Tool > MCP tab (March 2026, React state extraction), Microsoft Learn connector reference docs, Agent 365 MCP server reference docs, Shervin Shaffie tutorials, Microsoft Power Platform official (Agent Operative series), DamoBird365, Reza Dorrani, Copilot Studio tutorial playlist, and our generator audit.

---

## MCP Servers in Copilot Studio

MCP (Model Context Protocol) servers are the preferred integration method in Copilot Studio. They replace custom connectors and Power Automate flows with a standardized, pre-configured interface.

**Access:** Copilot Studio > Agent > Tools > Add Tool > MCP tab
**Required URL:** `copilotstudio.preview.microsoft.com` (preview features)
**Total count:** 46 MCP servers (as of March 2026)

### Complete MCP Server Catalog

> **Full tool-level reference:** See [`MCP-SERVER-TOOLS-REFERENCE.md`](MCP-SERVER-TOOLS-REFERENCE.md) for every tool name, parameters, and usage notes.

#### Microsoft Agent 365 MCP Servers (Enterprise-Grade)

These are Microsoft's first-party MCP servers, documented at [learn.microsoft.com](https://learn.microsoft.com/en-us/microsoft-agent-365/tooling-servers-overview). They go through the Agent 365 Tooling Gateway with governance, DLP, MIP, and Defender observability. Some require the [Frontier preview program](https://adoption.microsoft.com/copilot/frontier-program/).

| MCP Server | Server ID | Tools | Purpose |
|------------|-----------|-------|---------|
| **Microsoft Outlook Mail MCP** | `mcp_MailTools` | 10 | Create/send/search emails, reply, draft management, KQL search |
| **Microsoft Outlook Calendar MCP** | `mcp_CalendarTools` | 11 | Create/update/delete events, accept/decline, find meeting times, free/busy |
| **Microsoft Teams MCP** | `mcp_TeamsServer` | 25 | Chat CRUD, channel CRUD, post messages, member management |
| **Microsoft SharePoint & OneDrive MCP** | `mcp_ODSPRemoteServer` | 17 | Files, folders, sites, libraries, sharing, sensitivity labels |
| **Microsoft Word MCP** | `mcp_WordServer` | 4 | Create docs, read content, add/reply to comments |
| **Microsoft 365 User Profile MCP** | `mcp_MeServer` | 6 | User profiles, org hierarchy, people search |
| **Microsoft 365 Copilot Search MCP** | `mcp_M365Copilot` | 1 | Cross-M365 content search with multi-turn conversation |
| **Microsoft Dataverse MCP** | (env-specific) | 11 | Tables CRUD, record CRUD, T-SQL queries, keyword search |
| **Microsoft SharePoint Lists MCP** | — | — | SharePoint list operations (not yet detailed in docs) |
| **Microsoft 365 Admin Center MCP** | — | — | Admin center management (not yet detailed in docs) |
| **Microsoft Fabric MCP** | — | — | Fabric data analytics (not yet detailed in docs) |

**Total Agent 365 tools: 85+** across 8 documented servers.

**IT Admin governance:** Managed in Microsoft 365 admin center under Agents and Tools. Admins can allow/block servers org-wide. All tool calls are traceable in Microsoft Defender Advanced Hunting.

#### Copilot Studio MCP Servers (Connector-Wrapped)

These 38 MCP servers appear in the Copilot Studio "Add Tool > MCP" tab. They wrap Power Platform connectors as MCP interfaces, communicating via JSON-RPC. Tool lists are negotiated at runtime through the MCP protocol (`tools/list`) — they are not listed in the connector documentation.

**Architecture:** Two types exist:
- **Named MCP operations** (`mcp_*`, `msdyn_*`) — Pre-defined tool sets built by Microsoft, scoped to a specific domain (email, calendar, sales, etc.)
- **Pass-through servers** (`InvokeMCP`, `InvokeServer`) — Generic Streamable HTTP endpoints where the remote vendor defines and controls the tool list

##### Microsoft 365 — Email, Calendar, Contacts

| MCP Server | Operation ID | Connector | Tier | Purpose |
|------------|-------------|-----------|------|---------|
| **Email Management MCP Server** | `mcp_EmailsManagement` | `shared_office365` | Standard | Draft/send emails, manage recipients, attachments |
| **Meeting Management MCP Server** | `mcp_MeetingManagement` | `shared_office365` | Standard | Create calendar invitations, find schedule openings |
| **Contact Management MCP Server** | `mcp_ContactsManagement` | `shared_office365` | Standard | Manage Outlook contacts |

[Connector docs](https://learn.microsoft.com/connectors/office365/)

##### Microsoft Dataverse

| MCP Server | Operation ID | Connector | Tier | Purpose |
|------------|-------------|-----------|------|---------|
| **Microsoft Dataverse MCP Server** | `InvokeMCP` | `shared_commondataserviceforapps` | Premium | Remote MCP access to Dataverse |
| **Microsoft Dataverse MCP Server (Preview)** | `InvokeMCPPreview` | `shared_commondataserviceforapps` | Premium | Remote MCP access with preview tools |
| **Dataverse MCP Server (Deprecated)** | `mcp_DataverseMCPServer` | `shared_commondataserviceforapps` | Premium | Legacy — use Microsoft Dataverse MCP Server |

**Setup:** Requires TDS (Tabular Data Stream) endpoint enabled in environment settings. Admin must configure MCP Client Allow List — Copilot Studio is pre-whitelisted; Power Apps must be added manually with its application ID.

[Connector docs](https://learn.microsoft.com/connectors/commondataserviceforapps/)

##### Dynamics 365

| MCP Server | Operation ID | Connector | Tier | Purpose |
|------------|-------------|-----------|------|---------|
| **Dynamics 365 Business Central MCP (Preview)** | `InvokeMCP` | `shared_dynamicssmbsaas` | Premium | ERP operations for small/mid business |
| **Dynamics 365 Contact Center Admin MCP Server (Preview)** | `msdyn_D365ContactCenterAdminMCPServer` | `shared_d365contactcenteradminmcpserver` | Premium | Contact center administration |
| **Dynamics 365 Contact Center MCP (Preview)** | `mcp_ContactCenterMCPServer` | `shared_commondataserviceforapps` | Premium | Contact center data operations |
| **Dynamics 365 Conversation Orchestrator MCP (Preview)** | `mcp_ConversationOrchestratorMCPServer` | `shared_commondataserviceforapps` | Premium | Conversation routing and orchestration |
| **Dynamics 365 Customer Service MCP Server (Preview)** | `msdyn_ServiceMCPServer` | `shared_d365customerservicemcpserver` | Premium | Customer service case management |
| **Dynamics 365 ERP Analytics MCP (Preview)** | `msdyn_ERPAnalyticsMCPServer` | `shared_d365erpmcpserver` | Premium | ERP reporting via Business Performance Analytics |
| **Dynamics 365 ERP MCP** | `InvokeMCP` | `shared_dynamicsax` | Premium | Finance & Operations ERP |
| **Dynamics 365 Sales MCP (Preview)** | `msdyn_SalesMCPServer` | `shared_d365salesmcpserver` | Premium | Sales pipeline, leads, opportunities |
| **Dynamics 365 ERP MCP (Deprecated)** | `mcp_ERPMCPServer` | `shared_commondataserviceforapps` | Premium | Legacy — use Dynamics 365 ERP MCP |
| **D365 Sales MCP Server (deprecated)** | `mcp_SalesMCPServer` | `shared_commondataserviceforapps` | Premium | Legacy — use Dynamics 365 Sales MCP |
| **D365 Service MCP Server (Deprecated)** | `mcp_ServiceMCPServer` | `shared_commondataserviceforapps` | Premium | Legacy — use Dynamics 365 Customer Service |

##### Data & Analytics

| MCP Server | Operation ID | Connector | Tier | Purpose |
|------------|-------------|-----------|------|---------|
| **Azure Databricks Genie** | `InvokeGenieMCP` | `shared_databricks` | Premium | AI-powered data querying on Azure Databricks |
| **Databricks Genie** | `InvokeGenieMCP` | `shared_databricksinc` | Premium | Databricks data querying (non-Azure) |
| **Bigdata.com MCP endpoint** | `InvokeServer` | `shared_bigdatacom` | Premium | Big data analytics |
| **CData Connect AI** | `InvokeMCP` | `shared_cdataconnectai` | Premium | Universal data connectivity (350+ sources) |
| **Kusto Query MCP Server** | `mcp_KustoQueryManagement` | `shared_kusto` | Premium | KQL queries against Azure Data Explorer |
| **LSEG data and analytics** | `InvokeServer` | `shared_lseg` | Premium | Financial data (London Stock Exchange Group) |
| **Morningstar MCP Server** | `InvokeServer` | `shared_morningstar` | Premium | Investment research and financial data |

##### Security & IT Operations

| MCP Server | Operation ID | Connector | Tier | Purpose |
|------------|-------------|-----------|------|---------|
| **Microsoft Sentinel - Data Exploration MCP Server** | `invokemcpdataexploration` | `shared_sentinelmcp` | Premium | Search tables and query Sentinel data lake via natural language |
| **Intelix IOC Analysis** | `InvokeMCP` | `shared_intelixiocanalysismc` | Premium | File, URL, IP threat analysis with reputation lookup |
| **Environment Management MCP Server** | `mcp_EnvironmentManagement` | `shared_powerplatformadminv2` | Standard | Power Platform environment lifecycle management |

##### DevOps & Project Management

| MCP Server | Operation ID | Connector | Tier | Purpose |
|------------|-------------|-----------|------|---------|
| **Github MCP Server** | `InvokeMCPServer` | `shared_github` | Standard | Repos, issues, PRs, code search |
| **Jira MCP Server** | `mcp_JiraIssueManagement` | `shared_jira` | Premium | Issue tracking, project management |
| **monday.com MCP** | `InvokeMondayMCP` | `shared_mondaycom` | Premium | Work management boards and items |
| **Process Street MCP Server** | `InvokeMCP` | `shared_processstreetmcpserv` | Premium | Workflows, runs, tasks, form fields, data sets |

##### Document & Content Management

| MCP Server | Operation ID | Connector | Tier | Purpose |
|------------|-------------|-----------|------|---------|
| **Box MCP Server** | `InvokeMCP` | `shared_boxmcpserver` | Premium | Search content, ask questions on docs, extract insights |
| **Docusign MCP Server** | `mcp_Docusign` | `shared_docusigndemo` | Standard | Create/commit/manage agreements across lifecycle |
| **Microsoft Learn Docs MCP Server** | `microsoft_docs_search` | `shared_microsoftlearndocsmcpserver` | Premium | Semantic search across Microsoft Learn content |

##### Sales, Marketing & Intelligence

| MCP Server | Operation ID | Connector | Tier | Purpose |
|------------|-------------|-----------|------|---------|
| **MCP server for Salesforce** | `mcp_SalesforceManagement` | `shared_salesforce` | Premium | CRM — leads, contacts, opportunities, accounts |
| **Enlyft MCP** | `InvokeServer` | `shared_enlyftmcp` | Premium | B2B account intelligence, tech adoption signals, fit scores |
| **Invoke Highspot MCP Production Server** | `InvokeServer` | `shared_highspotmcptestjan20` | Premium | Sales enablement — content, training, analytics |
| **Draup MCP Server** | `InvokeMCP` | `shared_draupmcpserver` | Premium | Company, industry, and market ecosystem intelligence |

##### Business Process & Automation

| MCP Server | Operation ID | Connector | Tier | Purpose |
|------------|-------------|-----------|------|---------|
| **Celonis MCP Server** | `InvokeServer` | `shared_celonismcpserver` | Premium | Process mining, real-time context, trigger external actions |
| **Process Mining MCP (Preview)** | `InvokeMCP` | `shared_processmining` | Premium | Microsoft Process Mining analytics |
| **Experlogix Smart Flows MCP Server** | `InvokeMCP` | `shared_experlogixsmartflows` | Premium | Document automation and CPQ |
| **Zapier MCP** | `InvokeServer` | `shared_zapiermcp` | Premium | Connect to 7,000+ apps via Zapier |

##### Industry & Specialty

| MCP Server | Operation ID | Connector | Tier | Purpose |
|------------|-------------|-----------|------|---------|
| **Ezekia** | `InvokeServer` | `shared_ezekiamcp` | Premium | Executive search / recruitment CRM (natural language CRUD) |
| **Gieni Actions for fetching answers** | `GieniTSserver` | `shared_gienitsservermcp` | Premium | AI data fetching and analytics |
| **Mobile Text Alerts MCP Server** | `InvokeServer` | `shared_mobiletextalertsmcps` | Premium | SMS messages, subscriber management |
| **Store Operations MCP (Preview)** | `InvokeMCP` | `shared_storeoperationsmcpserver` | Premium | Retail store operations insights and recommendations |

### MCP Pipeline (Coming Soon)

From Microsoft Agent 365 security team (Feb 2026): Planner, Fabric IQ, Project, and Windows MCP (local + remote) are still in the pipeline. Tooling Gateway provides standardized control and MCP servers are tested across multiple LLMs for deterministic output.

**Note:** Dynamics 365 and Sentinel MCP servers, previously listed as "coming soon," are now live (see catalog above).

### Adding External MCP Servers

Copilot Studio only supports **Streamable HTTP** transport — SSE is NOT supported. To add external MCP servers not natively listed, use the custom connector import path from GitHub. See BEST-PRACTICES.md §4.4 for step-by-step process.

### Known Limitations

| MCP Server | Limitation | Workaround |
|------------|-----------|------------|
| Meeting Management MCP | Cannot generate a Teams meeting link | Tell recipient "I'll update with a Teams link after acceptance" |
| Email Management MCP | Connection manager may show "not connected" after auth | Re-authenticate via connection manager in test panel |
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
