import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Save, 
  RefreshCw, 
  Shield, 
  Database,
  Bell,
  Zap,
  Brain,
  Network,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { AgentOrchestrator } from '../system/AgentOrchestrator';

interface SettingsProps {
  orchestrator: AgentOrchestrator;
}

export const Settings: React.FC<SettingsProps> = ({ orchestrator }) => {
  const [settings, setSettings] = useState({
    memory: {
      consolidationInterval: 300, // seconds
      maxShortTermItems: 100,
      memoryDecayFactor: 0.95,
      autoConsolidation: true
    },
    agents: {
      maxRetryAttempts: 3,
      responseTimeout: 30000,
      enableLearning: true,
      shareSemanticMemory: true
    },
    communication: {
      websocketReconnectAttempts: 5,
      heartbeatInterval: 30000,
      messageQueueSize: 1000,
      enableBroadcast: true
    },
    optimization: {
      autoOptimization: true,
      optimizationThreshold: 0.7,
      escalationCriteria: 0.4,
      performanceMonitoringInterval: 60000
    },
    security: {
      enableEncryption: true,
      apiKeyRotation: true,
      auditLogging: true,
      rateLimiting: true
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate saving settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    // Reset to default values
    setSettings({
      memory: {
        consolidationInterval: 300,
        maxShortTermItems: 100,
        memoryDecayFactor: 0.95,
        autoConsolidation: true
      },
      agents: {
        maxRetryAttempts: 3,
        responseTimeout: 30000,
        enableLearning: true,
        shareSemanticMemory: true
      },
      communication: {
        websocketReconnectAttempts: 5,
        heartbeatInterval: 30000,
        messageQueueSize: 1000,
        enableBroadcast: true
      },
      optimization: {
        autoOptimization: true,
        optimizationThreshold: 0.7,
        escalationCriteria: 0.4,
        performanceMonitoringInterval: 60000
      },
      security: {
        enableEncryption: true,
        apiKeyRotation: true,
        auditLogging: true,
        rateLimiting: true
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">System Settings</h2>
          <p className="text-slate-400">Configure system behavior and performance parameters</p>
        </div>
        <div className="flex space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className="flex items-center space-x-2 bg-slate-600 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              saveStatus === 'success' ? 'bg-green-600' :
              saveStatus === 'error' ? 'bg-red-600' :
              'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : saveStatus === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : saveStatus === 'error' ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>
              {isSaving ? 'Saving...' :
               saveStatus === 'success' ? 'Saved!' :
               saveStatus === 'error' ? 'Error' :
               'Save Changes'}
            </span>
          </motion.button>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Memory Settings */}
        <SettingsSection
          title="Memory Management"
          icon={<Brain className="w-5 h-5" />}
          description="Configure adaptive memory system parameters"
        >
          <div className="space-y-4">
            <SettingField
              label="Consolidation Interval (seconds)"
              type="number"
              value={settings.memory.consolidationInterval}
              onChange={(value) => setSettings(prev => ({
                ...prev,
                memory: { ...prev.memory, consolidationInterval: parseInt(value) }
              }))}
            />
            <SettingField
              label="Max Short-term Items"
              type="number"
              value={settings.memory.maxShortTermItems}
              onChange={(value) => setSettings(prev => ({
                ...prev,
                memory: { ...prev.memory, maxShortTermItems: parseInt(value) }
              }))}
            />
            <SettingField
              label="Memory Decay Factor"
              type="number"
              step="0.01"
              min="0.1"
              max="1.0"
              value={settings.memory.memoryDecayFactor}
              onChange={(value) => setSettings(prev => ({
                ...prev,
                memory: { ...prev.memory, memoryDecayFactor: parseFloat(value) }
              }))}
            />
            <ToggleField
              label="Auto Consolidation"
              checked={settings.memory.autoConsolidation}
              onChange={(checked) => setSettings(prev => ({
                ...prev,
                memory: { ...prev.memory, autoConsolidation: checked }
              }))}
            />
          </div>
        </SettingsSection>

        {/* Agent Settings */}
        <SettingsSection
          title="Agent Configuration"
          icon={<Zap className="w-5 h-5" />}
          description="Configure agent behavior and learning parameters"
        >
          <div className="space-y-4">
            <SettingField
              label="Max Retry Attempts"
              type="number"
              value={settings.agents.maxRetryAttempts}
              onChange={(value) => setSettings(prev => ({
                ...prev,
                agents: { ...prev.agents, maxRetryAttempts: parseInt(value) }
              }))}
            />
            <SettingField
              label="Response Timeout (ms)"
              type="number"
              value={settings.agents.responseTimeout}
              onChange={(value) => setSettings(prev => ({
                ...prev,
                agents: { ...prev.agents, responseTimeout: parseInt(value) }
              }))}
            />
            <ToggleField
              label="Enable Learning"
              checked={settings.agents.enableLearning}
              onChange={(checked) => setSettings(prev => ({
                ...prev,
                agents: { ...prev.agents, enableLearning: checked }
              }))}
            />
            <ToggleField
              label="Share Semantic Memory"
              checked={settings.agents.shareSemanticMemory}
              onChange={(checked) => setSettings(prev => ({
                ...prev,
                agents: { ...prev.agents, shareSemanticMemory: checked }
              }))}
            />
          </div>
        </SettingsSection>

        {/* Communication Settings */}
        <SettingsSection
          title="Communication"
          icon={<Network className="w-5 h-5" />}
          description="Configure inter-agent communication protocols"
        >
          <div className="space-y-4">
            <SettingField
              label="WebSocket Reconnect Attempts"
              type="number"
              value={settings.communication.websocketReconnectAttempts}
              onChange={(value) => setSettings(prev => ({
                ...prev,
                communication: { ...prev.communication, websocketReconnectAttempts: parseInt(value) }
              }))}
            />
            <SettingField
              label="Heartbeat Interval (ms)"
              type="number"
              value={settings.communication.heartbeatInterval}
              onChange={(value) => setSettings(prev => ({
                ...prev,
                communication: { ...prev.communication, heartbeatInterval: parseInt(value) }
              }))}
            />
            <SettingField
              label="Message Queue Size"
              type="number"
              value={settings.communication.messageQueueSize}
              onChange={(value) => setSettings(prev => ({
                ...prev,
                communication: { ...prev.communication, messageQueueSize: parseInt(value) }
              }))}
            />
            <ToggleField
              label="Enable Broadcast"
              checked={settings.communication.enableBroadcast}
              onChange={(checked) => setSettings(prev => ({
                ...prev,
                communication: { ...prev.communication, enableBroadcast: checked }
              }))}
            />
          </div>
        </SettingsSection>

        {/* Security Settings */}
        <SettingsSection
          title="Security"
          icon={<Shield className="w-5 h-5" />}
          description="Configure security and compliance settings"
        >
          <div className="space-y-4">
            <ToggleField
              label="Enable Encryption"
              checked={settings.security.enableEncryption}
              onChange={(checked) => setSettings(prev => ({
                ...prev,
                security: { ...prev.security, enableEncryption: checked }
              }))}
            />
            <ToggleField
              label="API Key Rotation"
              checked={settings.security.apiKeyRotation}
              onChange={(checked) => setSettings(prev => ({
                ...prev,
                security: { ...prev.security, apiKeyRotation: checked }
              }))}
            />
            <ToggleField
              label="Audit Logging"
              checked={settings.security.auditLogging}
              onChange={(checked) => setSettings(prev => ({
                ...prev,
                security: { ...prev.security, auditLogging: checked }
              }))}
            />
            <ToggleField
              label="Rate Limiting"
              checked={settings.security.rateLimiting}
              onChange={(checked) => setSettings(prev => ({
                ...prev,
                security: { ...prev.security, rateLimiting: checked }
              }))}
            />
          </div>
        </SettingsSection>
      </div>
    </div>
  );
};

interface SettingsSectionProps {
  title: string;
  icon: React.ReactNode;
  description: string;
  children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, icon, description, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
  >
    <div className="flex items-center space-x-3 mb-4">
      <div className="p-2 bg-purple-500/20 rounded-lg">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
    </div>
    {children}
  </motion.div>
);

interface SettingFieldProps {
  label: string;
  type: string;
  value: string | number;
  onChange: (value: string) => void;
  step?: string;
  min?: string;
  max?: string;
}

const SettingField: React.FC<SettingFieldProps> = ({ label, type, value, onChange, step, min, max }) => (
  <div>
    <label className="block text-sm font-medium text-slate-300 mb-1">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      step={step}
      min={min}
      max={max}
      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
    />
  </div>
);

interface ToggleFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const ToggleField: React.FC<ToggleFieldProps> = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between">
    <label className="text-sm font-medium text-slate-300">
      {label}
    </label>
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-purple-600' : 'bg-slate-600'
      }`}
    >
      <motion.span
        animate={{ x: checked ? 20 : 4 }}
        className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
      />
    </motion.button>
  </div>
);