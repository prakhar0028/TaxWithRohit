import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  User as UserIcon, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  ChevronDown, 
  LogOut, 
  LogIn, 
  FileText, 
  Menu,
  Briefcase,
  Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTax } from '../../context/TaxContext';

interface HeaderProps {
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileSidebar = () => {} }) => {
  const { user, isAuthenticated, switchRole, logout, openAuthModal } = useAuth();
  const { 
    assessmentYear, 
    setAssessmentYear, 
    notifications, 
    unreadNotificationCount, 
    markNotificationRead,
    setActiveTab,
    setIsAIAssistantOpen,
    itrRecord
  } = useTax();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  const profilePercent = itrRecord?.progressPercent || 75;

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-8 shrink-0 sticky top-0 z-30">
      {/* Left: Mobile Toggle + Profile Completion Bar */}
      <div className="flex items-center gap-4 sm:gap-6">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Profile Completion Widget */}
        <div className="hidden sm:flex items-center gap-3">
          <span className="text-xs sm:text-sm text-gray-500 font-medium">Profile Completion:</span>
          <div className="w-28 sm:w-36 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#0EB1B1] rounded-full transition-all duration-500" 
              style={{ width: `${profilePercent}%` }}
            />
          </div>
          <span className="text-xs font-bold text-[#0EB1B1]">{profilePercent}%</span>
        </div>

        <button
          onClick={() => setActiveTab('landing')}
          className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-teal-50 hover:bg-teal-100 text-[#07383D] border border-teal-200/60 rounded-md text-xs font-bold transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#0EB1B1]" />
          <span>Services Catalog</span>
        </button>
      </div>

      {/* Center: Clean Search Bar */}
      <div className="hidden md:flex flex-1 max-w-sm mx-6">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tax tools, 80C, ITR..."
            className="w-full bg-gray-50 border border-gray-200 text-xs rounded-lg pl-9 pr-3 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0EB1B1]/30 focus:border-[#0EB1B1] transition-all"
          />
        </div>
      </div>

      {/* Right Actions: AY, Role Switcher, Notifications, Sign Out / Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* AY Selector */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-md text-xs font-medium text-gray-700">
          <span className="text-gray-400">AY:</span>
          <select
            value={assessmentYear}
            onChange={(e) => setAssessmentYear(e.target.value)}
            className="bg-transparent font-bold text-[#07383D] focus:outline-none cursor-pointer text-xs"
          >
            <option value="2025-26">2025-26</option>
            <option value="2024-25">2024-25</option>
          </select>
        </div>

        {/* Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-md transition-colors border border-gray-200"
            title="Switch User, Expert, Admin mode"
          >
            <Layers className="w-3.5 h-3.5 text-[#0EB1B1]" />
            <span className="hidden sm:inline text-xs text-gray-500">Mode:</span>
            <span className="text-[#07383D] font-bold text-xs capitalize">
              {user?.role === 'TAX_EXPERT' ? 'CA Expert' : user?.role || 'User'}
            </span>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>

          {showRoleSwitcher && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 z-50 animate-in fade-in duration-100">
              <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Switch View Mode
              </div>
              <button
                onClick={() => { switchRole('USER'); setShowRoleSwitcher(false); setActiveTab('dashboard'); }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-gray-50 ${user?.role === 'USER' ? 'font-bold text-[#0EB1B1] bg-teal-50/50' : 'text-gray-700'}`}
              >
                <div className="flex items-center gap-2">
                  <UserIcon className="w-3.5 h-3.5 text-[#0EB1B1]" />
                  <span>Taxpayer View</span>
                </div>
                {user?.role === 'USER' && <CheckCircle2 className="w-3.5 h-3.5 text-[#0EB1B1]" />}
              </button>

              <button
                onClick={() => { switchRole('TAX_EXPERT'); setShowRoleSwitcher(false); setActiveTab('expert'); }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-gray-50 ${user?.role === 'TAX_EXPERT' ? 'font-bold text-purple-600 bg-purple-50/50' : 'text-gray-700'}`}
              >
                <div className="flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-purple-600" />
                  <span>CA Tax Desk</span>
                </div>
                {user?.role === 'TAX_EXPERT' && <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />}
              </button>

              <button
                onClick={() => { switchRole('ADMIN'); setShowRoleSwitcher(false); setActiveTab('admin'); }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-gray-50 ${user?.role === 'ADMIN' ? 'font-bold text-amber-600 bg-amber-50/50' : 'text-gray-700'}`}
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Admin Panel</span>
                </div>
                {user?.role === 'ADMIN' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />}
              </button>
            </div>
          )}
        </div>

        {/* Notifications Icon with Indicator */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-in fade-in duration-100">
              <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                <span className="font-bold text-xs text-gray-800">Notifications</span>
                <span className="text-[10px] font-semibold text-[#0EB1B1] bg-teal-50 px-2 py-0.5 rounded-full">
                  {unreadNotificationCount} New
                </span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-gray-400">No new notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationRead(n.id);
                        if (n.actionUrl) setActiveTab(n.actionUrl.replace('/', '') as any);
                        setShowNotifications(false);
                      }}
                      className={`p-3 text-xs hover:bg-gray-50 cursor-pointer ${!n.read ? 'bg-teal-50/30' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-0.5">
                        <span className="font-bold text-gray-900">{n.title}</span>
                        <span className="text-[10px] text-gray-400">{n.timestamp}</span>
                      </div>
                      <p className="text-gray-500 text-[11px] line-clamp-2">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile or Sign Out / Login */}
        {isAuthenticated ? (
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="px-3.5 py-1.5 bg-gray-50 text-[#07383D] font-semibold text-xs border border-gray-200 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <span>{user?.name?.split(' ')[0] || 'Account'}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 z-50">
                <button
                  onClick={() => { setActiveTab('profile'); setShowProfileMenu(false); }}
                  className="w-full text-left px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <UserIcon className="w-3.5 h-3.5 text-gray-400" />
                  My Profile
                </button>
                <button
                  onClick={() => { setActiveTab('documents'); setShowProfileMenu(false); }}
                  className="w-full text-left px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5 text-gray-400" />
                  Documents
                </button>
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={() => { logout(); setShowProfileMenu(false); }}
                  className="w-full text-left px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-500" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => openAuthModal()}
            className="px-4 py-2 bg-gray-50 text-[#07383D] font-semibold text-xs border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};
