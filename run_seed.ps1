$env:DATABASE_URL = "file:./prisma/dev.db"
$env:AUTH_SECRET = "agromaint-pro-dev-secret-32-chars-min"
$env:NEXTAUTH_SECRET = "agromaint-pro-dev-secret-32-chars-min"
$env:NODE_ENV = "development"

Write-Host "Ejecutando seed..."
& cmd /c "npx ts-node --compiler-options `"{`\`"module`\`":`\`"CommonJS`\`"}`" prisma/seed.ts 2>&1"
