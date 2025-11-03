# FloodSense Frontend

Modern React frontend for the FloodSense community flood monitoring system.

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing
- **TanStack Query (React Query)** - Server state management
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time updates
- **Leaflet** - Interactive maps
- **Tailwind CSS** - Utility-first styling (Material You + Nothing OS inspired)

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Backend server running on `http://localhost:5000`

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Environment Variables

Create a `.env` file in the client directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_APP_NAME=FloodSense
VITE_APP_VERSION=1.0.0
```

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── common/      # Layout, ProtectedRoute
│   ├── reports/     # Report cards, lists, forms
│   ├── map/         # Map components
│   └── admin/       # Admin-specific components
├── pages/           # Page components
│   ├── auth/        # Login, Register
│   ├── reports/     # Report pages
│   ├── admin/       # Admin dashboard
│   └── profile/     # User profile
├── contexts/        # React contexts (Auth, Socket)
├── hooks/           # Custom React hooks
├── services/        # API service layer
├── utils/           # Helper functions and constants
├── lib/             # Third-party configurations
└── styles/          # Global styles
```

## Features Implemented

### ✅ Phase 1-4 Complete

- **Authentication** - Login/Register with JWT cookies
- **Protected Routes** - Role-based access control
- **Report Management** - Submit, view, filter flood reports
- **Interactive Maps** - Leaflet integration with custom markers
- **Location Picker** - Click-to-select with reverse geocoding
- **Real-time Updates** - Socket.IO integration (context ready)
- **Material You Design** - Modern, clean UI with Nothing OS inspiration
- **Responsive Layout** - Mobile-first design

### 🚧 Coming Soon

- Admin validation workflow UI
- Toast notifications
- Offline support with IndexedDB
- Map/List toggle view
- Advanced filtering and search
- Internationalization (Tagalog/English)

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Design System

### Colors

- **Primary (Green)** - Main actions, validated reports
- **Secondary (Orange)** - Accents, highlights
- **Warning (Yellow)** - Unverified reports, cautions
- **Danger (Red)** - Rejected reports, errors
- **Neutral (Gray)** - Text, backgrounds

### Typography

- Font: Inter (system fallback)
- Rounded corners: xl, 2xl, 3xl
- Shadows: material, material-lg

## API Integration

The frontend communicates with the backend via:

- **REST API** - CRUD operations (`/api/*`)
- **Socket.IO** - Real-time updates (report events)
- **Cookies** - JWT authentication (httpOnly)

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Follow the existing code style
2. Use functional components with hooks
3. Keep components small and focused
4. Add proper TypeScript types (if migrating)
5. Test on multiple screen sizes

## License

MIT
