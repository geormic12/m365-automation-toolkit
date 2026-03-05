/**
 * Copilot Studio Agent Solution Generator (v2)
 *
 * Generates a valid Dataverse solution .zip that can be imported via:
 *   Power Platform admin center > Solutions > Import
 *   OR: pac solution import --path <zipfile>
 *
 * Reverse-engineered from real Copilot Studio exports (Feb 2026).
 *
 * Usage:
 *   node generate-copilot-agent.js <agent-definition.json> [output-directory]
 *
 * The agent-definition.json schema:
 * {
 *   "name": "Agent Display Name",
 *   "schemaName": "camelCaseAgentName",          // optional, derived from name
 *   "description": "What the agent does",
 *   "instructions": "System prompt (multi-line)",
 *   "instructionsFile": "path/to/instructions.md", // alternative to inline
 *   "greeting": "Hello! How can I help?",
 *   "publisher": {
 *     "uniqueName": "DefaultPublisherorg60ae70f3",
 *     "displayName": "Default Publisher for org60ae70f3",
 *     "description": "Default publisher for this organization",
 *     "prefix": "cr449",
 *     "optionValuePrefix": 10000
 *   },
 *   "solution": {
 *     "uniqueName": "MySolution",
 *     "displayName": "My Solution",
 *     "version": "1.0.0.0"
 *   },
 *   "orchestration": "generative",       // "generative" or "classic"
 *   "connectors": {
 *     "shared_office365": {
 *       "displayName": "Office 365 Outlook",
 *       "operations": ["V4CalendarGetItems", "V4CalendarPostItem", ...]
 *     }
 *   },
 *   "topics": [ ... ],                    // optional custom topics
 *   "aiSettings": {
 *     "useModelKnowledge": true,
 *     "isFileAnalysisEnabled": true,
 *     "webBrowsing": true
 *   }
 * }
 *
 * Prerequisites:
 *   - Node.js 16+ (uses crypto.randomUUID)
 *   - PowerShell (for Compress-Archive on Windows)
 */

