import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Database, 
  Network, 
  Zap,
  Clock,
  Archive,
  BookOpen,
  Lightbulb,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import { AgentOrchestrator } from '../system/AgentOrchestrator';

interface MemoryVisualizationProps {
  orchestrator: AgentOrchestrator;
}

export const MemoryVisualization: React.FC<MemoryVisualizationProps> = ({ orchestrator }) => {
  const [memoryData, setMemoryData] = useState<any>(null);
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMemoryData();
    const interval = setInterval(loadMemoryData, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, [selectedAgent]);

  const loadMemoryData = async () => {
    try {
      const report = await orchestrator.getSystemReport();
      setMemoryData(report.memoryStats);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load memory data:', error);
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
          <h2 className="text-2xl font-bold text-white">Adaptive Memory System</h2>
          <p className="text-slate-400">Visualize and monitor agent memory architecture</p>
        </div>
        <select
          value={selectedAgent}
          onChange={(e) => setSelectedAgent(e.target.value)}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all" className="bg-slate-800">All Agents</option>
          <option value="triage" className="bg-slate-800">Triage Agent</option>
          <option value="engagement" className="bg-slate-800">Engagement Agent</option>
          <option value="optimization" className="bg-slate-800">Optimization Agent</option>
        </select>
      </div>

      {/* Memory Architecture Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MemoryTypeCard
          title="Short-term Memory"
          icon={<Zap className="w-6 h-6" />}
          description="Current conversation contexts and active processing"
          data={memoryData}
          type="shortTermItems"
          color="from-blue-500 to-cyan-500"
          maxCapacity={100}
        />
        <MemoryTypeCard
          title="Long-term Memory"
          icon={<Archive className="w-6 h-6" />}
          description="Customer profiles, campaign history, and performance metrics"
          data={memoryData}
          type="longTermItems"
          color="from-green-500 to-emerald-500"
          maxCapacity={1000}
        />
        <MemoryTypeCard
          title="Episodic Memory"
          icon={<BookOpen className="w-6 h-6" />}
          description="Successful interactions and problem resolution patterns"
          data={memoryData}
          type="episodicItems"
          color="from-yellow-500 to-orange-500"
          maxCapacity={500}
        />
        <MemoryTypeCard
          title="Semantic Memory"
          icon={<Lightbulb className="w-6 h-6" />}
          description="Domain knowledge graphs and learned concepts"
          data={memoryData}
          type="semanticItems"
          color="from-purple-500 to-pink-500"
          maxCapacity={300}
        />
      </div>

      {/* Memory Flow Visualization */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
          <Network className="w-5 h-5" />
          <span>Memory Consolidation Flow</span>
        </h3>
        
        <div className="relative">
          <svg viewBox="0 0 800 400" className="w-full h-64">
            {/* Memory Types */}
            <MemoryNode x={100} y={100} label="Short-term" color="#3B82F6" />
            <MemoryNode x={300} y={100} label="Long-term" color="#10B981" />
            <MemoryNode x={500} y={100} label="Episodic" color="#F59E0B" />
            <MemoryNode x={700} y={100} label="Semantic" color="#8B5CF6" />
            
            {/* Consolidation Process */}
            <MemoryNode x={200} y={250} label="Consolidation" color="#EC4899" />
            <MemoryNode x={400} y={250} label="Pattern Extraction" color="#06B6D4" />
            <MemoryNode x={600} y={250} label="Knowledge Update" color="#84CC16" />
            
            {/* Flow Arrows */}
            <FlowArrow from={{ x: 150, y: 130 }} to={{ x: 180, y: 220 }} />
            <FlowArrow from={{ x: 250, y: 250 }} to={{ x: 370, y: 250 }} />
            <FlowArrow from={{ x: 450, y: 250 }} to={{ x: 570, y: 250 }} />
            <FlowArrow from={{ x: 600, y: 220 }} to={{ x: 650, y: 130 }} />
          </svg>
        </div>
      </div>

      {/* Agent Memory Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Object.entries(memoryData || {}).map(([agentId, stats]: [string, any]) => (
          <AgentMemoryCard
            key={agentId}
            agentId={agentId}
            stats={stats}
          />
        ))}
      </div>

      {/* Memory Optimization Recommendations */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <TrendingUp className="w-5 h-5" />
          <span>Memory Optimization Recommendations</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RecommendationCard
            title="Memory Consolidation"
            description="Schedule consolidation during low-activity periods"
            priority="medium"
            impact="Improved retrieval performance"
          />
          <RecommendationCard
            title="Pattern Recognition"
            description="Increase episodic memory analysis frequency"
            priority="high"
            impact="Better learning from interactions"
          />
          <RecommendationCard
            title="Knowledge Sharing"
            description="Enable cross-agent semantic memory sharing"
            priority="low"
            impact="Enhanced collaborative intelligence"
          />
          <RecommendationCard
            title="Memory Compression"
            description="Implement advanced compression algorithms"
            priority="medium"
            impact="Reduced storage requirements"
          />
        </div>
      </div>
    </div>
  );
};

interface MemoryTypeCardProps {
  title: string;
  icon: React.ReactNode;
  description: string;
  data: any;
  type: string;
  color: string;
  maxCapacity: number;
}

const MemoryTypeCard: React.FC<MemoryTypeCardProps> = ({ 
  title, 
  icon, 
  description, 
  data, 
  type, 
  color, 
  maxCapacity 
}) => {
  const totalItems = Object.values(data || {}).reduce((sum: number, stats: any) => 
    sum + (stats[type] || 0), 0
  );
  
  const utilizationPercentage = (totalItems / maxCapacity) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
    >
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-white/10 rounded-lg">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-white">{title}</h3>
          <p className="text-xs text-slate-400">{description}</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-400">Utilization</span>
          <span className="text-white">{totalItems} / {maxCapacity}</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
            className={`bg-gradient-to-r ${color} h-3 rounded-full transition-all duration-1000`}
          />
        </div>
        <div className="text-xs text-slate-400 mt-1">
          {utilizationPercentage.toFixed(1)}% capacity used
        </div>
      </div>

      <div className="text-2xl font-bold text-white mb-1">{totalItems}</div>
      <div className="text-sm text-slate-400">Total Items Stored</div>
    </motion.div>
  );
};

interface AgentMemoryCardProps {
  agentId: string;
  stats: any;
}

const AgentMemoryCard: React.FC<AgentMemoryCardProps> = ({ agentId, stats }) => {
  if (stats.error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
        <h4 className="font-medium text-red-300 mb-2 capitalize">
          {agentId.replace('_', ' ')} Agent
        </h4>
        <p className="text-red-400 text-sm">{stats.error}</p>
      </div>
    );
  }

  const totalItems = Object.values(stats).reduce((sum: number, count: any) => sum + count, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
    >
      <h4 className="font-medium text-white mb-4 capitalize flex items-center space-x-2">
        <Database className="w-4 h-4" />
        <span>{agentId.replace('_', ' ')} Agent</span>
      </h4>
      
      <div className="space-y-3">
        <MemoryBar
          label="Short-term"
          value={stats.shortTermItems || 0}
          color="bg-blue-500"
        />
        <MemoryBar
          label="Long-term"
          value={stats.longTermItems || 0}
          color="bg-green-500"
        />
        <MemoryBar
          label="Episodic"
          value={stats.episodicItems || 0}
          color="bg-yellow-500"
        />
        <MemoryBar
          label="Semantic"
          value={stats.semanticItems || 0}
          color="bg-purple-500"
        />
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="text-center">
          <div className="text-xl font-bold text-white">{totalItems}</div>
          <div className="text-xs text-slate-400">Total Memory Items</div>
        </div>
      </div>
    </motion.div>
  );
};

interface MemoryBarProps {
  label: string;
  value: number;
  color: string;
}

const MemoryBar: React.FC<MemoryBarProps> = ({ label, value, color }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="text-slate-400">{label}</span>
      <span className="text-white font-medium">{value}</span>
    </div>
    <div className="w-full bg-slate-700 rounded-full h-2">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min((value / 100) * 100, 100)}%` }}
        className={`${color} h-2 rounded-full transition-all duration-500`}
      />
    </div>
  </div>
);

interface RecommendationCardProps {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  impact: string;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ title, description, priority, impact }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white/5 rounded-lg p-4 border border-white/10"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-white">{title}</h4>
        <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(priority)}`}>
          {priority.toUpperCase()}
        </span>
      </div>
      <p className="text-sm text-slate-400 mb-3">{description}</p>
      <div className="text-xs text-slate-500">
        <span className="font-medium">Impact:</span> {impact}
      </div>
    </motion.div>
  );
};

// SVG Components for Memory Flow Visualization
interface MemoryNodeProps {
  x: number;
  y: number;
  label: string;
  color: string;
}

const MemoryNode: React.FC<MemoryNodeProps> = ({ x, y, label, color }) => (
  <g>
    <circle
      cx={x}
      cy={y}
      r="30"
      fill={color}
      fillOpacity="0.2"
      stroke={color}
      strokeWidth="2"
    />
    <text
      x={x}
      y={y + 5}
      textAnchor="middle"
      fill="white"
      fontSize="12"
      fontWeight="500"
    >
      {label}
    </text>
  </g>
);

interface FlowArrowProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
}

const FlowArrow: React.FC<FlowArrowProps> = ({ from, to }) => {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;

  return (
    <g>
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        d={`M ${from.x} ${from.y} Q ${midX} ${midY - 20} ${to.x} ${to.y}`}
        stroke="#8B5CF6"
        strokeWidth="2"
        fill="none"
        strokeDasharray="5,5"
      />
      <polygon
        points={`${to.x},${to.y} ${to.x - 8},${to.y - 4} ${to.x - 8},${to.y + 4}`}
        fill="#8B5CF6"
      />
    </g>
  );
};