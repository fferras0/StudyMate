import React, { useCallback, useState } from 'react';
import { Upload, FileText, Image as ImageIcon, AlertCircle, FilePlus } from 'lucide-react';
import { FileData } from '../types';

interface FileUploaderProps {
  onFileSelect: (file: FileData) => void;
  isRTL?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, isRTL = false }) => {
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const processFile = (file: File) => {
    setError(null);

    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError(isRTL ? "يرجى رفع ملف PDF أو صورة (PNG, JPG)." : "Please upload a PDF or an Image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError(isRTL ? "حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت." : "File size is too large. Max 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      onFileSelect({
        base64: reader.result as string,
        mimeType: file.type,
        name: file.name,
      });
    };
    reader.onerror = () => setError("Failed to read file.");
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
       {/* Main Drop Zone */}
      <div 
        className={`relative group bg-white rounded-3xl p-10 md:p-14 text-center transition-all duration-300 ${dragActive ? 'border-4 border-indigo-400 shadow-2xl scale-[1.01]' : 'border border-slate-200 shadow-xl hover:shadow-2xl hover:border-indigo-200'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col items-center">
            <div className={`w-20 h-20 bg-gradient-to-tr from-indigo-500 to-purple-600 text-white rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-200 transform group-hover:scale-110 transition-transform duration-300`}>
                <FilePlus size={40} />
            </div>

            <h3 className="text-2xl font-bold text-slate-800 mb-3">
              {isRTL ? 'اسحب الملف هنا' : 'Drag & Drop your file here'}
            </h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              {isRTL ? 'ندعم ملفات PDF والصور بوضوح عالٍ.' : 'We support PDF documents and high-quality Images.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
                <label className="flex-1 cursor-pointer">
                    <input type="file" className="hidden" accept="application/pdf" onChange={handleChange} />
                    <div className="flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-slate-100 rounded-xl hover:border-indigo-500 hover:text-indigo-600 text-slate-600 font-bold transition-all shadow-sm hover:shadow-md hover:bg-indigo-50">
                        <FileText size={20} />
                        <span>PDF</span>
                    </div>
                </label>
                <label className="flex-1 cursor-pointer">
                    <input type="file" className="hidden" accept="image/*" onChange={handleChange} />
                    <div className="flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-slate-100 rounded-xl hover:border-purple-500 hover:text-purple-600 text-slate-600 font-bold transition-all shadow-sm hover:shadow-md hover:bg-purple-50">
                        <ImageIcon size={20} />
                        <span>{isRTL ? 'صورة' : 'Image'}</span>
                    </div>
                </label>
            </div>
        </div>

        {dragActive && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-3xl border-4 border-indigo-500">
             <div className="text-indigo-600 font-bold text-xl animate-bounce">
                {isRTL ? 'أفلت الملف الآن!' : 'Drop the file now!'}
             </div>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center text-sm font-semibold border border-red-100 animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={18} className="mr-2" />
          {error}
        </div>
      )}
    </div>
  );
};

export default FileUploader;
