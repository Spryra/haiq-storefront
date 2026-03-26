# fix-admin-html.ps1
$adminIndex = "admin\index.html"

$cleanHtml = @'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/crown.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex, nofollow" />
    <title>HAIQ Admin</title>
    <meta name="theme-color" content="#1A0A00" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
'@

Set-Content -Path $adminIndex -Value $cleanHtml -NoNewline
Write-Host "✅ Fixed admin/index.html"