---
name: generate-agent-flow
description: Generate a Copilot Studio Agent Flow (Workflow) as an importable Dataverse solution (.zip). Supports any connector combination with trigger + action chains.
---

# /generate-agent-flow — Build a Copilot Studio Agent Flow Package

## What This Skill Does

Takes a natural-language description of a Copilot Studio workflow (agent flow) and produces a valid Dataverse solution `.zip` that can be imported via **Copilot Studio → Solutions → Import** or **Power Platform admin → Solutions → Import**.

The user's request is: **$ARGUMENTS**

## Background

Copilot Studio agent flows are deterministic automations (trigger → actions) that run on the same engine as Power Automate but are managed in Copilot Studio. They export as Dataverse solution .zip files with 4 required files.

### Package Structure
```
Solution.zip (files at root, NO parent folder)
├── [Content_Types].xml                          ← declares xml + json content types
├── solution.xml                                 ← solution metadata + RootComponent type="29"
├── customizations.xml                           ← workflow metadata + connection references
└── Workflows/
    └── <FlowName>-<GUID>.json                  ← flow definition (Logic Apps schema)
```

### Key Metadata Values
- `RootComponent type="29"` — identifies the component as a Workflow/Process
- `Category=5` — Modern Flow (cloud flow)
- `ModernFlowType=1` — CopilotStudioFlow (use `0` for PowerAutomateFlow, `2` for M365CopilotAgentFlow)
- `StateCode=1`, `StatusCode=2` — Active/Activated
- `Scope=4` — Organization scope
- `PrimaryEntity=none` — not triggered by a Dataverse entity

### Connection References

Each connector used in the flow needs a connection reference in `customizations.xml`. The flow JSON references these via `connectionReferenceLogicalName`. Each connection reference has:
- `connectionreferencelogicalname` — unique ID using publisher prefix (e.g., `new_office365_a1b2c`)
- `connectorid` — `/providers/Microsoft.PowerApps/apis/<connector_api_name>`
- `runtimeSource` — always `"embedded"` for agent flows

If the same connector is used in multiple distinct roles (e.g., OneDrive trigger and OneDrive copy action), each gets a separate connection reference with a suffix (e.g., `shared_onedriveforbusiness`, `shared_onedriveforbusiness-1`).

### Flow Definition Schema

The workflow JSON uses the Azure Logic Apps workflow definition schema:
```json
{
  "properties": {
    "connectionReferences": {
      "<connectionName>": {
        "api": { "name": "<connector_api_name>" },
        "connection": { "connectionReferenceLogicalName": "<from_customizations.xml>" },
        "runtimeSource": "embedded"
      }
    },
    "definition": {
      "$schema": "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#",
      "contentVersion": "1.0.0.0",
      "actions": { ... },
      "triggers": { ... },
      "parameters": {
        "$authentication": { "defaultValue": {}, "type": "SecureObject" },
        "$connections": { "defaultValue": {}, "type": "Object" }
      },
      "outputs": {}
    },
    "templateName": null
  },
  "schemaVersion": "1.0.0.0"
}
```

### Action Input Pattern
Every connector action uses this structure:
```json
{
  "type": "OpenApiConnection",
  "inputs": {
    "parameters": { ... },
    "host": {
      "apiId": "/providers/Microsoft.PowerApps/apis/<connector_api_name>",
      "operationId": "<OperationId>",
      "connectionName": "<connectionName>"
    }
  },
  "runAfter": { "Previous_Action": ["SUCCEEDED"] }
}
```

### Common Connector API Names
| Connector | API Name |
|-----------|----------|
| OneDrive for Business | `shared_onedriveforbusiness` |
| Office 365 Outlook | `shared_office365` |
| SharePoint | `shared_sharepointonline` |
| Microsoft Teams | `shared_teams` |
| Excel Online (Business) | `shared_excelonlinebusiness` |
| Office 365 Users | `shared_office365users` |
| Planner | `shared_planner` |
| Approvals | `shared_approvals` |
| Microsoft Dataverse | `shared_commondataserviceforapps` |

### Common Operation IDs

#### OneDrive for Business (`shared_onedriveforbusiness`)

