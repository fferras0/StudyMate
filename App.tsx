import React, { useState, useEffect } from 'react';
import { FileData, AppState, QuizQuestion, Language, FontSize, FontType, User, GuestUsage, HistoryItem } from './types';
import FileUploader from './components/FileUploader';
import SummaryDisplay from './components/SummaryDisplay';
import QuizDisplay from './components/QuizDisplay';
import AuthView from './components/AuthView';
import AdminDashboard from './components/AdminDashboard';
import HistoryView from './components/HistoryView'; // Import HistoryView
import { summarizeDocument, generateQuizFromDocument, extractTextFromDocument } from './services/geminiService';
import { Sparkles, Brain, FileText, Loader2, X, Settings2, Languages, HelpCircle, ArrowRight, ArrowLeft, Edit3, Save, RotateCcw, Timer, Clock, Trash2, Image as ImageIcon, Type, ALargeSmall, Lock, LogOut, History, Sun, Moon } from 'lucide-react';

const SESSION_KEY = 'STUDYMATE_SESSION';
const USERS_DB_KEY = 'STUDYMATE_USERS_DB';
const HISTORY_DB_KEY = 'STUDYMATE_HISTORY_DB';
const THEME_KEY = 'STUDYMATE_THEME';

type TimerMode = 'off' | 'per_question' | 'total';
type Theme = 'light' | 'dark';

// Guest Limits
const MAX_GUEST_SUMMARIES = 2;
const MAX_GUEST_QUESTIONS = 10;

