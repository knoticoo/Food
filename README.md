# Pet Care Tracker

A modern full-stack web application for tracking pet care tasks and managing pet information. Built with React, TypeScript, Express.js, and SQLite.

## Features

### 🔐 Authentication & User Management
- User registration and login
- JWT-based authentication
- Protected routes
- User profile management

### 🐾 Pet Management
- Add, edit, and delete pets
- Track pet information (name, type, breed, age, weight)
- Support for dogs, cats, birds, fish, and other pets
- Pet avatars and detailed profiles

### 📋 Task Management
- Create and schedule pet care tasks
- Task types: feeding, walking, play, treats, medication, grooming, vet visits
- Recurring tasks (daily, weekly, monthly)
- Task completion tracking with notes and mood
- Task history and logs

### 📊 Dashboard & Analytics
- Real-time dashboard with statistics
- Task completion rates
- Pet overview and quick actions
- Today's tasks overview

### 🎨 Modern UI/UX
- Responsive design with Tailwind CSS
- Modern, clean interface
- Loading states and error handling
- Toast notifications
- Mobile-friendly design

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Axios** for API communication
- **Date-fns** for date handling

### Backend
- **Express.js** server
- **SQLite** database
- **JWT** authentication
- **bcryptjs** for password hashing
- **Express Validator** for input validation
- **CORS** enabled

## Getting Started

### Prerequisites
- Node.js 16+ 
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

3. Start the development server:
```bash
npm run dev
```

This will start both the backend server (port 3001) and frontend development server (port 5173).

### Development Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run dev:frontend` - Start only the frontend
- `npm run dev:backend` - Start only the backend
- `npm run build` - Build the frontend for production
- `npm run start` - Start the production server

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Pets
- `GET /api/pets` - Get all user's pets
- `POST /api/pets` - Create a new pet
- `PUT /api/pets/:id` - Update a pet
- `DELETE /api/pets/:id` - Delete a pet

### Tasks
- `GET /api/tasks` - Get all user's tasks (with optional filters)
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task
- `POST /api/tasks/:id/complete` - Complete a task

### Task Logs
- `GET /api/task-logs` - Get task completion logs

### User Profile
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

## Database Schema

The application uses SQLite with the following tables:

- **users** - User accounts and authentication
- **pets** - Pet information linked to users
- **tasks** - Pet care tasks linked to pets
- **task_logs** - Task completion history
- **shared_access** - Pet sharing between users (future feature)

## Features in Detail

### User Registration & Login
- Secure password hashing with bcrypt
- JWT token-based authentication
- Form validation and error handling
- Automatic token refresh and logout

### Pet Management
- Full CRUD operations for pets
- Support for multiple pet types
- Optional fields for breed, age, and weight
- Pet avatars and detailed information

### Task Scheduling
- Create tasks for specific pets
- Set scheduled times and recurrence patterns
- Task completion with optional notes and mood tracking
- Task history and analytics

### Dashboard
- Real-time statistics and metrics
- Today's tasks overview
- Pet summary and quick actions
- Completion rate tracking

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Protected API routes
- CORS configuration
- SQL injection prevention

## Future Enhancements

- Pet photo uploads
- Task reminders and notifications
- Pet sharing between family members
- Advanced analytics and reports
- Mobile app version
- Email notifications
- Pet health tracking
- Vet appointment scheduling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details