# OneDrive for Business Connector -- Complete Reference

> **Source:** [Microsoft Learn -- OneDrive for Business Connector](https://learn.microsoft.com/en-us/connectors/onedriveforbusiness/)
> **Last updated on source:** 2025-11-14
> **Fetched:** 2026-03-05
> **Connector publisher:** Microsoft
> **Connector class:** Standard (included in all plans)
> **Category:** Data

---

## Table of Contents

1. [Availability](#availability)
2. [Authentication & Permissions](#authentication--permissions)
3. [Throttling Limits](#throttling-limits)
4. [File Size Limits](#file-size-limits)
5. [Triggers -- Current](#triggers----current)
6. [Triggers -- Deprecated](#triggers----deprecated)
7. [Actions -- Current](#actions----current)
8. [Actions -- Deprecated](#actions----deprecated)
9. [Return Schema Definitions](#return-schema-definitions)
10. [Known Issues & Limitations](#known-issues--limitations)
11. [Power Automate vs Copilot Studio Differences](#power-automate-vs-copilot-studio-differences)

---

## Availability

| Service | Class | Regions |
|---------|-------|---------|
| **Copilot Studio** | Standard | All Power Automate regions EXCEPT China Cloud (21Vianet) |
| **Logic Apps** | Standard | All Logic Apps regions EXCEPT Azure China |
| **Power Apps** | Standard | All Power Apps regions EXCEPT China Cloud (21Vianet) |
| **Power Automate** | Standard | All Power Automate regions EXCEPT China Cloud (21Vianet) |

---

## Authentication & Permissions

### Connection Type

- **Authentication method:** OAuth 2.0 (delegated)
- **Identity provider:** Microsoft Entra ID (Azure AD)
- **Account requirement:** Microsoft business or school account (work/school). Personal Microsoft accounts are NOT supported for creating a connection.
- **Connection scope:** The connector operates ONLY on the account used to make the connection and on data owned by that account. Cross-drive and cross-tenant access is NOT supported.

### Microsoft Graph Delegated Permissions (Scopes)

The connector uses Microsoft Graph API under the hood. The following delegated permissions are relevant:

| Permission | Display String | Description | Admin Consent Required |
|-----------|---------------|-------------|----------------------|
| `Files.Read` | Read user files | Read the signed-in user's files | No |
| `Files.Read.All` | Read all files that user can access | Read all files the signed-in user can access | No |
| `Files.ReadWrite` | Have full access to user files | Read, create, update, and delete the signed-in user's files | No |
| `Files.ReadWrite.All` | Have full access to all files user can access | Read, create, update, and delete all files the signed-in user can access | No |
| `Files.ReadWrite.AppFolder` | Have full access to the application's folder (preview) | Read, create, update, and delete files in the application's folder | No |
| `Files.Read.Selected` | Read files that the user selects (preview) | Read files that the user selects. Access for several hours after selection. **Limited Graph support.** | No |
| `Files.ReadWrite.Selected` | Read and write files that the user selects (preview) | Read and write files that the user selects. Access for several hours after selection. **Limited Graph support.** | No |

### Microsoft Graph Application Permissions

| Permission | Display String | Description | Admin Consent Required |
|-----------|---------------|-------------|----------------------|
| `Files.Read.All` | Read files in all site collections | Read all files in all site collections without a signed-in user | Yes |
| `Files.ReadWrite.All` | Read and write files in all site collections | Read, create, update, and delete all files in all site collections without a signed-in user | Yes |

> **Note:** The standard OneDrive for Business connector in Power Automate / Copilot Studio uses **delegated** permissions (user context). Application permissions apply when building custom connectors against Graph API directly.

### Sites Permissions (also relevant for OneDrive for Business)

| Permission | Type | Description | Admin Consent |
|-----------|------|-------------|---------------|
| `Sites.Read.All` | Delegated | Read items in all site collections | No |
| `Sites.ReadWrite.All` | Delegated | Read and write items in all site collections | No |
| `Sites.Manage.All` | Delegated | Create, edit, and delete items and lists in all site collections | No |
| `Sites.FullControl.All` | Delegated | Full control of all site collections | Yes |

---

## Throttling Limits

| Limit | Value | Renewal Period |
|-------|-------|---------------|
| API calls per connection | **100 calls** | **60 seconds** |

Exceeding this limit results in rejection, errors, or timeouts.

---

## File Size Limits

| Operation | Limit |
|-----------|-------|
| `When a file is created` trigger (content) | Skips files > **50 MB** |
| `When a file is modified` trigger (content) | Skips files > **50 MB** |
| `When a file is created (properties only)` trigger | **No 50 MB limit** (metadata only) |
| `When a file is modified (properties only)` trigger | **No 50 MB limit** (metadata only) |
| `Extract archive to folder` action | Max archive: **50 MB**, max **100 files** inside |
| `Copy file` action | May timeout on larger files (varies by service load) |
| `Upload file from URL` action | Reports success after **20 seconds** regardless of actual result |
| File picker UI | Displays max **200 items** per folder |
| Copilot Studio generative answers (SharePoint files) | **3 MB** per file |

---

## Triggers -- Current

### 1. For a selected file

| Property | Value |
|----------|-------|
| **operationId** | `OnFileSelected` |
| **Display name** | For a selected file |
| **Description** | Triggers a flow for a selected file in OneDrive for Business. **Available ONLY for Power Automate.** NOT available in Copilot Studio. |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| operationId | `operationId` | Yes | string | (internal) |
| host | `host` | No | object | (internal) |
| schema | `schema` | Yes | object | (internal) |
| headersSchema | `headersSchema` | No | object | (internal) |

**Returns:**

| Name | Path | Type | Description |
|------|------|------|-------------|
| rows | `body.rows` | array of object | |
| filePath | `body.rows.filePath` | string | The unique path of the file |
| fileUrl | `body.rows.fileUrl` | string | The URL to the source file |
| User id | `headers.x-ms-user-id-encoded` | guid | AAD user ID who triggered the flow |
| User email | `headers.x-ms-user-email-encoded` | byte | Email of user who triggered the flow |
| User name | `headers.x-ms-user-name-encoded` | byte | Display name of user who triggered the flow |
| Timestamp | `headers.x-ms-user-timestamp` | string | Time the flow was triggered |

---

### 2. When a file is created

| Property | Value |
|----------|-------|
| **operationId** | `OnNewFileV2` |
| **Display name** | When a file is created |
| **Description** | Triggers when a new file is created in a folder. Files > 50 MB are skipped. Files moved within OneDrive are NOT considered new. |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Folder | `folderId` | Yes | string | The unique identifier of the folder |
| Include subfolders | `includeSubfolders` | No | boolean | Include items in subfolders |
| Infer Content Type | `inferContentType` | No | boolean | Infer content-type based on extension |

**Returns:** File content (binary)

---

### 3. When a file is created (properties only)

| Property | Value |
|----------|-------|
| **operationId** | `OnNewFilesV2` |
| **Display name** | When a file is created (properties only) |
| **Description** | Triggers when a new file is created in a folder. Returns metadata only (no content). Files moved within OneDrive are NOT considered new. |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Folder | `folderId` | Yes | string | The unique identifier of the folder |
| Include subfolders | `includeSubfolders` | No | boolean | Include items in subfolders |
| Number of files to return | `maxFileCount` | No | integer | Max files per trigger run (1-100). 'Split On' setting can force individual processing. |

**Returns:** List of `BlobMetadata` objects

---

### 4. When a file is modified

| Property | Value |
|----------|-------|
| **operationId** | `OnUpdatedFileV2` |
| **Display name** | When a file is modified |
| **Description** | Triggers when a file is modified in a folder. Files > 50 MB are skipped. |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Folder | `folderId` | Yes | string | The unique identifier of the folder |
| Include subfolders | `includeSubfolders` | No | boolean | Include items in subfolders |
| Infer Content Type | `inferContentType` | No | boolean | Infer content-type based on extension |

**Returns:** File content (binary)

---

### 5. When a file is modified (properties only)

| Property | Value |
|----------|-------|
| **operationId** | `OnUpdatedFilesV2` |
| **Display name** | When a file is modified (properties only) |
| **Description** | Triggers when a file is modified in a folder. Returns metadata only. |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Folder | `folderId` | Yes | string | The unique identifier of the folder |
| Include subfolders | `includeSubfolders` | No | boolean | Include items in subfolders |
| Number of files to return | `maxFileCount` | No | integer | Max files per trigger run (1-100). 'Split On' setting can force individual processing. |

**Returns:** List of `BlobMetadata` objects

---

## Triggers -- Deprecated

### 6. When a file is created [DEPRECATED]

| Property | Value |
|----------|-------|
| **operationId** | `OnNewFile` |
| **Replacement** | `OnNewFileV2` (When a file is created) |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Folder | `folderId` | Yes | string | The unique identifier of the folder |
| Infer Content Type | `inferContentType` | No | boolean | Infer content-type based on extension |

**Returns:** File content (binary)

> Missing compared to V2: No `includeSubfolders` parameter.

---

### 7. When a file is created (properties only) [DEPRECATED]

| Property | Value |
|----------|-------|
| **operationId** | `OnNewFiles` |
| **Replacement** | `OnNewFilesV2` (When a file is created (properties only)) |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Folder | `folderId` | Yes | string | The unique identifier of the folder |
| Number of files to return | `maxFileCount` | No | integer | Max files per trigger run (1-100) |

**Returns:** List of `BlobMetadata` objects

> Missing compared to V2: No `includeSubfolders` parameter.

---

### 8. When a file is modified [DEPRECATED]

| Property | Value |
|----------|-------|
| **operationId** | `OnUpdatedFile` |
| **Replacement** | `OnUpdatedFileV2` (When a file is modified) |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Folder | `folderId` | Yes | string | The unique identifier of the folder |
| Infer Content Type | `inferContentType` | No | boolean | Infer content-type based on extension |

**Returns:** File content (binary)

> Missing compared to V2: No `includeSubfolders` parameter.

---

### 9. When a file is modified (properties only) [DEPRECATED]

| Property | Value |
|----------|-------|
| **operationId** | `OnUpdatedFiles` |
| **Replacement** | `OnUpdatedFilesV2` (When a file is modified (properties only)) |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Folder | `folderId` | Yes | string | The unique identifier of the folder |
| Number of files to return | `maxFileCount` | No | integer | Max files per trigger run (1-100) |

**Returns:** List of `BlobMetadata` objects

> Missing compared to V2: No `includeSubfolders` parameter.

---

## Actions -- Current

### 1. Convert file

| Property | Value |
|----------|-------|
| **operationId** | `ConvertFile` |
| **Display name** | Convert file |
| **Description** | Converts a file to another format. Supported conversions: https://aka.ms/onedriveconversions |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| File | `id` | Yes | string | The unique identifier of the file |
| Target type | `type` | No | string | The target file type |

**Returns:** File content (binary)

**Gotchas:** Does NOT support converting digitally signed, password-protected, or IRM restricted documents (Word to PDF). Add a delay between file creation and conversion to avoid "Bad gateway" errors.

---

### 2. Convert file using path

| Property | Value |
|----------|-------|
| **operationId** | `ConvertFileByPath` |
| **Display name** | Convert file using path |
| **Description** | Converts a file to another format using the file path. |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| File Path | `path` | Yes | string | The unique path of the file |
| Target type | `type` | No | string | The target file type |

**Returns:** File content (binary)

---

### 3. Copy file

| Property | Value |
|----------|-------|
| **operationId** | `CopyDriveFile` |
| **Display name** | Copy file |
| **Description** | Copies a file within OneDrive (by ID). |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| File | `id` | Yes | string | The unique identifier of the file |
| Destination File Path | `destination` | Yes | string | Destination file path, including target filename |
| Overwrite | `overwrite` | No | boolean | Overwrites destination file if true |

**Returns:** `BlobMetadata`

**Gotchas:** May timeout on larger files depending on service load.

---

### 4. Copy file using path

| Property | Value |
|----------|-------|
| **operationId** | `CopyDriveFileByPath` |
| **Display name** | Copy file using path |
| **Description** | Copies a file within OneDrive by path. |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| File Path | `source` | Yes | string | The unique path of the file |
| Destination File Path | `destination` | Yes | string | Destination file path, including target filename |
| Overwrite | `overwrite` | No | boolean | Overwrites destination file if true |

**Returns:** `BlobMetadata`

---

### 5. Create file

| Property | Value |
|----------|-------|
| **operationId** | `CreateFile` |
| **Display name** | Create file |
| **Description** | Creates a file in OneDrive for Business. |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Folder Path | `folderPath` | Yes | string | The unique path of the folder |
| File Name | `name` | Yes | string | The name of the file. Disallowed characters are replaced by underscores. |
| File Content | `body` | Yes | binary | The content of the file |

**Returns:** `BlobMetadata`

---

### 6. Create share link

| Property | Value |
|----------|-------|
| **operationId** | `CreateShareLinkV2` |
| **Display name** | Create share link |
| **Description** | Creates a share link for a file (by ID). |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| File | `id` | Yes | string | The unique identifier of the file |
| Link type | `type` | Yes | string | The type of link |
| Link scope | `scope` | No | string | The scope of the link |

**Returns:** `SharingLink`

---

### 7. Create share link by path

| Property | Value |
|----------|-------|
| **operationId** | `CreateShareLinkByPathV2` |
| **Display name** | Create share link by path |
| **Description** | Creates a share link for a file using the path. |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| File Path | `path` | Yes | string | The unique path of the file |
| Link type | `type` | Yes | string | The type of link |
| Link scope | `scope` | No | string | The scope of the link |

**Returns:** `SharingLink`

---

### 8. Delete file

| Property | Value |
|----------|-------|
| **operationId** | `DeleteFile` |
| **Display name** | Delete file |
| **Description** | Deletes a file from OneDrive for Business. |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| File | `id` | Yes | string | The unique identifier of the file |

**Returns:** No return body.

---

### 9. Extract archive to folder

| Property | Value |
|----------|-------|
| **operationId** | `ExtractFolderV2` |
| **Display name** | Extract archive to folder |
| **Description** | Extracts an archive (.zip) into a folder. Max 50 MB archive, max 100 files inside. |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Source Archive File Path | `source` | Yes | string | Path to the archive file |
| Destination Folder Path | `destination` | Yes | string | Path to extract archive contents |
| Overwrite | `overwrite` | No | boolean | Overwrites destination files if true |

**Returns:** Array of `BlobMetadata`

**Gotchas:** Does NOT support multi-byte characters in file names.

---

### 10. Find files in folder

| Property | Value |
|----------|-------|
| **operationId** | `FindFiles` |
| **Display name** | Find files in folder |
| **Description** | Finds files within a folder using search or regex pattern match (by folder ID). |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Search Query | `query` | Yes | string | The search query to use |
| Folder | `id` | Yes | string | The unique identifier of the folder |
| File Search Mode | `findMode` | Yes | string | "Search" (normal search engine style) or "Regular Expression Pattern Match" (regex against file names) |
| Number of files to return | `maxFileCount` | No | integer | Max files to return (1-100) |

**Returns:** Array of `BlobMetadata`

---

### 11. Find files in folder by path

| Property | Value |
|----------|-------|
| **operationId** | `FindFilesByPath` |
| **Display name** | Find files in folder by path |
| **Description** | Finds files within a folder by path using search or regex pattern match. |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Search Query | `query` | Yes | string | The search query to use |
| Folder Path | `path` | Yes | string | The unique path of the folder |
| File Search Mode | `findMode` | Yes | string | "Search" or "Regular Expression Pattern Match" |
| Number of files to return | `maxFileCount` | No | integer | Max files to return (1-100) |

**Returns:** Array of `BlobMetadata`

---

### 12. Get file content

| Property | Value |
|----------|-------|
| **operationId** | `GetFileContent` |
| **Display name** | Get file content |
| **Description** | Gets the content of a file by ID. |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| File | `id` | Yes | string | The unique identifier of the file |
| Infer Content Type | `inferContentType` | No | boolean | Infer content-type based on extension |

**Returns:** File content (binary)

---

### 13. Get file content using path

| Property | Value |
|----------|-------|
| **operationId** | `GetFileContentByPath` |
| **Display name** | Get file content using path |
| **Description** | Gets the content of a file using the file path. |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| File Path | `path` | Yes | string | The unique path of the file |
| Infer Content Type | `inferContentType` | No | boolean | Infer content-type based on extension |

**Returns:** File content (binary)

---

### 14. Get file metadata

| Property | Value |
|----------|-------|
| **operationId** | `GetFileMetadata` |
| **Display name** | Get file metadata |
| **Description** | Gets the metadata for a file by ID. |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| File | `id` | Yes | string | The unique identifier of the file |

**Returns:** `BlobMetadata`

---

### 15. Get file metadata using path

| Property | Value |
|----------|-------|
| **operationId** | `GetFileMetadataByPath` |
| **Display name** | Get file metadata using path |
| **Description** | Gets the metadata of a file using the file path. |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| File Path | `path` | Yes | string | The unique path of the file |

**Returns:** `BlobMetadata`

---

### 16. Get file thumbnail

| Property | Value |
|----------|-------|
| **operationId** | `GetFileThumbnail` |
| **Display name** | Get file thumbnail |
| **Description** | Gets the thumbnail of a file. Thumbnail is valid for 6 hours only. |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| File | `id` | Yes | string | The unique identifier of the file |
| Thumbnail Size | `size` | Yes | string | The size of the thumbnail to retrieve |

**Returns:** `Thumbnail`

---

### 17. List files in folder

| Property | Value |
|----------|-------|
| **operationId** | `ListFolderV2` |
| **Display name** | List files in folder |
| **Description** | Gets the list of files and subfolders in a folder. Returns paginated results. |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Folder | `id` | Yes | string | The unique identifier of the folder |

**Returns:** `BlobMetadataPage` (paginated -- includes `nextLink` for pagination)

---

### 18. List files in root folder

| Property | Value |
|----------|-------|
| **operationId** | `ListRootFolder` |
| **Display name** | List files in root folder |
| **Description** | Gets the list of files and subfolders in the root folder. |
| **Deprecated** | No |

**Parameters:** None.

**Returns:** Array of `BlobMetadata`

---

### 19. Move or rename a file

| Property | Value |
|----------|-------|
| **operationId** | `MoveFile` |
| **Display name** | Move or rename a file |
| **Description** | Moves or renames a file by ID. |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| File | `id` | Yes | string | The unique identifier of the file |
| Destination File Path | `destination` | Yes | string | Destination file path, including target filename |
| Overwrite | `overwrite` | No | boolean | Overwrites destination file if true |

**Returns:** `BlobMetadata`

---

### 20. Move or rename a file using path

| Property | Value |
|----------|-------|
| **operationId** | `MoveFileByPath` |
| **Display name** | Move or rename a file using path |
| **Description** | Moves or renames a file using the file path. |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| File Path | `source` | Yes | string | The unique path of the file |
| Destination File Path | `destination` | Yes | string | Destination file path, including target filename |
| Overwrite | `overwrite` | No | boolean | Overwrites destination file if true |

**Returns:** `BlobMetadata`

---

### 21. Update file

| Property | Value |
|----------|-------|
| **operationId** | `UpdateFile` |
| **Display name** | Update file |
| **Description** | Updates an existing file's content by ID. |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| File | `id` | Yes | string | The unique identifier of the file |
| File Content | `body` | Yes | binary | The content of the file |

**Returns:** `BlobMetadata`

---

### 22. Upload file from URL

| Property | Value |
|----------|-------|
| **operationId** | `CopyFile` |
| **Display name** | Upload file from URL |
| **Description** | Uploads a file from a URL to OneDrive. |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Source URL | `source` | Yes | string | The URL to the source file |
| Destination File Path | `destination` | Yes | string | Destination file path, including target filename |
| Overwrite | `overwrite` | No | boolean | Overwrites destination file if true |

**Returns:** `BlobMetadata`

**Gotchas:** Always reports success after 20 seconds regardless of actual result. You MUST add logic to verify file existence and/or add a timeout before operating on the uploaded file.

---

## Actions -- Deprecated

### 23. Create share link [DEPRECATED]

| Property | Value |
|----------|-------|
| **operationId** | `CreateShareLink` |
| **Replacement** | `CreateShareLinkV2` (Create share link) |

Same parameters as `CreateShareLinkV2`. Returns `SharingLink`.

---

### 24. Create share link by path [DEPRECATED]

| Property | Value |
|----------|-------|
| **operationId** | `CreateShareLinkByPath` |
| **Replacement** | `CreateShareLinkByPathV2` (Create share link by path) |

Same parameters as `CreateShareLinkByPathV2`. Returns `SharingLink`.

---

### 25. List files in folder [DEPRECATED]

| Property | Value |
|----------|-------|
| **operationId** | `ListFolder` |
| **Replacement** | `ListFolderV2` (List files in folder) |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Folder | `id` | Yes | string | The unique identifier of the folder |
| Include subfolders | `includeSubfolders` | No | boolean | Include items in subfolders |

**Returns:** Array of `BlobMetadata` (not paginated, unlike V2)

---

## Return Schema Definitions

### BlobMetadata

Returned by most file/folder actions and "properties only" triggers.

| Field | Path | Type | Description |
|-------|------|------|-------------|
| Id | `Id` | string | Unique identifier of the file or folder |
| Name | `Name` | string | Name of the file or folder |
| Name without extension | `NameNoExt` | string | Name without the file extension |
| Display name | `DisplayName` | string | Display name of the file or folder |
| Path | `Path` | string | Path of the file or folder |
| Last modified time | `LastModified` | date-time | Date and time the file/folder was last modified |
| Size | `Size` | integer | Size in bytes |
| Media type | `MediaType` | string | Media type (MIME type) |
| Is folder? | `IsFolder` | boolean | Whether the blob is a folder |
| ETag | `ETag` | string | ETag of the file or folder |
| File locator | `FileLocator` | string | File locator string |
| Last modified by | `LastModifiedBy` | string | User who last modified the file/folder |

### BlobMetadataPage

Returned by `ListFolderV2`.

| Field | Path | Type | Description |
|-------|------|------|-------------|
| value | `value` | array of BlobMetadata | Collection of file/folder metadata |
| nextLink | `nextLink` | string | URL to retrieve the next page of results |

### SharingLink

Returned by `CreateShareLinkV2` and `CreateShareLinkByPathV2`.

| Field | Path | Type | Description |
|-------|------|------|-------------|
| Web URL | `WebUrl` | string | URL that points to the shared file or folder |

### Thumbnail

Returned by `GetFileThumbnail`.

| Field | Path | Type | Description |
|-------|------|------|-------------|
| Url | `Url` | string | URL that points to the thumbnail |
| Width | `Width` | integer | Thumbnail width in pixels |
| Height | `Height` | integer | Thumbnail height in pixels |

---

## Known Issues & Limitations

### Trigger-Specific Issues

1. **50 MB file skip:** `When a file is created` and `When a file is modified` triggers (content versions) skip files larger than 50 MB. The "properties only" variants do NOT have this limit.
2. **Modification trigger false positives:** The modified-file triggers use heuristic-based filtering and can occasionally fire when no noticeable change occurred (e.g., metadata changes, sharing permission changes).
3. **Non-user-initiated changes:** The connector cannot distinguish user-initiated changes from system changes (e.g., Office apps auto-saving). Triggers may fire more than expected. Use checks, human approval, or file-based (not entry-based) logic.
4. **30+ pending changes:** On new file and modified file triggers (all variants) may have issues when more than ~30 pending changes occur between trigger polls.
5. **Moved files are not "new":** Files moved within OneDrive are NOT treated as new files by creation triggers.

### Action-Specific Issues

6. **PDF conversion errors:** Converting files to PDF may fail with "Bad gateway" or "resource could not be found." Workaround: increase delay between file creation and conversion.
7. **HTML to PDF conversion:** Has its own set of known issues (see [MS docs](https://learn.microsoft.com/en-us/onedrive/developer/rest-api/api/driveitem_get_content_format?view=odsp-graph-online#known-issues-with-html-to-pdf-conversion)).
8. **Copy file timeout:** Copy action for larger files may timeout. Size threshold varies by service load.
9. **Upload file from URL lies:** Always reports success after 20 seconds even if upload is still in progress. Always verify file existence afterward.
10. **Extract archive limits:** Max 50 MB archive, max 100 files. No multi-byte characters in file names.
11. **Convert file restrictions:** Cannot convert digitally signed, password-protected, or IRM restricted documents.
12. **Encrypted files:** Files encrypted and saved on OneDrive throw a corrupt file error, even though they can be opened manually.

### Cross-Boundary Issues

13. **Cross-tenant not supported:** Cannot access shared files across tenant hostname boundaries (e.g., contoso-my.sharepoint.com to microsoft-my.sharepoint.com).
14. **Multi-geo not supported:** Cannot access files across geo regions (e.g., contosoeu-my.sharepoint.com to contosoaus-my.sharepoint.com).
15. **Cross-drive not supported:** Cannot access files from other drives. Only operates on the connected account's own data. Includes files/folders added via "Add to OneDrive" / "Add shortcut."
16. **Personal accounts rejected:** Connection requires business/school accounts. Personal Microsoft accounts will not work.

### Policy-Related Issues

17. **Prevent File Download policy:** Blocks the connector from downloading file contents entirely.
18. **Unmanaged device policy:** Connector cannot be verified as a managed device, so this policy blocks it.
19. **Network location policy:** Connector may be blocked by network-location-based access controls.
20. **Access Denied errors:** Usually indicate file is locked (e.g., by Excel services) or a policy prevents access.

### UI/UX Issues

21. **File picker 200-item limit:** Only shows up to 200 items per folder in the picker UI.

---

## Power Automate vs Copilot Studio Differences

### Availability

Both Power Automate and Copilot Studio can use the OneDrive for Business connector. It is classified as a **Standard** connector in both.

### Key Differences

| Feature | Power Automate | Copilot Studio |
|---------|---------------|----------------|
| **Triggers** | All triggers available, including `For a selected file` (manual trigger) | Triggers are NOT directly available in Copilot Studio agents. Agents use connector **actions** as **tools**. To use triggers, you must call a Power Automate flow from the agent. |
| **`For a selected file` trigger** | Available (Power Automate ONLY per documentation) | NOT available |
| **Actions as tools** | Actions are steps in a flow | Actions are added as "tools" that the agent can invoke |
| **Connection credentials** | Uses the flow creator's connection (or run-as user) | By default uses **user credentials** (end-user authenticates). Can be switched to **maker-provided credentials** for pre-configured connections. |
| **SSO** | Supported | NOT supported when agent uses custom Active Directory auth and is deployed to Teams. Users must authenticate each connector manually in that scenario. |
| **Generative answers from files** | N/A | SharePoint/OneDrive files used for generative answers must be **under 3 MB**. Larger files should be split. |
| **File picker** | Visual folder browser in flow designer | Connector tools configured in agent Tools page or within topics |
| **Regions** | All Power Automate regions except China Cloud (21Vianet) | All Power Automate regions except China Cloud (21Vianet) -- same |

### How Connectors Work in Copilot Studio

- Connectors are added as **tools** to agents, not as triggers/actions in flows.
- You add tools from: Agent > Tools page > Add a tool > Connector > select the service > select the specific action.
- Copilot Studio supports both **prebuilt connectors** (like OneDrive for Business) and **custom connectors**.
- Standard connectors are included in all Copilot Studio plans. Premium connectors require select plans.
- Connection setup requires either end-user authentication (default) or maker-provided credentials.
- To share a connection with others: go to make.powerapps.com > Connections > select connection > Share > add user with "Can use + share" permission.

### Recommended Pattern for Copilot Studio + OneDrive

Since Copilot Studio agents cannot directly use OneDrive triggers, the recommended architecture is:

1. **Power Automate flow** with an OneDrive trigger (e.g., `OnNewFileV2`) handles the event detection.
2. The flow calls the **Copilot Studio agent** or processes the file and stores results.
3. Alternatively, the Copilot Studio agent uses OneDrive **actions** (like `GetFileContentByPath`, `CreateFile`) as tools for on-demand file operations.

---

## Quick Reference: All operationId Values

### Triggers

| operationId | Display Name | Status |
|-------------|-------------|--------|
| `OnFileSelected` | For a selected file | Current (Power Automate only) |
| `OnNewFileV2` | When a file is created | Current |
| `OnNewFilesV2` | When a file is created (properties only) | Current |
| `OnUpdatedFileV2` | When a file is modified | Current |
| `OnUpdatedFilesV2` | When a file is modified (properties only) | Current |
| `OnNewFile` | When a file is created | **DEPRECATED** -> `OnNewFileV2` |
| `OnNewFiles` | When a file is created (properties only) | **DEPRECATED** -> `OnNewFilesV2` |
| `OnUpdatedFile` | When a file is modified | **DEPRECATED** -> `OnUpdatedFileV2` |
| `OnUpdatedFiles` | When a file is modified (properties only) | **DEPRECATED** -> `OnUpdatedFilesV2` |

### Actions

| operationId | Display Name | Status |
|-------------|-------------|--------|
| `ConvertFile` | Convert file | Current |
| `ConvertFileByPath` | Convert file using path | Current |
| `CopyDriveFile` | Copy file | Current |
| `CopyDriveFileByPath` | Copy file using path | Current |
| `CreateFile` | Create file | Current |
| `CreateShareLinkV2` | Create share link | Current |
| `CreateShareLinkByPathV2` | Create share link by path | Current |
| `DeleteFile` | Delete file | Current |
| `ExtractFolderV2` | Extract archive to folder | Current |
| `FindFiles` | Find files in folder | Current |
| `FindFilesByPath` | Find files in folder by path | Current |
| `GetFileContent` | Get file content | Current |
| `GetFileContentByPath` | Get file content using path | Current |
| `GetFileMetadata` | Get file metadata | Current |
| `GetFileMetadataByPath` | Get file metadata using path | Current |
| `GetFileThumbnail` | Get file thumbnail | Current |
| `ListFolderV2` | List files in folder | Current |
| `ListRootFolder` | List files in root folder | Current |
| `MoveFile` | Move or rename a file | Current |
| `MoveFileByPath` | Move or rename a file using path | Current |
| `UpdateFile` | Update file | Current |
| `CopyFile` | Upload file from URL | Current |
| `CreateShareLink` | Create share link | **DEPRECATED** -> `CreateShareLinkV2` |
| `CreateShareLinkByPath` | Create share link by path | **DEPRECATED** -> `CreateShareLinkByPathV2` |
| `ListFolder` | List files in folder | **DEPRECATED** -> `ListFolderV2` |

---

## Sources

- [OneDrive for Business Connector Reference (Microsoft Learn)](https://learn.microsoft.com/en-us/connectors/onedriveforbusiness/)
- [OneDrive API Permission Scopes (Microsoft Learn)](https://learn.microsoft.com/en-us/onedrive/developer/rest-api/concepts/permissions_reference?view=odsp-graph-online)
- [Use connectors in Copilot Studio agents (Microsoft Learn)](https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-connectors)
- [Microsoft Graph Permissions Reference](https://learn.microsoft.com/en-us/graph/permissions-overview)
