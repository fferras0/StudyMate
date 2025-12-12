import React from 'react';
import { BookOpen, ArrowLeft, ArrowRight, FileText, Download, Save } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Language, FontSize, FontType } from '../types';

interface SummaryDisplayProps {
  summary: string;
  onBack: () => void;
  language: Language;
  fontSize: FontSize;
  fontType: FontType;
  onSave?: () => void;
}

const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ 
  summary, 
  onBack, 
  language,
  fontSize,
  fontType,
  onSave
}) => {
  const isRTL = language === 'ar';

  const handlePrint = () => {
    window.print();
  };

  // Styles based on props
  const getFontClass = () => {
    switch(fontType) {
      case 'serif': return 'font-serif';
      case 'mono': return 'font-mono';
      default: return 'font-sans';
    }
  };

  const getProseSizeClass = () => {
    switch(fontSize) {
        case 'small': return 'prose-sm';
        case 'large': return 'prose-xl';
        default: return 'prose-lg';
    }
  };

  return (
    <div className={`w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 ${getFontClass()}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 print:hidden gap-4">
        <button 
          onClick={onBack}
          className="flex items-center text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors order-2 md:order-1"
        >
          {isRTL ? <ArrowRight size={20} className="ml-2" /> : <ArrowLeft size={20} className="mr-2" />}
          {isRTL ? "العودة للملف" : "Back to File"}
        </button>
        <div className="flex items-center gap-3 order-1 md:order-2 w-full md:w-auto justify-end">
             {onSave && (
               <button 
                onClick={onSave}
                className="flex items-center gap-2 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 px-4 py-2 rounded-xl font-bold border border-indigo-100 dark:border-slate-600 shadow-sm transition-colors"
               >
                 <Save size={18} />
                 {isRTL ? "حفظ في السجل" : "Save to History"}
               </button>
             )}
            <button 
              onClick={handlePrint}
              className="flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors bg-indigo-50 dark:bg-indigo-900/30 px-3 py-2 rounded-lg font-medium"
            >
              <Download size={18} className={isRTL ? "ml-2" : "mr-2"} />
              {isRTL ? "حفظ كـ PDF" : "Save as PDF"}
            </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden print:shadow-none print:border-none print:rounded-none">
        {/* Decorative Header */}
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border-b border-indigo-100 dark:border-indigo-800/30 p-6 flex items-center print:bg-white print:border-slate-200">
            <div className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm text-indigo-600 dark:text-indigo-400 mr-4 ml-4 print:hidden">
                <FileText size={24} />
            </div>
            <h2 className="text-xl font-bold text-indigo-900 dark:text-indigo-200 print:text-black">
                {isRTL ? "ملخص ذكي للمستند" : "Smart Document Summary"}
            </h2>
        </div>

        <div className="p-8 md:p-12 print:p-6">
            <article className={`prose dark:prose-invert ${getProseSizeClass()} prose-indigo max-w-none 
                prose-headings:text-slate-800 dark:prose-headings:text-slate-100 prose-headings:font-bold 
                prose-h1:border-b prose-h1:pb-4 prose-h1:mb-6
                prose-h2:text-indigo-700 dark:prose-h2:text-indigo-300 prose-h2:mt-8 prose-h2:mb-4 prose-h2:bg-indigo-50 dark:prose-h2:bg-indigo-900/30 prose-h2:p-2 prose-h2:rounded-md prose-h2:inline-block
                prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-p:leading-relaxed
                prose-li:text-slate-600 dark:prose-li:text-slate-300
                prose-strong:text-slate-900 dark:prose-strong:text-white prose-strong:font-bold
                print:prose-p:text-black print:prose-li:text-black print:prose-headings:text-black
                ${isRTL ? 'text-right' : 'text-left'}`}>
            <ReactMarkdown>{summary}</ReactMarkdown>
            </article>
        </div>
      </div>
    </div>
  );
};

export default SummaryDisplay;