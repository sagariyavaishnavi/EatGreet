
# ⚡️ Deployment Guide

## 1. Environment Variables (Critical for Group Work)

For **everyone** in the group to see and work on the same data, you must share the same environment variables. 
DO NOT simply use `localhost`.

### Backend `.env` (Share this with your team securey via WhatsApp/Slack)
```env
PORT=5000
NODE_ENV=development
# Use the connection string from MongoDB Atlas, NOT localhost
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.tn5taqn.mongodb.net/?appName=Cluster0
JWT_SECRET=your_secure_secret_shared_key

# Cloudinary (Get these from your Cloudinary Dashboard)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend `.env` (Create in `frontend/.env`)
```env
# Point this to your Render backend URL once deployed, or localhost for dev
VITE_API_URL=http://localhost:5000/api
```

---

## 2. Deploying Backend to Render.com

1.  Push your code to **GitHub**.
2.  Go to **Render.com** -> New **Web Service**.
3.  Connect your GitHub repository.
4.  **Root Directory**: `backend` (Important!)
5.  **Build Command**: `npm install`
6.  **Start Command**: `node server.js`
7.  **Environment Variables**: Add all variables from your `backend/.env` here.

## 3. Deploying Frontend to Vercel

1.  Push your code to **GitHub**.
2.  Go to **Vercel.com** -> Add New Project.
3.  Select your repository.
4.  **Root Directory**: `frontend` (Edit the setting).
5.  **Build Command**: `vite build` (Default is usually fine).
6.  **Output Directory**: `dist`
7.  **Environment Variables**:
    *   `VITE_API_URL`: Set this to your **Render Backend URL** (e.g., `https://eatgreet-api.onrender.com/api`).

## 4. IP Whitelisting (MongoDB Atlas)

If your team gets "connection refused" errors:
1.  Go to **MongoDB Atlas Dashboard**.
2.  Go to **Network Access** (Security tab).
3.  Add IP Address -> **Allow Access from Anywhere** (0.0.0.0/0).
    *   *Note: This is easiest for group projects. For production, restrict IPs.*
