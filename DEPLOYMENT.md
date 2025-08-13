# ClientOnboarder - Deployment Guide

This guide explains how to deploy the ClientOnboarder frontend to Render.

## Prerequisites

- Node.js 18+ installed
- Git installed
- Render account (https://render.com/)
- Backend API URL

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_API_BASE_URL=https://your-backend-url.com
NODE_ENV=production
PORT=10000
```

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Open http://localhost:3000 in your browser

## Building for Production

1. Build the application:
   ```bash
   npm run build
   ```

2. Preview the production build locally:
   ```bash
   npm run preview
   ```

## Deploying to Render

### Option 1: Using Render Dashboard (Recommended)

1. Push your code to a GitHub/GitLab repository
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New" → "Web Service"
4. Connect your repository
5. Configure the service:
   - **Name**: `clientonboarder-frontend`
   - **Region**: Choose the one closest to your users
   - **Branch**: `main` (or your preferred branch)
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     - `NODE_ENV`: `production`
     - `PORT`: `10000`
     - `VITE_API_BASE_URL`: Your backend API URL
6. Click "Create Web Service"

### Option 2: Using Render CLI

1. Install Render CLI:
   ```bash
   npm install -g @renderinc/cli
   ```

2. Login to Render:
   ```bash
   render login
   ```

3. Deploy the service:
   ```bash
   render deploy
   ```

## Custom Domain Setup

1. In your Render dashboard, go to your web service
2. Click on "Settings"
3. Under "Custom Domains", click "Add Custom Domain"
4. Follow the instructions to configure your DNS settings

## Troubleshooting

### Build Failures
- Check the build logs in the Render dashboard
- Ensure all required environment variables are set
- Verify Node.js version is 18+

### 404 Errors
- Make sure the `base` in `vite.config.ts` is correctly set
- Verify the static file paths in your build output

### API Connection Issues
- Check the `VITE_API_BASE_URL` is correct
- Ensure CORS is properly configured on your backend
- Verify the backend is accessible from Render's IPs

## Maintenance

### Updating the Application
1. Push changes to your repository
2. Render will automatically trigger a new deployment

### Environment Variables
- Update environment variables in the Render dashboard
- Click "Manual Deploy" to apply changes

### Logs
- View application logs in the Render dashboard
- Use the "Shell" feature for debugging if needed
