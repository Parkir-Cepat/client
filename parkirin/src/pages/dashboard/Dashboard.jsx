import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { useAuth } from '../../hooks';
import { StatCard, QuickActions, RecentActivity } from '../../components/dashboard';
import { LoadingSpinner } from '../../components/common';
import { GET_DASHBOARD_STATS, GET_RECENT_ACTIVITY } from '../../graphql/queries';
import { formatCurrency } from '../../utils/formatters';

const Dashboard = () => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  
  const { 
    data: statsData, 
    loading: statsLoading, 
    error: statsError 
  } = useQuery(GET_DASHBOARD_STATS);
  
  const { 
    data: activityData, 
    loading: activityLoading 
  } = useQuery(GET_RECENT_ACTIVITY, {
    variables: { limit: 10 }
  });

  // Animation and time effects
  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (statsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative z-10 text-center space-y-8">
          <div className="relative">
            {/* Main loading animation */}
            <div className="relative w-28 h-28 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-gradient-to-r from-blue-400 to-purple-500 opacity-20"></div>
              <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
              <div className="absolute inset-4 rounded-full border-4 border-transparent border-t-purple-500 animate-spin animate-reverse"></div>
              <div className="absolute inset-6 rounded-full border-4 border-transparent border-t-pink-500 animate-spin"></div>
              
              {/* Center pulse */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Loading Dashboard
            </h3>
            <p className="text-slate-600 text-lg">Preparing your personalized experience...</p>
            
            {/* Loading dots */}
            <div className="flex justify-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Error background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ef4444' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <div className="relative z-10 max-w-lg w-full">
          <div className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-red-100/50 p-10 text-center relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-red-100 rounded-full opacity-20 blur-2xl"></div>
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-rose-100 rounded-full opacity-30 blur-xl"></div>
            
            <div className="relative z-10 space-y-6">
              <div className="w-28 h-28 mx-auto mb-8 bg-gradient-to-br from-red-100 to-rose-100 rounded-full flex items-center justify-center shadow-xl border-4 border-white">
                <svg className="w-14 h-14 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              <div className="space-y-3">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                  Oops! Something went wrong
                </h2>
                <p className="text-slate-600 leading-relaxed">{statsError.message}</p>
              </div>
              
              <button 
                onClick={() => window.location.reload()} 
                className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold rounded-2xl overflow-hidden transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-red-200"
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Try Again</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-rose-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = statsData?.getDashboardStats || {};
  const activities = activityData?.getRecentActivity || [];

  // Enhanced stats generation with modern styling
  const getStatsForRole = () => {
    const baseStats = [
      {
        title: 'Wallet Balance',
        value: formatCurrency(
          typeof stats.walletBalance === 'number'
            ? stats.walletBalance
            : (user?.saldo || 0)
        ),
        change: typeof stats.walletChange === 'number' ? stats.walletChange : 0,
        changeType: stats.walletChange > 0 ? 'positive' : (stats.walletChange < 0 ? 'negative' : 'neutral'),
        color: 'emerald',
        gradient: 'from-emerald-400 to-teal-500',
        icon: () => (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        )
      }
    ];

    switch (user?.role) {
      case 'landowner':
        return [
          ...baseStats,
          {
            title: 'Total Parking Lots',
            value: typeof stats.totalParkingLots === 'number' ? stats.totalParkingLots : 0,
            change: typeof stats.parkingLotsChange === 'number' ? stats.parkingLotsChange : 0,
            changeType: 'positive',
            color: 'blue',
            gradient: 'from-blue-400 to-indigo-500',
            icon: () => (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            )
          },
          {
            title: 'Monthly Earnings',
            value: formatCurrency(typeof stats.monthlyEarnings === 'number' ? stats.monthlyEarnings : 0),
            change: typeof stats.earningsChange === 'number' ? stats.earningsChange : 0,
            changeType: stats.earningsChange > 0 ? 'positive' : (stats.earningsChange < 0 ? 'negative' : 'neutral'),
            color: 'violet',
            gradient: 'from-violet-400 to-purple-500',
            icon: () => (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            )
          },
          {
            title: 'Active Bookings',
            value: typeof stats.activeBookings === 'number' ? stats.activeBookings : 0,
            change: typeof stats.bookingsChange === 'number' ? stats.bookingsChange : 0,
            changeType: 'neutral',
            color: 'amber',
            gradient: 'from-amber-400 to-orange-500',
            icon: () => (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )
          }
        ];
      
      case 'admin':
        return [
          ...baseStats,
          {
            title: 'Total Users',
            value: typeof stats.totalUsers === 'number' ? stats.totalUsers : 0,
            change: typeof stats.usersChange === 'number' ? stats.usersChange : 0,
            changeType: 'positive',
            color: 'blue',
            gradient: 'from-blue-400 to-cyan-500',
            icon: () => (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-1a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )
          },
          {
            title: 'Platform Revenue',
            value: formatCurrency(typeof stats.platformRevenue === 'number' ? stats.platformRevenue : 0),
            change: typeof stats.revenueChange === 'number' ? stats.revenueChange : 0,
            changeType: stats.revenueChange > 0 ? 'positive' : (stats.revenueChange < 0 ? 'negative' : 'neutral'),
            color: 'emerald',
            gradient: 'from-emerald-400 to-green-500',
            icon: () => (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            )
          },
          {
            title: 'Pending Approvals',
            value: typeof stats.pendingApprovals === 'number' ? stats.pendingApprovals : 0,
            change: null,
            changeType: 'neutral',
            color: 'rose',
            gradient: 'from-rose-400 to-pink-500',
            icon: () => (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            )
          }
        ];
      
      default: // regular user
        return [
          ...baseStats,
          {
            title: 'Active Bookings',
            value: typeof stats.activeBookings === 'number' ? stats.activeBookings : 0,
            change: null,
            changeType: 'neutral',
            color: 'blue',
            gradient: 'from-blue-400 to-indigo-500',
            icon: () => (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )
          },
          {
            title: 'Total Bookings',
            value: typeof stats.totalBookings === 'number' ? stats.totalBookings : 0,
            change: typeof stats.bookingsChange === 'number' ? stats.bookingsChange : 0,
            changeType: 'positive',
            color: 'violet',
            gradient: 'from-violet-400 to-purple-500',
            icon: () => (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            )
          },
          {
            title: 'Total Spent',
            value: formatCurrency(typeof stats.totalSpent === 'number' ? stats.totalSpent : 0),
            change: typeof stats.spentChange === 'number' ? stats.spentChange : 0,
            changeType: 'neutral',
            color: 'amber',
            gradient: 'from-amber-400 to-orange-500',
            icon: () => (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            )
          }
        ];
    }
  };

  const userStats = getStatsForRole();

  // Enhanced utility functions
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getRoleData = () => {
    switch (user?.role) {
      case 'landowner': 
        return { 
          emoji: '🏢', 
          gradient: 'from-blue-600 via-indigo-600 to-purple-600', 
          accent: 'blue',
          description: 'Manage your parking empire with precision and style'
        };
      case 'admin': 
        return { 
          emoji: '👑', 
          gradient: 'from-purple-600 via-violet-600 to-indigo-600', 
          accent: 'purple',
          description: 'Command the platform with administrative excellence'
        };
      default: 
        return { 
          emoji: '🚗', 
          gradient: 'from-emerald-600 via-teal-600 to-cyan-600', 
          accent: 'emerald',
          description: 'Discover premium parking experiences tailored for you'
        };
    }
  };

  const roleData = getRoleData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Enhanced Background with Mesh Gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary background mesh */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(168, 85, 247, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)
          `
        }}></div>
        
        {/* Floating gradient orbs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-violet-400/20 to-purple-400/20 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-2xl animate-pulse-slow"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
        <div className="absolute top-40 right-32 w-3 h-3 bg-indigo-400 rounded-full animate-bounce delay-300"></div>
        <div className="absolute bottom-32 left-1/3 w-1 h-1 bg-violet-400 rounded-full animate-pulse delay-700"></div>
      </div>

      <div className={`relative z-10 p-4 sm:p-6 lg:p-8 space-y-8 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Revolutionary Header Design */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#f16634] via-[#f16634] to-[#f89b6c] rounded-3xl shadow-2xl border border-orange-200/50">
          {/* Header background patterns */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-white/10"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-300/10 rounded-full translate-y-1/2 -translate-x-1/3 blur-2xl"></div>
          
          {/* Geometric decorations */}
          <div className="absolute top-6 left-6 w-12 h-12 border-2 border-white/30 rotate-45 rounded-lg"></div>
          <div className="absolute bottom-6 right-6 w-8 h-8 border-2 border-white/20 rotate-12 rounded-md"></div>
          <div className="absolute top-1/2 right-20 w-6 h-6 bg-white/20 rounded-full animate-pulse"></div>
          
          <div className="relative p-8 md:p-12 lg:p-16">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="space-y-6 max-w-4xl">
                <div className="flex items-start space-x-4">
                  <div className="relative group">
                    <div className="text-6xl md:text-7xl animate-bounce filter drop-shadow-2xl group-hover:scale-110 transition-transform duration-300">
                      {roleData.emoji}
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-ping"></div>
                    <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-orange-300 rounded-full animate-pulse delay-500"></div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-white/90 text-xl font-semibold tracking-wide flex items-center space-x-2">
                      <span>{getGreeting()}</span>
                      <span className="text-2xl">✨</span>
                    </p>
                    <h1 className="text-4xl md:text-5xl xl:text-7xl font-black text-white leading-tight">
                      Welcome back,
                      <br />
                      <span className="bg-gradient-to-r from-yellow-200 via-orange-200 to-yellow-300 bg-clip-text text-transparent drop-shadow-lg">
                        {user?.name}
                      </span>
                      <span className="text-yellow-200">!</span>
                    </h1>
                  </div>
                </div>
                <p className="text-white/90 text-xl md:text-2xl max-w-3xl leading-relaxed font-medium">
                  {roleData.description}
                </p>
              </div>
              
              {/* Enhanced action buttons */}
              <div className="flex flex-col sm:flex-row gap-4 lg:flex-col">
                <button className="group relative px-10 py-5 bg-white/20 backdrop-blur-xl border-2 border-white/30 rounded-2xl text-white font-bold text-lg hover:bg-white/30 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/25 overflow-hidden">
                  <span className="relative z-10 flex items-center space-x-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Quick Action</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </button>
                
                <button className="group relative px-10 py-5 bg-gradient-to-r from-yellow-400 to-orange-400 border-2 border-yellow-300 rounded-2xl text-orange-900 font-bold text-lg hover:from-yellow-500 hover:to-orange-500 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl overflow-hidden">
                  <span className="relative z-10 flex items-center space-x-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>View Analytics</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Revolutionary Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {userStats.map((stat, index) => (
            <div
              key={index}
              className={`group transform transition-all duration-700 hover:scale-105 hover:-translate-y-3`}
              style={{ 
                animationDelay: `${index * 200}ms`,
                animation: mounted ? 'slideInUp 0.8s ease-out forwards' : 'none'
              }}
            >
              <div className="relative overflow-hidden bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 group-hover:bg-white/80">
                {/* Background gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl`}></div>
                
                {/* Icon container */}
                <div className={`relative z-10 w-16 h-16 mx-auto mb-6 bg-gradient-to-br ${stat.gradient} rounded-2xl flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon />
                </div>
                
                {/* Content */}
                <div className="relative z-10 text-center space-y-3">
                  <h3 className="text-slate-600 font-semibold text-lg">{stat.title}</h3>
                  <p className="text-3xl font-black text-slate-800">{stat.value}</p>
                  {stat.change !== null && (
                    <div className={`flex items-center justify-center space-x-1 text-sm font-medium ${
                      stat.changeType === 'positive' ? 'text-emerald-600' : 
                      stat.changeType === 'negative' ? 'text-red-600' : 'text-slate-600'
                    }`}>
                      <span>{stat.changeType === 'positive' ? '↗' : stat.changeType === 'negative' ? '↘' : '→'}</span>
                      <span>{Math.abs(stat.change)}%</span>
                    </div>
                  )}
                </div>
                
                {/* Hover decoration */}
                <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Quick Actions with Advanced Glass Morphism */}
          <div className="xl:col-span-1 space-y-6">
            <div className="relative overflow-hidden bg-white/60 backdrop-blur-2xl border border-white/60 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 group-hover:from-blue-100/80 group-hover:to-indigo-100/80 transition-all duration-500"></div>
              <div className="relative z-10">
                <QuickActions 
                  userRole={user?.role} 
                  className="p-8 rounded-3xl border-0 bg-transparent shadow-none"
                />
              </div>
            </div>
          </div>

          {/* Recent Activity with Premium Design */}
          <div className="xl:col-span-2">
            <div className="relative overflow-hidden bg-white/60 backdrop-blur-2xl border border-white/60 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 group">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-50/80 to-purple-50/80 group-hover:from-violet-100/80 group-hover:to-purple-100/80 transition-all duration-500"></div>
              <div className="relative z-10">
                <RecentActivity 
                  activities={activities} 
                  loading={activityLoading}
                  className="p-8 rounded-3xl border-0 bg-transparent shadow-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Widget Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Real-time Clock Widget */}
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 group">
            {/* Background decoration */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-blue-400/20 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
            
            <div className="relative z-10 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Current Time</h3>
              </div>
              <div className="space-y-2">
                <p className="text-5xl font-black tracking-tight">
                  {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-blue-100 font-medium">
                  {currentTime.toLocaleDateString('id-ID', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* System Status Widget */}
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 rounded-3xl p-8 text-white shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 group">
            {/* Background decoration */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
            <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-emerald-400/20 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
            
            <div className="relative z-10 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">System Status</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-5 h-5 bg-emerald-300 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 w-5 h-5 bg-emerald-300 rounded-full animate-ping"></div>
                  </div>
                  <span className="text-emerald-100 font-semibold text-lg">All Systems Operational</span>
                </div>
                <p className="text-emerald-100 font-medium">Platform running smoothly ✨</p>
              </div>
            </div>
          </div>

          {/* Enhanced User Role Badge */}
          <div className={`relative overflow-hidden bg-gradient-to-br ${roleData.gradient} rounded-3xl p-8 text-white shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 group`}>
            {/* Background decoration */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
            <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
            
            <div className="relative z-10 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Your Role</h3>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-4xl filter drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
                  {roleData.emoji}
                </div>
                <div>
                  <p className="text-3xl font-black capitalize tracking-tight">{user?.role}</p>
                  <p className="text-white/80 font-medium">Access Level</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Custom Animations */}
      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(40px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(-5deg); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animate-reverse {
          animation-direction: reverse;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;