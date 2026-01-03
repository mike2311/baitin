# Git push wrapper that uses store credential helper
# This bypasses the manager helper that's failing with wincredman

$gitArgs = $args
$allArgs = @('-c', 'credential.helper=store', '-c', 'credential.helper=', 'push') + $gitArgs
& git $allArgs

