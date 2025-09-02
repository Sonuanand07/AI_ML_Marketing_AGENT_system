import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  TrendingUp, 
  Mail, 
  Target, 
  Brain, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import { AgentOrchestrator } from '../system/AgentOrchestrator';
import { SystemMetrics } from '../types';

interface DashboardProps {
  orchestrator: AgentOrchestrator;
}

export const Dashboard: React.FC<DashboardProps> = ({ orchestrator }) => {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [agentStatuses, setAgentStatuses] = useState<Record<string, any>>({});
  const [memoryStats, setMemoryStats] = useState<Record<string, any>>({});
  const [performanceMetrics, setPerformanceMetrics] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const updateDashboard = async () => {
      try {
        const metrics = orchestrator.getSystemMetrics();
        const statuses = orchestrator.getAgentStatuses();
        const report = await orchestrator.getSystemReport();

        setSystemMetrics(metrics);
        setAgentStatuses(statuses);
        setMemoryStats(report.memoryStats);
        setPerformanceMetrics(report.performanceMetrics);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to update dashboard:', error);
      }
    };

    updateDashboard();
    const interval = setInterval(updateDashboard, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [orchestrator]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            AIML Marketing Multi-Agent System
          </h1>
          <p className="text-slate-300 text-lg">
            Advanced AI-driven marketing automation with adaptive memory
          </p>
        </motion.div>

        {/* System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            icon={<Users className="w-6 h-6" />}
            title="Total Leads"
            value={systemMetrics?.totalLeads || 0}
            change="+12%"
            positive={true}
          />
          <MetricCard
            icon={<Activity className="w-6 h-6" />}
            title="Active Agents"
            value={systemMetrics?.activeAgents || 0}
            change="3/3"
            positive={true}
          />
          <MetricCard
            icon={<Target className="w-6 h-6" />}
            title="Campaigns Running"
            value={systemMetrics?.campaignsRunning || 0}
            change="+2"
            positive={true}
          />
          <MetricCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Conversion Rate"
            value={`${((systemMetrics?.conversionRate || 0) * 100).toFixed(1)}%`}
            change="+0.8%"
            positive={true}
          />
        </div>

        {/* Agent Status Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {Object.entries(agentStatuses).map(([agentId, agent]) => (
            <AgentCard
              key={agentId}
              agent={agent}
              memoryStats={memoryStats[agentId]}
              performanceMetrics={performanceMetrics[agent.type]}
            />
          ))}
        </div>

        {/* Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <PerformanceChart
            title="Lead Processing Pipeline"
            data={performanceMetrics.triage}
          />
          <PerformanceChart
            title="Engagement Metrics"
            data={performanceMetrics.engagement}
          />
        </div>

        {/* Memory Architecture Visualization */}
        <MemoryArchitectureCard memoryStats={memoryStats} />
      </div>
    </div>
  );
};

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  change: string;
  positive: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, title, value, change, positive }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ scale: 1.02 }}
    className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
  >
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-purple-500/20 rounded-lg">
        {icon}
      </div>
      <span className={`text-sm font-medium ${positive ? 'text-green-400' : 'text-red-400'}`}>
        {change}
      </span>
    </div>
    <h3 className="text-slate-300 text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-bold">{value}</p>
  </motion.div>
);

