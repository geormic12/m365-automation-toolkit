# Scheduling Agent — Copilot Studio Setup Guide

## Overview

This guide walks you through creating the Scheduling Agent in Microsoft Copilot Studio. The agent finds available time windows on your Outlook calendar based on natural language queries.

**Time estimate**: ~15 minutes (mostly copy-paste)

**Two approaches** are provided:
- **Approach A** (Recommended): Direct connector — agent calls Outlook directly, LLM analyzes results
- **Approach B** (Backup): Power Automate flow — import a pre-built flow, wire it as a tool

Start with Approach A. Fall back to B if the connector tool doesn't give you enough control.

---

## Prerequisites

- Access to [copilotstudio.microsoft.com](https://copilotstudio.microsoft.com) with your Microsoft 365 account
- Copilot Studio license (included with most M365 E3/E5 plans, or standalone trial)
- Your Outlook calendar populated with events (already done — 58 fake events, Feb 13-19)

---

## Approach A: Direct Connector Tool (Recommended)

### Step 1: Create the Agent

1. Go to [copilotstudio.microsoft.com](https://copilotstudio.microsoft.com)
2. Click **Create** (left sidebar) → **New agent**
3. In the description box, type:

   > A scheduling assistant that checks my Outlook calendar and finds available time windows. It accepts parameters like duration (15/30/45/60 minutes), date range (tomorrow, next week, specific dates), and how many windows to return. It should analyze my calendar events and identify gaps within business hours (9 AM - 5:30 PM Central Time).

4. Copilot Studio will generate a name, description, and initial configuration. Review and adjust:
   - **Name**: `Scheduling Agent`
   - **Description**: `Finds available time windows on your Outlook calendar`
5. Click **Create**

### Step 2: Set the Agent Instructions

1. On the agent's **Overview** page, find the **Instructions** section
2. Replace whatever was auto-generated with the full contents of:

   **`scripts/copilot-studio/scheduling-agent/agent-instructions.md`**

   Copy the entire file content and paste it into the Instructions box.

3. Click **Save**

### Step 3: Add the Outlook Connector Tool

1. Go to your agent's **Tools** page (left sidebar)
2. Click **+ Add a tool**
3. In the search box, type **"Office 365 Outlook"**
4. Select the **Office 365 Outlook** connector
5. Find and add these actions:
   - **Get events (V4)** — retrieves calendar events for a date range
   - **Find meeting times** — server-side availability calculation (optional but useful)
6. For each action, click on it and review the description. The descriptions help generative orchestration know when to call each tool. Enhance them if needed:
   - Get events: "Retrieve calendar events within a date range. Use this to get the user's schedule for availability analysis."
   - Find meeting times: "Find available meeting time slots. Use this when the user wants to find free windows of a specific duration."
7. When prompted, **sign in** with your Microsoft account to create the connection
8. Click **Save**

### Step 4: Configure Generative Orchestration

1. Go to **Settings** (gear icon) → **Generative AI**
2. Ensure **Generative orchestration** is selected (this should be the default for new agents)
3. Set the **content moderation** level to your preference
4. Click **Save**

### Step 5: Test the Agent

1. Click **Test your agent** (bottom-right chat panel)
2. Try these queries:
   - "When am I free tomorrow?"
   - "Find me 3 fifteen-minute windows next Thursday"
   - "What does my calendar look like this week?"
   - "I need a 45-minute block for deep work sometime this week"
   - "Am I available at 2pm on Friday?"
3. Verify the agent:
   - Calls the Get events tool with appropriate date parameters
   - Correctly identifies busy vs. free time
   - Returns windows within 9 AM - 5:30 PM CT business hours
   - Handles natural language dates correctly

### Step 6: Publish

1. Click **Publish** (top-right)
2. Confirm the publish
3. Go to **Channels** → **Microsoft Teams**
4. Click **Turn on Teams** to make the agent available in Teams
5. Share the installation link with anyone in your org who needs it

---

## Approach B: Power Automate Flow as Backend Tool

Use this if Approach A's direct connector doesn't work well (e.g., the agent doesn't pass the right parameters, or you need more control over the data processing).

### Step 1: Import the Calendar Query Flow

1. Go to [make.powerautomate.com](https://make.powerautomate.com)
2. **My flows** → **Import** → **Import Package (Legacy)**
3. Upload `output/SchedulingAgent-CalendarQuery.zip`
4. Configure the import:
   - Flow: Set to **Create as new**
   - Office 365 Outlook connection: Click **Select during import** → choose your account
5. Click **Import**
6. Open the imported flow and verify it runs successfully (click **Test** → **Manually** → **Run flow**)

### Step 2: Convert to Agent Flow (Optional)

If you want the flow managed inside Copilot Studio:
1. In Power Automate, open the flow
2. Go to **Edit** → change the plan to **Copilot Studio**
3. Save and confirm
4. The flow now appears in your Copilot Studio agent's Flows page

### Step 3: Create the Agent

Follow Steps 1-2 from Approach A above (create agent, paste instructions).

### Step 4: Add the Flow as a Tool

1. In Copilot Studio, go to your agent's **Tools** page
2. Click **+ Add a tool**
3. Search for your imported flow ("Scheduling Agent - Calendar Query")
4. Add it as a tool
5. Review the tool's input/output descriptions to help generative orchestration

### Step 5: Test and Publish

Follow Steps 5-6 from Approach A.

---

## Alternative: "Find Meeting Times" Flow

A second PA package is provided that uses Microsoft's server-side availability engine:

- **Package**: `output/SchedulingAgent-FindTimes.zip`
- **What it does**: Calls the FindMeetingTimes API which computes available windows server-side
- **Advantage**: No gap-finding logic needed — Microsoft does the math
- **Limitation**: Hardcoded date range and duration (would need to be parameterized for dynamic use)
- **Note**: The dates/duration in this flow are placeholders (Feb 13-20, 30 min). When you import it, update these values in the flow editor, or convert it to an agent flow with dynamic inputs.

---

## Troubleshooting

### "No events returned"
- Check that the calendar ID in the flow matches your default calendar
- The calendar ID from the excel-to-calendar flow is: `AAMkADgwNjg1ZDg1LTU0NTQtNGMwNy1iOTQyLTZkMThiYmU5ZTJjZQBGAAAAAACdIpCprW34Sr7ug4BN7kxbBwB5LBWIIFC5RoUqhnalouEvAAAAAAEGAAB5LBWIIFC5RoUqhnalouEvAAACrrRhAAA=`
- If using the direct connector in Copilot Studio, try selecting "Calendar" (the default calendar name) instead of the raw ID

### Agent doesn't call the tool
- Check that generative orchestration is enabled (Settings → Generative AI)
- Improve the tool description to be more explicit about when to use it
- Try creating a manual topic with trigger phrases like "find available time", "when am I free", "check my calendar"

### Wrong timezone
- The agent instructions specify Central Time
- If events come back in UTC, add a note in instructions: "Convert all event times from UTC to Central Time before analyzing"

### Agent gives inaccurate windows
- The LLM gap analysis should be accurate for typical calendars
- If edge cases arise (back-to-back meetings, all-day events, recurring series), add specific handling notes to the agent instructions

---

## What's Next

- **Add more attendees**: Extend the agent to check multiple people's calendars for mutual availability
- **Booking capability**: Add a "Create event" tool so the agent can book meetings directly
- **Custom hours**: Let users set their own business hours per request
- **Recurring availability**: "Show me my free time pattern for the next month"
- **Graph API resolver**: When Graph API access is available, switch to `getSchedule` endpoint for richer availability data (see `memory/power-automate-graph-resolver.md`)