**Triggers:**
| Operation | operationId |
|-----------|-------------|
| When a file is created | `OnNewFileV2` |
| When a file is created (properties only) | `OnNewFilesV2` |
| When a file is modified | `OnUpdatedFileV2` |
| When a file is modified (properties only) | `OnUpdatedFilesV2` |

**Actions:**
| Operation | operationId | Key Parameters |
|-----------|-------------|----------------|
| Copy file | `CopyDriveFile` | `id` (source file ID), `destination` (folder path), `overwrite` (bool) |
| Copy file using path | `CopyDriveFileByPath` | `source` (path), `destination` (path), `overwrite` (bool) |
| Create file | `CreateFile` | `folderPath`, `name`, `body` (binary) |
| Delete file | `DeleteFile` | `id` |
| Get file content | `GetFileContent` | `id`, `inferContentType` (bool) |
| Get file content by path | `GetFileContentByPath` | `path`, `inferContentType` (bool) |
| Get file metadata | `GetFileMetadata` | `id` |
| List files in folder | `ListFolderV2` | `id` (folder ID) |
| Move or rename file | `MoveFile` | `id`, `destination`, `overwrite` (bool) |
| Find files in folder | `FindFiles` | `query`, `id` (folder), `findMode`, `maxFileCount` |
| Update file | `UpdateFile` | `id`, `body` (binary) |

#### Office 365 Outlook (`shared_office365`)
| Operation | operationId |
|-----------|-------------|
| Send email | `SendEmailV2` |
| Get emails | `GetEmailsV3` |
| Get email (single) | `GetEmailV2` |
| Reply to email | `ReplyToV3` |
| Forward email | `ForwardEmail_V2` |
| Move email | `MoveV2` |
| Delete email | `DeleteEmail_V2` |
| Flag email | `Flag_V2` |
| Mark read/unread | `MarkAsRead_V3` |
| Create event (V4) | `V4CalendarPostItem` |
| Get events (V4) | `V4CalendarGetItems` |
| Get event (V3) | `V3CalendarGetItem` |
| Update event (V4) | `UpdateEvent_V4` |
| Delete event (V2) | `CalendarDeleteItem_V2` |
| Get calendar view (V3) | `GetEventsCalendarViewV3` |
| Get calendars | `CalendarGetTables_V2` |
| Find meeting times | `FindMeetingTimes_V2` |
| Create contact | `ContactPostItem_V2` |
| Get contacts | `ContactGetItems_V2` |

#### SharePoint (`shared_sharepointonline`)
| Operation | operationId |
|-----------|-------------|
| Get items | `GetItems` |
| Create item | `PostItem` |
| Get item | `GetItemV2` |
| Update item | `PatchItem` |
| Delete item | `DeleteItem` |

#### Microsoft Teams (`shared_teams`)
| Operation | operationId |
|-----------|-------------|
| Post message in chat or channel | `PostMessageToConversation` |
| Get messages | `GetMessagesFromChannel` |

### Trigger Types

**OneDrive file created:**
```json
{
  "type": "OpenApiConnection",
  "inputs": {
    "parameters": {
      "folderId": "CONFIGURE_AFTER_IMPORT",
      "includeSubfolders": false,
      "inferContentType": true
    },
    "host": {
      "apiId": "/providers/Microsoft.PowerApps/apis/shared_onedriveforbusiness",
      "operationId": "OnNewFileV2",
      "connectionName": "shared_onedriveforbusiness"
    }
  },
  "recurrence": { "interval": 1, "frequency": "Minute" }
}
```

**Recurrence (scheduled):**
```json
{
  "type": "Recurrence",
  "recurrence": {
    "frequency": "Day",
    "interval": 1,
    "startTime": "2026-01-01T08:00:00Z",
    "timeZone": "(UTC-06:00) Central Time (US & Canada)"
  }
}
```

**Manual trigger (button):**
```json
{
  "type": "Request",
  "kind": "Button",
  "inputs": {
    "schema": { "type": "object", "properties": {}, "required": [] }
  }
}
```

### Control Flow

**For each loop:**
```json
{
  "type": "Foreach",
  "foreach": "@body('Previous_Action')?['value']",
  "actions": { ... },
  "runAfter": { "Previous_Action": ["SUCCEEDED"] }
}
```

