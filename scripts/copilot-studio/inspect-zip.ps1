Add-Type -AssemblyName System.IO.Compression.FileSystem
$zipPath = $args[0]
$z = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
foreach ($entry in $z.Entries) {
    Write-Output "[$($entry.FullName)]"
}
$z.Dispose()
