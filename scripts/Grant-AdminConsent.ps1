#Requires -Modules Microsoft.Graph.Applications, Microsoft.Graph.Identity.SignIns

<#
.SYNOPSIS
    Grants admin consent for the Claude Code M365 Access app registration.

.DESCRIPTION
    This script grants tenant-wide admin consent for all delegated Microsoft Graph
    permissions configured on the Claude Code M365 Access app. Run this as a
    Global Administrator or Privileged Role Administrator.

    This bypasses the browser-based admin consent flow entirely, avoiding
    redirect URI issues.

.PARAMETER AppId
    The Application (client) ID. Defaults to the Claude Code M365 Access app.

.PARAMETER TenantId
    The Azure AD tenant ID. Defaults to the sdicommunications.com tenant.

.EXAMPLE
    .\Grant-AdminConsent.ps1

.EXAMPLE
    .\Grant-AdminConsent.ps1 -AppId "your-app-id" -TenantId "your-tenant-id"

.NOTES
    Prerequisites:
      Install-Module Microsoft.Graph -Scope CurrentUser
#>

param(
    [string]$AppId = "ac8c596a-af20-4a71-aecd-051fb9d5ec8e",
    [string]$TenantId = "addacd33-b591-4fc4-8242-226a07a959a3"
)

$ErrorActionPreference = "Stop"

# --- Step 1: Connect as admin ---
Write-Host "`n=== Step 1: Connecting to Microsoft Graph as admin ===" -ForegroundColor Cyan
Write-Host "You will be prompted to sign in. Use a Global Admin or Privileged Role Admin account.`n"

Connect-MgGraph -TenantId $TenantId -Scopes "Application.Read.All", "DelegatedPermissionGrant.ReadWrite.All"

$context = Get-MgContext
Write-Host "Signed in as: $($context.Account)" -ForegroundColor Green

# --- Step 2: Find the service principal for our app ---
Write-Host "`n=== Step 2: Looking up Claude Code M365 Access service principal ===" -ForegroundColor Cyan

$sp = Get-MgServicePrincipal -Filter "appId eq '$AppId'"
if (-not $sp) {
    Write-Host "ERROR: Service principal not found for AppId '$AppId'." -ForegroundColor Red
    Write-Host "The app registration exists but no Enterprise Application (service principal) was created."
    Write-Host "Fix: Go to App registrations > Claude Code M365 Access > Overview >"
    Write-Host "     click the link under 'Managed application in local directory'."
    Disconnect-MgGraph | Out-Null
    exit 1
}
Write-Host "Found: $($sp.DisplayName) (ObjectId: $($sp.Id))" -ForegroundColor Green

# --- Step 3: Find Microsoft Graph service principal ---
Write-Host "`n=== Step 3: Looking up Microsoft Graph service principal ===" -ForegroundColor Cyan

$graphSp = Get-MgServicePrincipal -Filter "appId eq '00000003-0000-0000-c000-000000000000'"
if (-not $graphSp) {
    Write-Host "ERROR: Microsoft Graph service principal not found in this tenant." -ForegroundColor Red
    Disconnect-MgGraph | Out-Null
    exit 1
}
Write-Host "Found: $($graphSp.DisplayName) (ObjectId: $($graphSp.Id))" -ForegroundColor Green

# --- Step 4: Get the delegated permissions configured on the app ---
Write-Host "`n=== Step 4: Reading configured delegated permissions ===" -ForegroundColor Cyan

$app = Get-MgApplication -Filter "appId eq '$AppId'"
$graphResourceAccess = $app.RequiredResourceAccess | Where-Object {
    $_.ResourceAppId -eq "00000003-0000-0000-c000-000000000000"
}

if (-not $graphResourceAccess) {
    Write-Host "ERROR: No Microsoft Graph permissions configured on the app registration." -ForegroundColor Red
    Disconnect-MgGraph | Out-Null
    exit 1
}

# Filter to delegated permissions only (Type = "Scope"), not application permissions (Type = "Role")
$delegatedPermissionIds = $graphResourceAccess.ResourceAccess |
    Where-Object { $_.Type -eq "Scope" } |
    Select-Object -ExpandProperty Id

# Resolve permission IDs to scope names
$scopeNames = @()
foreach ($permId in $delegatedPermissionIds) {
    $perm = $graphSp.Oauth2PermissionScopes | Where-Object { $_.Id -eq $permId }
    if ($perm) {
        $scopeNames += $perm.Value
        Write-Host "  $($perm.Value)" -ForegroundColor Gray
    } else {
        Write-Host "  [UNKNOWN] Permission ID: $permId" -ForegroundColor Yellow
    }
}