**Condition:**
```json
{
  "type": "If",
  "expression": { "equals": ["@...", "value"] },
  "actions": { ... },
  "else": { "actions": { ... } },
  "runAfter": { "Previous_Action": ["SUCCEEDED"] }
}
```

### Expression References
- Trigger output: `@triggerOutputs()?['body/PropertyName']`
- Action output: `@outputs('Action_Name')?['body/PropertyName']`
- Action body: `@body('Action_Name')?['PropertyName']`

## Instructions

1. **Interpret the user's request** (`$ARGUMENTS`). Determine:
   - What trigger type is needed (file created, scheduled, manual, webhook, etc.)
   - What connectors are needed
   - What actions the flow should perform
   - What the data flow looks like between actions

2. **Create the flow definition JSON file** at `scripts/copilot-studio/flows/<flow-name>.json` following this schema:
   ```json
   {
     "name": "Human-Readable Flow Name",
     "description": "What this flow does",
     "publisher": {
       "uniqueName": "DefaultPublisherorg60ae70f3",
       "displayName": "Default Publisher for org60ae70f3",
       "description": "Default publisher for this organization",
       "prefix": "new",
       "optionValuePrefix": 10000
     },
     "solution": {
       "uniqueName": "PascalCaseSolutionName",
       "displayName": "Human-Readable Solution Name",
       "version": "1.0.0.0"
     },
     "connectors": {
       "<connector_api_name>": { "displayName": "Human Name" }
     },
     "trigger": {
       "<TriggerName>": { ... trigger definition ... }
     },
     "actions": {
       "<ActionName>": { ... action definitions with runAfter chains ... }
     }
   }
   ```

3. **Ensure proper `runAfter` chains**. Every action except the first must specify which action(s) it depends on:
   ```json
   "runAfter": { "Previous_Action_Name": ["SUCCEEDED"] }
   ```
   The first action after the trigger uses `"runAfter": {}`.

4. **Handle same-connector split**: If the same connector is used for both trigger and action (e.g., OneDrive trigger + OneDrive copy), use different connection names:
   - Trigger: `"connectionName": "shared_onedriveforbusiness"`
   - Action: `"connectionName": "shared_onedriveforbusiness-1"`

5. **Generate the package** by running:
   ```
   node scripts/copilot-studio/generate-agent-flow.js scripts/copilot-studio/flows/<flow-name>.json
   ```

6. **Report the result** to the user:
   - Where the .zip file was saved
   - What connectors need to be configured on import
   - Any post-import steps (like selecting a folder, configuring email addresses, etc.)
   - Remind them: **Copilot Studio → Solutions → Import** or **Power Platform admin → Solutions → Import**

## Environment-Specific Resource IDs

OneDrive `ListFolderV2` and similar actions require **Drive Item IDs** — opaque Base64-encoded identifiers like `b!J0N2XQ...01FVFXJ3Q...`. Plain folder paths do NOT work.

**Preferred approach (known environment):** Query the real Drive Item ID and hardcode it:
1. If MS365 MCP is logged in: call `list-drives` → get driveId, then `list-folder-files` on root → find folder's item ID
2. If not: use `CONFIGURE_AFTER_IMPORT` placeholder, have user fix + export, then read the ID from the exported JSON

**Fallback approach (unknown environment):** Use `"CONFIGURE_AFTER_IMPORT"` as placeholder and warn users they must re-select via the folder picker after import.

The `metadata` block maps IDs to human-readable display names (cosmetic only):
```json
"metadata": {
  "b!J0N2XQ...": "/Workflow Inbound"
}
```

### Known OneDrive Folder IDs
| Folder | Drive Item ID |
|--------|--------------|
| `/Workflow Inbound` | `b!J0N2XQ1PLkyLDGiu04by3IZc_Yd7fHZEsn_Hayz3BCl6aJ_4_t_ORrM-rKeau7Om.01FVFXJ3QALHMJ2652QRGJZXM2MYDKSH3R` |

## Example Flow Definition

