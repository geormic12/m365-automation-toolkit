# Copilot Studio & Power Automate Best Practices

Best practices for building Microsoft Copilot Studio agents, Power Automate workflows, and Microsoft 365 automations. Sourced from Shervin Shaffie (Principal Technical Specialist, Microsoft Copilot) and validated against real build experience.

**Recency weight:** 2026 content > 2025 > 2024. Newer practices supersede older ones where they conflict.

**Sources:** 32 videos from [Collaboration Simplified](https://www.youtube.com/@CollaborationSimplified) (Shervin Shaffie, May 2023 – Feb 2026), 15 from [Microsoft Power Platform](https://www.youtube.com/@MicrosoftPowerPlatform) (Agent Operative series, Jan-Mar 2026), 14 from Copilot Studio tutorial playlist, 17 from [DamoBird365](https://www.youtube.com/@DamoBird365), 9 from [Reza Dorrani](https://www.youtube.com/@RezaDorrani). Cross-referenced with our generator audit.

---

## 1. Agent Instruction Writing

The single highest-impact area. Instructions determine whether an agent works autonomously or stalls.

### 1.1 Autonomous-First (MANDATORY)

Copilot agents stop and ask the user whenever ambiguity exists. This is the #1 cause of broken agents.

**Rules:**
- Use imperative language: "Look up the calendar. Find the next slot. Book it."
- Explicitly state autonomy: "You are autonomous. If you have a question, don't ask me — just execute."
- Add "without asking for permission" and "send immediately" to action steps
- Declare defaults for missing info: "If no date specified, use current week"
- Chain actions explicitly: "After retrieving files, filter to .xlsx, then summarize each"

**Anti-patterns:**
- "You could check..." or "Maybe find..." (hedging language)
- Leaving an action step without explicit send/execute instruction
- Expecting the agent to infer action chains

**Source:** Videos from Jan 2026, Dec 2025, Apr 2025, Feb 2025 — consistent across all autonomous agent tutorials.

### 1.2 Tool References in Instructions

Tools must be referenced in TWO places: the instruction text AND the Tools section.

**Rules:**
- Name the exact tool for each action: "Use the Move Email V2 tool to move emails"
- Use slash notation in instructions: `/tool-name` brings up available tools while editing
- For MCP tools that don't appear in slash menu, reference by name in instructions AND add in Tools section manually

**Anti-pattern:** Adding a tool in the Tools section but not mentioning it in instructions — the agent may never use it.

### 1.3 Instruction Structure Template

```
You are [agent name] for [Your Organization].

Your job: [one sentence — what this agent does].

IMPORTANT: You are autonomous. Do not ask me questions. Execute every step without waiting for confirmation.

## How You Work
1. [First action — imperative, naming specific tool].
2. [Second action — what to do with the result].
3. [Third action — how to present the answer].

## Output Format
- [HTML/text/table specification]
- [Tone: professional/friendly]
- [Include links to sources]

## Rules
- [Constraint: "Do not use knowledge sources other than those specified"]
- [Default: "If no date specified, use current week"]
- [Error handling: "If a tool call fails, report the error via Teams message"]

## Safety & Moderation
- [Restricted topics: "Do not discuss competitor products or pricing"]
- [Content limits: "Do not include citations in emails to external recipients"]
- [Disclosure: "Identify yourself as an AI assistant at the start of each conversation"]

## When to Ask the User
- Only ask if [specific condition where input is truly needed].
- For everything else, proceed with defaults above.
- [Escalation: "If confidence is below 80%, escalate to [human/Teams channel]"]
```

**Source:** Microsoft Agent Operative series (Mission 2, Feb 2026) recommends 5 sections: Overview, Process Steps, Collaboration Points, Safety/Moderation, Feedback Loop.

### 1.4 Knowledge Source Descriptions

The description field on knowledge sources determines when the agent selects them. Vague descriptions = wrong source selection.

**Rules:**
- Be verbose and specific: "This SharePoint folder contains all candidate resumes for open positions at [your organization]"
- Describe content type, scope, and intended use
- If the agent picks the wrong source, fix the description first

### 1.5 Classification Logic

For agents that categorize inputs (email sorting, ticket routing):

- Define categories explicitly — don't rely on inference
- Account for ambiguous sources: "Customer emails can come from internal or external senders"
- Include a catch-all: "Everything Else" category
- Pre-create all infrastructure (folders, channels, chats) before deploying

### 1.6 Deep Reasoning Activation

To use deep reasoning models in Copilot Studio:
1. Enable in Settings > GenAI > Deep Reasoning (Preview)
2. Include "use reason" in the agent's instructions (e.g., "use reason to provide a response")
3. Both steps are required — enabling in settings alone is not sufficient

---

## 2. Agent Architecture Patterns

### 2.1 The Agent Spectrum

Build progressively — each tier builds on the previous:

| Tier | Tool | Capabilities | When to Use |
|------|------|-------------|-------------|
| Retrieval | Agent Builder (M365 Copilot) | Search + reason over knowledge sources | FAQ, knowledge Q&A |
| Task-based | Copilot Studio | Read/write external systems via connectors/MCP | Look up data, create records |
| Autonomous | Copilot Studio + Triggers | Event-driven, runs independently | Email processing, monitoring |

### 2.2 Agent Builder → Copilot Studio Pipeline

**Prototyping path:**
1. Build quickly in Agent Builder (Describe tab, natural language)
2. Test and iterate
3. Export to Copilot Studio via three-dot menu > "Copy to Copilot Studio"
4. Add triggers, MCP tools, topics, and advanced configuration in Studio

This is now a legitimate two-tier workflow — Agent Builder is not a toy.

### 2.3 Multi-Agent Orchestration (Parent/Child)

Use when agent sprawl becomes a problem (too many standalone agents).

**Architecture:**
```
Master Agent (Orchestrator)
├── Child Agent A (e.g., Balance inquiry)
├── Child Agent B (e.g., Transfer funds)
├── Child Agent C (e.g., Lost card)
└── Child Agent D (e.g., Branch locations)
```

**Rules:**
- Master agent instructions can be minimal: "You are aware of three other agents. Based on user input, decide which to engage."
- Each child agent has its own instructions, tools, and knowledge sources
- Child agent descriptions matter for routing — better descriptions = better routing
- Use `/agent/[name]` in instructions for explicit routing (optional — AI can figure it out)
- Uninstall individual child agents from users once the master agent works
- Enable orchestration in master agent settings

**Three sub-agent types:**

| Feature | Lightweight Agents | Connected Agents | External Agents (A2A) |
|---------|-------------------|------------------|----------------------|
| Best for | Simple sub-tasks, single team | Multiple teams, separate configs | Cross-platform (Google Cloud, etc.) |
| Config | Shared with parent | Own auth and settings | Own platform, exposed via agent card |
| Platform | Same Copilot Studio | Studio, Fabric, Azure AI Foundry | Any A2A-compatible platform |
| Publishing | Not required for testing | Must be published first | Must expose agent card endpoint |
| Setup | Built inside parent agent | Added as connected agent in Studio | Tools > External Agent > paste agent card URL |

**A2A Protocol (Preview):** Copilot Studio agents can connect to external AI agents on any platform via the Agent-to-Agent protocol. The external agent exposes a JSON "agent card" at a URL endpoint. Copilot Studio reads the card, auto-creates a custom connector, and the external agent becomes callable like any other sub-agent. Auth options: None, API Key, OAuth2.

### 2.4 Event-Driven Autonomous Agent

The full autonomous pattern:

1. **Trigger:** Event-based (e.g., "When a new email arrives V3")
2. **Classification:** Analyze input against predefined categories
3. **Action:** Execute based on classification (move email, create record, etc.)
4. **Notification:** Send Teams message for urgent items
5. **Reporting:** Summary on every run, success or failure

**Critical gotchas:**
- **Publish to activate:** Autonomous agents do NOT run until published. Testing works pre-publish, but triggers only fire after Publish.
- **Authentication must be "Copilot Author":** By default, action auth is "User Authentication." For autonomous agents, change to "Copilot Author" — there's no user context for triggers. Path: Actions > [action] > End User Authentication > change to "Copilot Author."
- **Email loop prevention:** Create an Outlook rule to prevent email loops when agents send emails. Add subject filters on triggers.
- **Trigger delay:** Email triggers take ~2 minutes to fire. Subject filters are literal string matches — "request a return" ≠ "request to return."
- **Flow response timeout:** When an agent calls a flow, the flow must respond within 100-120 seconds or the agent errors. For long operations, use a "respond immediately" action at the start.
- **Convert trigger to Copilot Studio plan:** After creating a trigger, edit in Power Automate > change plan to "Copilot Studio" to use Copilot Studio capacity instead of Power Automate billing.

### 2.5 Workflows Agent (Conversational Automation)

The Workflows Agent (Frontier program, Nov 2025+) creates full automations from a single prompt:

- Generates trigger + analysis + actions automatically
- Replaces manual Copilot Studio configuration for simple automations
- Cross-app: Outlook, Teams, SharePoint, Approvals, Planner
- Activity monitoring shows real-time execution

**Prompt structure:** "When [trigger], check for [condition]. If [condition met], use [sources] to [action]. Then [additional action]. Sign off as [identity]."

---

## 3. Knowledge Source Architecture

### 3.1 Core Rules

1. **Enable "Only use specified sources"** — this is the primary defense against hallucination. OFF by default.
2. **Disable "Allow AI to use its own knowledge"** when you want focused, org-specific answers
3. **Use SharePoint document libraries** as the primary knowledge store
4. **One SharePoint site per project** — not one site for everything
5. **SharePoint permissions = Agent permissions** — users who can't access the files won't get answers from them
6. **Knowledge sources auto-update** — when someone updates a SharePoint document, the agent picks up the changes

### 3.2 SharePoint Vector Indexing (HIGH IMPACT)

Without an M365 Copilot license in the tenant, SharePoint knowledge uses **keyword indexing only** — 7 MB file limit, literal string matching. With **even one M365 Copilot license ($30/mo) in the entire tenant**, SharePoint gets **vector/semantic indexing** — 512 MB file limit, synonym queries, nuanced multi-document reasoning. This is the single highest-impact quality improvement available.

Also: enabling generative orchestration (Settings > Generative AI) provides a significant uplift even without the license — the LLM uses AI to understand intent rather than keyword matching.

**Two SharePoint integration methods in Copilot Studio (important distinction):**
1. **Top button (files/documents):** Syncs SharePoint files INTO Dataverse. Stronger semantic index, faster. Has capacity limits.
2. **Bottom "SharePoint" button:** Queries SharePoint index directly. No Dataverse sync. Only option for SharePoint Pages. Only works with modern pages.

### 3.3 Knowledge Source Types

| Type | Access | Notes |
|------|--------|-------|
| SharePoint sites/folders | Licensed agents | Primary for org knowledge. Always add descriptions. Two integration methods — see above. |
| SharePoint Lists | Licensed agents | Real-time (no indexing delay), supports 10K+ rows, up to 15 lists per agent. Authenticated access only. |
| Uploaded files | All agents | 7 MB limit (no M365 license) or 512 MB (with license). Indexed into Dataverse. Static — won't auto-update. |
| Public URLs | All agents (including free Copilot Chat) | Max 4 URLs. Crawler goes deeper than 2 levels if hierarchy is clean. |
| Dataverse tables | Licensed agents | Add via Knowledge > Dataverse. Supports synonyms and glossary per column/table. Allow 10-15 min indexing. |
| Teams chats/channels | Licensed agents | Meeting context, team discussions |
| OneDrive files | Licensed agents | Personal or shared files |
| Confluence | Licensed agents | Announced at Build 2025 |
| Web search toggle | All agents | Uses Bing-indexed public web — disable for focused agents |

**Excel is NOT a supported knowledge source.** Simple single-value lookups sometimes work; list/array queries always fail. Move data to Dataverse or use connector tools instead.

**Knowledge instructions (Preview):** You can now attach instructions to individual knowledge sources, telling the LLM WHEN and HOW to use that specific source. Separate from agent-level instructions.

### 3.4 Workaround for Free Copilot Chat Agents

Free Copilot Chat can only add public URLs as knowledge sources. Workaround: include "Ask me for the file" in the agent's instructions, then attach documents at runtime during conversation.

---

## 4. MCP in Copilot Studio

MCP (Model Context Protocol) is the preferred integration method. See [MCP-TOOLS-CATALOG.md](MCP-TOOLS-CATALOG.md) for the full tool reference.

### 4.1 Why MCP Over Connectors

- **Eliminates custom flows and expressions** — no Power Automate flows, no formula coding
- **Pre-configured tools** — server's tool descriptions guide the LLM automatically
- **Single server = multiple tools** — one DocuSign MCP server replaces 100+ individual connectors
- **No instructions or knowledge needed** for basic functionality — the MCP server's built-in descriptions are often sufficient
- Shervin explicitly states MCP is "a lot more comfortable to use than the other connectors"

### 4.2 MCP Architecture in Copilot Studio

```
Host (Copilot Studio) → Client (Power Platform tools) → Server (MCP server) → End Application
```

Think of MCP like USB-C: a standardized way to connect AI models to data sources and tools.

### 4.3 MCP Best Practices

- **Start with MCP servers before building custom connectors**
- **Set "Ask end user before running" to No** for autonomous operation
- **Connection authentication is per-user** — each user must authenticate on first use
- **Templates/prerequisites must exist** — MCP servers expect the target system to be configured (e.g., DocuSign templates)
- **Connection manager issues are common** — re-authenticate if test shows "not connected"
- **Always use `copilotstudio.preview.microsoft.com`** for access to all MCP preview features

### 4.4 Adding External MCP Servers

Copilot Studio only supports **Streamable HTTP** transport. SSE (Server-Sent Events) is NOT supported.

To add an MCP server not natively listed:
1. In Copilot Studio: Tools > New Tool > Custom Connector → opens `make.powerapps.com`
2. Click "Import from GitHub" > Custom > **dev branch** > select MCP Streamable connector
3. Configure host URL (domain in "Host", path in "Base URL", remove `https://`)
4. Name the connector and Create
5. Return to Copilot Studio, refresh, filter by MCP — may take **up to 5 minutes** to appear
6. All tools from the MCP server become available automatically

**Source:** DamoBird365, Jul 2025

---

## 5. Model Selection

### 5.1 Available Models (as of Mar 2026)

| Model | Best For | Notes |
|-------|----------|-------|
| GPT-4.1 | **Current default** for new agents | Good structure, may not follow date formatting precisely |
| GPT-5 Auto | Let system choose | Shervin's default for autonomous agents |
| GPT-5 Chat | Detailed, suggestive | Offers follow-up suggestions, applies bold formatting |
| GPT-5.2 | Best OpenAI reasoning | Available in Excel Agent Mode |
| GPT-5 Reasoning | Deep analysis | Slower, more thorough |
| Claude Sonnet 4.5 | Concise, shows reasoning | Exposes thought process, follows formatting well. Experimental in Studio. |
| Claude Opus 4.5 | Alternative perspective | Available in Excel, Researcher agent |

**30-day grace period:** When Microsoft upgrades to newer model versions, agents are auto-migrated. You get 30 days to keep using a retired model via "continue using retired model" setting.

**Admin model controls:** Tenant admins control model availability via M365 Admin Center AND Power Platform Admin Center (both must be enabled). Settings include: allow Anthropic models, enable preview/experimental models, permit data movement across regions.

### 5.2 Model Selection Guidelines

- **Default for new agents:** GPT-4.1 (changed from GPT-4o)
- **Autonomous agents:** GPT-5 Auto (Shervin's recommendation)
- **Agent Mode in Excel:** Auto (system chooses between GPT-5.2 and Claude)
- **Cross-reference:** Test with multiple models; different models have different strengths
- **Security note:** Anthropic Claude routes through Anthropic's servers, not Microsoft's — enterprise data protection shield grays out

---

## 6. Settings Checklist

### 6.1 Per-Agent Settings

| Setting | Recommended | Why |
|---------|-------------|-----|
| Only use specified sources | ON | Prevents hallucination |
| Allow AI general knowledge | OFF (for focused agents) | Forces use of your knowledge sources |
| GenAI orchestration | ON | Required for autonomous operation |
| Content moderation | LOW for Computer Use agents | HIGH blocks credentials in instructions |
| Web search | OFF unless needed | Reduces noise from internet results |
| Code Interpreter | ON (nothing to lose) | Enables chart/graph generation |
| Image generation | ON if needed | Must be explicitly enabled |
| Document/code generation | ON if needed | Must be explicitly enabled, OFF by default |

### 6.2 Publishing Checklist

1. Click Save explicitly (don't rely on autosave)
2. Change security settings if needed (default: Entra ID. For external: "No Authentication")
3. Click Publish — **autonomous agents don't run until published**
4. Select target channel(s) — Teams, web embed, SharePoint, Slack, WhatsApp, mobile, ~15 total
5. Copy availability link → share with users
6. Each user must authenticate MCP/connector connections on first use

---

## 7. Security & Governance

### 7.1 What Copilot Does NOT Do

- **Does NOT change your data security posture** — it exposes existing permission holes
- **LLM does NOT retain user data** — pure interpreter, no learning from your prompts
- **Has NO memory across sessions** — the Semantic Index (per-user personalization) is often mistaken for memory

### 7.2 What You Must Do

1. **Review SharePoint permissions regularly** — who has access? Should they?
2. **Know where sensitive data is stored** — don't dump data without considering access
3. **Label data with sensitivity labels** — these propagate automatically to Copilot Pages
4. **Implement DLP policies** via Microsoft Purview
5. **Don't share autonomous agents that use your credentials** — each person must create their own
6. **Restrict SharePoint search** (up to 100 sites) as a safety net if labels aren't fully deployed

### 7.3 Credential Security

- **Use Stored Credentials (Azure Key Vault)** for production agents — not inline in instructions
- **Per-user authentication** for MCP servers and connectors
- Putting credentials in instructions is OK for demos, NOT for production

---

## 8. Licensing Reference

### 8.1 Quick Check

The "Work and Web" tab in M365 Copilot app = full $30/user/month license.

### 8.2 Tier Comparison

| Feature | Copilot Chat (Included) | M365 Copilot ($30/user/mo) |
|---------|------------------------|----------------------------|
| AI Chat | Web-grounded only | Tenant-grounded |
| Enterprise Data Protection | Yes | Yes |
| File attachment & analysis | Yes | Yes |
| Copilot in Word/Excel/PPT/Outlook/Teams | No | Yes |
| Agent creation | Yes (limited) | Yes (full) |
| Agents with SharePoint/Graph connectors | Metered | Included |
| Autonomous agent actions | Metered | Metered |
| Agent Builder | No | Yes |
| Excel Agent Mode | No | Yes |

### 8.3 Agent Pricing

| Event Type | Messages per Event | Cost per Message |
|------------|-------------------|------------------|
| Classic answer | 1 | ~$0.008 |
| Generative answer | 2 | ~$0.016 |
| Autonomous action | 25 | ~$0.20 |
| Graph grounding | 30 | ~$0.24 |

- Copilot Studio: $200/month = 25,000 messages
- Typical agent transaction: ~32 messages = ~$0.25

### 8.4 Zero-Cost Agent Strategy (Sep 2025+)

Since September 1, 2025, agents built in Copilot Studio and deployed to Teams/M365 Copilot consume **zero billed credits** for users with M365 Copilot licenses ($30/mo). This includes standard AND premium connectors, custom connectors, AI Builder prompts, agent flow actions, and generative orchestration. **Only exception:** Autonomous agent actions still have a cost.

**Verification:** Power Platform Admin Center > Licensing > Copilot Studio Usage. Check "Billed Copilot Credits" vs. "Non-Billed Copilot Credits."

**Agent Flows licensing:** Agent flows use Copilot Studio message capacity (not Power Automate licenses). Premium connectors and AI Builder are included. Cost: ~13¢ per 100 API calls.

**Source:** DamoBird365, Nov 2025

---

## 9. Enterprise Deployment (from Microsoft's 330K Rollout)

1. **Governance first** — tenant hygiene, sensitivity labels, DLP, restricted SharePoint search
2. **Deploy to entire teams, not individuals** — isolated users don't collaborate; whole teams do
3. **IT gets it first** (they support everyone else)
4. **Sales/support second** (highest business impact)
5. **Build connectors to LOB tools** in the optimization phase (ServiceNow, SAP, Workday)
6. **Multi-modal training** at multiple difficulty levels (beginner/intermediate/advanced)
7. **Champions program** — enthusiastic users get extra training, train their teams
8. **Executive visible usage** drives adoption
9. **Feedback channels are essential** — early users MUST provide feedback

---

## 10. Testing Protocol

### 10.1 Agent Testing Scenarios

1. **Happy path** — give exactly what the agent expects. Does it complete without stalling?
2. **Missing info** — omit something optional. Does it proceed with defaults or hang?
3. **Tool failure** — connector returns no results or errors. Does the agent recover?
4. **Ambiguous request** — vague prompt. Does it make a reasonable decision or ask 5 questions?
5. **Edge cases** — unknown categories, missing folders, unexpected data formats

If the agent asks the user something you didn't explicitly intend, the instructions need tightening.

### 10.2 Computer Use Testing

Computer Use is slow (~5 minutes per action). Design for autonomous execution, not real-time interaction.

- Set content moderation to LOW
- Write step-by-step browser instructions (click by click)
- Pre-create any templates or records the tool needs
- Test with the hosted browser (not Entra-joined to your tenant)

---

## Key URLs

| Resource | URL |
|----------|-----|
| M365 Copilot App | `m365copilot.com` |
| Copilot Studio (Preview) | `copilotstudio.preview.microsoft.com` |
| Copilot Studio (Standard) | `copilotstudio.microsoft.com` |
| MCP Documentation | `modelcontextprotocol.io` |
| Microsoft Adoption Kit | `adoption.microsoft.com` |
| M365 Roadmap | Search "Microsoft 365 Copilot" on Microsoft 365 roadmap |

---

## 11. Agent Flows

Agent Flows are a distinct flow type from traditional Power Automate flows. They combine deterministic workflow logic with AI-driven intelligence (AI actions, prompts, approvals).

### 11.1 Key Differences from Cloud Flows

| Feature | Cloud Flows | Agent Flows |
|---------|------------|-------------|
| Licensing | Per-user (E3/E5 or Premium) | Per API call (~13¢/100 calls) via Copilot Studio capacity |
| Premium connectors | Require Premium license | **Included** at no extra cost |
| AI Builder prompts | Separate capacity | **Included** (basic: 1 msg/10 responses) |
| Solution-aware | Manual opt-in | **Always** solution-aware (version history, drafts) |
| Plan designation | Power Automate | Copilot Studio |
| Conversion | N/A | One-way: cloud flow → agent flow (cannot revert) |

### 11.2 AI Actions in Agent Flows

- **AI Prompts:** Run GenAI mid-flow via "Run a prompt" action. Supports JSON output mode — downstream actions can reference JSON properties as dynamic content. Default model: GPT-4o mini.
- **RFI (Request for Information):** Human-in-the-loop action that sends actionable Adaptive Cards/emails with designer-built forms. Flow pauses until recipient responds. First response wins for multi-recipient. Inputs: text, yes/no, number, dropdown, multi-select.
- **Advanced Approvals (AI + Manual stages):** Multi-stage approval with AI stages (GenAI evaluates against criteria) and manual stages (human approve/reject). AI stages support document/image validation — cross-references form data against uploaded receipts/documents. Stages support conditional routing (e.g., amount >= $150 → admin approval).
- **Multimodal Prompts:** Process PDFs, JPEGs, PNGs (max 25 MB total, 50 pages). Create under Tools > Multimodal Prompt. Must be wrapped in an agent flow (cannot invoke directly from instructions). Output as JSON with auto-generated schema.

### 11.3 Creating Agent Flows

- **From Copilot Studio:** Describe in natural language or build manually
- **From Power Automate:** Create flow, change plan to "Copilot Studio"
- **Converting existing:** Cloud flow must be solution-aware first. Then edit > change plan to "Copilot Studio." **One-way conversion.**
- Agent flows appear in both Copilot Studio (Flows tab) and Power Automate (Plan column shows "Copilot Studio")

**Source:** Reza Dorrani (Jun-Sep 2025), DamoBird365 (Aug 2025)

---

## 12. Agent Evaluation

### 12.1 Four-Stage Evaluation Framework (Microsoft Official)

1. **Core** — Define quality signals, key scenarios, test cases, acceptance criteria
2. **Baseline** — Run tests, get quantitative snapshot, iterate (evaluate → analyze → improve → re-evaluate)
3. **Expand** — Add variations, architecture tests, edge cases
4. **Operationalize** — Automate: core on every change, variations before release, architecture when debugging

### 12.2 Copilot Studio Evaluation Feature (Preview)

- **Test data:** Manual CSV import, AI-generated test cases (from agent definition), or production conversation reuse
- **Graders:** Compare meaning (semantic similarity with threshold), keywords match, text similarity, exact match, capability use (did it use specific tools?), classification grader (natural language evaluation + custom labels), general quality (relevance, groundedness, completeness, abstinence). Up to 5 graders per run.
- **Run comparison:** Compare current eval vs. previous runs to track regression/improvement
- **Coming soon:** Multi-message conversation evaluation, file/attachment inputs, human-LLM judge alignment tool

**Key insight:** "Start with key scenarios, work up to discover quality signals, work down to create test cases." The platform gives 75-80% accuracy out of the box. Getting to 85-90%+ requires proper knowledge modeling AND evals.

**Source:** Microsoft Power Platform, Feb 2026

---

## 13. Agent Supervision

### 13.1 Agent Feed (Power Apps)

Agent Feed is a Power Apps feature for monitoring autonomous agents:
- Appears in **model-driven Power Apps** as a side panel
- Shows all agent activity across multiple agents with timestamps
- Per-agent filtering, action attribution (agent vs. human)
- **To-do panel:** Actions needing human attention (failed actions, "waiting for user" items)
- Deep links to Dataverse records from activity items
- Setup: Model-driven app editor > Agents > Agent Feed > add published agents > Publish app

### 13.2 Activity Tab (Copilot Studio)

- Shows all interactions — labeled "Automated" for trigger-driven runs
- Full rationale visible: why the agent took each step
- Transcript view for debugging: connection errors, content filtering, tool failures
- Test mode: detailed errors. Production mode: generic safe messages (via On Error topic's `isTestMode` condition)

**Source:** Reza Dorrani (Sep 2025), DamoBird365 (Jan 2025)

---

## 14. Dataverse Integration

### Three Methods (Use the Right One)

| Method | Purpose | Config Effort | Strengths | Limitations |
|--------|---------|--------------|-----------|-------------|
| **Knowledge** | Search/retrieve, NL queries | Low | Synonyms, glossary, multi-table | Read-only, needs indexing time |
| **Tool (Connector)** | Specific CRUD operations | Medium | Granular input control, validation | One action per tool, can misfire |
| **MCP Server** | Full CRUD, multi-table, complex | **Zero** | Schema-aware, handles relationships | Less granular input control |

**Dataverse MCP Server** is the recommended approach for new agents. Zero input configuration — all tools (list tables, describe table, read query, create/update/delete record) come automatically. Respects user permissions. Can follow table relationships and execute SQL queries.

**Synonyms/glossary for Dataverse knowledge:** Configure per-column synonyms (e.g., "badge" = "job title") and per-table glossary terms to improve query accuracy for domain-specific terminology.

**Source:** Copilot Studio playlist (Jul 2025), Reza Dorrani (Dec 2025)

---

## Source Videos (by recency)

| Date | Title | Key Topic |
|------|-------|-----------|
| 2026-02-28 | The EASIEST Way to Build a Copilot Agent | Agent Builder workflow, "Only use specified sources" |
| 2026-02-14 | Claude + Excel Agent Mode | Agent Mode vs Standard, multi-model selection |
| 2026-01-22 | Autonomous AI Agent to Fix Outlook | Full autonomous agent build, instruction writing |
| 2026-01-15 | Not All Microsoft Copilots are the Same | Licensing tiers, feature rollout rings |
| 2025-12-13 | How I Automated Boring Work with Copilot | MCP tools (Outlook, Word, Meeting), autonomous instructions |
| 2025-11-15 | Copilot Workflows Agent | Conversational workflow creation, loop prevention |
| 2025-10-17 | Copilot Agents + Computer Use | Computer Use for web UIs, credential storage |
| 2025-10-09 | Build Simple Agents in M365 Copilot | Free agent creation, Code Interpreter, Pages |
| 2025-09-19 | Build a Copilot Agent Chatbot | Multi-agent orchestration, custom connectors |
| 2025-07-31 | MCP is a Game Changer | MCP architecture, DocuSign MCP server |
| 2025-06-13 | Multi-agent Orchestration | Parent/child agent patterns, cross-platform |
| 2025-04-24 | Agent Answers Your Emails | Email agent build, deep reasoning, loop prevention |
| 2025-03-27 | Increasingly Smarter Agents | Agent spectrum, task-based architecture |
| 2025-02-21 | Autonomous AI Agents | Trigger-based autonomy, knowledge lockdown |
