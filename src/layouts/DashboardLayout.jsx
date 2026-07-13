import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useUiStore } from '../store/uiStore';
import Breadcrumbs from '../components/Breadcrumbs';
import ToastContainer from '../components/ToastContainer';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  BarChart3, 
  Settings, 
  Menu, 
  ChevronLeft, 
  ChevronRight, 
  Sun, 
  Moon, 
  Bell, 
  LogOut, 
  User as UserIcon,
  Search,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { 
    sidebarCollapsed, 
    toggleSidebar, 
    mobileSidebarOpen, 
    toggleMobileSidebar, 
    setMobileSidebarOpen 
  } = useUiStore();
  
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const profileRef = useRef(null);
  const notifyRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (notifyRef.current && !notifyRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      roles: ['admin'],
    },
    {
      name: 'Products',
      path: '/products',
      icon: <ShoppingBag className="w-4 h-4" />,
      roles: ['admin', 'user'],
    },
    {
      name: 'Analytics',
      path: '/analytics',
      icon: <BarChart3 className="w-4 h-4" />,
      roles: ['admin'],
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: <Settings className="w-4 h-4" />,
      roles: ['admin', 'user'],
    },
  ];

  const visibleMenuItems = menuItems.filter(item => item.roles.includes(user?.role));

  const mockNotifications = [
    { id: 1, text: "Stock warning: 'iPhone 15' is below 5 units", time: "2 min ago", unread: true },
    { id: 2, text: "Weekly sales report is ready to download", time: "1 hour ago", unread: true },
    { id: 3, text: "System maintenance scheduled for tonight", time: "5 hours ago", unread: false },
  ];

  const unreadCount = mockNotifications.filter(n => n.unread).length;

  return (
    <div className="min-h-screen flex bg-notion-bg dark:bg-notion-dark-bg text-notion-text dark:text-notion-dark-text transition-colors duration-150 font-sans">
      <ToastContainer />
      
      {/* ================= SIDEBAR - DESKTOP ================= */}
      <aside 
        className={`hidden md:flex flex-col border-r border-notion-border dark:border-notion-dark-border bg-notion-sidebar dark:bg-notion-dark-sidebar sticky top-0 h-screen transition-all duration-200 z-30 ${
          sidebarCollapsed ? 'w-16' : 'w-60'
        }`}
      >
        {/* Brand Logo Header */}
        <div className="h-14 flex items-center px-4.5 border-b border-notion-border dark:border-notion-dark-border justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-sm select-none">
            <img 
              src="/alpha1-removebg-preview.png" 
              alt="Alpha Logo" 
              className="w-6 h-6 object-contain bg-transparent filter brightness-115 dark:brightness-105" 
            />
            {!sidebarCollapsed && (
              <span className="text-notion-text dark:text-notion-dark-text tracking-tight font-bold">
                Alpha
              </span>
            )}
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-2.5 py-4 space-y-1">
          {visibleMenuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 group
                ${isActive 
                  ? 'bg-[#3B82F6]/12 text-white pl-[9px] border-l-[3px] border-[#3B82F6] rounded-l-none' 
                  : 'text-white/65 hover:bg-white/5 hover:text-white pl-3'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <div className={`flex-shrink-0 transition-colors ${isActive ? 'text-[#3B82F6]' : 'text-white/50 group-hover:text-white/80'}`}>
                    {item.icon}
                  </div>
                  {!sidebarCollapsed && <span>{item.name}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Profile Summary at bottom */}
        <div className="p-3 border-t border-notion-border dark:border-notion-dark-border space-y-2 bg-notion-bg/30 dark:bg-notion-dark-card/30">
          <div className="flex items-center gap-2.5 min-w-0">
            <img 
              src={user?.avatar || "/default-avatar.png"} 
              alt={user?.name} 
              className="w-7 h-7 rounded object-cover border border-notion-border dark:border-[#333]" 
            />
            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-bold text-notion-text dark:text-white block truncate leading-tight">
                  {user?.name}
                </span>
                <span className="text-[9px] text-notion-muted dark:text-notion-dark-muted block truncate capitalize">
                  {user?.role}
                </span>
              </div>
            )}
          </div>
          {!sidebarCollapsed && (
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded bg-notion-bg hover:bg-notion-hover dark:bg-[#1E1E1E] dark:hover:bg-[#2A2A2D] text-[10px] font-bold text-rose-600 dark:text-rose-455 transition-colors cursor-pointer border border-notion-border/50 dark:border-[#333]/30"
            >
              <LogOut className="w-3 h-3" />
              <span>Sign Out</span>
            </button>
          )}
        </div>

        {/* Sidebar Footer Collapse Toggle */}
        <div className="p-3.5 border-t border-notion-border dark:border-notion-dark-border flex justify-end">
          <button 
            onClick={toggleSidebar}
            className="p-1.5 rounded-md hover:bg-notion-hover dark:hover:bg-notion-dark-hover transition-colors text-notion-muted dark:text-notion-dark-muted cursor-pointer"
          >
            {sidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>
      </aside>

      {/* ================= SIDEBAR - MOBILE DRAWER ================= */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMobileSidebar}
              className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40 md:hidden"
            />
            {/* Drawer Content */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-notion-sidebar dark:bg-notion-dark-sidebar z-50 border-r border-notion-border dark:border-notion-dark-border p-5 flex flex-col md:hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <Link to="/" className="flex items-center gap-2 font-bold text-sm">
                  <img 
                    src="/alpha1-removebg-preview.png" 
                    alt="Alpha Logo" 
                    className="w-6 h-6 object-contain bg-transparent filter brightness-115 dark:brightness-105" 
                  />
                  <span>Alpha</span>
                </Link>
                <button 
                  onClick={toggleMobileSidebar}
                  className="p-1 rounded-md hover:bg-notion-hover dark:hover:bg-notion-dark-hover text-notion-muted dark:text-notion-dark-muted"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="flex-1 space-y-1">
                {visibleMenuItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors
                      ${isActive 
                        ? 'bg-notion-selected dark:bg-notion-dark-selected text-notion-accent dark:text-notion-dark-accent' 
                        : 'text-notion-muted dark:text-notion-dark-muted hover:bg-notion-hover dark:hover:bg-notion-dark-hover hover:text-notion-text dark:hover:text-notion-dark-text'
                      }
                    `}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </NavLink>
                ))}
              </nav>

              <div className="border-t border-notion-border dark:border-notion-dark-border pt-4 mt-auto">
                <div className="flex items-center gap-3 mb-4">
                  <img src={user?.avatar} alt={user?.name} className="w-9 h-9 rounded-md object-cover border border-notion-border dark:border-notion-dark-border" />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold truncate">{user?.name}</h4>
                    <p className="text-[10px] text-notion-muted dark:text-notion-dark-muted capitalize">{user?.role}</p>
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-notion-border dark:border-notion-dark-border text-notion-muted dark:text-notion-dark-muted hover:bg-notion-hover dark:hover:bg-notion-dark-hover text-xs font-semibold transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ================= MAIN CONTAINER ================= */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* ================= TOP NAVBAR ================= */}
        <header className="sticky top-0 z-20 bg-notion-sidebar dark:bg-notion-dark-sidebar border-b border-notion-border dark:border-notion-dark-border h-14 flex items-center px-4 md:px-6 justify-between shadow-sm">
          
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleMobileSidebar}
              className="p-1.5 rounded-md bg-notion-hover dark:bg-notion-dark-hover text-notion-muted dark:text-notion-dark-muted md:hidden hover:text-notion-text dark:hover:text-notion-dark-text transition-colors"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Quick search input */}
            <div className="hidden sm:flex items-center gap-2 bg-notion-hover dark:bg-notion-dark-hover border border-notion-border dark:border-notion-dark-border rounded-lg px-2.5 py-1 w-52 text-notion-muted hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <Search className="w-3.5 h-3.5 text-notion-muted" />
              <span className="text-[11px] font-semibold">Search...</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-notion-muted hover:text-notion-text dark:hover:text-notion-dark-text hover:bg-notion-hover dark:hover:bg-notion-dark-hover border border-transparent transition-colors cursor-pointer"
              title={theme === 'light' ? "Switch to Dark" : "Switch to Light"}
            >
              {theme === 'light' ? <Moon className="w-4.5 h-4.5" /> : <Sun className="w-4.5 h-4.5" />}
            </button>

            {/* Notifications Dropdown */}
            <div className="relative" ref={notifyRef}>
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-1.5 rounded-lg text-notion-muted hover:text-notion-text dark:hover:text-notion-dark-text hover:bg-notion-hover dark:hover:bg-notion-dark-hover border border-transparent transition-colors cursor-pointer relative"
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-notion-accent rounded-full" />
                )}
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.1 }}
                    className="absolute right-0 mt-1.5 w-72 rounded-lg bg-notion-sidebar dark:bg-notion-dark-sidebar border border-notion-border dark:border-notion-dark-border shadow-lg overflow-hidden z-50 py-1"
                  >
                    <div className="px-3.5 py-2 border-b border-notion-border dark:border-notion-dark-border flex items-center justify-between">
                      <span className="font-bold text-xs">Notifications</span>
                      {unreadCount > 0 && <span className="text-[10px] bg-notion-selected dark:bg-notion-dark-selected text-notion-accent dark:text-notion-dark-accent px-1.5 py-0.5 rounded font-bold">{unreadCount} New</span>}
                    </div>
                    <div className="max-h-56 overflow-y-auto">
                      {mockNotifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={`px-3.5 py-2.5 border-b border-notion-border dark:border-notion-dark-border/40 last:border-0 hover:bg-notion-hover dark:hover:bg-notion-dark-hover cursor-pointer ${
                            notification.unread ? 'bg-notion-selected/10' : ''
                          }`}
                        >
                          <p className="text-[11px] text-notion-text dark:text-notion-dark-text font-medium leading-normal">{notification.text}</p>
                          <span className="text-[9px] text-notion-muted mt-0.5 block">{notification.time}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Divider */}
            <div className="h-5 w-px bg-notion-border dark:bg-notion-dark-border mx-1" />

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-1.5 cursor-pointer p-0.5 rounded-lg focus:outline-none"
              >
                <img 
                  src={user?.avatar} 
                  alt={user?.name} 
                  className="w-7 h-7 rounded-md object-cover border border-notion-border dark:border-notion-dark-border" 
                />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.1 }}
                    className="absolute right-0 mt-1.5 w-48 rounded-lg bg-notion-sidebar dark:bg-notion-dark-sidebar border border-notion-border dark:border-notion-dark-border shadow-lg overflow-hidden z-50 py-1"
                  >
                    <div className="px-3.5 py-2 border-b border-notion-border dark:border-notion-dark-border">
                      <p className="text-xs font-bold truncate">{user?.name}</p>
                      <p className="text-[10px] text-notion-muted truncate">{user?.email}</p>
                    </div>

                    <div className="p-1">
                      <Link 
                        to="/settings"
                        onClick={() => setProfileOpen(false)}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] text-notion-text dark:text-notion-dark-text hover:bg-notion-hover dark:hover:bg-notion-dark-hover font-semibold transition-colors ${
                          user?.role !== 'admin' ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''
                        }`}
                      >
                        <UserIcon className="w-3.5 h-3.5" />
                        Settings
                      </Link>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-semibold transition-colors cursor-pointer text-left"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* ================= CONTENT PAGE ================= */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 w-full">
          {/* Breadcrumbs Banner */}
          <Breadcrumbs />
          
          {/* Inner Views */}
          <div className="mt-2">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
