$content = Get-Content 'prisma\schema.prisma' -Raw

# Fix broken Json->String replacements that left dangling @default("[]")
# Pattern: String?"[]") -> String? @default("[]")
# Pattern: String"[]") -> String @default("[]")
$content = $content -replace 'String\?""\[\]""\)', 'String? @default("[]")'
$content = $content -replace 'String""\[\]""\)', 'String @default("[]")'

Set-Content 'prisma\schema.prisma' $content
Write-Host "Done"
