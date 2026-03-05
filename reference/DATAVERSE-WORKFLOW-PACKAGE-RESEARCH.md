# Dataverse Solution Package Format: Workflow Components (Type 29)

Deep research on the Dataverse solution package format for Workflow/Process components used in Copilot Studio agent flows and Power Automate cloud flows.

**Research date:** 2026-03-05
**Sources:** Microsoft Learn official documentation, Dataverse entity references, Power Platform ALM docs

---

## 1. solution.xml Format

### RootComponent Type Values (Complete List)

The `ComponentType` picklist on the `SolutionComponent` entity defines all valid values. Type `29` is confirmed as **Workflow**.

| Value | Label | Notes |
|-------|-------|-------|
| 1 | Entity | Dataverse table |
| 2 | Attribute | Column/field |
| 3 | Relationship | |
| 4 | Attribute Picklist Value | |
| 5 | Attribute Lookup Value | |
| 6 | View Attribute | |
| 7 | Localized Label | |
| 8 | Relationship Extra Condition | |
| 9 | Option Set | Choice column |
| 10 | Entity Relationship | |
| 11 | Entity Relationship Role | |
| 12 | Entity Relationship Relationships | |
| 13 | Managed Property | |
| 14 | Entity Key | |
| 16 | Privilege | |
| 17 | PrivilegeObjectTypeCode | |
| 18 | Index | |
| 20 | Role | Security role |
| 21 | Role Privilege | |
| 22 | Display String | |
| 23 | Display String Map | |
| 24 | Form | |
| 25 | Organization | |
| 26 | Saved Query | View |
| **29** | **Workflow** | **Process/Cloud Flow -- THIS IS THE ONE** |
| 31 | Report | |
| 32 | Report Entity | |
| 33 | Report Category | |
| 34 | Report Visibility | |
| 35 | Attachment | |
| 36 | Email Template | |
| 37 | Contract Template | |
| 38 | KB Article Template | |
| 39 | Mail Merge Template | |
| 44 | Duplicate Rule | |
| 45 | Duplicate Rule Condition | |
| 46 | Entity Map | |
| 47 | Attribute Map | |
| 48 | Ribbon Command | |
| 49 | Ribbon Context Group | |
| 50 | Ribbon Customization | |
| 52 | Ribbon Rule | |
| 53 | Ribbon Tab To Command Map | |
| 55 | Ribbon Diff | |
| 59 | Saved Query Visualization | Chart |
| 60 | System Form | |
| 61 | Web Resource | |
| 62 | Site Map | |
| 63 | Connection Role | |
| 64 | Complex Control | |
| 65 | Hierarchy Rule | |
| 66 | Custom Control | |
| 68 | Custom Control Default Config | |
| 70 | Field Security Profile | |
| 71 | Field Permission | |
| 90 | Plugin Type | |
| 91 | Plugin Assembly | |
| 92 | SDK Message Processing Step | |
| 93 | SDK Message Processing Step Image | |
| 95 | Service Endpoint | |
| 150 | Routing Rule | |
| 151 | Routing Rule Item | |
| 152 | SLA | |
| 153 | SLA Item | |
| 154 | Convert Rule | |
| 155 | Convert Rule Item | |
| 161 | Mobile Offline Profile | |
| 162 | Mobile Offline Profile Item | |
| 165 | Similarity Rule | |
| 166 | Data Source Mapping | |
| 201-208 | SDK Message types | Various SDK-related |
| 210 | WebWizard | |
| 300 | Canvas App | |
| 371-372 | Connector | |
| 380 | Environment Variable Definition | |
| 381 | Environment Variable Value | |
| 400-402 | AI Project/Configuration | |
| 430-432 | Entity/Attribute Analytics/Image Config | |

**Source:** [SolutionComponent entity reference](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/reference/entities/solutioncomponent)

### RootComponentBehavior (behavior attribute)

The `behavior` attribute in solution.xml maps to `RootComponentBehavior` on the SolutionComponent entity:

| Value | Label | Meaning |
|-------|-------|---------|
| **0** | **Include Subcomponents** | **Default. The component and all its child components are included.** |
| 1 | Do not include subcomponents | Only the root component, no children |
| 2 | Include As Shell Only | Minimal shell representation |

