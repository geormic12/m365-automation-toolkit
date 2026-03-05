/**
 * Power Automate Legacy Package Generator
 *
 * Generates a valid .zip package that can be imported via:
 *   Power Automate → My flows → Import → Import Package (Legacy)
 *
 * Usage:
 *   node generate-pa-package.js <flow-definition.json> [output-directory]
 *
 * The flow-definition.json must follow this schema:
 * {
 *   "displayName": "My Flow Name",
 *   "description": "Optional description",
 *   "creator": "Author Name",
 *   "connectors": {
 *     "shared_office365": { "displayName": "Office 365 Outlook" },
 *     "shared_excelonlinebusiness": { "displayName": "Excel Online (Business)" }
 *   },
 *   "trigger": { ... },        // Logic Apps trigger definition
 *   "actions": { ... }          // Logic Apps actions definition
 * }
 *
 * Prerequisites:
 *   npm install archiver uuid    (run once)
 */

const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

// ---------------------------------------------------------------------------
// GUID generator
// ---------------------------------------------------------------------------
function newGuid() {
  return randomUUID();
}

// ---------------------------------------------------------------------------
// Connector icon URIs (best-effort defaults)
// ---------------------------------------------------------------------------
const CONNECTOR_ICONS = {
  shared_office365: 'https://connectoricons-prod.azureedge.net/releases/v1.0.1714/1.0.1714.3820/office365/icon.png',
  shared_excelonlinebusiness: 'https://connectoricons-prod.azureedge.net/releases/v1.0.1714/1.0.1714.3820/excelonlinebusiness/icon.png',
  shared_sharepointonline: 'https://connectoricons-prod.azureedge.net/releases/v1.0.1714/1.0.1714.3820/sharepointonline/icon.png',
  shared_teams: 'https://connectoricons-prod.azureedge.net/releases/v1.0.1714/1.0.1714.3820/teams/icon.png',
  shared_office365users: 'https://connectoricons-prod.azureedge.net/releases/v1.0.1714/1.0.1714.3820/office365users/icon.png',
  shared_onedriveforbusiness: 'https://connectoricons-prod.azureedge.net/releases/v1.0.1714/1.0.1714.3820/onedriveforbusiness/icon.png',
  shared_planner: 'https://connectoricons-prod.azureedge.net/releases/v1.0.1714/1.0.1714.3820/planner/icon.png',
  shared_approvals: 'https://connectoricons-prod.azureedge.net/releases/v1.0.1714/1.0.1714.3820/approvals/icon.png',
  shared_flowmanagement: 'https://connectoricons-prod.azureedge.net/releases/v1.0.1714/1.0.1714.3820/flowmanagement/icon.png',
  shared_commondataserviceforapps: 'https://connectoricons-prod.azureedge.net/releases/v1.0.1714/1.0.1714.3820/commondataserviceforapps/icon.png',
};

function getIconUri(connectorName) {
  return CONNECTOR_ICONS[connectorName] || `https://connectoricons-prod.azureedge.net/${connectorName}/icon.png`;
}

// ---------------------------------------------------------------------------
// Build package files from a flow definition
// ---------------------------------------------------------------------------
function buildPackage(flowDef) {
  const flowGuid = newGuid();
  const internalFlowGuid = newGuid();
  const packageTelemetryId = newGuid();
  const now = new Date().toISOString().replace(/(\.\d{3})Z/, '$10000Z'); // 7 fractional digits

  // Generate GUIDs for each connector's API and Connection resources
  const connectorNames = Object.keys(flowDef.connectors || {});
  const apiGuids = {};
  const connGuids = {};
  connectorNames.forEach(name => {
    apiGuids[name] = newGuid();
    connGuids[name] = newGuid();
  });

  // ---- 1. Root manifest.json ----
  const resources = {};

  // Flow resource (Root)
  const allDependencies = [];
  connectorNames.forEach(name => {
    allDependencies.push(apiGuids[name]);
    allDependencies.push(connGuids[name]);
  });

  resources[flowGuid] = {
    type: 'Microsoft.Flow/flows',
    suggestedCreationType: 'New',
    creationType: 'Existing, New, Update',
    details: { displayName: flowDef.displayName },
    configurableBy: 'User',
    hierarchy: 'Root',
    dependsOn: allDependencies
  };

  // API + Connection resources (Children)
  connectorNames.forEach(name => {
    const displayName = flowDef.connectors[name].displayName || name;
    const iconUri = flowDef.connectors[name].iconUri || getIconUri(name);

    resources[apiGuids[name]] = {
      id: `/providers/Microsoft.PowerApps/apis/${name}`,
      name: name,
      type: 'Microsoft.PowerApps/apis',
      suggestedCreationType: 'Existing',
      details: { displayName, iconUri },
      configurableBy: 'System',
      hierarchy: 'Child',
      dependsOn: []
    };

    resources[connGuids[name]] = {
      type: 'Microsoft.PowerApps/apis/connections',
      suggestedCreationType: 'Existing',
      creationType: 'Existing',
      details: { displayName: 'Select Account', iconUri },
      configurableBy: 'User',
      hierarchy: 'Child',
      dependsOn: [apiGuids[name]]
    };
  });

  const rootManifest = {
    schema: '1.0',
    details: {
      displayName: flowDef.displayName,
      description: flowDef.description || '',
      createdTime: now,
      packageTelemetryId,
      creator: flowDef.creator || 'Claude Code',
      sourceEnvironment: ''
    },
    resources
  };

  // ---- 2. Inner manifest (Microsoft.Flow/flows/manifest.json) ----
  const innerManifest = {
    packageSchemaVersion: '1.0',
    flowAssets: {
      assetPaths: [flowGuid]
    }
  };

  // ---- 3. definition.json ----
  const connectionReferences = {};
  connectorNames.forEach(name => {
    // Extract short apiName from "shared_office365" -> "office365"
    const apiName = name.replace(/^shared_/, '');
    connectionReferences[name] = {
      connectionName: '',
      source: 'Invoker',
      id: `/providers/Microsoft.PowerApps/apis/${name}`,
      tier: 'NotSpecified',
      apiName: apiName
    };
  });

  const definition = {
    name: internalFlowGuid,
    id: `/providers/Microsoft.Flow/flows/${internalFlowGuid}`,
    type: 'Microsoft.Flow/flows',
    properties: {
      apiId: '/providers/Microsoft.PowerApps/apis/shared_logicflows',
      displayName: flowDef.displayName,
      definition: {
        metadata: {
          workflowEntityId: null,
          provisioningMethod: 'FromDefinition',
          failureAlertSubscription: true,
          clientLastModifiedTime: now
        },
        $schema: 'https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#',
        contentVersion: '1.0.0.0',
        parameters: {
          $connections: { defaultValue: {}, type: 'Object' },
          $authentication: { defaultValue: {}, type: 'SecureObject' }
        },
        triggers: flowDef.trigger || {},
        actions: flowDef.actions || {}
      },
      connectionReferences,
      flowFailureAlertSubscribed: false,
      isManaged: false
    }
  };

  // ---- 4. apisMap.json ----
  const apisMap = {};
  connectorNames.forEach(name => { apisMap[name] = apiGuids[name]; });

  // ---- 5. connectionsMap.json ----
  const connectionsMap = {};
  connectorNames.forEach(name => { connectionsMap[name] = connGuids[name]; });

  return { flowGuid, rootManifest, innerManifest, definition, apisMap, connectionsMap };
}

