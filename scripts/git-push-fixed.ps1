# Git push wrapper that uses store credential helper
# This bypasses the manager helper that's failing with wincredman
# Usage: .\scripts\git-push-fixed.ps1 [git push arguments]

param(
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$GitArgs
)

# Use store credential helper and clear any others
$pushArgs = @('-c', 'credential.helper=store', '-c', 'credential.helper=', 'push') + $GitArgs
& git $pushArgs

