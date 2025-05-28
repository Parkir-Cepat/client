import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ApolloProvider } from "@apollo/client";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline, GlobalStyles } from "@mui/material";
import { ToastContainer } from "react-toastify";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import "react-toastify/dist/ReactToastify.css";

import { client } from "./apollo/client";
import { AuthProvider } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SearchPage from "./pages/SearchPage";
import BookingPage from "./pages/BookingPage";
import BookingListPage from "./pages/BookingListPage";
import ProfilePage from "./pages/ProfilePage";
import ParkingLotDetailPage from "./pages/ParkingLotDetailPage";
import PaymentPage from "./pages/PaymentPage";
import ChatPage from "./pages/ChatPage";
import NotificationsPage from "./pages/NotificationsPage";
import LandownerDashboardPage from "./pages/LandownerDashboardPage";
import ManageParkingLotsPage from "./pages/ManageParkingLotsPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

// Route protection components
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

// Components
import Header from "./components/Header";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
      light: "#42a5f5",
      dark: "#1565c0",
    },
    secondary: {
      main: "#dc004e",
    },
    background: {
      default: "#f5f5f5",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        },
      },
    },
  },
});

const globalStyles = (
  <GlobalStyles
    styles={{
      "*": {
        boxSizing: "border-box",
      },
      body: {
        margin: 0,
        padding: 0,
      },
      "#root": {
        minHeight: "100vh",
      },
    }}
  />
);

function App() {
  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <CssBaseline />
          {globalStyles}
          <AuthProvider>
            <SocketProvider>
              <Router>
                <div className="App">
                  <Header />
                  <main>
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/" element={<HomePage />} />
                      <Route
                        path="/login"
                        element={
                          <PublicRoute>
                            <LoginPage />
                          </PublicRoute>
                        }
                      />
                      <Route
                        path="/register"
                        element={
                          <PublicRoute>
                            <RegisterPage />
                          </PublicRoute>
                        }
                      />
                      <Route path="/search" element={<SearchPage />} />
                      <Route path="/verify-email/:token" element={<EmailVerificationPage />} />
                      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

                      {/* Protected Routes */}
                      <Route
                        path="/booking/:id"
                        element={
                          <ProtectedRoute>
                            <BookingPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/bookings"
                        element={
                          <ProtectedRoute>
                            <BookingListPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/profile"
                        element={
                          <ProtectedRoute>
                            <ProfilePage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/parking-lots/:id"
                        element={<ParkingLotDetailPage />}
                      />
                      <Route
                        path="/chat"
                        element={
                          <ProtectedRoute>
                            <ChatPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/payment/:id"
                        element={
                          <ProtectedRoute>
                            <PaymentPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/notifications"
                        element={
                          <ProtectedRoute>
                            <NotificationsPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Landowner Routes */}
                      <Route
                        path="/landowner/dashboard"
                        element={
                          <ProtectedRoute requiredRole="landowner">
                            <LandownerDashboardPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/landowner/parking-lots"
                        element={
                          <ProtectedRoute requiredRole="landowner">
                            <ManageParkingLotsPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Fallback */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </main>

                  <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                  />
                </div>
              </Router>
            </SocketProvider>
          </AuthProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </ApolloProvider>
  );
}

export default App;
