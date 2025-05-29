# Parkirin Client Development Guide

## 🚀 Quick Start

This guide will help you get the Parkirin client application up and running quickly.

### Prerequisites
- Node.js 18+
- npm or yarn
- VS Code (recommended)
- Mapbox account & API key
- Google OAuth credentials

### Setup Instructions

1. **Environment Setup**
   ```bash
   cd client/parkirin
   npm install
   cp .env.example .env
   ```

2. **Configure Environment Variables**
   Update `.env` with your credentials:
   ```env
   VITE_GRAPHQL_HTTP_URI=http://localhost:3000/graphql
   VITE_GRAPHQL_WS_URI=ws://localhost:3000/graphql
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

## 📁 Project Architecture

### Directory Structure
```
src/
├── components/         # Reusable UI components
│   ├── common/        # Generic components (Button, Modal, etc.)
│   ├── forms/         # Form-specific components
│   ├── layout/        # Layout components (Header, Sidebar, etc.)
│   ├── parking/       # Parking-related components
│   ├── booking/       # Booking management components
│   ├── chat/          # Real-time chat components
│   └── dashboard/     # Dashboard widgets
├── pages/             # Page components
├── hooks/             # Custom React hooks
├── utils/             # Utility functions
├── graphql/           # GraphQL operations
├── store/             # State management
└── layouts/           # Page layouts
```

### Component Architecture

#### Common Components
All common components are located in `src/components/common/` and include:

- **Button** - Supports variants (primary, secondary, outline), sizes, loading states
- **Input** - Form inputs with validation states and icons
- **Modal** - Overlay dialogs with backdrop click handling
- **Card** - Content containers with header/footer support
- **Badge** - Status indicators with color variants
- **Alert** - Notification messages with dismissible functionality
- **LoadingSpinner** - Loading states with various sizes
- **ErrorBoundary** - Error handling wrapper

#### Specialized Components

**Parking Components:**
- `ParkingCard` - Display parking lot information
- `SearchFilters` - Advanced search and filtering
- `ParkingMap` - Interactive Mapbox integration
- `ParkingList` - Search results with pagination

**Booking Components:**
- `BookingForm` - Create new bookings with validation
- `BookingCard` - Display booking information
- `BookingList` - Booking history management

**Chat Components:**
- `ChatWindow` - Real-time messaging interface
- `ChatMessage` - Message display with types
- `ChatInput` - Message composition with file upload

## 🎨 Styling Guidelines

### Tailwind CSS
We use Tailwind CSS for styling. Follow these conventions:

1. **Color Palette**
   - Primary: Blue (blue-500, blue-600, etc.)
   - Secondary: Gray (gray-500, gray-600, etc.)
   - Success: Green (green-500, green-600, etc.)
   - Warning: Yellow (yellow-500, yellow-600, etc.)
   - Error: Red (red-500, red-600, etc.)

2. **Component Classes**
   ```jsx
   // Good
   className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md"
   
   // Avoid inline styles
   style={{ backgroundColor: 'white' }}
   ```

3. **Responsive Design**
   Always consider mobile-first approach:
   ```jsx
   className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
   ```

### Custom CSS
Located in `src/App.css` for global styles and component-specific overrides.

## 🔧 State Management

### Zustand Store
We use Zustand for state management:

```jsx
// stores/authStore.js
const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  setAuth: (user, token) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false })
}));
```

### Custom Hooks
Located in `src/hooks/`:

- `useAuth` - Authentication state and methods
- `useLocalStorage` - Local storage management
- `useDebounce` - Debouncing for search inputs
- `useGeolocation` - User location access
- `useSocket` - WebSocket connection management
- `usePagination` - Pagination logic

## 🌐 GraphQL Integration

### Apollo Client Setup
Configured in `src/graphql/client.js` with:
- HTTP link for queries/mutations
- WebSocket link for subscriptions
- Error handling
- Authentication headers

### GraphQL Operations
Organized in separate files:

**Queries** (`src/graphql/queries.js`):
```jsx
export const GET_PARKING_LOTS = gql`
  query GetParkingLots($lat: Float!, $lng: Float!) {
    searchParkingLots(lat: $lat, lng: $lng) {
      id
      name
      address
      availableSlots
    }
  }
`;
```

**Mutations** (`src/graphql/mutations.js`):
```jsx
export const CREATE_BOOKING = gql`
  mutation CreateBooking($input: BookingInput!) {
    createBooking(input: $input) {
      id
      status
    }
  }
`;
```

**Subscriptions** (`src/graphql/subscriptions.js`):
```jsx
export const BOOKING_STATUS_UPDATED = gql`
  subscription BookingStatusUpdated($bookingId: ID!) {
    bookingStatusUpdated(bookingId: $bookingId) {
      id
      status
    }
  }
`;
```

## 🔐 Authentication

### Auth Flow
1. User logs in via email/password or Google OAuth
2. JWT token stored in localStorage
3. Token included in GraphQL requests
4. User state managed by Zustand store

### Protected Routes
```jsx
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};
```

## 🗺️ Maps Integration

### Mapbox Setup
1. Get API key from Mapbox
2. Add to environment variables
3. Use in components:

```jsx
import Map, { Marker } from 'react-map-gl';

