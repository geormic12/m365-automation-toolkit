# SharePoint Connector Reference for Power Automate / Copilot Studio

> **Source:** [Microsoft Learn - SharePoint Connector](https://learn.microsoft.com/en-us/connectors/sharepointonline/)
> **Last updated on source:** 2026-03-04
> **Connector class:** Standard (included in all plans)
> **Publisher:** Microsoft
> **Category:** Content and Files

---

## Table of Contents

- [Connector Overview](#connector-overview)
- [Authentication & Connection](#authentication--connection)
- [Throttling & Rate Limits](#throttling--rate-limits)
- [SharePoint Service Limits](#sharepoint-service-limits)
- [Known Issues & Limitations](#known-issues--limitations)
- [Triggers (12 total)](#triggers)
- [Actions (44 total)](#actions)
- [Return Type Definitions](#return-type-definitions)

---

## Connector Overview

SharePoint helps organizations share and collaborate with colleagues, partners, and customers. You can connect to SharePoint Online or to an on-premises SharePoint 2016 or 2019 farm using the On-Premises Data Gateway.

**Available in:**

| Service | Class | Regions |
|---------|-------|---------|
| Copilot Studio | Standard | All Power Automate regions |
| Logic Apps | Standard | All Logic Apps regions |
| Power Apps | Standard | All Power Apps regions |
| Power Automate | Standard | All Power Automate regions |

**Supported list templates:** Only generic lists (template ID 100) and generic document libraries (template ID 101). Custom templates (Announcements, Contacts, Events, Tasks, etc.) are NOT supported.

---

## Authentication & Connection

### Connection Type

- **Authentication:** Default (OAuth 2.0 via Microsoft Entra ID / Azure AD)
- **Shareable:** No -- each user must create their own connection
- **Scopes:** The connector uses delegated permissions through Microsoft Graph / SharePoint REST API. The specific scopes are managed by the connector infrastructure (not user-configurable). The connection inherits the user's SharePoint permissions.

### On-Premises Gateway Parameters

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Gateway | - | No | gatewaySetting | On-prem gateway |
| Authentication Type | - | No | string | Auth type for database |
| Username | - | Yes | securestring | Username credential |
| Password | - | Yes | securestring | Password credential |

### Conditional Access

Conditional Access policies (MFA, device compliance) may block access to data via this connector. See [Microsoft Entra ID Conditional Access docs](https://learn.microsoft.com/en-us/azure/active-directory/conditional-access/).

---

## Throttling & Rate Limits

### Connector-Level Limits (Power Platform)

| Limit | Value | Period |
|-------|-------|--------|
| API calls per connection | 600 | 60 seconds |
| Bandwidth transferred per connection | 1,000 MB | 60 seconds |

### SharePoint Online Service Throttling

#### User-Level Limits

| Category | Type | Interval | Limit |
|----------|------|----------|-------|
| User | Requests | 5 min | 3,000 |
| User | Ingress (upload) | 1 hour | 50 GB |
| User | Egress (download) | 1 hour | 100 GB |
| User | Delegation token requests | 5 min | 50 |
| User | External sharing emails | 1 hour | 200 |

#### Tenant-Level Limits (Resource Units per 5 min)

| License Count | Limit |
|---------------|-------|
| 0 - 1,000 | 18,750 |
| 1,001 - 5,000 | 37,500 |
| 5,001 - 15,000 | 56,250 |
| 15,001 - 50,000 | 75,000 |
| 50,000+ | 93,750 |

#### Application-Level Limits (Per App Per Tenant)

**Per-minute Resource Units:**

| License Count | Limit |
|---------------|-------|
| 0 - 1,000 | 1,250 |
| 1,001 - 5,000 | 2,500 |
| 5,001 - 15,000 | 3,750 |
| 15,001 - 50,000 | 5,000 |
| 50,000+ | 6,250 |

**Per-24-hour Resource Units:**

| License Count | Limit |
|---------------|-------|
| 0 - 1,000 | 1,200,000 |
| 1,001 - 5,000 | 2,400,000 |
| 5,001 - 15,000 | 3,600,000 |
| 15,001 - 50,000 | 4,800,000 |
| 50,000+ | 6,000,000 |

**Per App Per Tenant bandwidth:** 400 GB ingress + 400 GB egress per hour.

#### Resource Unit Costs (Microsoft Graph)

| Cost | Operations |
|------|-----------|
| 1 RU | Single item query (get item), delta with token, file download |
| 2 RU | Multi-item query (list children), create/update/delete/upload |
| 5 RU | All permission operations, including `$expand=permissions` |

**CSOM/REST:** No predetermined RU cost; generally consumes MORE resource units than Graph APIs.

#### Throttling Behavior

- Returns **HTTP 429** (Too Many Requests) or **HTTP 503** (Server Too Busy)
- Always includes `Retry-After` header (seconds to wait)
- `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset` headers returned at 80%+ usage (beta)
- Throttled requests still count toward usage limits
- Persistent abuse leads to blocking (notification via Office 365 Message Center)

### Power Automate Flow Limits

| Limit | Value |
|-------|-------|
| Actions per workflow | 500 |
| Concurrent flow runs (concurrency off) | Unlimited |
| Concurrent flow runs (concurrency on) | 1-100 (default 25) |
| Apply to each array items | 5,000 (Low) / 100,000 (other plans) |
| Paginated items | 5,000 (Low) / 100,000 (other plans) |
| Power Platform requests per 5 min | 100,000 |
| Outbound synchronous request timeout | 120 seconds |
| Message size limit | 100 MB (1 GB with chunking) |
| Minimum recurrence interval | 60 seconds |

---

## SharePoint Service Limits

| Resource | Limit |
|----------|-------|
| **File upload size** | 250 GB per file |
| **File attached to list item** | 250 MB |
| **List item attachments** (via connector) | 90 MB |
| **Items per list/library** | 30 million |
| **List view threshold** | 5,000 items (queries returning >5,000 need indexing/filtering) |
| **Lookup columns per Get items/Get files** | Maximum 12 lookup columns returned |
| **File path length** | 400 characters (decoded, including file name) |
| **Lists + libraries per site collection** | 2,000 combined |
| **Subsites per site collection** | 2,000 |
| **Sites per organization** | 2 million |
| **Max storage per site** | 25 TB |
| **Major versions per file** | 50,000 |
| **Minor versions per file** | 511 |
| **Users per site collection** | 2 million |
| **SharePoint groups per site** | 10,000 |
| **Users per group** | 5,000 |
| **Groups per user per site** | 5,000 |
| **Unique security scopes** | 50,000 (recommended: 5,000) |
| **Managed metadata terms** | 1 million total |
| **Move/copy total file size** | 100 GB, max 30,000 files |

### The 5,000-Item View Threshold

This is the single most impactful limit for Power Automate flows. When a list/library exceeds 5,000 items:

- **Get items** / **Get files** actions may fail or return incomplete results without proper filtering
- Use **Filter Query** (OData) and **Top Count** parameters to stay under the threshold
- Use **Limit Columns by View** parameter to restrict which columns are returned
- Index the columns you filter on in SharePoint
- ODATA `$filter` with `And`/`Or` is delegable; `Not` is NOT delegable

---

## Known Issues & Limitations

1. **Guest users** cannot view or retrieve dropdown list information in connector operations
2. **Sensitivity labels** cannot be set on files via this connector
3. **Term set label updates** are not auto-reflected in connected flows; manually edit the list item to force refresh
4. **Lists with periods in the name** (e.g., `MySharePoint.List`) cause errors when used as dynamic values; use the list ID instead or select from dropdown
5. **CannotDisableTriggerConcurrency** error: Once concurrency control is enabled then disabled, it cannot be undone. Export flow, edit JSON to remove concurrency control, re-import
6. **"For a selected item/file" triggers** only work in flows in the default environment
7. **Certain built-in SharePoint flows** (e.g., Request sign-off) are not editable in Power Automate
8. **Delegation limits** in Power Apps may cause incomplete data sets
9. **Moving/syncing files** does NOT trigger flows (metadata is preserved, not updated)
10. **Extract Folder V2** may distort special characters; use UTF-8 compliant zip tools
11. **Site collection vs subsite:** The connector works with both, but subsites are addressed by their full URL (e.g., `https://contoso.sharepoint.com/sites/sitename/subsite`)

---

## Triggers

### Summary Table

| # | Display Name | operationId | Deprecated? | Replacement |
|---|-------------|-------------|-------------|-------------|
| 1 | When an item is created | `GetOnNewItems` | No | - |
| 2 | When an item is created or modified | `GetOnUpdatedItems` | No | - |
| 3 | When an item or a file is modified | `GetOnChangedItems` | No | - |
| 4 | When an item is deleted | `GetOnDeletedItems` | No | - |
| 5 | When a file is created (properties only) | `GetOnNewFileItems` | No | - |
| 6 | When a file is created or modified (properties only) | `GetOnUpdatedFileItems` | No | - |
| 7 | When a file is deleted | `GetOnDeletedFileItems` | No | - |
| 8 | When a file is classified by a Microsoft Syntex model | `GetOnUpdatedFileClassifiedTimes` | No | - |
| 9 | When a file is created in a folder | `OnNewFile` | **YES** | `GetOnNewFileItems` |
| 10 | When a file is created or modified in a folder | `OnUpdatedFile` | **YES** | `GetOnUpdatedFileItems` |
| 11 | For a selected item | `OnItemSelected` | No | - |
| 12 | For a selected file | `OnFileSelected` | No | - |
| 13 | When a site has requested to join a hub site | `OnHubSiteJoinApproval` | No | - |

### Trigger Details

---

#### 1. When an item is created

- **operationId:** `GetOnNewItems`
- **Deprecated:** No
- **Description:** Triggers when an item is created in a SharePoint list.
- **Type:** Polling trigger

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Site Address | `dataset` | Yes | string | e.g. `https://contoso.sharepoint.com/sites/sitename` |
| List Name | `table` | Yes | string | SharePoint list name |
| Limit Columns by View | `view` | No | string | Avoid column threshold issues |

**Returns:** Dynamic -- based on list columns.

---

#### 2. When an item is created or modified

- **operationId:** `GetOnUpdatedItems`
- **Deprecated:** No
- **Description:** Triggers when an item is created, and also each time it is modified.
- **Type:** Polling trigger

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Site Address | `dataset` | Yes | string | e.g. `https://contoso.sharepoint.com/sites/sitename` |
| List Name | `table` | Yes | string | SharePoint list name |
| Limit Columns by View | `view` | No | string | Avoid column threshold issues |

**Returns:** Dynamic -- based on list columns. Includes `TriggerWindowStartToken` and `TriggerWindowEndToken`.

**Gotchas:**
- Fires on EVERY modification, including system updates
- Multiple rapid edits may be batched into a single trigger fire
- Polling interval varies; changes may take minutes to trigger

---

#### 3. When an item or a file is modified

- **operationId:** `GetOnChangedItems`
- **Deprecated:** No
- **Description:** Triggers when an item is modified (but NOT when it is created). Works for both lists and libraries.
- **Type:** Polling trigger

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Site Address | `dataset` | Yes | string | e.g. `https://contoso.sharepoint.com/sites/sitename` |
| List or Library Name | `table` | Yes | string | SharePoint list or library name |
| Folder | `folderPath` | No | string | Specific folder, or blank for whole library |
| Limit Columns by View | `view` | No | string | Avoid column threshold issues |

**Returns:** Dynamic. Includes `TriggerWindowStartToken` and `TriggerWindowEndToken` for use with "Get changes" action.

**Gotchas:**
- Does NOT fire on item creation -- only modifications
- Use with "Get changes for an item or a file" action to determine which columns changed

---

#### 4. When an item is deleted

- **operationId:** `GetOnDeletedItems`
- **Deprecated:** No
- **Description:** Triggers when an item is deleted in a list.
- **Restriction:** Can only be used by **site collection admins** of the site.

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Site Address | `dataset` | Yes | string | e.g. `https://contoso.sharepoint.com/sites/sitename` |
| List Name | `table` | Yes | string | SharePoint list name |

**Returns:** `DeletedItemList` containing:

| Field | Type | Description |
|-------|------|-------------|
| ID | integer | List item ID |
| Name | string | File name (libraries) or display name (lists) |
| FileNameWithExtension | string | File name with extension |
| DeletedByUserName | string | Who deleted it |
| TimeDeleted | date-time | When it was deleted |
| IsFolder | boolean | Whether it was a folder |

---

#### 5. When a file is created (properties only)

- **operationId:** `GetOnNewFileItems`
- **Deprecated:** No
- **Description:** Triggers when a file is created in a library. Returns only column properties (NOT file content). Use "Get file content" with the returned File Identifier to get actual content.

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Site Address | `dataset` | Yes | string | e.g. `https://contoso.sharepoint.com/sites/sitename` |
| Library Name | `table` | Yes | string | SharePoint library name |
| Folder | `folderPath` | No | string | Specific folder, or blank for whole library |
| Limit Columns by View | `view` | No | string | Avoid column threshold issues |

**Returns:** Dynamic -- based on library columns.

---

#### 6. When a file is created or modified (properties only)

- **operationId:** `GetOnUpdatedFileItems`
- **Deprecated:** No
- **Description:** Triggers when a file is created or its properties are modified in a library. Returns only column properties.

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Site Address | `dataset` | Yes | string | e.g. `https://contoso.sharepoint.com/sites/sitename` |
| Library Name | `table` | Yes | string | SharePoint library name |
| Folder | `folderPath` | No | string | Specific folder, or blank for whole library |
| Limit Columns by View | `view` | No | string | Avoid column threshold issues |

**Returns:** Dynamic -- based on library columns.

---

#### 7. When a file is deleted

- **operationId:** `GetOnDeletedFileItems`
- **Deprecated:** No
- **Description:** Triggers when a file is deleted in a library. When a folder is deleted, fires only once for the folder.
- **Restriction:** Can only be used by **site collection admins**.

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Site Address | `dataset` | Yes | string | e.g. `https://contoso.sharepoint.com/sites/sitename` |
| Library Name | `table` | Yes | string | SharePoint library name |
| Folder | `folderPath` | No | string | Specific folder, or blank for whole library |

**Returns:** `DeletedItemList` (same schema as item deleted trigger).

---

#### 8. When a file is classified by a Microsoft Syntex model

- **operationId:** `GetOnUpdatedFileClassifiedTimes`
- **Deprecated:** No
- **Description:** Triggers when Microsoft Syntex changes the classification date of any file in the library.

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Site Address | `dataset` | Yes | string | e.g. `https://contoso.sharepoint.com/sites/sitename` |
| Library Name | `table` | Yes | string | SharePoint library name |
| Folder | `folderPath` | No | string | Specific folder, or blank for whole library |
| Limit Columns by View | `view` | No | string | Avoid column threshold issues |

**Returns:** Dynamic.

---

#### 9. When a file is created in a folder [DEPRECATED]

- **operationId:** `OnNewFile`
- **Deprecated:** YES
- **Replacement:** Use `GetOnNewFileItems` ("When a file is created (properties only)")
- **Description:** Triggers when a file is created in a specific folder. Does NOT fire on subfolder activity.

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Site Address | `dataset` | Yes | string | Site URL |
| Folder Id | `folderId` | Yes | string | Select a folder |
| Infer Content Type | `inferContentType` | No | boolean | Infer content-type from extension |

**Returns:** File Content (binary).

---

#### 10. When a file is created or modified in a folder [DEPRECATED]

- **operationId:** `OnUpdatedFile`
- **Deprecated:** YES
- **Replacement:** Use `GetOnUpdatedFileItems` ("When a file is created or modified (properties only)")
- **Description:** Triggers on file create or modify in a specific folder. Does NOT fire on subfolder activity.

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Site Address | `dataset` | Yes | string | Site URL |
| Folder Id | `folderId` | Yes | string | Select a folder |
| Infer Content Type | `inferContentType` | No | boolean | Infer content-type from extension |

**Returns:** File Content (binary).

---

#### 11. For a selected item

- **operationId:** `OnItemSelected`
- **Deprecated:** No
- **Description:** Manual trigger -- user selects an item in a SharePoint list and runs the flow. Only works in the **default environment**.
- **Type:** Instant/manual trigger

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| operationId | `operationId` | Yes | string | - |
| host | `host` | No | object | - |
| parameters | `parameters` | Yes | object | - |
| schema | `schema` | Yes | object | - |
| headersSchema | `headersSchema` | No | object | - |

**Returns:**

| Field | Path | Type | Description |
|-------|------|------|-------------|
| rows | body.rows | array of object | - |
| ID | body.rows.ID | integer | File/item identifier |
| itemUrl | body.rows.itemUrl | string | Item URL |
| fileName | body.rows.fileName | string | File name |
| User id | headers.x-ms-user-id-encoded | guid | AAD user ID who triggered |
| User email | headers.x-ms-user-email-encoded | byte | Email of triggering user |
| User name | headers.x-ms-user-name-encoded | byte | Display name of triggering user |
| Timestamp | headers.x-ms-user-timestamp | string | When the flow was triggered |

---

#### 12. For a selected file

- **operationId:** `OnFileSelected`
- **Deprecated:** No
- **Description:** Manual trigger -- user selects a file in a document library and runs the flow. Only works in the **default environment**.
- **Type:** Instant/manual trigger

**Parameters:** Same as `OnItemSelected`.

**Returns:** Same schema as `OnItemSelected`.

---

#### 13. When a site has requested to join a hub site

- **operationId:** `OnHubSiteJoinApproval`
- **Deprecated:** No
- **Description:** Triggers when a site requests to join a hub site.

**Returns:**

| Field | Path | Type | Description |
|-------|------|------|-------------|
| RequestingSiteUrl | body.rows.RequestingSiteUrl | string | URL of requesting site |
| RequestingSiteId | body.rows.RequestingSiteId | string | Site ID |
| RequestingSiteTitle | body.rows.RequestingSiteTitle | string | Site title |
| ApprovalCorrelationId | body.rows.ApprovalCorrelationId | string | Correlation ID |
| User id | headers.x-ms-user-id-encoded | guid | AAD user ID |
| User email | headers.x-ms-user-email-encoded | byte | User email |
| User name | headers.x-ms-user-name-encoded | byte | User display name |
| Timestamp | headers.x-ms-user-timestamp | string | Time triggered |

---

### Trigger Behavior Notes

1. **Polling, not webhooks:** All automated SharePoint triggers use polling (checking for changes at intervals), NOT webhooks. The polling interval is managed by Power Automate and typically checks every few minutes.
2. **Batching:** Multiple changes between polls may be grouped. The flow may fire multiple times rapidly after a polling check.
3. **Moving/syncing files does NOT trigger flows** -- metadata timestamps are preserved.
4. **Delete triggers require site collection admin** permissions on the connection account.
5. **Concurrency control on triggers:** Once enabled and then disabled, cannot be undone without export/reimport.

---

## Actions

### Summary Table

| # | Display Name | operationId | Deprecated? |
|---|-------------|-------------|-------------|
| 1 | Get items | `GetItems` | No |
| 2 | Get item | `GetItem` | No |
| 3 | Create item | `PostItem` | No |
| 4 | Update item | `PatchItem` | No |
| 5 | Delete item | `DeleteItem` | No |
| 6 | Get files (properties only) | `GetFileItems` | No |
| 7 | Get file properties | `GetFileItem` | No |
| 8 | Get file content | `GetFileContent` | No |
| 9 | Get file content using path | `GetFileContentByPath` | No |
| 10 | Create file | `CreateFile` | No |
| 11 | Update file | `UpdateFile` | No |
| 12 | Update file properties | `PatchFileItem` | No |
| 13 | Delete file | `DeleteFile` | No |
| 14 | Get file metadata | `GetFileMetadata` | No |
| 15 | Get file metadata using path | `GetFileMetadataByPath` | No |
| 16 | Copy file | `CopyFileAsync` | No |
| 17 | Copy file (deprecated) | `CopyFile` | **YES** |
| 18 | Move file | `MoveFileAsync` | No |
| 19 | Copy folder | `CopyFolderAsync` | No |
| 20 | Move folder | `MoveFolderAsync` | No |
| 21 | Check in file | `CheckInFile` | No |
| 22 | Check out file | `CheckOutFile` | No |
| 23 | Discard check out | `DiscardFileCheckOut` | No |
| 24 | Extract folder | `ExtractFolderV2` | No |
| 25 | Add attachment | `CreateAttachment` | No |
| 26 | Get attachments | `GetItemAttachments` | No |
| 27 | Get attachment content | `GetAttachmentContent` | No |
| 28 | Delete attachment | `DeleteAttachment` | No |
| 29 | Get all lists and libraries | `GetAllTables` | No |
| 30 | Get lists | `GetTables` | No |
| 31 | Get list views | `GetTableViews` | No |
| 32 | List folder | `ListFolder` | No |
| 33 | List root folder | `ListRootFolder` | No |
| 34 | Get folder metadata | `GetFolderMetadata` | No |
| 35 | Get folder metadata using path | `GetFolderMetadataByPath` | No |
| 36 | Create new folder | `CreateNewFolder` | No |
| 37 | Create new document set | `CreateNewDocumentSet` | No |
| 38 | Get changes for an item or a file (properties only) | `GetItemChanges` | No |
| 39 | Send an HTTP request to SharePoint | `HttpRequest` | No |
| 40 | Resolve person | `SearchForUser` | No |
| 41 | Set content approval status | `SetApprovalStatus` | No |
| 42 | Create sharing link for a file or folder | `CreateSharingLink` | No |
| 43 | Grant access to an item or a folder | `GrantAccess` | No |
| 44 | Stop sharing an item or a file | `UnshareItem` | No |
| 45 | Create an approval request for an item or file | `CreateApprovalRequest` | No |
| 46 | Update file properties using AI Builder model results | `PatchFileItemWithPredictedValues` | No |
| 47 | Generate document using Microsoft Syntex (preview) | `CreateContentAssemblyDocument` | No |
| 48 | Agreements Solution - Generate document | `CreateAgreementsSolutionDocument` | No |
| 49 | Check if scheduled version is published | `CheckIfFileIsPublished` | **YES** |
| 50 | Approve hub site join request | `ApproveHubSiteJoin` | No |
| 51 | Cancel hub site join request | `CancelHubSiteJoinApproval` | No |
| 52 | Set hub site join status to pending | `NotifyHubSiteJoinApprovalStarted` | No |
| 53 | Join hub site | `JoinHubSite` | No |

---

### Action Details -- Core List Operations

---

#### GetItems -- Get items

- **operationId:** `GetItems`
- **Description:** Gets items from a SharePoint list. Most commonly used action.

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Site Address | `dataset` | Yes | string | e.g. `https://contoso.sharepoint.com/sites/sitename` |
| List Name | `table` | Yes | string | SharePoint list name |
| Filter Query | `$filter` | No | string | OData filter (e.g., `stringColumn eq 'value' OR numberColumn lt 123`) |
| Order By | `$orderby` | No | string | OData orderBy query |
| Top Count | `$top` | No | integer | Total entries to retrieve (default = all) |
| Limit Entries to Folder | `folderPath` | No | string | Specific folder, or blank for whole list |
| Include Nested Items | `viewScopeOption` | No | string | Return items in sub-folders (default = true) |
| Limit Columns by View | `view` | No | string | Avoid column threshold issues |

**Returns:** Dynamic -- array of list items with all column values.

**Gotchas:**
- Default returns ALL items (no pagination by default) but Power Automate automatically paginates behind the scenes
- Maximum 12 lookup columns returned; exceeding this causes flow failure
- Use `$top` to limit results and avoid threshold issues
- OData filter is essential for lists with >5,000 items
- `$filter` supports `eq`, `ne`, `gt`, `ge`, `lt`, `le`, `startswith`, `substringof`
- `And`/`Or` are delegable; `Not` is NOT delegable

---

#### GetItem -- Get item

- **operationId:** `GetItem`
- **Description:** Gets a single item by its ID from a SharePoint list.

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Site Address | `dataset` | Yes | string | Site URL |
| List Name | `table` | Yes | string | SharePoint list name |
| Id | `id` | Yes | integer | Unique identifier of item |
| Limit Columns by View | `view` | No | string | Avoid column threshold issues |

**Returns:** Dynamic -- single item with all column values.

---

#### PostItem -- Create item

- **operationId:** `PostItem`
- **Description:** Creates a new item in a SharePoint list.

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Site Address | `dataset` | Yes | string | Site URL |
| List Name | `table` | Yes | string | SharePoint list name |
| Item | `item` | Yes | dynamic | Item to create (key-value pairs of column internal names) |
| Limit Columns by View | `view` | No | string | Avoid column threshold issues |

**Returns:** Dynamic -- the created item with all column values including the new ID.

---

#### PatchItem -- Update item

- **operationId:** `PatchItem`
- **Description:** Updates an item in a SharePoint list.

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Site Address | `dataset` | Yes | string | Site URL |
| List Name | `table` | Yes | string | SharePoint list name |
| Id | `id` | Yes | integer | Unique identifier of item to update |
| Item | `item` | Yes | dynamic | Item with changed properties |
| Limit Columns by View | `view` | No | string | Avoid column threshold issues |

**Returns:** Dynamic -- the updated item.

---

#### DeleteItem -- Delete item

- **operationId:** `DeleteItem`
- **Description:** Deletes an item from a SharePoint list.

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Site Address | `dataset` | Yes | string | Site URL |
| List Name | `table` | Yes | string | SharePoint list name |
| Id | `id` | Yes | integer | Unique identifier of item to delete |

**Returns:** None.

---

### Action Details -- File Operations

---

#### GetFileContent -- Get file content

- **operationId:** `GetFileContent`
- **Description:** Gets file binary contents using the file identifier.

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Site Address | `dataset` | Yes | string | Site URL |
| File Identifier | `id` | Yes | string | Select a file (uses the encoded path/identifier) |
| Infer Content Type | `inferContentType` | No | boolean | Infer content-type from extension |

**Returns:** File Content (binary).

---

#### GetFileContentByPath -- Get file content using path

- **operationId:** `GetFileContentByPath`
- **Description:** Gets file binary contents using the file path.

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Site Address | `dataset` | Yes | string | Site URL |
| File Path | `path` | Yes | string | Path to file (e.g., `/Shared Documents/file.docx`) |
| Infer Content Type | `inferContentType` | No | boolean | Infer content-type from extension |

**Returns:** File Content (binary).

---

#### CreateFile -- Create file

- **operationId:** `CreateFile`
- **Description:** Uploads a file to a SharePoint document library.

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Site Address | `dataset` | Yes | string | Site URL |
| Folder Path | `folderPath` | Yes | string | Must start with an existing library (e.g., `/Shared Documents/subfolder`) |
| File Name | `name` | Yes | string | Name of the file |
| File Content | `body` | Yes | binary | Content of the file |

**Returns:** `SPBlobMetadataResponse` -- see [Return Type Definitions](#spblobmetadataresponse).

---

#### UpdateFile -- Update file

- **operationId:** `UpdateFile`
- **Description:** Updates the binary contents of a file specified by file identifier.

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Site Address | `dataset` | Yes | string | Site URL |
| File Identifier | `id` | Yes | string | Select a file |
| File Content | `body` | Yes | binary | New content of the file |

**Returns:** `BlobMetadataResponse` -- see [Return Type Definitions](#blobmetadataresponse).

---

#### DeleteFile -- Delete file

- **operationId:** `DeleteFile`
- **Description:** Deletes the file specified by the file identifier.

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Site Address | `dataset` | Yes | string | Site URL |
| File Identifier | `id` | Yes | string | Select a file |

**Returns:** None.

---

#### GetFileItems -- Get files (properties only)

- **operationId:** `GetFileItems`
- **Description:** Gets properties stored in library columns for ALL files and folders in a library. Supports filtering.

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Site Address | `dataset` | Yes | string | Site URL |
| Library Name | `table` | Yes | string | SharePoint library name |
| Filter Query | `$filter` | No | string | OData filter |
| Order By | `$orderby` | No | string | OData orderBy |
| Top Count | `$top` | No | integer | Total entries to retrieve (default = all) |
| Limit Entries to Folder | `folderPath` | No | string | Specific folder or blank for whole library |
| Include Nested Items | `viewScopeOption` | No | string | Return items in sub-folders (default = true) |
| Limit Columns by View | `view` | No | string | Avoid column threshold issues |

**Returns:** Dynamic -- array of file metadata with column properties.

---

#### GetFileItem -- Get file properties

- **operationId:** `GetFileItem`
- **Description:** Gets properties from library columns for a single file by item ID.

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Site Address | `dataset` | Yes | string | Site URL |
| Library Name | `table` | Yes | string | SharePoint library name |
| Id | `id` | Yes | integer | Unique identifier of item |
| Limit Columns by View | `view` | No | string | Avoid column threshold issues |

**Returns:** Dynamic -- single item with file properties.

---

#### PatchFileItem -- Update file properties

- **operationId:** `PatchFileItem`
- **Description:** Updates the column properties for a file in a library. Does NOT update file content -- use UpdateFile for that.

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Site Address | `dataset` | Yes | string | Site URL |
| Library Name | `table` | Yes | string | SharePoint library name |
| Id | `id` | Yes | integer | Unique identifier of item to update |
| Item | `item` | Yes | dynamic | Item with changed properties |
| Limit Columns by View | `view` | No | string | Avoid column threshold issues |

**Returns:** Dynamic.

---

#### GetFileMetadata -- Get file metadata

- **operationId:** `GetFileMetadata`
- **Description:** Gets file system metadata (size, etag, created date) using file identifier. NOT column properties -- use GetFileItem for that.

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Site Address | `dataset` | Yes | string | Site URL |
| File Identifier | `id` | Yes | string | Select a file |

**Returns:** `SPBlobMetadataResponse`.

---

#### GetFileMetadataByPath -- Get file metadata using path

- **operationId:** `GetFileMetadataByPath`
- **Description:** Gets file system metadata using a file path.

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Site Address | `dataset` | Yes | string | Site URL |
| File Path | `path` | Yes | string | File path |

**Returns:** `SPBlobMetadataResponse`.

---

### Action Details -- File Management

---

#### CopyFileAsync -- Copy file

- **operationId:** `CopyFileAsync`

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Current Site Address | `dataset` | Yes | string | Source site URL |
| File to Copy | `sourceFileId` | Yes | string | File identifier |
| Destination Site Address | `destinationDataset` | Yes | string | Destination site URL |
| Destination Folder | `destinationFolderPath` | Yes | string | Destination folder path |
| If another file is already there | `nameConflictBehavior` | Yes | integer | Conflict behavior |

**Returns:** `SPBlobMetadataResponse`.

---

#### CopyFile -- Copy file (deprecated)

- **operationId:** `CopyFile`
- **Deprecated:** YES. Use `CopyFileAsync`.

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Site Address | `dataset` | Yes | string | Site URL |
| Source File Path | `source` | Yes | string | Path to source file |
| Destination File Path | `destination` | Yes | string | Path to destination file |
| Overwrite Flag | `overwrite` | No | boolean | Overwrite if exists |

**Returns:** `BlobMetadata`.

---

#### MoveFileAsync -- Move file

- **operationId:** `MoveFileAsync`

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Current Site Address | `dataset` | Yes | string | Source site URL |
| File to Move | `sourceFileId` | Yes | string | File identifier |
| Destination Site Address | `destinationDataset` | Yes | string | Destination site URL |
| Destination Folder | `destinationFolderPath` | Yes | string | Destination folder path |
| If another file is already there | `nameConflictBehavior` | Yes | integer | Conflict behavior |

**Returns:** `SPBlobMetadataResponse`.

---

#### CopyFolderAsync -- Copy folder

- **operationId:** `CopyFolderAsync`

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Current Site Address | `dataset` | Yes | string | Source site URL |
| Folder to Copy | `sourceFolderId` | Yes | string | Folder identifier |
| Destination Site Address | `destinationDataset` | Yes | string | Destination site URL |
| Destination Folder | `destinationFolderPath` | Yes | string | Destination folder path |
| If another folder is already there | `nameConflictBehavior` | Yes | integer | Conflict behavior |

**Returns:** `SPBlobMetadataResponse`.

---

#### MoveFolderAsync -- Move folder

- **operationId:** `MoveFolderAsync`

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Current Site Address | `dataset` | Yes | string | Source site URL |
| Folder to Move | `sourceFolderId` | Yes | string | Folder identifier |
| Destination Site Address | `destinationDataset` | Yes | string | Destination site URL |
| Destination Folder | `destinationFolderPath` | Yes | string | Destination folder path |
| If another folder is already there | `nameConflictBehavior` | Yes | integer | Conflict behavior |

**Returns:** `SPBlobMetadataResponse`.

---

#### CheckInFile -- Check in file

- **operationId:** `CheckInFile`

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Site Address | `dataset` | Yes | string | Site URL |
| Library Name | `table` | Yes | string | Library name |
| Id | `id` | Yes | integer | List item ID of the file |
| Comments | `comment` | Yes | string | Check-in comments |
| Check in type | `checkinType` | Yes | integer | Version type (Major/Minor/Overwrite) |

**Returns:** None.

---

#### CheckOutFile -- Check out file

- **operationId:** `CheckOutFile`

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Site Address | `dataset` | Yes | string | Site URL |
| Library Name | `table` | Yes | string | Library name |
| Id | `id` | Yes | integer | List item ID of the file |

**Returns:** None.

---

#### DiscardFileCheckOut -- Discard check out

- **operationId:** `DiscardFileCheckOut`

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Site Address | `dataset` | Yes | string | Site URL |
| Library Name | `table` | Yes | string | Library name |
| Id | `id` | Yes | integer | List item ID of the file |

**Returns:** None.

---

#### ExtractFolderV2 -- Extract folder

- **operationId:** `ExtractFolderV2`
- **Description:** Extracts an archive (.zip) into a SharePoint folder.

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Site Address | `dataset` | Yes | string | Site URL |
| Source File Path | `source` | Yes | string | Path to the archive file |
| Destination Folder Path | `destination` | Yes | string | Path to destination folder |
| Overwrite Flag | `overwrite` | No | boolean | Overwrite existing files |

**Returns:** Array of `BlobMetadata`.

---

### Action Details -- Attachments

---

#### CreateAttachment -- Add attachment

- **operationId:** `CreateAttachment`

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Site Address | `dataset` | Yes | string | Site URL |
| List Name | `table` | Yes | string | List name |
| Id | `itemId` | Yes | integer | List item ID |
| File Name | `displayName` | Yes | string | Attachment file name |
| File Content | `body` | Yes | binary | File content |

**Returns:** `SPListItemAttachment`.

---

#### GetItemAttachments -- Get attachments

- **operationId:** `GetItemAttachments`

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Site Address | `dataset` | Yes | string | Site URL |
| List Name | `table` | Yes | string | List name |
| Id | `itemId` | Yes | string | List item ID |

**Returns:** Array of `SPListItemAttachment`.

---

#### GetAttachmentContent -- Get attachment content

- **operationId:** `GetAttachmentContent`

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Site Address | `dataset` | Yes | string | Site URL |
| List Name | `table` | Yes | string | List name |
| Id | `itemId` | Yes | integer | List item ID |
| File Identifier | `attachmentId` | Yes | string | Attachment file identifier |

**Returns:** Attachment Content (binary).

---

#### DeleteAttachment -- Delete attachment

- **operationId:** `DeleteAttachment`

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Site Address | `dataset` | Yes | string | Site URL |
| List Name | `table` | Yes | string | List name |
| Id | `itemId` | Yes | integer | List item ID |
| File Identifier | `attachmentId` | Yes | string | Attachment file identifier |

**Returns:** None.

---

### Action Details -- Lists & Folders

---

#### GetAllTables -- Get all lists and libraries

- **operationId:** `GetAllTables`

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Site Address | `dataset` | Yes | string | Site URL |

**Returns:** `TablesList` -- array of `Table` objects.

---

#### GetTables -- Get lists

- **operationId:** `GetTables`

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Site Address | `dataset` | Yes | string | Site URL |

**Returns:** `TablesList`.

---

#### GetTableViews -- Get list views

- **operationId:** `GetTableViews`

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Site Address | `dataset` | Yes | string | Site URL |
| List Name | `table` | Yes | string | List name |

**Returns:** Array of `Table`.

---

#### ListFolder -- List folder

- **operationId:** `ListFolder`

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Site Address | `dataset` | Yes | string | Site URL |
| File Identifier | `id` | Yes | string | Folder identifier |

**Returns:** Array of `BlobMetadata`.

---

#### ListRootFolder -- List root folder

- **operationId:** `ListRootFolder`

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Site Address | `dataset` | Yes | string | Site URL |

**Returns:** Array of `BlobMetadata`.

---

#### GetFolderMetadata -- Get folder metadata

- **operationId:** `GetFolderMetadata`

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Site Address | `dataset` | Yes | string | Site URL |
| File Identifier | `id` | Yes | string | Folder identifier |

**Returns:** `SPBlobMetadataResponse`.

---

#### GetFolderMetadataByPath -- Get folder metadata using path

- **operationId:** `GetFolderMetadataByPath`

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Site Address | `dataset` | Yes | string | Site URL |
| Folder Path | `path` | Yes | string | Folder path |

**Returns:** `SPBlobMetadataResponse`.

---

#### CreateNewFolder -- Create new folder

- **operationId:** `CreateNewFolder`

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Site Address | `dataset` | Yes | string | Site URL |
| List or Library | `table` | Yes | string | List or library name |
| Folder Path | `path` | Yes | string | e.g., `folder1/folder2/folder3` |
| Limit Columns by View | `view` | No | string | Avoid column threshold issues |

**Returns:** Dynamic.

---

#### CreateNewDocumentSet -- Create new document set

- **operationId:** `CreateNewDocumentSet`

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Site Address | `dataset` | Yes | string | Site URL |
| Library | `table` | Yes | string | Library name |
| Document Set Path | `path` | Yes | string | e.g., `folder1/folder2/dsName` |
| Content Type Id | `contentTypeId` | Yes | string | e.g., `0x0120D520` |
| DynamicProperties | `DynamicProperties` | No | object | Additional properties |

**Returns:** Dynamic.

---

### Action Details -- Advanced Operations

---

#### GetItemChanges -- Get changes for an item or a file (properties only)

- **operationId:** `GetItemChanges`
- **Description:** Returns which columns changed within a time window. Requires versioning on the list.

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Site Address | `dataset` | Yes | string | Site URL |
| List or Library Name | `table` | Yes | string | List/library name |
| Id | `id` | Yes | integer | Item ID |
| Since | `since` | Yes | string | Start token, version label (e.g., `3.0`), or ISO 8601 date |
| Until | `until` | No | string | End token/version/date. Defaults to latest. |
| Include Minor Versions | `includeDrafts` | No | boolean | Consider draft versions |
| Limit Columns by View | `view` | No | string | Return only view-defined columns |

**Returns:** Dynamic -- changed column values.

**Important:** Use with `GetOnChangedItems` trigger, passing `TriggerWindowStartToken` as `since` and `TriggerWindowEndToken` as `until`.

---

#### HttpRequest -- Send an HTTP request to SharePoint

- **operationId:** `HttpRequest`
- **Description:** Execute ANY SharePoint REST API call. The most flexible but also most dangerous action.

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Site Address | `dataset` | Yes | string | Site URL |
| Method | `method` | Yes | string | HTTP method (GET, POST, PUT, PATCH, DELETE) |
| Uri | `uri` | Yes | string | e.g., `_api/web/lists/getbytitle('Documents')` |
| Headers | `headers` | No | object | JSON object of request headers |
| Body | `body` | No | string | JSON request body |

**Returns:** Dynamic (depends on the API called).

---

#### SearchForUser -- Resolve person

- **operationId:** `SearchForUser`
- **Description:** Returns a single user match for assignment to a Person column. Errors if 0 or multiple matches.

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Site Address | `dataset` | Yes | string | Site URL |
| List or Library | `table` | Yes | string | Target list/library |
| Column | `entityId` | Yes | string | Person column to assign to |
| Email or name | `searchValue` | Yes | string | Full email or full name |
| Limit Columns by View | `view` | No | string | Avoid column threshold issues |

**Returns:** `SPListExpandedUser`.

---

#### SetApprovalStatus -- Set content approval status

- **operationId:** `SetApprovalStatus`
- **Description:** Sets approval status for items in lists/libraries with content approval enabled. SharePoint Online and 2019 only.

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Site Address | `dataset` | Yes | string | Site URL |
| Library Name | `table` | Yes | string | Library name |
| Id | `id` | Yes | integer | Item ID |
| Action | `approvalAction` | Yes | string | Approval action (Approve/Reject/Pending) |
| Comments | `comments` | No | string | Approver comments |
| ETag | `entityTag` | No | string | ETag (required for files and pages) |

**Returns:** `SetApprovalStatusOutput`.

---

#### CreateSharingLink -- Create sharing link for a file or folder

- **operationId:** `CreateSharingLink`

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Site Address | `dataset` | Yes | string | Site URL |
| Library Name | `table` | Yes | string | Library name |
| Item Id | `id` | Yes | integer | File or folder item ID |
| Link Type | `type` | Yes | string | Type of sharing link |
| Link Scope | `scope` | Yes | string | Who gets access (Anyone requires admin enablement) |
| Link Expiration | `expirationDateTime` | No | date-time | Expiry date (yyyy-MM-dd format, anonymous links only) |

**Returns:** `SharingLinkPermission`.

---

#### GrantAccess -- Grant access to an item or a folder

- **operationId:** `GrantAccess`

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Site Address | `dataset` | Yes | string | Site URL |
| List or Library Name | `table` | Yes | string | List/library name |
| Id | `id` | Yes | integer | Item/folder ID |
| Recipients | `recipients` | Yes | email | Collection of recipient emails |
| Roles | `roleValue` | Yes | string | Role to grant |
| Message | `emailBody` | No | string | Plain text message in sharing invitation |
| Notify Recipients | `sendEmail` | No | boolean | Send email notification |

**Returns:** None.

---

#### UnshareItem -- Stop sharing an item or a file

- **operationId:** `UnshareItem`

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Site Address | `dataset` | Yes | string | Site URL |
| List or Library Name | `table` | Yes | string | List/library name |
| Id | `id` | Yes | integer | Item/file ID |

**Returns:** None.

---

#### CreateApprovalRequest -- Create an approval request

- **operationId:** `CreateApprovalRequest`

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Site Address | `dataset` | Yes | string | Site URL |
| List or Library | `table` | Yes | string | List/library name |
| Id | `id` | Yes | integer | Item ID |
| Approval Type | `approvalType` | Yes | integer | Approval type |
| Approval Schema | `approvalSchema` | Yes | dynamic | Schema for the approval type |

**Returns:** `ApprovalData` -- contains `ApprovalId` (string).

---

#### PatchFileItemWithPredictedValues -- Update file properties using AI Builder model results

- **operationId:** `PatchFileItemWithPredictedValues`

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Site Address | `dataset` | Yes | string | Site URL |
| Library Name | `table` | Yes | string | Library name |
| Id | `id` | Yes | integer | Item ID |
| ModelId | `modelId` | No | string | AI Builder model ID |
| PredictResult | `predictResult` | No | string | Prediction results as JSON |

**Returns:** Dynamic.

---

#### CheckIfFileIsPublished [DEPRECATED]

- **operationId:** `CheckIfFileIsPublished`

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Site Address | `dataset` | Yes | string | Site URL |
| Library Name | `table` | Yes | string | Library name |
| Item ID | `id` | Yes | integer | File item ID |
| Scheduled Version | `scheduledVersion` | Yes | string | Version that was scheduled |

**Returns:** `PublishedResult` -- contains `IsFilePublished` (boolean).

---

### Action Details -- Hub Site Operations

---

#### ApproveHubSiteJoin

- **operationId:** `ApproveHubSiteJoin`

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Hub Site Address | `dataset` | Yes | string | Hub site URL |
| Requesting Site Id | `joiningSiteId` | Yes | string | ID of requesting site |

**Returns:** `ApproveHubSiteJoinResponse` -- contains `ApprovalToken` (string).

---

#### CancelHubSiteJoinApproval

- **operationId:** `CancelHubSiteJoinApproval`

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Requesting Site Address | `dataset` | Yes | string | Site URL |
| Approval Correlation Id | `approvalCorrelationId` | No | string | Correlation ID |

**Returns:** None.

---

#### NotifyHubSiteJoinApprovalStarted -- Set hub site join status to pending

- **operationId:** `NotifyHubSiteJoinApprovalStarted`

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Requesting Site Address | `dataset` | Yes | string | Site URL |
| Approval Correlation Id | `approvalCorrelationId` | No | string | Correlation ID |

**Returns:** None.

---

#### JoinHubSite

- **operationId:** `JoinHubSite`

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Requesting Site Address | `dataset` | Yes | string | Site URL |
| Hub Site Id | `hubSiteId` | Yes | string | Hub site ID |
| Approval Token | `approvalToken` | No | string | Token from approve action |
| Approval Correlation Id | `approvalCorrelationId` | No | string | Correlation ID |

**Returns:** None.

---

### Action Details -- Document Generation

---

#### CreateContentAssemblyDocument -- Generate document using Microsoft Syntex (preview)

- **operationId:** `CreateContentAssemblyDocument`
- **Requires:** Syntex license

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Site Address | `dataset` | Yes | string | Site URL |
| Document Library Name | `table` | Yes | string | Library name |
| Document Template | `template` | Yes | string | Template to use |
| Placeholders | `item` | Yes | dynamic | Placeholder values |
| Folder Path | `folderPath` | No | string | Output folder |
| File Name | `fileName` | No | string | Output file name |
| View (no effect) | `view` | No | string | Does nothing -- do not use |

**Returns:** `SPBlobMetadataResponse`.

---

#### CreateAgreementsSolutionDocument -- Agreements Solution - Generate document

- **operationId:** `CreateAgreementsSolutionDocument`
- **Requires:** License or PayG (in planning)

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Agreements Solution Workspace | `dataset` | Yes | string | Workspace URL |
| Agreements Solution Template | `template` | Yes | string | Template |
| Fields | `item` | Yes | dynamic | Placeholder values |
| File Name | `documentName` | No | string | Output file name |
| Table (no effect) | `table` | No | string | Does nothing |
| View (no effect) | `view` | No | string | Does nothing |

**Returns:** `SPBlobMetadataResponse`.

---

## Return Type Definitions

### SPBlobMetadataResponse

Returned by: CreateFile, GetFileMetadata, CopyFileAsync, MoveFileAsync, CopyFolderAsync, MoveFolderAsync, etc.

| Field | Path | Type | Description |
|-------|------|------|-------------|
| ItemId | ItemId | integer | Value usable with Get/Update file properties |
| Id | Id | string | Unique file/folder ID (encoded path) |
| Name | Name | string | File/folder name |
| DisplayName | DisplayName | string | Display name |
| Path | Path | string | Full path |
| LastModified | LastModified | date-time | Last modification timestamp |
| Size | Size | integer | Size in bytes |
| MediaType | MediaType | string | MIME type |
| IsFolder | IsFolder | boolean | Whether it is a folder |
| ETag | ETag | string | Entity tag for concurrency |
| FileLocator | FileLocator | string | File locator string |

### BlobMetadataResponse

Returned by: UpdateFile.

| Field | Path | Type | Description |
|-------|------|------|-------------|
| Id | Id | string | Unique ID |
| Name | Name | string | Name |
| DisplayName | DisplayName | string | Display name |
| Path | Path | string | Path |
| LastModified | LastModified | date-time | Last modified |
| Size | Size | integer | Size in bytes |
| MediaType | MediaType | string | MIME type |
| IsFolder | IsFolder | boolean | Is folder |
| ETag | ETag | string | Entity tag |
| FileLocator | FileLocator | string | File locator |

### BlobMetadata

Returned by: CopyFile (deprecated), ListFolder, ListRootFolder, ExtractFolderV2.

Same fields as BlobMetadataResponse.

### SPListItemAttachment

Returned by: CreateAttachment, GetItemAttachments.

| Field | Path | Type | Description |
|-------|------|------|-------------|
| Id | Id | string | File identifier |
| AbsoluteUri | AbsoluteUri | string | Link to attachment |
| DisplayName | DisplayName | string | File name |

### SPListExpandedUser

Returned by: SearchForUser (Resolve person).

| Field | Path | Type | Description |
|-------|------|------|-------------|
| Claims | Claims | string | User claims |
| DisplayName | DisplayName | string | User title/name |
| Email | Email | string | User email |
| Picture | Picture | string | User picture URL |
| Department | Department | string | User department |
| JobTitle | JobTitle | string | User job title |
| @odata.type | @odata.type | string | OData type |

### DeletedItem

Returned in: DeletedItemList (from delete triggers).

| Field | Path | Type | Description |
|-------|------|------|-------------|
| ID | ID | integer | List item ID |
| Name | Name | string | File name (libraries) or display name (lists) |
| FileNameWithExtension | FileNameWithExtension | string | Full filename |
| DeletedByUserName | DeletedByUserName | string | Who deleted it |
| TimeDeleted | TimeDeleted | date-time | When deleted |
| IsFolder | IsFolder | boolean | Whether it was a folder |

### SetApprovalStatusOutput

| Field | Path | Type | Description |
|-------|------|------|-------------|
| ETag | ETag | string | ETag after status change |
| ApprovalLink | ApprovalLink | string | Link to approval item |
| PublishStartDate | PublishStartDate | string | Scheduled publish date |
| ContentApprovalStatus | ContentApprovalStatus | string | Current approval status |
| ScheduledVersion | ScheduledVersion | string | Scheduled version |

### ApprovalData

| Field | Path | Type | Description |
|-------|------|------|-------------|
| ApprovalId | ApprovalId | string | Approval request ID |

### SharingLinkPermission

| Field | Path | Type | Description |
|-------|------|------|-------------|
| link.webUrl | link.webUrl | string | The sharing link URL |

### Table

| Field | Path | Type | Description |
|-------|------|------|-------------|
| Name | Name | string | Internal table name (used at runtime) |
| DisplayName | DisplayName | string | Display name |
| DynamicProperties | DynamicProperties | object | Additional connector properties |

### TablesList

| Field | Path | Type | Description |
|-------|------|------|-------------|
| value | value | array of Table | List of tables |

---

## Non-Delegable System Fields (Power Apps)

These SharePoint system fields cannot be delegated in Power Apps queries:
- Identifier, IsFolder, Thumbnail, Link, Name, FilenameWithExtension
- Path, FullPath, ModerationStatus, ModerationComment
- ContentType, IsCheckedOut, VersionNumber
- TriggerWindowStartToken, TriggerWindowEndToken

---

## SharePoint Server On-Premises Support

### Supported Triggers (On-Premises)

| Trigger | SP 2013 | SP 2016 | SP 2019 |
|---------|---------|---------|---------|
| When a file is created in a folder | Yes | Yes | Yes |
| When a file is created or modified in a folder | Yes | Yes | Yes |
| When an item is created | Yes* | Yes* | Yes* |
| When an item is created or modified | Yes* | Yes* | Yes* |
| When a file is created (properties only) | No | No | Yes* |
| When a file is created or modified (properties only) | No | No | Yes* |
| When an item is deleted | No | No | Yes** |
| When a file is deleted | No | No | Yes** |

\* Does not support "Limit Columns by View"
\** No activity for 60+ days = trigger fails. System User deletions also activate trigger.

### Supported Actions (On-Premises)

All core CRUD actions are supported on SP 2013/2016/2019 with these exceptions:
- **Create file:** Cannot upload via chunking (large files)
- **Get items:** Only OData parameters; no Folder, Nested Items, or View limiting
- **Get item / Create item / Update item:** No "Limit Columns by View"

---

## Quick Reference: Common Flow Patterns

### Read list items with filtering
```
Action: GetItems
$filter: Status eq 'Active'
$top: 100
$orderby: Created desc
```

### Create then update
```
Action 1: PostItem (returns new item with ID)
Action 2: PatchItem (use ID from step 1)
```

### Upload file then set properties
```
Action 1: CreateFile (returns SPBlobMetadataResponse with ItemId)
Action 2: PatchFileItem (use ItemId from step 1)
```

### Detect which columns changed
```
Trigger: GetOnChangedItems (returns TriggerWindowStartToken, TriggerWindowEndToken)
Action: GetItemChanges (pass tokens as Since/Until)
```

---

## Sources

- [SharePoint Connector Reference](https://learn.microsoft.com/en-us/connectors/sharepointonline/)
- [SharePoint Connector Actions & Triggers](https://learn.microsoft.com/en-us/sharepoint/dev/business-apps/power-automate/sharepoint-connector-actions-triggers)
- [Avoid Getting Throttled in SharePoint Online](https://learn.microsoft.com/en-us/sharepoint/dev/general-development/how-to-avoid-getting-throttled-or-blocked-in-sharepoint-online)
- [Power Automate Limits and Config](https://learn.microsoft.com/en-us/power-automate/limits-and-config)
- [SharePoint Online Service Limits](https://learn.microsoft.com/en-us/office365/servicedescriptions/sharepoint-online-service-description/sharepoint-online-limits)
