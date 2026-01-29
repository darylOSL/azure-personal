# Complete Guide: Deploying a Full-Stack Node.js/React App to Azure App Services

This guide walks you through creating a full-stack application (Node.js/Express backend + React frontend) and deploying it to Azure App Services using the Azure CLI.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Setup](#project-setup)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Local Testing](#local-testing)
6. [Azure CLI Setup](#azure-cli-setup)
7. [Azure Resource Creation](#azure-resource-creation)
8. [Preparing for Deployment](#preparing-for-deployment)
9. [Creating the Deployment Package](#creating-the-deployment-package)
10. [Deploying to Azure](#deploying-to-azure)
11. [Verification and Testing](#verification-and-testing)
12. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

- **Node.js** (v14 or higher) installed
- **npm** (comes with Node.js)
- **Azure CLI** installed ([Installation Guide](https://docs.microsoft.com/cli/azure/install-azure-cli))
- **Azure account** with an active subscription
- **PowerShell** (Windows) or **Bash** (Linux/Mac)

---

## Project Setup

### 1. Create Project Structure

Create a new directory for your project:

```bash
mkdir azure-personal
cd azure-personal
```

Your project structure will be:

```
azure-personal/
├── backend/
│   ├── server.js
│   └── package.json
└── frontend/
    ├── src/
    ├── public/
    └── package.json
```

---

## Backend Setup

### 1. Create Backend Directory

```bash
mkdir backend
cd backend
```

### 2. Initialize npm and Install Dependencies

```bash
npm init -y
npm install express cors
npm install --save-dev nodemon
```

### 3. Create `backend/package.json`

Edit `package.json` to match:

```json
{
  "name": "backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### 4. Create `backend/server.js`

Create the Express server:

```javascript
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Backend is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/data', (req, res) => {
  res.json({
    message: 'Hello from the backend!',
    data: [
      { id: 1, name: 'Item 1', description: 'First item' },
      { id: 2, name: 'Item 2', description: 'Second item' },
      { id: 3, name: 'Item 3', description: 'Third item' }
    ]
  });
});

app.post('/api/message', (req, res) => {
  const { message } = req.body;
  res.json({
    success: true,
    echo: `You said: ${message}`,
    timestamp: new Date().toISOString()
  });
});

// Serve React app in production (handle client-side routing)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

**Key Points:**
- Uses `process.env.PORT` for Azure (Azure sets this automatically)
- Serves React build files in production mode
- Handles client-side routing with `app.get('*')`

---

## Frontend Setup

### 1. Create React App

From the project root:

```bash
cd ..
npx create-react-app frontend
cd frontend
```

### 2. Update `frontend/src/App.js`

Replace the default App.js with:

```javascript
import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [health, setHealth] = useState(null);
  const [data, setData] = useState(null);
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  // Use relative URL in production (empty string), or localhost in development
  const API_URL = process.env.REACT_APP_API_URL || '';

  useEffect(() => {
    // Check backend health
    fetch(`${API_URL}/api/health`)
      .then(res => res.json())
      .then(data => setHealth(data))
      .catch(err => console.error('Health check failed:', err));

    // Fetch data
    fetch(`${API_URL}/api/data`)
      .then(res => res.json())
      .then(data => setData(data))
      .catch(err => console.error('Data fetch failed:', err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      setResponse(data);
      setMessage('');
    } catch (err) {
      console.error('Message send failed:', err);
      setResponse({ success: false, error: 'Failed to send message' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Azure Test App</h1>
        <p>Frontend + Backend</p>
      </header>

      <main className="App-main">
        <section className="status-section">
          <h2>Backend Status</h2>
          {health ? (
            <div className="status-card success">
              <p><strong>Status:</strong> {health.status}</p>
              <p><strong>Message:</strong> {health.message}</p>
              <p><strong>Timestamp:</strong> {health.timestamp}</p>
            </div>
          ) : (
            <div className="status-card error">
              <p>Connecting to backend...</p>
            </div>
          )}
        </section>

        <section className="data-section">
          <h2>Sample Data</h2>
          {data ? (
            <div className="data-card">
              <p className="data-message">{data.message}</p>
              <ul className="data-list">
                {data.data.map(item => (
                  <li key={item.id}>
                    <strong>{item.name}:</strong> {item.description}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>Loading data...</p>
          )}
        </section>

        <section className="message-section">
          <h2>Send a Message</h2>
          <form onSubmit={handleSubmit} className="message-form">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message"
              className="message-input"
              required
            />
            <button type="submit" disabled={loading} className="submit-button">
              {loading ? 'Sending...' : 'Send'}
            </button>
          </form>
          {response && (
            <div className={`response-card ${response.success ? 'success' : 'error'}`}>
              <p><strong>Response:</strong> {response.echo || response.error}</p>
              {response.timestamp && (
                <p><strong>Timestamp:</strong> {response.timestamp}</p>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
```

**Key Points:**
- Uses `process.env.REACT_APP_API_URL || ''` for relative URLs in production
- Empty string means requests go to the same domain (works on Azure)

---

## Local Testing

### 1. Start Backend (Terminal 1)

```bash
cd backend
npm start
```

Backend runs on `http://localhost:3001`

### 2. Start Frontend (Terminal 2)

```bash
cd frontend
npm start
```

Frontend runs on `http://localhost:3000` and opens automatically.

### 3. Test API Endpoints

- Health: `http://localhost:3001/api/health`
- Data: `http://localhost:3001/api/data`
- Message: POST to `http://localhost:3001/api/message`

### 4. Verify Everything Works Locally

- Frontend should display backend status
- Sample data should load
- Message form should work

**Only proceed to Azure deployment once local testing is successful!**

---

## Azure CLI Setup

### 1. Login to Azure

```bash
az login
```

This opens a browser for authentication.

### 2. Verify Login

```bash
az account show
```

### 3. Set Variables (Optional but Recommended)

In PowerShell:

```powershell
$RESOURCE_GROUP = "OSL-Daryl-Test"  # Your resource group name
$APP_NAME = "daryltest-2024-001"     # Your app name (must be globally unique)
$LOCATION = "canadacentral"          # Your preferred location
```

In Bash:

```bash
export RESOURCE_GROUP="OSL-Daryl-Test"
export APP_NAME="daryltest-2024-001"
export LOCATION="canadacentral"
```

---

## Azure Resource Creation

### 1. Create Resource Group (if it doesn't exist)

```bash
az group create --name $RESOURCE_GROUP --location $LOCATION
```

Or use an existing resource group from the Azure Portal.

### 2. Create App Service Plan

```bash
az appservice plan create \
  --name "$APP_NAME-plan" \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --sku FREE \
  --is-linux
```

**Important:** The `--is-linux` flag is **required** for Linux App Service.

### 3. Verify App Service Plan

```bash
az appservice plan show \
  --name "$APP_NAME-plan" \
  --resource-group $RESOURCE_GROUP \
  --query "{kind:kind, reserved:reserved}"
```

Should return:
```json
{
  "kind": "app,linux",
  "reserved": true
}
```

If `reserved: false`, the plan is Windows. Delete and recreate with `--is-linux`.

### 4. Set Node.js Version

Check available versions:

```bash
az webapp list-runtimes --os-type linux --query "[?contains(name, 'NODE')]"
```

Set Node.js version (e.g., 22):

```bash
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan "$APP_NAME-plan" \
  --name $APP_NAME \
  --runtime "NODE:22-lts"
```

### 5. Verify Web App Created

```bash
az webapp show \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME \
  --query "{state:state, defaultHostName:defaultHostName, kind:kind, reserved:reserved}"
```

Should show:
- `state: "Running"`
- `kind: "app,linux"`
- `reserved: true`

---

## Preparing for Deployment

### 1. Build Frontend for Production

```bash
cd frontend
npm run build
cd ..
```

This creates the `frontend/build` directory with optimized production files.

### 2. Verify Build Output

Check that `frontend/build/index.html` exists.

---

## Creating the Deployment Package

**CRITICAL:** The zip file must use **forward slashes** (`/`) for paths, not Windows backslashes (`\`). This is essential for Linux App Service.

### PowerShell Script (Windows)

Create and run this script from your project root:

```powershell
# Remove old zip if it exists
if (Test-Path "deploy.zip") { Remove-Item "deploy.zip" -Force }

# Load required .NET classes
Add-Type -AssemblyName System.IO.Compression

# Get current directory
$currentDir = Get-Location
$zipPath = Join-Path $currentDir "deploy.zip"

# Create new zip file
$zip = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)

# Function to add a file to zip with forward slashes
function Add-ToZip {
    param($file, $zipEntry)
    if (Test-Path $file) {
        $entry = $zip.CreateEntry($zipEntry.Replace('\', '/'))
        $fileBytes = [System.IO.File]::ReadAllBytes($file)
        $entryStream = $entry.Open()
        $entryStream.Write($fileBytes, 0, $fileBytes.Length)
        $entryStream.Close()
        Write-Host "✓ Added: $zipEntry"
    }
}

# Add backend files
$backendDir = Join-Path $currentDir "backend"
Add-ToZip (Join-Path $backendDir "server.js") "backend/server.js"
Add-ToZip (Join-Path $backendDir "package.json") "backend/package.json"
if (Test-Path (Join-Path $backendDir "package-lock.json")) {
    Add-ToZip (Join-Path $backendDir "package-lock.json") "backend/package-lock.json"
}

# Add frontend build files
$buildDir = Join-Path $currentDir "frontend\build"
if (Test-Path $buildDir) {
    Get-ChildItem -Path $buildDir -Recurse -File | ForEach-Object {
        $relativePath = $_.FullName.Replace($buildDir, "").TrimStart('\')
        $zipEntry = "frontend/build/$relativePath".Replace('\', '/')
        Add-ToZip $_.FullName $zipEntry
    }
}

# Close zip
$zip.Dispose()
Write-Host "`n✓ deploy.zip created successfully!"
```

### Verify Zip Contents

```powershell
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead("deploy.zip")
$zip.Entries | Select-Object FullName | Format-Table -AutoSize
$zip.Dispose()
```

**All paths should show forward slashes:**
- ✅ `backend/server.js`
- ✅ `frontend/build/index.html`
- ❌ NOT `backend\server.js`
- ❌ NOT `frontend\build\index.html`

### What NOT to Include

- ❌ `node_modules/` (Azure installs these)
- ❌ `frontend/src/` (only include `frontend/build/`)
- ❌ `.git/` folder
- ❌ `.env` files

---

## ⚠️ Common Pitfalls to Avoid

Before deploying, make sure:

1. ✅ **App Service Plan is Linux** - Check with:
   ```bash
   az appservice plan show --name "$APP_NAME-plan" --resource-group $RESOURCE_GROUP --query "{reserved:reserved}"
   ```
   Must show `"reserved": true`

2. ✅ **Startup command is set** - Check with:
   ```bash
   az webapp config show --resource-group $RESOURCE_GROUP --name $APP_NAME --query "{startupCommand:siteConfig.appCommandLine}"
   ```
   Must NOT be `null`

3. ✅ **Web app is running** - Check with:
   ```bash
   az webapp show --resource-group $RESOURCE_GROUP --name $APP_NAME --query "{state:state}"
   ```
   Must show `"state": "Running"`

4. ✅ **Zip file uses forward slashes** - Verify with:
   ```powershell
   Add-Type -AssemblyName System.IO.Compression.FileSystem
   $zip = [System.IO.Compression.ZipFile]::OpenRead("deploy.zip")
   $zip.Entries | Select-Object FullName | Format-Table -AutoSize
   $zip.Dispose()
   ```
   All paths should use `/` not `\`

5. ✅ **No node_modules in zip** - The zip should only contain:
   - `backend/server.js`
   - `backend/package.json`
   - `frontend/build/` (entire folder)

---

## Deploying to Azure

### 1. Ensure Web App is Running

```bash
az webapp start --resource-group $RESOURCE_GROUP --name $APP_NAME
```

Wait a few seconds, then verify:
```bash
az webapp show --resource-group $RESOURCE_GROUP --name $APP_NAME --query "{state:state}"
```

Should show `"state": "Running"`.

### 2. Set Startup Command ⚠️ REQUIRED

**IMPORTANT:** This step is **critical** and must be done before deployment. Without it, your app won't start.

This tells Azure how to start your Node.js application:

```bash
az webapp config set \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME \
  --startup-file "cd backend && npm install && node server.js"
```

**Verify it was set correctly:**
```bash
az webapp config show \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME \
  --query "{startupCommand:siteConfig.appCommandLine}"
```

Should show: `"startupCommand": "cd backend && npm install && node server.js"`

If it shows `null`, run the set command again.

### 3. Set Environment Variables

```bash
az webapp config appsettings set \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME \
  --settings NODE_ENV=production
```

**Verify:**
```bash
az webapp config appsettings list \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME \
  --query "[?name=='NODE_ENV']"
```

Should show `NODE_ENV=production`.

### 4. Deploy the Zip File

**Only proceed after steps 1-3 are complete and verified!**

```bash
az webapp deploy \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME \
  --src-path deploy.zip \
  --type zip
```

### 5. Monitor Deployment

```bash
az webapp log tail \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME
```

Look for:
- "Server is running on port..."
- No error messages

Press `Ctrl+C` to stop tailing.

---

## Verification and Testing

### 1. Check Deployment Status

```bash
az webapp deployment list \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME \
  --query "[0].{status:status, message:message, active:active}" \
  --output table
```

### 2. Test in Browser

Open your app URL:
```
https://daryltest-2024-001.azurewebsites.net
```

You should see:
- Your React app
- Backend status showing "ok"
- Sample data loading
- Working message form

### 3. Test API Directly

Health endpoint:
```bash
curl https://daryltest-2024-001.azurewebsites.net/api/health
```

Or open in browser:
```
https://daryltest-2024-001.azurewebsites.net/api/health
```

Should return:
```json
{
  "status": "ok",
  "message": "Backend is running",
  "timestamp": "2026-01-29T..."
}
```

### 4. Check Application Logs

```bash
az webapp log tail \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME
```

---

## Troubleshooting

### Problem: "Error 403 - This web app is stopped"

**Solution:** Start the web app:
```bash
az webapp start --resource-group $RESOURCE_GROUP --name $APP_NAME
```

### Problem: rsync errors with "Invalid argument (22)"

**Cause:** Zip file contains Windows backslashes (`\`) instead of forward slashes (`/`).

**Solution:** Recreate the zip using the PowerShell script above that uses `.NET ZipFile` class.

### Problem: "You do not have permission to view this directory or page"

**Cause:** Node.js server isn't starting.

**Solutions:**
1. Check startup command is set:
   ```bash
   az webapp config show --resource-group $RESOURCE_GROUP --name $APP_NAME --query "{startupCommand:siteConfig.appCommandLine}"
   ```
2. Check application logs:
   ```bash
   az webapp log tail --resource-group $RESOURCE_GROUP --name $APP_NAME
   ```
3. Verify `package.json` exists in `backend/` folder in the zip.

### Problem: App Service Plan is Windows instead of Linux

**Symptoms:**
- `az appservice plan show` shows `"reserved": false`
- `az webapp show` shows `"kind": "app"` (not `"app,linux"`)

**Solution:**
1. Delete the web app:
   ```bash
   az webapp delete --resource-group $RESOURCE_GROUP --name $APP_NAME
   ```
2. Delete the app service plan:
   ```bash
   az appservice plan delete --resource-group $RESOURCE_GROUP --name "$APP_NAME-plan"
   ```
3. Recreate with `--is-linux` flag (see step 2 in Azure Resource Creation).

### Problem: Node.js version not supported

**Solution:** Check available versions and use a supported one:
```bash
az webapp list-runtimes --os-type linux --query "[?contains(name, 'NODE')]"
```

Common supported versions: `NODE:18-lts`, `NODE:20-lts`, `NODE:22-lts`

### Problem: Frontend can't connect to backend

**Check:**
1. Frontend uses relative URLs: `const API_URL = process.env.REACT_APP_API_URL || '';`
2. Backend serves static files in production mode
3. Both are deployed in the same zip file

### Problem: Deployment fails with status 400

**Check:**
1. Web app is running (not stopped)
2. Zip file structure is correct (backend/ and frontend/build/ at root)
3. No node_modules in zip
4. All paths use forward slashes

### View Detailed Deployment Logs

```bash
# Get latest deployment ID
$deploymentId = (az webapp deployment list --resource-group $RESOURCE_GROUP --name $APP_NAME --query "[0].id" -o tsv)

# View detailed logs
az webapp log deployment show \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME \
  --deployment-id $deploymentId
```

---

## Quick Reference Commands

### Essential Commands

```bash
# Login
az login

# Set variables
$RESOURCE_GROUP = "YourResourceGroup"
$APP_NAME = "your-app-name"
$LOCATION = "canadacentral"

# Create resources
az appservice plan create --name "$APP_NAME-plan" --resource-group $RESOURCE_GROUP --location $LOCATION --sku FREE --is-linux
az webapp create --resource-group $RESOURCE_GROUP --plan "$APP_NAME-plan" --name $APP_NAME --runtime "NODE:22-lts"

# Configure
az webapp config set --resource-group $RESOURCE_GROUP --name $APP_NAME --startup-file "cd backend && npm install && node server.js"
az webapp config appsettings set --resource-group $RESOURCE_GROUP --name $APP_NAME --settings NODE_ENV=production

# Deploy
az webapp deploy --resource-group $RESOURCE_GROUP --name $APP_NAME --src-path deploy.zip --type zip

# Monitor
az webapp log tail --resource-group $RESOURCE_GROUP --name $APP_NAME
```

---

## Project Structure Summary

```
azure-personal/
├── backend/
│   ├── server.js          # Express server
│   ├── package.json       # Backend dependencies
│   └── package-lock.json  # Lock file (optional)
├── frontend/
│   ├── src/
│   │   └── App.js         # React app (uses relative API URLs)
│   ├── build/             # Production build (created by npm run build)
│   └── package.json       # Frontend dependencies
└── deploy.zip             # Deployment package (created by script)
```

---

## Key Learnings

1. **Always use Linux App Service** (`--is-linux` flag)
2. **Zip files must use forward slashes** (`/`) not backslashes (`\`)
3. **Never include `node_modules`** in deployment zip
4. **Set startup command** to install dependencies and start server
5. **Use relative URLs** in frontend for production
6. **Build frontend** before creating deployment zip
7. **Test locally first** before deploying to Azure

---

## Next Steps

- Set up CI/CD with GitHub Actions
- Add custom domain
- Configure SSL certificates
- Set up environment-specific configurations
- Add monitoring and logging
- Scale up the App Service Plan for production

---

## Additional Resources

- [Azure App Service Documentation](https://docs.microsoft.com/azure/app-service/)
- [Azure CLI Reference](https://docs.microsoft.com/cli/azure/)
- [Node.js on Azure](https://docs.microsoft.com/azure/app-service/quickstart-nodejs)
- [Deploy to Azure App Service](https://docs.microsoft.com/azure/app-service/deploy-zip)

---

## Real-World Issues Encountered and Solutions

This section documents the actual issues encountered during deployment and their solutions. These are real problems that can occur, and understanding them will help you troubleshoot faster.

### Issue 1: App Service Plan Created as Windows Instead of Linux

**Problem:**
- Created App Service Plan without `--is-linux` flag
- Result: Plan was created as Windows (`"reserved": false`)
- Web app couldn't run Node.js properly on Windows plan

**Error Indicators:**
```json
{
  "kind": "app",
  "reserved": false
}
```

**Solution:**
1. Delete the web app:
   ```bash
   az webapp delete --resource-group $RESOURCE_GROUP --name $APP_NAME
   ```

2. Delete the App Service Plan:
   ```bash
   az appservice plan delete --resource-group $RESOURCE_GROUP --name "$APP_NAME-plan"
   ```

3. Recreate with `--is-linux` flag:
   ```bash
   az appservice plan create \
     --name "$APP_NAME-plan" \
     --resource-group $RESOURCE_GROUP \
     --location $LOCATION \
     --sku FREE \
     --is-linux
   ```

**Prevention:** Always include `--is-linux` when creating the App Service Plan.

---

### Issue 2: Node.js Version Not Supported

**Problem:**
- Attempted to use Node.js 24, which wasn't available
- Error: "Node version not supported"

**Solution:**
1. Check available Node.js versions:
   ```bash
   az webapp list-runtimes --os-type linux --query "[?contains(name, 'NODE')]"
   ```

2. Use a supported LTS version (e.g., Node 22):
   ```bash
   az webapp create \
     --resource-group $RESOURCE_GROUP \
     --plan "$APP_NAME-plan" \
     --name $APP_NAME \
     --runtime "NODE:22-lts"
   ```

**Prevention:** Always check available runtimes before creating the web app.

---

### Issue 3: Startup Command Was Null

**Problem:**
- Startup command wasn't set initially
- Result: Azure didn't know how to start the Node.js application
- App showed 403 errors or "You do not have permission to view this directory"

**Error Indicators:**
```json
{
  "startupCommand": null
}
```

**Solution:**
```bash
az webapp config set \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME \
  --startup-file "cd backend && npm install && node server.js"
```

**Why this works:**
- `cd backend` - Navigates to backend directory
- `npm install` - Installs dependencies (node_modules not in zip)
- `node server.js` - Starts the Express server

**Prevention:** Always set the startup command immediately after creating the web app, before deployment.

---

### Issue 4: Web App Was Stopped (403 Error)

**Problem:**
- Attempted to deploy while web app was stopped
- Error: "Error 403 - This web app is stopped"
- Deployment failed with status 403

**Error Message:**
```
Status Code: 403, Details: <!DOCTYPE html><html>...Error 403 - This web app is stopped...
```

**Solution:**
```bash
az webapp start --resource-group $RESOURCE_GROUP --name $APP_NAME
```

Wait a few seconds, then verify:
```bash
az webapp show --resource-group $RESOURCE_GROUP --name $APP_NAME --query "{state:state}"
```

**Prevention:** Always check web app state before deployment. Include `az webapp start` in your deployment checklist.

---

### Issue 5: rsync Errors - Windows Backslashes in Zip File

**Problem:**
- Created zip file using Windows `Compress-Archive` or similar
- Zip contained Windows path separators (`\`) instead of forward slashes (`/`)
- Linux rsync couldn't process the paths
- Deployment failed with "Invalid argument (22)"

**Error Message:**
```
rsync: [generator] recv_generator: failed to stat "/home/site/wwwroot/backend\server.js": Invalid argument (22)
rsync: [generator] recv_generator: failed to stat "/home/site/wwwroot/frontend\build\index.html": Invalid argument (22)
```

**Root Cause:**
- Windows PowerShell's `Compress-Archive` preserves Windows path separators
- Linux App Service expects Unix-style paths with forward slashes

**Solution:**
Use .NET's `ZipFile` class which properly handles path separators:

```powershell
Add-Type -AssemblyName System.IO.Compression

$zip = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)

# Manually add files with forward slashes
function Add-ToZip {
    param($file, $zipEntry)
    $entry = $zip.CreateEntry($zipEntry.Replace('\', '/'))
    $fileBytes = [System.IO.File]::ReadAllBytes($file)
    $entryStream = $entry.Open()
    $entryStream.Write($fileBytes, 0, $fileBytes.Length)
    $entryStream.Close()
}

# Add files with explicit forward slashes
Add-ToZip "backend\server.js" "backend/server.js"
Add-ToZip "backend\package.json" "backend/package.json"
# ... etc

$zip.Dispose()
```

**Prevention:** Always use the PowerShell script provided in this guide, which uses .NET ZipFile and ensures forward slashes.

---

### Issue 6: Deployment Failed - Zip File Structure Issues

**Problem:**
- Initially included `node_modules` in zip file
- Zip file was too large
- Deployment timed out or failed
- rsync errors due to too many files

**Error Indicators:**
- Deployment logs showing thousands of files
- rsync errors for files in `node_modules`
- Deployment timeout

**Solution:**
1. **Never include `node_modules`** - Azure installs dependencies using `npm install` in startup command
2. Only include:
   - `backend/server.js`
   - `backend/package.json`
   - `backend/package-lock.json` (optional)
   - `frontend/build/` (entire folder)

**Prevention:** Use the provided PowerShell script which explicitly excludes `node_modules` and only includes necessary files.

---

### Issue 7: "You do not have permission to view this directory or page"

**Problem:**
- App deployed successfully but showed 403 error in browser
- No application logs appearing
- Server wasn't starting

**Root Causes:**
1. Startup command not set (see Issue 3)
2. `package.json` missing from zip
3. Dependencies not installing correctly

**Solution:**
1. **Check startup command:**
   ```bash
   az webapp config show --resource-group $RESOURCE_GROUP --name $APP_NAME --query "{startupCommand:siteConfig.appCommandLine}"
   ```
   If null, set it (see Issue 3 solution).

2. **Check application logs:**
   ```bash
   az webapp log tail --resource-group $RESOURCE_GROUP --name $APP_NAME
   ```
   Look for error messages.

3. **Verify zip contents:**
   - Ensure `backend/package.json` exists in zip
   - Ensure `backend/server.js` exists in zip
   - Verify no `node_modules` in zip (Azure installs these)

4. **Check deployment logs:**
   ```bash
   az webapp log deployment show \
     --resource-group $RESOURCE_GROUP \
     --name $APP_NAME \
     --deployment-id <deployment-id>
   ```

**Prevention:** 
- Always set startup command before deployment
- Verify zip file structure before deploying
- Check logs immediately after deployment

---

### Issue 8: Frontend Can't Connect to Backend

**Problem:**
- Frontend deployed but showing "Connecting to backend..." indefinitely
- API calls failing
- CORS errors in browser console

**Root Causes:**
1. Frontend using hardcoded `localhost:3001` URL
2. Backend not serving static files correctly
3. Environment variable not set

**Solution:**
1. **Use relative URLs in frontend:**
   ```javascript
   // ❌ Wrong - hardcoded localhost
   const API_URL = 'http://localhost:3001';
   
   // ✅ Correct - relative URL
   const API_URL = process.env.REACT_APP_API_URL || '';
   ```

2. **Ensure backend serves static files:**
   ```javascript
   // In server.js
   if (process.env.NODE_ENV === 'production') {
     app.use(express.static(path.join(__dirname, '../frontend/build')));
   }
   ```

3. **Set NODE_ENV environment variable:**
   ```bash
   az webapp config appsettings set \
     --resource-group $RESOURCE_GROUP \
     --name $APP_NAME \
     --settings NODE_ENV=production
   ```

**Prevention:** Always use relative URLs in production builds. Test locally with empty API_URL to simulate production.

---

## Summary of Lessons Learned

1. **Always specify `--is-linux`** when creating App Service Plan
2. **Check Node.js runtime availability** before creating web app
3. **Set startup command immediately** after creating web app
4. **Verify web app is running** before deployment
5. **Use .NET ZipFile class** for creating deployment zip (not Compress-Archive)
6. **Never include node_modules** in deployment zip
7. **Use relative URLs** in frontend for production
8. **Verify each step** before proceeding to the next
9. **Check logs immediately** after deployment
10. **Test locally first** - most issues can be caught before deployment

---

**Congratulations!** You've successfully deployed a full-stack application to Azure App Services! 🎉
