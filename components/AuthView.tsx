import React, { useState } from 'react';
import { Brain, User, Mail, Lock, ArrowRight, ArrowLeft, UserPlus, LogIn, AlertCircle } from 'lucide-react';
import { Language } from '../types';

interface AuthViewProps {
  onAuth: (mode: 'login' | 'register', name: string, email: string, password?: string) => void;
  onGuest: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  error?: string | null;
}

type AuthMode = 'login' | 'register';

const AuthView: React.FC<AuthViewProps> = ({ onAuth, onGuest, language, setLanguage, error }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const isRTL = language === 'ar';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAuth(mode, name, email, password);
  };

  const t = {
    welcome: isRTL ? 'أهلاً بك في مساعد الدراسة' : 'Welcome to StudyMate',
    desc: isRTL ? 'منصتك الذكية لتحويل الملفات إلى ملخصات واختبارات.' : 'Your intelligent platform to transform files into summaries and quizzes.',
    login: isRTL ? 'تسجيل الدخول' : 'Sign In',
    register: isRTL ? 'إنشاء حساب' : 'Create Account',
    guest: isRTL ? 'دخول كضيف' : 'Continue as Guest',
    name: isRTL ? 'الاسم' : 'Name',
    email: isRTL ? 'البريد الإلكتروني' : 'Email Address',
    password: isRTL ? 'كلمة المرور' : 'Password',
    noAccount: isRTL ? 'ليس لديك حساب؟' : "Don't have an account?",
    hasAccount: isRTL ? 'لديك حساب بالفعل؟' : "Already have an account?",
    guestNote: isRTL ? 'تنبيه: للضيوف عدد محدود من الملخصات والأسئلة.' : 'Note: Guests have limited summaries and questions.',
    switchLang: isRTL ? 'English' : 'العربية',
    fillAll: isRTL ? 'يرجى ملء جميع الحقول' : 'Please fill all fields'
  };

  return (
    <div className={`min-h-screen bg-slate-50 flex items-center justify-center p-4 ${isRTL ? 'font-[Noto_Sans_Arabic]' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="absolute top-6 right-6 z-10">
         <button 
           onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
           className="px-4 py-2 bg-white rounded-full shadow-sm text-slate-600 font-bold hover:bg-slate-50 transition-colors"
         >
           {t.switchLang}
         </button>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-4xl flex flex-col md:flex-row min-h-[600px]">
        
        {/* Left Side (Hero) */}
        <div className="md:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 p-12 text-white flex flex-col justify-between relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <Brain size={400} className="absolute -right-20 -bottom-20 rotate-12" />
           </div>
           
           <div className="relative z-10">
             <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8">
               <Brain size={40} className="text-white" />
             </div>
             <h1 className="text-4xl font-bold mb-4 leading-tight">{t.welcome}</h1>
             <p className="text-indigo-100 text-lg leading-relaxed opacity-90">{t.desc}</p>
           </div>

           <div className="relative z-10 mt-12 md:mt-0">
             <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                <p className="text-sm font-medium flex items-center gap-2">
                   <Lock size={16} />
                   {t.guestNote}
                </p>
             </div>
           </div>
        </div>

        {/* Right Side (Form) */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white">
            <div className="mb-8 text-center">
               <h2 className="text-2xl font-bold text-slate-800 mb-2">
                 {mode === 'login' ? t.login : t.register}
               </h2>
            </div>

            {error && (
               <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 text-sm font-bold">
                 <AlertCircle size={18} />
                 {error}
               </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
               {mode === 'register' && (
                 <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600">{t.name}</label>
                    <div className="relative">
                        <User className={`absolute top-3.5 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} size={20} />
                        <input 
                          type="text" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-3 text-slate-800 font-medium focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all ${isRTL ? 'pr-12' : 'pl-12'}`}
                          required
                        />
                    </div>
                 </div>
               )}

               <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">{t.email}</label>
                  <div className="relative">
                      <Mail className={`absolute top-3.5 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} size={20} />
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-3 text-slate-800 font-medium focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all ${isRTL ? 'pr-12' : 'pl-12'}`}
                        required
                      />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">{t.password}</label>
                  <div className="relative">
                      <Lock className={`absolute top-3.5 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} size={20} />
                      <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-3 text-slate-800 font-medium focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all ${isRTL ? 'pr-12' : 'pl-12'}`}
                        required
                      />
                  </div>
               </div>

               <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2">
                  {mode === 'login' ? <LogIn size={20} /> : <UserPlus size={20} />}
                  {mode === 'login' ? t.login : t.register}
               </button>
            </form>

            <div className="mt-6 text-center">
              <button 
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setName('');
                  setEmail('');
                  setPassword('');
                }}
                className="text-indigo-600 font-bold hover:text-indigo-800 text-sm"
              >
                 {mode === 'login' ? t.noAccount : t.hasAccount} {mode === 'login' ? t.register : t.login}
              </button>
            </div>

            <div className="relative my-8">
               <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
               <div className="relative flex justify-center"><span className="bg-white px-4 text-sm text-slate-400 font-bold">OR</span></div>
            </div>

            <button 
               onClick={onGuest}
               className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-600 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
               {t.guest}
               {isRTL ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
            </button>
        </div>
      </div>
    </div>
  );
};

export default AuthView;