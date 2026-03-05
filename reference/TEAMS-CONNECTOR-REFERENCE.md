# Microsoft Teams Connector Reference for Power Automate / Copilot Studio

> **Source:** https://learn.microsoft.com/en-us/connectors/teams/
> **Publisher:** Microsoft
> **Connector class:** Standard
> **Available in:** Power Automate, Copilot Studio, Power Apps, Logic Apps
> **Last researched:** 2026-03-05

---

## Table of Contents

1. [Authentication & Connection Types](#authentication--connection-types)
2. [Throttling Limits](#throttling-limits)
3. [Message Size Limits](#message-size-limits)
4. [General Known Issues](#general-known-issues)
5. [Triggers (13 total)](#triggers)
6. [Actions — Non-Deprecated (33 total)](#actions--non-deprecated)
7. [Actions — Deprecated (44 total)](#actions--deprecated)
8. [Microsoft Graph Permissions (Teams-Related)](#microsoft-graph-permissions-teams-related)
9. [Delegated vs Application Permissions](#delegated-vs-application-permissions)

---

## Authentication & Connection Types

| Auth Type | Auth ID | Applicable Regions | Shareable |
|-----------|---------|-------------------|-----------|
| Default | (default) | All regions **except** Azure Government | No |
| Microsoft Teams Credentials (Teams Public/Teams GCC) | `oauthPublic` | Azure Government only | No |
| Microsoft Teams Credentials (Teams GCC High) | `oauthGccHigh` | Azure Government only | No |

**Key points:**
- Connections are **never shareable** — if a Power App is shared with another user, they are prompted to create their own connection
- The connector uses **delegated permissions** (acts on behalf of the signed-in user)
- The "Flow Bot" poster option is only available in commercial tenants (not GCC/GCCH/DoD)

---

## Throttling Limits

### Standard API Throttling

| Metric | Limit | Renewal Period |
|--------|-------|----------------|
| API calls per connection | 100 | 60 seconds |
| Trigger poll frequency | 1 | 600 seconds (10 min) |
| Non-Get requests (List chats, Post feed notification, Post Adaptive Card as Flow bot, other Flow bot operations) | 25 | 300 seconds (5 min) |
| Non-Get requests (all other operations) | 300 | 300 seconds (5 min) |

### Webhook Trigger Throttling ("When a Teams webhook request is received")

Determined by your Power Automate performance profile.

| Metric | Low Profile | All Other Profiles |
|--------|-------------|-------------------|
| Concurrent inbound calls | ~1,000 | ~1,000 |
| Read calls per 5 minutes | 6,000 | 60,000 |
| Invoke calls per 5 minutes | 4,500 | 45,000 |

---

## Message Size Limits

- **Hard limit: ~28 KB** per message or adaptive card
- Includes ALL HTML elements: text, images, links, tables, mentions, adaptive card JSON
- Exceeding the limit produces error: `Request Entity too large`
- Applies to: PostMessageToConversation, PostCardToConversation, PostCardAndWaitForResponse, ReplyWithMessageToConversation, ReplyWithCardToConversation, UpdateCardInConversation
- **@mention limit:** A single message can @mention up to **20 users** and **20 tags**

---

## General Known Issues

| Issue | Details |
|-------|---------|
| Private channels not supported | Posting a message or adaptive card to a **private channel** is not currently supported |
| Subscription required | Must have an enabled Teams subscription |
| Power Virtual Agents bot installation | Posting via PVA requires the recipient to have the bot installed in Teams |
| Workflow app required | Most posting actions require the Workflows (formerly Power Automate) app to be set to "allow" in Teams admin center |
| Flow Bot not in GCC | Flow Bot poster option is commercial tenants only; GCC/GCCH/DoD get error `BotNotInConversationRoster` — use "User" poster instead |
| Shared channels | For shared channels, the team ID must refer to the **host team** (the team that owns the shared channel) |

---

## Triggers

### 1. For a selected message (V2)

| Property | Value |
|----------|-------|
| **operationId** | `OnMessageSelectedV2` |
| **Description** | Start a flow for a selected message in Teams |
| **Deprecated** | No |
| **Platform** | Power Automate only |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| operationId | `operationId` | Yes | string | The operation identifier |
| host | `host` | No | object | Host configuration |
| parameters | `parameters` | Yes | object | Parameters for trigger configuration |
| schema | `schema` | No | object | Schema definition |

**Returns:** `body` (object) — selected message details

**Limitations:**
- Default environment only
- Does not work for guest or external users
- Requires Power Automate Actions app (App ID: `00001016-de05-492e-9106-4828fc8a8687`) unblocked in Teams admin center
- Not supported in sovereign clouds (GCC, GCCH, DoD)

---

### 2. From the compose box (V2)

| Property | Value |
|----------|-------|
| **operationId** | `OnComposeMessageV2` |
| **Description** | Start a flow from the compose message box in Teams |
| **Deprecated** | No |
| **Platform** | Power Automate only |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| operationId | `operationId` | Yes | string | Operation identifier |
| host | `host` | No | object | Host configuration |
| parameters | `parameters` | Yes | object | Parameters |
| schema | `schema` | No | object | Schema definition |

**Returns:** `body` (object)

**Limitations:**
- Default environment only
- Not supported in sovereign clouds (GCC, GCCH, DoD)

---

### 3. When a new channel message is added

| Property | Value |
|----------|-------|
| **operationId** | `OnNewChannelMessage` |
| **Description** | Triggers when a new message is posted to a channel (root messages only, NOT replies) |
| **Deprecated** | No |
| **Polling interval** | 3 minutes |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Team | `groupId` | Yes | string | Select team |
| Channel | `channelId` | Yes | string | Channel ID |

**Returns:** `OnNewChannelMessage_Response`

| Field | Path | Type | Description |
|-------|------|------|-------------|
| Attachments | `attachments` | array of object | Message attachments |
| Content | `body.content` | string | Message content |
| Content Type | `body.contentType` | string | `text` or `html` |
| Creation Timestamp | `createdDateTime` | date-time | When the message was created |
| Deleted | `deleted` | boolean | Whether message is deleted |
| ETag | `etag` | string | Version number |
| Application | `from.application` | object | Sending application |
| Device | `from.device` | string | Sending device |
| Display Name | `from.user.displayName` | string | Sender display name |
| User ID | `from.user.id` | string | Sender user ID |
| Identity Provider | `from.user.identityProvider` | string | Identity provider |
| Message ID | `id` | string | Unique message ID |
| Importance | `importance` | string | `normal`, `high`, or `urgent` |
| Last Modified | `lastModifiedDateTime` | string | Last modified timestamp |
| Locale | `locale` | string | Message locale |
| Mentions | `mentions` | array of object | Entities mentioned (user, bot, team, channel) |
| Message Type | `messageType` | string | Type of chat message |
| Reactions | `reactions` | array of object | Reactions (e.g., Like) |
| Reply To ID | `replyToId` | string | Parent message ID |
| Subject | `subject` | string | Message subject (optional) |
| Summary | `summary` | string | Summary text |

**Limitations:**
- Only fires for **root messages**, not replies
- 3-minute polling interval
- For shared channels, team ID must refer to host team

---

### 4. When a new chat message is added

| Property | Value |
|----------|-------|
| **operationId** | `WebhookChatMessageTrigger` |
| **Description** | Triggers when a new message is posted in any chat the user is part of |
| **Deprecated** | No |

**Parameters:** None — automatically fires for all chats the user participates in

**Returns:** `ChatMessageWebhookResponseSchema`

| Field | Path | Type | Description |
|-------|------|------|-------------|
| Message | `value` | array of object | Message details |
| Conversation ID | `value.conversationId` | string | Chat unique identifier |
| ID | `value.messageId` | string | Message ID |
| Link | `value.linkToMessage` | string | Link to the message |

**Limitations:**
- Supports only **one user per flow**
- Default environment only
- Does not work for guest or external users

---

### 5. When a new message is added to a chat or channel

| Property | Value |
|----------|-------|
| **operationId** | `WebhookNewMessageTrigger` |
| **Description** | Triggers when a new message is posted in a specified chat or channel (not on edits) |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Message type | `threadType` | Yes | string | Choose message type (chat or channel) |
| requestBody | `requestBody` | No | dynamic | Webhook request body |

**Returns:** Dynamic outputs

---

### 6. When a new team member is added

| Property | Value |
|----------|-------|
| **operationId** | `OnGroupMembershipAdd` |
| **Description** | Triggers when a member is added to the given team |
| **Deprecated** | No |
| **Polling interval** | 5 minutes |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Team | `groupId` | Yes | string | Select team |

**Returns:** User ID

**Limitations:**
- 5-minute polling interval (may fire multiple times for same event)
- Does not work on unified groups with hidden members

---

### 7. When a new team member is removed

| Property | Value |
|----------|-------|
| **operationId** | `OnGroupMembershipRemoval` |
| **Description** | Triggers when a member is removed from the specified team |
| **Deprecated** | No |
| **Polling interval** | 5 minutes |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Team | `groupId` | Yes | string | Select team |

**Returns:** User ID

**Limitations:**
- 5-minute polling interval (may fire multiple times for same event)
- Does not work on unified groups with hidden members

---

### 8. When I'm @mentioned

| Property | Value |
|----------|-------|
| **operationId** | `WebhookAtMentionTrigger` |
| **Description** | Triggers when a new message @mentions the current user in a chat or channel |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Message type | `threadType` | Yes | string | Choose message type |
| requestBody | `requestBody` | No | dynamic | Webhook request body |

**Returns:** Dynamic outputs

---

### 9. When I am mentioned in a channel message

| Property | Value |
|----------|-------|
| **operationId** | `OnNewChannelMessageMentioningMe` |
| **Description** | Triggers when a new message @mentions the current user in a channel |
| **Deprecated** | No |
| **Polling interval** | 3 minutes |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Team | `groupId` | Yes | string | Select team |
| Channel | `channelId` | Yes | string | Channel ID |

**Returns:** Message details including mentions (same schema as OnNewChannelMessage_Response)

---

### 10. When keywords are mentioned

| Property | Value |
|----------|-------|
| **operationId** | `WebhookKeywordTrigger` |
| **Description** | Triggers when a keyword is mentioned in a specified chat or channel (not on edits) |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Message type | `threadType` | Yes | string | Choose message type (chat or channel) |
| Keywords to search for | `$search` | Yes | string | Comma-separated list of keywords |
| requestBody | `requestBody` | No | dynamic | Webhook request body |

**Returns:** Dynamic outputs

**CRITICAL Limitations:**
- **Only supports single words** — phrases longer than one word will NOT trigger
- Fires for all message-related data including sender and timestamp
- Does NOT trigger on message edits

---

### 11. When someone reacted to a message in chat

| Property | Value |
|----------|-------|
| **operationId** | `WebhookMessageReactionTrigger` |
| **Description** | Triggers when someone reacts to a message in a specified chat or channel |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Emoji to Track | `reactionKey` | Yes | string | Choose emoji to monitor |
| Trigger Frequency | `frequency` | Yes | string | Every reaction or first reaction only |
| Who can trigger? | `runningPolicy` | Yes | string | Specify who can trigger this workflow |
| Message type | `threadType` | Yes | string | Choose message type |
| requestBody | `requestBody` | No | dynamic | Webhook request body |

**Returns:** `MessageReactionWebhookResponseSchema`

| Field | Path | Type | Description |
|-------|------|------|-------------|
| Thread Type | `threadType` | string | chat or channel |
| Chat ID | `chatId` | string | Chat unique identifier |
| Team ID | `teamId` | string | Team unique identifier |
| Channel ID | `channelId` | string | Channel unique identifier |
| Message ID | `messageId` | string | ID of the reacted message |
| Reply To ID | `replyToId` | string | Parent message ID |
| Message Link | `messageLink` | string | Link to the reacted message |
| User ID | `userId` | string | Reacting user's ID |
| Message Reaction | `messageReaction` | string | The reaction emoji used |

---

### 12. When someone responds to an adaptive card

| Property | Value |
|----------|-------|
| **operationId** | `TeamsCardTrigger` |
| **Description** | Handle responses for an adaptive card posted in Teams |
| **Deprecated** | No |
| **Platform** | Power Automate only |

**Parameters:** None

**Returns:** Dynamic outputs (based on adaptive card response schema)

**Limitations:**
- Default environment only
- Does not work for guest or external users
- **Cannot be combined** with "Post adaptive card in a chat or channel" action in trigger+listener workflows — use "Post adaptive card and wait for a response" instead
- Not supported in sovereign clouds (GCC, GCCH, DoD)

---

### 13. When a Teams webhook request is received

| Property | Value |
|----------|-------|
| **operationId** | `TeamsIncomingWebhookTrigger` |
| **Description** | Start a flow by making a POST request to the exposed endpoint |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Authentication type | `triggerAuthenticationType` | Yes | string | Anyone, Any user in tenant, or Specific users in tenant |
| Allowed users | `triggerAllowedUsers` | No | array | List of allowed users (only for "Specific users" auth type) |

**Authentication rules:**
- "Anyone" — do NOT pass authentication token header, or POST requests will fail
- "Any user in my tenant" or "Specific users" — MUST pass OAuth authentication token header

**Request body format for adaptive cards:**
```json
{
  "type": "message",
  "attachments": [
    {
      "contentType": "application/vnd.microsoft.card.adaptive",
      "contentUrl": null,
      "content": {
        "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
        "type": "AdaptiveCard",
        "version": "1.2",
        "body": [
          {
            "type": "TextBlock",
            "text": "Your message here"
          }
        ]
      }
    }
  ]
}
```

**Returns:** `body` — identical to the request body sent to trigger

---

## Actions — Non-Deprecated

### Message Operations

#### PostMessageToConversation — Post message in a chat or channel

| Property | Value |
|----------|-------|
| **operationId** | `PostMessageToConversation` |
| **Description** | Posts a message to a chat or a channel |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Post as | `poster` | Yes | string | "User" or "Flow bot" |
| Post in | `location` | Yes | string | "Chat" or "Channel" |
| Post message request | `body` | Yes | dynamic | Message content and targeting info |

The `body` parameter is dynamic and changes based on `poster` and `location` selections:
- **When Post in = Channel:** body includes Team, Channel, and Message fields
- **When Post in = Chat:** body includes Chat/Group Chat and Message fields
- Message content supports HTML formatting

**Returns:** `PostToConversationResponse`

| Field | Path | Type | Description |
|-------|------|------|-------------|
| Message ID | `id` | string | Unique message identifier |

**Known Issues:**
- 28 KB message size limit (includes all HTML elements)
- Flow Bot not supported in GCC/GCCH/DoD
- Requires Workflows app in "allow" state in Teams admin center
- Private channels not supported
- Up to 20 @mentions for users and 20 for tags per message

---

#### GetMessagesFromChannel — Get messages

| Property | Value |
|----------|-------|
| **operationId** | `GetMessagesFromChannel` |
| **Description** | Gets messages from a channel in a specific team |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Team | `groupId` | Yes | string | Select team |
| Channel | `channelId` | Yes | string | Channel ID |

No optional parameters. No OData filter/orderBy support.

**Returns:**

| Field | Path | Type | Description |
|-------|------|------|-------------|
| @odata.context | `@odata.context` | string | OData context URL |
| @odata.count | `@odata.count` | integer | Count of results |
| @odata.nextLink | `@odata.nextLink` | string | Pagination link |
| Message List | `value` | array | Array of `OnNewChannelMessage_Response` objects |

Each message in `value` array:

| Field | Path | Type | Description |
|-------|------|------|-------------|
| Attachments | `attachments` | array of object | Message attachments |
| Content | `body.content` | string | Message content |
| Content Type | `body.contentType` | string | `text` or `html` |
| Creation Timestamp | `createdDateTime` | date-time | Creation time |
| Deleted | `deleted` | boolean | Deleted flag |
| ETag | `etag` | string | Version number |
| Application | `from.application` | object | Sending application |
| Device | `from.device` | string | Sending device |
| Display Name | `from.user.displayName` | string | Sender name |
| User ID | `from.user.id` | string | Sender user ID |
| Identity Provider | `from.user.identityProvider` | string | Identity provider |
| Message ID | `id` | string | Unique message ID |
| Importance | `importance` | string | `normal`, `high`, or `urgent` |
| Last Modified | `lastModifiedDateTime` | string | Last modified time |
| Locale | `locale` | string | Message locale |
| Mentions | `mentions` | array of object | Mentioned entities |
| Message Type | `messageType` | string | Chat message type |
| Reactions | `reactions` | array of object | Reactions |
| Reply To ID | `replyToId` | string | Parent message ID |
| Subject | `subject` | string | Message subject |
| Summary | `summary` | string | Summary text |

**Notes:**
- For shared channels, team ID must be the host team
- Returns OData-compliant collection with pagination support

---

#### GetMessageDetails — Get message details

| Property | Value |
|----------|-------|
| **operationId** | `GetMessageDetails` |
| **Description** | Gets the details of a message in a chat or a channel |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Message | `messageId` | Yes | string | Message ID |
| Message type | `threadType` | Yes | string | `chat` or `channel` |
| Get message details request | `body` | Yes | dynamic | Request body with additional details |

**Returns:** Dynamic outputs (varies by message type)

---

#### ReplyWithMessageToConversation — Reply with a message in a channel

| Property | Value |
|----------|-------|
| **operationId** | `ReplyWithMessageToConversation` |
| **Description** | Replies with a message to a channel's message |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Post as | `poster` | Yes | string | "User" or "Flow bot" |
| Post in | `location` | Yes | string | Select option |
| Reply message request | `body` | Yes | dynamic | Reply content and targeting |

**Returns:** `PostToConversationResponse` (Message ID)

**Known Issues:** Same as PostMessageToConversation (28 KB limit, Flow Bot GCC restriction, Workflow app required)

---

#### ListRepliesToMessage — List replies of a channel message

| Property | Value |
|----------|-------|
| **operationId** | `ListRepliesToMessage` |
| **Description** | List replies to a message in a channel in a specific team |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Team | `groupId` | Yes | string | Select team |
| Channel | `channelId` | Yes | string | Channel ID |
| Message | `messageId` | Yes | string | Message ID |
| Latest replies count | `$top` | No | integer | Number of replies to return (1-50, default 20) |

**Returns:** `ListRepliesResponseSchema`

| Field | Path | Type | Description |
|-------|------|------|-------------|
| List of replies | `value` | array of object | Reply list |
| ID | `value.id` | string | Reply ID |
| Reply To ID | `value.replyToId` | string | Parent message ID |
| ETag | `value.etag` | string | ETag |
| Message Type | `value.messageType` | string | Message type |
| Created DateTime | `value.createdDateTime` | string | Creation time |
| Last Modified DateTime | `value.lastModifiedDateTime` | string | Last modified |
| Last Edited DateTime | `value.lastEditedDateTime` | string | Last edited |
| Deleted DateTime | `value.deletedDateTime` | string | Deletion time |
| Subject | `value.subject` | string | Subject |
| Summary | `value.summary` | string | Summary |
| Chat ID | `value.chatId` | string | Chat ID |
| Importance | `value.importance` | string | Importance |
| Locale | `value.locale` | string | Locale |
| Web URL | `value.webUrl` | string | Web URL |
| Policy Violation | `value.policyViolation` | object | Policy violation details |
| Event Detail | `value.eventDetail` | object | Event details |
| Application | `value.from.application` | object | Sending application |
| Device | `value.from.device` | object | Sending device |
| User ID | `value.from.user.id` | string | Sender user ID |
| Display Name | `value.from.user.displayName` | string | Sender name |
| User Identity Type | `value.from.user.userIdentityType` | string | Identity type |
| Tenant ID | `value.from.user.tenantId` | string | Tenant ID |
| Content Type | `value.body.contentType` | string | Content type |
| Content | `value.body.content` | string | Reply content |
| Team ID | `value.channelIdentity.teamId` | string | Team ID |
| Channel ID | `value.channelIdentity.channelId` | string | Channel ID |
| Attachments | `value.attachments` | array of object | Attachments |
| Mentions | `value.mentions` | array of object | Mentions |
| Reactions | `value.reactions` | array of object | Reactions |
| Message History | `value.messageHistory` | array of object | Edit history |

---

### Adaptive Card Operations

#### PostCardAndWaitForResponse — Post adaptive card and wait for a response

| Property | Value |
|----------|-------|
| **operationId** | `PostCardAndWaitForResponse` |
| **Description** | Posts an adaptive card to a chat or channel and waits for a response from any user (pauses the flow) |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Post as | `poster` | Yes | string | "User" or "Flow bot" |
| Post in | `location` | Yes | string | "Chat" or "Channel" |
| Flow continuation subscription request | `body` | Yes | dynamic | Adaptive card JSON, response config, update settings |

**Returns:** Dynamic outputs (based on the adaptive card's input fields and action definitions)

**Special throttling:** 25 requests per 300 seconds (when using Flow bot)

**Known Issues:**
- 28 KB message size limit
- Flow Bot not supported in GCC/GCCH/DoD
- Requires Workflows app
- **Cannot be combined** with "When someone responds to an adaptive card" trigger in trigger+listener workflows (returns "Something went wrong" error)
- Private channels not supported

---

#### PostCardToConversation — Post card in a chat or channel

| Property | Value |
|----------|-------|
| **operationId** | `PostCardToConversation` |
| **Description** | Posts a card to a chat or a channel (does NOT wait for response) |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Post as | `poster` | Yes | string | "User" or "Flow bot" |
| Post in | `location` | Yes | string | "Chat" or "Channel" |
| Post card request | `body` | Yes | dynamic | Card JSON and targeting |

**Returns:** `PostToConversationResponse` (Message ID)

**Card format:**
```json
{
  "contentType": "application/vnd.microsoft.card.adaptive",
  "content": {
    "type": "AdaptiveCard",
    "version": "1.2",
    "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
    "body": [...]
  }
}
```

**Known Issues:** Same as other posting actions (28 KB, GCC, Workflow app, private channels)

---

#### ReplyWithCardToConversation — Reply with an adaptive card in a channel

| Property | Value |
|----------|-------|
| **operationId** | `ReplyWithCardToConversation` |
| **Description** | Replies with an adaptive card to a channel's message |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Post as | `poster` | Yes | string | "User" or "Flow bot" |
| Post in | `location` | Yes | string | Select option |
| Reply adaptive card request | `body` | Yes | dynamic | Card JSON and reply targeting |

**Returns:** `PostToConversationResponse` (Message ID)

**Known Issues:** Same as other posting actions

---

#### UpdateCardInConversation — Update an adaptive card in a chat or channel

| Property | Value |
|----------|-------|
| **operationId** | `UpdateCardInConversation` |
| **Description** | Updates an existing adaptive card |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Post as | `poster` | Yes | string | "User" or "Flow bot" |
| Post in | `location` | Yes | string | Select option |
| Update adaptive card request | `body` | Yes | dynamic | Updated card JSON and message targeting |

**Returns:** Not explicitly documented

**Known Issues:** Same as other posting actions

---

### Team Management

#### CreateATeam — Create a team

| Property | Value |
|----------|-------|
| **operationId** | `CreateATeam` |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Team Name | `displayName` | Yes | string | Team name |
| Description | `description` | Yes | string | Team description |
| Visibility | `visibility` | No | string | Team visibility |

**Returns:** Team creation response

---

#### GetTeam — Get a team

| Property | Value |
|----------|-------|
| **operationId** | `GetTeam` |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Team | `groupId` | Yes | string | Select team |

**Returns:** Team ID, display name, description, internal ID, web URL, archived status, settings

---

#### GetAllTeams — List joined teams

| Property | Value |
|----------|-------|
| **operationId** | `GetAllTeams` |
| **Deprecated** | No |

**Parameters:** None

**Returns:** Array with description, name, ID for each team

---

#### GetAllAssociatedTeams — List associated teams

| Property | Value |
|----------|-------|
| **operationId** | `GetAllAssociatedTeams` |
| **Deprecated** | No |

**Parameters:** None

**Returns:** Array with ID, display name, tenant ID

---

#### AddMemberToTeam — Add a member to a team

| Property | Value |
|----------|-------|
| **operationId** | `AddMemberToTeam` |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Team | `groupId` | Yes | string | Select team |
| User | `memberId` | Yes | string | UPN or Microsoft Entra ID |
| Set user as team owner | `owner` | No | boolean | Make user an owner |

**Gotcha:** Can set guest users as team owners

---

### Channel Management

#### CreateChannel — Create a channel

| Property | Value |
|----------|-------|
| **operationId** | `CreateChannel` |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Team | `groupId` | Yes | string | Select team |
| Name | `displayName` | Yes | string | Channel name |
| Description | `description` | No | string | Channel description |

**Returns:** description, display name, ID

---

#### GetChannel — Get details for a specific channel in a team

| Property | Value |
|----------|-------|
| **operationId** | `GetChannel` |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Team | `groupId` | Yes | string | Select team |
| Channel ID | `channelId` | Yes | string | Channel ID |

**Returns:** Channel details

---

#### GetChannelsForGroup — List channels

| Property | Value |
|----------|-------|
| **operationId** | `GetChannelsForGroup` |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Team | `groupId` | Yes | string | Select team |
| Filter Query | `$filter` | No | string | OData filter |
| Order By | `$orderby` | No | string | OData orderBy |

**Returns:** Channel list

---

#### GetAllChannelsForTeam — List all channels

| Property | Value |
|----------|-------|
| **operationId** | `GetAllChannelsForTeam` |
| **Description** | Lists all channels including shared channels |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Team | `groupId` | Yes | string | Select team |
| Filter Query | `$filter` | No | string | OData filter |
| Order By | `$orderby` | No | string | OData orderBy |

**Returns:** Channel list with owner team ID

---

### Chat Management

#### CreateChat — Create a chat

| Property | Value |
|----------|-------|
| **operationId** | `CreateChat` |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Title | `topic` | No | string | Group chats only |
| Members to add | `members` | Yes | string | Semicolon-separated user IDs |

**Returns:** New chat response

**Limitations:** Max 20 users per chat; no guest user support

---

#### GetChats — List chats

| Property | Value |
|----------|-------|
| **operationId** | `GetChats` |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Chat Types | `chatType` | Yes | string | Filter by type |
| Topic | `topic` | Yes | string | Filter by whether topic is defined |

**Returns:** Array with topic, createdDateTime, lastUpdatedDateTime, conversationId

**Special throttling:** 25 requests per 300 seconds

---

### Tag Management

#### CreateTag — Create a tag for a team

| Property | Value |
|----------|-------|
| **operationId** | `CreateTag` |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Team | `groupId` | Yes | string | Select team |
| Display Name | `displayName` | Yes | string | Tag name |
| Members' IDs | `members` | Yes | string | Semicolon-separated UUIDs |

**Returns:** Tag ID, team ID, display name, member count

---

#### GetTags — List all tags for a team

| Property | Value |
|----------|-------|
| **operationId** | `GetTags` |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Team | `groupId` | Yes | string | Select team |

**Returns:** Array with tag ID, team ID, display name, member count

---

#### DeleteTag — Delete a team tag

| Property | Value |
|----------|-------|
| **operationId** | `DeleteTag` |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Team | `groupId` | Yes | string | Select team |
| Tag | `tagId` | Yes | string | Tag ID |

---

#### AddMemberToTag — Add a member to a team tag

| Property | Value |
|----------|-------|
| **operationId** | `AddMemberToTag` |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Team | `groupId` | Yes | string | Select team |
| Tag | `tagId` | Yes | string | Tag ID |
| User's ID | `userId` | Yes | string | UUID format |

**Returns:** User ID

---

#### GetTagMembers — List the members of a team tag

| Property | Value |
|----------|-------|
| **operationId** | `GetTagMembers` |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Team | `groupId` | Yes | string | Select team |
| Tag | `tagId` | Yes | string | Tag ID |

**Returns:** Array with tag member ID, tenant ID, user display name, user ID

---

#### DeleteTagMember — Delete a member from a team tag

| Property | Value |
|----------|-------|
| **operationId** | `DeleteTagMember` |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Team | `groupId` | Yes | string | Select team |
| Tag | `tagId` | Yes | string | Tag ID |
| Tag Member ID | `tagMemberId` | Yes | string | Tag member ID |

---

### Member & Mention Operations

#### ListMembers — List members

| Property | Value |
|----------|-------|
| **operationId** | `ListMembers` |
| **Description** | List direct members of a group chat or a channel |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Thread type | `threadType` | Yes | string | Choose message type |
| List members request | `body` | Yes | dynamic | Request body |

**Returns:** `ListMembersResponseSchema`

| Field | Path | Type | Description |
|-------|------|------|-------------|
| Display Name | `value.displayName` | string | Member display name |
| E-Mail | `value.email` | string | Member email |
| ID | `value.id` | string | Member user ID |
| Roles | `value.roles` | array of string | Assigned roles |
| Tenant ID | `value.tenantId` | string | Tenant ID |
| User ID | `value.userId` | string | User ID |
| Visible History Start | `value.visibleHistoryStartDateTime` | string | When conversation history begins for this member |

---

#### AtMentionUser — Get an @mention token for a user

| Property | Value |
|----------|-------|
| **operationId** | `AtMentionUser` |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| User | `userId` | Yes | string | UPN or user ID |

**Returns:** @mention token string (embed in message or adaptive card content)

---

#### AtMentionTag — Get an @mention token for a team tag

| Property | Value |
|----------|-------|
| **operationId** | `AtMentionTag` |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Team | `groupId` | Yes | string | Select team |
| Tag | `tagId` | Yes | string | Tag ID |

**Returns:** @mention token string

---

### Feed & Notification Operations

#### PostFeedNotification — Post a feed notification

| Property | Value |
|----------|-------|
| **operationId** | `PostFeedNotification` |
| **Description** | Posts a notification to a user's activity feed linking to a chat or team |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Post as | `poster` | Yes | string | Select option |
| Notification type | `notificationType` | Yes | string | Notification type |
| Post feed notification request | `body` | Yes | dynamic | Notification details |

**Special throttling:** 25 requests per 300 seconds

---

#### SubscribeUserMessageWithOptions — Post a choice of options as the Flow bot to a user

| Property | Value |
|----------|-------|
| **operationId** | `SubscribeUserMessageWithOptions` |
| **Description** | Send a set of options to a user that must be responded to before flow continues |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| User message with options subscription request | `body` | Yes | dynamic | Options configuration |

**Returns:** Dynamic outputs

---

### Meeting Operations

#### CreateTeamsMeeting — Create a Teams meeting

| Property | Value |
|----------|-------|
| **operationId** | `CreateTeamsMeeting` |
| **Deprecated** | No |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Calendar id | `calendarid` | Yes | string | Select calendar |
| Subject | `subject` | Yes | string | Event subject line |
| Event message content | `content` | Yes | string | Event content |
| Time zone | `timeZone` | Yes | string | Event time zone |
| Start time | `dateTime` | Yes | date-no-tz | Format: `2017-08-29T04:00:00` |
| End time | `dateTime` | Yes | date-no-tz | Format: `2017-08-29T05:00:00` |
| Required attendees | `requiredAttendees` | No | email | Semicolon-separated emails |
| Optional attendees | `optionalAttendees` | No | email | Semicolon-separated emails |
| Display name (location) | `displayName` | No | string | Location name |
| Importance | `importance` | No | string | `low`, `normal`, or `high` |
| Recurrence pattern | `type` | No | string | Required for recurring meetings |
| Recurrence interval | `interval` | No | integer | Units between occurrences (required for recurring) |
| Days of week | `daysOfWeek` | No | array of string | e.g., `Monday,Wednesday,Friday` |
| Week Index | `index` | No | string | Which day of week (default: `first`) |
| Recurrence start date | `startDate` | No | date | Format: `YYYY-MM-DD` (required for recurring) |
| Recurrence end date | `endDate` | No | date | Format: `YYYY-MM-DD` |
| All day event | `isAllDay` | No | boolean | All-day flag |
| Pre-event reminder | `reminderMinutesBeforeStart` | No | integer | Minutes before start |
| Enable reminders | `isReminderOn` | No | boolean | Reminder toggle |
| Status show as | `showAs` | No | string | Busy/free status |
| Request response | `responseRequested` | No | boolean | Request RSVP |

**Returns:** `NewMeetingRespone` (meeting details)

**Gotcha:** Requires an Exchange Online Mailbox to select a time zone

---

### Microsoft Graph HTTP Request

#### HttpRequest — Send a Microsoft Graph HTTP request

| Property | Value |
|----------|-------|
| **operationId** | `HttpRequest` |
| **Description** | Construct a Microsoft Graph REST API request against Teams endpoints |
| **Deprecated** | No |

**Supported URI segments:**
- 1st segment: `/teams`, `/me`, `/users`
- 2nd segment: `channels`, `chats`, `installedApps`, `messages`, `pinnedMessages`

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| URI | `Uri` | Yes | string | Full or relative Graph API URI |
| Method | `Method` | Yes | string | HTTP method (default: GET) |
| Body | `Body` | No | binary | Request body content |
| Content-Type | `ContentType` | No | string | Body content type (default: `application/json`) |
| CustomHeader1 | `CustomHeader1` | No | string | Format: `header-name: header-value` |
| CustomHeader2 | `CustomHeader2` | No | string | Format: `header-name: header-value` |
| CustomHeader3 | `CustomHeader3` | No | string | Format: `header-name: header-value` |
| CustomHeader4 | `CustomHeader4` | No | string | Format: `header-name: header-value` |
| CustomHeader5 | `CustomHeader5` | No | string | Format: `header-name: header-value` |

**Returns:** `response` (ObjectWithoutType — dynamic based on the Graph API endpoint called)

---

## Actions — Deprecated

### Deprecated Messaging Actions

| operationId | Display Name | Replacement |
|-------------|-------------|-------------|
| `PostMessageToChannel` | Post a message | Use `PostMessageToConversation` |
| `PostMessageToChannelV2` | Post a message (V2) | Use `PostMessageToConversation` |
| `PostMessageToChannelV3` | Post a message (V3) | Use `PostMessageToConversation` |
| `PostChannelNotification` | Post a message as the Flow bot to a channel | Use `PostMessageToConversation` |
| `PostUserNotification` | Post a message as the Flow bot to a user | Use `PostMessageToConversation` |
| `PostReplyToMessage` | Post a reply to a message | Use `ReplyWithMessageToConversation` |
| `PostReplyToMessageV2` | Post a reply to a message (V2) | Use `ReplyWithMessageToConversation` |

### Deprecated Adaptive Card Actions

| operationId | Display Name | Replacement |
|-------------|-------------|-------------|
| `SubscribeChannelFlowContinuation` | Post Adaptive Card to channel and wait | Use `PostCardAndWaitForResponse` |
| `SubscribeUserFlowContinuation` | Post Adaptive Card to user and wait | Use `PostCardAndWaitForResponse` |
| `PostChannelAdaptiveCard` | Post own adaptive card as Flow bot to channel | Use `PostCardToConversation` |
| `PostUserAdaptiveCard` | Post own adaptive card as Flow bot to user | Use `PostCardToConversation` |

### Deprecated Shifts Actions (use Shifts connector instead)

| operationId | Display Name |
|-------------|-------------|
| `SwapShiftsChangeRequestApprove` | Approve a Swap Shifts request |
| `TimeOffRequestApprove` | Approve a Time Off request |
| `OfferShiftRequestApprove` | Approve an Offer Shift request |
| `OpenShiftChangeRequestApprove` | Approve an Open Shift request |
| `CreateOpenShift` | Create a new Open Shift |
| `SwapShiftsChangeRequestDecline` | Decline a Swap Shifts request |
| `TimeOffRequestDecline` | Decline a Time Off request |
| `OfferShiftRequestDecline` | Decline an Offer Shift request |
| `OpenShiftChangeRequestDecline` | Decline an Open Shift request |
| `DeleteShift` | Delete a shift |
| `DeleteOpenShift` | Delete an open shift |
| `GetSchedule` | Get a schedule's details |
| `GetSchedulingGroup` | Get a scheduling group |
| `GetShift` | Get a shift |
| `GetOpenShift` | Get an open shift |
| `ListOfferShiftRequests` | List all Offer Shift requests |
| `ListOpenShiftChangeRequests` | List all Open Shift requests |
| `ListOpenShifts` | List all Open Shifts |
| `ListSchedulingGroups` | List all scheduling groups |
| `ListShifts` | List all shifts |
| `ListSwapShiftsChangeRequests` | List all Swap Shifts requests |
| `ListTimeOffReasons` | List all Time Off reasons |
| `ListTimeOffRequests` | List all Time Off requests |
| `UpdateOpenShift` | Update an Open Shift |

---

## Microsoft Graph Permissions (Teams-Related)

These are the underlying Microsoft Graph permissions. The Teams Power Automate connector uses **delegated permissions** through its OAuth connection. The specific scopes requested by the connector are managed by Microsoft and abstracted from the user.

### Channel Permissions

| Permission | Delegated | Application | Admin Consent (Delegated) | Admin Consent (Application) |
|-----------|-----------|-------------|--------------------------|----------------------------|
| Channel.Create | Create channels on behalf of user | Create channels in any team | Yes | Yes |
| Channel.Delete.All | Delete channels on behalf of user | Delete channels in any team | Yes | Yes |
| Channel.ReadBasic.All | Read channel names and descriptions | Read channel names and descriptions | No | Yes |

### Channel Message Permissions

| Permission | Delegated | Application | Admin Consent (Delegated) | Admin Consent (Application) |
|-----------|-----------|-------------|--------------------------|----------------------------|
| ChannelMessage.Edit | Edit user's channel messages | N/A | No | N/A |
| ChannelMessage.Read.All | Read user channel messages | Read all channel messages | Yes | Yes |
| ChannelMessage.ReadWrite | Read and write user channel messages | N/A | Yes | N/A |
| ChannelMessage.Send | Send channel messages | N/A | No | N/A |
| ChannelMessage.UpdatePolicyViolation.All | N/A | Flag messages for DLP violations | N/A | Yes |

### Channel Member Permissions

| Permission | Delegated | Application | Admin Consent (Delegated) | Admin Consent (Application) |
|-----------|-----------|-------------|--------------------------|----------------------------|
| ChannelMember.Read.All | Read members of channels | Read members of all channels | Yes | Yes |
| ChannelMember.ReadWrite.All | Add/remove members, change roles | Add/remove members, change roles | Yes | Yes |

### Channel Settings Permissions

| Permission | Delegated | Application | Admin Consent (Delegated) | Admin Consent (Application) |
|-----------|-----------|-------------|--------------------------|----------------------------|
| ChannelSettings.Read.All | Read channel settings | Read channel settings | Yes | Yes |
| ChannelSettings.ReadWrite.All | Read and write channel settings | Read and write channel settings | Yes | Yes |

### Chat Permissions

| Permission | Delegated | Application | Admin Consent (Delegated) | Admin Consent (Application) |
|-----------|-----------|-------------|--------------------------|----------------------------|
| Chat.Create | Create chats on behalf of user | Create chats without user | No | Yes |
| Chat.ManageDeletion.All | Delete and recover chats | Delete and recover chats | Yes | Yes |
| Chat.Read | Read user chat messages | N/A | No | N/A |
| Chat.Read.All | N/A | Read all chat messages | N/A | Yes |
| Chat.Read.WhereInstalled | N/A | Read chats where app is installed | N/A | Yes |
| Chat.ReadBasic | Read names and members of user chats | N/A | No | N/A |
| Chat.ReadBasic.All | N/A | Read names and members of all chats | N/A | Yes |
| Chat.ReadWrite | Read and write user chat messages | N/A | No | N/A |
| Chat.ReadWrite.All | Read and write all chat messages | Read and write all chat messages | Yes | Yes |

### Chat Member Permissions

| Permission | Delegated | Application | Admin Consent (Delegated) | Admin Consent (Application) |
|-----------|-----------|-------------|--------------------------|----------------------------|
| ChatMember.Read | Read members of chats | N/A | Yes | N/A |
| ChatMember.Read.All | N/A | Read members of all chats | N/A | Yes |
| ChatMember.ReadWrite | Add/remove members from chats | N/A | Yes | N/A |
| ChatMember.ReadWrite.All | N/A | Add/remove members from all chats | N/A | Yes |

### Chat Message Permissions

| Permission | Delegated | Application | Admin Consent (Delegated) | Admin Consent (Application) |
|-----------|-----------|-------------|--------------------------|----------------------------|
| ChatMessage.Read | Read 1:1 and group chat messages | N/A | No | N/A |
| ChatMessage.Read.All | N/A | Read all chat messages | N/A | Yes |
| ChatMessage.Send | Send chat messages | N/A | No | N/A |

### Team Permissions

| Permission | Delegated | Application | Admin Consent (Delegated) | Admin Consent (Application) |
|-----------|-----------|-------------|--------------------------|----------------------------|
| Team.ReadBasic.All | Read team names and descriptions | Read team names and descriptions | No | Yes |
| TeamMember.Read.All | Read team members | Read team members | Yes | Yes |
| TeamMember.ReadWrite.All | Add/remove team members | Add/remove team members | Yes | Yes |

---

## Delegated vs Application Permissions

### Key Differences for Teams

| Aspect | Delegated | Application |
|--------|-----------|-------------|
| **User context** | Acts on behalf of signed-in user | Acts without a user (service/daemon) |
| **Used by** | Power Automate cloud flows (user connections) | Service principals, background services |
| **Teams connector default** | Yes — all Teams connector actions use delegated | Not directly; use HttpRequest action or separate Graph API calls |
| **Admin consent** | Some permissions require it, many do not | Almost always required |
| **Scope** | Limited to what the user can access | Can access all teams/channels/chats (if granted) |
| **Send messages** | As the signed-in user or Flow Bot | Requires bot framework or Graph API with app permissions |
| **Read messages** | Only user's own messages/channels by default | Can read all messages with ChannelMessage.Read.All or Chat.Read.All |

### Permissions That Do NOT Require Admin Consent (Delegated)

These are the most frictionless to use in Power Automate flows:
- `Channel.ReadBasic.All` — Read channel names/descriptions
- `ChannelMessage.Edit` — Edit user's own channel messages
- `ChannelMessage.Send` — Send channel messages
- `Chat.Create` — Create chats
- `Chat.Read` — Read user's chat messages
- `Chat.ReadBasic` — Read names/members of user's chats
- `Chat.ReadWrite` — Read and write user's chat messages
- `ChatMessage.Read` — Read chat messages
- `ChatMessage.Send` — Send chat messages
- `Team.ReadBasic.All` — Read team names/descriptions

### Permissions That REQUIRE Admin Consent (Even Delegated)

These will block users until a tenant admin approves:
- `ChannelMessage.Read.All` — Read all channel messages
- `ChannelMessage.ReadWrite` — Read/write channel messages
- `ChannelMember.Read.All` / `ReadWrite.All` — Channel membership
- `ChannelSettings.Read.All` / `ReadWrite.All` — Channel settings
- `Channel.Create` / `Delete.All` — Channel management
- `Chat.ReadWrite.All` — Read/write all chats
- `Chat.ManageDeletion.All` — Delete/recover chats
- `ChatMember.Read` / `ReadWrite` — Chat membership
- `TeamMember.Read.All` / `ReadWrite.All` — Team membership

---

## Quick Reference: Operation ID Lookup

### Triggers

| operationId | Display Name |
|-------------|-------------|
| `OnMessageSelectedV2` | For a selected message (V2) |
| `OnComposeMessageV2` | From the compose box (V2) |
| `OnNewChannelMessage` | When a new channel message is added |
| `WebhookChatMessageTrigger` | When a new chat message is added |
| `WebhookNewMessageTrigger` | When a new message is added to a chat or channel |
| `OnGroupMembershipAdd` | When a new team member is added |
| `OnGroupMembershipRemoval` | When a new team member is removed |
| `WebhookAtMentionTrigger` | When I'm @mentioned |
| `OnNewChannelMessageMentioningMe` | When I am mentioned in a channel message |
| `WebhookKeywordTrigger` | When keywords are mentioned |
| `WebhookMessageReactionTrigger` | When someone reacted to a message in chat |
| `TeamsCardTrigger` | When someone responds to an adaptive card |
| `TeamsIncomingWebhookTrigger` | When a Teams webhook request is received |

### Non-Deprecated Actions

| operationId | Display Name |
|-------------|-------------|
| `PostMessageToConversation` | Post message in a chat or channel |
| `GetMessagesFromChannel` | Get messages |
| `GetMessageDetails` | Get message details |
| `ReplyWithMessageToConversation` | Reply with a message in a channel |
| `ListRepliesToMessage` | List replies of a channel message |
| `PostCardAndWaitForResponse` | Post adaptive card and wait for a response |
| `PostCardToConversation` | Post card in a chat or channel |
| `ReplyWithCardToConversation` | Reply with an adaptive card in a channel |
| `UpdateCardInConversation` | Update an adaptive card in a chat or channel |
| `CreateATeam` | Create a team |
| `GetTeam` | Get a team |
| `GetAllTeams` | List joined teams |
| `GetAllAssociatedTeams` | List associated teams |
| `AddMemberToTeam` | Add a member to a team |
| `CreateChannel` | Create a channel |
| `GetChannel` | Get details for a specific channel |
| `GetChannelsForGroup` | List channels |
| `GetAllChannelsForTeam` | List all channels |
| `CreateChat` | Create a chat |
| `GetChats` | List chats |
| `ListMembers` | List members |
| `AtMentionUser` | Get an @mention token for a user |
| `AtMentionTag` | Get an @mention token for a team tag |
| `CreateTag` | Create a tag for a team |
| `GetTags` | List all tags for a team |
| `DeleteTag` | Delete a team tag |
| `AddMemberToTag` | Add a member to a team tag |
| `GetTagMembers` | List the members of a team tag |
| `DeleteTagMember` | Delete a member from a team tag |
| `PostFeedNotification` | Post a feed notification |
| `SubscribeUserMessageWithOptions` | Post a choice of options as the Flow bot to a user |
| `CreateTeamsMeeting` | Create a Teams meeting |
| `HttpRequest` | Send a Microsoft Graph HTTP request |

---

## Summary Statistics

| Category | Count |
|----------|-------|
| **Triggers** | 13 (0 deprecated) |
| **Non-deprecated actions** | 33 |
| **Deprecated actions** | 44 (11 messaging + 33 Shifts) |
| **Total operations** | 90 |
