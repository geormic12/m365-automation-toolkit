# MCP Server Tools Reference — Agent 365

Complete tool-level reference for all Microsoft Agent 365 MCP servers available in Copilot Studio. Sourced from [Microsoft Learn Agent 365 docs](https://learn.microsoft.com/en-us/microsoft-agent-365/tooling-servers-overview) (March 2026).

**Note:** Agent 365 MCP servers require the [Frontier preview program](https://adoption.microsoft.com/copilot/frontier-program/) for early access.

---

## Microsoft Outlook Mail MCP Server

**Server ID:** `mcp_MailTools`
**Scope:** Email composition, management, and search
**Tools:** 10

| Tool | Description |
|------|-------------|
| `createMessage` | Create a draft email. Supports HTML (`body.contentType = "HTML"`) and plain text. |
| `sendMail` | Send an email as the signed-in user. Supports To, CC, BCC, HTML/text body. |
| `sendDraft` | Send an existing draft message by ID. |
| `getMessage` | Get a message by ID. Use `preferHtml` for HTML body format. |
| `searchMessages` | Search Outlook messages using KQL-style queries via Microsoft Graph Search API. |
| `listSent` | List messages in sent items. Supports OData filter, search, orderby, top, select. |
| `reply` | Reply to a message. Supports HTML via `preferHtml`. |
| `replyAll` | Reply-all to a message. Supports HTML via `preferHtml`. |
| `updateMessage` | Update mutable properties (subject, body, categories, importance). ETag concurrency. |
| `deleteMessage` | Delete a message from the signed-in user's mailbox. |

**Key capabilities:** KQL search across subject/body/attachments, HTML email composition, draft management, OData query support.

---

## Microsoft Outlook Calendar MCP Server

**Server ID:** `mcp_CalendarTools`
**Scope:** Calendar events, scheduling, and availability
**Tools:** 11

| Tool | Description |
|------|-------------|
| `createEvent` | Create a calendar event. Supports recurring events, online meetings (Teams/Skype), attendees. |
| `getEvent` | Get a single event by ID with OData select/expand. |
| `listEvents` | List events from a user's calendar with date range, filter, orderby. |
| `listCalendarView` | Get calendar occurrences within a time range (expands recurring events). |
| `updateEvent` | Update event properties (subject, body, start/end, location, attendees, recurrence). |
| `deleteEvent` | Delete an event from a user's calendar. |
| `acceptEvent` | Accept an event invitation with optional comment. |
| `declineEvent` | Decline an event invitation with optional comment. |
| `cancelEvent` | Cancel an event and notify attendees. |
| `findMeetingTimes` | Suggest meeting times based on organizer and attendee availability. |
| `getSchedule` | Get free/busy schedule for users, distribution lists, or resources. |

**Key capabilities:** Teams meeting link generation (`isOnlineMeeting=true`), recurring event patterns, attendee role management, time zone handling, idempotent creation via `transactionId`.

---

## Microsoft Teams MCP Server

**Server ID:** `mcp_TeamsServer`
**Scope:** `McpServers.Teams.All` — chats, channels, teams, messages
**Tools:** 25

### Chat Tools (12)

| Tool | Description |
|------|-------------|
| `createChat` | Create a new chat (`oneOnOne` or `group`). |
| `getChat` | Get chat metadata by ID. |
| `updateChat` | Update chat properties (e.g., topic for group chats). |
| `deleteChat` | Soft-delete a chat. |
| `listChats` | List chats for the caller with OData query support. |
| `postMessage` | Post a plain-text message in a chat. |
| `getChatMessage` | Get a chat message by ID. |
| `listChatMessages` | List messages in a chat with pagination. |
| `updateChatMessage` | Update a chat message with new content. |
| `deleteChatMessage` | Soft-delete a chat message. |
| `addChatMember` | Add a member to a chat. |
| `listChatMembers` | List chat participants and roles. |

### Channel & Team Tools (13)

| Tool | Description |
|------|-------------|
| `getTeam` | Get team properties. |
| `listTeams` | List joined teams for a user. |
| `createChannel` | Create a channel (standard, private, or shared). |
| `createPrivateChannel` | Create a private channel with required members. |
| `getChannel` | Get channel details. |
| `updateChannel` | Update channel displayName or description. |
| `listChannels` | List all channels in a team. |
| `postChannelMessage` | Post a plain-text message to a channel. |
| `listChannelMessages` | List messages in a channel with pagination. |
| `replyToChannelMessage` | Reply to a channel message thread. |
| `addChannelMember` | Add a member to a private/shared channel. |
| `updateChannelMember` | Update a member's role in a channel. |
| `listChannelMembers` | List all members of a channel. |

**Key capabilities:** Full CRUD for chats and channels, message threading, private/shared channel support, member role management (owner/member/guest), OData filtering and pagination.

---

## Microsoft SharePoint and OneDrive MCP Server

**Server ID:** `mcp_ODSPRemoteServer`
**Scope:** Files, folders, sites, document libraries, sharing
**Tools:** 17

| Tool | Description |
|------|-------------|
| `createFolder` | Create a folder in a document library. Auto-resolves name conflicts with numeric suffix. |
| `createSmallTextFile` | Create/upload a text file (<5 MB) to a document library. |
| `readSmallTextFile` | Read/download a text file from a document library. |
| `renameFileOrFolder` | Rename a file or folder. |
| `moveSmallFile` | Move a file (<5 MB) within the same site. |
| `deleteFileOrFolder` | Delete a file or folder. |
| `getFileOrFolderMetadata` | Get metadata by DriveItem ID. |
| `getFileOrFolderMetadataByUrl` | Get metadata from a sharing URL (requires explicit access). |
| `getFolderChildren` | List top 20 files/folders in a parent folder. |
| `findFileOrFolder` | Search for a file or folder by name query. |
| `findSite` | Find SharePoint sites by search query, or top 20 accessible sites. |
| `listDocumentLibrariesInSite` | List document libraries (drives) in a SharePoint site. |
| `getDefaultDocumentLibraryInSite` | Get the default document library for a site. |
| `shareFileOrFolder` | Share via invitation with role assignment (read/write). |
| `setSensitivityLabelOnFile` | Set/remove sensitivity labels for compliance. |
| `Echo` | Diagnostic tool — echoes message back. |

**Key capabilities:** OneDrive and SharePoint unified access, sensitivity label management, sharing with role-based permissions, site and library discovery, DriveItem abstraction.

**Limitations:** File moves limited to <5 MB within same site. Folder children capped at 20 items per call. Use `"me"` as `documentLibraryId` for the user's OneDrive.

---

## Microsoft Word MCP Server

**Server ID:** `mcp_WordServer`
**Scope:** Word document creation, reading, and commenting
**Tools:** 4

| Tool | Description |
|------|-------------|
| `WordCreateNewDocument` | Create a new Word doc in OneDrive root. Accepts HTML or plain text content. Auto-names if fileName is empty (`Document_yyyyMMdd_HHmms.docx`). |
| `WordGetDocumentContent` | Fetch document content by SharePoint/OneDrive URL. Returns filename, size, plain text, and all comments. |
| `WordCreateNewComment` | Add a comment to a Word document (requires driveId + documentId). |
| `WordReplyToComment` | Reply to an existing comment thread. |

**Key capabilities:** HTML content support for rich formatting, comment thread management, document metadata retrieval.

---

## Microsoft 365 User Profile MCP Server

**Server ID:** `mcp_MeServer`
**Scope:** User profiles, org hierarchy, people search
**Tools:** 6

| Tool | Description |
|------|-------------|
| `getMyProfile` | Get the signed-in user's profile. |
| `getMyManager` | Get the signed-in user's manager. |
| `getUserProfile` | Get any user's profile by object ID or UPN. |
| `getUsersManager` | Get any user's manager by object ID or UPN. |
| `getDirectReports` | List a user's direct reports. |
| `listUsers` | Search/list users in the org. Supports $search, $filter, $orderby, $top. Auto-fallback from $search to $filter. |

**Key capabilities:** Org hierarchy navigation (manager → direct reports), free-text people search with automatic fallback, OData query support.

**Important:** Never use `'me'` as `userIdentifier` — use the dedicated `getMyProfile`/`getMyManager` tools instead. Look up users by display name with `listUsers` first to get their UPN.

---

## Microsoft 365 Copilot Search MCP Server

**Server ID:** `mcp_M365Copilot`
**Scope:** Cross-Microsoft-365 content search grounded by Copilot
**Tools:** 1

| Tool | Description |
|------|-------------|
| `Copilot Chat` | Search across the entire M365 ecosystem — SharePoint, OneDrive, email, Teams chats, and all connected content. Supports multi-turn conversations via `conversationId` and file grounding via `fileUris`. |

**Key capabilities:** Universal M365 search, multi-turn conversation context, file-grounded responses.

**When to use:** Fallback when no workload-specific tool exists. If the user's request could be answered by org content, use this tool.

---

## Microsoft Dataverse MCP Server

**Server ID:** (varies by environment)
**Scope:** Dataverse tables, records, queries
**Tools:** 11

| Tool | Description |
|------|-------------|
| `list_tables` | List all tables in the Dataverse environment. |
| `describe_table` | Get the T-SQL schema for a table (fields, types, relationships). |
| `read_query` | Execute SELECT statements against Dataverse data. |
| `search` | Keyword search across Dataverse records and entities. |
| `fetch` | Get complete record details by table name and record ID. |
| `create_record` | Insert a new record. Returns the GUID of the created row. |
| `update_record` | Update fields on an existing record by GUID. |
| `delete_record` | Delete a record by GUID. |
| `create_table` | Create a new table with defined schema (columns, types, relationships). |
| `update_table` | Modify table schema (add columns, rename fields, update constraints). |
| `delete_table` | Permanently remove a table and its data. Requires admin permissions. |

**Setup:** Requires TDS (Tabular Data Stream) endpoint enabled. Admin must configure MCP Client Allow List.

---

## Additional Microsoft MCP Servers (Listed in Docs, Not Yet Detailed)

These servers appear in the [built-in catalog](https://learn.microsoft.com/en-us/microsoft-copilot-studio/mcp-microsoft-mcp-servers) but don't have published tool reference pages yet:

| Server | Purpose |
|--------|---------|
| **Microsoft SharePoint Lists MCP** | SharePoint list operations (create, read, update list items) |
| **Microsoft 365 Admin Center MCP** | Admin center management operations |
| **Fabric MCP** | Microsoft Fabric data analytics |

---

# Connector-Wrapped MCP Servers

These MCP servers are built on top of Power Platform connectors (e.g., Office 365 Outlook, SharePoint, Teams). They expose connector operations as MCP tools. Unlike the Agent 365 servers above (which use generic Streamable HTTP pass-through), these have **predefined tool sets** with named operations.

**Source:** Extracted via the Power Platform `listtools` API from Copilot Studio (March 2026).

**API endpoint:** `POST /powervirtualagents/bots/{botId}/modelcontextprotocol/listtools?api-version=2022-03-01-preview`

---

## Email Management MCP Server

**Connector:** Office 365 Outlook
**Schema:** `Office365Outlook-EmailManagementMCPServer`
**Tools:** 6

| Tool | Description | Required Params | Optional Params |
|------|-------------|-----------------|-----------------|
| `SendEmail` | Send an email message | To, Subject, Body | Cc, Bcc |
| `ReplyToEmail` | Reply to an email message | messageId, Body | ReplyAll, Cc, To, Bcc, Subject |
| `GetEmail` | Gets an email message | messageId | includeAttachments |
| `ListEmails` | Lists email messages | *(none)* | includeAttachments, folderPath, subjectFilter, to, top (max 1000), from |
| `FlagEmail` | Flag an email message | messageId | flagStatus (flagged/notFlagged/complete) |
| `ForwardEmail` | Forward an email message | message_id, ToRecipients | *(none)* |

---

## Contact Management MCP Server

**Connector:** Office 365 Outlook
**Schema:** `Office365Outlook-ContactManagementMCPServer`
**Tools:** 5

| Tool | Description | Required Params | Optional Params |
|------|-------------|-----------------|-----------------|
| `GetContactFolders` | Get contact folders | *(none)* | *(none)* |
| `GetContact` | Get a contact | id, folder | *(none)* |
| `CreateContact` | Create a contact in a contacts folder | homePhones, folder, givenName | *(none)* |
| `UpdateContact` | Update a contact in a contacts folder | id, homePhones, folder, givenName | *(none)* |
| `ListContactsFromFolder` | Lists contacts from a contacts folder | folder | $top |

---

## Meeting Management MCP Server

**Connector:** Office 365 Outlook
**Schema:** `Office365Outlook-MeetingManagementMCPServer`
**Tools:** 9

| Tool | Description | Required Params | Optional Params |
|------|-------------|-----------------|-----------------|
| `GetCalendars` | Gets calendars for user | *(none)* | top |
| `GetCalendarViewOfMeetings` | Get calendar view of meetings in a calendar | startDateTimeUtc, calendarId, endDateTimeUtc | $top, search |
| `GetMeetings` | Get meetings in a calendar | table (calendarId) | $top |
| `GetRooms` | Get meeting rooms with names and addresses | *(none)* | *(none)* |
| `AcceptAMeetingInvite` | Accept a meeting invite | event_id | *(none)* |
| `DeclineAMeetingInvite` | Decline a meeting invite | event_id | *(none)* |
| `TentativelyAcceptAMeetingInvite` | Tentatively accept a meeting invite | event_id | *(none)* |
| `UpdateMeeting` | Update a meeting in a calendar | end, timeZone, id, table, start, subject | optionalAttendees, body, location, requiredAttendees |
| `CreateMeeting` | Create a meeting in a calendar | end, timeZone, table, start, subject | optionalAttendees, body, location, requiredAttendees |

**Note:** `timeZone` is an enum with 130+ timezone values. `table` refers to Calendar ID — use `GetCalendars` to discover IDs.

---

## Microsoft Learn Docs MCP Server

**Connector:** Microsoft Learn Docs MCP (standalone)
**Schema:** `MicrosoftLearnDocsMCP-MicrosoftLearnDocsMCPServer`
**Tools:** 3

| Tool | Description | Required Params | Optional Params |
|------|-------------|-----------------|-----------------|
| `microsoft_docs_search` | Search official Microsoft/Azure documentation. Returns up to 10 content chunks (max 500 tokens each) with title, URL, and excerpt. | *(none — query is auto)* | query |
| `microsoft_code_sample_search` | Search for code snippets in Microsoft Learn docs. Returns code samples with best practices. | query | language (csharp, javascript, typescript, python, powershell, azurecli, al, sql, java, kusto, cpp, go, rust, ruby, php) |
| `microsoft_docs_fetch` | Fetch and convert a Microsoft Learn doc page to markdown. Full content with headings, code blocks, tables, links. | url | *(none)* |

**Note:** This is a true pass-through MCP server (not connector-wrapped). Use `microsoft_docs_search` first, then `microsoft_docs_fetch` for complete content on high-value pages.

---

## Sources

- [Agent 365 Tooling Servers Overview](https://learn.microsoft.com/en-us/microsoft-agent-365/tooling-servers-overview)
- [Built-in MCP Servers Catalog](https://learn.microsoft.com/en-us/microsoft-copilot-studio/mcp-microsoft-mcp-servers)
- [Outlook Mail Reference](https://learn.microsoft.com/en-us/microsoft-agent-365/mcp-server-reference/mail)
- [Outlook Calendar Reference](https://learn.microsoft.com/en-us/microsoft-agent-365/mcp-server-reference/calendar)
- [Teams Reference](https://learn.microsoft.com/en-us/microsoft-agent-365/mcp-server-reference/teams)
- [SharePoint & OneDrive Reference](https://learn.microsoft.com/en-us/microsoft-agent-365/mcp-server-reference/odspremoteserver)
- [Word Reference](https://learn.microsoft.com/en-us/microsoft-agent-365/mcp-server-reference/word)
- [User Profile Reference](https://learn.microsoft.com/en-us/microsoft-agent-365/mcp-server-reference/me)
- [Copilot Search Reference](https://learn.microsoft.com/en-us/microsoft-agent-365/mcp-server-reference/searchtools)
- [Dataverse Reference](https://learn.microsoft.com/en-us/microsoft-agent-365/mcp-server-reference/dataverse)
