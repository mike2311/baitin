# Fix test imports to use createMinimalTestApp instead of createTestApp

$testFiles = Get-ChildItem -Path "src" -Filter "*.spec.ts" -Recurse | Where-Object { 
    $content = Get-Content $_.FullName -Raw
    $content -match "createTestApp"
}

Write-Host "Found $($testFiles.Count) test files to update"

foreach ($file in $testFiles) {
    Write-Host "Updating $($file.Name)..."
    
    $content = Get-Content $file.FullName -Raw
    
    # Add import for createMinimalTestApp if it uses createTestApp
    if ($content -match "from '\.\./test-utils/test-helpers'") {
        $content = $content -replace "from '\.\./test-utils/test-helpers'", "from '../test-utils/test-helpers';`nimport { createMinimalTestApp } from '../test-utils/minimal-test-app'"
    } elseif ($content -match "from '\./test-utils/test-helpers'") {
        $content = $content -replace "from '\./test-utils/test-helpers'", "from './test-utils/test-helpers';`nimport { createMinimalTestApp } from './test-utils/minimal-test-app'"
    }
    
    # Replace createTestApp() with createMinimalTestApp()
    $content = $content -replace "await createTestApp\(\)", "await createMinimalTestApp()"
    
    # Write back
    Set-Content -Path $file.FullName -Value $content -NoNewline
}

Write-Host "✅ All test files updated"
