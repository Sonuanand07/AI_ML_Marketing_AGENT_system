import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Mail, 
  Target,
  Brain,
  Activity,
  Clock,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { AgentOrchestrator } from '../system/AgentOrchestrator';

interface SystemAnalyticsProps {
  orchestrator: AgentOrchestrator;
}

export const SystemAnalytics: React.FC<SystemAnalyticsProps> = ({ orchestrator }) => {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<string>('7d');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    try {
      const report = await orchestrator.getSystemReport();
      const enhancedData = generateAnalyticsData(report, timeRange);
      setAnalyticsData(enhancedData);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">System Analytics</h2>
          <p className="text-slate-400">Performance insights and system metrics</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="24h" className="bg-slate-800">Last 24 Hours</option>
          <option value="7d" className="bg-slate-800">Last 7 Days</option>
          <option value="30d" className="bg-slate-800">Last 30 Days</option>
          <option value="90d" className="bg-slate-800">Last 90 Days</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard
          icon={<Users className="w-6 h-6" />}
          title="Total Leads Processed"
          value={analyticsData?.totalLeads || 0}
          change="+23%"
          positive={true}
        />
        <AnalyticsCard
          icon={<Mail className="w-6 h-6" />}
          title="Emails Sent"
          value={analyticsData?.emailsSent || 0}
          change="+15%"
          positive={true}
        />
        <AnalyticsCard
          icon={<TrendingUp className="w-6 h-6" />}
          title="Conversion Rate"
          value={`${analyticsData?.conversionRate || 0}%`}
          change="+2.1%"
          positive={true}
        />
        <AnalyticsCard
          icon={<DollarSign className="w-6 h-6" />}
          title="Revenue Generated"
          value={`$${(analyticsData?.revenue || 0).toLocaleString()}`}
          change="+18%"
          positive={true}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Processing Trend */}
        <ChartCard title="Lead Processing Trend" icon={<TrendingUp className="w-5 h-5" />}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData?.leadTrend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }} 
              />
              <Line type="monotone" dataKey="leads" stroke="#8B5CF6" strokeWidth={2} />
              <Line type="monotone" dataKey="qualified" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Campaign Performance */}
        <ChartCard title="Campaign Performance" icon={<BarChart3 className="w-5 h-5" />}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData?.campaignPerformance || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }} 
              />
              <Bar dataKey="openRate" fill="#8B5CF6" />
              <Bar dataKey="clickRate" fill="#EC4899" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Agent Performance */}
        <ChartCard title="Agent Performance" icon={<Brain className="w-5 h-5" />}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData?.agentPerformance || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="agent" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }} 
              />
              <Bar dataKey="efficiency" fill="#10B981" />
              <Bar dataKey="accuracy" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Memory Usage Distribution */}
        <ChartCard title="Memory Usage Distribution" icon={<Activity className="w-5 h-5" />}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData?.memoryDistribution || []}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {(analyticsData?.memoryDistribution || []).map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* System Health */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <Activity className="w-5 h-5" />
          <span>System Health</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <HealthMetric
            label="System Load"
            value={analyticsData?.systemLoad || 0}
            threshold={0.8}
            unit="%"
          />
          <HealthMetric
            label="Memory Usage"
            value={analyticsData?.memoryUsage || 0}
            threshold={0.9}
            unit="%"
          />
          <HealthMetric
            label="Response Time"
            value={analyticsData?.responseTime || 0}
            threshold={2000}
            unit="ms"
            inverse={true}
          />
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5" />
          <span>Recent Alerts</span>
        </h3>
        
        <div className="space-y-3">
          {(analyticsData?.recentAlerts || []).map((alert: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex items-center space-x-3 p-3 rounded-lg ${
                alert.severity === 'high' ? 'bg-red-500/20 border border-red-500/30' :
                alert.severity === 'medium' ? 'bg-yellow-500/20 border border-yellow-500/30' :
                'bg-blue-500/20 border border-blue-500/30'
              }`}
            >
              <AlertTriangle className={`w-4 h-4 ${
                alert.severity === 'high' ? 'text-red-400' :
                alert.severity === 'medium' ? 'text-yellow-400' :
                'text-blue-400'
              }`} />
              <div className="flex-1">
                <p className="text-white text-sm">{alert.message}</p>
                <p className="text-slate-400 text-xs">{alert.timestamp}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                alert.severity === 'high' ? 'text-red-300 bg-red-500/20' :
                alert.severity === 'medium' ? 'text-yellow-300 bg-yellow-500/20' :
                'text-blue-300 bg-blue-500/20'
              }`}>
                {alert.severity.toUpperCase()}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface AnalyticsCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  change: string;
  positive: boolean;
}

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ icon, title, value, change, positive }) => (
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
    <p className="text-2xl font-bold text-white">{value}</p>
  </motion.div>
);

