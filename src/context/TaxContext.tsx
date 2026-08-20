import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  ITRFilingRecord, 
  DocumentItem, 
  TaxNoticeItem, 
  InvestmentItem, 
  NotificationItem, 
  ServiceItem 
} from '../types';
import { useAuth } from './AuthContext';

export type ActiveTab = 
  | 'dashboard'
  | 'itr-filing'
  | 'services'
  | 'service-detail'
  | 'tax-notices'
  | 'calculators'
  | 'investments'
  | 'documents'
  | 'profile'
  | 'pricing'
  | 'subscription'
  | 'blogs'
  | 'blog-detail'
  | 'support'
  | 'admin'
  | 'expert'
  | 'landing';

interface TaxContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedServiceSlug: string | null;
  setSelectedServiceSlug: (slug: string | null) => void;
  selectedBlogSlug: string | null;
  setSelectedBlogSlug: (slug: string | null) => void;
  assessmentYear: string;
  setAssessmentYear: (ay: string) => void;
  itrRecord: ITRFilingRecord | null;
  setItrRecord: React.Dispatch<React.SetStateAction<ITRFilingRecord | null>>;
  updateITRState: (updates: Partial<ITRFilingRecord>) => Promise<void>;
  documents: DocumentItem[];
  refreshDocuments: () => Promise<void>;
  uploadDocument: (doc: { name: string; type: any; fileSize: string; assessmentYear?: string }) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  notices: TaxNoticeItem[];
  refreshNotices: () => Promise<void>;
  uploadNotice: (notice: any) => Promise<void>;
  investments: InvestmentItem[];
  refreshInvestments: () => Promise<void>;
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  markNotificationRead: (id: string) => Promise<void>;
  services: ServiceItem[];
  isAIAssistantOpen: boolean;
  setIsAIAssistantOpen: (open: boolean) => void;
}

const TaxContext = createContext<TaxContextType | undefined>(undefined);

export const TaxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedServiceSlug, setSelectedServiceSlug] = useState<string | null>(null);
  const [selectedBlogSlug, setSelectedBlogSlug] = useState<string | null>(null);
  const [assessmentYear, setAssessmentYear] = useState<string>('2025-26');
  const [itrRecord, setItrRecord] = useState<ITRFilingRecord | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [notices, setNotices] = useState<TaxNoticeItem[]>([]);
  const [investments, setInvestments] = useState<InvestmentItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);

  // Load user data on auth / AY change
  useEffect(() => {
    fetchInitialData();
  }, [user, assessmentYear]);

  const fetchInitialData = async () => {
    try {
      const headers = { 'x-user-id': user?.id || 'user_demo_101' };

      // 1. Fetch ITR
      const itrRes = await fetch(`/api/itr?ay=${assessmentYear}`, { headers });
      if (itrRes.ok) {
        const data = await itrRes.json();
        setItrRecord(data);
      }

      // 2. Fetch Documents
      const docRes = await fetch('/api/documents', { headers });
      if (docRes.ok) {
        const data = await docRes.json();
        setDocuments(data);
      }

      // 3. Fetch Notices
      const noticeRes = await fetch('/api/tax-notices', { headers });
      if (noticeRes.ok) {
        const data = await noticeRes.json();
        setNotices(data);
      }

      // 4. Fetch Investments
      const invRes = await fetch('/api/investments', { headers });
      if (invRes.ok) {
        const data = await invRes.json();
        setInvestments(data);
      }

      // 5. Fetch Notifications
      const notifRes = await fetch('/api/notifications', { headers });
      if (notifRes.ok) {
        const data = await notifRes.json();
        setNotifications(data);
      }

      // 6. Fetch Services Catalog
      const srvRes = await fetch('/api/services');
      if (srvRes.ok) {
        const data = await srvRes.json();
        setServices(data);
      }
    } catch (err) {
      console.error('Error loading initial tax data:', err);
    }
  };

  const updateITRState = async (updates: Partial<ITRFilingRecord>) => {
    if (!itrRecord) return;
    try {
      const res = await fetch(`/api/itr/${itrRecord.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'user_demo_101',
        },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        setItrRecord(updated);
      }
    } catch (err) {
      console.error('Failed to update ITR:', err);
    }
  };

  const refreshDocuments = async () => {
    const res = await fetch('/api/documents', { headers: { 'x-user-id': user?.id || 'user_demo_101' } });
    if (res.ok) setDocuments(await res.json());
  };

  const uploadDocument = async (doc: { name: string; type: any; fileSize: string; assessmentYear?: string }) => {
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': user?.id || 'user_demo_101',
      },
      body: JSON.stringify(doc),
    });
    if (res.ok) refreshDocuments();
  };

  const deleteDocument = async (id: string) => {
    const res = await fetch(`/api/documents/${id}`, {
      method: 'DELETE',
      headers: { 'x-user-id': user?.id || 'user_demo_101' },
    });
    if (res.ok) refreshDocuments();
  };

  const refreshNotices = async () => {
    const res = await fetch('/api/tax-notices', { headers: { 'x-user-id': user?.id || 'user_demo_101' } });
    if (res.ok) setNotices(await res.json());
  };

  const uploadNotice = async (notice: any) => {
    const res = await fetch('/api/tax-notices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': user?.id || 'user_demo_101',
      },
      body: JSON.stringify(notice),
    });
    if (res.ok) refreshNotices();
  };

  const refreshInvestments = async () => {
    const res = await fetch('/api/investments', { headers: { 'x-user-id': user?.id || 'user_demo_101' } });
    if (res.ok) setInvestments(await res.json());
  };

  const markNotificationRead = async (id: string) => {
    const res = await fetch(`/api/notifications/${id}/read`, {
      method: 'PUT',
      headers: { 'x-user-id': user?.id || 'user_demo_101' },
    });
    if (res.ok) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }
  };

  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  return (
    <TaxContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedServiceSlug,
        setSelectedServiceSlug,
        selectedBlogSlug,
        setSelectedBlogSlug,
        assessmentYear,
        setAssessmentYear,
        itrRecord,
        setItrRecord,
        updateITRState,
        documents,
        refreshDocuments,
        uploadDocument,
        deleteDocument,
        notices,
        refreshNotices,
        uploadNotice,
        investments,
        refreshInvestments,
        notifications,
        unreadNotificationCount,
        markNotificationRead,
        services,
        isAIAssistantOpen,
        setIsAIAssistantOpen,
      }}
    >
      {children}
    </TaxContext.Provider>
  );
};

export const useTax = () => {
  const context = useContext(TaxContext);
  if (!context) throw new Error('useTax must be used within a TaxProvider');
  return context;
};