```json
{
  "name": "Copy Inbound to Outbound",
  "description": "When a file is created in Workflow Inbound, copy it to Workflow Outbound.",
  "publisher": {
    "uniqueName": "DefaultPublisherorg60ae70f3",
    "displayName": "Default Publisher for org60ae70f3",
    "description": "Default publisher for this organization",
    "prefix": "new",
    "optionValuePrefix": 10000
  },
  "solution": {
    "uniqueName": "CopyInboundToOutbound",
    "displayName": "Copy Inbound to Outbound",
    "version": "1.0.0.0"
  },
  "connectors": {
    "shared_onedriveforbusiness": { "displayName": "OneDrive for Business" },
    "shared_office365": { "displayName": "Office 365 Outlook" }
  },
  "trigger": {
    "When_a_file_is_created": {
      "type": "OpenApiConnection",
      "inputs": {
        "parameters": {
          "folderId": "CONFIGURE_AFTER_IMPORT",
          "includeSubfolders": false,
          "inferContentType": true
        },
        "host": {
          "apiId": "/providers/Microsoft.PowerApps/apis/shared_onedriveforbusiness",
          "operationId": "OnNewFileV2",
          "connectionName": "shared_onedriveforbusiness"
        }
      },
      "recurrence": { "interval": 1, "frequency": "Minute" }
    }
  },
  "actions": {
    "Copy_file": {
      "type": "OpenApiConnection",
      "inputs": {
        "parameters": {
          "id": "@triggerOutputs()?['body/Id']",
          "destination": "\\Workflow Outbound",
          "overwrite": false
        },
        "host": {
          "apiId": "/providers/Microsoft.PowerApps/apis/shared_onedriveforbusiness",
          "operationId": "CopyDriveFile",
          "connectionName": "shared_onedriveforbusiness-1"
        }
      },
      "runAfter": {}
    },
    "Send_an_email_(V2)": {
      "type": "OpenApiConnection",
      "inputs": {
        "parameters": {
          "emailMessage/To": "recipient@example.com",
          "emailMessage/Subject": "File copied",
          "emailMessage/Body": "<p>File copied: @{outputs('Copy_file')?['body/Name']}</p>",
          "emailMessage/Importance": "Normal"
        },
        "host": {
          "apiId": "/providers/Microsoft.PowerApps/apis/shared_office365",
          "operationId": "SendEmailV2",
          "connectionName": "shared_office365"
        }
      },
      "runAfter": {
        "Copy_file": ["SUCCEEDED"]
      }
    }
  }
}
```

## Connector Reference Documentation

For complete, verified operation lists with all parameters, return schemas, and gotchas:
- See `docs/CONNECTOR-REFERENCE-INDEX.md` for the master index
- Individual references: `ONEDRIVE-CONNECTOR-REFERENCE.md`, `SHAREPOINT-CONNECTOR-REFERENCE.md`, `TEAMS-CONNECTOR-REFERENCE.md`, `OUTLOOK-CONNECTOR-REFERENCE.md`
- Dataverse solution format: `DATAVERSE-WORKFLOW-PACKAGE-RESEARCH.md`

When building a flow with a connector not listed in the quick reference above, consult these files first.

## Common Mistakes to Avoid

- **`CopyFile` vs `CopyDriveFile`** — `CopyFile` = "Upload file from URL". Use `CopyDriveFile` for actual file copy.
- **Excel `AddRowV2`** — NOT `PostItem`. SharePoint uses `PostItem` for creating items, but Excel uses `AddRowV2`.
- **Excel requires named Tables** — all row operations fail on raw cell ranges.
- **SharePoint 5,000 item threshold** — list queries fail above 5K items without indexed column filters.
- **Teams keyword trigger** — single words only, not phrases.
- **OneDrive 50 MB trigger limit** — files over 50 MB are silently skipped.
- **SharePoint move/sync** — moving files does NOT fire triggers (metadata timestamps preserved).
- **Connection references can be reused** — existing refs from other solutions work if the connector matches.

## Critical Rules

