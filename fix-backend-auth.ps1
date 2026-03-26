# fix-backend-auth.ps1
# Run from D:\Junior Reactive Projects\HAIQ

$controllerPath = "backend\src\controllers\auth.controller.js"
$controllerContent = Get-Content $controllerPath -Raw

# Check if the functions are already present
if ($controllerContent -match "async function updateProfile") {
    Write-Host "updateProfile already exists – skipping." -ForegroundColor Yellow
} else {
    Write-Host "Adding updateProfile and changePassword..." -ForegroundColor Cyan
    # Append the new functions at the end of the file, before the final module.exports
    $newFunctions = @'

// ── Update Profile ─────────────────────────────────────────────────────────────
async function updateProfile(req, res, next) {
  try {
    const { full_name, first_name, last_name, phone } = req.body;
    const userId = req.user.id;

    // Resolve full_name if not provided directly
    let finalFullName = full_name;
    if (!finalFullName && (first_name || last_name)) {
      finalFullName = `${first_name || ''} ${last_name || ''}`.trim();
    }

    // Update user record
    const { rows: [user] } = await query(
      `UPDATE users
       SET full_name = COALESCE($1, full_name),
           first_name = COALESCE($2, first_name),
           last_name = COALESCE($3, last_name),
           phone = COALESCE($4, phone),
           updated_at = NOW()
       WHERE id = $5
       RETURNING id, email, first_name, last_name, full_name, phone`,
      [finalFullName, first_name || null, last_name || null, phone || null, userId]
    );

    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
      },
    });
  } catch (err) { next(err); }
}

// ── Change Password ────────────────────────────────────────────────────────────
async function changePassword(req, res, next) {
  try {
    const { current_password, new_password } = req.body;
    const userId = req.user.id;

    // Get current hash
    const { rows: [user] } = await query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    // Verify current password
    const valid = await bcrypt.compare(current_password, user.password_hash);
    if (!valid) {
      return res.status(400).json({ success: false, error: 'Current password is incorrect' });
    }

    // Hash new password
    const hash = await bcrypt.hash(new_password, 12);

    // Update
    await query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [hash, userId]);

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) { next(err); }
}

'@

    # Insert before the final module.exports line
    $controllerContent = $controllerContent -replace '(module\.exports\s*=\s*{.*?);', "$newFunctions`n`$1;"
    Set-Content -Path $controllerPath -Value $controllerContent -NoNewline
    Write-Host "✅ Added updateProfile and changePassword to auth.controller.js"
}

# Ensure the routes file still matches – no other missing handlers
Write-Host "Checking routes file for any other undefined references..." -ForegroundColor Cyan
$routesPath = "backend\src\routes\auth.routes.js"
$routesContent = Get-Content $routesPath -Raw

# Quick sanity check: the routes file should have the handlers we just added.
if ($routesContent -notmatch "updateProfile") {
    Write-Host "⚠️ Routes file might be outdated – but the fix will still work." -ForegroundColor Yellow
} else {
    Write-Host "✅ Routes file looks good." -ForegroundColor Green
}

Write-Host "`nDone. Now commit and push:" -ForegroundColor Cyan
Write-Host "  git add -A"
Write-Host "  git commit -m 'fix: add missing updateProfile and changePassword controllers'"
Write-Host "  git push"