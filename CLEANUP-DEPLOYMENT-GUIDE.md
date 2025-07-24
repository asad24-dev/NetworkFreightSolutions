# 🗂️ NFS Logistics - Codebase Cleanup & Deployment Guide

## 🧹 Files to DELETE (No longer needed)

### Database-related files (tracking doesn't need database):
```
❌ backend/database.js
❌ backend/database-pg.js  
❌ backend/database-mysql-backup.js
❌ backend/scripts/init-database.js
❌ backend/scripts/init-database-pg.js
❌ backend/scripts/init-database-mysql-backup.js
❌ backend/scripts/add-real-data.js
❌ backend/POSTGRESQL-SETUP.md
❌ backend/.env (contains database credentials)
```

### Old/backup files:
```
❌ tracking-old-backup.html
❌ tracking-clean.html  
❌ js/tracking.js (old version)
❌ js/tracking-system.js (old version) 
❌ css/tracking.css (old version - tracking.html uses tracking-new.css)
❌ backend/server.js
❌ backend/freight-tracker.js
❌ backend/ship24-service.js
❌ backend/setup.js
❌ backend/setup-simple.js
❌ backend/package.json (old one)
❌ backend/package-lock.json
❌ backend/proxy-handler.js
❌ backend/simple-package.json
❌ setup.bat
❌ BACKEND_SETUP.md
```

## ✅ Files to KEEP for Plesk (Static Website)

### Core website files:
```
✅ index.html
✅ tracking.html (main tracking page)
✅ css/style.css
✅ css/bootstrap.min.css
✅ css/aos.css
✅ css/magnific-popup.css
✅ css/owl.carousel.min.css
✅ css/owl.theme.default.min.css
✅ css/bootstrap-datepicker.css
✅ css/jquery-ui.css
✅ css/modern-improvements.css
✅ css/tracking-new.css (USED by tracking.html)
✅ js/simple-tracking.js (UPDATED - works with both localhost and Render API)
✅ js/main.js
✅ js/bootstrap.min.js
✅ js/jquery-3.3.1.min.js
✅ js/jquery-migrate-3.0.1.min.js
✅ js/aos.js
✅ js/owl.carousel.min.js
✅ js/jquery-ui.js
✅ js/popper.min.js
✅ js/jquery.stellar.min.js
✅ js/jquery.countdown.min.js
✅ js/jquery.magnific-popup.min.js
✅ js/bootstrap-datepicker.min.js
✅ js/jquery.easing.1.3.js
✅ js/modern-interactions.js
✅ All images/ folder
✅ All fonts/ folder
```

## 🚀 Files for Render Deployment (New Repository)

### Create new folder for Render:
```
render-deployment/
├── clean-server.js          ✅ (Clean API server)
├── package.json             ✅ (Renamed from clean-package.json)
├── README.md               ✅ (From RENDER-DEPLOYMENT.md)
└── .gitignore              ✅ (Create new)
```

## 📋 Deployment Steps

### 1. Clean up local codebase
```bash
# Navigate to your project
cd "c:\Users\asadm\OneDrive - University College London\personal development\nfs logistics\nfslogistics.com"

# Delete unnecessary files (run these commands)
Remove-Item -Recurse backend/scripts
Remove-Item backend/database*.js
Remove-Item backend/server.js
Remove-Item backend/freight-tracker.js
Remove-Item backend/ship24-service.js
Remove-Item backend/setup*.js
Remove-Item backend/.env
Remove-Item backend/package*.json
Remove-Item backend/proxy-handler.js
Remove-Item backend/POSTGRESQL-SETUP.md
Remove-Item backend/README.md
Remove-Item tracking-*backup*.html
Remove-Item js/tracking.js -ErrorAction SilentlyContinue
Remove-Item js/tracking-system.js -ErrorAction SilentlyContinue  
Remove-Item css/tracking.css -ErrorAction SilentlyContinue
# NOTE: Keep css/tracking-new.css - it's used by tracking.html
Remove-Item setup.bat
Remove-Item BACKEND_SETUP.md
```

### 2. Create Render deployment folder
```bash
# Create new folder for Render
mkdir render-deployment
cd render-deployment

# Copy clean files
Copy-Item ../backend/clean-server.js server.js
Copy-Item ../backend/clean-package.json package.json
Copy-Item ../backend/RENDER-DEPLOYMENT.md README.md
```

### 3. Update API URL in simple-tracking.js
Edit `js/simple-tracking.js` line 10 to add your Render URL:
```javascript
// Replace 'your-app-name' with your actual Render app name
this.API_BASE_URL = window.location.origin.includes('localhost') 
    ? '' // Use relative URLs for local development
    : 'https://your-app-name.onrender.com'; // YOUR RENDER URL HERE
```

### 4. Deploy to Render
1. Push `render-deployment/` folder to new GitHub repo
2. Connect to Render.com
3. Deploy as Web Service
4. Get your Render URL (e.g., `https://nfs-logistics-api.onrender.com`)

### 5. Upload to Plesk
Upload all ✅ files to your Plesk hosting, with the updated:
- `js/simple-tracking.js` (with your Render URL configured)

## 🎯 Final Architecture

```
┌─────────────────┐    API calls    ┌─────────────────┐
│   Plesk Hosting │ ────────────────▶ │  Render.com     │
│   (Static Site) │                 │  (API Server)   │
│                 │                 │                 │
│ • HTML/CSS/JS   │                 │ • Node.js API   │
│ • Images/Fonts  │                 │ • Puppeteer     │
│ • Frontend Only │                 │ • Track-Trace   │
└─────────────────┘                 └─────────────────┘
```

## ✅ Benefits of This Setup
- **Separation of concerns**: Static frontend + API backend
- **Cost effective**: Plesk for static files, Render for API only
- **Scalable**: API can handle multiple frontend domains
- **Fast**: Static files served directly from Plesk
- **Clean**: No database, no unnecessary dependencies
