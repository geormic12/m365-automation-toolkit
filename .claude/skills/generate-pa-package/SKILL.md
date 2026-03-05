---
name: generate-pa-package
description: Generate a Power Automate Legacy Import Package (.zip) from a flow description. Supports any connector combination.
---

# /generate-pa-package — Build a Power Automate Import Package

## What This Skill Does

Takes a natural-language description of a Power Automate flow (or a structured JSON definition) and produces a valid `.zip` package that can be imported via **Power Automate → My flows → Import → Import Package (Legacy)**.

The user's request is: **$ARGUMENTS**

## Background

Power Automate's legacy import packages have an undocumented format with 5 required files across a specific directory structure. This skill generates all of them with proper GUID cross-references.

### Package Structure
```
Package.zip (files at root, NO parent folder)
├── manifest.json                              ← package metadata + resource dependency graph
└── Microsoft.Flow/
    └── flows/
        ├── manifest.json                      ← asset path listing
        └── <FlowGUID>/
            ├── definition.json                ← flow logic wrapped in properties envelope
            ├── apisMap.json                   ← connector name → manifest GUID
            └── connectionsMap.json            ← connection name → manifest GUID
```

### Package File Schemas

These are the exact JSON schemas for all 5 files in the package. Every GUID referenced across files must be consistent. Generate fresh GUIDs for each package build.

#### 1. Root `manifest.json` — Package metadata + resource dependency graph

```json
{
  "schema": "1.0",
  "details": {
    "displayName": "Flow Display Name",
    "description": "Flow description",
    "createdTime": "2026-01-01T00:00:00.0000000Z",
    "packageTelemetryId": "<new-guid>",
    "creator": "Claude Code",
    "sourceEnvironment": ""
  },
  "resources": {
    "<FlowGUID>": {
      "type": "Microsoft.Flow/flows",
      "suggestedCreationType": "New",
      "creationType": "Existing, New, Update",
      "details": { "displayName": "Flow Display Name" },
      "configurableBy": "User",
      "hierarchy": "Root",
      "dependsOn": ["<ApiGUID-1>", "<ConnGUID-1>", "<ApiGUID-2>", "<ConnGUID-2>"]
    },
    "<ApiGUID-1>": {
      "id": "/providers/Microsoft.PowerApps/apis/shared_office365",
      "name": "shared_office365",
      "type": "Microsoft.PowerApps/apis",
      "suggestedCreationType": "Existing",
      "details": {
        "displayName": "Office 365 Outlook",
        "iconUri": "https://connectoricons-prod.azureedge.net/releases/v1.0.1714/1.0.1714.3820/office365/icon.png"
      },
      "configurableBy": "System",
      "hierarchy": "Child",
      "dependsOn": []
    },
    "<ConnGUID-1>": {
      "type": "Microsoft.PowerApps/apis/connections",
      "suggestedCreationType": "Existing",
      "creationType": "Existing",
      "details": {
        "displayName": "Select Account",
        "iconUri": "https://connectoricons-prod.azureedge.net/releases/v1.0.1714/1.0.1714.3820/office365/icon.png"
      },
      "configurableBy": "User",
      "hierarchy": "Child",
      "dependsOn": ["<ApiGUID-1>"]
    }
  }
}
```

**Resource hierarchy**: Flow is `Root`, APIs are `Child`/`System`, Connections are `Child`/`User`. Each connector needs BOTH an API resource and a Connection resource. The Flow's `dependsOn` lists ALL API and Connection GUIDs. Each Connection's `dependsOn` lists its parent API GUID.

#### 2. Inner `Microsoft.Flow/flows/manifest.json` — Asset path listing

```json
{
  "packageSchemaVersion": "1.0",
  "flowAssets": {
    "assetPaths": ["<FlowGUID>"]
  }
}
```

The `<FlowGUID>` here matches the flow resource key in the root manifest AND the subfolder name.

#### 3. `definition.json` — Flow logic wrapped in properties envelope

```json
{
  "name": "<InternalFlowGUID>",
  "id": "/providers/Microsoft.Flow/flows/<InternalFlowGUID>",
  "type": "Microsoft.Flow/flows",
  "properties": {
    "apiId": "/providers/Microsoft.PowerApps/apis/shared_logicflows",
    "displayName": "Flow Display Name",
    "definition": {
      "metadata": {
        "workflowEntityId": null,
        "provisioningMethod": "FromDefinition",
        "failureAlertSubscription": true,
        "clientLastModifiedTime": "2026-01-01T00:00:00.0000000Z"
      },
      "$schema": "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#",
      "contentVersion": "1.0.0.0",
      "parameters": {
        "$connections": { "defaultValue": {}, "type": "Object" },
        "$authentication": { "defaultValue": {}, "type": "SecureObject" }
      },
      "triggers": {
        "TriggerName": { "...trigger definition..." }
      },
      "actions": {
        "ActionName": { "...action definitions with runAfter chains..." }
      }
    },
    "connectionReferences": {
      "shared_office365": {
        "connectionName": "",
        "source": "Invoker",
        "id": "/providers/Microsoft.PowerApps/apis/shared_office365",
        "tier": "NotSpecified",
        "apiName": "office365"
      }
    },
    "flowFailureAlertSubscribed": false,
    "isManaged": false
  }
}
```

