# Pet Care Tracker

A modern web application for tracking pet care activities, built with React, TypeScript, and Node.js.

## Features

- 🔐 **Simple Authentication** - Clean login and registration system
- 🐾 **Pet Management** - Add, edit, and manage your pets
- 📋 **Task Tracking** - Create and track care tasks for your pets
- 📊 **Dashboard** - Overview of all your pets and their care status
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🌙 **Dark/Light Theme** - Toggle between themes

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation & Running

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pet-care-tracker
   ```

2. **Run the application**
   ```bash
   # Development mode (recommended)
   ./run.sh dev
   
   # Production mode
   ./run.sh prod
   ```

3. **Access the application**
   - Development: http://localhost:5173
   - Backend API: http://localhost:3001
   - Production: http://localhost:3001

## Authentication

The application includes a complete authentication system:

- **Registration**: Create a new account with name, email, and password
- **Login**: Sign in with your email and password
- **Protected Routes**: All main features require authentication
- **JWT Tokens**: Secure authentication using JSON Web Tokens

### Default Routes

- `/login` - Sign in page
- `/register` - Create new account
- `/` - Dashboard (protected)
- `/pets` - Pet management (protected)
- `/tasks` - Task management (protected)
- `/history` - Care history (protected)
- `/settings` - User settings (protected)

## Development

### Project Structure

```
├── frontend/           # React TypeScript frontend
│   ├── components/     # Reusable UI components
│   ├── context/        # React context providers
│   ├── pages/          # Page components
│   └── utils/          # Utility functions
├── backend/            # Node.js Express backend
│   ├── routes/         # API route handlers
│   ├── middleware/     # Express middleware
│   ├── config/         # Database and app config
│   └── utils/          # Backend utilities
├── run.sh             # Universal start script
└── package.json       # Project dependencies
```

### Available Scripts

- `./run.sh dev` - Start development servers
- `./run.sh prod` - Build and start production server
- `npm run build` - Build frontend for production
- `npm run dev:frontend` - Start frontend only
- `npm run dev:backend` - Start backend only

## Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **SQLite** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin requests

## Database

The application uses SQLite for data storage. The database file is automatically created at `backend/database.sqlite` when you first run the application.

### Tables
- `users` - User accounts
- `pets` - Pet information
- `tasks` - Care tasks
- `task_logs` - Task completion history

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- Protected API routes
- CORS configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.