// ---------------------------------------------------------------------------
// Write package to disk and create .zip
// ---------------------------------------------------------------------------
async function createPackageZip(flowDef, outputDirArg) {
  const pkg = buildPackage(flowDef);
  const outputDir = path.resolve(outputDirArg || path.join('output', 'power-automate'));
  const baseName = flowDef.displayName.replace(/[^a-zA-Z0-9]/g, '_');

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Auto-increment version based on existing zips in the output directory
  let version = '1.0.0.0';
  const existingZips = fs.readdirSync(outputDir)
    .filter(f => f.startsWith(baseName + '_') && f.endsWith('.zip'))
    .sort();
  if (existingZips.length > 0) {
    const lastZip = existingZips[existingZips.length - 1];
    const versionMatch = lastZip.replace(baseName + '_', '').replace('.zip', '');
    const parts = versionMatch.split('_').map(Number);
    if (parts.length === 4 && parts.every(n => !isNaN(n))) {
      parts[3] += 1; // increment build number
      version = parts.join('.');
    }
  }

  // Create temp directory for package files
  const tempDir = path.join(outputDir, '_temp_package');
  const flowDir = path.join(tempDir, 'Microsoft.Flow', 'flows');
  const guidDir = path.join(flowDir, pkg.flowGuid);

  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true });
  }
  fs.mkdirSync(guidDir, { recursive: true });

  // Write all 5 files
  const files = [
    [path.join(tempDir, 'manifest.json'), pkg.rootManifest],
    [path.join(flowDir, 'manifest.json'), pkg.innerManifest],
    [path.join(guidDir, 'definition.json'), pkg.definition],
    [path.join(guidDir, 'apisMap.json'), pkg.apisMap],
    [path.join(guidDir, 'connectionsMap.json'), pkg.connectionsMap],
  ];

  files.forEach(([filePath, data]) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`  wrote: ${path.relative(tempDir, filePath)}`);
  });

  // Create zip with forward-slash entry paths.
  // PowerShell's Compress-Archive uses backslashes on Windows, which breaks
  // package imports. Use System.IO.Compression directly instead.
  const zipName = `${baseName}_${version.replace(/\./g, '_')}.zip`;
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
    $entryName = $relativePath -replace '\\\\', '/'
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, $entryName, 'Optimal') | Out-Null
}
$zip.Dispose()
`, 'utf8');

  execSync(`powershell.exe -NoProfile -ExecutionPolicy Bypass -File "${psScript.replace(/\//g, '\\')}"`, { stdio: 'pipe' });
  fs.unlinkSync(psScript);

  console.log(`\nPackage created: ${zipPath}`);
  console.log(`Flow: ${flowDef.displayName}`);
  console.log(`Version: ${version}`);
  console.log(`Flow GUID: ${pkg.flowGuid}`);
  console.log(`\nImport via: Power Automate > My flows > Import > Import Package (Legacy)`);

  // Clean up temp directory
  fs.rmSync(tempDir, { recursive: true, force: true });
  console.log(`Cleaned up temp folder: ${tempDir}`);

  return zipPath;
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Usage: node generate-pa-package.js <flow-definition.json> [output-directory]');
    console.error('');
    console.error('  output-directory  Where to write the .zip (default: output/power-automate/)');
    console.error('');
    console.error('Example:');
    console.error('  node generate-pa-package.js flows/daily-report.json');
    process.exit(1);
  }

  const defPath = path.resolve(args[0]);
  const outputDirArg = args[1] || undefined;

  if (!fs.existsSync(defPath)) {
    console.error(`File not found: ${defPath}`);
    process.exit(1);
  }

  const flowDef = JSON.parse(fs.readFileSync(defPath, 'utf8'));
  console.log(`Generating package for: ${flowDef.displayName}`);

  createPackageZip(flowDef, outputDirArg).catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
}

module.exports = { buildPackage, createPackageZip };