**`behavior="0"` means: include the workflow AND all its subcomponents (connection references, etc.).**

### Managed Attribute

The `<Managed>` element in solution.xml controls whether the solution imports as managed or unmanaged:

| Value | Meaning | Import Behavior |
|-------|---------|-----------------|
| **0** | **Unmanaged** | Components import in **draft state** and must be published. Components remain in environment even if solution is deleted. Components can be freely edited. |
| **1** | **Managed** | Components import in **published state** immediately. Deleting the solution removes all its components. Components cannot be directly edited (must use unmanaged layer on top). |

**Key constraints:**
- You cannot import a managed solution to update an existing unmanaged solution, or vice versa. The modes must match.
- Managed solutions layer on top of each other; last installed wins for conflicting components.
- Unmanaged customizations always sit at the top layer and override managed solution behavior.

**Sources:**
- [Solution concepts](https://learn.microsoft.com/en-us/power-platform/alm/solution-concepts-alm)
- [How managed solutions are merged](https://learn.microsoft.com/en-us/power-platform/alm/how-managed-solutions-merged)
- [Import solutions](https://learn.microsoft.com/en-us/power-apps/maker/data-platform/import-update-export-solutions)

---

## 2. customizations.xml Workflow Element

All values below come from the official **Process (Workflow) table/entity reference**.

### Category (All Valid Values)

| Value | Label | Description |
|-------|-------|-------------|
| 0 | Workflow | Classic Dataverse workflow |
| 1 | Dialog | Classic Dataverse dialog |
| 2 | Business Rule | |
| 3 | Action | Classic Dataverse custom action |
| 4 | Business Process Flow | |
| **5** | **Modern Flow** | **Cloud flow (automated, instant, scheduled). THIS IS CORRECT.** |
| 6 | Desktop Flow | Power Automate desktop flow |
| 7 | AI Flow | |

**`Category=5` is correct for cloud flows, including Copilot Studio agent flows.**

### ModernFlowType (All Valid Values)

| Value | Label | Description |
|-------|-------|-------------|
| 0 | PowerAutomateFlow | Standard Power Automate cloud flow |
| **1** | **CopilotStudioFlow** | **Copilot Studio agent flow. THIS IS CORRECT for agent flows.** |
| 2 | M365CopilotAgentFlow | Microsoft 365 Copilot agent flow |

**IMPORTANT:** `ModernFlowType=1` specifically means **CopilotStudioFlow**, NOT a generic automated/instant flow. For standard Power Automate flows, use `ModernFlowType=0`. Our existing skill documentation was slightly inaccurate on this point -- it said "Automated/instant cloud flow" but the actual label is "CopilotStudioFlow".

### StateCode (All Valid Values)

| Value | Label | DefaultStatus | Meaning |
|-------|-------|---------------|---------|
| **0** | **Draft** | 1 | Flow is off / not running |
| **1** | **Activated** | 2 | Flow is on / running |
| **2** | **Suspended** | 3 | Flow has been suspended (e.g., DLP violation) |

### StatusCode (All Valid Values)

| Value | Label | State | Meaning |
|-------|-------|-------|---------|
| **1** | **Draft** | 0 (Draft) | Flow is in draft / off |
| **2** | **Activated** | 1 (Activated) | Flow is active / on |
| **3** | **CompanyDLPViolation** | 2 (Suspended) | Flow suspended due to company DLP policy violation |

**StateCode/StatusCode pairs:**
- `StateCode=0, StatusCode=1` → Draft (off)
- `StateCode=1, StatusCode=2` → Activated (on)
- `StateCode=2, StatusCode=3` → Suspended (DLP violation)

### Scope (All Valid Values)

| Value | Label | Meaning |
|-------|-------|---------|
| 1 | User | Runs in context of owning user only |
| 2 | Business Unit | Runs for the owning business unit |
| 3 | Parent: Child Business Units | Runs for parent and child BUs |
| **4** | **Organization** | **Runs for the entire organization. THIS IS CORRECT for cloud flows.** |

**`Scope=4` means Organization scope — the flow applies across the entire Dataverse organization.**

### RunAs (All Valid Values)

| Value | Label | Meaning |
|-------|-------|---------|
| 0 | Owner | Runs under the flow owner's account |
| **1** | **Calling User** | **Runs under the user who triggers the flow. DEFAULT value.** |

**`RunAs=1` means Calling User — the flow executes with the permissions of whoever triggers it. This is the default.**

### Type (All Valid Values)

| Value | Label | Meaning |
|-------|-------|---------|
| **1** | **Definition** | **The actual flow definition. THIS IS CORRECT.** |
| 2 | Activation | An activation record (runtime instance) |
| 3 | Template | A reusable template |

**`Type=1` means Definition — this is the primary flow definition record, which is what you want for import.**

### Subprocess

| Value | Label | Meaning |
|-------|-------|---------|
| **0 (False)** | **No** | **Not a child process. THIS IS CORRECT for standalone flows.** |
| 1 (True) | Yes | Can be included in other processes as a child/sub-process |

**`Subprocess=0` (Boolean False) means this is NOT a child process — it's a standalone top-level flow.**

### Other Notable Attributes

**Mode:**
| Value | Label |
|-------|-------|
| 0 | Background |
| 1 | Real-time |

**BusinessProcessType:**
| Value | Label |
|-------|-------|
| 0 | Business Flow |
| 1 | Task Flow |

**ThrottlingBehavior:**
| Value | Label |
|-------|-------|
| 0 | None |
| 1 | TenantPool |
| 2 | CopilotStudio |

**Source:** [Process (Workflow) entity reference](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/reference/entities/workflow)

---

## 3. Connection References in customizations.xml

### ConnectionReferenceLogicalName Naming Convention

- **Type:** String, max 200 characters
- **Required level:** SystemRequired
- **Format:** `<publisher_prefix>_<connector_api_name_sanitized>_<unique_suffix>`
- **Character constraints:** Only `[A-Z]`, `[a-z]`, `[0-9]`, or underscore allowed
- **Examples:**
  - `cr449_sharedcommondataserviceforapps_109ea`
  - `new_office365_a1b2c`
  - `tst_sharedtst5fcreateuserandjob5ffeb85c4c63870282_b4cc7`
- The prefix comes from the solution publisher (e.g., `cr449` for your publisher, `new` for default)
- Platform generates the suffix automatically when creating through the portal; for manual generation, any unique alphanumeric suffix works

### PromptingBehavior (All Valid Values)

| Value | Label | Meaning |
|-------|-------|---------|
| **0** | **Prompt on import** | **DEFAULT. User is prompted to select/create a connection during solution import.** |
| 1 | Skip | User is NOT prompted; connection reference is imported without requiring connection configuration |

**`promptingbehavior=0` means the import wizard will prompt the user to select or create a connection for this reference. This is the expected behavior for most flows.**

### IsCustomizable

- **Type:** ManagedProperty (not a simple boolean)
- **Required level:** SystemRequired
- **In solution XML:** Expressed as `iscustomizable="0"` or `iscustomizable="1"`

| Value | Meaning |
|-------|---------|
| **0** | **Cannot be customized** — prevents users from modifying this connection reference in the target environment |
| **1** | **Can be customized** — allows users to modify the connection reference after import |

For unmanaged solutions, this typically doesn't matter much since users can edit anything. For managed solutions, `iscustomizable=0` locks down the component.

### Connection Reference StateCode/StatusCode

| StateCode | StatusCode | Meaning |
|-----------|------------|---------|
| 0 (Active) | 1 (Active) | Normal operational state |
| 1 (Inactive) | 2 (Inactive) | Disabled |

**Source:** [Connection Reference entity reference](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/reference/entities/connectionreference)

---

## 4. Workflow JSON Format

### runtimeSource Property

**`runtimeSource: "embedded"` is used for ALL solution-aware cloud flows, not just Copilot Studio agent flows.**

When creating a cloud flow programmatically via the Dataverse API, the `clientdata` JSON contains `connectionReferences` where each reference has `"runtimeSource": "embedded"`. This is confirmed in Microsoft's official code samples.

**What "embedded" means:** The connection reference information is embedded within the flow definition itself. The flow carries its own connection mapping rather than pointing to an external/shared connection reference.

**Are there other runtimeSource values?** The official documentation only shows `"embedded"` in all examples. There is no documented alternative. The `runtimeSource` field appears to be a fixed value for solution-aware flows. Non-solution-aware flows (under "My Flows") use a different storage mechanism entirely (they use `api.flow.microsoft.com` which stores connections differently).

**Bottom line:** Always use `"embedded"` for any flow in a Dataverse solution package.

### schemaVersion

The `schemaVersion` at the root of the flow JSON is `"1.0.0.0"` in all Microsoft examples.

```json
{
  "properties": {
    "connectionReferences": { ... },
    "definition": { ... }
  },
  "schemaVersion": "1.0.0.0"
}
```

The `definition` section also uses `"contentVersion": "1.0.0.0"` and references the Azure Logic Apps schema:
```
"$schema": "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#"
```

Both are standard values. There is no documentation of alternative `schemaVersion` values being supported.

### Full clientdata JSON Structure

```json
{
  "properties": {
    "connectionReferences": {
      "<connectionName>": {
        "runtimeSource": "embedded",
        "connection": {
          "name": "<connection-instance-id>",
          "connectionReferenceLogicalName": "<from_customizations.xml>"
        },
        "api": {
          "name": "<connector_api_name>"
        }
      }
    },
    "definition": {
      "$schema": "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#",
      "contentVersion": "1.0.0.0",
      "parameters": {
        "$connections": { "defaultValue": {}, "type": "Object" },
        "$authentication": { "defaultValue": {}, "type": "SecureObject" }
      },
      "triggers": { ... },
      "actions": { ... }
    }
  },
  "schemaVersion": "1.0.0.0"
}
```

**Note:** When creating programmatically, the `connection.name` can be empty (`{}`) and the `connectionReferenceLogicalName` can be omitted — they get populated at runtime/import. When exporting an existing flow, these fields are populated.

**Sources:**
- [Work with cloud flows using code](https://learn.microsoft.com/en-us/power-automate/manage-flows-with-code)
- [Create Power Automate Cloud Flow Programmatically](https://blog.magnetismsolutions.com/blog/paulnieuwelaar/2021/04/20/create-power-automate-cloud-flow-programmatically-in-ms-dataverse)

---

## 5. Import Behavior

### CONFIGURE_AFTER_IMPORT as a Parameter Value

`CONFIGURE_AFTER_IMPORT` is **NOT an official Dataverse/Power Platform concept**. It is a **convention used in our generator skill** as a placeholder string for environment-specific resource IDs (like folder IDs, site URLs, list IDs).

**What happens at import:** The string `"CONFIGURE_AFTER_IMPORT"` is imported literally as the parameter value. The flow will import successfully but:
- If the flow is activated, the trigger/action using this placeholder will fail at runtime because the resource doesn't exist
- The user must manually edit the flow after import to replace the placeholder with an actual resource ID
- There is no Power Platform feature that automatically detects or prompts for placeholder values

**Best practice:** Import the flow in Draft state (`StateCode=0, StatusCode=1`) when using placeholder values, so the user can configure the actual resource IDs before activating.

### Can You Import an Activated Flow?

**Yes**, with conditions:

- The import process **attempts to restore flows to the state they were in when exported**
- If exported as activated (`StateCode=1`) AND all connection references have valid connections in the target environment, the flow will be turned on as part of import
- If exported as activated but connection references cannot be resolved, the flow will remain in draft/off state
- During import, **flows are turned off and then turned on again** (brief interruption)
- If the flow already exists in the target environment, the import of an update **does not affect the flow state** — if it was off, it stays off
- Flows created via code API always start as `StateCode=0` (Draft/Off) regardless of what you set

**Recommendation for generated packages:** Export with `StateCode=0` (Draft) when flows contain placeholder values or need post-import configuration. Export with `StateCode=1` (Activated) only when the flow is fully self-contained.

### Common Import Failure Reasons

1. **Invalid XML schema** — customizations.xml contains elements not valid per the XSD schema. Error code: `8004801a`. The platform validates against `CustomizationsSolution.xsd`.

2. **Missing dependencies** — Components referenced by the flow don't exist in the target environment (tables, connection references, other flows). This is the **most common** cause of import failure.

3. **Connection reference issues** — If connection references aren't included in the solution, or if the required connectors aren't available in the target environment.

4. **Managed/unmanaged mode mismatch** — Trying to import a managed solution to update an existing unmanaged solution (or vice versa). Error: "The solution is already installed as a managed solution and the package supplied is attempting to install it in unmanaged mode."

5. **Missing security privileges** — The importing user needs the Create privilege on all component types in the solution. The System Customizer role covers most components but not Plugin Assembly.

6. **File structure errors** — Files not at root level of the .zip (wrapped in a parent folder), or `JsonFileName` in customizations.xml not matching the actual file path.

7. **Solution already exists** — You can't import a solution into an environment where the **exact same solution** already exists (use update/upgrade instead).

8. **Size limit** — Maximum solution file size is **95 MB**.

9. **Hardcoded environment-specific IDs** — Flow references to specific GUIDs, folder IDs, or site URLs that don't exist in the target environment. These don't cause import failure but cause runtime failures.

### Import Process Flow

1. User uploads .zip file
2. Platform validates XML schema
3. Platform checks dependencies
4. If connection references exist in solution, user is prompted to select/create connections (unless `PromptingBehavior=1`)
5. If environment variables exist, user is prompted for values
6. Components are imported
7. For managed solutions: components are published immediately
8. For unmanaged solutions: components are imported in draft state; user must publish
9. Flow state restoration is attempted (activated flows try to turn on)
10. Import user becomes the owner of all imported components

### Ownership After Import

All components in the imported solution are owned by the user who performs the import, including cloud flows, connection references, apps, and other components.

**Sources:**
- [Import a solution (Power Automate)](https://learn.microsoft.com/en-us/power-automate/import-flow-solution)
- [Import solutions (Power Apps)](https://learn.microsoft.com/en-us/power-apps/maker/data-platform/import-update-export-solutions)
- [Solution package cannot be imported](https://learn.microsoft.com/en-us/troubleshoot/power-platform/dataverse/working-with-solutions/this-solution-package-cannot-be-imported)
- [Missing dependencies](https://learn.microsoft.com/en-us/troubleshoot/power-platform/dataverse/working-with-solutions/missing-dependency-on-solution-import)

---

## Summary: Validation of Our Current Understanding

| Attribute | Our Value | Correct? | Official Meaning |
|-----------|-----------|----------|-----------------|
| RootComponent type=29 | Workflow | **YES** | Workflow/Process |
| behavior=0 | Include subcomponents | **YES** | Include Subcomponents |
| Managed=0 | Unmanaged | **YES** | Imports in draft state, editable |
| Category=5 | Modern Flow | **YES** | Cloud flow (automated/instant/scheduled) |
| ModernFlowType=1 | CopilotStudioFlow | **PARTIALLY** | Specifically CopilotStudioFlow, not generic. Use 0 for standard PA flows. |
| StateCode=1, StatusCode=2 | Activated | **YES** | Flow is on/running |
| Scope=4 | Organization | **YES** | Org-wide scope |
| RunAs=1 | Calling User | **YES** | Default; runs as whoever triggers it |
| Type=1 | Definition | **YES** | Primary flow definition |
| Subprocess=0 | Not a child process | **YES** | Standalone flow |
| runtimeSource="embedded" | For all solution flows | **YES** | Standard for all solution-aware cloud flows |
| schemaVersion="1.0.0.0" | Required | **YES** | Only documented version |
| promptingbehavior=0 | Prompt on import | **YES** | User picks connection during import |
| iscustomizable=0 | Not customizable | **YES** | Locks component in managed solutions |
| CONFIGURE_AFTER_IMPORT | Placeholder convention | **N/A** | Our convention, not a platform feature |

### Action Item

The `ModernFlowType` value needs attention in our generator:
- For **Copilot Studio agent flows**: `ModernFlowType=1` is correct
- For **standard Power Automate flows**: Should use `ModernFlowType=0`
- The `/generate-agent-flow` skill correctly uses `1` since it generates Copilot Studio flows
- The `/generate-pa-package` skill should use `0` if it generates standard Power Automate flows
