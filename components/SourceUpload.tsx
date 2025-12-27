
import React, { useRef, useState } from 'react';
import { Upload, FileText, Camera, CheckCircle2, Loader2, AlertCircle, File } from 'lucide-react';
import { StudySource } from '../types';

interface SourceUploadProps {
  id: 'syllabus' | 'notes' | 'textbook';
  label: string;
  description: string;
  source: StudySource | null;
  onUpload: (source: StudySource) => void;
}

const SourceUpload: React.FC<SourceUploadProps> = ({ id, label, description, source, onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setError(null);
    
    const mimeType = file.type || 'application/octet-stream';
    const isImage = mimeType.startsWith('image/');
    const isPDF = mimeType === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isText = mimeType.startsWith('text/') || file.name.toLowerCase().endsWith('.txt') || file.name.toLowerCase().endsWith('.md');
    
    // Note: DOCX files don't have native multimodal support in Gemini like PDF/Images.
    // We treat them as binary blobs if we can't parse them, but PDF is preferred.
    // For this implementation, we allow PDF, Images, and Text.
    const isSupported = isImage || isPDF || isText;

    if (!isSupported) {
      setError("This scroll format is challenging. Please use PDF, Images, or Text (.txt, .md).");
      setIsScanning(false);
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (event) => {
      const content = event.target?.result as string;
      
      // Artificial delay for "Scanning" vibe
      setTimeout(() => {
        onUpload({
          id,
          title: label,
          type: (isImage || isPDF) ? 'file' : 'text',
          mimeType: isPDF ? 'application/pdf' : (isImage ? mimeType : 'text/plain'),
          content: content,
          fileName: file.name
        });
        setIsScanning(false);
      }, 1200);
    };

    reader.onerror = () => {
      setError("The scroll could not be read. It may be corrupted.");
      setIsScanning(false);
    };

    if (isImage || isPDF) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  };

  return (
    <div className={`glass-card p-6 rounded-2xl transition-all duration-500 border-l-4 overflow-hidden relative ${
      source ? 'border-l-emerald-500 bg-emerald-500/5' : 
      isScanning ? 'border-l-indigo-400 bg-indigo-500/5' :
      'border-l-indigo-500/50 hover:border-l-indigo-400'
    }`}>
      {/* Scanning Line Animation */}
      {isScanning && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="h-0.5 w-full bg-indigo-400/50 blur-[2px] animate-[scan_2s_ease-in-out_infinite]" />
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-white mb-1 flex items-center gap-2">
            {source ? <CheckCircle2 className="text-emerald-400 w-5 h-5" /> : null}
            {label}
          </h3>
          <p className="text-slate-400 text-sm">{description}</p>
        </div>
        <div className="bg-indigo-500/10 p-2 rounded-lg">
          {isScanning ? <Loader2 className="text-indigo-400 animate-spin" /> : 
           id === 'syllabus' ? <FileText className="text-indigo-400" /> : 
           id === 'notes' ? <Camera className="text-indigo-400" /> : 
           <File className="text-indigo-400" />}
        </div>
      </div>

      <div className="relative group">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*,.txt,.md,.pdf"
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isScanning}
          className={`w-full py-5 px-6 rounded-xl border-2 border-dashed transition-all
            ${source 
              ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400' 
              : isScanning
              ? 'border-indigo-500/30 text-indigo-300'
              : 'border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800 text-slate-400 group-hover:text-slate-200'}`}
        >
          {isScanning ? (
            <span className="flex items-center justify-center gap-2 font-medium">
              Absorbing Knowledge...
            </span>
          ) : source ? (
            <div className="flex flex-col items-center">
              <span className="text-xs uppercase tracking-widest font-bold opacity-60 mb-1">Archived</span>
              <span className="font-medium truncate max-w-full text-sm">{source.fileName}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="mb-2 w-6 h-6 opacity-50" />
              <span className="font-medium">Deliver Scroll</span>
              <span className="text-xs opacity-50">PDF, Images, or Text</span>
            </div>
          )}
        </button>
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-rose-400 text-[10px] leading-tight font-medium bg-rose-400/5 p-2 rounded">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
};

export default SourceUpload;
