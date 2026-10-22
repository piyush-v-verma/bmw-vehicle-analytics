## Update all BMW images to high‑quality front‑3/4 view
# Requires PowerShell 5+ and internet access.
# This script:
# 1. Reads dataset/bmw_specs.csv to map generation_id -> model name.
# 2. Checks each existing image in public/images/bmw/ for size/width thresholds.
# 3. For any image below threshold, queries Wikimedia Commons for a suitable image.
# 4. Downloads the first suitable image, resizes to 640px width, and overwrites the local file.
# 5. Updates dataset/bmw_images.csv with the source URL and verification status.

$specCsv = "C:\Temp\dataset\bmw_specs.csv"
$imageDir = "C:\Temp\public\images\bmw"
$manifest = "C:\Temp\dataset\bmw_images.csv"

# Thresholds (adjust if needed)
$minSizeKB = 50
$minWidth = 600

# Helper: get image dimensions
function Get-ImageInfo($path) {
    Add-Type -AssemblyName System.Drawing
    try {
        $img = [System.Drawing.Image]::FromFile($path)
        $width = $img.Width
        $height = $img.Height
        $img.Dispose()
        return @{Width=$width; Height=$height}
    } catch {
        return $null
    }
}

# Load specs into a hashtable: generation_id -> model_name
$specs = @{}
$csvLines = Get-Content $specCsv
$header = $csvLines[0].Split(',')
$gidIdx = $header.IndexOf('generation_id')
$modelIdx = $header.IndexOf('model_name')
for ($i = 1; $i -lt $csvLines.Count; $i++) {
    $cols = $csvLines[$i].Split(',')
    $gid = $cols[$gidIdx].Trim()
    $model = $cols[$modelIdx].Trim()
    $specs[$gid] = $model
}

# Ensure manifest exists with header
if (-not (Test-Path $manifest)) {
    "generation_id,model_name,generation_code,production_years,body_style,image_path,source_page_url,direct_image_url,license_or_usage_notes,verification_status" | Out-File -FilePath $manifest -Encoding utf8
}

# Function to query Wikimedia Commons for an image URL
function Get-WikimediaImageUrl($searchTerm) {
    $api = "https://commons.wikimedia.org/w/api.php"
    $params = @{
        action = 'query'
        list = 'search'
        srsearch = $searchTerm
        srlimit = 5
        format = 'json'
    }
    $url = $api + "?" + ($params.GetEnumerator() | ForEach-Object { "{0}={1}" -f $_.Key, [uri]::EscapeDataString($_.Value) }) -join '&'
    try {
        $resp = Invoke-WebRequest -Uri $url -UseBasicParsing -Headers @{ 'User-Agent' = 'BMWImageUpdater/1.0 (https://github.com/piyush-v-verma/bmw-vehicle-analytics)' }
        $json = $resp.Content | ConvertFrom-Json
        foreach ($result in $json.query.search) {
            $title = $result.title
            # Get image info for this title
            $imgParams = @{
                action = 'query'
                titles = $title
                prop = 'imageinfo'
                iiprop = 'url|mime|size|metadata'
                format = 'json'
            }
            $imgUrl = $api + "?" + ($imgParams.GetEnumerator() | ForEach-Object { "{0}={1}" -f $_.Key, [uri]::EscapeDataString($_.Value) }) -join '&'
            $imgResp = Invoke-WebRequest -Uri $imgUrl -UseBasicParsing -Headers @{ 'User-Agent' = 'BMWImageUpdater/1.0' }
            $imgJson = $imgResp.Content | ConvertFrom-Json
            foreach ($page in $imgJson.query.pages.Values) {
                if ($page.imageinfo) {
                    $url = $page.imageinfo[0].url
                    $mime = $page.imageinfo[0].mime
                    if ($mime -like 'image/jpeg' -or $mime -like 'image/png') {
                        return $url
                    }
                }
            }
        }
    } catch {
        Write-Host "Wikimedia query failed: $_"
    }
    return $null
}

# Process each generation
foreach ($gid in $specs.Keys) {
    $modelName = $specs[$gid]
    $imagePath = Join-Path $imageDir ("$gid.jpg")
    $needsUpdate = $false
    if (-not (Test-Path $imagePath)) { $needsUpdate = $true }
    else {
        $sizeKB = (Get-Item $imagePath).Length / 1KB
        $info = Get-ImageInfo $imagePath
        if ($sizeKB -lt $minSizeKB -or $info.Width -lt $minWidth) { $needsUpdate = $true }
    }
    if ($needsUpdate) {
        Write-Host "Updating image for $gid ($modelName)"
        $search = "BMW $modelName front 3/4" 
        $url = Get-WikimediaImageUrl $search
        if ($url) {
            $tempFile = Join-Path $env:TEMP ("temp_$gid.jpg")
            Invoke-WebRequest -Uri $url -OutFile $tempFile -Headers @{ 'User-Agent' = 'BMWImageUpdater/1.0' }
            # Resize to 640px width, keep aspect ratio
            Add-Type -AssemblyName System.Drawing
            $img = [System.Drawing.Image]::FromFile($tempFile)
            $newWidth = 640
            $newHeight = [int]($img.Height * $newWidth / $img.Width)
            $bitmap = New-Object System.Drawing.Bitmap $newWidth, $newHeight
            $graph = [System.Drawing.Graphics]::FromImage($bitmap)
            $graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $graph.DrawImage($img, 0, 0, $newWidth, $newHeight)
            $bitmap.Save($imagePath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
            $graph.Dispose()
            $bitmap.Dispose()
            $img.Dispose()
            Remove-Item $tempFile
            # Update manifest (append or replace line)
            $existing = Select-String -Path $manifest -Pattern "^$gid,"
            $newLine = "$gid,$modelName,,,,,$imagePath,$url,CC-BY?,Verified"
            if ($existing) {
                (Get-Content $manifest) | ForEach-Object { if ($_ -match "^$gid,") { $newLine } else { $_ } } | Set-Content $manifest
            } else {
                Add-Content -Path $manifest -Value $newLine
            }
        } else {
            Write-Host "No suitable image found for $gid"
        }
        # Respect rate‑limit
        Start-Sleep -Seconds 2
    }
}

Write-Host "Image update process completed."