**Critical**: `InternalFlowGUID` is a SEPARATE GUID from `FlowGUID`. The `connectionReferences` key is the connector API name (e.g. `shared_office365`). The `apiName` is the short form WITHOUT the `shared_` prefix. `source` MUST be `"Invoker"`. `connectionName` is empty string (remapped on import).

#### 4. `apisMap.json` — Connector name → root manifest API GUID

```json
{
  "shared_office365": "<ApiGUID-1>",
  "shared_excelonlinebusiness": "<ApiGUID-2>"
}
```

#### 5. `connectionsMap.json` — Connector name → root manifest Connection GUID

```json
{
  "shared_office365": "<ConnGUID-1>",
  "shared_excelonlinebusiness": "<ConnGUID-2>"
}
```

The GUIDs in both maps MUST match the corresponding resource keys in the root manifest.

#### Connector Icon URIs

Use this pattern for known connectors:
```
https://connectoricons-prod.azureedge.net/releases/v1.0.1714/1.0.1714.3820/<short-name>/icon.png
```
Where `<short-name>` is the connector name without `shared_` prefix (e.g., `office365`, `excelonlinebusiness`, `sharepointonline`, `teams`).

### Common Connector API Names
| Connector | API Name |
|-----------|----------|
| Office 365 Outlook | `shared_office365` |
| Excel Online (Business) | `shared_excelonlinebusiness` |
| SharePoint | `shared_sharepointonline` |
| Microsoft Teams | `shared_teams` |
| Office 365 Users | `shared_office365users` |
| OneDrive for Business | `shared_onedriveforbusiness` |
| Planner | `shared_planner` |
| Approvals | `shared_approvals` |
| Dataverse | `shared_commondataserviceforapps` |

### Action Input Pattern
Every connector action in Power Automate uses this structure:
```json
{
  "type": "OpenApiConnection",
  "inputs": {
    "host": {
      "apiId": "/providers/Microsoft.PowerApps/apis/<connector_name>",
      "connectionName": "<connector_name>",
      "operationId": "<OperationId>"
    },
    "parameters": { ... },
    "authentication": "@parameters('$authentication')"
  }
}
```

### Common Operation IDs
| Connector | Operation | operationId |
|-----------|-----------|-------------|
| Outlook | Send email | `SendEmailV2` |
| Outlook | Create event | `V4CalendarPostItem` |
| Outlook | Get events | `V4CalendarGetItems` |
| Excel | List rows in table | `GetItems` |
| Excel | Add row to table | `PostItem` |
| SharePoint | Get items | `GetItems` |
| SharePoint | Create item | `PostItem` |
| Teams | Post message | `PostMessageToConversation` |
| OneDrive | List files | `ListFolder` |
| Planner | Create task | `CreateTask_V3` |

### Trigger Types
- **Manual button**: `{ "type": "Request", "kind": "Button", "inputs": { "schema": { "type": "object", "properties": {}, "required": [] } } }`
- **Recurrence**: `{ "type": "Recurrence", "recurrence": { "frequency": "Day", "interval": 1 } }`
- **When item created (SharePoint)**: `{ "type": "OpenApiConnectionWebhook", "inputs": { "host": { "apiId": "/providers/Microsoft.PowerApps/apis/shared_sharepointonline", "connectionName": "shared_sharepointonline", "operationId": "CreateItemSubscription" }, ... } }`

## Instructions

1. **Interpret the user's request** (`$ARGUMENTS`). Determine:
   - What trigger type is needed (manual, scheduled, webhook, etc.)
   - What connectors are needed
   - What actions the flow should perform
   - What the data flow looks like between actions

2. **Create the flow definition JSON file** at `scripts/power-automate/flows/<flow-name>.json` following this schema:
   ```json
   {
     "displayName": "Human-Readable Flow Name",
     "description": "What this flow does",
     "creator": "Claude Code",
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
   "runAfter": { "Previous_Action_Name": ["Succeeded"] }
   ```
   The first action after the trigger uses `"runAfter": {}`.

4. **For loops (Apply to each)**, use:
   ```json
   {
     "type": "Foreach",
     "foreach": "@body('Previous_Action')?['value']",
     "actions": { ... nested actions ... },
     "runAfter": { "Previous_Action": ["Succeeded"] }
   }
   ```

