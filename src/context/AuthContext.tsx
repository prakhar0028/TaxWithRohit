import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserProfile, UserRole, SubscriptionPlanId } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  subscription: { planId: SubscriptionPlanId; expiresAt: string } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithOTP: (phone: string, otp: string, name?: string) => Promise<{ success: boolean; message: string }>;
  loginWithGoogle: (email: string, name?: string) => Promise<{ success: boolean }>;
  switchRole: (role: UserRole) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  logout: () => void;
  openAuthModal: (redirect?: string) => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
  authRedirectUrl: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<{ planId: SubscriptionPlanId; expiresAt: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authRedirectUrl, setAuthRedirectUrl] = useState<string | null>(null);

  // Initialize session
  useEffect(() => {
    fetchSession();
  }, []);

  const fetchSession = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          setUser(data.user);
          setProfile(data.profile);
          setSubscription(data.subscription);
        }
      }
    } catch (err) {
      console.error('Session fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithOTP = async (phone: string, otp: string, name?: string) => {
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, name }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setProfile(data.profile);
        setSubscription(data.subscription);
        setIsAuthModalOpen(false);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'OTP verification failed' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error' };
    }
  };

  const loginWithGoogle = async (email: string, name?: string) => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setProfile(data.profile);
        setSubscription(data.subscription);
        setIsAuthModalOpen(false);
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      return { success: false };
    }
  };

  const switchRole = async (role: UserRole) => {
    try {
      const res = await fetch('/api/auth/dev-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setProfile(data.profile);
        setSubscription(data.subscription);
      }
    } catch (err) {
      console.error('Failed to switch role:', err);
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'user_demo_101',
        },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
      }
    } catch (err) {
      console.error('Profile update error:', err);
    }
  };

  const logout = () => {
    setUser(null);
    setProfile(null);
    setSubscription(null);
  };

  const openAuthModal = (redirect?: string) => {
    if (redirect) setAuthRedirectUrl(redirect);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthRedirectUrl(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        subscription,
        isAuthenticated: !!user,
        isLoading,
        loginWithOTP,
        loginWithGoogle,
        switchRole,
        updateUserProfile,
        logout,
        openAuthModal,
        closeAuthModal,
        isAuthModalOpen,
        authRedirectUrl,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
