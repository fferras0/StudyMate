import React from 'react';
import { HistoryItem, Language } from '../types';
import { FileText, Image as ImageIcon, Trash2, Calendar, ArrowRight, ArrowLeft, Brain, FileOutput, Clock } from 'lucide-react';

interface HistoryViewProps {
  historyItems: HistoryItem[];
  onLoadItem: (item: HistoryItem) => void;
  onDeleteItem: (id: string) => void;
  onBack: () => void;
  language: Language;
}

const HistoryView: React.FC<HistoryViewProps> = ({ 
  historyItems, 
  onLoadItem, 
  onDeleteItem, 
  onBack,
  language 
}) => {
  const isRTL = language === 'ar';

  const t = {
    title: isRTL ? 'سجل المحفوظات' : 'History Log',
    empty: isRTL ? 'السجل فارغ. لم تقم بحفظ أي دراسة بعد.' : 'History is empty. You haven\'t saved any studies yet.',
    back: isRTL ? 'عودة للقائمة' : 'Back to Menu',
    delete: isRTL ? 'حذف' : 'Delete',
    open: isRTL ? 'فتح الدراسة' : 'Open Study',
    summary: isRTL ? 'ملخص' : 'Summary',
    quiz: isRTL ? 'اختبار' : 'Quiz',
    questions: isRTL ? 'أسئلة' : 'Questions',
    image: isRTL ? 'صورة' : 'Image',
    pdf: isRTL ? 'ملف PDF' : 'PDF File',
    date: isRTL ? 'التاريخ' : 'Date'
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`min-h-[80vh] w-full max-w-6xl mx-auto p-4 animate-in fade-in slide-in-from-bottom-4 ${isRTL ? 'font-[Noto_Sans_Arabic]' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
           <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600">
             <Clock size={28} />
           </div>
           {t.title}
        </h2>
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 px-4 py-2 rounded-xl transition-all font-bold"
        >
          {isRTL ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
          {t.back}
        </button>
      </div>

      {historyItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
           <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
              <Clock size={40} />
           </div>
           <p className="text-xl text-slate-400 font-medium">{t.empty}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {historyItems.map((item) => (
             <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all group flex flex-col">
                <div className="p-5 border-b border-slate-50 flex items-start justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.fileData.mimeType.includes('image') ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                           {item.fileData.mimeType.includes('image') ? <ImageIcon size={24} /> : <FileText size={24} />}
                        </div>
                        <div className="overflow-hidden">
                           <h3 className="font-bold text-slate-800 truncate block max-w-[180px]" title={item.fileName}>{item.fileName}</h3>
                           <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                             {item.fileData.mimeType.includes('image') ? t.image : t.pdf}
                           </p>
                        </div>
                    </div>
                    <button 
                      onClick={() => onDeleteItem(item.id)}
                      className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      title={t.delete}
                    >
                       <Trash2 size={18} />
                    </button>
                </div>

                <div className="p-5 space-y-3 flex-grow">
                   <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Calendar size={16} />
                      {formatDate(item.timestamp)}
                   </div>

                   <div className="flex gap-2 flex-wrap mt-3">
                      {item.summary && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                           <FileOutput size={14} />
                           {t.summary}
                        </span>
                      )}
                      {item.quiz && item.quiz.length > 0 && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                           <Brain size={14} />
                           {item.quiz.length} {t.questions}
                        </span>
                      )}
                   </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100">
                   <button 
                     onClick={() => onLoadItem(item)}
                     className="w-full py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all flex items-center justify-center gap-2 shadow-sm"
                   >
                     {t.open}
                     {isRTL ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                   </button>
                </div>
             </div>
           ))}
        </div>
      )}
    </div>
  );
};

export default HistoryView;