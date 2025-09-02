import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertCircle, Database } from 'lucide-react';
import { ZipExtractor } from '../utils/zipExtractor';

interface DataUploaderProps {
  onDataLoaded: (data: any) => void;
}

export const DataUploader: React.FC<DataUploaderProps> = ({ onDataLoaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const zipFile = files.find(file => file.name.endsWith('.zip'));
    
    if (zipFile) {
      await processFile(zipFile);
    } else {
      setUploadStatus('error');
      setUploadMessage('Please upload a ZIP file containing the marketing dataset');
    }
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  }, []);

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setUploadStatus('idle');
    
    try {
      console.log('📦 Processing uploaded file:', file.name);
      
      // Extract data from ZIP file
      const extractedData = await ZipExtractor.extractFromZip(file);
      
      setUploadStatus('success');
      setUploadMessage(`Successfully processed ${file.name} - ${extractedData.leads.length} leads, ${extractedData.campaigns.length} campaigns loaded`);
      
      // Pass data to parent component
      onDataLoaded(extractedData);
      
    } catch (error) {
      console.error('❌ File processing failed:', error);
      setUploadStatus('error');
      setUploadMessage('Failed to process the uploaded file. Please check the file format.');
    } finally {
      setIsProcessing(false);
    }
  };

  const loadSampleData = async () => {
    setIsProcessing(true);
    try {
      console.log('📊 Loading sample marketing dataset...');
      
      // Process the included dataset
      const sampleData = await ZipExtractor.processMarketingDataset();
      
      setUploadStatus('success');
      setUploadMessage(`Sample dataset loaded - ${sampleData.leads.length} leads, ${sampleData.campaigns.length} campaigns`);
      
      onDataLoaded(sampleData);
      
    } catch (error) {
      console.error('❌ Sample data loading failed:', error);
      setUploadStatus('error');
      setUploadMessage('Failed to load sample data');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          isDragging 
            ? 'border-purple-400 bg-purple-500/10' 
            : 'border-white/30 bg-white/5'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".zip"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isProcessing}
        />
        
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center">
            {isProcessing ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"
              />
            ) : (
              <Upload className="w-8 h-8 text-purple-400" />
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {isProcessing ? 'Processing Dataset...' : 'Upload Marketing Dataset'}
            </h3>
            <p className="text-slate-400">
              {isProcessing 
                ? 'Extracting and processing marketing data...'
                : 'Drag and drop your ZIP file here or click to browse'
              }
            </p>
          </div>
          
          <div className="text-sm text-slate-500">
            <FileText className="w-4 h-4 inline mr-1" />
            Supports: marketing_multi_agent_dataset_v1_final.zip
          </div>
        </div>
      </motion.div>

      {/* Status Message */}
      {uploadStatus !== 'idle' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`flex items-center space-x-3 p-4 rounded-lg ${
            uploadStatus === 'success' 
              ? 'bg-green-500/20 border border-green-500/30 text-green-300'
              : 'bg-red-500/20 border border-red-500/30 text-red-300'
          }`}
        >
          {uploadStatus === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{uploadMessage}</span>
        </motion.div>
      )}

      {/* Sample Data Option */}
      <div className="text-center">
        <p className="text-slate-400 mb-4">Don't have the dataset file?</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={loadSampleData}
          disabled={isProcessing}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 px-6 py-3 rounded-lg transition-colors mx-auto"
        >
          <Database className="w-4 h-4" />
          <span>Load Sample Marketing Dataset</span>
        </motion.button>
      </div>
    </div>
  );
};