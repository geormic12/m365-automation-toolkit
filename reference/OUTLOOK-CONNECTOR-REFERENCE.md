# Office 365 Outlook Connector Reference (`shared_office365`)

Complete trigger and action reference for the Office 365 Outlook connector in Power Platform / Logic Apps. Covers email, calendar, contacts, rooms, and utility operations. All data sourced from [official Microsoft Learn documentation](https://learn.microsoft.com/en-us/connectors/office365/) (March 2026).

Used by the `/generate-agent-flow` and `/generate-pa-package` skills.

**API name in flow JSON:** `shared_office365`

---

## Table of Contents

### Email
- [Triggers (Email)](#triggers-email)
- [Actions — Send Email](#actions--send-email)
- [Actions — Get / List Email](#actions--get--list-email)
- [Actions — Reply / Forward](#actions--reply--forward)
- [Actions — Draft Email](#actions--draft-email)
- [Actions — Move / Delete](#actions--move--delete)
- [Actions — Flag / Mark / Category](#actions--flag--mark--category)
- [Actions — Attachments](#actions--attachments)
- [Actions — Export / Utility](#actions--export--utility)
- [Actions — Mailbox Settings](#actions--mailbox-settings)
- [Actions — HTTP (Graph API)](#actions--http-graph-api)

### Calendar
- [Calendar Operations (Current)](#calendar-operations-current)
- [Calendar Operations (Deprecated)](#calendar-operations-deprecated)

### Contacts
- [Contact Operations (Current)](#contact-operations-current)
- [Contact Operations (Deprecated)](#contact-operations-deprecated)

### Rooms & Resources
- [Room & Resource Operations](#room--resource-operations)

### Reference
- [Deprecated Operations (Email)](#deprecated-operations-email)
- [Return Schema: GraphClientReceiveMessage](#return-schema-graphclientreceivemessage)
- [Return Schema: GraphCalendarEventClientReceive](#return-schema-graphcalendareventclientreceive)
- [Return Schema: ContactResponse_V2](#return-schema-contactresponse_v2)
- [Timezone Handling](#timezone-handling)
- [Recurrence Pattern Format](#recurrence-pattern-format)
- [Throttling & Limits](#throttling--limits)
- [Known Issues & Gotchas](#known-issues--gotchas)

---

## Triggers (Email)

### When a new email arrives (V3)

| Property | Value |
|----------|-------|
| **operationId** | `OnNewEmailV3` |
| **Type** | Polling trigger |
| **Description** | Fires when a new email arrives in the specified folder. |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Folder | `folderPath` | No | string | Mail folder to monitor (default: `Inbox`) |
| To | `to` | No | email | Recipient addresses (semicolon-separated). Trigger fires if any match. |
| CC | `cc` | No | email | CC addresses (semicolon-separated). Trigger fires if any match. |
| To or CC | `toOrCc` | No | email | To or CC addresses. Trigger fires if any match. |
| From | `from` | No | email | Sender addresses (semicolon-separated). Trigger fires if any match. |
| Importance | `importance` | No | string | Filter by importance: `Any`, `High`, `Normal`, `Low` |
| Only with Attachments | `fetchOnlyWithAttachment` | No | boolean | Only trigger on emails with attachments |
| Include Attachments | `includeAttachments` | No | boolean | Include attachment content in output |
| Subject Filter | `subjectFilter` | No | string | String to search for in the subject line |

**Returns:** `GraphClientReceiveMessage` (see [Return Schema](#return-schema-graphclientreceivemessage))

**Gotchas:**
- Filtering on To, CC, From, Importance, Subject is applied against the first 250 items in the folder
- `includeAttachments=true` can cause timeouts when many emails arrive simultaneously
- Only populate ONE of `to`/`cc` OR `toOrCc` — not both
- Emails exceeding the Exchange Admin size limit or 50 MB (whichever is less) are skipped
- Encrypted/protected emails are skipped
- Delay of up to 1 hour in rare cases
- Trigger bases on received date — moving emails between folders does not re-trigger

---

### When a new email arrives in a shared mailbox (V2)

| Property | Value |
|----------|-------|
| **operationId** | `SharedMailboxOnNewEmailV2` |
| **Type** | Polling trigger |
| **Description** | Fires when a new email arrives in a shared mailbox folder. |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Mailbox Address | `mailboxAddress` | **Yes** | string | Address of the shared mailbox |
| Folder | `folderId` | No | string | Mail folder to monitor (default: `Inbox`) |
| To | `to` | No | email | Recipient addresses (semicolon-separated) |
| CC | `cc` | No | email | CC addresses (semicolon-separated) |
| To or CC | `toOrCc` | No | email | To or CC addresses |
| From | `from` | No | email | Sender addresses (semicolon-separated) |
| Importance | `importance` | No | string | `Any`, `High`, `Normal`, `Low` |
| Only with Attachments | `hasAttachments` | No | boolean | Only emails with attachments |
| Include Attachments | `includeAttachments` | No | boolean | Include attachment content |
| Subject Filter | `subjectFilter` | No | string | String to search in subject |

**Returns:** `GraphClientReceiveMessage`

**Gotchas:**
- Only works with Microsoft 365 shared mailboxes — not user-to-user shared mailboxes
- The connected user must have full access permissions on the shared mailbox
- Moving emails between folders does not re-trigger (trigger uses received date)
- Encrypted emails not supported — output will not contain actual message body

---

### When a new email mentioning me arrives (V3)

| Property | Value |
|----------|-------|
| **operationId** | `OnNewMentionMeEmailV3` |
| **Type** | Polling trigger |
| **Description** | Fires when a new email arrives that mentions the connected user. |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Folder | `folderPath` | No | string | Mail folder to monitor (default: `Inbox`) |
| To | `to` | No | email | Recipient addresses (semicolon-separated) |
| CC | `cc` | No | email | CC addresses (semicolon-separated) |
| To or CC | `toOrCc` | No | email | To or CC addresses |
| From | `from` | No | email | Sender addresses (semicolon-separated) |
| Importance | `importance` | No | string | `Any`, `High`, `Normal`, `Low` |
| Only with Attachments | `fetchOnlyWithAttachment` | No | boolean | Only emails with attachments |
| Include Attachments | `includeAttachments` | No | boolean | Include attachment content |
| Subject Filter | `subjectFilter` | No | string | String to search in subject |

**Returns:** `GraphClientReceiveMessage`

**Gotchas:**
- Delay of up to 1 hour in rare cases
- Encrypted emails not supported

---

### When an email is flagged (V3)

| Property | Value |
|----------|-------|
| **operationId** | `OnFlaggedEmailV3` |
| **Type** | Polling trigger |
| **Description** | Fires when an email is flagged or when a flagged email is modified. |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Folder | `folderPath` | No | string | Mail folder to monitor (default: `Inbox`) |
| To | `to` | No | email | Recipient addresses (semicolon-separated) |
| CC | `cc` | No | email | CC addresses (semicolon-separated) |
| To or CC | `toOrCc` | No | email | To or CC addresses |
| From | `from` | No | email | Sender addresses (semicolon-separated) |
| Importance | `importance` | No | string | `Any`, `High`, `Normal`, `Low` |
| Only with Attachments | `fetchOnlyWithAttachment` | No | boolean | Only emails with attachments |
| Include Attachments | `includeAttachments` | No | boolean | Include attachment content |
| Subject Filter | `subjectFilter` | No | string | String to search in subject |

**Returns:** `GraphClientReceiveMessage`

**Gotchas:**
- Fires on flagging OR receiving a flagged email
- Also fires when a flagged email is modified (e.g., category changed, replied to)
- Flagging multiple emails at once causes the trigger to run multiple times for some emails
- V4 exists as Preview — same parameters, may address some of the duplicate-fire issues

---

### When an email is flagged (V4) [PREVIEW]

| Property | Value |
|----------|-------|
| **operationId** | `OnFlaggedEmailV4` |
| **Type** | Polling trigger |
| **Description** | Updated version of the flagged email trigger (Preview). |

**Parameters:** Same as V3 (see above).

**Returns:** `GraphClientReceiveMessage`

**Note:** This is a Preview operation. Parameters match V3. May address duplicate-trigger issues from V3.

---

## Actions — Send Email

### Send an email (V2)

| Property | Value |
|----------|-------|
| **operationId** | `SendEmailV2` |
| **Description** | Sends an email message. |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| To | `emailMessage/To` | **Yes** | email | Recipients (semicolon-separated) |
| Subject | `emailMessage/Subject` | **Yes** | string | Email subject |
| Body | `emailMessage/Body` | **Yes** | html | Email body (HTML) |
| From (Send as) | `emailMessage/From` | No | email | Send-as address (requires "Send as" or "Send on behalf of" permission) |
| CC | `emailMessage/Cc` | No | email | CC recipients (semicolon-separated) |
| BCC | `emailMessage/Bcc` | No | email | BCC recipients (semicolon-separated) |
| Sensitivity | `emailMessage/Sensitivity` | No | string | Sensitivity level |
| Reply To | `emailMessage/ReplyTo` | No | email | Reply-to addresses |
| Importance | `emailMessage/Importance` | No | string | `Low`, `Normal`, `High` |
| Attachments — Name | `emailMessage/Attachments/Name` | Yes* | string | Attachment file name (*required if attachment present) |
| Attachments — Content | `emailMessage/Attachments/ContentBytes` | Yes* | byte | Attachment content (base64) |
| Original Mailbox Address | `emailMessage/mailboxAddress` | No | string | Shared mailbox address to send from |

**Returns:** No body returned.

**Gotchas:**
- Does NOT return the message ID — there is no way to get the messageId after sending
- Max 1 MB per data URI for inline embedded images
- To send multiple attachments, use an array of `{Name, ContentBytes}` objects
- Max 500 total recipients across To + CC + BCC (Exchange Online limit)

---

### Send an email from a shared mailbox (V2)

| Property | Value |
|----------|-------|
| **operationId** | `SharedMailboxSendEmailV2` |
| **Description** | Sends an email from a shared mailbox. Requires access permission. |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Mailbox Address | `mailboxAddress` | **Yes** | string | Shared mailbox address to send from |
| To | `emailMessage/To` | **Yes** | email | Recipients (semicolon-separated) |
| Subject | `emailMessage/Subject` | **Yes** | string | Email subject |
| Body | `emailMessage/Body` | **Yes** | html | Email body (HTML) |
| CC | `emailMessage/Cc` | No | email | CC recipients |
| BCC | `emailMessage/Bcc` | No | email | BCC recipients |
| Sensitivity | `emailMessage/Sensitivity` | No | string | Sensitivity level |
| Reply To | `emailMessage/ReplyTo` | No | email | Reply-to addresses |
| Importance | `emailMessage/Importance` | No | string | `Low`, `Normal`, `High` |
| Attachments — Name | `emailMessage/Attachments/Name` | Yes* | string | Attachment name |
| Attachments — Content | `emailMessage/Attachments/ContentBytes` | Yes* | byte | Attachment content |

**Returns:** No body returned.

**Gotchas:**
- Only works with Microsoft 365 shared mailboxes
- Does NOT work for mailboxes converted from personal mailboxes
- Connected user must have "Send as" or "Send on behalf of" permission

---

### Send approval email

| Property | Value |
|----------|-------|
| **operationId** | `SendApprovalMail` |
| **Description** | Sends an approval email and waits for a response from the recipient. |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| To | `approvalEmailSubscription/To` | **Yes** | email | Recipient addresses |
| Subject | `approvalEmailSubscription/Subject` | **Yes** | string | Email subject |
| Body | `approvalEmailSubscription/Body` | **Yes** | html | Email body |
| Options | `approvalEmailSubscription/Options` | **Yes** | string | Approval options (comma-separated, e.g. `Approve, Reject`) |
| Show HTML Confirmation Dialog | `approvalEmailSubscription/ShowHTMLConfirmationDialog` | No | boolean | Show confirmation dialog |
| Use Only HTML Message | `approvalEmailSubscription/UseOnlyHtmlMessage` | No | boolean | Use only HTML message |
| Hide HTML Message | `approvalEmailSubscription/HideHTMLMessage` | No | boolean | Hide HTML message |
| Importance | `approvalEmailSubscription/Importance` | No | string | `Low`, `Normal`, `High` |

**Returns:**

| Name | Type | Description |
|------|------|-------------|
| SelectedOption | string | The option selected by the recipient |
| UserEmailAddress | string | Email address of the responder |

**Gotchas:**
- Only works with single-user mailboxes, not group/shared mailboxes
- Actionable messages require Outlook client support (see [requirements](https://learn.microsoft.com/en-us/outlook/actionable-messages/))
- Flow waits (blocks) until the recipient responds

---

### Send email with options

| Property | Value |
|----------|-------|
| **operationId** | `SendMailWithOptions` |
| **Description** | Sends an email with multiple options and waits for a response. |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| To | `optionsEmailSubscription/To` | **Yes** | email | Recipient addresses |
| Subject | `optionsEmailSubscription/Subject` | **Yes** | string | Email subject |
| Body | `optionsEmailSubscription/Body` | **Yes** | html | Email body |
| Options | `optionsEmailSubscription/Options` | **Yes** | string | Response options (comma-separated) |
| Show HTML Confirmation Dialog | `optionsEmailSubscription/ShowHTMLConfirmationDialog` | No | boolean | Show confirmation dialog |
| Use Only HTML Message | `optionsEmailSubscription/UseOnlyHtmlMessage` | No | boolean | Use only HTML |
| Hide HTML Message | `optionsEmailSubscription/HideHTMLMessage` | No | boolean | Hide HTML message |
| Importance | `optionsEmailSubscription/Importance` | No | string | `Low`, `Normal`, `High` |

**Returns:**

| Name | Type | Description |
|------|------|-------------|
| SelectedOption | string | The option selected by the recipient |
| UserEmailAddress | string | Email address of the responder |

**Gotchas:**
- Same actionable-messages limitations as Send approval email
- Flow waits (blocks) until the recipient responds

---

## Actions — Get / List Email

### Get emails (V3)

| Property | Value |
|----------|-------|
| **operationId** | `GetEmailsV3` |
| **Description** | Gets emails from a folder via Graph API. |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Folder | `folderPath` | No | string | Mail folder (default: `Inbox`) |
| To | `to` | No | email | Filter by recipient (semicolon-separated) |
| CC | `cc` | No | email | Filter by CC |
| To or CC | `toOrCc` | No | email | Filter by To or CC |
| From | `from` | No | email | Filter by sender |
| Importance | `importance` | No | string | `Any`, `High`, `Normal`, `Low` |
| Only with Attachments | `fetchOnlyWithAttachment` | No | boolean | Only emails with attachments |
| Subject Filter | `subjectFilter` | No | string | String to search in subject |
| Fetch Only Unread | `fetchOnlyUnread` | No | boolean | Only unread emails |
| Fetch Only Flagged | `fetchOnlyFlagged` | No | boolean | Only flagged emails |
| Original Mailbox Address | `mailboxAddress` | No | string | Shared mailbox address |
| Include Attachments | `includeAttachments` | No | boolean | Include attachment content |
| Search Query | `searchQuery` | No | string | OData search query (supports `$filter`, `$search`) |
| Top | `top` | No | integer | Number of emails to return (default: 10, max: 1000) |

**Returns:** Array of `GraphClientReceiveMessage`

**Gotchas:**
- Filtering on To, CC, From, Importance, Subject, fetchOnlyWithAttachment is applied client-side against first 250 items only
- Use `searchQuery` field to avoid the 250-item limitation (server-side filtering)
- Max 1000 emails per call
- `includeAttachments=true` increases response size and can cause timeouts

---

### Get email (V2)

| Property | Value |
|----------|-------|
| **operationId** | `GetEmailV2` |
| **Description** | Gets a single email by ID. |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Message Id | `messageId` | **Yes** | string | ID of the email |
| Original Mailbox Address | `mailboxAddress` | No | string | Shared mailbox address |
| Include Attachments | `includeAttachments` | No | boolean | Include attachment content |
| Internet Message Id | `internetMessageId` | No | string | Internet Message-ID header value |
| Extract Sensitivity Label | `extractSensitivityLabel` | No | boolean | Extract sensitivity label |
| Sensitivity Label Metadata | `fetchSensitivityLabelMetadata` | No | boolean | Fetch sensitivity label metadata |

**Returns:** `GraphClientReceiveMessage`

---

## Actions — Reply / Forward

### Reply to email (V3)

| Property | Value |
|----------|-------|
| **operationId** | `ReplyToV3` |
| **Description** | Replies to an email. |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Message Id | `messageId` | **Yes** | string | ID of the message to reply to |
| Original Mailbox Address | `mailboxAddress` | No | string | Shared mailbox address to reply from |
| Reply All | `replyAll` | No | boolean | Reply to all recipients (default: false) |
| Comment | `Comment` | No | string | Reply comment / body |
| Importance | `Importance` | No | string | `Low`, `Normal`, `High` |
| Subject Prefix | `subjectPrefix` | No | string | Subject prefix override |
| Attachments — Name | `Name` | Yes* | string | Attachment name |
| Attachments — Content | `ContentBytes` | Yes* | byte | Attachment content |

**Returns:** `GraphClientReceiveMessage`

**Gotchas:**
- Encrypted emails are NOT supported — will throw an error
- The `Sent` datetime of the original email is converted to UTC
- For shared mailboxes, use `mailboxAddress` parameter

---

### Forward an email (V2)

| Property | Value |
|----------|-------|
| **operationId** | `ForwardEmail_V2` |
| **Description** | Forwards an email. |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Message Id | `message_id` | **Yes** | string | ID of the message to forward |
| Original Mailbox Address | `mailboxAddress` | No | string | Shared mailbox to forward from |
| Comment | `Comment` | No | string | Forward comment |
| To | `ToRecipients` | **Yes** | string | Recipients (semicolon-separated) |

**Returns:** No body returned.

---

## Actions — Draft Email

### Draft an email message

| Property | Value |
|----------|-------|
| **operationId** | `DraftEmail` |
| **Description** | Creates a draft email message. |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| To | `To` | **Yes** | email | Recipients (semicolon-separated) |
| Subject | `Subject` | **Yes** | string | Email subject |
| Body | `Body` | **Yes** | html | Email body (HTML) |
| From (Send as) | `From` | No | email | Send-as address |
| CC | `Cc` | No | email | CC recipients |
| BCC | `Bcc` | No | email | BCC recipients |
| Attachments — Name | `Name` | Yes* | string | Attachment name |
| Attachments — Content | `ContentBytes` | Yes* | byte | Attachment content |
| Sensitivity | `Sensitivity` | No | string | Sensitivity level |
| Reply To | `ReplyTo` | No | email | Reply-to addresses |
| Importance | `Importance` | No | string | `Low`, `Normal`, `High` |
| Message Id | `messageId` | No | string | Message ID (for reply/forward drafts) |
| Draft Type | `draftType` | No | string | Draft type (Reply, ReplyAll, Forward) |
| Comment | `comment` | No | string | Draft comment |

**Returns:** `OutlookReceiveMessage` (includes the draft message ID needed by SendDraftMessage)

---

### Send a Draft message

| Property | Value |
|----------|-------|
| **operationId** | `SendDraftMessage` |
| **Description** | Sends a previously created draft message. |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Message Id | `messageId` | **Yes** | string | ID of the draft message to send |

**Returns:** `OutlookReceiveMessage`

---

### Updates an email Draft message

| Property | Value |
|----------|-------|
| **operationId** | `UpdateDraftMessage` |
| **Description** | Updates a draft email message. |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Message Id | `messageId` | **Yes** | string | ID of the draft to update |
| To | `To` | **Yes** | email | Recipients (semicolon-separated) |
| Subject | `Subject` | **Yes** | string | Email subject |
| Body | `Body` | **Yes** | html | Email body |
| From (Send as) | `From` | No | email | Send-as address |
| CC | `Cc` | No | email | CC recipients |
| BCC | `Bcc` | No | email | BCC recipients |
| Attachments — Name | `Name` | Yes* | string | Attachment name |
| Attachments — Content | `ContentBytes` | Yes* | byte | Attachment content |
| Sensitivity | `Sensitivity` | No | string | Sensitivity level |
| Reply To | `ReplyTo` | No | email | Reply-to addresses |
| Importance | `Importance` | No | string | `Low`, `Normal`, `High` |

**Returns:** `OutlookReceiveMessage`

---

## Actions — Move / Delete

### Move email (V2)

| Property | Value |
|----------|-------|
| **operationId** | `MoveV2` |
| **Description** | Moves an email to the specified folder within the same mailbox. |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Message Id | `messageId` | **Yes** | string | ID of the email to move |
| Folder | `folderPath` | **Yes** | string | Destination folder |
| Original Mailbox Address | `mailboxAddress` | No | string | Shared mailbox address |

**Returns:** `GraphClientReceiveMessage` (the moved message, with new ID)

**Gotchas:**
- Moving an email changes its message ID
- Cannot move between different mailboxes — same mailbox only

---

### Delete email (V2)

| Property | Value |
|----------|-------|
| **operationId** | `DeleteEmail_V2` |
| **Description** | Deletes an email by ID. |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Message Id | `messageId` | **Yes** | string | ID of the email to delete |
| Original Mailbox Address | `mailboxAddress` | No | string | Shared mailbox address |

**Returns:** No body returned.

---

## Actions — Flag / Mark / Category

### Flag email (V2)

| Property | Value |
|----------|-------|
| **operationId** | `Flag_V2` |
| **Description** | Updates an email flag. |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Message Id | `messageId` | **Yes** | string | ID of the email |
| Original Mailbox Address | `mailboxAddress` | No | string | Shared mailbox address |
| Flag Status | `body/flagStatus` | No | string | `notFlagged`, `flagged`, `complete` |

**Returns:** No body returned.

---

### Mark as read or unread (V3)

| Property | Value |
|----------|-------|
| **operationId** | `MarkAsRead_V3` |
| **Description** | Marks an email as read or unread. |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Message Id | `messageId` | **Yes** | string | ID of the email |
| Original Mailbox Address | `mailboxAddress` | No | string | Shared mailbox address |
| Is Read | `body/isRead` | **Yes** | boolean | `true` = mark read, `false` = mark unread |

**Returns:** No body returned.

---

### Assigns an Outlook category

| Property | Value |
|----------|-------|
| **operationId** | `AssignCategory` |
| **Description** | Assigns an Outlook category to a single email. |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Message Id | `messageId` | **Yes** | string | ID of the email |
| Category | `category` | **Yes** | string | Category name to assign |

**Returns:** No body returned.

---

### Assign a category to multiple emails

| Property | Value |
|----------|-------|
| **operationId** | `AssignCategoryBulk` |
| **Description** | Assigns an Outlook category to multiple emails at once. |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Message IDs | `messageIds` | **Yes** | array of string | Array of message IDs |
| Category Name | `categoryName` | **Yes** | string | Category name to assign |

**Returns:** `BatchOperationResult`

---

### Get Outlook category names

| Property | Value |
|----------|-------|
| **operationId** | `GetOutlookCategoryNames` |
| **Description** | Gets Outlook category display names. |

**Parameters:** None

**Returns:** Array of `string` — category display names

---

## Actions — Attachments

### Get Attachment (V2)

| Property | Value |
|----------|-------|
| **operationId** | `GetAttachment_V2` |
| **Description** | Gets an email attachment by ID. |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Message Id | `messageId` | **Yes** | string | ID of the email |
| Attachment Id | `attachmentId` | **Yes** | string | ID of the attachment |
| Original Mailbox Address | `mailboxAddress` | No | string | Shared mailbox address |
| Extract Sensitivity Label | `extractSensitivityLabel` | No | boolean | Extract sensitivity label |
| Sensitivity Label Metadata | `fetchSensitivityLabelMetadata` | No | boolean | Fetch sensitivity label metadata |

**Returns:**

| Name | Type | Description |
|------|------|-------------|
| Id | string | Attachment ID |
| Name | string | File name |
| Content Type | string | MIME type |
| Size | integer | Size in bytes |
| Content Bytes | byte | Base64-encoded content |
| Is Inline | boolean | Whether it's an inline attachment |
| Last Modified DateTime | date-time | Last modification timestamp |
| Content Id | string | Content-ID for inline attachments |

**Gotchas:**
- Digitally signed emails may return incorrect attachment content

---

## Actions — Export / Utility

### Export email (V2)

| Property | Value |
|----------|-------|
| **operationId** | `ExportEmail_V2` |
| **Description** | Exports email content in EML file format. |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Message Id | `messageId` | **Yes** | string | ID of the email |
| Original Mailbox Address | `mailboxAddress` | No | string | Shared mailbox address |

**Returns:** `binary` — EML file content

---

## Actions — Mailbox Settings

### Set up automatic replies (V2)

| Property | Value |
|----------|-------|
| **operationId** | `SetupAutoReplies_V2` |
| **Description** | Sets automatic reply (out-of-office) settings. |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Mailbox Address | `mailboxAddress` | No | string | Mailbox to configure (default: connected user) |
| Status | `status` | **Yes** | string | `Scheduled`, `AlwaysEnabled`, `Disabled` |
| External Audience | `externalAudience` | No | string | `All`, `Known`, `None` |
| Start Time | `startDateTime` | No | date-time | Start time (for `Scheduled` status) |
| End Time | `endDateTime` | No | date-time | End time (for `Scheduled` status) |
| Internal Reply Message | `internalReplyMessage` | No | string | Auto-reply for internal senders |
| External Reply Message | `externalReplyMessage` | No | string | Auto-reply for external senders |

**Returns:** No body returned.

---

### Get mail tips for a mailbox (V2)

| Property | Value |
|----------|-------|
| **operationId** | `GetMailTips_V2` |
| **Description** | Gets mail tips (auto-replies, mailbox full status, etc.). Not available in GccHigh/Mooncake. |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Mailbox Address | `mailboxAddress` | **Yes** | string | Target mailbox email address |

**Returns:**

| Name | Type | Description |
|------|------|-------------|
| automaticRepliesEnabled | boolean | Whether auto-replies are on |
| automaticRepliesMessage | string | The auto-reply message text |
| mailboxFull | boolean | Whether mailbox is full |
| customMailTip | string | Custom mail tip text |
| externalMembersCount | integer | Number of external members |
| totalMembersCount | integer | Total member count |
| deliveryRestricted | boolean | Whether delivery is restricted |

---

## Actions — HTTP (Graph API)

### Send an HTTP request

| Property | Value |
|----------|-------|
| **operationId** | `SendHttpRequest` |
| **Description** | Constructs and invokes a Microsoft Graph REST API request. |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Endpoint | `endpoint` | **Yes** | string | Graph API endpoint path |
| Method | `method` | **Yes** | string | HTTP method: `GET`, `POST`, `PATCH`, `DELETE` |
| Body | `body` | No | object | Request body (JSON) |
| Headers | `headers` | No | object | Custom HTTP headers |

**Supported path segments:**

| Segment | Options |
|---------|---------|
| 1st segment | `/me`, `/users/<userId>` |
| 2nd segment | `messages`, `mailFolders`, `events`, `calendar`, `calendars`, `outlook`, `inferenceClassification` |

**Returns:** Dynamic — depends on the Graph API endpoint invoked.

**Use cases:** Operations not directly exposed by the connector (e.g., copying emails, getting mail folder details, managing inference classification).

---

---

## Calendar Operations (Current)

### Create event (V4)

| Property | Value |
|----------|-------|
| **operationId** | `V4CalendarPostItem` |
| **Description** | Creates a calendar event. Current version — replaces CalendarPostItem, V2, V3. |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Calendar id | `table` | **Yes** | string | Select a calendar |
| Subject | `subject` | **Yes** | string | Event subject |
| Start time | `start` | **Yes** | date-no-tz | Start time (e.g., `2017-08-29T04:00:00`) — no timezone/Z suffix |
| End time | `end` | **Yes** | date-no-tz | End time (e.g., `2017-08-29T05:00:00`) — no timezone/Z suffix |
| Time zone | `timeZone` | **Yes** | string | Windows timezone name (e.g., `Pacific Standard Time`) |
| Required attendees | `requiredAttendees` | No | email | Semicolon-separated email addresses |
| Optional attendees | `optionalAttendees` | No | email | Semicolon-separated email addresses |
| Resource attendees | `resourceAttendees` | No | string | Semicolon-separated email addresses for rooms/resources |
| Body | `body` | No | html | HTML body of the event |
| Categories | `categories` | No | array of string | Category names |
| Location | `location` | No | string | Location text |
| Importance | `importance` | No | string | `low`, `normal`, `high` |
| Is all day event? | `isAllDay` | No | boolean | Default: false |
| Recurrence | `recurrence` | No | string | `none`, `daily`, `weekly`, `monthly`, `yearly` |
| Selected days of week | `selectedDaysOfWeek` | No | array of string | Day names for weekly recurrence |
| Recurrence end date | `recurrenceEnd` | No | date | End date for recurrence |
| Number of occurrences | `numberOfOccurences` | No | integer | How many times to repeat |
| Reminder | `reminderMinutesBeforeStart` | No | integer | Minutes before event to remind |
| Is reminder on | `isReminderOn` | No | boolean | Whether reminder alert is set |
| Show as | `showAs` | No | string | `free`, `tentative`, `busy`, `oof`, `workingElsewhere`, `unknown` |
| Response requested | `responseRequested` | No | boolean | Whether sender wants accept/decline |
| Sensitivity | `sensitivity` | No | string | `normal`, `personal`, `private`, `confidential` |

**Returns:** `GraphCalendarEventClientReceive`

---

### Get events (V4)

| Property | Value |
|----------|-------|
| **operationId** | `V4CalendarGetItems` |
| **Description** | Gets events from a calendar. Returns master recurring events (not expanded instances). |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Calendar id | `table` | **Yes** | string | Select a calendar |
| Filter Query | `$filter` | No | string | ODATA filter (e.g., `subject eq 'Meeting'`) |
| Order By | `$orderby` | No | string | ODATA orderBy (e.g., `start/dateTime asc`) |
| Top Count | `$top` | No | integer | Number of entries to retrieve |
| Skip Count | `$skip` | No | integer | Number of entries to skip |

**Returns:** Array of `GraphCalendarEventClientReceive`

---

### Get event (V3)

| Property | Value |
|----------|-------|
| **operationId** | `V3CalendarGetItem` |
| **Description** | Gets a single calendar event by ID. |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Calendar id | `table` | **Yes** | string | Select a calendar |
| Item id | `id` | **Yes** | string | Event unique identifier |

**Returns:** `GraphCalendarEventClientReceive`

---

### Update event (V4)

| Property | Value |
|----------|-------|
| **operationId** | `UpdateEvent_V4` |
| **Description** | Updates a calendar event. |

**Parameters:** Same as Create event (V4) plus:

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Calendar id | `table` | **Yes** | string | Select a calendar |
| Event Id | `event` | **Yes** | string | Event to update |

All other fields (subject, start, end, timeZone, attendees, body, etc.) are optional. See Create event (V4) for full list.

**Returns:** `GraphCalendarEventClientReceive`

**CRITICAL:** All omitted fields are RESET TO DEFAULTS. You MUST retrieve the event first with `V3CalendarGetItem` and re-pass all existing values.

---

### Delete event (V2)

| Property | Value |
|----------|-------|
| **operationId** | `CalendarDeleteItem_V2` |
| **Description** | Deletes a calendar event. |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Calendar id | `calendar` | **Yes** | string | Select a calendar |
| Id | `event` | **Yes** | string | Event to delete |

**Returns:** No body returned.

---

### Get calendar view of events (V3)

| Property | Value |
|----------|-------|
| **operationId** | `GetEventsCalendarViewV3` |
| **Description** | Gets events in a time range. Expands recurring events into individual instances. |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Calendar Id | `calendarId` | **Yes** | string | Select a calendar |
| Start Time | `startDateTimeUtc` | **Yes** | string | Start time in UTC |
| End Time | `endDateTimeUtc` | **Yes** | string | End time in UTC |
| Filter Query | `$filter` | No | string | ODATA filter query |
| Order By | `$orderby` | No | string | ODATA orderBy query |
| Top Count | `$top` | No | integer | Max entries to retrieve |
| Skip Count | `$skip` | No | integer | Entries to skip |
| Search | `search` | No | string | Search text for body/subject |

**Returns:** Array of `GraphCalendarEventClientReceive`

**Calendar View vs Get Events:**

| | Calendar View (V3) | Get Events (V4) |
|---|---|---|
| Recurring events | Expanded into instances | Returns master only |
| Recurrence property | `null` on each instance | Contains pattern |
| Time range | Required (UTC) | Not required |
| Best for | Calendar grid/view | Event management |
| Max per call | 256 events | Use $top |

---

### Get calendars (V2)

| Property | Value |
|----------|-------|
| **operationId** | `CalendarGetTables_V2` |
| **Description** | Gets available calendars. |

**Parameters:** None.

**Returns:** Array of `{ id, name, owner.emailAddress.name, owner.emailAddress.address }`

---

### Find meeting times (V2)

| Property | Value |
|----------|-------|
| **operationId** | `FindMeetingTimes_V2` |
| **Description** | Finds available meeting slots based on attendee availability. |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Required attendees | `RequiredAttendees` | No | string | Semicolon-separated emails |
| Optional attendees | `OptionalAttendees` | No | string | Semicolon-separated emails |
| Resource attendees | `ResourceAttendees` | No | string | Semicolon-separated resource emails |
| Meeting duration | `MeetingDuration` | No | integer | Duration in minutes |
| Start time | `Start` | No | date-time | Start of search window |
| End time | `End` | No | date-time | End of search window |
| Max Candidates | `MaxCandidates` | No | integer | Max suggestions to return |
| Minimum Attendee Percentage | `MinimumAttendeePercentage` | No | string | Min confidence % |
| Is Organizer Optional? | `IsOrganizerOptional` | No | boolean | Default: false |
| Activity Domain | `ActivityDomain` | No | string | `Work`, `Personal`, `Unrestricted`, `Unknown` |

**Returns:** `{ emptySuggestionsReason, meetingTimeSuggestions[] }` — time slots with attendee availability and confidence scores.

---

### Respond to an event invite (V2)

| Property | Value |
|----------|-------|
| **operationId** | `RespondToEventInvite_V2` |
| **Description** | Accepts, tentatively accepts, or declines a meeting invite. |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Calendar id | `calendar` | **Yes** | string | Select a calendar |
| Event id | `event` | **Yes** | string | Select an event |
| Response | `response` | **Yes** | string | `Accept`, `Tentative`, `Decline` |
| Comment | `comment` | No | string | Comment to include |
| Send response | `sendResponse` | No | boolean | Whether to notify organizer |

**Returns:** Updated event object.

---

## Calendar Operations (Deprecated)

| operationId | Display Name | Replaced By |
|-------------|-------------|-------------|
| `CalendarPostItem` | Create event | `V4CalendarPostItem` |
| `V2CalendarPostItem` | Create event (V2) | `V4CalendarPostItem` |
| `V3CalendarPostItem` | Create event (V3) | `V4CalendarPostItem` |
| `CalendarPatchItem` | Update event | `UpdateEvent_V4` |
| `V2CalendarPatchItem` | Update event (V2) | `UpdateEvent_V4` |
| `V3CalendarPatchItem` | Update event (V3) | `UpdateEvent_V4` |
| `CalendarGetItem` | Get event | `V3CalendarGetItem` |
| `V2CalendarGetItem` | Get event (V2) | `V3CalendarGetItem` |
| `CalendarGetItems` | Get events | `V4CalendarGetItems` |
| `V2CalendarGetItems` | Get events (V2) | `V4CalendarGetItems` |
| `CalendarDeleteItem` | Delete event | `CalendarDeleteItem_V2` |
| `GetEventsCalendarView` | Get calendar view | `GetEventsCalendarViewV3` |
| `GetEventsCalendarViewV2` | Get calendar view (V2) | `GetEventsCalendarViewV3` |
| `CalendarGetTables` | Get calendars | `CalendarGetTables_V2` |
| `FindMeetingTimes` | Find meeting times | `FindMeetingTimes_V2` |
| `RespondToEventInvite` | Respond to invite | `RespondToEventInvite_V2` |

---

## Contact Operations (Current)

### Create contact (V2)

| Property | Value |
|----------|-------|
| **operationId** | `ContactPostItem_V2` |
| **Description** | Creates a contact in a contacts folder. |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Folder id | `folder` | **Yes** | string | Contacts folder |
| Given name | `givenName` | **Yes** | string | First name |
| Home phones | `homePhones` | **Yes** | array of string | Home phone numbers (pass `[]` if none) |
| Surname | `surname` | No | string | Last name |
| Display Name | `displayName` | No | string | Full display name |
| Email address | `address` | No | email | Email address |
| Job Title | `jobTitle` | No | string | Job title |
| Company name | `companyName` | No | string | Company name |
| Department | `department` | No | string | Department |
| Business phones | `businessPhones` | No | array of string | Business phone numbers |
| Mobile phone | `mobilePhone` | No | string | Mobile phone |
| Business Address | `businessAddress.*` | No | object | street, city, state, countryOrRegion, postalCode |
| Home Address | `homeAddress.*` | No | object | street, city, state, countryOrRegion, postalCode |
| Other Address | `otherAddress.*` | No | object | street, city, state, countryOrRegion, postalCode |
| Categories | `categories` | No | array of string | Category names |
| *(40+ additional fields)* | | No | | See Part 2 reference for complete list |

**Returns:** `ContactResponse_V2`

---

### Get contacts (V2)

| Property | Value |
|----------|-------|
| **operationId** | `ContactGetItems_V2` |
| **Description** | Gets contacts from a folder. |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Folder id | `folder` | **Yes** | string | Contacts folder |
| Filter Query | `$filter` | No | string | ODATA filter query |
| Order By | `$orderby` | No | string | ODATA orderBy query |
| Top Count | `$top` | No | integer | Max entries |
| Skip Count | `$skip` | No | integer | Entries to skip |

**Returns:** Array of `ContactResponse_V2`

---

### Get contact (V2)

| Property | Value |
|----------|-------|
| **operationId** | `ContactGetItem_V2` |
| **Description** | Gets a single contact by ID. |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Folder id | `folder` | **Yes** | string | Contacts folder |
| Item id | `id` | **Yes** | string | Contact unique identifier |

**Returns:** `ContactResponse_V2`

---

### Update contact (V2)

| Property | Value |
|----------|-------|
| **operationId** | `ContactPatchItem_V2` |
| **Description** | Updates a contact. Same parameters as Create contact (V2) plus required `id`. |

**Returns:** `ContactResponse_V2`

---

### Delete contact (V2)

| Property | Value |
|----------|-------|
| **operationId** | `ContactDeleteItem_V2` |
| **Description** | Deletes a contact. |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Folder id | `folder` | **Yes** | string | Contacts folder |
| Id | `id` | **Yes** | string | Contact to delete |

**Returns:** No body returned.

---

### Get contact folders (V2)

| Property | Value |
|----------|-------|
| **operationId** | `ContactGetTablesV2` |
| **Description** | Gets available contact folders. |

**Parameters:** None.

**Returns:** Array of `{ id, name }`

---

### Update my contact's photo

| Property | Value |
|----------|-------|
| **operationId** | `UpdateMyContactPhoto` |
| **Description** | Uploads a photo for a contact. Max 4 MB. |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Contact Id | `contactId` | **Yes** | string | Contact ID |
| Photo Content | `photoContent` | **Yes** | binary | Photo binary (max 4 MB) |

**Returns:** No body returned.

---

## Contact Operations (Deprecated)

| operationId | Display Name | Replaced By |
|-------------|-------------|-------------|
| `ContactPostItem` | Create contact | `ContactPostItem_V2` |
| `ContactGetItems` | Get contacts | `ContactGetItems_V2` |
| `ContactGetItem` | Get contact | `ContactGetItem_V2` |
| `ContactPatchItem` | Update contact | `ContactPatchItem_V2` |
| `ContactDeleteItem` | Delete contact | `ContactDeleteItem_V2` |
| `ContactGetTables` | Get contact folders | `ContactGetTablesV2` |

---

## Room & Resource Operations

### Get room lists (V2)

| Property | Value |
|----------|-------|
| **operationId** | `GetRoomLists_V2` |
| **Description** | Gets all room lists in the organization. |

**Parameters:** None.

**Returns:** Array of `{ id, displayName, emailAddress }`

---

### Get rooms (V2)

| Property | Value |
|----------|-------|
| **operationId** | `GetRooms_V2` |
| **Description** | Gets all rooms. Max 100 returned. |

**Parameters:** None.

**Returns:** Array of `{ id, displayName, emailAddress }`

---

### Get rooms in room list (V2)

| Property | Value |
|----------|-------|
| **operationId** | `GetRoomsInRoomList_V2` |
| **Description** | Gets rooms in a specific room list. |

**Parameters:**

| Name | Key | Required | Type | Description |
|------|-----|----------|------|-------------|
| Room List Email | `roomListEmailAddress` | **Yes** | string | Room list email address |

**Returns:** Array of `{ id, displayName, emailAddress }`

**Deprecated room operations:** `GetRoomLists` → `GetRoomLists_V2`, `GetRooms` → `GetRooms_V2`, `GetRoomsInRoomList` → `GetRoomsInRoomList_V2`

---

## Deprecated Operations (Email)

All deprecated operations and their current replacements:

| Deprecated Operation | operationId | Replacement | Replacement operationId |
|---------------------|-------------|-------------|------------------------|
| Send an email | `SendEmail` | Send an email (V2) | `SendEmailV2` |
| Send email from shared mailbox | `SharedMailboxSendEmail` | Send email from shared mailbox (V2) | `SharedMailboxSendEmailV2` |
| Get emails | `GetEmails` | Get emails (V3) | `GetEmailsV3` |
| Get emails (V2) | `GetEmailsV2` | Get emails (V3) | `GetEmailsV3` |
| Get email | `GetEmail` | Get email (V2) | `GetEmailV2` |
| Reply to email | `ReplyTo` | Reply to email (V3) | `ReplyToV3` |
| Reply to email (V2) | `ReplyToV2` | Reply to email (V3) | `ReplyToV3` |
| Forward an email | `ForwardEmail` | Forward an email (V2) | `ForwardEmail_V2` |
| Delete email | `DeleteEmail` | Delete email (V2) | `DeleteEmail_V2` |
| Move email | `Move` | Move email (V2) | `MoveV2` |
| Flag email | `Flag` | Flag email (V2) | `Flag_V2` |
| Mark as read | `MarkAsRead` | Mark as read or unread (V3) | `MarkAsRead_V3` |
| Mark as read or unread (V2) | `MarkAsRead_V2` | Mark as read or unread (V3) | `MarkAsRead_V3` |
| Get attachment | `GetAttachment` | Get Attachment (V2) | `GetAttachment_V2` |
| Export email | `ExportEmail` | Export email (V2) | `ExportEmail_V2` |
| Set up automatic replies | `SetUpAutomaticReplies` | Set up automatic replies (V2) | `SetupAutoReplies_V2` |
| Get mail tips | `GetMailTipsForMailbox` | Get mail tips (V2) | `GetMailTips_V2` |
| When a new email arrives (webhook) | `CreateOnNewEmailSubscription` | When a new email arrives (V3) | `OnNewEmailV3` |
| When a new email arrives | `OnNewEmail` | When a new email arrives (V3) | `OnNewEmailV3` |
| When a new email arrives (V2) | `OnNewEmailV2` | When a new email arrives (V3) | `OnNewEmailV3` |
| When an email is flagged | `OnFlaggedEmail` | When an email is flagged (V3) | `OnFlaggedEmailV3` |
| When an email is flagged (V2) | `OnFlaggedEmailV2` | When an email is flagged (V3) | `OnFlaggedEmailV3` |
| When a new email mentioning me arrives | `OnNewMentionMeEmail` | When a new email mentioning me arrives (V3) | `OnNewMentionMeEmailV3` |
| When a new email mentioning me arrives (V2) | `OnNewMentionMeEmailV2` | When a new email mentioning me arrives (V3) | `OnNewMentionMeEmailV3` |
| When new email arrives in shared mailbox | `SharedMailboxOnNewEmail` | When new email arrives in shared mailbox (V2) | `SharedMailboxOnNewEmailV2` |

**Microsoft guidance:** "Due to underlying APIs decommission process, it's highly recommended to update existing solutions to avoid usage of operations marked as [DEPRECATED]."

---

## Return Schema: GraphClientReceiveMessage

The `GraphClientReceiveMessage` type maps to the [Microsoft Graph message resource](https://learn.microsoft.com/en-us/graph/api/resources/message?view=graph-rest-1.0). Key properties returned by triggers and email actions:

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | Unique message identifier (changes when moved between folders) |
| `subject` | string | Email subject |
| `body` | object | `{ contentType: "HTML"|"Text", content: "..." }` |
| `bodyPreview` | string | First 255 characters of the body (text only) |
| `from` | object | `{ emailAddress: { name, address } }` |
| `sender` | object | `{ emailAddress: { name, address } }` — may differ from `from` for delegates |
| `toRecipients` | array | `[{ emailAddress: { name, address } }]` |
| `ccRecipients` | array | `[{ emailAddress: { name, address } }]` |
| `bccRecipients` | array | `[{ emailAddress: { name, address } }]` |
| `replyTo` | array | `[{ emailAddress: { name, address } }]` |
| `sentDateTime` | date-time | When the email was sent (ISO 8601, UTC) |
| `receivedDateTime` | date-time | When the email was received (ISO 8601, UTC) |
| `createdDateTime` | date-time | When the message was created |
| `lastModifiedDateTime` | date-time | When the message was last changed |
| `hasAttachments` | boolean | True if email has file attachments (excludes inline) |
| `attachments` | array | Attachment objects (only if `includeAttachments=true`) |
| `importance` | string | `low`, `normal`, `high` |
| `isRead` | boolean | Read/unread status |
| `isDraft` | boolean | Whether the message is a draft |
| `isDeliveryReceiptRequested` | boolean | Delivery receipt requested |
| `isReadReceiptRequested` | boolean | Read receipt requested |
| `flag` | object | `{ flagStatus: "notFlagged"|"flagged"|"complete" }` |
| `categories` | array of string | Assigned Outlook categories |
| `conversationId` | string | Conversation thread ID |
| `conversationIndex` | binary | Position within conversation |
| `internetMessageId` | string | RFC 2822 Message-ID header |
| `internetMessageHeaders` | array | `[{ name, value }]` — only with `$select` |
| `parentFolderId` | string | ID of the containing mail folder |
| `inferenceClassification` | string | `focused` or `other` |
| `webLink` | string | URL to open in Outlook on the web |
| `uniqueBody` | object | Body content unique to this message (not quoted text) |

**Attachment object properties** (when included):

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | Attachment ID |
| `name` | string | File name |
| `contentType` | string | MIME type |
| `size` | integer | Size in bytes |
| `contentBytes` | byte | Base64-encoded content |
| `isInline` | boolean | Whether it's an inline attachment |
| `lastModifiedDateTime` | date-time | Last modification time |
| `contentId` | string | Content-ID (for inline images) |

---

## Return Schema: GraphCalendarEventClientReceive

Key properties returned by calendar event operations:

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | Unique event ID (changes when moved) |
| `subject` | string | Event subject |
| `start` | DateTimeTimeZone | `{ dateTime, timeZone }` |
| `end` | DateTimeTimeZone | `{ dateTime, timeZone }` |
| `body` | ItemBody | `{ contentType, content }` |
| `bodyPreview` | string | Plain text preview |
| `categories` | array of string | Category names |
| `hasAttachments` | boolean | Whether event has attachments |
| `importance` | string | `low`, `normal`, `high` |
| `isAllDay` | boolean | Whether event is all day |
| `isCancelled` | boolean | Whether event is canceled |
| `isOrganizer` | boolean | Whether user is organizer |
| `isOnlineMeeting` | boolean | Whether has online meeting info |
| `location` | Location | `{ displayName, address, coordinates }` |
| `locations` | array of Location | All locations |
| `onlineMeeting` | object | `{ joinUrl, conferenceId, ... }` |
| `onlineMeetingProvider` | string | `teamsForBusiness`, `skypeForBusiness`, etc. |
| `organizer` | Recipient | `{ emailAddress: { name, address } }` |
| `attendees` | array of Attendee | Each: `{ emailAddress, type, status }` |
| `recurrence` | PatternedRecurrence | Recurrence pattern and range (null in CalendarView) |
| `reminderMinutesBeforeStart` | integer | Minutes before start |
| `responseStatus` | object | `{ response, time }` |
| `sensitivity` | string | `normal`, `personal`, `private`, `confidential` |
| `showAs` | string | `free`, `tentative`, `busy`, `oof`, `workingElsewhere` |
| `type` | string | `singleInstance`, `occurrence`, `exception`, `seriesMaster` |
| `webLink` | string | URL to open in Outlook web |
| `iCalUId` | string | Unique ID shared across all instances |
| `seriesMasterId` | string | ID of series master (for occurrences) |
| `transactionId` | string | Client-set idempotency key |

---

## Return Schema: ContactResponse_V2

Key properties returned by contact operations:

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | Contact unique identifier |
| `displayName` | string | Full display name |
| `givenName` | string | First name |
| `surname` | string | Last name |
| `emailAddresses` | array | `[{ name, address }]` |
| `jobTitle` | string | Job title |
| `companyName` | string | Company name |
| `department` | string | Department |
| `businessPhones` | array of string | Business phone numbers |
| `homePhones` | array of string | Home phone numbers |
| `mobilePhone` | string | Mobile phone |
| `businessAddress` | PhysicalAddress | `{ street, city, state, countryOrRegion, postalCode }` |
| `homeAddress` | PhysicalAddress | Home address |
| `otherAddress` | PhysicalAddress | Other address |
| `categories` | array of string | Category names |
| `createdDateTime` | date-time | Creation timestamp |
| `lastModifiedDateTime` | date-time | Last modified timestamp |

---

## Timezone Handling

The connector uses **Windows timezone names** (not IANA/Olson). The `timeZone` parameter accepts `Pacific Standard Time`, not `America/Los_Angeles`.

**For Create/Update event (V4):** Pass datetime WITHOUT timezone offset or `Z` suffix. Use the separate `timeZone` parameter.
- Correct: `2026-03-15T09:00:00`
- Wrong: `2026-03-15T09:00:00Z`

**Common Windows Timezone Names:**

| Timezone | UTC Offset |
|----------|-----------|
| `Eastern Standard Time` | UTC-05:00 |
| `Central Standard Time` | UTC-06:00 |
| `Mountain Standard Time` | UTC-07:00 |
| `Pacific Standard Time` | UTC-08:00 |
| `UTC` | UTC+00:00 |
| `GMT Standard Time` | UTC+00:00 |

Full list: run `tzutil /l` on Windows.

---

## Recurrence Pattern Format

**Connector-level (simplified):** Use `recurrence` (`none`/`daily`/`weekly`/`monthly`/`yearly`), `selectedDaysOfWeek` (array of day names), `recurrenceEnd` (date), `numberOfOccurences` (integer — note the typo in the API).

**Graph API return format (PatternedRecurrence):**

```json
{
  "pattern": {
    "type": "weekly",
    "interval": 1,
    "daysOfWeek": ["monday", "wednesday", "friday"],
    "firstDayOfWeek": "sunday"
  },
  "range": {
    "type": "endDate",
    "startDate": "2026-03-10",
    "endDate": "2026-06-10",
    "recurrenceTimeZone": "Pacific Standard Time"
  }
}
```

**Pattern types:** `daily`, `weekly`, `absoluteMonthly`, `relativeMonthly`, `absoluteYearly`, `relativeYearly`
**Range types:** `endDate`, `noEnd`, `numbered`

---

## Throttling & Limits

| Limit | Value |
|-------|-------|
| API calls per connection | 300 calls / 60 seconds |
| Graph API timeout | 30 seconds |
| Outlook REST API timeout | 60 seconds |
| Max recipients per email (To+CC+BCC) | 500 (Exchange Online limit) |
| Max email size for triggers | 50 MB or Exchange Admin limit (whichever is less) |
| Max GetEmails results | 1000 per call |
| GetEmails client-side filter window | First 250 items in folder |
| Max inline image data URI | 1 MB |
| Trigger polling | Configurable (default varies by plan) |

---

## Known Issues & Gotchas

### Trigger Issues

1. **250-item filter window** — Trigger filters (To, CC, From, Importance, Subject, hasAttachment) apply against only the first 250 items in the folder. Use `searchQuery` on GetEmailsV3 to avoid this.
2. **Trigger delay** — Up to 1 hour delay in rare cases for all polling triggers.
3. **Attachment timeout** — `includeAttachments=true` can timeout when many emails arrive simultaneously.
4. **To OR CC, not both** — Only populate `to`/`cc` or `toOrCc` — not both at the same time.
5. **Encrypted emails** — Triggers skip encrypted/protected emails or return empty body.
6. **Dynamic Delivery (Safe Attachments)** — Can cause triggers to fire twice for the same email.
7. **Flagged email double-fire** — Flagged trigger also fires when a flagged email is modified (category change, reply, etc.).
8. **Folder move no re-trigger** — Moving emails between folders does not re-trigger; trigger uses received date.
9. **Webhook trigger deprecated** — `CreateOnNewEmailSubscription` is deprecated. Use polling triggers.

### Action Issues

10. **SendEmailV2 no message ID** — Does not return the sent message ID. If you need the ID, use DraftEmail + SendDraftMessage instead.
11. **Shared mailbox conversion** — Send from shared mailbox does not work for mailboxes converted from personal mailboxes.
12. **Reply V3 no encryption** — Cannot reply to encrypted emails.
13. **Digitally signed attachments** — Attachment content may be incorrect for digitally signed emails.
14. **Actionable messages** — Send approval / Send with options only work with single-user mailboxes, not group/shared.
15. **Move changes ID** — Moving an email changes its message ID. Downstream steps using the old ID will fail.

### Calendar Issues

16. **Update resets omitted fields** — `UpdateEvent_V4` resets ALL omitted fields to defaults. MUST retrieve event first and re-pass all values.
17. **Weekly recurrence days lost on update** — Updating without `selectedDaysOfWeek` reduces a Mon/Wed/Fri event to single day only.
18. **Update sends notifications** — ALL attendees receive meeting update emails. No way to suppress.
19. **Calendar View max 256** — `GetEventsCalendarViewV3` caps at 256 events per call. Use `$skip`/`$top` to paginate.
20. **Shared calendar 404** — Each user has unique calendar IDs. Use `CalendarGetTables_V2` to discover.
21. **Trigger fires twice on accept** — Accepting a meeting invite re-triggers "new event" because Outlook rewrites the event ID.
22. **Recurring event triggers** — Changing a 15-occurrence recurring event triggers the flow 15 times.
23. **Calendar View times must be UTC** — Do not pass local times to `startDateTimeUtc`/`endDateTimeUtc`.
24. **504 timeout ≠ failure** — Retries on 504 can cause duplicate events.

### Contact Issues

25. **Folder ID required** — All contact operations need a folder ID. Call `ContactGetTablesV2` first.
26. **homePhones required** — Schema marks `homePhones` as required even for create. Pass `[]` if none.
27. **Contact photo 4 MB limit** — `UpdateMyContactPhoto` fails for photos over 4 MB.

### General

28. **Graph API migration** — Microsoft is migrating from Outlook REST API to Graph API. Some operations may change.
29. **GccHigh/Mooncake** — GetMailTips_V2 not available in these environments.
30. **Connection not shareable** — Each user in a shared app must create their own connection.

---

## Quick Reference: operationId Cheat Sheet

### Current (Non-Deprecated) Email Operations

| What | operationId |
|------|-------------|
| **Triggers** | |
| New email arrives | `OnNewEmailV3` |
| New email in shared mailbox | `SharedMailboxOnNewEmailV2` |
| New email mentioning me | `OnNewMentionMeEmailV3` |
| Email flagged | `OnFlaggedEmailV3` |
| Email flagged (V4 preview) | `OnFlaggedEmailV4` |
| **Send** | |
| Send email | `SendEmailV2` |
| Send from shared mailbox | `SharedMailboxSendEmailV2` |
| Send approval email | `SendApprovalMail` |
| Send with options | `SendMailWithOptions` |
| **Get / List** | |
| Get emails (list) | `GetEmailsV3` |
| Get email (single) | `GetEmailV2` |
| **Reply / Forward** | |
| Reply to email | `ReplyToV3` |
| Forward email | `ForwardEmail_V2` |
| **Draft** | |
| Create draft | `DraftEmail` |
| Update draft | `UpdateDraftMessage` |
| Send draft | `SendDraftMessage` |
| **Organize** | |
| Move email | `MoveV2` |
| Delete email | `DeleteEmail_V2` |
| Flag email | `Flag_V2` |
| Mark read/unread | `MarkAsRead_V3` |
| Assign category | `AssignCategory` |
| Assign category (bulk) | `AssignCategoryBulk` |
| Get categories | `GetOutlookCategoryNames` |
| **Attachments** | |
| Get attachment | `GetAttachment_V2` |
| **Export** | |
| Export email (EML) | `ExportEmail_V2` |
| **Settings** | |
| Set auto-replies | `SetupAutoReplies_V2` |
| Get mail tips | `GetMailTips_V2` |
| **Advanced** | |
| HTTP request (Graph) | `SendHttpRequest` |

| **Calendar** | |
| Create event | `V4CalendarPostItem` |
| Get events (list) | `V4CalendarGetItems` |
| Get event (single) | `V3CalendarGetItem` |
| Update event | `UpdateEvent_V4` |
| Delete event | `CalendarDeleteItem_V2` |
| Get calendar view | `GetEventsCalendarViewV3` |
| Get calendars | `CalendarGetTables_V2` |
| Find meeting times | `FindMeetingTimes_V2` |
| Respond to invite | `RespondToEventInvite_V2` |
| **Contacts** | |
| Create contact | `ContactPostItem_V2` |
| Get contacts (list) | `ContactGetItems_V2` |
| Get contact (single) | `ContactGetItem_V2` |
| Update contact | `ContactPatchItem_V2` |
| Delete contact | `ContactDeleteItem_V2` |
| Get contact folders | `ContactGetTablesV2` |
| Update contact photo | `UpdateMyContactPhoto` |
| **Rooms** | |
| Get room lists | `GetRoomLists_V2` |
| Get rooms | `GetRooms_V2` |
| Get rooms in list | `GetRoomsInRoomList_V2` |

---

*Source: [Microsoft Learn — Office 365 Outlook Connector](https://learn.microsoft.com/en-us/connectors/office365/) | Cross-referenced with [carlosag.net PowerApps Connectors](https://www.carlosag.net/PowerApps/Connectors/Office-365-Outlook) | March 2026*
