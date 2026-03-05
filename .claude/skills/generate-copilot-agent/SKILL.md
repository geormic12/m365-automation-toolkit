---
name: generate-copilot-agent
description: Generate a Microsoft Copilot Studio agent as an importable Dataverse solution (.zip). Supports generative orchestration, custom topics, and connector tools.
---

# /generate-copilot-agent — Build a Copilot Studio Agent Solution Package

## What This Skill Does

Takes a natural-language description of a Copilot Studio agent (or a structured JSON definition) and produces a valid Dataverse solution `.zip` that can be imported via **Power Platform admin center > Solutions > Import** or `pac solution import`.

The user's request is: **$ARGUMENTS**

## Background

Copilot Studio agents are Dataverse solution components. This skill generates the complete solution structure reverse-engineered from real Copilot Studio exports (Feb 2026). It includes all 13 system topics, connector action components (TaskDialog format), proper connection reference linkage, and the exact XML/YAML formats used by Microsoft.

### Solution Structure

```
Solution.zip (files at root, NO parent folder)
├── [Content_Types].xml                                ← OPC content types (single line, Override per data file)
├── solution.xml                                       ← Solution manifest (RootComponents EMPTY, verbose Address blocks)
├── customizations.xml                                 ← Connection references with promptingbehavior
├── bots/{prefix}_{botName}/
│   ├── bot.xml                                        ← Bot entity (NO description tag, has timezoneruleversionnumber)
│   └── configuration.json                             ← Orchestration mode, AI settings (no contentModeration)
├── botcomponents/{prefix}_{botName}.gpt.default/
│   ├── botcomponent.xml                               ← Component metadata (componenttype=15)
│   └── data                                           ← YAML instructions + gptCapabilities (NO extension!)
├── botcomponents/{prefix}_{botName}.topic.{Name}/     ← 13 system topics (all componenttype=9)
│   ├── botcomponent.xml
│   └── data                                           ← YAML Adaptive Dialog (NO extension!)
├── botcomponents/{prefix}_{botName}.action.{Connector}-{Operation}/  ← Connector actions
│   ├── botcomponent.xml                               ← componenttype=9 (same as topics)
│   └── data                                           ← YAML TaskDialog (NO extension!)
└── Assets/
    └── botcomponent_connectionreferenceset.xml         ← Links ACTION components to connection references
```

### Bot Component Types

| componenttype | Label | Purpose |
|---------------|-------|---------|
| 9 | Topic (V2) / Action | Adaptive Dialog topics AND connector actions (TaskDialog) |
| 15 | Custom GPT | Agent instructions / system prompt |
| 16 | Knowledge Source | Knowledge source configuration |
| 17 | External Trigger | Autonomous agent trigger |
| 18 | Copilot Settings | Agent-level settings |

### System Topics (all 13 included automatically)

| Topic | Trigger Kind | Behavior |
|-------|-------------|----------|
| ConversationStart | OnConversationStart | Greeting with text + speak arrays |
| EndofConversation | OnSystemRedirect | CSAT survey, resolution confirmation, escalation |
| Escalate | OnEscalate | 41 trigger phrases, "not configured" message |
| Fallback | OnUnknownIntent | FallbackCount < 3 retry, then escalate |
| Goodbye | OnRecognizedIntent | Confirm end, redirect to EndofConversation |
| Greeting | OnRecognizedIntent | Hello response with SSML speak, CancelAllDialogs |
| MultipleTopicsMatched | OnSelectIntent | Disambiguation with "None of these" option |
| OnError | OnError | Test mode: full error; production: code only; telemetry |
| ResetConversation | OnSystemRedirect | Clear variables, cancel dialogs |
| Search (Conversational boosting) | OnUnknownIntent (priority -1) | SearchAndSummarizeContent from knowledge |
| Signin | OnSignIn | OAuth prompt when sign-in required |
| StartOver | OnRecognizedIntent | Confirm restart, redirect to ResetConversation |
| ThankYou | OnRecognizedIntent | Simple "You're welcome" |

### Connector Action Format (TaskDialog)

Actions use `kind: TaskDialog` YAML with `InvokeConnectorTaskAction`:

