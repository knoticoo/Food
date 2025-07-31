# Pet Care Tracker

A modern web application for tracking pet care activities with a beautiful, professional UI.

## 🏗️ Project Structure

```
pet-care-tracker/
├── backend/                 # Backend server
│   ├── config/             # Database and configuration
│   ├── controllers/        # Business logic
│   ├── middleware/         # Express middleware
│   ├── models/            # Data models
│   ├── routes/            # API routes
│   ├── utils/             # Utility functions
│   ├── database.sqlite    # SQLite database
│   └── server.js          # Main server file
├── frontend/              # React frontend
│   ├── components/        # React components
│   │   ├── auth/         # Authentication components
│   │   ├── layout/       # Layout components
│   │   └── ui/           # UI components
│   ├── context/          # React context providers
│   ├── pages/            # Page components
│   ├── styles/           # CSS styles
│   ├── types/            # TypeScript types
│   ├── utils/            # Utility functions
│   ├── App.tsx           # Main App component
│   └── main.tsx          # Entry point
├── public/               # Static assets
└── package.json          # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pet-care-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Start the development servers:
```bash
npm run dev
```

This will start both the backend server (port 3001) and frontend development server (port 5173).

### Development Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run dev:frontend` - Start only the frontend development server
- `npm run dev:backend` - Start only the backend server
- `npm run build` - Build the frontend for production
- `npm run start` - Start the production server

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Axios** - HTTP client
- **Vite** - Build tool

## 🔐 Authentication

The application uses JWT tokens for authentication. Users can register and login, and their data is securely stored in the SQLite database with encrypted passwords.

## 📱 Features

- **User Authentication** - Secure login and registration
- **Pet Management** - Add, edit, and manage pets
- **Task Tracking** - Schedule and track pet care tasks
- **History** - View completed tasks and activities
- **Settings** - Manage user preferences
- **Responsive Design** - Works on desktop and mobile

## 🎨 UI/UX

The application features a modern, professional design with:
- Clean, minimalist interface
- Smooth animations and transitions
- Responsive design for all devices
- Intuitive navigation
- Professional color scheme and typography

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
JWT_SECRET=your-secret-key-here
PORT=3001
```

### Database

The application uses SQLite for data storage. The database file is automatically created at `backend/database.sqlite` when the server starts.

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Pets
- `GET /api/pets` - Get user's pets
- `POST /api/pets` - Create a new pet
- `PUT /api/pets/:id` - Update a pet
- `DELETE /api/pets/:id` - Delete a pet

### Tasks
- `GET /api/tasks` - Get user's tasks
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task
- `POST /api/tasks/:id/complete` - Complete a task

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.