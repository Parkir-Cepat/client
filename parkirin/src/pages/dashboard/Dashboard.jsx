import React from 'react';
import { useQuery } from '@apollo/client';
import { useAuth } from '../../hooks';
import { StatCard, QuickActions, RecentActivity } from '../../components/dashboard';
import { LoadingSpinner } from '../../components/common';
import { GET_DASHBOARD_STATS, GET_RECENT_ACTIVITY } from '../../graphql/queries';
import { formatCurrency } from '../../utils/formatters';

const Dashboard = () => {
  const { user } = useAuth();
  
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

  if (statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading dashboard..." />
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600">{statsError.message}</p>
        </div>
      </div>
    );
  }

  const stats = statsData?.getDashboardStats || {};
  const activities = activityData?.getRecentActivity || [];

  // Generate stats based on user role
  const getStatsForRole = () => {
    const baseStats = [
      {
        title: 'Wallet Balance',
        value: formatCurrency(user?.saldo || 0),
        change: stats.walletChange,
        changeType: stats.walletChange > 0 ? 'positive' : 'negative',
        color: 'green',
        icon: () => (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            value: stats.totalParkingLots || 0,
            change: stats.parkingLotsChange,
            changeType: 'positive',
            color: 'blue',
            icon: () => (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            )
          },
          {
            title: 'Monthly Earnings',
            value: formatCurrency(stats.monthlyEarnings || 0),
            change: stats.earningsChange,
            changeType: stats.earningsChange > 0 ? 'positive' : 'negative',
            color: 'purple',
            icon: () => (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            )
          },
          {
            title: 'Active Bookings',
            value: stats.activeBookings || 0,
            change: stats.bookingsChange,
            changeType: 'neutral',
            color: 'yellow',
            icon: () => (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            value: stats.totalUsers || 0,
            change: stats.usersChange,
            changeType: 'positive',
            color: 'blue',
            icon: () => (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-1a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )
          },
          {
            title: 'Platform Revenue',
            value: formatCurrency(stats.platformRevenue || 0),
            change: stats.revenueChange,
            changeType: stats.revenueChange > 0 ? 'positive' : 'negative',
            color: 'green',
            icon: () => (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            )
          },
          {
            title: 'Pending Approvals',
            value: stats.pendingApprovals || 0,
            change: null,
            changeType: 'neutral',
            color: 'red',
            icon: () => (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            value: stats.activeBookings || 0,
            change: null,
            changeType: 'neutral',
            color: 'blue',
            icon: () => (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )
          },
          {
            title: 'Total Bookings',
            value: stats.totalBookings || 0,
            change: stats.bookingsChange,
            changeType: 'positive',
            color: 'purple',
            icon: () => (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            )
          },
          {
            title: 'Total Spent',
            value: formatCurrency(stats.totalSpent || 0),
            change: stats.spentChange,
            changeType: 'neutral',
            color: 'yellow',
            icon: () => (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            )
          }
        ];
    }
  };

  const userStats = getStatsForRole();

  return (
    <div className="space-y-8 p-4 sm:p-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#f16634] to-[#f89b6c] rounded-xl p-8 text-white shadow-md">
        <h1 className="text-3xl font-bold">
          Welcome back, {user?.name}! <span className="align-middle">��</span>
        </h1>
        <p className="text-white/90 mt-2 text-lg">
          {user?.role === 'landowner' 
            ? 'Manage your parking lots and track your earnings'
            : user?.role === 'admin'
            ? 'Monitor the platform and manage users'
            : 'Find and book parking spots easily'
          }
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {userStats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            changeType={stat.changeType}
            icon={stat.icon}
            color={stat.color}
            loading={statsLoading}
            className="shadow-lg rounded-xl border-0"
          />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <QuickActions userRole={user?.role} className="rounded-xl shadow-md border-0" />
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <RecentActivity 
            activities={activities} 
            loading={activityLoading}
            className="rounded-xl shadow-md border-0"
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
