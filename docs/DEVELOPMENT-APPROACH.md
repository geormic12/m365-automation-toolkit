# AI Development Approach

How we build, test, and deliver AI solutions for your organization. There are multiple entry points into the Microsoft AI/automation ecosystem and multiple ways Claude can interact with your environment. Each has different tradeoffs in terms of developer power, ease of use, and organizational reach.

## The Principle

**Start in Claude World. Promote when needed.**

The fastest, most flexible development happens locally with Claude. Once a solution works and needs to be shared — through Teams, across the org, on a schedule — then we package it for the Microsoft platform. Don't start in Copilot Studio if you don't have to.

---

## Tier 1: Claude Direct Access (Most Power)

### 1A. OneDrive Sync

Claude reads and writes files directly through a synced OneDrive folder.

**What it gives you:**
- Full read/write access to documents, spreadsheets, templates
- Claude can process, transform, and generate files without any API layer
- Fastest iteration — no packaging, no importing, no portals
- Works offline from Microsoft's AI stack entirely

**Limitations:**
- Only works with files, not calendars/email/Teams
- Requires OneDrive sync set up on the development machine
- Solutions stay local — no org-wide sharing unless files are in shared folders
- No scheduled triggers — runs only when Claude is asked

**Best for:** Document processing, Excel transforms, template generation, file-based workflows

### 1B. MS365 MCP Server (Optional — Environment-Dependent)

Claude accesses your organization's Microsoft 365 data directly via Graph API — email, calendars, OneDrive, SharePoint, Teams, contacts. Uses the Softeria MS365 MCP server (`@softeria/ms-365-mcp-server`).

> **Availability note:** This tier requires the MS365 MCP server to be authenticated and connected. Not all developers will have access. When available, it's the most powerful prototyping tool; when unavailable, skip to Tier 2.

**What it gives you:**
- Direct read/write to calendars, email, files, Teams channels
- Claude can build complete automations without touching Microsoft's platform
- No Copilot Studio or Power Automate needed — Claude IS the agent
- Can prototype and test immediately, no import/export cycle
- **Environment discovery** — query real data to inform agent design (list calendars, check mailbox structure, enumerate SharePoint sites)

**Limitations:**
- Requires authentication (environment-specific — may not be available to all developers)
- Solutions only run when Claude is running — no scheduled/triggered execution
- Not visible to other team members unless Claude posts results somewhere
- Depends on Graph API permissions granted to the MCP app registration

**Best for:** Calendar queries, email processing, Teams posting, data lookups — anything where Claude acts on behalf of a user in real-time. Also invaluable for **pre-build environment discovery** when designing agents.

---

## Tier 2: Package Generation (Claude Builds, Microsoft Hosts)

Claude generates importable solution packages (.zip) locally, which get imported into the Microsoft platform as Dataverse objects.

> **Preference order within Microsoft's platform:** Copilot Agents → Copilot Workflows → Copilot Studio Flows → Power Automate. Microsoft is investing heavily in agents and Copilot Studio — it gets the latest features, best integration, and most attention. Power Automate is the last resort when nothing else works.

### 2A. Copilot Studio Agent Packages (PREFERRED)

Generated with `/generate-copilot-agent`. Produces a Dataverse solution .zip containing a generative AI agent with connectors, instructions, and topics.

**What it gives you:**
- Agents live in Microsoft's platform — accessible through Teams, web, etc.
- Org-wide availability once published
- Leverages Microsoft's connector ecosystem (Office 365, SharePoint, Dataverse, etc.)
- Version-controlled locally, importable repeatedly
- **Gets Microsoft's latest AI investment** — newest models, MCP servers, multi-agent orchestration

**Limitations:**
- The generative orchestrator has its own LLM behavior — doesn't always follow complex instructions precisely (we learned this with Calendar Checker)
- Debugging is limited to testing in Copilot Studio's chat pane
- Import/export cycle adds friction vs. direct Claude execution
- Schema is undocumented — risk of cryptic import errors

