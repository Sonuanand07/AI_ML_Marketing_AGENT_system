import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Play, 
  Pause, 
  BarChart3, 
  Mail, 
  Users, 
  Target,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Edit,
  Trash2
} from 'lucide-react';
import { AgentOrchestrator } from '../system/AgentOrchestrator';
import { Campaign, CampaignType, CampaignStatus } from '../types';

interface CampaignManagerProps {
  orchestrator: AgentOrchestrator;
}

export const CampaignManager: React.FC<CampaignManagerProps> = ({ orchestrator }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showNewCampaignForm, setShowNewCampaignForm] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCampaigns();
  }, []);

  useEffect(() => {
    filterCampaigns();
  }, [campaigns, selectedType, selectedStatus]);

  const loadCampaigns = async () => {
    try {
      // Generate sample campaigns for demonstration
      const sampleCampaigns = generateSampleCampaigns();
      setCampaigns(sampleCampaigns);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load campaigns:', error);
      setIsLoading(false);
    }
  };

  const filterCampaigns = () => {
    let filtered = campaigns;

    if (selectedType !== 'all') {
      filtered = filtered.filter(campaign => campaign.type === selectedType);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(campaign => campaign.status === selectedStatus);
    }

    setFilteredCampaigns(filtered);
  };

  const handleCreateCampaign = async (campaignData: Partial<Campaign>) => {
    try {
      const result = await orchestrator.createCampaign(campaignData);
      
      if (result.success) {
        setCampaigns(prev => [...prev, result.data]);
        setShowNewCampaignForm(false);
      } else {
        console.error('Failed to create campaign:', result.error);
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
    }
  };

  const handleOptimizeCampaign = async (campaignId: string) => {
    try {
      const result = await orchestrator.optimizeCampaign(campaignId);
      
      if (result.success) {
        // Update campaign with optimization results
        setCampaigns(prev => prev.map(campaign => 
          campaign.id === campaignId 
            ? { ...campaign, lastOptimized: new Date() }
            : campaign
        ));
      }
    } catch (error) {
      console.error('Error optimizing campaign:', error);
    }
  };

  const getStatusColor = (status: CampaignStatus): string => {
    switch (status) {
      case CampaignStatus.ACTIVE: return 'text-green-400 bg-green-500/20';
      case CampaignStatus.DRAFT: return 'text-gray-400 bg-gray-500/20';
      case CampaignStatus.PAUSED: return 'text-yellow-400 bg-yellow-500/20';
      case CampaignStatus.COMPLETED: return 'text-blue-400 bg-blue-500/20';
      case CampaignStatus.CANCELLED: return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getTypeIcon = (type: CampaignType) => {
    switch (type) {
      case CampaignType.EMAIL: return <Mail className="w-4 h-4" />;
      case CampaignType.SOCIAL_MEDIA: return <Users className="w-4 h-4" />;
      case CampaignType.CONTENT_MARKETING: return <Target className="w-4 h-4" />;
      case CampaignType.PAID_ADS: return <DollarSign className="w-4 h-4" />;
      case CampaignType.WEBINAR: return <Calendar className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
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
          <h2 className="text-2xl font-bold text-white">Campaign Management</h2>
          <p className="text-slate-400">Create, monitor, and optimize marketing campaigns</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowNewCampaignForm(true)}
          className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Campaign</span>
        </motion.button>
      </div>

      {/* Filters */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Types</option>
            {Object.values(CampaignType).map(type => (
              <option key={type} value={type} className="bg-slate-800">
                {type.replace('_', ' ').toUpperCase()}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Statuses</option>
            {Object.values(CampaignStatus).map(status => (
              <option key={status} value={status} className="bg-slate-800">
                {status.replace('_', ' ').toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredCampaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onOptimize={() => handleOptimizeCampaign(campaign.id)}
              onEdit={() => setSelectedCampaign(campaign)}
              getStatusColor={getStatusColor}
              getTypeIcon={getTypeIcon}
            />
          ))}
        </AnimatePresence>
      </div>

      {filteredCampaigns.length === 0 && (
        <div className="text-center py-12">
          <div className="text-slate-400 mb-4">
            <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No campaigns found matching your criteria</p>
          </div>
        </div>
      )}

      {/* New Campaign Form Modal */}
      <AnimatePresence>
        {showNewCampaignForm && (
          <NewCampaignForm
            onSubmit={handleCreateCampaign}
            onClose={() => setShowNewCampaignForm(false)}
          />
        )}
      </AnimatePresence>

      {/* Campaign Details Modal */}
      <AnimatePresence>
        {selectedCampaign && (
          <CampaignDetailsModal
            campaign={selectedCampaign}
            onClose={() => setSelectedCampaign(null)}
            onOptimize={() => handleOptimizeCampaign(selectedCampaign.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

interface CampaignCardProps {
  campaign: Campaign;
  onOptimize: () => void;
  onEdit: () => void;
  getStatusColor: (status: CampaignStatus) => string;
  getTypeIcon: (type: CampaignType) => React.ReactNode;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ 
  campaign, 
  onOptimize, 
  onEdit, 
  getStatusColor, 
  getTypeIcon 
}) => {
  const conversionRate = campaign.metrics.sent > 0 
    ? (campaign.metrics.converted / campaign.metrics.sent * 100).toFixed(1)
    : '0.0';

  const openRate = campaign.metrics.sent > 0 
    ? (campaign.metrics.opened / campaign.metrics.sent * 100).toFixed(1)
    : '0.0';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            {getTypeIcon(campaign.type)}
          </div>
          <div>
            <h3 className="font-semibold text-white">{campaign.name}</h3>
            <p className="text-sm text-slate-400 capitalize">
              {campaign.type.replace('_', ' ')}
            </p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
          {campaign.status.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-lg font-bold text-green-400">{conversionRate}%</div>
          <div className="text-xs text-slate-400">Conversion</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-blue-400">{openRate}%</div>
          <div className="text-xs text-slate-400">Open Rate</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-400">Progress</span>
          <span className="text-slate-300">{campaign.metrics.sent} sent</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((campaign.metrics.sent / 1000) * 100, 100)}%` }}
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
          />
        </div>
      </div>

      {/* Budget */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-slate-400">Budget</span>
        <span className="text-sm font-medium">${campaign.budget.toLocaleString()}</span>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOptimize}
          className="flex-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center space-x-1"
        >
          <BarChart3 className="w-3 h-3" />
          <span>Optimize</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onEdit}
          className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center space-x-1"
        >
          <Edit className="w-3 h-3" />
          <span>Details</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

interface NewCampaignFormProps {
  onSubmit: (campaignData: Partial<Campaign>) => void;
  onClose: () => void;
}

const NewCampaignForm: React.FC<NewCampaignFormProps> = ({ onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: CampaignType.EMAIL,
    targetAudience: '',
    content: {
      body: '',
      callToAction: '',
      personalizationTokens: ['name', 'company']
    },
    budget: 5000,
    startDate: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      targetAudience: formData.targetAudience.split(',').map(s => s.trim()),
      startDate: new Date(formData.startDate)
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-800 rounded-xl p-6 w-full max-w-2xl border border-white/20 max-h-[90vh] overflow-y-auto"
      >
        <h3 className="text-xl font-semibold text-white mb-4">Create New Campaign</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Campaign Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter campaign name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Campaign Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as CampaignType }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {Object.values(CampaignType).map(type => (
                  <option key={type} value={type} className="bg-slate-800">
                    {type.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Target Audience (comma-separated)
            </label>
            <input
              type="text"
              value={formData.targetAudience}
              onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., tech_companies, startups, enterprise"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Campaign Content *
            </label>
            <textarea
              required
              value={formData.content.body}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                content: { ...prev.content, body: e.target.value }
              }))}
              rows={4}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter your campaign message..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Call to Action *
            </label>
            <input
              type="text"
              required
              value={formData.content.callToAction}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                content: { ...prev.content, callToAction: e.target.value }
              }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., Schedule a demo, Download whitepaper"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Budget ($)
              </label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData(prev => ({ ...prev, budget: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Create Campaign
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

interface CampaignDetailsModalProps {
  campaign: Campaign;
  onClose: () => void;
  onOptimize: () => void;
}

const CampaignDetailsModal: React.FC<CampaignDetailsModalProps> = ({ campaign, onClose, onOptimize }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      onClick={(e) => e.stopPropagation()}
      className="bg-slate-800 rounded-xl p-6 w-full max-w-4xl border border-white/20 max-h-[90vh] overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">{campaign.name}</h3>
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOptimize}
            className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Optimize</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="bg-slate-600 hover:bg-slate-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Close
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaign Info */}
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-slate-300 mb-2">Campaign Details</h4>
            <div className="bg-white/5 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Type:</span>
                <span className="text-white capitalize">{campaign.type.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="text-white capitalize">{campaign.status.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Budget:</span>
                <span className="text-white">${campaign.budget.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Start Date:</span>
                <span className="text-white">{new Date(campaign.startDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-slate-300 mb-2">Content</h4>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-slate-300 text-sm mb-2">{campaign.content.body}</p>
              <div className="border-t border-white/10 pt-2">
                <span className="text-xs text-slate-400">CTA: </span>
                <span className="text-xs text-purple-300">{campaign.content.callToAction}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-slate-300 mb-2">Performance Metrics</h4>
            <div className="grid grid-cols-2 gap-3">
              <MetricBox label="Sent" value={campaign.metrics.sent} color="text-blue-400" />
              <MetricBox label="Delivered" value={campaign.metrics.delivered} color="text-green-400" />
              <MetricBox label="Opened" value={campaign.metrics.opened} color="text-yellow-400" />
              <MetricBox label="Clicked" value={campaign.metrics.clicked} color="text-orange-400" />
              <MetricBox label="Converted" value={campaign.metrics.converted} color="text-purple-400" />
              <MetricBox label="Revenue" value={`$${campaign.metrics.revenue}`} color="text-green-400" />
            </div>
          </div>

          <div>
            <h4 className="font-medium text-slate-300 mb-2">Target Audience</h4>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex flex-wrap gap-2">
                {campaign.targetAudience.map((audience, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-purple-500/20 rounded text-xs text-purple-300"
                  >
                    {audience}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
);

interface MetricBoxProps {
  label: string;
  value: string | number;
  color: string;
}

const MetricBox: React.FC<MetricBoxProps> = ({ label, value, color }) => (
  <div className="bg-white/5 rounded-lg p-3 text-center">
    <div className={`text-lg font-bold ${color}`}>{value}</div>
    <div className="text-xs text-slate-400">{label}</div>
  </div>
);

// Helper function to generate sample campaigns
function generateSampleCampaigns(): Campaign[] {
  const sampleData = [
    {
      name: 'Q4 AI Solutions Campaign',
      type: CampaignType.EMAIL,
      status: CampaignStatus.ACTIVE,
      targetAudience: ['tech_companies', 'startups'],
      content: {
        body: 'Discover how AI can transform your business operations with our cutting-edge solutions.',
        callToAction: 'Schedule a demo',
        personalizationTokens: ['name', 'company', 'industry']
      },
      budget: 15000,
      metrics: {
        sent: 2500,
        delivered: 2450,
        opened: 980,
        clicked: 245,
        converted: 37,
        bounced: 50,
        unsubscribed: 12,
        revenue: 185000
      }
    },
    {
      name: 'Marketing Automation Webinar',
      type: CampaignType.WEBINAR,
      status: CampaignStatus.ACTIVE,
      targetAudience: ['marketing_managers', 'small_business'],
      content: {
        body: 'Join our exclusive webinar on marketing automation best practices.',
        callToAction: 'Register now',
        personalizationTokens: ['name', 'company']
      },
      budget: 8000,
      metrics: {
        sent: 1200,
        delivered: 1180,
        opened: 590,
        clicked: 118,
        converted: 89,
        bounced: 20,
        unsubscribed: 5,
        revenue: 45000
      }
    },
    {
      name: 'Social Media Engagement Drive',
      type: CampaignType.SOCIAL_MEDIA,
      status: CampaignStatus.PAUSED,
      targetAudience: ['millennials', 'tech_enthusiasts'],
      content: {
        body: 'Engage with our latest social media content and join the conversation.',
        callToAction: 'Follow us',
        personalizationTokens: ['name']
      },
      budget: 5000,
      metrics: {
        sent: 5000,
        delivered: 5000,
        opened: 1500,
        clicked: 300,
        converted: 25,
        bounced: 0,
        unsubscribed: 8,
        revenue: 12500
      }
    }
  ];

  return sampleData.map((data, index) => ({
    id: `campaign_${Date.now()}_${index}`,
    ...data,
    startDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    endDate: undefined,
    createdBy: 'engagement_agent'
  }));
}