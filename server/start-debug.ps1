$env:NODE_ENV = "development"
node src/index.js 2>&1 | Tee-Object -FilePath debug.log