if ($scopeNames.Count -eq 0) {
    Write-Host "ERROR: No delegated (Scope) permissions found." -ForegroundColor Red
    Disconnect-MgGraph | Out-Null
    exit 1
}

$scopeString = $scopeNames -join " "
Write-Host "`nTotal delegated permissions: $($scopeNames.Count)" -ForegroundColor Green

# --- Step 5: Remove existing consent grants (clean slate) ---
Write-Host "`n=== Step 5: Removing any existing consent grants ===" -ForegroundColor Cyan

$existingGrants = Get-MgOauth2PermissionGrant -All | Where-Object {
    $_.ClientId -eq $sp.Id -and $_.ResourceId -eq $graphSp.Id
}
foreach ($grant in $existingGrants) {
    Remove-MgOauth2PermissionGrant -OAuth2PermissionGrantId $grant.Id
    Write-Host "Removed existing grant: $($grant.Id)" -ForegroundColor Yellow
}
if (-not $existingGrants) {
    Write-Host "No existing grants to remove." -ForegroundColor Gray
}

# --- Step 6: Create new admin consent grant ---
Write-Host "`n=== Step 6: Granting admin consent for all delegated permissions ===" -ForegroundColor Cyan

$params = @{
    clientId    = $sp.Id
    consentType = "AllPrincipals"
    resourceId  = $graphSp.Id
    scope       = $scopeString
}

$grant = New-MgOauth2PermissionGrant -BodyParameter $params
Write-Host "Admin consent granted successfully!" -ForegroundColor Green
Write-Host "Grant ID: $($grant.Id)"

# --- Step 7: Verify ---
Write-Host "`n=== Step 7: Verifying consent ===" -ForegroundColor Cyan

$verification = Get-MgOauth2PermissionGrant -All | Where-Object {
    $_.ClientId -eq $sp.Id -and $_.ResourceId -eq $graphSp.Id
}
if ($verification) {
    Write-Host "Verified: Consent grant exists with scopes:" -ForegroundColor Green
    $verification.Scope -split " " | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
} else {
    Write-Host "WARNING: Could not verify consent grant." -ForegroundColor Yellow
}

# --- Step 8: Check app configuration ---
Write-Host "`n=== Step 8: App configuration check ===" -ForegroundColor Cyan

if ($app.IsFallbackPublicClient) {
    Write-Host "[OK] Public client flows: Enabled" -ForegroundColor Green
} else {
    Write-Host "[!!] Public client flows: DISABLED - device code login will fail" -ForegroundColor Red
    Write-Host "     Fix: App registrations > Authentication > Allow public client flows > Yes"
}

$nativeRedirect = "https://login.microsoftonline.com/common/oauth2/nativeclient"
$hasNativeRedirect = $app.PublicClient.RedirectUris -contains $nativeRedirect
if ($hasNativeRedirect) {
    Write-Host "[OK] Native client redirect URI: Configured" -ForegroundColor Green
} else {
    Write-Host "[!!] Native client redirect URI: MISSING" -ForegroundColor Red
    Write-Host "     Fix: App registrations > Authentication > Mobile and desktop > Add:"
    Write-Host "     $nativeRedirect"
}

if ($sp.AppRoleAssignmentRequired) {
    Write-Host "[!!] Assignment required: YES - only assigned users can sign in" -ForegroundColor Yellow
    Write-Host "     If users are blocked, set to No or assign them under Enterprise Apps > Users and groups"
} else {
    Write-Host "[OK] Assignment required: No (all tenant users can sign in)" -ForegroundColor Green
}

if ($sp.AccountEnabled) {
    Write-Host "[OK] App enabled for sign-in: Yes" -ForegroundColor Green
} else {
    Write-Host "[!!] App enabled for sign-in: NO - users cannot sign in" -ForegroundColor Red
    Write-Host "     Fix: Enterprise Applications > Properties > Enabled for users to sign-in > Yes"
}

if ($app.Web.RedirectUris.Count -gt 0) {
    Write-Host "[!!] Web redirect URIs detected: $($app.Web.RedirectUris -join ', ')" -ForegroundColor Yellow
    Write-Host "     These can interfere with admin consent flows. Remove unless specifically needed."
}

Write-Host "`n=== Done ===" -ForegroundColor Cyan
Write-Host "Next step: The user should now run the device code login flow."
Write-Host "In Claude Code, the MCP server will provide a device code to enter at https://login.microsoft.com/device`n"

Disconnect-MgGraph | Out-Null
