# fix-frontend.ps1
# Run from D:\Junior Reactive Projects\HAIQ

$frontendPath = ".\frontend\src"

# ------------------------------
# 1. Fix App.jsx – remove nested HelmetProvider
# ------------------------------
$appFile = Join-Path $frontendPath "App.jsx"
$appContent = Get-Content $appFile -Raw

# Remove the outer HelmetProvider wrapper
# The pattern: <HelmetProvider> ... </HelmetProvider> that wraps the whole App
$fixedApp = $appContent -replace '<HelmetProvider>\s*', '' -replace '\s*</HelmetProvider>', ''
# Also ensure imports stay – if HelmetProvider is no longer used, remove import line
$fixedApp = $fixedApp -replace "import \{ HelmetProvider \} from 'react-helmet-async';?\s*", ''

Set-Content -Path $appFile -Value $fixedApp -NoNewline
Write-Host "✅ Fixed App.jsx (removed nested HelmetProvider)"

# ------------------------------
# 2. Update AuthContext.jsx to use window.__haiq_access_token
# ------------------------------
$authFile = Join-Path $frontendPath "context\AuthContext.jsx"
$authContent = Get-Content $authFile -Raw

# Replace localStorage.getItem(TOKEN_KEY) with window.__haiq_access_token
$authContent = $authContent -replace 'localStorage\.getItem\(TOKEN_KEY\)', 'window.__haiq_access_token'
$authContent = $authContent -replace 'localStorage\.setItem\(TOKEN_KEY, access_token\)', 'window.__haiq_access_token = access_token'
$authContent = $authContent -replace 'localStorage\.removeItem\(TOKEN_KEY\)', 'window.__haiq_access_token = null'

# Also fix any reference to 'haiq_access_token' variable name in the context
$authContent = $authContent -replace 'const TOKEN_KEY = .+;', '// TOKEN_KEY is not used anymore; token stored in window.__haiq_access_token'

# Ensure api.js header setting is consistent – api.js already uses window.__haiq_access_token
# No further change needed.

Set-Content -Path $authFile -Value $authContent -NoNewline
Write-Host "✅ Updated AuthContext.jsx to use window.__haiq_access_token"

Write-Host "`nDone. Restart your frontend dev server (Ctrl+C, then npm run dev)."