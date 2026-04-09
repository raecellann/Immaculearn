# Thesis Project Management System

A comprehensive web-based task and activity management system designed for educational environments, supporting both professors and students in managing assignments, quizzes, and collaborative activities.

## 🎯 Features

### For Professors
- **Task Management**: Create, edit, and manage various types of activities (quizzes, individual activities, group activities)
- **Student Progress Tracking**: Monitor student submissions and performance
- **Space Management**: Create and manage course/class spaces
- **File Sharing**: Upload and share educational materials
- **Grade Management**: Track and manage student grades
- **Activity Analytics**: View detailed analytics on student performance

### For Students
- **Activity Dashboard**: View assigned tasks and activities
- **Submission System**: Submit assignments and take quizzes
- **Progress Tracking**: Monitor personal academic progress
- **Collaboration Tools**: Participate in group activities
- **Resource Access**: Access shared files and materials
- **Deadline Management**: Track upcoming deadlines

### Core Features
- **Responsive Design**: Mobile-friendly interface
- **Real-time Updates**: Live notifications and updates
- **Multi-user Support**: Role-based access control
- **File Management**: Upload, download, and organize files
- **Calendar Integration**: Schedule and track important dates
- **Notification System**: Stay informed about important updates

## 🛠️ Technology Stack

### Frontend
- **React.js**: Modern JavaScript framework for building user interfaces
- **React Router**: Client-side routing
- **TailwindCSS**: Utility-first CSS framework
- **Context API**: State management
- **Lucide React**: Icon library
- **React Hook Form**: Form handling
- **React Toastify**: Notification system

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **Database**: [Specify your database here]
- **Authentication**: JWT-based authentication
- **File Storage**: [Specify your file storage solution]

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- [Database requirements]

### Frontend Setup
```bash
# Clone the repository
git clone https://github.com/raecellann/Thesis-Back-Up.git

# Navigate to the project directory
cd Thesis-Back-Up

# Install frontend dependencies
npm install

# Start the development server
npm start
```

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install backend dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start the backend server
npm run dev
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DATABASE_URL=your_database_url

# JWT Configuration
JWT_SECRET=your_jwt_secret

# Server Configuration
PORT=3000
NODE_ENV=development

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10MB
```

## 📁 Project Structure

```
Thesis-Back-Up/
├── src/
│   ├── components/          # Reusable UI components
│   ├── contexts/          # React contexts for state management
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Main application pages
│   │   ├── UserSpace/   # Student-facing pages
│   │   ├── Prof-Space/   # Professor-facing pages
│   │   ├── Task/         # Task-related pages
│   │   └── ...
│   ├── routes/           # Application routing
│   ├── utils/            # Utility functions
│   └── styles/           # Global styles and themes
├── backend/              # Backend application code
├── public/               # Static assets
└── docs/               # Documentation
```

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/raecellann/Thesis-Back-Up.git
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Fill in your configuration values

4. **Run the application**
   - Frontend: `npm start`
   - Backend: `npm run dev` (from backend directory)

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 👥 Contributors

### Backend Development
- **Wilson** - Backend architecture, API development, database design
- **Nathaniel** - Backend development, authentication system, API integration

### Frontend & UI/UX Design
- **Zeldrick** - Frontend development, React components, state management
- **Raecellann** - Frontend development, UI/UX design, component architecture, project lead

## 🤝 Contributing

We welcome contributions to improve this project! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Commit your changes**
   ```bash
   git commit -m 'Add some feature'
   ```
5. **Push to the branch**
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Open a Pull Request**

### Development Guidelines
- Follow the existing code style and conventions
- Write clear, descriptive commit messages
- Test your changes thoroughly
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Bug Reports & Feature Requests

If you encounter any bugs or have suggestions for new features, please:

1. Check existing issues
2. Create a new issue with detailed information
3. Provide steps to reproduce bugs
4. Include screenshots if applicable

## 🎓 Acknowledgments

This project was developed as part of a thesis requirement and aims to improve the educational experience through better task management and collaboration tools.

---

**Built with ❤️ by the development team**