**Best for:** Org-wide AI agents that need Teams presence — knowledge assistants, Q&A bots, simple tool-calling agents. Keep instructions simple and autonomous (see [Writing Agent Instructions](#writing-agent-instructions)).

**Optional MS365 MCP enhancement:** If the Softeria MS365 MCP server is available, use it during Phase 1 (Design) to query the live environment — list calendars, check mailbox structure, enumerate SharePoint sites. This informs agent design with real data before packaging.

### 2B. Power Automate Flow Packages (LAST RESORT)

Generated with `/generate-pa-package`. Produces legacy import packages for Power Automate flows.

> **Use Power Automate only when Copilot agents, Copilot workflows, AND Copilot Studio flows all fail to meet the requirement.** Microsoft's investment is going into agents and Copilot Studio. Power Automate is mature but legacy-bound — it won't get the latest AI features first.

**What it gives you:**
- Scheduled/triggered automation — runs without anyone present
- Connector-based integration (hundreds of Microsoft and third-party connectors)
- Visible in Power Automate portal for monitoring and management
- Can be triggered by events (new email, file created, Teams message, etc.)

**Limitations:**
- No AI/LLM reasoning — these are deterministic step-by-step flows
- Environment-specific resource IDs (OneDrive folder IDs, connection references) require post-import configuration or hardcoding
- Flow logic is rigid compared to Claude's flexibility
- **Not where Microsoft is investing** — agent-first features won't land here first

**Best for:** Only when you need purely deterministic, scheduled automation that can't be handled by a Copilot agent with triggers or a Copilot workflow — file copies, data syncing, legacy connector-only operations

---

## Tier 3: Microsoft Platform Tools (Organizational Reach)

Building directly in Microsoft's portals. Solutions are native to the org's platform and accessible to everyone.

> **Preference order:** Agents first. Microsoft is pouring investment into agents and Copilot Studio — that's where the latest models, MCP servers, and integrations land first. Power Automate is mature but legacy. Always try agent-based approaches before falling back to Power Automate.

### Choosing Within Tier 3

Try these in order — move to the next only if the previous can't meet the requirement:

| Priority | Method | When to Use |
|----------|--------|-------------|
| **1st** | 3A — Copilot Agent Creator | Non-developer wants a quick agent. Natural language, lowest friction. |
| **2nd** | 3B — Copilot Workflow Creator | Simple automation ("when X happens, do Y"). Natural language workflows. |
| **3rd** | 3C — Copilot Studio Agent | Full control over agent topics, actions, triggers. Refining Tier 2A imports. |
| **4th** | 3D — Copilot Studio Flows (Agent Flows) | Flows that fire during an agent conversation or as part of agent orchestration. |
| **5th** | 3E — Power Automate Portal | **Last resort.** Only when purely deterministic automation can't be done any other way. |

### Agent-First (Natural Language)

#### 3A. Microsoft Copilot — Agent Creator

Build agents through the Microsoft Copilot interface using natural language. Describe what the agent should do, Copilot builds it.

**What it gives you:**
- Natural language development — describe the agent, it gets built
- Integrated into the Copilot experience users already have
- Low barrier to entry — anyone on the team can create one
- Quick to prototype and test
- Can export to Copilot Studio for refinement (Agent Builder → Studio pipeline)

**Limitations:**
- Less control than Copilot Studio — fewer customization options
- Limited connector access compared to the full platform
- May not handle complex multi-step logic well

**Best for:** Quick-and-dirty agent prototypes, letting non-developers (team members) create simple agents themselves

#### 3B. Microsoft Copilot — Workflow Creator

Create automations through the Copilot interface using natural language. **Prefer this over Power Automate for simple workflows.**

**What it gives you:**
- Describe a workflow in plain English, Copilot builds it
- Quick automations without learning Power Automate's visual designer
- Accessible to anyone with Copilot access
- Cross-app: Outlook, Teams, SharePoint, Approvals, Planner
- Activity monitoring shows real-time execution

**Limitations:**
- Limited compared to Power Automate for complex flows
- Less control over triggers, conditions, and error handling
- May oversimplify what you actually need

**Best for:** Simple automations your team can create and own — "when I get an email from X, copy the attachment to Y"

### Advanced Agent Design (Visual Designers)

#### 3C. Copilot Studio — Agent Creator

Build agents in the Copilot Studio portal with a visual designer. Supports generative orchestration, topics, connector actions.

**What it gives you:**
- Full control over topics, trigger phrases, and action flows
- Direct testing in the portal
- Publish to Teams, web, or other channels
- **Gets Microsoft's latest AI features first** — newest models, MCP servers, multi-agent orchestration
- Best way to understand what the platform actually supports

**Limitations:**
- Manual portal work — slower iteration than local generation
- Can't easily version control or diff changes
- The generative orchestrator is a black box — hard to debug why it ignores instructions

**Best for:** Refining imported agents (from Tier 2A), building agents that need precise topic routing, autonomous agents with triggers, multi-agent orchestration

**Optional MS365 MCP enhancement:** Use the Softeria MS365 MCP server to test agent behavior from Claude's side before deploying — verify that calendar queries, email operations, and file lookups return expected data shapes.

#### 3D. Copilot Studio — Agent Flows

Build AI-powered flows within Copilot Studio. These are the evolution of connector-based action flows — they support AI actions, RFI (Request for Information) patterns, and multi-stage approvals within the agent context.

**What it gives you:**
- Flows that are part of the agent — triggered by conversation, events, or schedules
- AI actions within flows (classify, summarize, extract)
- RFI patterns for gathering information from users/systems
- Multi-stage approval workflows
- Access to the same connector ecosystem as Power Automate

**Limitations:**
- Scoped to agent context — not fully standalone automation
- Same resource ID challenges as Power Automate packages
- Newer feature — less documentation and community examples

**Best for:** Agent actions that need flow logic — approvals, multi-step data gathering, conditional routing within an agent conversation. **Try this before Power Automate.**

#### 3E. Power Automate Portal (LAST RESORT)

Build flows directly in the Power Automate web portal.

> **Only use Power Automate when 3A through 3D all fail to meet the requirement.** Microsoft's investment is going into agents and Copilot Studio. Power Automate is mature but won't get the latest AI features first.

**What it gives you:**
- Full visual flow designer with hundreds of connectors
- Scheduled, triggered, and manual flows
- Run history, error tracking, monitoring
- Most mature automation platform in the Microsoft stack

**Limitations:**
- Steepest learning curve of all the options
- Complex flows are hard to read and maintain in the visual designer
- Debugging is limited to run history inspection
- **Not where Microsoft is investing** — agent-first features won't land here

**Best for:** Only when you need purely deterministic, scheduled automation that can't be handled by any agent-based approach — legacy connector-only operations, complex expression logic, or specific Power Automate-only triggers

---

## Decision Framework

When building a solution, ask these questions in order:

### 1. Does it need to run without Claude present?
- **No** → Tier 1 (Claude direct). Build it as a Claude workflow or MCP interaction.
- **Yes** → Continue to question 2.

### 2. Does it need AI/LLM reasoning?
- **No** → Try a Copilot Workflow (3B) first. Only fall back to Power Automate (3E) if Copilot Workflows can't handle it.
- **Yes** → Continue to question 3.

### 3. Does it need to be accessible to other team members through Teams or web?
- **No** → Keep it in Claude World. Claude is the agent.
- **Yes** → Copilot Studio agent (Tier 2A or 3A). Continue to question 4.

### 4. How complex is the AI behavior?
- **Simple** (single tool calls, straightforward Q&A) → Copilot Agent Creator (3A) or generated package (2A).
- **Medium** (multi-tool, conditional routing, approvals) → Copilot Studio agent with Agent Flows (3C + 3D).
- **Complex** (multi-step reasoning, precise constraints) → Build the logic in Claude, expose results through a simpler interface (Teams post, shared document, etc.). See [Hybrid Patterns](#hybrid-patterns).

### 5. Does the team need to own and modify it?
- **Yes** → Tier 3 (portal-based). They can edit it without us. Pick the right sub-tier using the [Choosing Within Tier 3](#choosing-within-tier-3) table.
- **No** → Tier 2 (package generation). We control the source, they import the result.

### 6. What tools does it need?
- **Cross-app** (calendars + email + files + Teams) → Prefer MCP servers. One protocol replaces dozens of connector configs.
- **Single-app** (just SharePoint, just email) → A native connector or SharePoint knowledge source may be sufficient.
- See [Tool & Knowledge Preferences](#tool--knowledge-preferences) for details.

### 7. (Optional) Can MS365 MCP help during development?
- If the Softeria MS365 MCP server is available, use it to:
  - **Discover environment data** — list calendars, mailbox folders, SharePoint sites, Teams channels
  - **Test operations** — verify that Graph API calls return expected data before packaging
  - **Prototype agent behavior** — Claude acts as the agent first, then package for Copilot Studio
- This step is optional — not all developers will have MCP access. Skip if unavailable.

---

## Tool & Knowledge Preferences

When a Copilot Studio agent or Claude workflow needs to access data or take actions across Microsoft 365 products:

**Always prefer MCP servers.** MCP provides a stabilized, predefined interface without the nastiness of native connectors — no opaque resource IDs, no undocumented parameter formats, no per-connector configuration headaches. One protocol covers calendars, email, files, Teams, SharePoint, and anything else with a Graph API surface.

**Only fall back to native connectors** when a sufficient MCP server is not available for the capability you need (e.g., Power Automate triggers, Dataverse-specific operations, or third-party connectors with no MCP equivalent).

**SharePoint as knowledge:** Copilot Studio agents can attach SharePoint sites and document libraries as knowledge sources directly. Use this for reference material the agent needs to search — product docs, SOPs, policy documents. This doesn't require MCP or connectors; it's built into the agent framework.

---

## Writing Agent Instructions

Copilot Studio agents are driven by their instruction text. The generative orchestrator reads these instructions to decide what tools to call, what to say, and — critically — when to stop and wait. Getting the instructions right is the difference between an agent that works and one that stalls mid-task.

### The #1 Rule: Autonomous by Default

Copilot agents will stop and ask the user whenever they see an opportunity to. If the instructions leave any ambiguity about whether to proceed or ask, the agent will ask — and then hang. The user sees a dead conversation.

**Write instructions that tell the agent to proceed, decide, and keep going.** Only insert explicit user input points where you specifically need the user's answer to continue.

### What Works

- **Imperative, directive language.** "Look up the calendar. Find the next available slot. Book it." Not "You could check the calendar and maybe find a slot."
- **Chain actions explicitly.** "After retrieving the file list, filter to .xlsx files, then summarize the contents of each." The orchestrator won't infer the chain — spell it out.
- **Declare the default.** "If the user doesn't specify a date range, use the current week." Don't leave it open for the agent to ask.
- **Handle missing info inline.** "If no matching records are found, tell the user no results were found and suggest broadening their search." Don't let it stall wondering what to do.
- **Short, direct sentences.** The orchestrator follows simple instructions better than complex nested ones.

### What Doesn't Work

- **Conditional branching with multiple tool calls.** "If X, call tool A, then use the result to call tool B, but if Y, call tool C instead." The orchestrator can't reliably follow this. Keep conditional logic simple or move it to Claude (Tier 1).
- **Vague instructions.** "Help the user with their calendar." The agent won't know what to do and will ask.
- **Asking the orchestrator to remember across turns.** It has limited context. Don't rely on it tracking state from earlier in the conversation.
- **Precise date/time math.** The orchestrator's LLM doesn't reliably calculate "next Tuesday" or "two weeks from now." Pass explicit dates if possible.

### Template: Instruction Structure

```
You are [agent name] for [Your Organization].

Your job: [one sentence — what this agent does].

## How you work
1. [First action — imperative].
2. [Second action — what to do with the result].
3. [Third action — how to present the answer].

## Rules
- [Constraint].
- [Default behavior when info is missing].
- [What to do when a tool call fails].

## When to ask the user
- Only ask if [specific condition where you truly need input].
- For everything else, proceed with the defaults above.
```

### Testing Agent Instructions

After writing instructions, test with these scenarios:
1. **Happy path** — give it exactly what it expects. Does it complete without stalling?
2. **Missing info** — omit something optional. Does it proceed with the default or hang?
3. **Tool failure** — what happens if a connector returns no results? Does it recover or stop?
4. **Ambiguous request** — give a vague prompt. Does it make a reasonable decision or ask 5 clarifying questions?
5. **Edge cases** — unknown categories, missing folders, unexpected data formats

If the agent asks the user something you didn't explicitly intend, the instructions need tightening.

---

## The Workflow

```
1. Prototype in Claude World (Tier 1)
   - Build fast, test fast, iterate fast
   - Use MCP server or OneDrive sync for data access
   - Write agent instructions using the autonomous-first pattern

2. Validate the solution works
   - Test all 5 scenarios: happy path, missing info, tool failures, ambiguous input, edge cases
   - For agents: run through the 5-scenario protocol (see Writing Agent Instructions)
   - For flows: trace each step with real data, check that connector outputs
     match what the next step expects

3. Decide on delivery method
   - If Claude-only is fine → done, document how to run it
   - If org-wide access needed → package and import (Tier 2)
   - If portal customization needed → build/refine in platform (Tier 3)
   - If hybrid → see Hybrid Patterns below

4. Package and deliver
   - Generate .zip with Claude skills (/generate-copilot-agent or /generate-pa-package)
   - Import into target environment (Power Platform admin > Solutions, or
     Power Automate > My flows > Import)
   - Post-import: configure connection references, verify resource IDs,
     authenticate connectors, test in the Microsoft environment
   - Iterate: test → adjust instructions/flow → regenerate → reimport

5. Hand off to the team
   - Document what the solution does, what it connects to, and how to test it
   - Note any manual configuration steps (connection auth, folder IDs, etc.)
   - If the team needs to modify it later, note which tier that happens in
```

---

## Hybrid Patterns

Not everything fits neatly into one tier. These are the cross-tier combos that work well.

### Claude Brain + Teams Mouth

Claude does the complex reasoning (Tier 1B), then posts the result to a Teams channel or sends an email. The team sees the output without needing to interact with Claude directly.

**When to use:** Complex AI analysis that needs to reach the team — weekly summaries, processed reports, alerts based on multi-source data.

### Claude Brain + Copilot Face

Claude builds the logic and generates the output, but a simple Copilot Studio agent (Tier 2A) acts as the user-facing interface. The agent's job is just to collect a question, pass it through, and return Claude's answer.

**When to use:** The team wants a Teams-based chat experience, but the AI reasoning is too complex for Copilot Studio's orchestrator alone.

### Power Automate Trigger + Claude Action

A Power Automate flow (Tier 2B) watches for an event (new email, file drop, schedule), then calls Claude via webhook or posts to a channel that Claude monitors. Claude handles the intelligence; Power Automate handles the trigger.

**When to use:** Automated workflows that need to fire on a schedule or event but require AI reasoning that Power Automate can't do.

### Copilot Agent + SharePoint Knowledge

A Copilot Studio agent (Tier 2A or 3C) with SharePoint document libraries attached as knowledge sources. The agent answers questions by searching the org's own documents — SOPs, policies, product info.

**When to use:** Internal knowledge base / FAQ agent. No complex tool calls needed, just search and summarize from existing docs.

---

## Knowledge Base

Best practices, tool catalogs, and source material are in `knowledge/`:

| Document | Purpose |
|----------|---------|
| [BEST-PRACTICES.md](../knowledge/BEST-PRACTICES.md) | Comprehensive best practices — agent instructions, architecture patterns, knowledge sources, MCP, agent flows, evaluation, security, licensing |
| [MCP-TOOLS-CATALOG.md](../knowledge/MCP-TOOLS-CATALOG.md) | Complete catalog of MCP servers (8 confirmed + pipeline), connectors, tools, and triggers — with generator gap analysis |
| `transcripts/` | 87 cleaned video transcripts across 5 channels (sorted by date) |

**Sources (87 videos, recency-weighted):**
- [Collaboration Simplified](https://www.youtube.com/@CollaborationSimplified) — Shervin Shaffie, MS Copilot Principal Technical Specialist (32 videos)
- [Microsoft Power Platform](https://www.youtube.com/@MicrosoftPowerPlatform) — Official Agent Operative series, knowledge, evaluation, security (15 videos)
- Copilot Studio tutorial playlist — Fundamentals, Dataverse, autonomous agents (14 videos)
- [DamoBird365](https://www.youtube.com/@DamoBird365) — MCP custom connectors, A2A, Computer Use, agent flows (17 videos)
- [Reza Dorrani](https://www.youtube.com/@RezaDorrani) — Agent Flows, approvals, Dataverse MCP, agent supervision (9 videos)

---

## Actionable Build Pathway

This is how best practices, MCP tools, and package generation connect end-to-end. Every agent build follows this pathway.

### Phase 1: Design (Before Code)

1. **Identify agent type** using the Agent Spectrum (BEST-PRACTICES.md §2.1):
   - Retrieval → Agent Builder (no code needed, skip to Phase 4)
   - Task-based → Copilot Studio with connectors/MCP
   - Autonomous → Copilot Studio with triggers

2. **(Optional) Discover environment data via MS365 MCP:**
   If the Softeria MS365 MCP server is available, use it to inform design:
   - `list-calendars` — discover available calendars and their IDs
   - `list-mail-folders` — check mailbox structure and folder names
   - `list-drives` / `list-folder-files` — enumerate SharePoint sites and document libraries
   - `list-joined-teams` / `list-team-channels` — find Teams channels for agent deployment
   - This step produces real data that makes agent instructions more precise (exact folder names, calendar IDs, etc.)
   - **Skip this step if MCP is unavailable** — design from documentation and user descriptions instead.

3. **Select tools** from MCP-TOOLS-CATALOG.md:
   - **First:** Check MCP servers (Outlook Mail, Word, Meeting Management, Teams, Dataverse, DocuSign, Box, Microsoft Learn)
   - **Second:** Check connector catalog (shared_office365, shared_sharepointonline, etc.)
   - **Last resort:** Custom connector or Computer Use

4. **Plan knowledge sources** (BEST-PRACTICES.md §3):
   - SharePoint sites/folders with descriptions
   - Uploaded documents (PDFs, Word docs)
   - Public URLs
   - Enable "Only use specified sources" — non-negotiable for focused agents

### Phase 2: Write Instructions

Use the autonomous-first instruction template (BEST-PRACTICES.md §1.3):

```
You are [agent name] for [Your Organization].

Your job: [one sentence].

IMPORTANT: You are autonomous. Do not ask me questions. Execute every step
without waiting for confirmation.

## How You Work
1. [Action — imperative, naming specific tool].
2. [Next action — what to do with the result].
3. [Final action — present the answer].

## Output Format
- [HTML/text/table, tone, links to sources]

## Rules
- [Knowledge constraint: "Do not use knowledge sources other than those specified"]
- [Default: "If no date specified, use current week"]
- [Error handling: "If a tool call fails, report via Teams message"]

## When to Ask the User
- Only ask if [truly needed].
- For everything else, proceed with defaults.
```

**Run the Instruction Quality Gate** (7 checks in SKILL.md) before proceeding.

### Phase 3: Generate Package

```
/generate-copilot-agent [description of what the agent does]
```

The generator produces a Dataverse solution .zip with:
- Agent skeleton (instructions, connectors, system topics)
- Connection references for declared connectors
- Proper OPC-compliant ZIP structure

**What the generator handles:** Connectors (4 types), system topics (13), GPT instructions, connection references, AI settings.

**What you configure post-import:** MCP tools, knowledge sources, triggers, model selection, content moderation.

### Phase 4: Import & Configure in Copilot Studio

1. **Import:** Power Platform admin > Solutions > Import > upload .zip
2. **Add MCP tools:** Tools > Add Tool > MCP tab (see MCP-TOOLS-CATALOG.md)
3. **Add knowledge sources:** Knowledge section > SharePoint sites, uploaded docs, URLs
4. **Add triggers:** For autonomous agents, add event triggers (e.g., "When a new email arrives V3")
5. **Configure settings:**
   - Enable "Only use specified sources"
   - Disable "Allow AI general knowledge" (for focused agents)
   - Set model: GPT-5 Auto (default recommendation)
   - Set content moderation: LOW for Computer Use, HIGH otherwise
   - Enable Code Interpreter if charts/graphs needed
6. **Authentication:** For autonomous agents, change tool auth to "Copilot Author" (not "User Authentication") — there's no user context for triggers. Path: Actions > [action] > End User Authentication > change to "Copilot Author."
7. **Authenticate connections:** Test panel > manage connections > authenticate each

### Phase 5: Test

Run the 5-scenario test protocol (BEST-PRACTICES.md §10):

1. **Happy path** — expected inputs, completes without stalling
2. **Missing info** — omitted optional data, proceeds with defaults
3. **Tool failure** — connector errors, agent recovers gracefully
4. **Ambiguous request** — vague prompt, makes reasonable decision
5. **Edge cases** — unknown categories, missing folders, unexpected formats

**If the agent asks the user something you didn't intend → instructions need tightening.**

### Phase 6: Publish & Deploy

1. Save explicitly (not autosave)
2. Publish
3. Add to Teams channel
4. Copy availability link → share in Teams chat
5. Each user authenticates MCP/connector connections on first use
6. Create Outlook rules if agent sends emails (loop prevention)

---

## Lessons Learned

- **Copilot Studio's generative orchestrator doesn't reliably follow complex multi-step instructions.** Simple tool calls work. Multi-call patterns with date/time constraints don't. For complex AI behavior, keep the logic in Claude.
- **OneDrive connector actions need opaque Drive Item IDs**, not human-readable paths. Get these by exporting a working flow or querying via MCP/Graph API.
- **Package generation works** but the Dataverse schema is undocumented. Expect some trial and error on imports.
- **Start simple, promote gradually.** A Claude automation that posts results to a Teams channel may be more reliable than a Copilot Studio agent trying to do complex reasoning.
- **Copilot agents stall on implicit user interaction.** If the agent's instructions leave room for it to pause and ask the user something, it will — and then it stops executing. Write instructions that tell the agent to proceed, decide, and keep going autonomously. Only add explicit user input points where you specifically want the user involved. Default posture: execute, don't ask.
- **MCP servers replace custom connectors and flows.** One MCP server (e.g., DocuSign) replaces 100+ individual connectors. Always check for MCP availability first. (Source: Shervin Shaffie, Jul 2025)
- **Knowledge source descriptions drive source selection.** The agent uses the description field to decide which knowledge source to query. Vague descriptions = wrong source. Be verbose and specific. (Source: Multiple Shervin tutorials, 2025-2026)
- **"Only use specified sources" must be enabled.** This toggle is OFF by default and is the #1 cause of hallucination. Enable it for every focused agent. (Source: Shervin Shaffie, Feb 2026)
- **Multi-agent orchestration prevents agent sprawl.** One master agent routes to specialized child agents. Master instructions can be minimal — the AI handles routing. (Source: Shervin Shaffie, Jun 2025)
- **Connections break silently.** Even after initial authentication, connections can drop. Always verify via connection manager before testing. The "Waiting for user" error means a connection needs re-authentication. (Source: Shervin Shaffie, Apr 2025)