const ParkingMap = ({ parkingLots }) => {
  return (
    <Map
      mapboxAccessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
      initialViewState={{
        longitude: 106.8456,
        latitude: -6.2088,
        zoom: 13
      }}
    >
      {parkingLots.map(lot => (
        <Marker
          key={lot.id}
          longitude={lot.longitude}
          latitude={lot.latitude}
        />
      ))}
    </Map>
  );
};
```

## 🧪 Testing

### Jest Setup
Test files should be placed next to components:
```
components/
├── Button.jsx
├── Button.test.jsx
```

### Testing Utilities
```jsx
import { render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

const renderWithProviders = (component, mocks = []) => {
  return render(
    <MockedProvider mocks={mocks}>
      {component}
    </MockedProvider>
  );
};
```

## 🚀 Performance Optimization

### Code Splitting
All route components are lazy-loaded:
```jsx
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
```

### Image Optimization
- Use responsive images
- Implement lazy loading
- Optimize for different screen sizes

### Bundle Analysis
```bash
npm run build
npm run preview
```

## 🔍 Debugging

### Browser DevTools
1. React Developer Tools
2. Apollo Client DevTools
3. Redux DevTools (for Zustand)

### Common Issues

**CORS Errors:**
- Check backend CORS configuration
- Verify GraphQL endpoint URLs

**Authentication Issues:**
- Check token expiration
- Verify JWT configuration
- Clear localStorage if needed

**Map Not Loading:**
- Verify Mapbox token
- Check network requests
- Ensure proper CSS imports

## 📦 Build & Deployment

### Production Build
```bash
npm run build
```

### Environment-Specific Builds
```bash
# Development
npm run dev

# Staging
VITE_APP_ENV=staging npm run build

# Production
VITE_APP_ENV=production npm run build
```

### Deployment Checklist
- [ ] Environment variables configured
- [ ] Build passes without errors
- [ ] All routes work correctly
- [ ] Authentication flows tested
- [ ] GraphQL endpoints accessible
- [ ] Maps functionality working
- [ ] Responsive design verified

## 🤝 Contributing

### Code Style
1. Use ESLint configuration
2. Follow naming conventions
3. Write meaningful commit messages
4. Add PropTypes for components

### Pull Request Process
1. Create feature branch
2. Make changes with tests
3. Update documentation
4. Submit PR with description
5. Code review and merge

### Naming Conventions
- Components: PascalCase (`UserProfile.jsx`)
- Functions: camelCase (`getUserProfile`)
- Constants: UPPER_SNAKE_CASE (`API_BASE_URL`)
- Files: kebab-case for utilities (`date-helpers.js`)

## 📚 Resources

- [React Documentation](https://react.dev)
- [Apollo Client Docs](https://www.apollographql.com/docs/react/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Mapbox GL JS Docs](https://docs.mapbox.com/mapbox-gl-js/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

## 🆘 Troubleshooting

### Common Commands
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite

# Reset database (backend)
npm run db:reset

# View GraphQL schema
npm run graphql:codegen
```

### Getting Help
1. Check this documentation
2. Search existing issues
3. Ask in team chat
4. Create new issue with reproduction steps

---

**Happy coding! 🚀**