const App: React.FC = () => {
  // Theme State
  const [theme, setTheme] = useState<Theme>('light');

  // Authentication & User State
  const [user, setUser] = useState<User | null>(null);
  const [usersDb, setUsersDb] = useState<User[]>([]);
  const [authError, setAuthError] = useState<string | null>(null);
  const [guestUsage, setGuestUsage] = useState<GuestUsage>({ summariesCount: 0, questionsCount: 0 });
  const [showLimitModal, setShowLimitModal] = useState<boolean>(false);

  // History State
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [currentFile, setCurrentFile] = useState<FileData | null>(null);
  
  // State for Edited Text
  const [extractedText, setExtractedText] = useState<string>('');
  const [isUsingEditedText, setIsUsingEditedText] = useState<boolean>(false);

  const [summary, setSummary] = useState<string>('');
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Settings State
  const [language, setLanguage] = useState<Language>('ar');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [fontSize, setFontSize] = useState<FontSize>('medium');
  const [fontType, setFontType] = useState<FontType>('sans');
  
  // Timer Settings
  const [timerMode, setTimerMode] = useState<TimerMode>('per_question');
  const [timerValue, setTimerValue] = useState<number>(60); // Seconds

  // Session Loading State
  const [isSessionLoaded, setIsSessionLoaded] = useState(false);

  // Initialize Theme
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY) as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  // Apply Theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Load Session, User DB, and History on Mount
  useEffect(() => {
    const loadData = () => {
      try {
        // Load Mock DB
        const savedUsers = localStorage.getItem(USERS_DB_KEY);
        if (savedUsers) {
          setUsersDb(JSON.parse(savedUsers));
        } else {
          // Create default Admin if DB doesn't exist
          const defaultAdmin: User = {
            id: 'admin-001',
            name: 'System Admin',
            email: 'admin@studymate.com',
            password: 'admin', // Simple mock password
            isGuest: false,
            isAdmin: true,
            joinedAt: new Date().toISOString()
          };
          setUsersDb([defaultAdmin]);
          localStorage.setItem(USERS_DB_KEY, JSON.stringify([defaultAdmin]));
        }

        // Load History
        const savedHistory = localStorage.getItem(HISTORY_DB_KEY);
        if (savedHistory) {
           setHistoryItems(JSON.parse(savedHistory));
        }

        // Load Session
        const savedSession = localStorage.getItem(SESSION_KEY);
        if (savedSession) {
          const data = JSON.parse(savedSession);
          
          if (data.user) setUser(data.user);
          if (data.guestUsage) setGuestUsage(data.guestUsage);

          if (data.currentFile) setCurrentFile(data.currentFile);
          if (data.extractedText !== undefined) setExtractedText(data.extractedText);
          if (data.isUsingEditedText !== undefined) setIsUsingEditedText(data.isUsingEditedText);
          if (data.language) setLanguage(data.language);
          if (data.questionCount) setQuestionCount(data.questionCount);
          if (data.fontSize) setFontSize(data.fontSize);
          if (data.fontType) setFontType(data.fontType);
          
          if (data.timerMode) setTimerMode(data.timerMode);
          if (data.timerValue) setTimerValue(data.timerValue);

          if (data.summary) setSummary(data.summary);
          if (data.quiz) setQuiz(data.quiz);
          
          if (data.appState) {
             if (data.appState === AppState.PROCESSING) {
                setAppState(AppState.IDLE);
             } else {
                setAppState(data.appState);
             }
          }
        }
      } catch (e) {
        console.error("Failed to load data", e);
        localStorage.removeItem(SESSION_KEY);
      } finally {
        setIsSessionLoaded(true);
      }
    };
    
    loadData();
  }, []);

  // Save Session on Change
  useEffect(() => {
    if (!isSessionLoaded) return;

    const saveSession = () => {
      const sessionData = {
        user,
        guestUsage,
        currentFile,
        extractedText,
        isUsingEditedText,
        language,
        questionCount,
        fontSize,
        fontType,
        timerMode,
        timerValue,
        summary,
        quiz,
        appState
      };
      
      try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
      } catch (e) {
        console.warn("Failed to save session", e);
      }
    };

    const timeoutId = setTimeout(saveSession, 1000);
    return () => clearTimeout(timeoutId);
  }, [
    user,
    guestUsage,
    currentFile, 
    extractedText, 
    isUsingEditedText, 
    language, 
    questionCount, 
    fontSize,
    fontType,
    timerMode,
    timerValue,
    summary, 
    quiz, 
    appState, 
    isSessionLoaded
  ]);

  // Auth Handlers
  const handleAuth = (mode: 'login' | 'register', name: string, email: string, password?: string) => {
    setAuthError(null);
    
    if (mode === 'login') {
      const existingUser = usersDb.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!existingUser) {
        setAuthError(language === 'ar' ? 'المستخدم غير موجود.' : 'User not found.');
        return;
      }
      
      if (existingUser.password !== password) {
        setAuthError(language === 'ar' ? 'كلمة المرور غير صحيحة.' : 'Incorrect password.');
        return;
      }

      if (existingUser.isDisabled) {
        setAuthError(language === 'ar' ? 'تم تعطيل هذا الحساب. يرجى الاتصال بالدعم.' : 'Account disabled. Contact support.');
        return;
      }

      setUser(existingUser);
      if (existingUser.isAdmin) {
        setAppState(AppState.ADMIN);
      } else {
        setAppState(AppState.IDLE);
      }
      setShowLimitModal(false);

    } else {
      // Register
      const existingUser = usersDb.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        setAuthError(language === 'ar' ? 'البريد الإلكتروني مسجل مسبقاً.' : 'Email already registered.');
        return;
      }

      const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
        password,
        isGuest: false,
        joinedAt: new Date().toISOString()
      };

      const updatedDb = [...usersDb, newUser];
      setUsersDb(updatedDb);
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(updatedDb));
      
      setUser(newUser);
      setAppState(AppState.IDLE);
      setShowLimitModal(false);
    }
  };

  const handleGuest = () => {
    setUser({ id: 'guest', name: 'Guest', email: '', isGuest: true });
    setAppState(AppState.IDLE);
  };

  const handleLogout = () => {
    setUser(null);
    handleReset();
    setGuestUsage({ summariesCount: 0, questionsCount: 0 });
    setShowLimitModal(false);
  };

  // Admin Actions
  const handleUpdateUsers = (updatedUsers: User[]) => {
    setUsersDb(updatedUsers);
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(updatedUsers));
  };

  // History Actions with Eviction Policy
  const handleSaveToHistory = () => {
    if (!user || !currentFile) return;

    const newItem: HistoryItem = {
      id: Date.now().toString(),
      userId: user.id,
      timestamp: new Date().toISOString(),
      fileName: currentFile.name,
      fileData: currentFile,
      extractedText: extractedText || '',
      summary: summary || null,
      quiz: quiz.length > 0 ? quiz : null,
      language: language
    };

    // Helper to safely set storage
    const trySetStorage = (items: HistoryItem[]): boolean => {
      try {
        const serialized = JSON.stringify(items);
        localStorage.setItem(HISTORY_DB_KEY, serialized);
        setHistoryItems(items);
        return true;
      } catch (e: any) {
        // QuotaExceededError name varies by browser
        if (e.name === 'QuotaExceededError' || 
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
            e.code === 22) {
          return false;
        }
        // Unknown error
        console.error("Unknown Storage Error:", e);
        return false;
      }
    };

    let tempHistory = [...historyItems];
    let saved = false;

    // 1. Try adding to the top
    if (trySetStorage([newItem, ...tempHistory])) {
       alert(language === 'ar' ? 'تم الحفظ في السجل بنجاح' : 'Saved to history successfully');
       saved = true;
    } else {
       // 2. Storage full, try evicting oldest
       while (tempHistory.length > 0 && !saved) {
          tempHistory.pop(); // Remove oldest
          const retryList = [newItem, ...tempHistory];
          if (trySetStorage(retryList)) {
             alert(language === 'ar' 
               ? 'تم الحفظ بنجاح (تم حذف عناصر قديمة لتوفير مساحة)' 
               : 'Saved successfully (Old items removed to free up space)'
             );
             saved = true;
          }
       }
    }

    if (!saved) {
       alert(language === 'ar' 
         ? 'عفواً، الملف كبير جداً ولا يمكن حفظه في السجل المحلي (الحد الأقصى ~4-5 ميجابايت).' 
         : 'Sorry, this file is too large to save in local history (Limit is ~4-5MB). Analysis is still available.'
       );
    }
  };

  const handleDeleteHistoryItem = (id: string) => {
    if (window.confirm(language === 'ar' ? 'حذف هذا العنصر؟' : 'Delete this item?')) {
        const updated = historyItems.filter(item => item.id !== id);
        setHistoryItems(updated);
        localStorage.setItem(HISTORY_DB_KEY, JSON.stringify(updated));
    }
  };

  const handleLoadHistoryItem = (item: HistoryItem) => {
      setCurrentFile(item.fileData);
      setExtractedText(item.extractedText);
      setIsUsingEditedText(!!item.extractedText && item.extractedText.length > 0);
      setSummary(item.summary || '');
      setQuiz(item.quiz || []);
      setLanguage(item.language);
      
      // Navigate to IDLE, users will see the file loaded and can choose Summary/Quiz buttons
      // Or if Summary exists, we could go there. Let's stick to IDLE so they see context.
      setAppState(AppState.IDLE);
  };

  // Limit Checkers
  const checkGuestLimits = (type: 'summary' | 'quiz', cost: number = 1): boolean => {
    if (!user || !user.isGuest) return true; // Not a guest, no limits

    if (type === 'summary') {
      if (guestUsage.summariesCount >= MAX_GUEST_SUMMARIES) {
        setShowLimitModal(true);
        return false;
      }
    } else if (type === 'quiz') {
      if (guestUsage.questionsCount + cost > MAX_GUEST_QUESTIONS) {
        setShowLimitModal(true);
        return false;
      }
    }
    return true;
  };

  const incrementGuestUsage = (type: 'summary' | 'quiz', cost: number = 1) => {
    if (!user || !user.isGuest) return;

    if (type === 'summary') {
      setGuestUsage(prev => ({ ...prev, summariesCount: prev.summariesCount + 1 }));
    } else if (type === 'quiz') {
      setGuestUsage(prev => ({ ...prev, questionsCount: prev.questionsCount + cost }));
    }
  };

  // File & Process Handlers
  const handleFileSelect = (file: FileData) => {
    setCurrentFile(file);
    setIsUsingEditedText(false);
    setExtractedText('');
    setAppState(AppState.IDLE);
    setErrorMsg(null);
  };

  const handleExtractText = async () => {
    if (!currentFile) return;
    setAppState(AppState.PROCESSING);
    setErrorMsg(null);
    try {
      if (!extractedText) {
         const text = await extractTextFromDocument(currentFile.base64, currentFile.mimeType);
         setExtractedText(text);
      }
      setAppState(AppState.EDIT_TEXT_VIEW);
    } catch (err: any) {
      handleError(err);
    }
  };

  const saveEditedText = () => {
    setIsUsingEditedText(true);
    setAppState(AppState.IDLE);
  };

  const cancelEdit = () => {
    if (!isUsingEditedText) {
        setExtractedText('');
    }
    setAppState(AppState.IDLE);
  };

  const initQuizProcess = () => {
    setAppState(AppState.QUIZ_CONFIG);
  };

  const startQuizGeneration = async () => {
    if (!currentFile && !isUsingEditedText) return;
    if (!checkGuestLimits('quiz', questionCount)) return;

    setAppState(AppState.PROCESSING);
    setErrorMsg(null);
    try {
        const result = await generateQuizFromDocument(
            currentFile?.base64 || null, 
            currentFile?.mimeType || null, 
            isUsingEditedText ? extractedText : null,
            questionCount, 
            language
        );
        setQuiz(result);
        incrementGuestUsage('quiz', questionCount);
        setAppState(AppState.QUIZ_VIEW);
    } catch (err: any) {
        handleError(err);
    }
  };

  const handleSummarize = async () => {
    if (!currentFile && !isUsingEditedText) return;
    if (!checkGuestLimits('summary')) return;

    setAppState(AppState.PROCESSING);
    setErrorMsg(null);
    try {
        const result = await summarizeDocument(
            currentFile?.base64 || null, 
            currentFile?.mimeType || null, 
            isUsingEditedText ? extractedText : null,
            language
        );
        setSummary(result);
        incrementGuestUsage('summary');
        setAppState(AppState.SUMMARY_VIEW);
    } catch (err: any) {
        handleError(err);
    }
  };

  const handleError = (err: any) => {
      console.error(err);
      setErrorMsg(language === 'ar' 
        ? "فشل في معالجة الطلب. يرجى المحاولة مرة أخرى."
        : "Failed to process request. Please try again."
      );
      setAppState(AppState.ERROR);
  };

  const handleReset = () => {
    setCurrentFile(null);
    setExtractedText('');
    setIsUsingEditedText(false);
    setAppState(AppState.IDLE);
    setSummary('');
    setQuiz([]);
    setErrorMsg(null);
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (e) { console.error(e); }
  };

  const handleBackToMenu = () => {
    setAppState(AppState.IDLE);
  };

  const getQuizTotalSeconds = () => {
    if (timerMode === 'off') return 0;
    if (timerMode === 'total') return timerValue * 60;
    if (timerMode === 'per_question') return timerValue * questionCount;
    return 0;
  };

  // Helper styles for preview
  const getFontPreviewClass = () => {
    let classes = '';
    switch(fontType) {
        case 'serif': classes += ' font-serif'; break;
        case 'mono': classes += ' font-mono'; break;
        default: classes += ' font-sans'; break;
    }
    switch(fontSize) {
        case 'small': classes += ' text-sm'; break;
        case 'large': classes += ' text-xl'; break;
        default: classes += ' text-base'; break;
    }
    return classes;
  };

  const isRTL = language === 'ar';

  const t = {
    title: language === 'ar' ? 'مساعد الدراسة الذكي' : 'StudyMate AI',
    startOver: language === 'ar' ? 'مسح الجلسة' : 'Clear Session',
    heroTitle: language === 'ar' ? 'حول ملفاتك إلى اختبارات ذكية' : 'Transform files into smart quizzes',
    heroDesc: language === 'ar' 
      ? 'ارفع ملف PDF أو صورة، وسنقوم باستخراج النص، وتلخيصه، وإنشاء أسئلة اختبار تفاعلية.'
      : "Upload a PDF or Image. We'll extract text, summarize it, and generate interactive quiz questions.",
    analyzing: language === 'ar' ? 'جاري التحليل...' : 'Analyzing...',
    wait: language === 'ar' ? 'نحن نقرأ الملف الآن.' : 'Reading the file now.',
    errorTitle: language === 'ar' ? 'عفواً' : 'Whoops',
    tryAgain: language === 'ar' ? 'حاول مرة أخرى' : 'Try Again',
    settings: language === 'ar' ? 'الإعدادات' : 'Settings',
    langLabel: language === 'ar' ? 'اللغة' : 'Language',
    fontLabel: language === 'ar' ? 'الخط' : 'Font',
    fontPreview: language === 'ar' ? 'معاينة النص' : 'Text Preview',
    summarizeBtn: language === 'ar' ? 'تلخيص المحتوى' : 'Summarize Content',
    summarizeDesc: language === 'ar' ? 'ملخص شامل ومنظم.' : 'Comprehensive and structured summary.',
    quizBtn: language === 'ar' ? 'اختبار تفاعلي' : 'Interactive Quiz',
    quizDesc: language === 'ar' ? 'تحدى نفسك مع مؤقت وأسئلة.' : 'Challenge yourself with a timer and questions.',
    quizConfigTitle: language === 'ar' ? 'إعداد الاختبار' : 'Quiz Setup',
    quizCountLabel: language === 'ar' ? 'عدد الأسئلة' : 'Question Count',
    timerLabel: language === 'ar' ? 'نظام المؤقت' : 'Timer System',
    startQuiz: language === 'ar' ? 'بدء الاختبار' : 'Start Quiz',
    cancel: language === 'ar' ? 'إلغاء' : 'Cancel',
    editText: language === 'ar' ? 'تعديل النص / قراءة الصورة' : 'Edit Text / Read Image',
    editTitle: language === 'ar' ? 'المحرر الذكي' : 'Smart Editor',
    editDesc: language === 'ar'
      ? 'هذا هو النص الذي قرأناه من ملفك. عدله لتحسين النتائج.' 
      : 'This is the text we read from your file. Edit it to improve results.',
    saveText: language === 'ar' ? 'اعتماد النص' : 'Use Text',
    usingEdited: language === 'ar' ? 'نص مخصص' : 'Custom Text',
    revertOriginal: language === 'ar' ? 'إلغاء التعديلات' : 'Discard Edits',
    logout: language === 'ar' ? 'تسجيل خروج' : 'Log Out',
    guestLimitTitle: language === 'ar' ? 'وصلت للحد الأقصى للزوار' : 'Guest Limit Reached',
    guestLimitDesc: language === 'ar' 
        ? 'لقد استهلكت رصيدك المجاني من الملخصات أو الأسئلة كزائر. يرجى تسجيل الدخول أو إنشاء حساب لحفظ تقدمك والمتابعة.'
        : 'You have used your free limit of summaries or questions as a guest. Please log in or create an account to save your progress and continue.',
    loginToSave: language === 'ar' ? 'تسجيل الدخول للحفظ والمتابعة' : 'Log In to Save & Continue',
    history: language === 'ar' ? 'السجل' : 'History',
    
    timerOff: language === 'ar' ? 'بدون وقت' : 'No Timer',
    timerPerQ: language === 'ar' ? 'وقت لكل سؤال' : 'Time per Question',
    timerTotal: language === 'ar' ? 'وقت كلي' : 'Total Duration',
    seconds: language === 'ar' ? 'ثانية' : 'Seconds',
    minutes: language === 'ar' ? 'دقيقة' : 'Minutes',

    small: language === 'ar' ? 'صغير' : 'Small',
    medium: language === 'ar' ? 'متوسط' : 'Medium',
    large: language === 'ar' ? 'كبير' : 'Large',
    sans: language === 'ar' ? 'عصري' : 'Sans',
    serif: language === 'ar' ? 'تقليدي' : 'Serif',
    mono: language === 'ar' ? 'مونو' : 'Mono',
    
    sampleText: language === 'ar' 
        ? 'بسم الله الرحمن الرحيم. هذا مثال على شكل النص.'
        : 'The quick brown fox jumps over the lazy dog.',
    viewSummary: language === 'ar' ? 'عرض الملخص الحالي' : 'View Current Summary',
    startQuizAgain: language === 'ar' ? 'بدء الاختبار الحالي' : 'Start Current Quiz',
  };

  if (!isSessionLoaded) {
      return (
          <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
      );
  }

  // Auth View
  if (!user) {
    return (
      <AuthView 
        onAuth={handleAuth} 
        onGuest={handleGuest} 
        language={language}
        setLanguage={setLanguage}
        error={authError}
      />
    );
  }

  // Admin View
  if (user.isAdmin && appState === AppState.ADMIN) {
     return (
       <AdminDashboard 
         currentUser={user} 
         allUsers={usersDb} 
         onUpdateUsers={handleUpdateUsers}
         onLogout={handleLogout}
         isRTL={isRTL}
       />
     );
  }

  // History View
  if (appState === AppState.HISTORY_VIEW) {
    return (
        <HistoryView 
            historyItems={historyItems.filter(h => h.userId === user.id)}
            onLoadItem={handleLoadHistoryItem}
            onDeleteItem={handleDeleteHistoryItem}
            onBack={() => setAppState(currentFile ? AppState.IDLE : AppState.IDLE)} // Simplified logic
            language={language}
        />
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col ${isRTL ? 'font-[Noto_Sans_Arabic]' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 sticky top-0 z-20 print:hidden transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 text-indigo-600 cursor-pointer" onClick={handleBackToMenu}>
            <div className="bg-indigo-600 text-white p-1.5 rounded-lg shadow-md shadow-indigo-200 dark:shadow-none">
               <Brain className={`w-6 h-6 ${isRTL ? 'ml-0' : ''}`} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 hidden md:block">{t.title}</h1>
          </div>
          <div className="flex items-center gap-3">
             {/* User Info */}
             <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-bold">
                {user.isGuest ? (
                   <>
                     <span className="text-xs uppercase tracking-wider bg-indigo-200 dark:bg-indigo-800 px-1.5 py-0.5 rounded text-indigo-800 dark:text-indigo-200">GUEST</span>
                     <span className="text-xs">
                        {guestUsage.summariesCount}/{MAX_GUEST_SUMMARIES} Doc | {guestUsage.questionsCount}/{MAX_GUEST_QUESTIONS} Q
                     </span>
                   </>
                ) : (
                   <span>{user.name}</span>
                )}
             </div>

             <button
               onClick={toggleTheme}
               className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
               title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
             >
               {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
             </button>

             <button 
                onClick={() => setAppState(AppState.HISTORY_VIEW)}
                className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium text-sm flex items-center gap-2 transition-colors"
                title={t.history}
             >
                <History size={16} />
                <span className="hidden sm:inline">{t.history}</span>
             </button>

             {!currentFile && (
                <button 
                  onClick={() => setLanguage(l => l === 'en' ? 'ar' : 'en')}
                  className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium text-sm flex items-center gap-2 transition-colors"
                >
                  <Languages size={14} />
                  {language === 'en' ? 'العربية' : 'English'}
                </button>
             )}
             
             {currentFile && appState !== AppState.IDLE && appState !== AppState.EDIT_TEXT_VIEW && (
                <button 
                  onClick={handleReset} 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 font-medium text-sm transition-colors"
                >
                  <Trash2 size={14} />
                  <span className="hidden sm:inline">{t.startOver}</span>
                </button>
             )}

             <button onClick={handleLogout} className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors" title={t.logout}>
                <LogOut size={20} />
             </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-8 print:p-0">
        <div className="max-w-7xl mx-auto print:max-w-none">
          
          {/* File Selection View */}
          {!currentFile && (
            <div className="flex flex-col items-center justify-center min-h-[70vh] animate-in fade-in zoom-in-95 duration-700">
              <div className="text-center mb-12 max-w-2xl">
                <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-6 leading-tight">
                  {t.heroTitle}
                </h1>
                <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 leading-relaxed">
                  {t.heroDesc}
                </p>
              </div>
              <FileUploader onFileSelect={handleFileSelect} isRTL={isRTL} />
            </div>
          )}

          {/* Action Selection (Menu) */}
          {currentFile && appState === AppState.IDLE && (
            <div className="max-w-5xl mx-auto animate-in slide-in-from-bottom-8 duration-500">
               
               {/* Improved File Card */}
               <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700 overflow-hidden mb-8 transform transition-all hover:scale-[1.01]">
                 <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${currentFile.mimeType.includes('image') ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                        {currentFile.mimeType.includes('image') ? <ImageIcon size={32} /> : <FileText size={32} />}
                      </div>
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-2 mb-1">
                             <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 uppercase tracking-wide">
                                {isUsingEditedText ? 'TEXT' : currentFile.mimeType.split('/')[1]}
                             </span>
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white truncate max-w-[250px] md:max-w-md text-xl md:text-2xl">
                          {isUsingEditedText ? t.usingEdited : currentFile.name}
                        </h3>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                         {isUsingEditedText ? (
                            <button 
                                onClick={() => { setIsUsingEditedText(false); }}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors border border-amber-100 dark:border-amber-800"
                            >
                                <RotateCcw size={16} />
                                {t.revertOriginal}
                            </button>
                         ) : (
                            <button 
                                onClick={handleExtractText}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors border border-indigo-100 dark:border-indigo-800"
                            >
                                <Edit3 size={16} />
                                {t.editText}
                            </button>
                         )}
                        <button onClick={handleReset} className="p-3 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-900/30">
                             <X size={20} />
                        </button>
                    </div>
                 </div>
               </div>

               {/* Pre-generated Action Buttons (If loading from history) */}
               {(summary || quiz.length > 0) && (
                   <div className="grid grid-cols-2 gap-4 mb-6 animate-in slide-in-from-top-4">
                       {summary && (
                           <button 
                               onClick={() => setAppState(AppState.SUMMARY_VIEW)}
                               className="py-3 px-4 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-200 font-bold rounded-xl hover:bg-indigo-200 dark:hover:bg-indigo-900/70 transition-colors flex items-center justify-center gap-2"
                           >
                               <FileText size={20} />
                               {t.viewSummary}
                           </button>
                       )}
                       {quiz.length > 0 && (
                           <button 
                               onClick={() => setAppState(AppState.QUIZ_VIEW)}
                               className="py-3 px-4 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-200 font-bold rounded-xl hover:bg-emerald-200 dark:hover:bg-emerald-900/70 transition-colors flex items-center justify-center gap-2"
                           >
                               <Brain size={20} />
                               {t.startQuizAgain}
                           </button>
                       )}
                   </div>
               )}

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Settings Panel */}
                  <div className="lg:col-span-4 bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700 p-8 h-fit">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
                      <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
                         <Settings2 size={20} />
                      </div>
                      <h3 className="font-bold text-xl text-slate-800 dark:text-white">{t.settings}</h3>
                    </div>
                    
                    <div className="space-y-6">
                      {/* Language */}
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                          <Languages size={18} className="text-indigo-500 dark:text-indigo-400" />
                          {t.langLabel}
                        </label>
                        <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 dark:bg-slate-700 rounded-2xl">
                          <button 
                            onClick={() => setLanguage('ar')}
                            className={`py-2.5 px-4 text-sm font-bold rounded-xl transition-all ${language === 'ar' ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                          >
                            العربية
                          </button>
                          <button 
                            onClick={() => setLanguage('en')}
                            className={`py-2.5 px-4 text-sm font-bold rounded-xl transition-all ${language === 'en' ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                          >
                            English
                          </button>
                        </div>
                      </div>

                      {/* Font Settings */}
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                          <Type size={18} className="text-indigo-500 dark:text-indigo-400" />
                          {t.fontLabel}
                        </label>
                        <div className="space-y-3">
                           {/* Font Size */}
                           <div className="grid grid-cols-3 gap-2">
                              {['small', 'medium', 'large'].map((size) => (
                                <button
                                  key={size}
                                  onClick={() => setFontSize(size as FontSize)}
                                  className={`py-2 px-1 text-xs font-bold rounded-xl border transition-all ${fontSize === size ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 dark:border-indigo-400 text-indigo-700 dark:text-indigo-300' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-500'}`}
                                >
                                  {size === 'small' && <ALargeSmall size={14} className="mx-auto" />}
                                  {size === 'medium' && <ALargeSmall size={18} className="mx-auto" />}
                                  {size === 'large' && <ALargeSmall size={22} className="mx-auto" />}
                                </button>
                              ))}
                           </div>
                           {/* Font Type */}
                           <div className="grid grid-cols-3 gap-2">
                             <button onClick={() => setFontType('sans')} className={`py-2 rounded-xl text-xs font-bold border ${fontType === 'sans' ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 dark:border-indigo-400 text-indigo-700 dark:text-indigo-300' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400'}`}>{t.sans}</button>
                             <button onClick={() => setFontType('serif')} className={`py-2 rounded-xl text-xs font-bold border font-serif ${fontType === 'serif' ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 dark:border-indigo-400 text-indigo-700 dark:text-indigo-300' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400'}`}>{t.serif}</button>
                             <button onClick={() => setFontType('mono')} className={`py-2 rounded-xl text-xs font-bold border font-mono ${fontType === 'mono' ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 dark:border-indigo-400 text-indigo-700 dark:text-indigo-300' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400'}`}>{t.mono}</button>
                           </div>

                           {/* Live Font Preview */}
                           <div className={`mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 transition-all ${getFontPreviewClass()}`}>
                              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1 block">{t.fontPreview}</span>
                              {t.sampleText}
                           </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Actions Grid */}
                  <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-5">
                    <button 
                        onClick={handleSummarize}
                        className="group relative p-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-3xl shadow-xl shadow-indigo-200 dark:shadow-none transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl overflow-hidden flex flex-col justify-between h-64 border-0"
                      >
                        <div className={`absolute top-0 p-8 opacity-20 ${isRTL ? 'left-0' : 'right-0'}`}>
                          <Sparkles size={120} className="text-white rotate-12" />
                        </div>
                        <div className="relative z-10 w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white mb-auto shadow-inner border border-white/10">
                            <FileText size={28} />
                        </div>
                        <div className="relative z-10 text-white">
                          <h3 className="text-2xl font-bold mb-2">{t.summarizeBtn}</h3>
                          <p className="text-indigo-100 font-medium text-sm leading-relaxed opacity-90">
                            {t.summarizeDesc}
                          </p>
                        </div>
                    </button>

                    <button 
                        onClick={initQuizProcess}
                        className="group relative p-8 bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200 dark:shadow-slate-900/20 border border-slate-100 dark:border-slate-700 transition-all duration-300 hover:scale-[1.02] hover:border-emerald-200 dark:hover:border-emerald-800 hover:shadow-emerald-100 dark:hover:shadow-none overflow-hidden flex flex-col justify-between h-64"
                      >
                        <div className={`absolute top-0 p-8 opacity-[0.03] ${isRTL ? 'left-0' : 'right-0'}`}>
                          <Brain size={120} className="text-emerald-900 dark:text-emerald-500 rotate-12" />
                        </div>
                        <div className="relative z-10 w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-auto">
                            <Brain size={28} />
                        </div>
                        <div className="relative z-10">
                          <h3 className="text-2xl font-bold mb-2 text-slate-800 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">{t.quizBtn}</h3>
                          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed group-hover:text-slate-600 dark:group-hover:text-slate-300">
                            {t.quizDesc}
                          </p>
                        </div>
                    </button>
                  </div>
               </div>
            </div>
          )}

          {/* Edit Text View */}
          {appState === AppState.EDIT_TEXT_VIEW && (
              <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8">
                  <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col h-[80vh] overflow-hidden">
                      <div className="p-5 px-8 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/50 backdrop-blur-md">
                          <div className="flex items-center gap-3 text-indigo-700 dark:text-indigo-400">
                             <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg"><Edit3 size={20} /></div>
                             <h3 className="font-bold text-lg">{t.editTitle}</h3>
                          </div>
                          <button onClick={cancelEdit} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all">
                             <X size={24} />
                          </button>
                      </div>
                      
                      <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/20 text-sm text-indigo-900 dark:text-indigo-200 border-b border-indigo-100 dark:border-indigo-800 flex items-center justify-center">
                         <span className="font-medium">{t.editDesc}</span>
                      </div>

                      <div className="flex-grow relative">
                         <textarea 
                            className="w-full h-full p-8 focus:outline-none resize-none text-slate-800 dark:text-slate-200 leading-relaxed text-lg font-mono bg-slate-50 dark:bg-slate-900"
                            value={extractedText}
                            onChange={(e) => setExtractedText(e.target.value)}
                            dir={language === 'ar' ? 'rtl' : 'ltr'}
                            placeholder="..."
                         />
                      </div>

                      <div className="p-5 px-8 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-4 bg-white dark:bg-slate-800">
                          <button 
                             onClick={cancelEdit}
                             className="px-6 py-3 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                          >
                             {t.cancel}
                          </button>
                          <button 
                             onClick={saveEditedText}
                             className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none hover:shadow-indigo-300 transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
                          >
                             <Save size={18} />
                             {t.saveText}
                          </button>
                      </div>
                  </div>
              </div>
          )}

          {/* Quiz Configuration Overlay */}
          {appState === AppState.QUIZ_CONFIG && (
            <div className="flex flex-col items-center justify-center min-h-[50vh] max-w-xl mx-auto animate-in fade-in zoom-in-95">
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 p-8 md:p-10 w-full relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
                    
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl"><Brain size={28} /></div>
                            {t.quizConfigTitle}
                        </h3>
                        <button onClick={handleBackToMenu} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="space-y-8">
                        {/* Question Count */}
                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-3 text-lg flex items-center gap-2">
                                <HelpCircle className="text-emerald-500" size={20} />
                                {t.quizCountLabel}
                            </label>
                            <div className="flex items-center border-2 border-slate-200 dark:border-slate-600 rounded-2xl px-5 py-4 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-50 dark:focus-within:ring-emerald-900/20 transition-all bg-white dark:bg-slate-900">
                                <input 
                                    type="number" 
                                    min="1" 
                                    max="50"
                                    value={questionCount}
                                    onChange={(e) => setQuestionCount(Math.max(1, parseInt(e.target.value) || 0))}
                                    className="w-full bg-transparent outline-none text-2xl font-bold text-slate-900 dark:text-white placeholder-slate-300"
                                />
                            </div>
                        </div>

                        {/* Timer Config */}
                        <div>
                             <label className="block text-slate-700 dark:text-slate-300 font-bold mb-3 text-lg flex items-center gap-2">
                                <Clock className="text-emerald-500" size={20} />
                                {t.timerLabel}
                            </label>
                            
                            <div className="grid grid-cols-3 gap-3 mb-4">
                                <button 
                                    onClick={() => setTimerMode('off')}
                                    className={`py-3 px-2 rounded-xl text-sm font-bold border-2 transition-all ${timerMode === 'off' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                >
                                    {t.timerOff}
                                </button>
                                <button 
                                    onClick={() => { setTimerMode('per_question'); setTimerValue(60); }}
                                    className={`py-3 px-2 rounded-xl text-sm font-bold border-2 transition-all ${timerMode === 'per_question' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                >
                                    {t.timerPerQ}
                                </button>
                                <button 
                                    onClick={() => { setTimerMode('total'); setTimerValue(10); }}
                                    className={`py-3 px-2 rounded-xl text-sm font-bold border-2 transition-all ${timerMode === 'total' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                >
                                    {t.timerTotal}
                                </button>
                            </div>

                            {timerMode !== 'off' && (
                                <div className="animate-in fade-in slide-in-from-top-2">
                                     <div className="flex items-center gap-3 border-2 border-slate-200 dark:border-slate-600 rounded-2xl px-5 py-3 bg-white dark:bg-slate-900">
                                        <input 
                                            type="number" 
                                            min="1"
                                            value={timerValue}
                                            onChange={(e) => setTimerValue(Math.max(1, parseInt(e.target.value) || 0))}
                                            className="w-full outline-none bg-transparent text-xl font-bold text-slate-900 dark:text-white"
                                        />
                                        <span className="text-sm font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
                                            {timerMode === 'per_question' ? t.seconds : t.minutes}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-4 mt-10">
                        <button 
                            onClick={handleBackToMenu}
                            className="flex-1 py-4 px-6 rounded-2xl border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-lg"
                        >
                            {t.cancel}
                        </button>
                        <button 
                            onClick={startQuizGeneration}
                            className="flex-1 py-4 px-6 rounded-2xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 dark:shadow-none flex items-center justify-center text-lg transform hover:-translate-y-1"
                        >
                            {t.startQuiz}
                            {isRTL ? <ArrowLeft size={20} className="mr-2" /> : <ArrowRight size={20} className="ml-2" />}
                        </button>
                    </div>
                </div>
            </div>
          )}

          {/* Limit Reached Modal */}
          {showLimitModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
               <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl transform scale-100 border border-slate-100 dark:border-slate-700">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                     <Lock size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-center text-slate-800 dark:text-white mb-2">{t.guestLimitTitle}</h3>
                  <p className="text-center text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                     {t.guestLimitDesc}
                  </p>
                  
                  <div className="space-y-3">
                     <button 
                        onClick={() => {
                            // "Login to save" actually effectively means logging in.
                            // We redirect to Auth view, preserving state in App but clearing user to trigger AuthView render.
                            setUser(null);
                        }}
                        className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                     >
                        {t.loginToSave}
                        {isRTL ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
                     </button>
                     <button 
                        onClick={() => setShowLimitModal(false)}
                        className="w-full text-slate-500 dark:text-slate-400 font-bold py-3 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                     >
                        {t.cancel}
                     </button>
                  </div>
               </div>
            </div>
          )}

          {/* Processing State */}
          {appState === AppState.PROCESSING && (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
              <div className="relative">
                 <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
                 <Loader2 className="w-16 h-16 text-indigo-600 animate-spin relative z-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-8 mb-2">{t.analyzing}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-lg">{t.wait}</p>
            </div>
          )}

          {/* Error State */}
          {appState === AppState.ERROR && (
             <div className="max-w-md mx-auto mt-10 p-8 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-3xl text-center shadow-lg">
               <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X size={32} />
               </div>
               <h3 className="text-xl font-bold text-red-800 dark:text-red-300 mb-2">{t.errorTitle}</h3>
               <p className="text-red-600 dark:text-red-400 mb-6">{errorMsg}</p>
               <button 
                 onClick={() => setAppState(AppState.IDLE)}
                 className="px-8 py-3 bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 font-bold transition-colors shadow-sm"
               >
                 {t.tryAgain}
               </button>
             </div>
          )}

          {/* Results Views */}
          {appState === AppState.SUMMARY_VIEW && (
            <SummaryDisplay 
              summary={summary} 
              onBack={handleBackToMenu} 
              language={language} 
              fontSize={fontSize}
              fontType={fontType}
              onSave={handleSaveToHistory} // Pass Save handler
            />
          )}

          {appState === AppState.QUIZ_VIEW && (
            <QuizDisplay 
                questions={quiz} 
                onBack={handleBackToMenu} 
                language={language}
                timerSeconds={getQuizTotalSeconds()} 
                fontSize={fontSize}
                fontType={fontType}
                onRegenerate={startQuizGeneration}
                onSave={handleSaveToHistory} // Pass Save handler
            />
          )}

        </div>
      </main>
    </div>
  );
};

export default App;