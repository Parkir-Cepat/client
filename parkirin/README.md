# Parkirin - Parking Management System Client

## 🚗 Overview

Parkirin is a comprehensive parking management system client built with React. It provides a modern, responsive interface for users to find and book parking spots, while offering management tools for parking lot owners and administrators.

## ✨ Features

### For Users
- 🔍 **Smart Parking Search** - Find available parking spots with advanced filters
- 📍 **Interactive Map** - View parking locations on an interactive Mapbox-powered map
- 📅 **Easy Booking** - Book parking spots with real-time availability
- 💳 **Digital Wallet** - Manage payments and transactions
- 💬 **Real-time Chat** - Communicate with parking lot owners
- 📱 **Responsive Design** - Works seamlessly on all devices

### For Parking Lot Owners
- 🏢 **Parking Management** - Add and manage multiple parking lots
- 📊 **Analytics Dashboard** - Track earnings and booking statistics
- 📋 **Booking Management** - Handle incoming booking requests
- 💰 **Revenue Tracking** - Monitor income and financial performance

### For Administrators
- 👥 **User Management** - Manage users and permissions
- ✅ **Parking Approval** - Review and approve new parking lots
- 📈 **System Analytics** - Monitor platform-wide statistics
- 🎧 **Support Management** - Handle customer support requests

## 🛠️ Technology Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **GraphQL Client**: Apollo Client
- **Routing**: React Router DOM
- **Maps**: Mapbox GL JS
- **Authentication**: Google OAuth + JWT
- **Form Handling**: React Hook Form
- **Notifications**: React Hot Toast
- **Icons**: Heroicons

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Mapbox API key
- Google OAuth credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd client/parkirin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Copy `.env` file and update with your configuration:
   ```env
   VITE_GRAPHQL_HTTP_URI=http://localhost:3000/graphql
   VITE_GRAPHQL_WS_URI=ws://localhost:3000/graphql
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token
   VITE_APP_NAME=Parkirin
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3001`

## 📡 GraphQL Integration

The application is designed to work with a GraphQL backend server. All data fetching is handled through Apollo Client with support for:

- **Queries** - Data fetching with caching
- **Mutations** - Data modification operations  
- **Subscriptions** - Real-time updates

## 🔧 Development Features

- **Hot Module Replacement** - Instant updates during development
- **Error Boundaries** - Graceful error handling
- **PropTypes** - Runtime type checking
- **ESLint** - Code quality enforcement
- **Path Aliases** - Clean import statements

## 🚀 Build & Deployment

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ by the Parkirin Team**

## Google Maps Integration

Aplikasi ini menggunakan Google Maps JavaScript API dengan fallback marker agar selalu stabil di berbagai versi API dan browser.

### Cara Kerja:
- Script Google Maps dimuat secara dinamis dan dipastikan benar-benar loaded sebelum digunakan (dengan polling).
- Jika fitur AdvancedMarkerElement tidak tersedia, otomatis fallback ke legacy Marker dengan custom SVG.
- Tidak menggunakan Map ID, sehingga warning terkait Map ID bisa diabaikan.

### Konfigurasi API Key
- Pastikan server mengembalikan API key Google Maps yang valid melalui endpoint `/api/google-maps-key`.
- API key diatur di file `.env` pada folder server:
  ```env
  GOOGLE_MAPS_API_KEY=your_actual_google_maps_api_key
  ```

### Troubleshooting
- Jika muncul warning seperti "Map is initialized without a valid Map ID", **abaikan saja** selama marker dan map tetap muncul.
- Jika map/marker tidak muncul, cek console browser untuk error lain (misal: API key salah, quota habis, dsb).
- Jika ingin menggunakan Advanced Markers di masa depan, tambahkan Map ID sesuai dokumentasi Google.

### Fallback Strategy
1. **Level 1:** AdvancedMarkerElement (jika tersedia)
2. **Level 2:** Legacy Marker dengan custom SVG (default)
3. **Level 3:** Basic legacy Marker (jika SVG gagal)

Aplikasi akan selalu menampilkan marker selama Google Maps API key valid dan internet tersedia.
