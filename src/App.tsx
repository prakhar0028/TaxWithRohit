import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { TaxProvider, useTax } from './context/TaxContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { AuthModal } from './components/common/AuthModal';
import { AITaxAssistant } from './components/common/AITaxAssistant';

// Views
import { LandingView } from './components/views/LandingView';
import { DashboardView } from './components/views/DashboardView';
import { ITRFilingView } from './components/views/ITRFilingView';
import { ServicesView, ServiceDetailView } from './components/views/ServicesView';
import { TaxNoticesView } from './components/views/TaxNoticesView';
import { CalculatorsView } from './components/views/CalculatorsView';
import { InvestmentsView } from './components/views/InvestmentsView';
import { DocumentsView } from './components/views/DocumentsView';
import { ProfileView } from './components/views/ProfileView';
import { PricingView } from './components/views/PricingView';
import { BlogsView } from './components/views/BlogsView';
import { SupportView } from './components/views/SupportView';
import { AdminView } from './components/views/AdminView';
import { ExpertView } from './components/views/ExpertView';

const MainContent: React.FC = () => {
  const { activeTab } = useTax();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'landing':
        return <LandingView />;
      case 'dashboard':
        return <DashboardView />;
      case 'itr-filing':
        return <ITRFilingView />;
      case 'services':
        return <ServicesView />;
      case 'service-detail':
        return <ServiceDetailView />;
      case 'tax-notices':
        return <TaxNoticesView />;
      case 'calculators':
        return <CalculatorsView />;
      case 'investments':
        return <InvestmentsView />;
      case 'documents':
        return <DocumentsView />;
      case 'profile':
        return <ProfileView />;
      case 'pricing':
      case 'subscription':
        return <PricingView />;
      case 'blogs':
        return <BlogsView />;
      case 'support':
        return <SupportView />;
      case 'admin':
        return <AdminView />;
      case 'expert':
        return <ExpertView />;
      default:
        return <LandingView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7FA] flex font-sans text-[#1A1A1A] antialiased selection:bg-[#0EB1B1]/20 selection:text-[#07383D]">
      {/* Sidebar Component */}
      <Sidebar isMobileOpen={isMobileOpen} onCloseMobile={() => setIsMobileOpen(false)} />

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header onToggleMobileSidebar={() => setIsMobileOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>

        <Footer />
      </div>

      {/* Modals & AI Assistant Drawer */}
      <AuthModal />
      <AITaxAssistant />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <TaxProvider>
        <MainContent />
      </TaxProvider>
    </AuthProvider>
  );
}
