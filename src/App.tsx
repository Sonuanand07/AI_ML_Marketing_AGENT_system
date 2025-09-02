import React from 'react';
import { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { LeadManagement } from './components/LeadManagement';
import { CampaignManager } from './components/CampaignManager';
import { SystemAnalytics } from './components/SystemAnalytics';
import { MemoryVisualization } from './components/MemoryVisualization';
import { Settings } from './components/Settings';
import { DataUploader } from './components/DataUploader';
import { AgentOrchestrator } from './system/AgentOrchestrator';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orchestrator, setOrchestrator] = useState<AgentOrchestrator | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const initializeSystem = async () => {
      try {
        const newOrchestrator = new AgentOrchestrator();
        await newOrchestrator.initialize();
        setOrchestrator(newOrchestrator);
        setIsInitializing(false);
      } catch (error) {
        console.error('Failed to initialize system:', error);
        setIsInitializing(false);
      }
    };

    initializeSystem();
  }, []);

  const handleDataLoaded = (data: any) => {
    console.log('✅ Marketing data loaded successfully:', data);
    setDataLoaded(true);
    // Initialize agents with real data
    if (orchestrator) {
      orchestrator.loadMarketingData(data);
    }
  };
  const renderContent = () => {
    if (!orchestrator) return null;

    // Show data uploader if no data is loaded
    if (!dataLoaded) {
      return (
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Welcome to AIML Marketing System
            </h2>
            <p className="text-slate-400 text-lg">
              Load your marketing dataset to begin agent-driven automation
            </p>
          </div>
          <DataUploader onDataLoaded={handleDataLoaded} />
        </div>
      );
    }
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard orchestrator={orchestrator} />;
      case 'leads':
        return <LeadManagement orchestrator={orchestrator} />;
      case 'campaigns':
        return <CampaignManager orchestrator={orchestrator} />;
      case 'analytics':
        return <SystemAnalytics orchestrator={orchestrator} />;
      case 'memory':
        return <MemoryVisualization orchestrator={orchestrator} />;
      case 'settings':
        return <Settings orchestrator={orchestrator} />;
      default:
        return <Dashboard orchestrator={orchestrator} />;
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Initializing AIML System</h2>
          <p className="text-slate-400">Setting up multi-agent architecture...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {dataLoaded && <Navigation activeTab={activeTab} onTabChange={setActiveTab} />}
      <main className="container mx-auto px-6 py-8">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
