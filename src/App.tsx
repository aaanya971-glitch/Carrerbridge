import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { AuthModal } from './components/AuthModal';
import { DatabaseSchemaModal } from './components/DatabaseSchemaModal';
import { AiChatbot } from './components/AiChatbot';

// Views
import { HomeView } from './views/HomeView';
import { DashboardView } from './views/DashboardView';
import { ScholarshipsView } from './views/ScholarshipsView';
import { InternshipsView } from './views/InternshipsView';
import { JobsView } from './views/JobsView';
import { CoursesView } from './views/CoursesView';
import { CareerExplorerView } from './views/CareerExplorerView';
import { ResumeAnalyzerView } from './views/ResumeAnalyzerView';
import { SkillGapView } from './views/SkillGapView';
import { ApplicationTrackerView } from './views/ApplicationTrackerView';
import { DeadlineTrackerView } from './views/DeadlineTrackerView';
import { CareerRoadmapChecklistView } from './views/CareerRoadmapChecklistView';
import { BookmarksView } from './views/BookmarksView';
import { AiRecommendationsView } from './views/AiRecommendationsView';
import { ProfileView } from './views/ProfileView';
import { AdminView } from './views/AdminView';

export default function App() {
  const [activeView, setActiveView] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authDefaultTab, setAuthDefaultTab] = useState<'login' | 'register'>('login');
  const [sqlModalOpen, setSqlModalOpen] = useState(false);

  const handleOpenAuth = (tab: 'login' | 'register' = 'login') => {
    setAuthDefaultTab(tab);
    setAuthModalOpen(true);
  };

  const handleSelectResourceFromSearch = (type: string, _id: string) => {
    setSearchOpen(false);
    if (type === 'scholarship') setActiveView('scholarships');
    else if (type === 'internship') setActiveView('internships');
    else if (type === 'job') setActiveView('jobs');
    else if (type === 'course') setActiveView('courses');
    else setActiveView('scholarships');
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'home':
        return (
          <HomeView
            onNavigate={(v: string) => setActiveView(v)}
            onOpenAuth={() => handleOpenAuth('login')}
          />
        );
      case 'dashboard':
        return (
          <DashboardView
            onNavigate={(v: string) => setActiveView(v)}
            onOpenMatchModal={() => {}}
          />
        );
      case 'scholarships':
        return <ScholarshipsView />;
      case 'internships':
        return <InternshipsView />;
      case 'jobs':
        return <JobsView />;
      case 'courses':
        return <CoursesView />;
      case 'career-explorer':
        return <CareerExplorerView />;
      case 'resume-analyzer':
        return <ResumeAnalyzerView />;
      case 'skill-gap':
        return <SkillGapView />;
      case 'career-roadmap':
        return <CareerRoadmapChecklistView />;
      case 'applications':
        return <ApplicationTrackerView />;
      case 'deadlines':
        return <DeadlineTrackerView />;
      case 'bookmarks':
        return <BookmarksView onNavigate={(v: string) => setActiveView(v)} />;
      case 'ai-recommendations':
        return <AiRecommendationsView />;
      case 'profile':
        return <ProfileView />;
      case 'admin':
        return <AdminView onOpenSqlConsole={() => setSqlModalOpen(true)} />;
      default:
        return (
          <HomeView
            onNavigate={(v: string) => setActiveView(v)}
            onOpenAuth={() => handleOpenAuth('login')}
          />
        );
    }
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
          {/* Top Navbar */}
          <Navbar
            activeView={activeView}
            setActiveView={(v: string) => setActiveView(v)}
            onOpenSearch={() => setSearchOpen(true)}
            onOpenAuth={() => handleOpenAuth('login')}
            onOpenDbModal={() => setSqlModalOpen(true)}
            onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          />

          <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 gap-6">
            {/* Sidebar Navigation */}
            <Sidebar
              activeView={activeView}
              setActiveView={(v: string) => setActiveView(v)}
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />

            {/* Main Page Canvas */}
            <main className="flex-1 min-w-0 py-2">
              {renderActiveView()}
            </main>
          </div>

          {/* Global Search Modal (triggered by search bar or Ctrl+K) */}
          <GlobalSearchModal
            isOpen={searchOpen}
            onClose={() => setSearchOpen(false)}
            onSelectResource={handleSelectResourceFromSearch}
          />

          {/* Auth Modal */}
          <AuthModal
            isOpen={authModalOpen}
            onClose={() => setAuthModalOpen(false)}
            defaultTab={authDefaultTab}
          />

          {/* Database Schema & SQL Console Modal for Evaluators */}
          <DatabaseSchemaModal
            isOpen={sqlModalOpen}
            onClose={() => setSqlModalOpen(false)}
          />

          {/* Multilingual AI Career Advisor Floating Chatbot */}
          <AiChatbot />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}