- The `.zip` MUST have files at the root level — NO parent folder wrapping
- `RootComponent type="29"` — MUST be 29 for workflows (not 1 for entities, not 60 for bots)
- Every connection name used in trigger/action `host.connectionName` MUST have a matching connection reference in `customizations.xml`
- The `JsonFileName` in customizations.xml MUST match the actual file path in the Workflows/ folder
- `runtimeSource` MUST be `"embedded"` for all connection references in the flow JSON
- `Category` MUST be `5` (Modern Flow) and `ModernFlowType` MUST be `1` (CopilotStudioFlow)
- Always include both `$connections` and `$authentication` parameters in the definition
- Use `SUCCEEDED` (uppercase) in `runAfter` chains, not `Succeeded`
- `CONFIGURE_AFTER_IMPORT` is our convention, not a platform feature — it imports literally and the user must edit the flow to replace it

## Lessons Learned

Issues encountered during real imports — check this section before generating.

### 1. OPC Part URI: No spaces in filenames (2026-03-05)
**Error:** `Part URI is not valid per rules defined in the Open Packaging Conventions specification`
**Cause:** The workflow JSON filename inside the zip contained spaces (e.g., `Workflows/Copy Inbound to Outbound-GUID.json`). Dataverse solution zips follow the Open Packaging Conventions (OPC) spec, which requires Part URIs to conform to RFC 3986 — no spaces allowed.
**Fix:** The generator now sanitizes `flowName` by replacing spaces with underscores before using it in filenames and `JsonFileName` references. The display name in `solution.xml` and `customizations.xml` still uses the original name with spaces.
**Rule:** All file paths inside the .zip must be OPC-compliant — no spaces, no special URI characters.

### 2. Backslash zip entries from PowerShell Compress-Archive (2026-03-05)
**Error:** `Xaml file is missing from import zip file: FileName: /Workflows/...json`
**Cause:** PowerShell's `Compress-Archive` creates zip entries with Windows-style backslashes (`Workflows\file.json`). Dataverse expects forward slashes per OPC spec (`Workflows/file.json`). The `JsonFileName` in customizations.xml uses forward slashes, so Dataverse can't match the entry.
**Fix:** Replaced `Compress-Archive` with `System.IO.Compression.ZipFile` and explicit forward-slash path normalization (`$relativePath -replace '\\', '/'`).
**Rule:** Never use `Compress-Archive` for Dataverse solution zips on Windows. Always use `System.IO.Compression` with path normalization.

### 3. OneDrive folder IDs are opaque Drive Item IDs, not paths (2026-03-05)
**Discovery:** `ListFolderV2`'s `id` parameter requires a **SharePoint Drive Item ID** — a Base64-encoded compound identifier like `b!J0N2XQ1PLkyLDGiu04by3IZc_Yd7fHZEsn_Hayz3BCl6aJ_4_t_ORrM-rKeau7Om.01FVFXJ3QALHMJ2652QRGJZXM2MYDKSH3R`. Plain paths like `/Workflow Inbound` do NOT work.
**What we tried:** (a) `CONFIGURE_AFTER_IMPORT` placeholder — imports fine but fails at runtime with "not found". The metadata block makes the designer display the friendly name but the actual value is still the literal placeholder string. (b) Hardcoded path `/Workflow Inbound` — also fails at runtime. The connector does not resolve paths to IDs.
**What works:** Hardcoding the real Drive Item ID. This can be obtained two ways:
1. **Export a working flow** — fix the folder via the designer picker, export the solution, and read the `id` value from the workflow JSON
2. **Query via Microsoft Graph API** — use `list-drives` to get the drive ID, then `list-folder-files` on root to find the folder's item ID (available via MS365 MCP when logged in)
**The metadata block** maps the opaque ID to a human-readable display name: `"b!...": "/Workflow Inbound"`. This is purely cosmetic for the designer UI.
**Rule:** When generating flows for a known environment, prefer hardcoding the real Drive Item ID. Use `CONFIGURE_AFTER_IMPORT` only when the target environment is unknown, and warn users: "You must click the folder field and re-select via the picker before the flow will run."

### 4. Auto-increment solution versions for easy re-import (2026-03-05)
**Problem:** Re-importing a solution with the same version number causes confusion — hard to tell which package is which.
**Fix:** The generator now auto-increments the build number (4th digit) when an existing zip with the same solution name is found in the output folder. Version is embedded in both the filename and `solution.xml`.
**Rule:** Always let versions auto-increment during iterative development. The version in the flow definition JSON is the base; the generator bumps from there.