```yaml
kind: TaskDialog
modelDisplayName: Get events (V4)
modelDescription: "This operation gets events from a calendar."
outputs:
  - propertyName: value
    name: value

action:
  kind: InvokeConnectorTaskAction
  connectionReference: cr449_botName.shared_office365.shared-office365-{GUID}
  connectionProperties:
    mode: Invoker
  operationId: V4CalendarGetItems

outputMode: Specific
```

### GPT Instructions Format

```yaml
kind: GptComponentMetadata
instructions: |-
  You are [Agent Name]. Your job is to...

  ## Section 1
  - Instructions here
gptCapabilities:
  webBrowsing: true
```

### Connection Reference Format

The logicalname follows this exact pattern:
```
{botSchemaName}.{connectorApiName}.{connectorApiName}-{GUID}
```
Example: `cr449_schedulingAgent.shared_office365.shared_office365-05f55568-bd5d-40a2-8197-9fbbdfb5cf88`

The `connectionreferencedisplayname` is set to the SAME value as the logicalname.

## Best Practices Reference

Before building any agent, consult these knowledge base documents:

- **`knowledge/BEST-PRACTICES.md`** — Comprehensive best practices from 87 video tutorials across 5 channels (Shervin Shaffie, Microsoft Power Platform, Copilot Studio playlist, DamoBird365, Reza Dorrani)
- **`knowledge/MCP-TOOLS-CATALOG.md`** — Complete catalog of MCP servers (8 confirmed + pipeline), connectors, and tools available in Copilot Studio

### Instruction Quality Gate (MANDATORY)

Before generating the package, verify the instructions pass ALL of these checks:

1. **Autonomous-first language** — No hedging ("you could", "maybe"). All imperative ("Look up", "Send immediately", "Book it").
2. **Explicit tool references** — Every action step names the specific tool: "Use the Move Email V2 tool to..."
3. **Defaults declared** — Every optional parameter has a default: "If no date specified, use current week"
4. **Error handling** — Instructions specify what to do when tools fail: "If no results found, tell the user and suggest alternatives"
5. **No implicit user interaction** — No steps that could cause the agent to pause and ask. Add "without asking for permission" where needed.
6. **Output format specified** — HTML/text/table, tone, sign-off format
7. **Knowledge source constraints** — "Do not use knowledge sources other than those specified" if focused agent

### Post-Import Configuration Checklist

The generated package creates the agent skeleton. After importing into Copilot Studio, these MUST be configured manually:

1. **MCP Tools** — Add via Tools > Add Tool > MCP tab (see MCP-TOOLS-CATALOG.md)
2. **Knowledge Sources** — Add SharePoint sites, uploaded docs, URLs via Knowledge section
3. **Triggers** — Add autonomous triggers (e.g., "When a new email arrives V3") for event-driven agents
4. **Settings:**
   - Enable "Only use specified sources" (prevents hallucination)
   - Disable "Allow AI general knowledge" for focused agents
   - Set model to GPT-5 Auto (or as needed)
   - Set content moderation to LOW for Computer Use agents
