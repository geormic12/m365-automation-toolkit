/**
 * Copilot Studio Agent Flow (Workflow) Solution Generator
 *
 * Generates a valid Dataverse solution .zip that can be imported via:
 *   Power Platform admin center > Solutions > Import
 *   OR: Copilot Studio > Solutions > Import
 *
 * Reverse-engineered from real Copilot Studio workflow exports (March 2026).
 *
 * Usage:
 *   node generate-agent-flow.js <flow-definition.json> [output-path]
 *
 * The flow-definition.json schema:
 * {
 *   "name": "Flow Display Name",
 *   "description": "What this flow does",
 *   "publisher": {
 *     "uniqueName": "DefaultPublisherorg60ae70f3",
 *     "displayName": "Default Publisher for org60ae70f3",
 *     "description": "Default publisher for this organization",
 *     "prefix": "new",
 *     "optionValuePrefix": 10000
 *   },
 *   "solution": {
 *     "uniqueName": "MySolutionName",
 *     "displayName": "My Solution Name",
 *     "version": "1.0.0.0"
 *   },
 *   "connectors": {
 *     "shared_onedriveforbusiness": { "displayName": "OneDrive for Business" },
 *     "shared_office365": { "displayName": "Office 365 Outlook" }
 *   },
 *   "trigger": {
 *     "TriggerName": { ... Logic Apps trigger definition ... }
 *   },
 *   "actions": {
 *     "ActionName": { ... Logic Apps action definitions with runAfter chains ... }
 *   },
 *   "metadata": { ... optional trigger metadata for human-readable paths ... }
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

function guidToUpper(guid) {
  return guid.toUpperCase().replace(/-/g, '-');
}

// ---------------------------------------------------------------------------
// Default publisher — target environment
// ---------------------------------------------------------------------------
const DEFAULT_PUBLISHER = {
  uniqueName: 'DefaultPublisherorg60ae70f3',
  displayName: 'Default Publisher for org60ae70f3',
  description: 'Default publisher for this organization',
  prefix: 'new',
  optionValuePrefix: 10000
};

// ---------------------------------------------------------------------------
// Known connector display names
// ---------------------------------------------------------------------------
const CONNECTOR_NAMES = {
  shared_onedriveforbusiness: 'OneDrive for Business',
  shared_office365: 'Office 365 Outlook',
  shared_sharepointonline: 'SharePoint',
  shared_teams: 'Microsoft Teams',
  shared_excelonlinebusiness: 'Excel Online (Business)',
  shared_office365users: 'Office 365 Users',
  shared_planner: 'Planner',
  shared_approvals: 'Approvals',
  shared_commondataserviceforapps: 'Microsoft Dataverse'
};

// ---------------------------------------------------------------------------
// Build [Content_Types].xml
// ---------------------------------------------------------------------------
function buildContentTypes() {
  return '<?xml version="1.0" encoding="utf-8"?>' +
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="xml" ContentType="application/octet-stream" />' +
    '<Default Extension="json" ContentType="application/octet-stream" />' +
    '</Types>';
}

// ---------------------------------------------------------------------------
// Build solution.xml
// ---------------------------------------------------------------------------
function buildSolutionXml(config, workflowGuid) {
  const pub = config.publisher || DEFAULT_PUBLISHER;
  const sol = config.solution || {
    uniqueName: config.name.replace(/[^a-zA-Z0-9]/g, ''),
    displayName: config.name,
    version: '1.0.0.0'
  };

  return `<ImportExportXml version="9.2.26014.164" SolutionPackageVersion="9.2" languagecode="1033" generatedBy="CrmLive" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" OrganizationVersion="9.2.26014.164" OrganizationSchemaType="Standard" CRMServerServiceabilityVersion="9.2.26021.00160">
  <SolutionManifest>
    <UniqueName>${escapeXml(sol.uniqueName)}</UniqueName>
    <LocalizedNames>
      <LocalizedName description="${escapeXml(sol.displayName)}" languagecode="1033" />
    </LocalizedNames>
    <Descriptions />
    <Version>${escapeXml(sol.version)}</Version>
    <Managed>0</Managed>
    <Publisher>
      <UniqueName>${escapeXml(pub.uniqueName)}</UniqueName>
      <LocalizedNames>
        <LocalizedName description="${escapeXml(pub.displayName)}" languagecode="1033" />
      </LocalizedNames>
      <Descriptions>
        <Description description="${escapeXml(pub.description || '')}" languagecode="1033" />
      </Descriptions>
      <EMailAddress xsi:nil="true"></EMailAddress>
      <SupportingWebsiteUrl xsi:nil="true"></SupportingWebsiteUrl>
      <CustomizationPrefix>${escapeXml(pub.prefix)}</CustomizationPrefix>
      <CustomizationOptionValuePrefix>${pub.optionValuePrefix || 10000}</CustomizationOptionValuePrefix>
      <Addresses>
        <Address>
          <AddressNumber>1</AddressNumber>
          <AddressTypeCode xsi:nil="true"></AddressTypeCode>
          <City xsi:nil="true"></City>
          <County xsi:nil="true"></County>
          <Country xsi:nil="true"></Country>
          <Fax xsi:nil="true"></Fax>
          <FreightTermsCode xsi:nil="true"></FreightTermsCode>
          <ImportSequenceNumber xsi:nil="true"></ImportSequenceNumber>
          <Latitude xsi:nil="true"></Latitude>
          <Line1 xsi:nil="true"></Line1>
          <Line2 xsi:nil="true"></Line2>
          <Line3 xsi:nil="true"></Line3>
          <Longitude xsi:nil="true"></Longitude>
          <Name xsi:nil="true"></Name>
          <PostalCode xsi:nil="true"></PostalCode>
          <PostOfficeBox xsi:nil="true"></PostOfficeBox>
          <PrimaryContactName xsi:nil="true"></PrimaryContactName>
          <ShippingMethodCode xsi:nil="true"></ShippingMethodCode>
          <StateOrProvince xsi:nil="true"></StateOrProvince>
          <Telephone1 xsi:nil="true"></Telephone1>
          <Telephone2 xsi:nil="true"></Telephone2>
          <Telephone3 xsi:nil="true"></Telephone3>
          <TimeZoneRuleVersionNumber xsi:nil="true"></TimeZoneRuleVersionNumber>
          <UPSZone xsi:nil="true"></UPSZone>
          <UTCOffset xsi:nil="true"></UTCOffset>
          <UTCConversionTimeZoneCode xsi:nil="true"></UTCConversionTimeZoneCode>
        </Address>
        <Address>
          <AddressNumber>2</AddressNumber>
          <AddressTypeCode xsi:nil="true"></AddressTypeCode>
          <City xsi:nil="true"></City>
          <County xsi:nil="true"></County>
          <Country xsi:nil="true"></Country>
          <Fax xsi:nil="true"></Fax>
          <FreightTermsCode xsi:nil="true"></FreightTermsCode>
          <ImportSequenceNumber xsi:nil="true"></ImportSequenceNumber>
          <Latitude xsi:nil="true"></Latitude>
          <Line1 xsi:nil="true"></Line1>
          <Line2 xsi:nil="true"></Line2>
          <Line3 xsi:nil="true"></Line3>
          <Longitude xsi:nil="true"></Longitude>
          <Name xsi:nil="true"></Name>
          <PostalCode xsi:nil="true"></PostalCode>
          <PostOfficeBox xsi:nil="true"></PostOfficeBox>
          <PrimaryContactName xsi:nil="true"></PrimaryContactName>
          <ShippingMethodCode xsi:nil="true"></ShippingMethodCode>
          <StateOrProvince xsi:nil="true"></StateOrProvince>
          <Telephone1 xsi:nil="true"></Telephone1>
          <Telephone2 xsi:nil="true"></Telephone2>
          <Telephone3 xsi:nil="true"></Telephone3>
          <TimeZoneRuleVersionNumber xsi:nil="true"></TimeZoneRuleVersionNumber>
          <UPSZone xsi:nil="true"></UPSZone>
          <UTCOffset xsi:nil="true"></UTCOffset>
          <UTCConversionTimeZoneCode xsi:nil="true"></UTCConversionTimeZoneCode>
        </Address>
      </Addresses>
    </Publisher>
    <RootComponents>
      <RootComponent type="29" id="{${workflowGuid}}" behavior="0" />
    </RootComponents>
    <MissingDependencies />
  </SolutionManifest>
</ImportExportXml>`;
}

// ---------------------------------------------------------------------------
// Build customizations.xml
// ---------------------------------------------------------------------------
function buildCustomizationsXml(config, workflowGuid, connectionRefMap, safeFlowName) {
  const flowName = config.name || 'Untitled';

  // Build connection reference XML entries
  let connRefXml = '';
  for (const [connName, refInfo] of Object.entries(connectionRefMap)) {
    const displayName = refInfo.displayName || CONNECTOR_NAMES[refInfo.apiName] || refInfo.apiName;
    connRefXml += `
    <connectionreference connectionreferencelogicalname="${escapeXml(refInfo.logicalName)}">
      <connectionreferencedisplayname>${escapeXml(displayName)}</connectionreferencedisplayname>
      <connectorid>/providers/Microsoft.PowerApps/apis/${escapeXml(refInfo.apiName)}</connectorid>
      <iscustomizable>1</iscustomizable>
      <promptingbehavior>0</promptingbehavior>
      <statecode>0</statecode>
      <statuscode>1</statuscode>
    </connectionreference>`;
  }

  return `<ImportExportXml xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" OrganizationVersion="9.2.26014.164" OrganizationSchemaType="Standard" CRMServerServiceabilityVersion="9.2.26021.00160">
  <Entities></Entities>
  <Roles></Roles>
  <Workflows>
    <Workflow WorkflowId="{${workflowGuid}}" Name="${escapeXml(flowName)}">
      <JsonFileName>/Workflows/${escapeXml(safeFlowName)}-${guidToUpper(workflowGuid).replace(/-/g, '-')}.json</JsonFileName>
      <Type>1</Type>
      <Subprocess>0</Subprocess>
      <Category>5</Category>
      <Mode>0</Mode>
      <Scope>4</Scope>
      <OnDemand>0</OnDemand>
      <TriggerOnCreate>0</TriggerOnCreate>
      <TriggerOnDelete>0</TriggerOnDelete>
      <AsyncAutodelete>0</AsyncAutodelete>
      <SyncWorkflowLogOnFailure>0</SyncWorkflowLogOnFailure>
      <StateCode>1</StateCode>
      <StatusCode>2</StatusCode>
      <RunAs>1</RunAs>
      <IsTransacted>1</IsTransacted>
      <IntroducedVersion>1.0</IntroducedVersion>
      <IsCustomizable>1</IsCustomizable>
      <BusinessProcessType>0</BusinessProcessType>
      <IsCustomProcessingStepAllowedForOtherPublishers>1</IsCustomProcessingStepAllowedForOtherPublishers>
      <ModernFlowType>1</ModernFlowType>
      <PrimaryEntity>none</PrimaryEntity>
      <LocalizedNames>
        <LocalizedName languagecode="1033" description="${escapeXml(flowName)}" />
      </LocalizedNames>
    </Workflow>
  </Workflows>
  <FieldSecurityProfiles></FieldSecurityProfiles>
  <Templates />
  <EntityMaps />
  <EntityRelationships />
  <OrganizationSettings />
  <optionsets />
  <CustomControls />
  <EntityDataProviders />
  <connectionreferences>${connRefXml}
  </connectionreferences>
  <Languages>
    <Language>1033</Language>
  </Languages>
</ImportExportXml>`;
}

// ---------------------------------------------------------------------------
// Build workflow JSON
// ---------------------------------------------------------------------------
function buildWorkflowJson(config, connectionRefMap) {
  // Build connectionReferences section for the flow JSON
  const jsonConnRefs = {};
  for (const [connName, refInfo] of Object.entries(connectionRefMap)) {
    jsonConnRefs[connName] = {
      api: { name: refInfo.apiName },
      connection: { connectionReferenceLogicalName: refInfo.logicalName },
      runtimeSource: 'embedded'
    };
  }

  // Build the trigger — add metadata if provided
  const trigger = { ...config.trigger };
  const triggerKey = Object.keys(trigger)[0];
  if (config.metadata && triggerKey) {
    trigger[triggerKey] = {
      ...trigger[triggerKey],
      metadata: {
        ...(trigger[triggerKey].metadata || {}),
        ...config.metadata
      }
    };
  }

  const flowDef = {
    properties: {
      connectionReferences: jsonConnRefs,
      definition: {
        '$schema': 'https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#',
        contentVersion: '1.0.0.0',
        actions: config.actions || {},
        triggers: trigger || {},
        parameters: {
          '$authentication': { defaultValue: {}, type: 'SecureObject' },
          '$connections': { defaultValue: {}, type: 'Object' }
        },
        outputs: {}
      },
      templateName: null
    },
    schemaVersion: '1.0.0.0'
  };

  return JSON.stringify(flowDef, null, 2);
}

// ---------------------------------------------------------------------------
// Analyze connectors from trigger + actions to build connection reference map
// ---------------------------------------------------------------------------
function buildConnectionRefMap(config) {
  const pub = config.publisher || DEFAULT_PUBLISHER;
  const prefix = pub.prefix || 'new';
  const connectors = config.connectors || {};
  const connectionRefMap = {};

  // Collect all connection names used in trigger and actions
  const usedConnections = new Set();

  // Check trigger
  if (config.trigger) {
    for (const trig of Object.values(config.trigger)) {
      if (trig.inputs?.host?.connectionName) {
        usedConnections.add(trig.inputs.host.connectionName);
      }
    }
  }

  // Check actions
  if (config.actions) {
    for (const action of Object.values(config.actions)) {
      if (action.inputs?.host?.connectionName) {
        usedConnections.add(action.inputs.host.connectionName);
      }
      // Check nested actions (Foreach, If, etc.)
      if (action.actions) {
        for (const nested of Object.values(action.actions)) {
          if (nested.inputs?.host?.connectionName) {
            usedConnections.add(nested.inputs.host.connectionName);
          }
        }
      }
      if (action.else?.actions) {
        for (const nested of Object.values(action.else.actions)) {
          if (nested.inputs?.host?.connectionName) {
            usedConnections.add(nested.inputs.host.connectionName);
          }
        }
      }
    }
  }

  // Build a reference for each unique connection name
  for (const connName of usedConnections) {
    // Extract the base API name (e.g., "shared_onedriveforbusiness" from "shared_onedriveforbusiness-1")
    const apiName = connName.replace(/-\d+$/, '');
    const suffix = newGuid().slice(0, 5);
    const logicalName = `${prefix}_${apiName.replace(/^shared_/, '')}_${suffix}`;
    const displayName = connectors[apiName]?.displayName ||
                        CONNECTOR_NAMES[apiName] ||
                        apiName;

    connectionRefMap[connName] = {
      apiName: apiName,
      logicalName: logicalName,
      displayName: displayName
    };
  }

  return connectionRefMap;
}

// ---------------------------------------------------------------------------
// Main generator
// ---------------------------------------------------------------------------
function generate(configPath, outputPath) {
  // Load config
  const raw = fs.readFileSync(configPath, 'utf8');
  const config = JSON.parse(raw);

  const flowName = config.name || 'Untitled';
  const workflowGuid = newGuid();

  // Derive output path
  if (!outputPath) {
    const baseName = config.solution?.uniqueName ||
                     flowName.replace(/[^a-zA-Z0-9]/g, '');
    outputPath = path.join(path.dirname(configPath), baseName);
  }

  // Build connection reference map
  const connectionRefMap = buildConnectionRefMap(config);

  // Generate file name for workflow JSON
  // OPC spec requires Part URIs with no spaces — sanitize the flow name
  const guidForFile = workflowGuid.toUpperCase();
  const safeFlowName = flowName.replace(/\s+/g, '_');
  const workflowFileName = `${safeFlowName}-${guidForFile}`;

  // Auto-increment build number if zip already exists
  const solutionBase = config.solution?.uniqueName || flowName.replace(/[^a-zA-Z0-9]/g, '');

  // Ensure output directory exists
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  // Check for existing zips and bump build number if needed
  let version = config.solution?.version || '1.0.0.0';
  const existingZips = fs.readdirSync(outputPath)
    .filter(f => f.startsWith(solutionBase + '_') && f.endsWith('.zip'))
    .sort();
  if (existingZips.length > 0) {
    const lastZip = existingZips[existingZips.length - 1];
    const versionMatch = lastZip.replace(solutionBase + '_', '').replace('.zip', '');
    const parts = versionMatch.split('_').map(Number);
    if (parts.length === 4 && parts.every(n => !isNaN(n))) {
      parts[3] += 1; // increment build number
      version = parts.join('.');
    }
  }
  // Apply resolved version back to config so solution.xml picks it up
  if (!config.solution) config.solution = {};
  config.solution.version = version;

  const zipName = `${solutionBase}_${version.replace(/\./g, '_')}.zip`;
  const zipPath = path.join(outputPath, zipName);

  // Create output directory structure
  const tempDir = path.join(outputPath, '_temp_solution');
  const workflowsDir = path.join(tempDir, 'Workflows');
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true });
  }
  fs.mkdirSync(workflowsDir, { recursive: true });

  // Write all files
  fs.writeFileSync(
    path.join(tempDir, '[Content_Types].xml'),
    buildContentTypes(),
    'utf8'
  );

  fs.writeFileSync(
    path.join(tempDir, 'solution.xml'),
    buildSolutionXml(config, workflowGuid),
    'utf8'
  );

  fs.writeFileSync(
    path.join(tempDir, 'customizations.xml'),
    buildCustomizationsXml(config, workflowGuid, connectionRefMap, safeFlowName),
    'utf8'
  );

  fs.writeFileSync(
    path.join(tempDir, 'Workflows', `${workflowFileName}.json`),
    buildWorkflowJson(config, connectionRefMap),
    'utf8'
  );

  const { execSync } = require('child_process');

  // Build zip with forward-slash entry paths (OPC spec requirement).
  // PowerShell's Compress-Archive uses backslashes on Windows, which breaks
  // Dataverse solution imports. Use System.IO.Compression directly instead.
  const psScript = path.join(outputPath, '_create_zip.ps1');
  const tempDirWin = tempDir.replace(/\//g, '\\');
  const zipPathWin = zipPath.replace(/\//g, '\\');

  fs.writeFileSync(psScript, `
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zipPath = '${zipPathWin}'
$sourceDir = '${tempDirWin}'
$zip = [System.IO.Compression.ZipFile]::Open($zipPath, 'Create')
Get-ChildItem -Path $sourceDir -Recurse -File | ForEach-Object {
    $relativePath = $_.FullName.Substring($sourceDir.Length + 1)
    # OPC spec requires forward slashes in Part URIs
    $entryName = $relativePath -replace '\\\\', '/'
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, $entryName, 'Optimal') | Out-Null
}
$zip.Dispose()
`, 'utf8');

  execSync(`powershell.exe -NoProfile -ExecutionPolicy Bypass -File "${psScript.replace(/\//g, '\\')}"`, { stdio: 'pipe' });
  fs.unlinkSync(psScript);

  // Clean up temp directory
  fs.rmSync(tempDir, { recursive: true });

  // Print results
  console.log('');
  console.log('Agent Flow Solution Generated Successfully');
  console.log('==========================================');
  console.log(`  Flow name:    ${flowName}`);
  console.log(`  Workflow ID:  ${workflowGuid}`);
  console.log(`  Solution:     ${config.solution?.uniqueName || flowName}`);
  console.log(`  Version:      ${version}`);
  console.log(`  Output:       ${zipPath}`);
  console.log('');
  console.log('Connection references:');
  for (const [connName, ref] of Object.entries(connectionRefMap)) {
    console.log(`  ${connName} → ${ref.logicalName} (${ref.displayName})`);
  }
  console.log('');
  console.log('Import via:');
  console.log('  Power Platform admin > Solutions > Import');
  console.log('  OR: Copilot Studio > Solutions > Import');
  console.log('');

  return { zipPath, workflowGuid, connectionRefMap };
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Usage: node generate-agent-flow.js <flow-definition.json> [output-directory]');
    console.error('');
    console.error('Example:');
    console.error('  node generate-agent-flow.js flows/copy-file-flow.json output/CopyFileFlow');
    process.exit(1);
  }

  const configPath = path.resolve(args[0]);
  const outputPath = args[1] ? path.resolve(args[1]) : undefined;

  if (!fs.existsSync(configPath)) {
    console.error(`Error: Config file not found: ${configPath}`);
    process.exit(1);
  }

  try {
    generate(configPath, outputPath);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

module.exports = { generate };