interface ChartCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, icon, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
  >
    <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
      {icon}
      <span>{title}</span>
    </h3>
    {children}
  </motion.div>
);

interface HealthMetricProps {
  label: string;
  value: number;
  threshold: number;
  unit: string;
  inverse?: boolean;
}

const HealthMetric: React.FC<HealthMetricProps> = ({ label, value, threshold, unit, inverse = false }) => {
  const isHealthy = inverse ? value < threshold : value < threshold;
  const percentage = inverse 
    ? Math.min((threshold / Math.max(value, 1)) * 100, 100)
    : Math.min((value / threshold) * 100, 100);

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-slate-300 text-sm">{label}</span>
        <span className={`text-sm font-medium ${isHealthy ? 'text-green-400' : 'text-red-400'}`}>
          {value}{unit}
        </span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className={`h-2 rounded-full transition-all duration-500 ${
            isHealthy 
              ? 'bg-gradient-to-r from-green-500 to-emerald-500'
              : 'bg-gradient-to-r from-red-500 to-orange-500'
          }`}
        />
      </div>
    </div>
  );
};

// Helper function to generate analytics data
function generateAnalyticsData(report: any, timeRange: string): any {
  const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
  
  // Generate trend data
  const leadTrend = Array.from({ length: days }, (_, i) => ({
    date: new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000).toLocaleDateString(),
    leads: Math.floor(Math.random() * 50) + 20,
    qualified: Math.floor(Math.random() * 20) + 5
  }));

  const campaignPerformance = [
    { name: 'Email', openRate: 22.5, clickRate: 3.2 },
    { name: 'Social', openRate: 18.7, clickRate: 2.8 },
    { name: 'Webinar', openRate: 45.2, clickRate: 12.5 },
    { name: 'Content', openRate: 31.8, clickRate: 5.7 }
  ];

  const agentPerformance = [
    { agent: 'Triage', efficiency: 95, accuracy: 88 },
    { agent: 'Engagement', efficiency: 87, accuracy: 92 },
    { agent: 'Optimization', efficiency: 91, accuracy: 85 }
  ];

  const memoryDistribution = [
    { name: 'Short-term', value: 25, color: '#3B82F6' },
    { name: 'Long-term', value: 40, color: '#10B981' },
    { name: 'Episodic', value: 20, color: '#F59E0B' },
    { name: 'Semantic', value: 15, color: '#8B5CF6' }
  ];

  const recentAlerts = [
    {
      message: 'Campaign "Q4 AI Solutions" showing declining open rates',
      severity: 'medium',
      timestamp: '2 hours ago'
    },
    {
      message: 'Memory consolidation completed successfully',
      severity: 'low',
      timestamp: '4 hours ago'
    },
    {
      message: 'High-value lead detected requiring immediate attention',
      severity: 'high',
      timestamp: '6 hours ago'
    }
  ];

  return {
    totalLeads: leadTrend.reduce((sum, day) => sum + day.leads, 0),
    emailsSent: Math.floor(Math.random() * 5000) + 2000,
    conversionRate: (Math.random() * 5 + 2).toFixed(1),
    revenue: Math.floor(Math.random() * 200000) + 100000,
    leadTrend,
    campaignPerformance,
    agentPerformance,
    memoryDistribution,
    recentAlerts,
    systemLoad: Math.random() * 60 + 20,
    memoryUsage: Math.random() * 70 + 15,
    responseTime: Math.random() * 1500 + 200
  };
}