5. **Authentication** — For autonomous agents, change tool auth to "Copilot Author" (not "User Authentication")
6. **Publish** — Save explicitly, then Publish (autonomous agents don't run until published), then deploy to target channel(s)

### AI Settings Recommendations

| Agent Type | useModelKnowledge | webBrowsing | Orchestration |
|------------|------------------|-------------|---------------|
| Focused Q&A (SharePoint knowledge) | false | false | generative |
| General assistant | true | true | generative |
| Tool-calling agent (calendar, email) | false | false | generative |
| Autonomous email processor | false | false | generative |

## Instructions

1. **Interpret the user's request** (`$ARGUMENTS`). Determine:
   - What the agent should do (its purpose and behavior)
   - What orchestration mode (generative or classic)
   - What connectors/tools the agent needs (prefer MCP servers per MCP-TOOLS-CATALOG.md)
   - What custom topics are needed (if any beyond the 13 system defaults)
   - What the greeting message should say

2. **Write instructions using the autonomous-first template** from BEST-PRACTICES.md Section 1.3. Run the Instruction Quality Gate checklist above before proceeding.

3. **Create the agent definition JSON file** at `scripts/copilot-studio/agents/<agent-name>/<agent-name>.json`:
   ```json
   {
     "name": "Agent Display Name",
     "schemaName": "agentDisplayName",
     "description": "What this agent does",
     "instructionsFile": "scripts/copilot-studio/agents/<agent-name>/instructions.md",
     "greeting": "Hello, I'm {System.Bot.Name}. How can I help?",
     "publisher": {
       "uniqueName": "DefaultPublisherorg60ae70f3",
       "displayName": "Default Publisher for org60ae70f3",
       "description": "Default publisher for this organization",
       "prefix": "cr449",
       "optionValuePrefix": 10000
     },
     "solution": {
       "uniqueName": "AgentNameSolution",
       "displayName": "Agent Name",
       "version": "1.0.0.0"
     },
     "orchestration": "generative",
     "aiSettings": {
       "useModelKnowledge": true,
       "isFileAnalysisEnabled": true,
       "webBrowsing": true
     },
     "connectors": {
       "shared_office365": {
         "displayName": "Office 365 Outlook",
         "operations": ["V4CalendarGetItems", "V4CalendarPostItem"]
       }
     },
     "topics": []
   }
   ```

4. **Write agent instructions** as a separate markdown file. Apply these rules from BEST-PRACTICES.md:
   - Use the autonomous-first instruction template (Section 1.3)
   - Reference tools by exact name with slash notation
   - Include "You are autonomous. Do not ask me questions. Execute every step without waiting for confirmation."
   - Declare defaults for all optional parameters
   - Specify output format (HTML/text/table) and tone
   - Add error handling: "If a tool call fails, report the error via Teams message"
   - For email agents: include "send immediately" and loop-prevention reminder
   - For knowledge agents: include "Do not use knowledge sources other than those specified"
   - Run the Instruction Quality Gate checklist before proceeding

5. **Generate the solution package** by running:
   ```
   node scripts/copilot-studio/generate-copilot-agent.js scripts/copilot-studio/agents/<agent-name>/<agent-name>.json "output/<OutputName>"
   ```

5. **Report the result** to the user.

## Built-in Connector Operation Catalog

The generator includes a catalog of known connector operations. Just specify the operationId strings:

### Office 365 Outlook (`shared_office365`)

| operationId | Display Name | Output Mode |
|-------------|-------------|-------------|
| `V4CalendarGetItems` | Get events (V4) | Specific |
| `V4CalendarPostItem` | Create event (V4) | All |
| `V4CalendarPatchItem` | Update event (V4) | All |
| `GetEventsCalendarViewV3` | Get calendar view of events (V3) | All |
| `GetOutlookCategoryNames` | Get Outlook category names | All |
| `CalendarDeleteItemV2` | Delete event (V2) | All |
| `FindMeetingTimes` | Find meeting times | All |
| `SendEmailV2` | Send an email (V2) | All |
| `GetEmailsV3` | Get emails (V3) | All |

### SharePoint (`shared_sharepointonline`)

| operationId | Display Name |
|-------------|-------------|
| `GetItems` | Get items |
| `PostItem` | Create item |

### Microsoft Teams (`shared_teams`)

| operationId | Display Name |
|-------------|-------------|
| `PostMessageToConversation` | Post message in a chat or channel |

## Environment Publisher

For the Copilot Studio environment, use:
```json
{
  "uniqueName": "DefaultPublisherorg60ae70f3",
  "displayName": "Default Publisher for org60ae70f3",
  "description": "Default publisher for this organization",
  "prefix": "cr449",
  "optionValuePrefix": 10000
}
```

## Critical Rules

- The `.zip` MUST have files at root level — NO parent folder wrapping
- `data` files have NO file extension — they are YAML named literally `data`
- Every `data` file needs an `<Override>` in `[Content_Types].xml` or it is **silently ignored**
- Folder names must exactly match `schemaname` in botcomponent.xml
- `configuration.json` gPTSettings.defaultSchemaName must match the GPT component's schema name exactly
- Schema name format: `{prefix}_{botName}` for bot, `{prefix}_{botName}.{type}.{Name}` for components
- **RootComponents is EMPTY** (`<RootComponents />`) — do NOT add RootComponent entries
- **bot.xml has NO `<description>` tag** — description is only in the GPT component
- **Assets link ACTION components to connection references** — NOT the GPT component
- **Connection reference `iscustomizable` is 0** in customizations.xml, but **1** in Assets linkage
- **configuration.json has NO `contentModeration` field** — removed from real format
- **`optInUseLatestModels` defaults to `false`**, `useModelKnowledge` defaults to `true`
- After import, the agent must be opened in Copilot Studio to configure connections and publish
- If direct ZIP import fails, use `pac solution pack` to repackage

## Fallback: pac CLI

If the ZIP doesn't import cleanly:
```powershell
# Install pac CLI (one-time)
dotnet tool install --global Microsoft.PowerApps.CLI.Tool

# Authenticate to the environment
pac auth create --url https://org60ae70f3.crm.dynamics.com

# Import the solution
pac solution import --path "output/MyAgent.zip" --async
```

## Lessons Learned

Issues encountered during real imports — check this section before generating.

### 1. OPC Part URI: No spaces in filenames (2026-03-05)
**Error:** `Part URI is not valid per rules defined in the Open Packaging Conventions specification`
**Cause:** Filenames inside the zip contained spaces. Dataverse solution zips follow the OPC spec, which requires Part URIs to conform to RFC 3986 — no spaces allowed.
**Fix:** Sanitize all names used in file paths by replacing spaces with underscores. Display names in XML metadata can still use spaces.
**Rule:** All file paths inside the .zip must be OPC-compliant — no spaces, no special URI characters.

### 2. Backslash zip entries from PowerShell Compress-Archive (2026-03-05)
**Error:** `Xaml file is missing from import zip file: FileName: /path/to/file.json`
**Cause:** PowerShell's `Compress-Archive` creates zip entries with Windows-style backslashes (`folder\file.json`). Dataverse expects forward slashes per OPC spec (`folder/file.json`). The paths in customizations.xml use forward slashes, so Dataverse can't match the entry.
**Fix:** Replaced `Compress-Archive` with `System.IO.Compression.ZipFile` and explicit forward-slash path normalization (`$relativePath -replace '\\', '/'`).
**Rule:** Never use `Compress-Archive` for Dataverse solution zips on Windows. Always use `System.IO.Compression` with path normalization.

### 3. instructionsFile resolves relative to definition file, not cwd (2026-03-05)
**Problem:** The `instructionsFile` path in the agent definition JSON was being resolved relative to the current working directory, which broke when running the generator from a different directory than the definition file.
**Fix:** The generator now tracks the definition file's directory (via `agentDef._defPath`) and resolves `instructionsFile` relative to that location.
**Rule:** Always place instruction files alongside the definition JSON, or use absolute paths. The generator resolves relative paths from the definition file's directory.

### 4. Office 365 Users connector (shared_office365users) for name resolution (2026-03-05)
**Discovery:** When the agent needs to resolve first names to email addresses (e.g., "schedule a meeting with Ally"), the Office 365 Users connector provides this capability.
**Connector:** `shared_office365users` with the `SearchUserV2` operation. This searches across display name, given name, surname, mail, and user principal name.
**Rule:** Add `shared_office365users` with `SearchUserV2` to the agent's connectors whenever the agent needs to look up people by name. This was added to the generator's CONNECTOR_CATALOG.

### 5. FindMeetingTimes does NOT filter by day-of-week or time-of-day (2026-03-05)
**Problem:** The `FindMeetingTimes` operation returns the soonest available slots within the Start/End window. It has no built-in day-of-week or time-of-day filtering. An agent asked to find "a Tuesday or Wednesday afternoon" will get back Monday mornings instead.
**Fix:** Agent instructions must explicitly tell the orchestrator to: (a) make separate API calls for each specific target date, and (b) constrain Start/End times to the desired time window (e.g., afternoons = 12:00 PM to 5:00 PM).
**Rule:** Never rely on FindMeetingTimes to filter by day-of-week or time-of-day on its own. The agent instructions must decompose the request into individual date+time-window API calls.

### 6. Auto-increment solution versions for easy re-import (2026-03-05)
**Problem:** Re-importing a solution with the same version number causes confusion — hard to tell which package is which.
**Fix:** The generator now auto-increments the build number (4th digit) when an existing zip with the same solution name is found in the output folder. Version is embedded in both the filename and `solution.xml`.
**Rule:** Always use versioned output paths like `output/CalendarChecker` so the auto-increment can detect previous builds. The version in the definition JSON is the base; the generator bumps from there.
