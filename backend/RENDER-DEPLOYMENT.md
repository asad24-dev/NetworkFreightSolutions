# NFS Logistics API - Render Deployment

A clean, lightweight API server for freight tracking that scrapes carrier URLs from track-trace.com.

## 🚀 Features
- Extracts real carrier tracking URLs (Emirates, Thai Airways, Lufthansa, etc.)
- No database required - stateless API
- Optimized for Render deployment
- CORS enabled for cross-origin requests

## 📋 Environment Variables
Create these in your Render dashboard:

```
PORT=3000
NODE_ENV=production
```

## 🔧 Deployment Steps

### 1. Push to GitHub
```bash
git init
git add clean-server.js clean-package.json
git commit -m "Clean API server for Render deployment"
git branch -M main
git remote add origin https://github.com/yourusername/nfs-logistics-api.git
git push -u origin main
```

### 2. Deploy on Render
1. Go to [render.com](https://render.com)
2. Connect your GitHub repository
3. Create new "Web Service"
4. Settings:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
   - **Region**: Choose closest to your users

### 3. Update Frontend
Update your `simple-tracking.js` to use the Render API URL:

```javascript
// Replace localhost with your Render URL
const response = await fetch('https://your-app-name.onrender.com/api/track-scrape', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ trackingNumber, customerName, customerEmail })
});
```

## 🏗️ File Structure for Render
```
render-deployment/
├── clean-server.js     # Main API server
├── clean-package.json  # Dependencies
└── README.md          # This file
```

## 🌐 Frontend Updates for Plesk
Your static files stay on Plesk, just update the API URL in:
- `js/simple-tracking.js`
- Any other files calling `/api/track-scrape`

## ✅ Testing
After deployment:
1. Health check: `https://your-app.onrender.com/api/health`
2. Test tracking: POST to `/api/track-scrape` with AWB number