interface AgentCardProps {
  agent: any;
  memoryStats?: any;
  performanceMetrics?: any;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, memoryStats, performanceMetrics }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'processing': return 'text-yellow-400';
      case 'idle': return 'text-blue-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'lead_triage': return <Users className="w-6 h-6" />;
      case 'engagement': return <Mail className="w-6 h-6" />;
      case 'campaign_optimization': return <BarChart3 className="w-6 h-6" />;
      default: return <Brain className="w-6 h-6" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            {getAgentIcon(agent.type)}
          </div>
          <div>
            <h3 className="font-semibold">{agent.name}</h3>
            <p className="text-sm text-slate-400 capitalize">{agent.type.replace('_', ' ')}</p>
          </div>
        </div>
        <div className={`flex items-center space-x-1 ${getStatusColor(agent.status)}`}>
          <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
          <span className="text-sm font-medium capitalize">{agent.status}</span>
        </div>
      </div>

      {/* Capabilities */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-slate-300 mb-2">Capabilities</h4>
        <div className="flex flex-wrap gap-1">
          {agent.capabilities.slice(0, 3).map((capability: string) => (
            <span
              key={capability}
              className="px-2 py-1 bg-purple-500/20 rounded text-xs text-purple-300"
            >
              {capability.replace('_', ' ')}
            </span>
          ))}
          {agent.capabilities.length > 3 && (
            <span className="px-2 py-1 bg-slate-500/20 rounded text-xs text-slate-400">
              +{agent.capabilities.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Memory Stats */}
      {memoryStats && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-slate-300 mb-2">Memory Usage</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Short-term:</span>
              <span>{memoryStats.shortTermItems || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Long-term:</span>
              <span>{memoryStats.longTermItems || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Episodic:</span>
              <span>{memoryStats.episodicItems || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Semantic:</span>
              <span>{memoryStats.semanticItems || 0}</span>
            </div>
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      {performanceMetrics && (
        <div>
          <h4 className="text-sm font-medium text-slate-300 mb-2">Performance</h4>
          <div className="space-y-1 text-xs">
            {Object.entries(performanceMetrics).slice(0, 2).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
                <span>{typeof value === 'number' ? value.toFixed(2) : value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

interface PerformanceChartProps {
  title: string;
  data: any;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ title, data }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
  >
    <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
      <BarChart3 className="w-5 h-5" />
      <span>{title}</span>
    </h3>
    
    {data ? (
      <div className="space-y-3">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-slate-300 capitalize text-sm">
              {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
            </span>
            <div className="flex items-center space-x-2">
              <div className="w-24 bg-slate-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min(typeof value === 'number' ? (value * 100) : 50, 100)}%` 
                  }}
                />
              </div>
              <span className="text-sm font-medium min-w-[3rem] text-right">
                {typeof value === 'number' ? 
                  (value < 1 ? (value * 100).toFixed(1) + '%' : value.toFixed(0)) : 
                  value
                }
              </span>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="flex items-center justify-center h-32 text-slate-400">
        <div className="text-center">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Loading performance data...</p>
        </div>
      </div>
    )}
  </motion.div>
);

interface MemoryArchitectureCardProps {
  memoryStats: Record<string, any>;
}

const MemoryArchitectureCard: React.FC<MemoryArchitectureCardProps> = ({ memoryStats }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
  >
    <h3 className="text-lg font-semibold mb-6 flex items-center space-x-2">
      <Brain className="w-5 h-5" />
      <span>Adaptive Memory Architecture</span>
    </h3>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Object.entries(memoryStats).map(([agentId, stats]) => (
        <div key={agentId} className="space-y-4">
          <h4 className="font-medium text-purple-300 capitalize">
            {agentId.replace('_', ' ')} Agent
          </h4>
          
          {stats.error ? (
            <div className="text-red-400 text-sm">{stats.error}</div>
          ) : (
            <div className="space-y-3">
              <MemoryTypeBar
                label="Short-term"
                value={stats.shortTermItems || 0}
                max={100}
                color="from-blue-500 to-cyan-500"
              />
              <MemoryTypeBar
                label="Long-term"
                value={stats.longTermItems || 0}
                max={500}
                color="from-green-500 to-emerald-500"
              />
              <MemoryTypeBar
                label="Episodic"
                value={stats.episodicItems || 0}
                max={200}
                color="from-yellow-500 to-orange-500"
              />
              <MemoryTypeBar
                label="Semantic"
                value={stats.semanticItems || 0}
                max={300}
                color="from-purple-500 to-pink-500"
              />
            </div>
          )}
        </div>
      ))}
    </div>

    <div className="mt-6 pt-6 border-t border-white/10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-blue-400">
            {Object.values(memoryStats).reduce((sum: number, stats: any) => 
              sum + (stats.shortTermItems || 0), 0
            )}
          </div>
          <div className="text-sm text-slate-400">Short-term Items</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-400">
            {Object.values(memoryStats).reduce((sum: number, stats: any) => 
              sum + (stats.longTermItems || 0), 0
            )}
          </div>
          <div className="text-sm text-slate-400">Long-term Items</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-yellow-400">
            {Object.values(memoryStats).reduce((sum: number, stats: any) => 
              sum + (stats.episodicItems || 0), 0
            )}
          </div>
          <div className="text-sm text-slate-400">Episodic Items</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-purple-400">
            {Object.values(memoryStats).reduce((sum: number, stats: any) => 
              sum + (stats.semanticItems || 0), 0
            )}
          </div>
          <div className="text-sm text-slate-400">Semantic Items</div>
        </div>
      </div>
    </div>
  </motion.div>
);

interface MemoryTypeBarProps {
  label: string;
  value: number;
  max: number;
  color: string;
}

const MemoryTypeBar: React.FC<MemoryTypeBarProps> = ({ label, value, max, color }) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-400">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`bg-gradient-to-r ${color} h-2 rounded-full`}
        />
      </div>
    </div>
  );
};