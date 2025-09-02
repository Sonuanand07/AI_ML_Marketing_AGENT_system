import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  Building, 
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { AgentOrchestrator } from '../system/AgentOrchestrator';
import { Lead, LeadCategory, LeadStatus } from '../types';

interface LeadManagementProps {
  orchestrator: AgentOrchestrator;
}

export const LeadManagement: React.FC<LeadManagementProps> = ({ orchestrator }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showNewLeadForm, setShowNewLeadForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLeads();
  }, []);

  useEffect(() => {
    filterLeads();
  }, [leads, searchTerm, selectedCategory, selectedStatus]);

  const loadLeads = async () => {
    try {
      // In a real implementation, this would fetch from the MCP client
      // For demo purposes, we'll generate sample leads
      const sampleLeads = generateSampleLeads();
      setLeads(sampleLeads);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load leads:', error);
      setIsLoading(false);
    }
  };

  const filterLeads = () => {
    let filtered = leads;

    if (searchTerm) {
      filtered = filtered.filter(lead =>
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(lead => lead.category === selectedCategory);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(lead => lead.status === selectedStatus);
    }

    setFilteredLeads(filtered);
  };

  const handleNewLead = async (leadData: Partial<Lead>) => {
    try {
      const result = await orchestrator.processNewLead(leadData);
      
      if (result.success) {
        setLeads(prev => [...prev, result.data]);
        setShowNewLeadForm(false);
      } else {
        console.error('Failed to process new lead:', result.error);
      }
    } catch (error) {
      console.error('Error processing new lead:', error);
    }
  };

  const getCategoryColor = (category: LeadCategory): string => {
    switch (category) {
      case LeadCategory.HOT_PROSPECT: return 'text-red-400 bg-red-500/20';
      case LeadCategory.CAMPAIGN_QUALIFIED: return 'text-orange-400 bg-orange-500/20';
      case LeadCategory.GENERAL_INQUIRY: return 'text-blue-400 bg-blue-500/20';
      case LeadCategory.COLD_LEAD: return 'text-gray-400 bg-gray-500/20';
      case LeadCategory.EXISTING_CUSTOMER: return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusIcon = (status: LeadStatus) => {
    switch (status) {
      case LeadStatus.NEW: return <Clock className="w-4 h-4" />;
      case LeadStatus.CONTACTED: return <Mail className="w-4 h-4" />;
      case LeadStatus.ENGAGED: return <TrendingUp className="w-4 h-4" />;
      case LeadStatus.QUALIFIED: return <CheckCircle className="w-4 h-4" />;
      case LeadStatus.CONVERTED: return <Star className="w-4 h-4" />;
      case LeadStatus.LOST: return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
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
          <h2 className="text-2xl font-bold text-white">Lead Management</h2>
          <p className="text-slate-400">Manage and track your marketing leads</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowNewLeadForm(true)}
          className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Lead</span>
        </motion.button>
      </div>

      {/* Filters */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Categories</option>
            {Object.values(LeadCategory).map(category => (
              <option key={category} value={category} className="bg-slate-800">
                {category.replace('_', ' ').toUpperCase()}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Statuses</option>
            {Object.values(LeadStatus).map(status => (
              <option key={status} value={status} className="bg-slate-800">
                {status.replace('_', ' ').toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Leads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredLeads.map((lead) => (
            <motion.div
              key={lead.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {lead.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{lead.name}</h3>
                    <p className="text-sm text-slate-400">{lead.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(lead.status)}
                  <span className="text-xs text-slate-400 capitalize">
                    {lead.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {lead.company && (
                <div className="flex items-center space-x-2 mb-3">
                  <Building className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-300">{lead.company}</span>
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(lead.category)}`}>
                  {lead.category.replace('_', ' ').toUpperCase()}
                </span>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium">{lead.score.toFixed(0)}</span>
                </div>
              </div>

              <div className="text-xs text-slate-400">
                Source: {lead.source.replace('_', ' ')}
              </div>
              <div className="text-xs text-slate-400">
                Created: {new Date(lead.createdAt).toLocaleDateString()}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredLeads.length === 0 && (
        <div className="text-center py-12">
          <div className="text-slate-400 mb-4">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No leads found matching your criteria</p>
          </div>
        </div>
      )}

      {/* New Lead Form Modal */}
      <AnimatePresence>
        {showNewLeadForm && (
          <NewLeadForm
            onSubmit={handleNewLead}
            onClose={() => setShowNewLeadForm(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

interface NewLeadFormProps {
  onSubmit: (leadData: Partial<Lead>) => void;
  onClose: () => void;
}

const NewLeadForm: React.FC<NewLeadFormProps> = ({ onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    source: 'website_form'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      metadata: {
        addedManually: true,
        timestamp: new Date()
      }
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
        className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-white/20"
      >
        <h3 className="text-xl font-semibold text-white mb-4">Add New Lead</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter lead name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter email address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Company
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter company name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Source
            </label>
            <select
              value={formData.source}
              onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="website_form" className="bg-slate-800">Website Form</option>
              <option value="referral" className="bg-slate-800">Referral</option>
              <option value="social_media" className="bg-slate-800">Social Media</option>
              <option value="cold_outreach" className="bg-slate-800">Cold Outreach</option>
              <option value="event" className="bg-slate-800">Event</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Add Lead
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

// Helper function to generate sample leads for demonstration
function generateSampleLeads(): Lead[] {
  const sampleData = [
    {
      name: 'John Doe',
      email: 'john.doe@techcorp.com',
      company: 'TechCorp Inc.',
      source: 'website_form',
      category: LeadCategory.HOT_PROSPECT,
      score: 85
    },
    {
      name: 'Sarah Smith',
      email: 'sarah.smith@startup.io',
      company: 'Startup.io',
      source: 'referral',
      category: LeadCategory.CAMPAIGN_QUALIFIED,
      score: 72
    },
    {
      name: 'Mike Johnson',
      email: 'mike.johnson@enterprise.com',
      company: 'Enterprise Corp',
      source: 'cold_outreach',
      category: LeadCategory.GENERAL_INQUIRY,
      score: 45
    },
    {
      name: 'Emily Davis',
      email: 'emily.davis@innovate.com',
      company: 'Innovate Solutions',
      source: 'social_media',
      category: LeadCategory.CAMPAIGN_QUALIFIED,
      score: 68
    },
    {
      name: 'Alex Wilson',
      email: 'alex.wilson@gmail.com',
      company: undefined,
      source: 'website_form',
      category: LeadCategory.COLD_LEAD,
      score: 32
    }
  ];

  return sampleData.map((data, index) => ({
    id: `lead_${Date.now()}_${index}`,
    ...data,
    status: LeadStatus.NEW,
    metadata: {
      processingTimestamp: new Date(),
      triageAgent: 'triage_agent'
    },
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date within last week
    updatedAt: new Date()
  }));
}