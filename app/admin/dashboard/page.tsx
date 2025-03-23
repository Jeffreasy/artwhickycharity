'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FaChartLine, FaBug, FaUsers, FaBell, FaExclamationTriangle, FaCog, FaSignOutAlt } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import { Loading } from '@/globalComponents/ui/Loading'
import Cookies from 'js-cookie'
import { useSupabaseAuth } from '@/app/providers/SupabaseAuthProvider'

export default function DashboardPage() {
  const router = useRouter()
  const { user, session, signOut } = useSupabaseAuth()
  const [stats, setStats] = useState({
    visitors: 0,
    pageviews: 0,
    errors: 0,
  })
  const [isEmergencyAccess, setIsEmergencyAccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Check for bypass cookie on client side
  useEffect(() => {
    const checkCookies = () => {
      const adminBypass = Cookies.get('admin_bypass');
      setIsEmergencyAccess(adminBypass === 'true');
      
      // Set page title to indicate emergency mode if using bypass
      if (adminBypass === 'true') {
        document.title = '⚠️ EMERGENCY MODE - Admin Dashboard';
        console.log('Emergency access active, showing emergency UI');
      } else {
        document.title = 'Admin Dashboard';
      }
      setIsLoading(false);
    };
    
    checkCookies();
  }, []);

  // Protect dashboard route
  useEffect(() => {
    if (!user && !session && !isEmergencyAccess) {
      console.log('User is not authenticated, redirecting to login');
      router.replace('/admin/login');
    }
  }, [user, session, router, isEmergencyAccess]);

  useEffect(() => {
    // Simuleer het laden van data
    // In een echte applicatie zou je hier API calls maken naar Google Analytics en Sentry
    const timer = setTimeout(() => {
      setStats({
        visitors: 1254,
        pageviews: 3872,
        errors: 12,
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Function to handle logout - clear cookies and redirect
  const handleLogout = async () => {
    console.log('Logging out...');
    try {
      // Clear the admin bypass cookie
      Cookies.remove('admin_bypass', { path: '/' });
      
      // If authenticated with Supabase, sign out
      if (user && session) {
        await signOut();
      }
      
      // Use direct window location change instead of router for a clean redirect
      setTimeout(() => {
        console.log('Redirecting to login page...');
        window.location.href = '/admin/login';
      }, 800);
    } catch (error) {
      console.error('Error during logout:', error);
      // Redirect anyway as fallback
      window.location.href = '/admin/login';
    }
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return <Loading />;
  }

  // If not authenticated and not using emergency access, don't render dashboard content
  if (!user && !session && !isEmergencyAccess) {
    return null;
  }

  return (
    <div className="p-6 pt-24 sm:pt-28 md:pt-32">
      {isEmergencyAccess && (
        <div className="mb-6 rounded-md border-l-4 border-yellow-500 bg-yellow-50 p-4 text-yellow-700 shadow-md dark:bg-yellow-900/30 dark:text-yellow-200">
          <div className="flex items-center">
            <FaExclamationTriangle className="mr-2 text-yellow-500" />
            <p className="font-bold">EMERGENCY ACCESS MODE</p>
          </div>
          <p className="mt-2">You are currently using emergency access. Some functionality may be limited.</p>
          <p className="mt-1 text-sm">User: {user ? user.email : 'Not authenticated via Supabase'}</p>
        </div>
      )}
      
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <button 
          onClick={handleLogout}
          className="flex items-center rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
        >
          <FaSignOutAlt className="mr-2" />
          Logout
        </button>
      </div>

      {/* Stats cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Website Visitors" 
          value={stats.visitors.toLocaleString()} 
          icon={<FaUsers className="text-amber-500" />} 
          change="+5.2%" 
          trend="up"
        />
        <StatCard 
          title="Total Pageviews" 
          value={stats.pageviews.toLocaleString()} 
          icon={<FaChartLine className="text-green-500" />} 
          change="+12.3%" 
          trend="up"
        />
        <StatCard 
          title="Errors Tracked" 
          value={stats.errors.toString()} 
          icon={<FaBug className="text-red-500" />} 
          change="-25%" 
          trend="down"
        />
        <StatCard 
          title="New Alerts" 
          value="3" 
          icon={<FaBell className="text-blue-500" />} 
          change="0" 
          trend="neutral"
        />
      </div>

      {/* Quick access links */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-white">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Link
            href="/admin/analytics"
            className="flex items-center justify-between rounded-lg bg-[#1A1A1A] p-4 transition-colors hover:bg-[#252525]"
          >
            <div>
              <h3 className="text-lg font-medium text-white">View Analytics</h3>
              <p className="text-sm text-gray-400">Check website performance metrics</p>
            </div>
            <FaChartLine className="h-8 w-8 text-amber-500" />
          </Link>
          <Link
            href="/admin/errors"
            className="flex items-center justify-between rounded-lg bg-[#1A1A1A] p-4 transition-colors hover:bg-[#252525]"
          >
            <div>
              <h3 className="text-lg font-medium text-white">Error Logs</h3>
              <p className="text-sm text-gray-400">View and fix application errors</p>
            </div>
            <FaBug className="h-8 w-8 text-amber-500" />
          </Link>
        </div>
      </div>

      {/* Recent activity */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-white">Recent Activity</h2>
        <div className="rounded-lg bg-[#1A1A1A] p-4">
          <div className="space-y-4">
            <ActivityItem
              title="Error Rate Decreased"
              description="Error rate decreased by 25% in the last 24 hours"
              time="2 hours ago"
            />
            <ActivityItem
              title="User Traffic Spike"
              description="Unusual spike in traffic detected from Netherlands"
              time="5 hours ago"
            />
            <ActivityItem
              title="New Error Type"
              description="API Timeout errors increased on checkout page"
              time="Yesterday"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

type StatCardProps = {
  title: string
  value: string
  icon: React.ReactNode
  change: string
  trend: 'up' | 'down' | 'neutral'
}

function StatCard({ title, value, icon, change, trend }: StatCardProps) {
  return (
    <div className="rounded-lg bg-[#1A1A1A] p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <div className="h-8 w-8">{icon}</div>
      </div>
      <div className="mb-2 text-2xl font-bold text-white">{value}</div>
      <div className={`text-sm ${
        trend === 'up' ? 'text-green-500' : 
        trend === 'down' ? 'text-red-500' : 
        'text-gray-400'
      }`}>
        {change} {trend !== 'neutral' && (trend === 'up' ? '↑' : '↓')}
      </div>
    </div>
  )
}

type ActivityItemProps = {
  title: string
  description: string
  time: string
}

function ActivityItem({ title, description, time }: ActivityItemProps) {
  return (
    <div className="flex border-b border-[#2A2A2A] pb-3 last:border-0 last:pb-0">
      <div className="mr-4 h-2 w-2 translate-y-2 rounded-full bg-amber-500"></div>
      <div className="flex-1">
        <h4 className="font-medium text-white">{title}</h4>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
      <div className="text-xs text-gray-500">{time}</div>
    </div>
  )
} 