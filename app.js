// cPanel Passenger entry point for Next.js
// Passenger sets PORT automatically, Next.js standalone reads it
const path = require("path");
const fs = require("fs");

// Load .env file manually for production
const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
    require("dotenv").config({ path: envPath });
}

// Also load .env.production if it exists
const envProdPath = path.join(__dirname, ".env.production");
if (fs.existsSync(envProdPath)) {
    require("dotenv").config({ path: envProdPath, override: true });
}

// Boot the Next.js standalone server
// It reads PORT from environment (Passenger sets this automatically)
require("./.next/standalone/server.js");
