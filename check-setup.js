#!/usr/bin/env node

/**
 * FloodSense Setup Checker
 * Verifies that the development environment is properly configured
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, readFileSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.blue}${msg}${colors.reset}`),
};

async function checkFile(path, name) {
  if (existsSync(path)) {
    log.success(`${name} exists`);
    return true;
  } else {
    log.error(`${name} not found at ${path}`);
    return false;
  }
}

async function checkEnvFile(path, requiredVars) {
  if (!existsSync(path)) {
    log.error(`.env file not found at ${path}`);
    log.info('Run: cp .env.example .env');
    return false;
  }

  const content = readFileSync(path, 'utf-8');
  let allPresent = true;

  for (const varName of requiredVars) {
    if (content.includes(`${varName}=`)) {
      log.success(`${varName} is configured`);
    } else {
      log.error(`${varName} is missing`);
      allPresent = false;
    }
  }

  return allPresent;
}

async function checkPort(port, service) {
  try {
    const response = await fetch(`http://localhost:${port}/api/ping`);
    if (response.ok) {
      log.success(`${service} is running on port ${port}`);
      return true;
    }
  } catch (error) {
    log.error(`${service} is not running on port ${port}`);
    return false;
  }
}

async function checkMongoDB() {
  try {
    // Try to connect to MongoDB
    const { stdout } = await execAsync('mongosh --eval "db.version()" --quiet');
    if (stdout) {
      log.success(`MongoDB is accessible (version: ${stdout.trim()})`);
      return true;
    }
  } catch (error) {
    log.error('MongoDB is not accessible');
    log.info('Ensure MongoDB is running: mongod');
    return false;
  }
}

async function checkNodeModules(path, name) {
  const nodeModulesPath = join(path, 'node_modules');
  if (existsSync(nodeModulesPath)) {
    log.success(`${name} dependencies installed`);
    return true;
  } else {
    log.error(`${name} dependencies not installed`);
    log.info(`Run: cd ${path} && npm install`);
    return false;
  }
}

async function main() {
  console.log(`
${colors.blue}╔═══════════════════════════════════════╗
║   FloodSense Setup Checker v1.0.0     ║
╚═══════════════════════════════════════╝${colors.reset}
`);

  const serverPath = join(__dirname, 'server');
  const clientPath = join(__dirname, 'client');

  // Check Server Setup
  log.section('📦 Checking Server Setup...');
  await checkFile(join(serverPath, 'package.json'), 'Server package.json');
  await checkNodeModules(serverPath, 'Server');
  await checkEnvFile(join(serverPath, '.env'), [
    'MONGODB_URI',
    'JWT_SECRET',
    'PORT',
    'CLIENT_URL',
  ]);

  // Check Client Setup
  log.section('📦 Checking Client Setup...');
  await checkFile(join(clientPath, 'package.json'), 'Client package.json');
  await checkNodeModules(clientPath, 'Client');
  await checkEnvFile(join(clientPath, '.env'), [
    'VITE_API_URL',
    'VITE_SOCKET_URL',
  ]);

  // Check Services
  log.section('🔌 Checking Services...');
  await checkMongoDB();
  await checkPort(5000, 'Backend API');

  // Check CORS Configuration
  log.section('🌐 Checking CORS Configuration...');
  const serverEnvPath = join(serverPath, '.env');
  if (existsSync(serverEnvPath)) {
    const serverEnv = readFileSync(serverEnvPath, 'utf-8');
    if (serverEnv.includes('CLIENT_URL=http://localhost:5173')) {
      log.success('CLIENT_URL correctly set to http://localhost:5173');
    } else {
      log.warning('CLIENT_URL may not match frontend URL');
      log.info('Set CLIENT_URL=http://localhost:5173 in server/.env');
    }
  }

  console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}\n`);
  log.info('Setup check complete!');
  log.info('If you see errors above, follow the suggestions to fix them.');
  log.info('For detailed setup instructions, see SETUP.md');
}

main().catch((error) => {
  console.error('Error running setup checker:', error);
  process.exit(1);
});
