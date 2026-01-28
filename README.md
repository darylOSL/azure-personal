# Azure App Service Test Application

A simple full-stack application with a Node.js/Express backend and React frontend, designed for testing deployment on Azure App Services.

## Project Structure

```
.
├── backend/          # Express.js API server
│   ├── server.js    # Main server file
│   └── package.json
├── frontend/        # React application
│   ├── src/         # React source files
│   ├── public/      # Static files
│   └── package.json
└── package.json     # Root package.json
```

## Features

- **Backend API**: Express.js server with REST endpoints
  - `/api/health` - Health check endpoint
  - `/api/data` - Sample data endpoint
  - `/api/message` - POST endpoint for testing

- **Frontend**: React application that communicates with the backend
  - Displays backend health status
  - Shows sample data from API
  - Interactive message form

## Local Development

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Setup

1. Install all dependencies:
```bash
npm run install-all
```

2. Start the backend server (in one terminal):
```bash
cd backend
npm start
```

3. Start the frontend development server (in another terminal):
```bash
cd frontend
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

The frontend will connect to the backend at `http://localhost:3001`.

## Building for Production

Build the React frontend:
```bash
cd frontend
npm run build
```

The backend will serve the built frontend files when `NODE_ENV=production`.

## Azure App Service Deployment

### Option 1: Deploy as Single App (Recommended)

1. **Build the frontend**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Create Azure App Service**:
   - Go to Azure Portal
   - Create a new App Service (Linux or Windows)
   - Choose Node.js runtime stack

3. **Configure App Settings**:
   - Set `NODE_ENV` = `production`
   - Set `PORT` = (Azure will set this automatically)
   - Set `REACT_APP_API_URL` = your app service URL (e.g., `https://your-app.azurewebsites.net`)

4. **Deploy**:
   - Use Azure CLI, VS Code Azure extension, or GitHub Actions
   - Deploy the entire project (backend + frontend/build folder)

5. **Startup Command**:
   - Set startup command to: `node backend/server.js`

### Option 2: Separate Frontend and Backend

Deploy backend and frontend as separate App Services:

- **Backend App Service**: Deploy `backend/` folder
- **Frontend App Service**: Deploy `frontend/build/` folder (static site)
- Configure CORS on backend to allow frontend domain
- Set `REACT_APP_API_URL` environment variable in frontend

## Environment Variables

- `PORT`: Server port (Azure sets this automatically)
- `NODE_ENV`: Set to `production` for production builds
- `REACT_APP_API_URL`: Backend API URL (for frontend)

## API Endpoints

- `GET /api/health` - Returns server health status
- `GET /api/data` - Returns sample data
- `POST /api/message` - Echoes back a message
  - Body: `{ "message": "your message" }`

## License

ISC
