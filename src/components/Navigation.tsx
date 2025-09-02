import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  Target, 
  Brain, 
  Settings,
  Home,
  Activity
} from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home className="w-4 h-4" /> },
    { id: 'leads', label: 'Lead Management', icon: <Users className="w-4 h-4" /> },
    { id: 'campaigns', label: 'Campaigns', icon: <Target className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'memory', label: 'Memory System', icon: <Brain className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> }
  ];

  return (
    <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Purple Merit AI</span>
          </div>

          {/* Navigation Items */}
          <div className="flex space-x-1">
            {navItems.map((item) => (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
              </motion.button>
            ))}
          </div>

          {/* System Status */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-slate-300">System Online</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};