const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function newGuid() { return randomUUID(); }

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function escapeYamlString(str) {
  return String(str).replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

function yamlIndent(text, spaces) {
  const pad = ' '.repeat(spaces);
  return text.split('\n').map(line => pad + line).join('\n');
}

// ---------------------------------------------------------------------------
// Connector operation catalog — known operations with their full metadata
// Derived from real Copilot Studio exports
// ---------------------------------------------------------------------------
const CONNECTOR_CATALOG = {
  shared_office365: {
    connectorName: 'Office365Outlook',
    operations: {
      V4CalendarGetItems: {
        schemaName: 'GeteventsV4',
        displayName: 'Get events (V4)',
        description: 'This operation gets events from a calendar using Graph API. (V4) ',
        outputs: [
          { propertyName: 'value', name: 'value', description: 'List of calendar items hey List ' }
        ],
        outputMode: 'Specific'
      },
      V4CalendarPostItem: {
        schemaName: 'CreateeventV4',
        displayName: 'Create event (V4)',
        description: 'This operation creates a new event in a calendar.',
        outputs: [
          'body', 'categories', 'createdDateTime', 'end', 'endWithTimeZone',
          'iCalUId', 'id', 'importance', 'isAllDay', 'isHtml', 'isReminderOn',
          'lastModifiedDateTime', 'location', 'numberOfOccurences', 'optionalAttendees',
          'organizer', 'recurrence', 'recurrenceEnd', 'reminderMinutesBeforeStart',
          'requiredAttendees', 'resourceAttendees', 'responseRequested', 'responseTime',
          'responseType', 'sensitivity', 'seriesMasterId', 'showAs', 'start',
          'startWithTimeZone', 'subject', 'timeZone', 'webLink'
        ].map(p => ({ propertyName: p })),
        outputMode: 'All'
      },
      V4CalendarPatchItem: {
        schemaName: 'UpdateeventV4',
        displayName: 'Update event (V4)',
        description: 'This operation updates an event in a calendar using Graph API.',
        outputs: [
          'body', 'categories', 'createdDateTime', 'end', 'endWithTimeZone',
          'iCalUId', 'id', 'importance', 'isAllDay', 'isHtml', 'isReminderOn',
          'lastModifiedDateTime', 'location', 'numberOfOccurences', 'optionalAttendees',
          'organizer', 'recurrence', 'recurrenceEnd', 'reminderMinutesBeforeStart',
          'requiredAttendees', 'resourceAttendees', 'responseRequested', 'responseTime',
          'responseType', 'sensitivity', 'seriesMasterId', 'showAs', 'start',
          'startWithTimeZone', 'subject', 'timeZone', 'webLink'
        ].map(p => ({ propertyName: p })),
        outputMode: 'All'
      },
      GetEventsCalendarViewV3: {
        schemaName: 'GetcalendarviewofeventsV3',
        displayName: 'Get calendar view of events (V3)',
        description: 'This operation gets all events (including instances of recurrences) in a calendar using Graph API. Recurrence property is null in this case.',
        outputs: [{ propertyName: 'value' }],
        outputMode: 'All'
      },
      GetOutlookCategoryNames: {
        schemaName: 'GetOutlookcategorynames',
        displayName: 'Get Outlook category names',
        description: 'This operation gets Outlook category display names.',
        outputs: [{ propertyName: 'Response' }],
        outputMode: 'All'
      },
      CalendarDeleteItemV2: {
        schemaName: 'DeleteeventV2',
        displayName: 'Delete event (V2)',
        description: 'This operation deletes an event from a calendar.',
        outputs: [],
        outputMode: 'All'
      },
      FindMeetingTimes: {
        schemaName: 'FindMeetingTimes',
        displayName: 'Find meeting times',
        description: 'Find meeting times based on attendees, location, and time constraints.',
        outputs: [{ propertyName: 'value' }],
        outputMode: 'All'
      },
      SendEmailV2: {
        schemaName: 'SendEmailV2',
        displayName: 'Send an email (V2)',
        description: 'This operation sends an email message.',
        outputs: [],
        outputMode: 'All'
      },
      GetEmailsV3: {
        schemaName: 'GetEmailsV3',
        displayName: 'Get emails (V3)',
        description: 'This operation gets emails from a folder.',
        outputs: [{ propertyName: 'value' }],
        outputMode: 'All'
      }
    }
  },
  shared_sharepointonline: {
    connectorName: 'SharePointOnline',
    operations: {
      GetItems: {
        schemaName: 'GetItems',
        displayName: 'Get items',
        description: 'Gets items from a SharePoint list.',
        outputs: [{ propertyName: 'value' }],
        outputMode: 'All'
      },
      PostItem: {
        schemaName: 'PostItem',
        displayName: 'Create item',
        description: 'Creates a new item in a SharePoint list.',
        outputs: [{ propertyName: 'ID' }],
        outputMode: 'All'
      }
    }
  },
  shared_teams: {
    connectorName: 'MicrosoftTeams',
    operations: {
      PostMessageToConversation: {
        schemaName: 'PostMessageToConversation',
        displayName: 'Post message in a chat or channel',
        description: 'Post a message to a Teams chat or channel.',
        outputs: [{ propertyName: 'id' }],
        outputMode: 'All'
      }
    }
  },
  shared_office365users: {
    connectorName: 'Office365Users',
    operations: {
      SearchUserV2: {
        schemaName: 'SearchforusersV2',
        displayName: 'Search for users (V2)',
        description: 'Retrieves the user profiles that match the search term. Searches display name, given name, surname, mail, and user principal name.',
        outputs: [{ propertyName: 'value' }],
        outputMode: 'All'
      },
      UserProfile_V2: {
        schemaName: 'GetuserprofileV2',
        displayName: 'Get user profile (V2)',
        description: 'Retrieves the profile of a specific user.',
        outputs: [
          'aboutMe', 'accountEnabled', 'businessPhones', 'city', 'companyName',
          'country', 'department', 'displayName', 'givenName', 'id', 'jobTitle',
          'mail', 'mailNickname', 'mobilePhone', 'officeLocation', 'postalCode',
          'surname', 'userPrincipalName', 'userType'
        ].map(p => ({ propertyName: p })),
        outputMode: 'All'
      },
      MyProfile_V2: {
        schemaName: 'GetmyprofileV2',
        displayName: 'Get my profile (V2)',
        description: 'Retrieves the profile of the current user.',
        outputs: [
          'aboutMe', 'accountEnabled', 'businessPhones', 'city', 'companyName',
          'country', 'department', 'displayName', 'givenName', 'id', 'jobTitle',
          'mail', 'mailNickname', 'mobilePhone', 'officeLocation', 'postalCode',
          'surname', 'userPrincipalName', 'userType'
        ].map(p => ({ propertyName: p })),
        outputMode: 'All'
      }
    }
  }
};

// ---------------------------------------------------------------------------
// System topic templates — exact YAML from real Copilot Studio exports
// The {botSchemaName} placeholder gets replaced at generation time
// ---------------------------------------------------------------------------
function getSystemTopics(botSchemaName) {
  return [
    {
      schemaName: `${botSchemaName}.topic.ConversationStart`,
      name: 'Conversation Start',
      description: 'This system topic triggers when the agent receives an Activity indicating the beginning of a new conversation. If you do not want the agent to initiate the conversation, disable this topic.',
      // data is set dynamically with the greeting
      dataYaml: null
    },
    {
      schemaName: `${botSchemaName}.topic.EndofConversation`,
      name: 'End of Conversation',
      description: 'This system topic is only triggered by a redirect action,\nand guides the user through rating their conversation with the agent.',
      dataYaml: `kind: AdaptiveDialog
startBehavior: CancelOtherTopics
beginDialog:
  kind: OnSystemRedirect
  id: main
  actions:
    - kind: Question
      id: ${newGuid().slice(0, 8)}
      conversationOutcome: ResolvedImplied
      alwaysPrompt: true
      variable: init:Topic.SurveyResponse
      prompt: Did that answer your question?
      entity: BooleanPrebuiltEntity

    - kind: ConditionGroup
      id: condition-0
      conditions:
        - id: condition-0-item-0
          condition: =Topic.SurveyResponse = true
          actions:
            - kind: CSATQuestion
              id: csat_1
              conversationOutcome: ResolvedConfirmed

            - kind: SendActivity
              id: sendMessage_${newGuid().slice(0, 6)}
              activity: Thanks for your feedback.

            - kind: Question
              id: question_1
              alwaysPrompt: true
              variable: init:Topic.Continue
              prompt: Can I help with anything else?
              entity: BooleanPrebuiltEntity

            - kind: ConditionGroup
              id: condition-1
              conditions:
                - id: condition-1-item-0
                  condition: =Topic.Continue = true
                  actions:
                    - kind: SendActivity
                      id: sendMessage_${newGuid().slice(0, 6)}
                      activity: Go ahead. I'm listening.

              elseActions:
                - kind: SendActivity
                  id: ${newGuid().slice(0, 6)}
                  activity: Ok, goodbye.

                - kind: EndConversation
                  id: ${newGuid().slice(0, 6)}

      elseActions:
        - kind: Question
          id: ${newGuid().slice(0, 6)}
          alwaysPrompt: true
          variable: init:Topic.TryAgain
          prompt: Sorry I wasn't able to help better. Would you like to try again?
          entity: BooleanPrebuiltEntity

        - kind: ConditionGroup
          id: ${newGuid().slice(0, 6)}
          conditions:
            - id: ${newGuid().slice(0, 6)}
              condition: =Topic.TryAgain = false
              actions:
                - kind: BeginDialog
                  id: ${newGuid().slice(0, 6)}
                  dialog: ${botSchemaName}.topic.Escalate

          elseActions:
            - kind: SendActivity
              id: ${newGuid().slice(0, 6)}
              activity: Go ahead. I'm listening.`
    },
    {
      schemaName: `${botSchemaName}.topic.Escalate`,
      name: 'Escalate',
      description: 'This system topic is triggered when the user indicates they would like to speak to a representative.\nYou can configure how the agent will handle human hand-off scenarios in the agent settings..\nIf your agent does not handle escalations, this topic should be disabled.',
      dataYaml: `kind: AdaptiveDialog
startBehavior: CancelOtherTopics
beginDialog:
  kind: OnEscalate
  id: main
  intent:
    displayName: Escalate
    includeInOnSelectIntent: false
    triggerQueries:
      - Talk to agent
      - Talk to a person
      - Talk to someone
      - Call back
      - Call customer service
      - Call me please
      - Call support
      - Call technical support
      - Can an agent call me
      - Can I call
      - Can I get in touch with someone else
      - Can I get real agent support
      - Can I get transferred to a person to call
      - Can I have a call in number Or can I be called
      - Can I have a representative call me
      - Can I schedule a call
      - Can I speak to a representative
      - Can I talk to a human
      - Can I talk to a human assistant
      - Can someone call me
      - Chat with a human
      - Chat with a representative
      - Chat with agent
      - Chat with someone please
      - Connect me to a live agent
      - Connect me to a person
      - Could some one contact me by phone
      - Customer agent
      - Customer representative
      - Customer service
      - I need a manager to contact me
      - I need customer service
      - I need help from a person
      - I need to speak with a live argent
      - I need to talk to a specialist please
      - I want to talk to customer service
      - I want to proceed with live support
      - I want to speak with a consultant
      - I want to speak with a live tech
      - I would like to speak with an associate
      - I would like to talk to a technician
      - Talk with tech support member

  actions:
    - kind: SendActivity
      id: sendMessage_${newGuid().slice(0, 6)}
      conversationOutcome: Escalated
      activity: |-
        Escalating to a representative is not currently configured for this agent, however this is where the agent could provide information about how to get in touch with someone another way.

        Is there anything else I can help you with?`
    },
    {
      schemaName: `${botSchemaName}.topic.Fallback`,
      name: 'Fallback',
      description: 'This system topic triggers when the user\'s utterance does not match any existing topics.',
      dataYaml: `kind: AdaptiveDialog
beginDialog:
  kind: OnUnknownIntent
  id: main
  actions:
    - kind: ConditionGroup
      id: conditionGroup_${newGuid().slice(0, 6)}
      conditions:
        - id: conditionItem_${newGuid().slice(0, 6)}
          condition: =System.FallbackCount < 3
          actions:
            - kind: SendActivity
              id: sendMessage_${newGuid().slice(0, 6)}
              activity: I'm sorry, I'm not sure how to help with that. Can you try rephrasing?

      elseActions:
        - kind: BeginDialog
          id: ${newGuid().slice(0, 6)}
          dialog: ${botSchemaName}.topic.Escalate`
    },
    {
      schemaName: `${botSchemaName}.topic.Goodbye`,
      name: 'Goodbye',
      description: 'This topic triggers when the user says goodbye. By default, it does not end the conversation. If you would like to end the conversation when the user says goodbye, you can add an "End of Conversation" action to this topic, or redirect to the "End of Conversation" system topic.',
      dataYaml: `kind: AdaptiveDialog
startBehavior: CancelOtherTopics
beginDialog:
  kind: OnRecognizedIntent
  id: main
  intent:
    displayName: Goodbye
    includeInOnSelectIntent: false
    triggerQueries:
      - Bye
      - Bye for now
      - Bye now
      - Good bye
      - No thank you. Goodbye.
      - See you later

  actions:
    - kind: Question
      id: question_${newGuid().slice(0, 6)}
      variable: Topic.EndConversation
      prompt: Would you like to end our conversation?
      entity: BooleanPrebuiltEntity

    - kind: ConditionGroup
      id: condition_${newGuid().slice(0, 6)}
      conditions:
        - id: condition_${newGuid().slice(0, 6)}-item-0
          condition: =Topic.EndConversation = true
          actions:
            - kind: BeginDialog
              id: ${newGuid().slice(0, 6)}
              dialog: ${botSchemaName}.topic.EndofConversation

        - id: condition_${newGuid().slice(0, 6)}-item-1
          condition: =Topic.EndConversation = false
          actions:
            - kind: SendActivity
              id: sendMessage_${newGuid().slice(0, 6)}
              activity: Go ahead. I'm listening.`
    },
    {
      schemaName: `${botSchemaName}.topic.Greeting`,
      name: 'Greeting',
      description: 'This topic is triggered when the user greets the agent.',
      dataYaml: `kind: AdaptiveDialog
beginDialog:
  kind: OnRecognizedIntent
  id: main
  intent:
    displayName: Greeting
    includeInOnSelectIntent: false
    triggerQueries:
      - Good afternoon
      - Good morning
      - Hello
      - Hey
      - Hi

  actions:
    - kind: SendActivity
      id: sendMessage_${newGuid().slice(0, 6)}
      activity:
        text:
          - Hello, how can I help you today?
        speak:
          - Hello, <break strength="medium" /> how can I help?

    - kind: CancelAllDialogs
      id: cancelAllDialogs_${newGuid().slice(0, 6)}`
    },
    {
      schemaName: `${botSchemaName}.topic.MultipleTopicsMatched`,
      name: 'Multiple Topics Matched',
      description: 'This system topic triggers when the agent matches multiple Topics with the incoming message and needs to clarify which one should be triggered.',
      dataYaml: `kind: AdaptiveDialog
beginDialog:
  kind: OnSelectIntent
  id: main
  triggerBehavior: Always
  actions:
    - kind: SetVariable
      id: setVariable_${newGuid().slice(0, 6)}
      variable: init:Topic.IntentOptions
      value: =System.Recognizer.IntentOptions

    - kind: SetTextVariable
      id: setTextVariable_0
      variable: Topic.NoneOfTheseDisplayName
      value: None of these

    - kind: EditTable
      id: sendMessage_${newGuid().slice(0, 6)}
      changeType: Add
      itemsVariable: Topic.IntentOptions
      value: "={ DisplayName: Topic.NoneOfTheseDisplayName, TopicId: \\"NoTopic\\", TriggerId: \\"NoTrigger\\", Score: 1.0 }"

    - kind: Question
      id: question_${newGuid().slice(0, 6)}
      interruptionPolicy:
        allowInterruption: false

      alwaysPrompt: true
      variable: System.Recognizer.SelectedIntent
      prompt: "To clarify, did you mean:"
      entity:
        kind: DynamicClosedListEntity
        items: =Topic.IntentOptions

    - kind: ConditionGroup
      id: conditionGroup_${newGuid().slice(0, 6)}
      conditions:
        - id: conditionItem_${newGuid().slice(0, 6)}
          condition: =System.Recognizer.SelectedIntent.TopicId = "NoTopic"
          actions:
            - kind: ReplaceDialog
              id: ${newGuid().slice(0, 6)}
              dialog: ${botSchemaName}.topic.Fallback`
    },
    {
      schemaName: `${botSchemaName}.topic.OnError`,
      name: 'On Error',
      description: 'This system topic triggers when the agent encounters an error. When using the test chat pane, the full error description is displayed.',
      dataYaml: `kind: AdaptiveDialog
startBehavior: UseLatestPublishedContentAndCancelOtherTopics
beginDialog:
  kind: OnError
  id: main
  actions:
    - kind: SetVariable
      id: setVariable_timestamp
      variable: init:Topic.CurrentTime
      value: =Text(Now(), DateTimeFormat.UTC)

    - kind: ConditionGroup
      id: condition_1
      conditions:
        - id: ${newGuid().slice(0, 6)}
          condition: =System.Conversation.InTestMode = true
          actions:
            - kind: SendActivity
              id: sendMessage_${newGuid().slice(0, 6)}
              activity: |-
                Error Message: {System.Error.Message}
                Error Code: {System.Error.Code}
                Conversation Id: {System.Conversation.Id}
                Time (UTC): {Topic.CurrentTime}

      elseActions:
        - kind: SendActivity
          id: sendMessage_${newGuid().slice(0, 6)}
          activity:
            text:
              - |-
                An error has occurred.
                Error code: {System.Error.Code}
                Conversation Id: {System.Conversation.Id}
                Time (UTC): {Topic.CurrentTime}.
            speak:
              - An error has occurred, please try again.

    - kind: LogCustomTelemetryEvent
      id: ${newGuid().slice(0, 6)}
      eventName: OnErrorLog
      properties: "={ErrorMessage: System.Error.Message, ErrorCode: System.Error.Code, TimeUTC: Topic.CurrentTime, ConversationId: System.Conversation.Id}"

    - kind: CancelAllDialogs
      id: ${newGuid().slice(0, 6)}`
    },
    {
      schemaName: `${botSchemaName}.topic.ResetConversation`,
      name: 'Reset Conversation',
      description: '',
      dataYaml: `kind: AdaptiveDialog
startBehavior: UseLatestPublishedContentAndCancelOtherTopics
beginDialog:
  kind: OnSystemRedirect
  id: main
  actions:
    - kind: SendActivity
      id: sendMessage_${newGuid().slice(0, 6)}
      activity: What can I help you with?

    - kind: ClearAllVariables
      id: clearAllVariables_${newGuid().slice(0, 6)}
      variables: ConversationScopedVariables

    - kind: CancelAllDialogs
      id: cancelAllDialogs_${newGuid().slice(0, 6)}`
    },
    {
      schemaName: `${botSchemaName}.topic.Search`,
      name: 'Conversational boosting',
      description: 'Create generative answers from knowledge sources.',
      dataYaml: `kind: AdaptiveDialog
beginDialog:
  kind: OnUnknownIntent
  id: main
  priority: -1
  actions:
    - kind: SearchAndSummarizeContent
      id: search-content
      variable: Topic.Answer
      userInput: =System.Activity.Text

    - kind: ConditionGroup
      id: has-answer-conditions
      conditions:
        - id: has-answer
          condition: =!IsBlank(Topic.Answer)
          actions:
            - kind: EndDialog
              id: end-topic
              clearTopicQueue: true`
    },
    {
      schemaName: `${botSchemaName}.topic.Signin`,
      name: 'Sign in ',
      description: 'This system topic triggers when the agent needs to sign in the user or require the user to sign in',
      dataYaml: `kind: AdaptiveDialog
beginDialog:
  kind: OnSignIn
  id: main
  actions:
    - kind: ConditionGroup
      id: conditionGroup_${newGuid().slice(0, 6)}
      conditions:
        - id: conditionItem_${newGuid().slice(0, 6)}
          condition: =System.SignInReason = SignInReason.SignInRequired
          actions:
            - kind: SendActivity
              id: sendMessage_${newGuid().slice(0, 6)}
              activity: Hello! To be able to help you, I'll need you to sign in.

    - kind: OAuthInput
      id: ${newGuid().slice(0, 6)}
      title: Login
      text: To continue, please login`
    },
    {
      schemaName: `${botSchemaName}.topic.StartOver`,
      name: 'Start Over',
      description: '',
      dataYaml: `kind: AdaptiveDialog
beginDialog:
  kind: OnRecognizedIntent
  id: main
  intent:
    displayName: Start Over
    includeInOnSelectIntent: false
    triggerQueries:
      - let's begin again
      - start over
      - start again
      - restart

  actions:
    - kind: Question
      id: question_${newGuid().slice(0, 6)}
      alwaysPrompt: false
      variable: init:Topic.Confirm
      prompt: Are you sure you want to restart the conversation?
      entity: BooleanPrebuiltEntity

    - kind: ConditionGroup
      id: conditionGroup_${newGuid().slice(0, 6)}
      conditions:
        - id: conditionItem_${newGuid().slice(0, 6)}
          condition: =Topic.Confirm = true
          actions:
            - kind: BeginDialog
              id: ${newGuid().slice(0, 6)}
              dialog: ${botSchemaName}.topic.ResetConversation

      elseActions:
        - kind: SendActivity
          id: sendMessage_${newGuid().slice(0, 6)}
          activity: Ok. Let's carry on.`
    },
    {
      schemaName: `${botSchemaName}.topic.ThankYou`,
      name: 'Thank you',
      description: 'This topic triggers when the user says thank you.',
      dataYaml: `kind: AdaptiveDialog
beginDialog:
  kind: OnRecognizedIntent
  id: main
  intent:
    displayName: Thank you
    includeInOnSelectIntent: false
    triggerQueries:
      - thanks
      - thank you
      - thanks so much
      - ty

  actions:
    - kind: SendActivity
      id: sendMessage_${newGuid().slice(0, 6)}
      activity: You're welcome.`
    }
  ];
}

// ---------------------------------------------------------------------------
// Build solution files from agent definition
// ---------------------------------------------------------------------------
function buildAgent(agentDef) {
  // --- Resolve instructions ---
  let instructions = agentDef.instructions || '';
  if (!instructions && agentDef.instructionsFile) {
    // Resolve relative to the definition file's directory, not cwd
    const baseDir = agentDef._defPath ? path.dirname(agentDef._defPath) : process.cwd();
    const instrPath = path.resolve(baseDir, agentDef.instructionsFile);
    if (fs.existsSync(instrPath)) {
      instructions = fs.readFileSync(instrPath, 'utf8');
      instructions = instructions.replace(/^#\s+.*?\n+/, '');
    } else {
      console.warn(`Warning: instructionsFile not found: ${instrPath}`);
    }
  }

  // --- Naming ---
  const prefix = agentDef.publisher?.prefix || 'cr123';
  const schemaName = agentDef.schemaName ||
    agentDef.name.replace(/[^a-zA-Z0-9]/g, '');
  const botSchemaName = `${prefix}_${schemaName}`;

  const solutionUniqueName = agentDef.solution?.uniqueName ||
    agentDef.name.replace(/[^a-zA-Z0-9]/g, '') + 'Solution';
  const solutionDisplayName = agentDef.solution?.displayName || agentDef.name;
  const solutionVersion = agentDef.solution?.version || '1.0.0.0';

  const publisherUniqueName = agentDef.publisher?.uniqueName || 'DefaultPublisher';
  const publisherDisplayName = agentDef.publisher?.displayName || 'Default Publisher';
  const publisherDescription = agentDef.publisher?.description || '';
  const publisherPrefix = prefix;
  const publisherOptionValuePrefix = agentDef.publisher?.optionValuePrefix || 10000;

  const isGenerative = (agentDef.orchestration || 'generative') === 'generative';
  const greeting = agentDef.greeting || `Hello, I'm {System.Bot.Name}. How can I help?`;
  const webBrowsing = agentDef.aiSettings?.webBrowsing !== false;

  // --- Connector / Connection References ---
  const connectors = agentDef.connectors || {};
  const connectorNames = Object.keys(connectors);
  const connectionRefs = {};
  connectorNames.forEach(name => {
    // Real format: {botSchemaName}.{connectorName}.{connectorName}-{GUID}
    const guid = newGuid();
    const logicalName = `${botSchemaName}.${name}.${name}-${guid}`;
    connectionRefs[name] = {
      logicalName,
      displayName: logicalName, // Real export uses logicalName as displayName
      connectorId: `/providers/Microsoft.PowerApps/apis/${name}`
    };
  });

  // --- Collect all bot components ---
  const components = [];

  // 1. GPT Instructions (componenttype=15)
  const gptSchemaName = `${botSchemaName}.gpt.default`;
  let gptDataYaml = `kind: GptComponentMetadata\ninstructions: |-\n${yamlIndent(instructions, 2)}`;
  if (webBrowsing) {
    gptDataYaml += '\ngptCapabilities:\n  webBrowsing: true';
  }

  components.push({
    schemaName: gptSchemaName,
    name: agentDef.name,
    componentType: 15,
    description: agentDef.description || '',
    dataYaml: gptDataYaml
  });

  // 2. System topics (all 13 from real export)
  const systemTopics = getSystemTopics(botSchemaName);

  // Set ConversationStart greeting dynamically
  systemTopics[0].dataYaml = `kind: AdaptiveDialog
beginDialog:
  kind: OnConversationStart
  id: main
  actions:
    - kind: SendActivity
      id: sendMessage_${newGuid().slice(0, 6)}
      activity:
        text:
          - ${greeting}
        speak:
          - Hello and thank you for calling {System.Bot.Name}. Please note that some responses are generated by AI and may require verification for accuracy. How may I help you today?`;

  systemTopics.forEach(topic => {
    components.push({
      schemaName: topic.schemaName,
      name: topic.name,
      componentType: 9,
      description: topic.description,
      dataYaml: topic.dataYaml
    });
  });

  // 3. Connector action components (componenttype=9 with .action. prefix)
  const actionComponents = [];
  connectorNames.forEach(connName => {
    const connDef = connectors[connName];
    const catalog = CONNECTOR_CATALOG[connName];
    const operations = connDef.operations || [];
    const connectorDisplayName = catalog?.connectorName || connDef.displayName || connName;

    operations.forEach(opId => {
      const opCatalog = catalog?.operations?.[opId];
      if (!opCatalog) {
        console.warn(`Warning: Operation ${opId} not found in catalog for ${connName}. Skipping.`);
        return;
      }

      const actionSchemaName = `${botSchemaName}.action.${connectorDisplayName}-${opCatalog.schemaName}`;

      // Build TaskDialog YAML
      let yaml = 'kind: TaskDialog\n';
      yaml += `modelDisplayName: ${opCatalog.displayName}\n`;
      yaml += `modelDescription: "${escapeYamlString(opCatalog.description)}"\n`;

      // Outputs
      if (opCatalog.outputs && opCatalog.outputs.length > 0) {
        yaml += 'outputs:\n';
        opCatalog.outputs.forEach(out => {
          yaml += `  - propertyName: ${out.propertyName}`;
          if (out.name) yaml += `\n    name: ${out.name}`;
          if (out.description) yaml += `\n    description: "${escapeYamlString(out.description)}"`;
          yaml += '\n';
        });
      }

      yaml += '\naction:\n';
      yaml += '  kind: InvokeConnectorTaskAction\n';
      yaml += `  connectionReference: ${connectionRefs[connName].logicalName}\n`;
      yaml += '  connectionProperties:\n';
      yaml += '    mode: Invoker\n';
      yaml += `  operationId: ${opId}\n`;
      yaml += `\noutputMode: ${opCatalog.outputMode || 'All'}`;

      components.push({
        schemaName: actionSchemaName,
        name: `${connDef.displayName || connectorDisplayName} - ${opCatalog.displayName}`,
        componentType: 9,
        description: '',
        dataYaml: yaml
      });

      actionComponents.push({
        schemaName: actionSchemaName,
        connectorName: connName
      });
    });
  });

  // 4. Custom topics from definition
  if (agentDef.topics) {
    agentDef.topics.forEach(topic => {
      const topicSchemaName = `${botSchemaName}.topic.${topic.schemaName || topic.name.replace(/[^a-zA-Z0-9]/g, '')}`;
      components.push({
        schemaName: topicSchemaName,
        name: topic.name,
        componentType: 9,
        description: topic.description || '',
        dataYaml: topic.yaml || buildTopicYaml(topic, botSchemaName)
      });
    });
  }

  // =========================================================================
  // FILE GENERATION
  // =========================================================================

  const files = [];

  // --- [Content_Types].xml ---
  // Real export puts all overrides on a single line; we match the format
  let overrides = components.map(c =>
    `<Override PartName="/botcomponents/${c.schemaName}/data" ContentType="application/octet-stream" />`
  ).join('');

  files.push({
    path: '[Content_Types].xml',
    content: `<?xml version="1.0" encoding="utf-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/octet-stream" /><Default Extension="json" ContentType="application/octet-stream" />${overrides}</Types>`
  });

  // --- solution.xml ---
  // Real export: RootComponents is EMPTY, verbose Address blocks with xsi:nil
  const nilField = (tag) => `          <${tag} xsi:nil="true"></${tag}>`;
  const addressFields = [
    'AddressTypeCode', 'City', 'County', 'Country', 'Fax',
    'FreightTermsCode', 'ImportSequenceNumber', 'Latitude',
    'Line1', 'Line2', 'Line3', 'Longitude', 'Name',
    'PostalCode', 'PostOfficeBox', 'PrimaryContactName',
    'ShippingMethodCode', 'StateOrProvince',
    'Telephone1', 'Telephone2', 'Telephone3',
    'TimeZoneRuleVersionNumber', 'UPSZone', 'UTCOffset',
    'UTCConversionTimeZoneCode'
  ].map(nilField).join('\n');

  const addressBlock = (num) => `        <Address>\n          <AddressNumber>${num}</AddressNumber>\n${addressFields}\n        </Address>`;

  files.push({
    path: 'solution.xml',
    content: [
      `<ImportExportXml version="9.2.0.0" SolutionPackageVersion="9.2" languagecode="1033" generatedBy="CrmLive" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">`,
      '  <SolutionManifest>',
      `    <UniqueName>${escapeXml(solutionUniqueName)}</UniqueName>`,
      '    <LocalizedNames>',
      `      <LocalizedName description="${escapeXml(solutionDisplayName)}" languagecode="1033" />`,
      '    </LocalizedNames>',
      '    <Descriptions />',
      `    <Version>${solutionVersion}</Version>`,
      '    <Managed>0</Managed>',
      '    <Publisher>',
      `      <UniqueName>${escapeXml(publisherUniqueName)}</UniqueName>`,
      '      <LocalizedNames>',
      `        <LocalizedName description="${escapeXml(publisherDisplayName)}" languagecode="1033" />`,
      '      </LocalizedNames>',
      '      <Descriptions>',
      `        <Description description="${escapeXml(publisherDescription)}" languagecode="1033" />`,
      '      </Descriptions>',
      '      <EMailAddress xsi:nil="true"></EMailAddress>',
      '      <SupportingWebsiteUrl xsi:nil="true"></SupportingWebsiteUrl>',
      `      <CustomizationPrefix>${publisherPrefix}</CustomizationPrefix>`,
      `      <CustomizationOptionValuePrefix>${publisherOptionValuePrefix}</CustomizationOptionValuePrefix>`,
      '      <Addresses>',
      addressBlock(1),
      addressBlock(2),
      '      </Addresses>',
      '    </Publisher>',
      '    <RootComponents />',
      '    <MissingDependencies />',
      '  </SolutionManifest>',
      '</ImportExportXml>'
    ].join('\n')
  });

  // --- customizations.xml ---
  let connRefXml = '';
  if (connectorNames.length > 0) {
    const refs = connectorNames.map(name => {
      const ref = connectionRefs[name];
      return [
        `    <connectionreference connectionreferencelogicalname="${escapeXml(ref.logicalName)}">`,
        `      <connectionreferencedisplayname>${escapeXml(ref.displayName)}</connectionreferencedisplayname>`,
        `      <connectorid>${escapeXml(ref.connectorId)}</connectorid>`,
        '      <iscustomizable>0</iscustomizable>',
        '      <promptingbehavior>0</promptingbehavior>',
        '      <statecode>0</statecode>',
        '      <statuscode>1</statuscode>',
        '    </connectionreference>'
      ].join('\n');
    }).join('\n');
    connRefXml = `  <connectionreferences>\n${refs}\n  </connectionreferences>`;
  } else {
    connRefXml = '  <connectionreferences />';
  }

  files.push({
    path: 'customizations.xml',
    content: [
      '<ImportExportXml xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">',
      '  <Entities></Entities>',
      '  <Roles></Roles>',
      '  <Workflows></Workflows>',
      '  <FieldSecurityProfiles></FieldSecurityProfiles>',
      '  <Templates />',
      '  <EntityMaps />',
      '  <EntityRelationships />',
      '  <OrganizationSettings />',
      '  <optionsets />',
      '  <CustomControls />',
      '  <EntityDataProviders />',
      connRefXml,
      '  <Languages>',
      '    <Language>1033</Language>',
      '  </Languages>',
      '</ImportExportXml>'
    ].join('\n')
  });

  // --- bots/{botSchemaName}/bot.xml ---
  // Real export does NOT include <description>, DOES include timezoneruleversionnumber
  files.push({
    path: `bots/${botSchemaName}/bot.xml`,
    content: [
      `<bot schemaname="${escapeXml(botSchemaName)}">`,
      '  <authenticationmode>2</authenticationmode>',
      '  <authenticationtrigger>1</authenticationtrigger>',
      '  <iscustomizable>0</iscustomizable>',
      '  <language>1033</language>',
      `  <name>${escapeXml(agentDef.name)}</name>`,
      '  <runtimeprovider>0</runtimeprovider>',
      '  <template>default-2.1.0</template>',
      '  <timezoneruleversionnumber>4</timezoneruleversionnumber>',
      '</bot>'
    ].join('\n')
  });

  // --- bots/{botSchemaName}/configuration.json ---
  const configuration = {
    "$kind": "BotConfiguration",
    "settings": {
      "GenerativeActionsEnabled": isGenerative
    },
    "isAgentConnectable": true,
    "gPTSettings": {
      "$kind": "GPTSettings",
      "defaultSchemaName": gptSchemaName
    },
    "aISettings": {
      "$kind": "AISettings",
      "useModelKnowledge": agentDef.aiSettings?.useModelKnowledge !== false,
      "isFileAnalysisEnabled": agentDef.aiSettings?.isFileAnalysisEnabled !== false,
      "isSemanticSearchEnabled": true,
      "optInUseLatestModels": false
    },
    "recognizer": {
      "$kind": isGenerative ? "GenerativeAIRecognizer" : "PatternRecognizer"
    }
  };

  files.push({
    path: `bots/${botSchemaName}/configuration.json`,
    content: JSON.stringify(configuration, null, 2) + '\n'
  });

  // --- botcomponents/ (one folder per component) ---
  components.forEach(comp => {
    // botcomponent.xml
    const descLine = comp.description
      ? `  <description>${escapeXml(comp.description)}</description>\n`
      : '';
    files.push({
      path: `botcomponents/${comp.schemaName}/botcomponent.xml`,
      content: [
        `<botcomponent schemaname="${escapeXml(comp.schemaName)}">`,
        `  <componenttype>${comp.componentType}</componenttype>`,
        descLine ? descLine.trimEnd() : null,
        '  <iscustomizable>0</iscustomizable>',
        `  <name>${escapeXml(comp.name)}</name>`,
        '  <parentbotid>',
        `    <schemaname>${escapeXml(botSchemaName)}</schemaname>`,
        '  </parentbotid>',
        '  <statecode>0</statecode>',
        '  <statuscode>1</statuscode>',
        '</botcomponent>'
      ].filter(l => l !== null).join('\n')
    });

    // data (YAML, no file extension!)
    files.push({
      path: `botcomponents/${comp.schemaName}/data`,
      content: comp.dataYaml
    });
  });

  // --- Assets/botcomponent_connectionreferenceset.xml ---
  // Real export: links ACTION components (not GPT) to connection references
  if (actionComponents.length > 0) {
    const links = actionComponents.map(ac => {
      const ref = connectionRefs[ac.connectorName];
      return [
        `  <botcomponent_connectionreference botcomponentid.schemaname="${escapeXml(ac.schemaName)}" connectionreferenceid.connectionreferencelogicalname="${escapeXml(ref.logicalName)}">`,
        '    <iscustomizable>1</iscustomizable>',
        '  </botcomponent_connectionreference>'
      ].join('\n');
    }).join('\n');

    files.push({
      path: 'Assets/botcomponent_connectionreferenceset.xml',
      content: [
        '<botcomponent_connectionreferenceset>',
        links,
        '</botcomponent_connectionreferenceset>'
      ].join('\n')
    });
  }

  return { botSchemaName, solutionUniqueName, files };
}

// ---------------------------------------------------------------------------
// Build topic YAML from a simple topic definition
// ---------------------------------------------------------------------------
function buildTopicYaml(topic, botSchemaName) {
  const triggerKind = topic.trigger || 'OnRecognizedIntent';
  const lines = [
    'kind: AdaptiveDialog',
    'beginDialog:',
    `  kind: ${triggerKind}`,
    '  id: main',
  ];

  if (triggerKind === 'OnRecognizedIntent' && topic.triggerPhrases) {
    lines.push('  intent:');
    lines.push(`    displayName: ${topic.name}`);
    lines.push('    includeInOnSelectIntent: false');
    lines.push('    triggerQueries:');
    topic.triggerPhrases.forEach(phrase => {
      lines.push(`      - ${phrase}`);
    });
  }

  lines.push('  actions:');

  if (topic.actions) {
    topic.actions.forEach(action => {
      if (action.kind === 'SendActivity') {
        lines.push('    - kind: SendActivity');
        lines.push(`      id: sendMessage_${newGuid().slice(0, 6)}`);
        if (action.text.includes('\n')) {
          lines.push('      activity: |-');
          action.text.split('\n').forEach(l => lines.push(`        ${l}`));
        } else {
          lines.push(`      activity: ${action.text}`);
        }
      } else if (action.kind === 'Question') {
        lines.push('    - kind: Question');
        lines.push(`      id: question_${newGuid().slice(0, 6)}`);
        lines.push(`      variable: init:Topic.${action.variable || 'UserInput'}`);
        lines.push(`      prompt: ${action.prompt}`);
        lines.push(`      entity: ${action.entity || 'StringPrebuiltEntity'}`);
      } else if (action.kind === 'BeginDialog') {
        lines.push('    - kind: BeginDialog');
        lines.push(`      id: ${newGuid().slice(0, 6)}`);
        lines.push(`      dialog: ${botSchemaName}.topic.${action.dialog}`);
      }
    });
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Write solution to disk and create .zip
// ---------------------------------------------------------------------------
async function createSolutionZip(agentDef, outputDirArg) {
  const result = buildAgent(agentDef);
  const outputDir = path.resolve(outputDirArg || path.join('output', 'copilot-agents'));
  const solutionBase = result.solutionUniqueName;

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Auto-increment version based on existing zips in the output directory
  let version = agentDef.solution?.version || '1.0.0.0';
  const existingZips = fs.readdirSync(outputDir)
    .filter(f => f.startsWith(solutionBase + '_') && f.endsWith('.zip'))
    .sort();
  if (existingZips.length > 0) {
    const lastZip = existingZips[existingZips.length - 1];
    const versionMatch = lastZip.replace(solutionBase + '_', '').replace('.zip', '');
    const parts = versionMatch.split('_').map(Number);
    if (parts.length === 4 && parts.every(n => !isNaN(n))) {
      parts[3] += 1;
      version = parts.join('.');
    }
  }

  // Apply resolved version back to the solution XML
  if (!agentDef.solution) agentDef.solution = {};
  agentDef.solution.version = version;

  // Re-build with updated version
  const versionedResult = buildAgent(agentDef);
  const tempDir = path.join(outputDir, '_temp_solution');

  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true });
  }

  // Create directory structure and write files
  versionedResult.files.forEach(file => {
    const filePath = path.join(tempDir, file.path);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, file.content, 'utf8');
    console.log(`  wrote: ${file.path}`);
  });

  // Create zip with forward-slash entry paths (OPC spec requirement).
  // PowerShell's Compress-Archive uses backslashes on Windows, which breaks
  // Dataverse solution imports. Use System.IO.Compression directly instead.
  const zipName = `${solutionBase}_${version.replace(/\./g, '_')}.zip`;
  const zipPath = path.join(outputDir, zipName);
  const { execSync } = require('child_process');
  const tempDirWin = tempDir.replace(/\//g, '\\');
  const zipPathWin = zipPath.replace(/\//g, '\\');

  const psScript = path.join(outputDir, '_create_zip.ps1');
  fs.writeFileSync(psScript, `
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zipPath = '${zipPathWin}'
$sourceDir = '${tempDirWin}'
if (Test-Path $zipPath) { Remove-Item $zipPath }
$zip = [System.IO.Compression.ZipFile]::Open($zipPath, 'Create')
Get-ChildItem -Path $sourceDir -Recurse -File | ForEach-Object {
    $relativePath = $_.FullName.Substring($sourceDir.Length + 1)
    # OPC spec requires forward slashes in Part URIs
    $entryName = $relativePath -replace '\\\\', '/'
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, $entryName, 'Optimal') | Out-Null
}
$zip.Dispose()
`, 'utf8');

  try {
    execSync(`powershell.exe -NoProfile -ExecutionPolicy Bypass -File "${psScript.replace(/\//g, '\\')}"`, { stdio: 'pipe' });
    fs.unlinkSync(psScript);
    console.log(`\nSolution package created: ${zipPath}`);
  } catch (err) {
    fs.unlinkSync(psScript);
    console.log(`\nFolder structure created at: ${tempDir}`);
    console.log('To create the importable ZIP, run:');
    console.log(`  pac solution pack --folder "${tempDir}" --zipfile "${zipPath}"`);
  }

  console.log(`\nBot schema name: ${versionedResult.botSchemaName}`);
  console.log(`Solution: ${versionedResult.solutionUniqueName}`);
  console.log(`Version: ${version}`);
  console.log(`Components: ${versionedResult.files.filter(f => f.path.startsWith('botcomponents/')).length / 2} bot components`);
  console.log(`\nImport via:`);
  console.log('  1. Power Platform admin center > Solutions > Import');
  console.log(`  2. pac solution import --path "${zipPath}"`);
  console.log(`\nAfter import:`);
  console.log('  1. Open the agent in Copilot Studio');
  console.log('  2. Configure connection references (sign in when prompted)');
  console.log('  3. Test the agent');
  console.log('  4. Publish when ready');

  // Clean up temp directory
  fs.rmSync(tempDir, { recursive: true, force: true });
  console.log(`\nCleaned up temp folder: ${tempDir}`);

  return zipPath;
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Usage: node generate-copilot-agent.js <agent-definition.json> [output-directory]');
    console.error('');
    console.error('  output-directory  Where to write the .zip (default: output/copilot-agents/)');
    console.error('');
    console.error('Example:');
    console.error('  node generate-copilot-agent.js agents/scheduling-agent/scheduling-agent.json');
    process.exit(1);
  }

  const defPath = path.resolve(args[0]);
  const outputDirArg = args[1] || undefined;

  if (!fs.existsSync(defPath)) {
    console.error(`File not found: ${defPath}`);
    process.exit(1);
  }

  const agentDef = JSON.parse(fs.readFileSync(defPath, 'utf8'));
  agentDef._defPath = defPath;  // used to resolve relative instructionsFile paths
  console.log(`Generating Copilot Studio solution for: ${agentDef.name}`);

  createSolutionZip(agentDef, outputDirArg).catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
}

module.exports = { buildAgent, createSolutionZip, CONNECTOR_CATALOG };
