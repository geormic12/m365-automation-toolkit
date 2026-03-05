# Power Platform Connector Reference — Master Index

Verified connector documentation for Copilot Studio Agent Flows and Power Automate Cloud Flows. All data sourced from official Microsoft Learn documentation (March 2026).

Used by the `/generate-agent-flow` and `/generate-pa-package` skills.

## Reference Files

| Connector | API Name | File | Operations |
|-----------|----------|------|------------|
| OneDrive for Business | `shared_onedriveforbusiness` | [ONEDRIVE-CONNECTOR-REFERENCE.md](../reference/ONEDRIVE-CONNECTOR-REFERENCE.md) | 5 triggers + 22 actions |
| Office 365 Outlook | `shared_office365` | [OUTLOOK-CONNECTOR-REFERENCE.md](../reference/OUTLOOK-CONNECTOR-REFERENCE.md) | 5 triggers + 27 email + 9 calendar + 7 contacts + 3 rooms |
| SharePoint | `shared_sharepointonline` | [SHAREPOINT-CONNECTOR-REFERENCE.md](../reference/SHAREPOINT-CONNECTOR-REFERENCE.md) | 11 triggers + 53 actions |
| Microsoft Teams | `shared_teams` | [TEAMS-CONNECTOR-REFERENCE.md](../reference/TEAMS-CONNECTOR-REFERENCE.md) | 13 triggers + 33 actions |
| Excel Online (Business) | `shared_excelonlinebusiness` | (inline below) | 1 trigger + 13 actions |

## Dataverse Solution Format

See [DATAVERSE-WORKFLOW-PACKAGE-RESEARCH.md](../reference/DATAVERSE-WORKFLOW-PACKAGE-RESEARCH.md) for the complete solution .zip schema.

## Quick Reference: Most-Used Operations

### OneDrive for Business (`shared_onedriveforbusiness`)

| What | operationId | Notes |
|------|-------------|-------|
| Trigger: file created | `OnNewFileV2` | Polls every N minutes. Max 50 MB files. |
| Trigger: file modified | `OnUpdatedFileV2` | Polls every N minutes. Max 50 MB files. |
| Copy file | `CopyDriveFile` | Params: `id`, `destination`, `overwrite` |
| Copy file by path | `CopyDriveFileByPath` | Params: `source`, `destination`, `overwrite` |
| Create file | `CreateFile` | Params: `folderPath`, `name`, `body` (binary) |
| Get file content | `GetFileContent` | Params: `id`, `inferContentType` |
| Move/rename file | `MoveFile` | Params: `id`, `destination`, `overwrite` |
| Delete file | `DeleteFile` | Params: `id` |
| List files in folder | `ListFolderV2` | Params: `id` (folder ID) |
| Find files | `FindFiles` | Params: `query`, `id`, `findMode`, `maxFileCount` |
| Get file metadata | `GetFileMetadata` | Params: `id` |

**WARNING:** `CopyFile` (operationId) = "Upload file from URL", NOT "Copy file". Use `CopyDriveFile` for copying.

### Office 365 Outlook (`shared_office365`)

| What | operationId | Notes |
|------|-------------|-------|
| Send email | `SendEmailV2` | Params: `emailMessage/To`, `emailMessage/Subject`, `emailMessage/Body`, `emailMessage/Importance` |
| Get emails | `GetEmailsV3` | Folder-based email retrieval |
| Get events (V4) | `V4CalendarGetItems` | Calendar events |
| Create event (V4) | `V4CalendarPostItem` | Create calendar event |
| Update event (V4) | `V4CalendarPatchItem` | Update calendar event |
| Delete event (V2) | `CalendarDeleteItemV2` | Delete calendar event |

### SharePoint (`shared_sharepointonline`)

| What | operationId | Notes |
|------|-------------|-------|
| Trigger: item created | `GetOnNewItems` | Webhook-style. Fires on new list items. |
| Trigger: item modified | `GetOnChangedItems` | Modification only, NOT creation. |
| Trigger: file created (props) | `GetOnNewFileItems` | Properties only. |
| Get items | `GetItems` | Max 12 lookup columns. Use `$filter`/`$top` for >5K items. |
| Create item | `PostItem` | Returns created item with ID. |
| Update item | `PatchItem` | Requires item ID. |
| Delete item | `DeleteItem` | No return value. |
| Get file content | `GetFileContent` | Returns binary. Uses encoded file identifier. |
| Create file | `CreateFile` | Params: `dataset`, `folderPath`, `name`, `body` |
| Copy file | `CopyFileAsync` | Async operation. |

