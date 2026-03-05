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

## Instructions

1. **Interpret the user's request** (`$ARGUMENTS`). Determine:
   - What the agent should do (its purpose and behavior)
   - What orchestration mode (generative or classic)
   - What connectors/tools the agent needs
   - What custom topics are needed (if any beyond the 13 system defaults)
   - What the greeting message should say

2. **Create the agent definition JSON file** at `scripts/copilot-studio/agents/<agent-name>/<agent-name>.json`:
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

3. **Write agent instructions** as a separate markdown file if they're long.

4. **Generate the solution package** by running:
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
