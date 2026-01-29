# Azure Test App

A simple full-stack application with a Node.js/Express backend and React frontend.

## Project Structure

```
.
├── backend/          # Express.js API server
│   ├── server.js    # Main server file
│   └── package.json
└── frontend/        # React application
    ├── src/         # React source files
    ├── public/      # Static files
    └── package.json
```

## Getting Started Locally

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Install frontend dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start the backend server** (Terminal 1):
   ```bash
   cd backend
   npm start
   ```
   Backend will run on `http://localhost:3001`

2. **Start the frontend** (Terminal 2):
   ```bash
   cd frontend
   npm start
   ```
   Frontend will open automatically at `http://localhost:3000`

## API Endpoints

- `GET /api/health` - Returns server health status
- `GET /api/data` - Returns sample data
- `POST /api/message` - Echoes back a message
  - Body: `{ "message": "your message" }`

## Next Steps

Once this is working locally, we can add Azure CLI deployment configuration.