5. **For conditions**, use:
   ```json
   {
     "type": "If",
     "expression": { "equals": ["@...", "value"] },
     "actions": { ... if-true actions ... },
     "else": { "actions": { ... if-false actions ... } },
     "runAfter": { "Previous_Action": ["Succeeded"] }
   }
   ```

6. **Generate the package** by running:
   ```
   node scripts/power-automate/generate-pa-package.js scripts/power-automate/flows/<flow-name>.json
   ```

7. **Report the result** to the user:
   - Where the .zip file was saved
   - What connectors need to be configured on import
   - Any post-import steps (like selecting an Excel file, SharePoint site, etc.)
   - Remind them: **Power Automate → My flows → Import → Import Package (Legacy)**

## Example Flow Definition

```json
{
  "displayName": "Daily Email Report",
  "description": "Sends a daily summary email at 8am",
  "creator": "Claude Code",
  "connectors": {
    "shared_office365": { "displayName": "Office 365 Outlook" }
  },
  "trigger": {
    "Recurrence": {
      "type": "Recurrence",
      "recurrence": {
        "frequency": "Day",
        "interval": 1,
        "startTime": "2026-01-01T08:00:00Z",
        "timeZone": "(UTC-05:00) Eastern Time (US & Canada)"
      }
    }
  },
  "actions": {
    "Send_an_email_(V2)": {
      "runAfter": {},
      "type": "OpenApiConnection",
      "inputs": {
        "host": {
          "apiId": "/providers/Microsoft.PowerApps/apis/shared_office365",
          "connectionName": "shared_office365",
          "operationId": "SendEmailV2"
        },
        "parameters": {
          "emailMessage/To": "team@company.com",
          "emailMessage/Subject": "Daily Report",
          "emailMessage/Body": "<p>Here is today's summary.</p>"
        },
        "authentication": "@parameters('$authentication')"
      }
    }
  }
}
```

## Environment-Specific Resource IDs

Power Automate validates connector parameters on import/save. Actions that reference files, tables, lists, or mailboxes **must have real resource IDs** — empty strings cause `DynamicParameterInputInvalid` errors. This affects:

- **Excel Online**: `drive` (OneDrive drive ID), `file` (item ID), `table` (table GUID)
- **SharePoint**: `dataset` (site URL), `table` (list GUID)
- **Outlook calendar**: `table` (calendar mailbox ID)

For flows targeting a known environment, use real IDs (extract from a test export). For portable packages, ask the user for their IDs or note that the step must be configured after import.

The `metadata` block on Excel actions should map file IDs to human-readable paths:
```json
"metadata": {
  "01FVFXJ3WGPWIBHKU6VNBLPHY5O65QGJSX": "/FakeDataTest.xlsx",
  "tableId": "{25503F63-16EB-417A-98D2-A32414300241}"
}
```

## Critical Rules

- The `.zip` MUST have files at the root level — NO parent folder wrapping
- Every resource GUID in `dependsOn`, `apisMap`, and `connectionsMap` must exist in the root manifest
- `suggestedCreationType` is REQUIRED on every resource or import fails silently
- `connectionName` in connectionReferences can be empty string (gets remapped on import)
- `connectionReferences.source` must be `"Invoker"` (runs as triggering user) — matches real PA exports
- Each connectionReference must include `apiName` (short name without `shared_` prefix, e.g. `"office365"`)
- Always include both `$connections` and `$authentication` parameters
- The definition.json needs the outer `name`/`id`/`type`/`properties` envelope — it's NOT a raw Logic Apps definition
- **Timezone values** must use the PA display format: `"(UTC-06:00) Central Time (US & Canada)"`, NOT Windows IDs like `"Central Standard Time"`

## Lessons Learned

Issues encountered during real imports — check this section before generating.

### 1. OPC Part URI: No spaces in filenames (2026-03-05)
**Error:** `Part URI is not valid per rules defined in the Open Packaging Conventions specification`
**Cause:** Filenames inside the zip contained spaces. Import packages follow OPC-like conventions requiring RFC 3986-compliant paths — no spaces allowed.
**Fix:** Sanitize all names used in file paths by replacing spaces with underscores. Display names in manifest metadata can still use spaces.
**Rule:** All file paths inside the .zip must be OPC-compliant — no spaces, no special URI characters.

### 2. Backslash zip entries from PowerShell Compress-Archive (2026-03-05)
**Error:** Files referenced in manifests not found during import.
**Cause:** PowerShell's `Compress-Archive` creates zip entries with Windows-style backslashes (`Microsoft.Flow\flows\...`). The import engine expects forward slashes (`Microsoft.Flow/flows/...`).
**Fix:** Replaced `Compress-Archive` with `System.IO.Compression.ZipFile` and explicit forward-slash path normalization (`$relativePath -replace '\\', '/'`).
**Rule:** Never use `Compress-Archive` for import package zips on Windows. Always use `System.IO.Compression` with path normalization.
