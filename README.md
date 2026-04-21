# FloodSense - Community Flood Monitoring System

A comprehensive flood monitoring and reporting system designed for community use, featuring real-time reporting, administrative validation, and offline capabilities.

> **⚡ Quick Start:** Run `.\start-dev.ps1` to start both servers automatically!  
> **🔧 Issues Fixed:** See [FIXES_APPLIED.md](FIXES_APPLIED.md) for recent CORS and connection fixes.  
> **📖 Setup Guide:** See [SETUP.md](SETUP.md) for detailed setup instructions.

## 🌟 Features

- **Real-time Flood Reporting**: Community members can report flood conditions with photos and location data
- **Administrative Validation**: Admin users can validate, reject, or request more information on reports
- **Interactive Map**: Location-based flood reports with severity indicators
- **Multi-language Support**: Full English and Tagalog translations for all pages
- **Role-based Access Control**: User, Admin, and Super Admin roles
- **Rate Limiting**: Prevents spam reporting (3-minute cooldown between reports)
- **Real-time Updates**: Socket.IO integration for live updates
- **Offline Support**: Fallback places for emergency information when offline
- **File Upload**: Photo attachments for flood reports
- **Geospatial Queries**: Find nearby reports and emergency facilities

## 🏗️ Architecture

### Backend (Node.js/Express)
- **Authentication**: JWT-based with httpOnly cookies
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.IO for live updates
- **File Storage**: Local file system with Multer
- **Security**: Helmet, CORS, rate limiting

### Frontend (React/Vite)
- **UI Framework**: React with Tailwind CSS
- **State Management**: React Query for server state
- **Maps**: React Leaflet for interactive maps
- **Routing**: React Router DOM
- **Internationalization**: i18next for multi-language support (English & Tagalog fully implemented)

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- MongoDB 5.0+
- Git

### Automated Setup (Windows)

```powershell
# 1. Ensure MongoDB is running
mongosh --eval "db.version()"

# 2. Start both servers automatically
.\start-dev.ps1

# 3. Open browser to http://localhost:5173
```

### Manual Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd floodsense
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Server environment
   cd server
   copy .env.example .env
   
   # Client environment
   cd ../client
   copy .env.example .env
   ```

4. **Start Development Servers**
   ```bash
   # Terminal 1 - Backend
   cd server
   npm start
   
   # Terminal 2 - Frontend
   cd client
   npm run dev
   ```

5. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api
   - Health Check: http://localhost:5000/api/ping

6. **Create Admin Account** (Optional)
   - Set `SEED_ADMIN=true` in `server/.env`
   - Restart server
   - Login: admin@floodsense.local / admin123

### Verification

Run the connection test:
```powershell
.\test-connection.ps1
```

For detailed setup instructions, see [SETUP.md](SETUP.md).

## 📁 Project Structure

```
floodsense/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API service functions
│   │   ├── utils/         # Utility functions
│   │   └── styles/        # CSS and styling
│   ├── public/            # Static assets
│   └── package.json
├── server/                # Node.js backend
│   ├── src/
│   │   ├── models/        # Mongoose schemas
│   │   ├── routes/        # Express route handlers
│   │   ├── middleware/    # Custom middleware
│   │   ├── utils/         # Utility functions
│   │   └── index.js       # Server entry point
│   ├── uploads/           # File upload directory
│   └── package.json
├── package.json           # Root package.json
└── README.md
```

## 🔧 Configuration

### Environment Variables

**Server** (`server/.env`):
```env
# Database
MONGODB_URI=mongodb://localhost:27017/floodsense

# JWT Secret (change in production!)
JWT_SECRET=your_super_secret_jwt_key_here

# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# Rate Limiting
REPORT_RATE_LIMIT_MINUTES=3

# Admin Configuration
ADMIN_EMAIL=admin@floodsense.local
ADMIN_PASSWORD=admin123
SEED_ADMIN=false
```

**Client** (`client/.env`):
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_APP_NAME=FloodSense
VITE_APP_VERSION=1.0.0
```

## 📊 Database Models

### User
- Authentication and role management
- Supports user, admin, and superadmin roles
- Barangay assignment for location-based access

### Report
- Flood reports with geospatial data
- Validation workflow (UNVERIFIED → VALIDATED/REJECTED)
- Automatic severity calculation based on depth and passability
- Photo attachment support

### FallbackPlace
- Admin-curated emergency locations
- Categories: evacuation centers, hospitals, government offices, etc.
- Priority-based sorting for offline access

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user profile

### Reports
- `GET /api/reports` - List reports (with filtering)
- `POST /api/reports` - Create new report (rate limited)
- `GET /api/reports/:id` - Get single report
- `PATCH /api/reports/:id/validate` - Validate report (admin)
- `PATCH /api/reports/:id/reject` - Reject report (admin)

### Fallback Places
- `GET /api/fallbacks` - List fallback places
- `POST /api/fallbacks` - Create fallback place (admin)
- `GET /api/fallbacks/category/evacuation-centers` - Get evacuation centers

## 🛡️ Security Features

- **JWT Authentication** with httpOnly cookies
- **Rate Limiting** on API endpoints and report creation
- **Input Validation** with Mongoose schemas
- **File Upload Security** with type and size restrictions
- **CORS Protection** with environment-specific origins
- **Helmet.js** for security headers
- **Prompt Injection Defense (3-Layer)** for chatbot safety. See [PROMPT_INJECTION_DEFENSE_SIMPLE.md](PROMPT_INJECTION_DEFENSE_SIMPLE.md)

## 🔄 Real-time Features

Socket.IO events:
- `join-barangay` - Subscribe to barangay-specific updates
- `new-report` - New flood report notification
- `report-validated` - Report validation notification
- `report-rejected` - Report rejection notification

## 🚀 Deployment

### Production Environment

1. **Environment Setup**
   ```bash
   NODE_ENV=production
   CLIENT_URL=https://your-domain.com
   JWT_SECRET=strong_production_secret
   MONGODB_URI=mongodb://your-production-db
   ```

2. **Build Frontend**
   ```bash
   cd client
   npm run build
   ```

3. **Start Production Server**
   ```bash
   cd server
   npm start
   ```

### Docker Deployment (Optional)

Create `Dockerfile` and `docker-compose.yml` for containerized deployment.

## 🧪 Development

### Available Scripts

**Root Level:**
- `npm run dev` - Start both client and server in development
- `npm run build` - Build client for production

**Server:**
- `npm run dev` - Start server with nodemon
- `npm run seed` - Seed database with sample data
- `npm run seed:admin` - Create admin user only

**Client:**
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Code Style

- Use ES6+ features and modules
- Follow React best practices
- Implement proper error handling
- Use TypeScript for type safety (future enhancement)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

## 🔮 Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Weather API integration
- [ ] SMS notifications
- [ ] Advanced analytics dashboard
- [x] Multi-language support (English & Tagalog)
- [ ] PWA capabilities
- [ ] Automated report verification using AI
- [ ] Integration with government systems
