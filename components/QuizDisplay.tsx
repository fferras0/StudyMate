import React, { useState, useEffect } from 'react';
import { RefreshCw, ArrowLeft, ArrowRight, Award, Clock, HelpCircle, Sparkles, Check, X as XIcon, ChevronRight, ChevronLeft, Flag, Save } from 'lucide-react';
import { QuizQuestion, Language, FontSize, FontType } from '../types';

interface QuizDisplayProps {
  questions: QuizQuestion[];
  onBack: () => void;
  language: Language;
  timerSeconds: number; // 0 means unlimited
  fontSize: FontSize;
  fontType: FontType;
  onRegenerate: () => void;
  onSave?: () => void;
}

const QuizDisplay: React.FC<QuizDisplayProps> = ({ 
  questions, 
  onBack, 
  language, 
  timerSeconds,
  fontSize,
  fontType,
  onRegenerate,
  onSave
}) => {
  // State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false); // True when quiz is done
  const [isReviewMode, setIsReviewMode] = useState(false); // True when reviewing answers after result
  const [timeLeft, setTimeLeft] = useState(timerSeconds > 0 ? timerSeconds : 0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');

  const isRTL = language === 'ar';
  const hasTimer = timerSeconds > 0;
  const currentQuestion = questions[currentQuestionIndex];

  // Timer Logic
  useEffect(() => {
    if (timerSeconds > 0) setTimeLeft(timerSeconds);
    setUserAnswers({});
    setShowResults(false);
    setIsReviewMode(false);
    setCurrentQuestionIndex(0);
  }, [questions, timerSeconds]);

  useEffect(() => {
    if (showResults || !hasTimer) return;
    if (timeLeft <= 0) {
      finishQuiz();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          finishQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, showResults, hasTimer]);

  const finishQuiz = () => {
    setShowResults(true);
    setIsReviewMode(false);
  };

  const handleOptionSelect = (optionIndex: number) => {
    if (showResults && !isReviewMode) return; // Can't select in summary
    if (showResults && isReviewMode) return; // Can't change in review

    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionIndex
    }));
  };

  const navigateQuestion = (direction: 'next' | 'prev') => {
    if (direction === 'next') {
      if (currentQuestionIndex < questions.length - 1) {
        setSlideDirection(isRTL ? 'left' : 'right');
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        finishQuiz();
      }
    } else {
      if (currentQuestionIndex > 0) {
        setSlideDirection(isRTL ? 'right' : 'left');
        setCurrentQuestionIndex(prev => prev - 1);
      }
    }
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach(q => {
      if (userAnswers[q.id] === q.correctAnswerIndex) {
        score++;
      }
    });
    return score;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const score = calculateScore();
  const percentage = Math.round((score / questions.length) * 100);

  // Styles
  const getFontClass = () => {
    switch(fontType) {
      case 'serif': return 'font-serif';
      case 'mono': return 'font-mono';
      default: return 'font-sans';
    }
  };

  const getTextSizeClass = (type: 'title' | 'body') => {
    if (type === 'title') {
       switch(fontSize) {
         case 'small': return 'text-lg';
         case 'large': return 'text-2xl';
         default: return 'text-xl';
       }
    } else {
       switch(fontSize) {
         case 'small': return 'text-sm';
         case 'large': return 'text-lg';
         default: return 'text-base';
       }
    }
  };

  const t = {
    back: isRTL ? "خروج" : "Exit",
    next: isRTL ? "التالي" : "Next",
    prev: isRTL ? "السابق" : "Previous",
    finish: isRTL ? "إنهاء الاختبار" : "Finish Quiz",
    review: isRTL ? "مراجعة الإجابات" : "Review Answers",
    score: isRTL ? "النتيجة النهائية" : "Final Score",
    tryAgain: isRTL ? "إعادة الاختبار" : "Retake Quiz",
    renew: isRTL ? "تجديد الأسئلة" : "New Questions",
    timeUp: isRTL ? "انتهى الوقت!" : "Time's Up!",
    unlimited: isRTL ? "وقت مفتوح" : "Unlimited Time",
    question: isRTL ? "السؤال" : "Question",
    explanation: isRTL ? "شرح الإجابة" : "Explanation",
    correct: isRTL ? "إجابة صحيحة!" : "Correct!",
    incorrect: isRTL ? "إجابة خاطئة" : "Incorrect",
    youSelected: isRTL ? "إجابتك" : "Your Answer",
    skipped: isRTL ? "لم يتم الإجابة" : "Skipped",
    save: isRTL ? "حفظ في السجل" : "Save to History"
  };

  // --- RESULT VIEW ---
  if (showResults && !isReviewMode) {
    return (
      <div className={`w-full max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-500 py-10 ${getFontClass()}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden text-center p-10 relative">
           <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
           
           <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 shadow-xl ${percentage >= 50 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
              <Award size={48} />
           </div>
           
           <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">{t.score}</h2>
           <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-6">
             {percentage}%
           </div>
           
           <p className="text-slate-500 dark:text-slate-400 mb-10 text-lg">
             You answered <span className="font-bold text-slate-800 dark:text-slate-200">{score}</span> out of <span className="font-bold text-slate-800 dark:text-slate-200">{questions.length}</span> questions correctly.
           </p>

           <div className="space-y-4">
              <button 
                onClick={() => { setIsReviewMode(true); setCurrentQuestionIndex(0); }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-2"
              >
                 <CheckCircleIcon /> {t.review}
              </button>
              
              <div className="flex gap-4">
                 <button 
                   onClick={() => {
                     setShowResults(false);
                     setIsReviewMode(false);
                     setUserAnswers({});
                     setCurrentQuestionIndex(0);
                     if (hasTimer) setTimeLeft(timerSeconds);
                   }}
                   className="flex-1 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 py-3 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
                 >
                    <RefreshCw size={18} /> {t.tryAgain}
                 </button>
                 <button 
                   onClick={onRegenerate}
                   className="flex-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/30 py-3 rounded-xl font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors flex items-center justify-center gap-2"
                 >
                    <Sparkles size={18} /> {t.renew}
                 </button>
              </div>

              {onSave && (
                <button 
                  onClick={onSave}
                  className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-indigo-600 dark:text-indigo-300 py-3 rounded-xl font-bold hover:bg-indigo-50 dark:hover:bg-slate-600 hover:border-indigo-200 transition-colors flex items-center justify-center gap-2 mt-2"
                >
                    <Save size={18} /> {t.save}
                </button>
              )}

              <button onClick={onBack} className="text-slate-400 dark:text-slate-500 font-bold text-sm hover:text-slate-600 dark:hover:text-slate-300 mt-4 block mx-auto">
                 {t.back}
              </button>
           </div>
        </div>
      </div>
    );
  }

  // --- QUIZ & REVIEW VIEW ---
  return (
    <div className={`w-full max-w-4xl mx-auto pb-10 ${getFontClass()}`} dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm sticky top-20 z-20">
         <div className="flex items-center gap-4">
            <button 
                onClick={showResults ? () => setIsReviewMode(false) : onBack}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-colors"
            >
                {isRTL ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
            </button>
            <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.question}</span>
                <span className="text-xl font-bold text-slate-800 dark:text-slate-100">
                    {currentQuestionIndex + 1} <span className="text-slate-300 dark:text-slate-600 text-lg">/</span> {questions.length}
                </span>
            </div>
         </div>

         {/* Timer (Only show in Quiz mode) */}
         {!showResults && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-lg ${hasTimer && timeLeft < 30 ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 animate-pulse' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200'}`}>
                <Clock size={18} />
                {hasTimer ? formatTime(timeLeft) : '∞'}
            </div>
         )}
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full mb-8 overflow-hidden">
         <div 
            className="h-full bg-indigo-500 transition-all duration-300 ease-out"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
         ></div>
      </div>

      {/* Main Question Card - Animated Container */}
      <div key={currentQuestionIndex} className={slideDirection === 'right' ? 'animate-slide-right' : 'animate-slide-left'}>
        <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden relative">
            
            {/* Status Banner (Review Mode) */}
            {showResults && (
                <div className={`w-full p-3 font-bold text-center text-white flex items-center justify-center gap-2 ${userAnswers[currentQuestion.id] === currentQuestion.correctAnswerIndex ? 'bg-emerald-500' : 'bg-red-500'}`}>
                    {userAnswers[currentQuestion.id] === currentQuestion.correctAnswerIndex ? (
                        <><Check size={20} /> {t.correct}</>
                    ) : (
                        <><XIcon size={20} /> {t.incorrect}</>
                    )}
                </div>
            )}

            <div className="p-6 md:p-10">
                <h3 className={`${getTextSizeClass('title')} font-bold text-slate-800 dark:text-slate-100 leading-relaxed mb-8`}>
                    {currentQuestion.question}
                </h3>

                <div className="space-y-3">
                    {currentQuestion.options.map((option, idx) => {
                        const isSelected = userAnswers[currentQuestion.id] === idx;
                        const isCorrect = currentQuestion.correctAnswerIndex === idx;
                        
                        let containerClass = `w-full p-4 md:p-5 rounded-2xl border-2 text-left flex items-center gap-4 transition-all duration-200 relative overflow-hidden group `;
                        
                        if (showResults) {
                            // Review Styling
                            if (isCorrect) {
                                containerClass += "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-100";
                            } else if (isSelected && !isCorrect) {
                                containerClass += "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100 opacity-90";
                            } else {
                                containerClass += "border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 opacity-50";
                            }
                        } else {
                            // Active Quiz Styling
                            if (isSelected) {
                                containerClass += "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-100 shadow-md transform scale-[1.01] z-10";
                            } else {
                                containerClass += "border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:shadow-sm";
                            }
                        }

                        return (
                            <button 
                                key={idx}
                                onClick={() => handleOptionSelect(idx)}
                                disabled={showResults}
                                className={containerClass}
                            >
                                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                                    showResults 
                                        ? (isCorrect ? 'bg-emerald-500 border-emerald-500 text-white' : (isSelected ? 'bg-red-500 border-red-500 text-white' : 'border-slate-300 dark:border-slate-600'))
                                        : (isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500 group-hover:border-indigo-300')
                                }`}>
                                    {['A','B','C','D'][idx]}
                                </div>
                                <span className={`flex-grow ${isRTL ? 'text-right' : 'text-left'} ${getTextSizeClass('body')} font-medium`}>
                                    {option}
                                </span>
                                
                                {showResults && isSelected && !isCorrect && <span className="text-xs font-bold text-red-600 bg-red-100 dark:bg-red-900 px-2 py-1 rounded">{t.youSelected}</span>}
                            </button>
                        );
                    })}
                </div>

                {/* Explanation Box (Review Mode) */}
                {showResults && (
                    <div className="mt-8 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 animate-pop">
                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold mb-2">
                            <HelpCircle size={18} />
                            {t.explanation}
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm md:text-base">
                            {currentQuestion.explanation}
                        </p>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between mt-8 gap-4">
         <button 
            onClick={() => navigateQuestion('prev')}
            disabled={currentQuestionIndex === 0}
            className={`flex-1 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                currentQuestionIndex === 0 
                ? 'opacity-0 pointer-events-none' 
                : 'bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-200 shadow-sm'
            }`}
         >
            {isRTL ? <ChevronRight /> : <ChevronLeft />}
            {t.prev}
         </button>

         <button 
            onClick={() => navigateQuestion('next')}
            className={`flex-[2] py-4 rounded-xl font-bold text-white shadow-xl flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1 active:scale-95 ${
                showResults 
                ? 'bg-slate-800 dark:bg-slate-600 hover:bg-slate-900' 
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-indigo-200 dark:shadow-none'
            }`}
         >
            {currentQuestionIndex === questions.length - 1 ? (
                <>
                   {showResults ? t.score : t.finish}
                   <Flag size={20} />
                </>
            ) : (
                <>
                   {t.next}
                   {isRTL ? <ChevronLeft /> : <ChevronRight />}
                </>
            )}
         </button>
      </div>

    </div>
  );
};

// Helper Icon for Review Button
const CheckCircleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
);

export default QuizDisplay;