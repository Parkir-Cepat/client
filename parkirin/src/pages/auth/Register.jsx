import { useState, useEffect } from "react";
import { useMutation, gql } from "@apollo/client";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import {
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import useAuthStore from "../../store/authStore";

const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        _id
        email
        name
        role
      }
    }
  }
`;

const GOOGLE_AUTH_MUTATION = gql`
  mutation GoogleAuth($token: String!) {
    googleAuth(token: $token) {
      token
      user {
        _id
        name
        email
        avatar
      }
    }
  }
`;

const Register = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // Animation state
  const [isVisible, setIsVisible] = useState(false);

  // Form validation state
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Enhanced validation with #promptBoost requirements
  const validateName = (name) => {
    if (!name) {
      setNameError("Nama wajib diisi");
      return false;
    } else if (name.length < 2) {
      setNameError("Nama minimal 2 karakter");
      return false;
    } else {
      setNameError("");
      return true;
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("Email wajib diisi");
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError("Format email tidak valid");
      return false;
    } else {
      setEmailError("");
      return true;
    }
  };

  const validatePassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!password) {
      setPasswordError("Password wajib diisi");
      return false;
    } else if (password.length < 8) {
      setPasswordError("Password minimal 8 karakter");
      return false;
    } else if (!hasUpperCase) {
      setPasswordError("Password harus mengandung huruf besar");
      return false;
    } else if (!hasNumber) {
      setPasswordError("Password harus mengandung angka");
      return false;
    } else {
      setPasswordError("");
      return true;
    }
  };

  const [register, { loading }] = useMutation(REGISTER_MUTATION, {
    onCompleted: (data) => {
      const { token, user } = data.register;
      localStorage.setItem("token", token);
      setAuth(user, token);
      navigate("/dashboard");
    },
    onError: (error) => {
      setError(error.message || "Terjadi kesalahan saat mendaftar");
    },
  });

  const [googleAuth, { loading: googleLoading }] = useMutation(
    GOOGLE_AUTH_MUTATION,
    {
      onCompleted: (data) => {
        const { token, user } = data.googleAuth;
        localStorage.setItem("token", token);
        setAuth(user, token);
        navigate("/dashboard");
      },
      onError: (error) => {
        setError(error.message || "Google Sign Up gagal");
      },
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Validate form
    const isNameValid = validateName(formData.name);
    const isEmailValid = validateEmail(formData.email);
    const isPasswordValid = validatePassword(formData.password);

    if (!isNameValid || !isEmailValid || !isPasswordValid) {
      return;
    }

    register({
      variables: {
        input: formData,
      },
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Real-time validation
    if (name === "name" && nameError) validateName(value);
    if (name === "email" && emailError) validateEmail(value);
    if (name === "password" && passwordError) validatePassword(value);
  };

  const handleGoogleSuccess = (response) => {
    setError("");
    googleAuth({
      variables: {
        token: response.credential,
      },
    });
  };

  const handleGoogleError = () => {
    setError("Google Sign Up gagal. Silakan coba lagi.");
  };

  // Loading state check
  const isLoading = loading || googleLoading;

  // Validation state icons
  const getValidationIcon = (field, error) => {
    if (!formData[field]) return null;
    return error ? (
      <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
    ) : (
      <CheckCircleIcon className="w-5 h-5 text-green-400" />
    );
  };

  return (
    <div className="w-screen h-screen bg-black flex overflow-hidden">
      {/* Left Side - Instagram-Style Phone Mockups - Optimized for 1366px width */}
      <div className="hidden lg:flex lg:w-[60%] xl:w-[65%] relative overflow-hidden">
        {/* Background with Instagram gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-orange-600 to-red-900"></div>

        {/* Floating Phone Mockups - Adjusted for laptop viewport */}
        <div className="relative z-10 flex items-center justify-center w-full px-8 py-6">
          <div className="relative scale-90 xl:scale-100">
            {/* Main Phone - Optimized sizing for laptop screen */}
            <div className="relative z-20 transform rotate-12 translate-x-6">
              <div className="w-64 h-[520px] bg-black rounded-[2.5rem] p-2 shadow-2xl">
                <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden relative">
                  {/* Status Bar */}
                  <div className="h-5 bg-white flex items-center justify-between px-4 text-xs text-black">
                    <span>9:41</span>
                    <div className="flex space-x-1">
                      <div className="w-3 h-1.5 bg-black rounded-sm"></div>
                      <div className="w-1 h-1.5 bg-black rounded-sm"></div>
                      <div className="w-5 h-1.5 bg-green-500 rounded-sm"></div>
                    </div>
                  </div>

                  {/* ParkGo App Interface - Compact for laptop */}
                  <div className="flex flex-col h-full bg-gradient-to-br from-orange-50 to-orange-100 p-3">
                    <div className="text-center mb-3">
                      <img
                        src="/logo_ParkGo.png"
                        alt="ParkGo Logo"
                        className="w-12 h-12 mx-auto mb-2 object-contain"
                        style={{
                          filter:
                            "drop-shadow(0 0 8px rgba(241, 102, 52, 0.3))",
                          background: "transparent",
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextElementSibling.style.display = "flex";
                        }}
                      />
                      <div
                        className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg"
                        style={{ display: "none" }}
                      >
                        <span className="text-white font-bold text-lg">P</span>
                      </div>
                      <h3 className="text-base font-bold text-orange-600">
                        ParkGo
                      </h3>
                      <p className="text-xs text-gray-600">
                        Smart Parking Solution
                      </p>
                    </div>

                    {/* Profile Section - Compact */}
                    <div className="bg-white rounded-xl p-3 shadow-lg mb-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            U
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">
                            Welcome!
                          </p>
                          <p className="text-xs text-gray-600">
                            Find your perfect spot
                          </p>
                        </div>
                      </div>

                      {/* Quick Stats - Compact grid */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-green-50 rounded-lg p-2 text-center">
                          <div className="text-base font-bold text-green-600">
                            24
                          </div>
                          <div className="text-xs text-green-600">
                            Available
                          </div>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-2 text-center">
                          <div className="text-base font-bold text-orange-600">
                            Rp 0
                          </div>
                          <div className="text-xs text-orange-600">Balance</div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons - Compact */}
                    <div className="space-y-1.5">
                      <button className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold text-sm">
                        Find Parking
                      </button>
                      <button className="w-full bg-white border border-orange-200 text-orange-600 py-2 rounded-lg font-semibold text-sm">
                        My Bookings
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary Phone - Adjusted size */}
            <div className="absolute top-12 -left-12 z-10 transform -rotate-12">
              <div className="w-52 h-[420px] bg-black rounded-[2rem] p-2 shadow-xl opacity-80">
                <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 rounded-[1.5rem] overflow-hidden relative">
                  <div className="h-5 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                  <div className="p-3 flex flex-col items-center justify-center h-full">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mb-3 flex items-center justify-center">
                      <span className="text-white font-bold text-xl">✓</span>
                    </div>
                    <h3 className="text-base font-bold text-gray-800 mb-1">
                      Success!
                    </h3>
                    <p className="text-sm text-gray-600 text-center">
                      Account created successfully
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Third Phone - Adjusted size */}
            <div className="absolute bottom-8 left-16 z-5 transform rotate-6">
              <div className="w-48 h-[380px] bg-black rounded-[2rem] p-2 shadow-lg opacity-60">
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 rounded-[1.5rem] overflow-hidden">
                  <div className="h-5 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                  <div className="p-3">
                    <div className="grid grid-cols-3 gap-1.5 mt-3">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                        <div
                          key={i}
                          className={`h-8 rounded-md ${
                            i % 3 === 0
                              ? "bg-green-400"
                              : i % 2 === 0
                              ? "bg-orange-400"
                              : "bg-blue-400"
                          }`}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Elements - Adjusted positions for laptop screen */}
        <div className="absolute top-16 left-16 w-6 h-6 bg-pink-500 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-24 w-5 h-5 bg-blue-500 rounded-full animate-bounce"></div>
        <div className="absolute bottom-24 left-24 w-8 h-8 bg-purple-500 rounded-full animate-pulse"></div>
        <div className="absolute bottom-40 right-16 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
      </div>

      {/* Right Side - Registration Form - Optimized for laptop screen (40% width at 1366px) */}
      <div className="w-full lg:w-[40%] xl:w-[35%] flex items-center justify-center bg-black px-6 py-4 overflow-y-auto">
        <div className="w-full max-w-sm mx-auto">
          {/* Logo and Title - Compact for laptop viewport */}
          <div
            className={`text-center mb-6 transform transition-all duration-700 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            {/* Instagram-style script font - Adjusted size */}
            <img
              src="/logo_ParkGo.png"
              alt="ParkGo Logo"
              className="w-16 h-16 mx-auto mb-2 object-contain"
              style={{
                filter: "drop-shadow(0 0 8px rgba(241, 102, 52, 0.3))",
                background: "transparent",
              }}
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextElementSibling.style.display = "flex";
              }}
            />
            <h1
              className="text-4xl text-orange-400 font-bold text-white mb-2"
              style={{ fontFamily: "" }}
            >
              ParkGo
            </h1>
            <p className="text-gray-400 text-sm font-light">
              Join to find the perfect parking spot
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div
              className={`mb-4 transform transition-all duration-300 ${
                error ? "scale-100 opacity-100" : "scale-95 opacity-0"
              }`}
            >
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start space-x-2">
                <ExclamationTriangleIcon className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-red-300 text-xs">{error}</p>
              </div>
            </div>
          )}

          {/* Register Form - Compact spacing for laptop */}
          <form
            onSubmit={handleSubmit}
            className={`space-y-4 transform transition-all duration-700 delay-200 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            {/* Name Field - Compact */}
            <div className="space-y-1.5">
              <div className="relative">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={() => validateName(formData.name)}
                  className={`w-full px-3 py-2.5 bg-gray-900/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-sm ${
                    nameError
                      ? "border-red-500 bg-red-900/10"
                      : formData.name && !nameError
                      ? "border-green-500 bg-green-900/10"
                      : "border-gray-700 hover:border-gray-600"
                  }`}
                  placeholder="Full name"
                />
                <div className="absolute right-2.5 top-1/2 transform -translate-y-1/2">
                  {getValidationIcon("name", nameError)}
                </div>
              </div>
              {nameError && (
                <p className="text-red-400 text-xs flex items-center space-x-1 animate-slide-down">
                  <ExclamationTriangleIcon className="w-3 h-3 flex-shrink-0" />
                  <span>{nameError}</span>
                </p>
              )}
            </div>

            {/* Email Field - Compact */}
            <div className="space-y-1.5">
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => validateEmail(formData.email)}
                  className={`w-full px-3 py-2.5 bg-gray-900/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-sm ${
                    emailError
                      ? "border-red-500 bg-red-900/10"
                      : formData.email && !emailError
                      ? "border-green-500 bg-green-900/10"
                      : "border-gray-700 hover:border-gray-600"
                  }`}
                  placeholder="Email address"
                />
                <div className="absolute right-2.5 top-1/2 transform -translate-y-1/2">
                  {getValidationIcon("email", emailError)}
                </div>
              </div>
              {emailError && (
                <p className="text-red-400 text-xs flex items-center space-x-1 animate-slide-down">
                  <ExclamationTriangleIcon className="w-3 h-3 flex-shrink-0" />
                  <span>{emailError}</span>
                </p>
              )}
            </div>

            {/* Password Field - Compact */}
            <div className="space-y-1.5">
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => validatePassword(formData.password)}
                  className={`w-full px-3 py-2.5 pr-16 bg-gray-900/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-sm ${
                    passwordError
                      ? "border-red-500 bg-red-900/10"
                      : formData.password && !passwordError
                      ? "border-green-500 bg-green-900/10"
                      : "border-gray-700 hover:border-gray-600"
                  }`}
                  placeholder="Password"
                />
                <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                  {getValidationIcon("password", passwordError)}
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
              {passwordError && (
                <p className="text-red-400 text-xs flex items-center space-x-1 animate-slide-down">
                  <ExclamationTriangleIcon className="w-3 h-3 flex-shrink-0" />
                  <span>{passwordError}</span>
                </p>
              )}
              {/* Password Requirements Indicator - Compact */}
              {formData.password && (
                <div className="mt-2 space-y-1 bg-gray-900/30 rounded-md p-2">
                  <div className="flex items-center space-x-1.5 text-xs">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        formData.password.length >= 8
                          ? "bg-green-500"
                          : "bg-gray-500"
                      }`}
                    ></div>
                    <span
                      className={
                        formData.password.length >= 8
                          ? "text-green-400"
                          : "text-gray-400"
                      }
                    >
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-xs">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        /[A-Z]/.test(formData.password)
                          ? "bg-green-500"
                          : "bg-gray-500"
                      }`}
                    ></div>
                    <span
                      className={
                        /[A-Z]/.test(formData.password)
                          ? "text-green-400"
                          : "text-gray-400"
                      }
                    >
                      One uppercase letter
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-xs">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        /[0-9]/.test(formData.password)
                          ? "bg-green-500"
                          : "bg-gray-500"
                      }`}
                    ></div>
                    <span
                      className={
                        /[0-9]/.test(formData.password)
                          ? "text-green-400"
                          : "text-gray-400"
                      }
                    >
                      One number
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Role Field - Compact */}
            <div className="space-y-1.5">
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-gray-600 text-sm"
              >
                <option value="user">User (Looking for parking)</option>
                <option value="landowner">Landowner (Rent your space)</option>
              </select>
            </div>

            {/* Register Button - Compact */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-600 to-black-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:from-orange-700 hover:to-black-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] text-sm"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                  <span>Creating account...</span>
                </div>
              ) : (
                "Sign up"
              )}
            </button>

            {/* Divider - Compact */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-black text-gray-400 font-medium">
                  OR
                </span>
              </div>
            </div>

            {/* Google Register - Optimized for laptop */}
            <div className="flex justify-center">
              <div className="w-full transform hover:scale-[1.02] transition-transform duration-200">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  size="medium"
                  width="100%"
                  theme="filled_black"
                  text="signup_with"
                  locale="en"
                />
              </div>
            </div>
          </form>

          {/* Login Link - Compact */}
          <div
            className={`text-center mt-6 pt-4 border-t border-gray-800 transform transition-all duration-700 delay-400 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            <p className="text-gray-400 text-xs">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-ornage-400 hover:text-blue-300 font-semibold transition-colors duration-200 hover:underline"
              >
                Log in
              </Link>
            </p>
          </div>

          {/* Footer - Compact */}
          <div
            className={`text-center mt-4 transform transition-all duration-700 delay-500 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            <p className="text-gray-500 text-xs">
              © 2025 ParkGo. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Custom CSS for laptop viewport optimization */}
      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }

        /* Instagram-style cursive font */
        @import url("https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600;700&display=swap");

        /* Laptop viewport optimizations */
        @media (min-width: 1024px) and (max-width: 1440px) {
          body {
            background-color: #000000 !important;
            overflow: hidden;
          }

          /* Ensure content fits within 768px height */
          .min-h-screen {
            min-height: 100vh;
            max-height: 100vh;
          }
        }

        /* Logo styling for better visibility on black background */
        img[src="/logo_ParkGo.png"] {
          background: transparent;
          border-radius: 8px;
          padding: 2px;
        }

        /* Custom scrollbar for laptop */
        ::-webkit-scrollbar {
          width: 4px;
        }

        ::-webkit-scrollbar-track {
          background: #1f2937;
        }

        ::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 2px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }

        /* Laptop-specific responsive breakpoints */
        @media (min-width: 1366px) {
          .scale-90 {
            transform: scale(0.95);
          }
        }

        @media (max-height: 768px) {
          /* Ensure content fits in 768px height */
          .overflow-y-auto {
            max-height: 100vh;
          }
        }

        /* Prevent horizontal scroll on 1366px width */
        .w-screen {
          max-width: 100vw;
          overflow-x: hidden;
        }
      `}</style>
    </div>
  );
};

export default Register;
