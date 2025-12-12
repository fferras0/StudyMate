import React, { useCallback, useState } from 'react';
import { Upload, FileText, Image as ImageIcon, AlertCircle, FilePlus, Link as LinkIcon, Loader2 } from 'lucide-react';
import { FileData } from '../types';

interface FileUploaderProps {
  onFileSelect: (file: FileData) => void;
  isRTL?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, isRTL = false }) => {
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [url, setUrl] = useState('');
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);

  const processFile = (file: File) => {
    setError(null);

    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
    // Determine type by mime type or extension if mime is generic
    let isValid = validTypes.includes(file.type);
    
    if (!isValid) {
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (ext && ['pdf', 'png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
            isValid = true;
        }
    }

    if (!isValid) {
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
        mimeType: file.type || (file.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
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

  const handleUrlUpload = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!url) return;
      
      setError(null);
      setIsLoadingUrl(true);

      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch file.");
        
        const contentType = response.headers.get('content-type');
        const blob = await response.blob();
        
        if (blob.size > 10 * 1024 * 1024) {
             throw new Error(isRTL ? "حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت." : "File size is too large. Max 10MB.");
        }

        // Guess filename and type
        const urlObj = new URL(url);
        const fileName = urlObj.pathname.split('/').pop() || 'downloaded-file';
        
        // Force type if blob type is generic but we know better from extension or context
        let type = blob.type;
        if (!type || type === 'application/octet-stream') {
             if (fileName.toLowerCase().endsWith('.pdf')) type = 'application/pdf';
             else if (fileName.toLowerCase().match(/\.(jpg|jpeg)$/)) type = 'image/jpeg';
             else if (fileName.toLowerCase().endsWith('.png')) type = 'image/png';
        }

        const file = new File([blob], fileName, { type: type });
        processFile(file);
        setUrl('');
        
      } catch (err: any) {
          console.error(err);
          // Handle CORS specific error message if possible
          if (err.message === "Failed to fetch" || err.name === 'TypeError') {
              setError(isRTL 
                  ? "تعذر الوصول للرابط. قد يكون بسبب سياسات الأمان (CORS) للموقع المستهدف." 
                  : "Could not fetch URL. This is likely due to CORS restrictions on the target website.");
          } else {
              setError(err.message || (isRTL ? "حدث خطأ أثناء تحميل الملف." : "Error downloading file."));
          }
      } finally {
          setIsLoadingUrl(false);
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

      {/* URL Input Section */}
      <form onSubmit={handleUrlUpload} className="mt-8 w-full max-w-lg mx-auto animate-in fade-in slide-in-from-bottom-2">
            <div className="relative flex items-center mb-6">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-bold uppercase tracking-widest">{isRTL ? 'أو عبر رابط' : 'OR VIA URL'}</span>
                <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <div className="flex gap-3 shadow-lg rounded-xl p-1 bg-white border border-slate-100">
                <div className="relative flex-grow">
                    <LinkIcon className={`absolute top-3.5 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} size={20} />
                    <input 
                        type="url" 
                        placeholder={isRTL ? "https://example.com/file.pdf" : "https://example.com/file.pdf"}
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className={`w-full bg-white rounded-xl py-3 text-slate-800 font-medium focus:outline-none ${isRTL ? 'pr-12' : 'pl-12'}`}
                        disabled={isLoadingUrl}
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={!url || isLoadingUrl}
                    className="bg-slate-900 hover:bg-indigo-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg px-6 font-bold flex items-center justify-center transition-all"
                >
                    {isLoadingUrl ? <Loader2 className="animate-spin" size={20} /> : (isRTL ? "استيراد" : "Import")}
                </button>
            </div>
      </form>
      
      {error && (
        <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center text-sm font-semibold border border-red-100 animate-in fade-in slide-in-from-top-2 text-center">
          <AlertCircle size={18} className="mr-2 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
};

export default FileUploader;