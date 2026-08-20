import React from 'react';
import { 
  LayoutDashboard, 
  FileSpreadsheet, 
  Layers, 
  AlertOctagon, 
  Calculator, 
  TrendingUp, 
  FolderLock, 
  Crown, 
  BookOpen, 
  HelpCircle, 
  UserCheck, 
  ShieldAlert, 
  X,
  ArrowRight,
  Sparkles,
  LogOut
} from 'lucide-react';
import { useTax, ActiveTab } from '../../context/TaxContext';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen = false, onCloseMobile = () => {} }) => {
  const { activeTab, setActiveTab, itrRecord } = useTax();
  const { user, logout, isAuthenticated } = useAuth();

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    onCloseMobile();
  };

  const navItems: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string }[] = [
    { id: 'landing', label: 'Explore Services', icon: Sparkles, badge: 'All' },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { 
      id: 'itr-filing', 
      label: 'ITR Filing', 
      icon: FileSpreadsheet, 
      badge: `${itrRecord?.progressPercent || 65}%` 
    },
    { id: 'services', label: 'Services', icon: Layers },
    { id: 'investments', label: 'Investment Hub', icon: TrendingUp },
    { id: 'tax-notices', label: 'Notice Cloud', icon: AlertOctagon, badge: 'New' },
    { id: 'calculators', label: 'Calculators', icon: Calculator },
    { id: 'documents', label: 'Documents', icon: FolderLock },
    { id: 'subscription', label: 'Plans & Pricing', icon: Crown },
    { id: 'blogs', label: 'Tax Guides', icon: BookOpen },
    { id: 'support', label: 'Support & FAQs', icon: HelpCircle },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Clean Minimalism Sidebar Container */}
      <aside className={`
        fixed lg:sticky top-0 bottom-0 left-0 z-50 w-[240px] shrink-0 h-screen bg-[#07383D] text-white flex flex-col transition-transform duration-300 ease-in-out select-none
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="p-6 pb-4 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              TAX<span className="text-[#0EB1B1]">WITHROHIT</span>
            </h1>
            <p className="text-[10px] opacity-60 tracking-[0.2em] font-semibold mt-1 uppercase">
              SIMPLE | ACCURATE | SECURE
            </p>
          </div>

          <button
            onClick={onCloseMobile}
            className="lg:hidden text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || 
              (item.id === 'services' && activeTab === 'service-detail') || 
              (item.id === 'blogs' && activeTab === 'blog-detail');

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`
                  w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm transition-all text-left
                  ${isActive 
                    ? 'bg-white/10 text-white font-medium border-l-4 border-[#0EB1B1] shadow-xs' 
                    : 'text-white/60 hover:text-white hover:bg-white/5 font-normal'}
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#0EB1B1]' : 'opacity-80'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`
                    text-[10px] font-semibold px-2 py-0.5 rounded-full
                    ${isActive ? 'bg-[#0EB1B1]/20 text-[#0EB1B1]' : 'bg-white/10 text-white/80'}
                  `}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Role specific portals */}
          {(user?.role === 'ADMIN' || user?.role === 'TAX_EXPERT') && (
            <div className="pt-3 mt-3 border-t border-white/10 space-y-1">
              <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#0EB1B1]/80">
                Staff Desk
              </div>

              {user?.role === 'TAX_EXPERT' && (
                <button
                  onClick={() => handleNavClick('expert')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-all ${
                    activeTab === 'expert' ? 'bg-white/10 text-white font-medium border-l-4 border-[#0EB1B1]' : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-[#0EB1B1]" />
                  <span>CA Expert Desk</span>
                </button>
              )}

              {user?.role === 'ADMIN' && (
                <button
                  onClick={() => handleNavClick('admin')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-all ${
                    activeTab === 'admin' ? 'bg-white/10 text-white font-medium border-l-4 border-[#0EB1B1]' : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>Admin Panel</span>
                </button>
              )}
            </div>
          )}
        </nav>

        {/* User Footer / Profile Summary */}
        <div className="p-4 border-t border-white/10 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#0EB1B1] flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-sm">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover rounded-full" />
                ) : (
                  user?.name ? user.name.trim().split(/\s+/).map(n => n?.[0] || '').join('').slice(0, 2).toUpperCase() : 'AM'
                )}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'Ananya M.'}</p>
                <p className="text-[10px] opacity-50 truncate">{user?.subscriptionTier ? `${user.subscriptionTier} User` : 'Premium User'}</p>
              </div>
            </div>

            {isAuthenticated && (
              <button 
                onClick={logout} 
                className="text-white/40 hover:text-white p-1.5 rounded-md hover:bg-white/10 transition-colors"
                title="Log out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