**WARNING:** List view threshold = 5,000 items. Queries without indexed column filters fail above this.
**WARNING:** Moving/syncing files does NOT trigger any flows (metadata timestamps preserved).

### Microsoft Teams (`shared_teams`)

| What | operationId | Notes |
|------|-------------|-------|
| Post message | `PostMessageToConversation` | Params: `poster`, `location`, `body`. 28 KB limit. |
| Trigger: keyword mentioned | `WebhookKeywordTrigger` | Single words only, not phrases. |
| Trigger: new channel message | `OnNewChannelMessage` | Root messages only, not replies. |
| Post adaptive card + wait | `PostCardAndWaitForResponse` | Returns user's response. |

**WARNING:** Private channels NOT supported for posting.
**WARNING:** Flow Bot not available in GCC/GCCH/DoD.

### Excel Online Business (`shared_excelonlinebusiness`)

| What | operationId | Notes |
|------|-------------|-------|
| List rows in table | `GetItems` | 256 rows default. Enable pagination for more. |
| Add row | `AddRowV2` | NOT `PostItem`. Returns added row. |
| Update row | `PatchItem` | Key column is case-sensitive. |
| Get row | `GetItem` | Key column is case-sensitive. |
| Delete row | `DeleteItem` | Only deletes first match. |
| Get tables | `GetTables` | List all tables in workbook. |
| Get worksheets | `GetAllWorksheets` | List all worksheets. |
| Run Office Script | `RunScriptProd` | 3 calls/10sec, 1600/day limit. |

**WARNING:** Data MUST be in a named Excel Table. Raw cell ranges are not supported.
**WARNING:** `AddRow` (no V2) is DEPRECATED — use `AddRowV2`.
**WARNING:** Write access required for ALL actions, even "read-only" ones.

## Dataverse Solution Key Facts

| Property | Value | Meaning |
|----------|-------|---------|
| RootComponent type | `29` | Workflow/Process |
| Category | `5` | Modern Flow |
| ModernFlowType | `0` | PowerAutomateFlow |
| ModernFlowType | `1` | **CopilotStudioFlow** |
| ModernFlowType | `2` | M365CopilotAgentFlow |
| StateCode | `0` | Draft |
| StateCode | `1` | Activated |
| StatusCode | `1` | Draft (pairs with State 0) |
| StatusCode | `2` | Activated (pairs with State 1) |
| Scope | `4` | Organization |
| RunAs | `1` | Calling User |
| Type | `1` | Definition |
| Managed | `0` | Unmanaged (editable after import) |
| runtimeSource | `"embedded"` | Connection refs embedded in flow JSON |
| behavior | `0` | Include subcomponents |

## Throttling Summary

| Connector | Rate Limit |
|-----------|-----------|
| OneDrive for Business | 100 calls / 60 sec / connection |
| SharePoint | 600 calls / 60 sec / connection |
| Microsoft Teams | 100 calls / 60 sec / connection |
| Excel Online | 100 calls / 60 sec / connection |
| Excel Run Script | 3 calls / 10 sec, 1600 / day |

## Common Gotchas

1. **`CopyFile` vs `CopyDriveFile`** — CopyFile = "Upload from URL". CopyDriveFile = actual file copy.
2. **Excel `AddRowV2`** — NOT `PostItem`. The SharePoint connector uses `PostItem`, Excel uses `AddRowV2`.
3. **Excel named Table required** — all row operations fail without a formatted Table.
4. **SharePoint 5K threshold** — list queries fail above 5,000 items without indexed column filters.
5. **Teams keyword trigger** — single words only, no phrases.
6. **OneDrive 50 MB trigger limit** — files over 50 MB are silently skipped by file triggers.
7. **SharePoint move/sync no trigger** — moving files preserves metadata, so triggers don't fire.
8. **SUCCEEDED uppercase** — `runAfter` chains must use `"SUCCEEDED"`, not `"Succeeded"`.
9. **ModernFlowType=1** — specifically CopilotStudioFlow, not generic. Use `0` for Power Automate flows.
10. **Connection references can be reused** — existing refs from other solutions work if the connector matches.
