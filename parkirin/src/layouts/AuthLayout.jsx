import { Outlet } from 'react-router-dom';
import { LogoGroup } from '../components/common';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-pattern-grid transform rotate-3"></div>
      </div>
      
      {/* Orange decorative elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-orange-500 rounded-full filter blur-3xl opacity-20 animate-pulse-slow"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-orange-400 rounded-full filter blur-3xl opacity-20 animate-float"></div>
      
      <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-white/30 relative z-10">
        <div className="flex flex-col items-center justify-center space-y-3 mb-6">
          <LogoGroup size="large" variant="default" withText withTagline animated />
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
