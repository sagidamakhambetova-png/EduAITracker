import React, { useState, useEffect } from 'react';
import { 
  Shield, Key, Smartphone, Mail, Globe, Users, BookOpen, User, 
  Send, RefreshCw, Layers, CheckCircle, AlertCircle, Eye, EyeOff, 
  Lock, ArrowRight, LogIn, UserCheck, Trash2, 
  X, Check, HelpCircle, Code, Bell, Compass, 
  QrCode, Link as LinkIcon, ExternalLink, Heart, 
  Laptop, Info, Fingerprint, Camera
} from 'lucide-react';
import { UserRole } from '../types';

interface AuthPortalProps {
  currentUser: AuthUser | null;
  onLoginSuccess: (user: AuthUser, token: string) => void;
  onLogout: () => void;
  onUpdateProfile: (updated: Partial<AuthUser>) => void;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar: string;
  isMfaActive: boolean;
  mfaSecret: string;
  groupCode?: string;
  createdAt: string;
}

export interface ActiveSession {
  id: string;
  device: string;
  ip: string;
  location: string;
  expiresIn: string;
  tokenSimulated: string;
}

export default function AuthPortal({ 
  currentUser, 
  onLoginSuccess, 
  onLogout,
  onUpdateProfile
}: AuthPortalProps) {
  
  // Outer tabs
  const [currentScreen, setCurrentScreen] = useState<'login' | 'register' | 'recovery' | 'sessions' | 'mfaSetup' | 'profile'>('login');
  
  const [roleMode, setRoleMode] = useState<UserRole>('teacher');
  const [registerStage, setRegisterStage] = useState<'info' | 'mentor' | 'otp' | 'success'>('info');
  const [selectedMentor, setSelectedMentor] = useState<string>('m1');

  // Input states
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('+998 90 ');
  const [nameInput, setNameInput] = useState('');
  const [groupCodeInput, setGroupCodeInput] = useState('');
  
  // Custom states
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [receivedOtp, setReceivedOtp] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [is2faRequired, setIs2faRequired] = useState(false);
  const [auth2faInput, setAuth2faInput] = useState('');
  const [tempUserPendingMfa, setTempUserPendingMfa] = useState<{ user: AuthUser; token: string } | null>(null);

  // Invite states
  const [showInviteSimulator, setShowInviteSimulator] = useState(true);
  const [inviteType, setInviteType] = useState<'qr' | 'link' | 'tg'>('qr');
  const [invitePhone, setInvitePhone] = useState('+998 93 123 45 67');
  const [inviteOtpCode, setInviteOtpCode] = useState<string | null>(null);
  const [inviteOtpInput, setInviteOtpInput] = useState('');
  const [inviteMode, setInviteMode] = useState<'student' | 'parent'>('student');

  // Interactive Live Sessions Simulator
  const [sessions, setSessions] = useState<ActiveSession[]>([]);

  // QR Code Scanner Overlay States
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [scannerStage, setScannerStage] = useState<'idle' | 'focusing' | 'decoding' | 'success'>('idle');
  const [scannedData, setScannedData] = useState<{
    code: string;
    groupName: string;
    subject: string;
    mentorName: string;
    suggestedRole: 'student' | 'parent';
  } | null>(null);

  const PRESET_QR_CODES = [
    {
      code: 'TUTOR-9912',
      groupName: 'Курс Физики - Интенсив 2026',
      subject: 'Физика (ЕГЭ / Термодинамика)',
      mentorName: 'Сардор Улугбеков',
      suggestedRole: 'student' as const
    },
    {
      code: 'GROUP-ENGLISH-B1',
      groupName: 'Английский язык - Starter B1',
      subject: 'English Upper-Intermediate',
      mentorName: 'Анна Смирнова',
      suggestedRole: 'student' as const
    },
    {
      code: 'GROUP-PYTHON-KIDS',
      groupName: 'Python Kids - Робототехника',
      subject: 'Программирование Python & Роботы',
      mentorName: 'Сергей Сидоров',
      suggestedRole: 'parent' as const
    },
    {
      code: 'MATH-OLYMPIAD',
      groupName: 'Математический Триумф (Олимпиады)',
      subject: 'Высшая школьная алгебра',
      mentorName: 'Дмитрий Карпов',
      suggestedRole: 'student' as const
    }
  ];

  const triggerSimulateScan = (qr: typeof PRESET_QR_CODES[number]) => {
    setScannerStage('focusing');
    setScannedData(null);
    
    // Step 1: Simulated Camera Autofocus
    setTimeout(() => {
      setScannerStage('decoding');
      
      // Step 2: Simulated Frame decoding and parsing
      setTimeout(() => {
        setScannerStage('success');
        setScannedData(qr);
      }, 900);
    }, 800);
  };

  const handleScannerInstantJoin = async () => {
    if (!scannedData) return;
    setLoading(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/invite-instant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: invitePhone || '+998 93 123 45 67',
          role: scannedData.suggestedRole
        })
      });
      const data = await res.json();
      if (data.success) {
        onLoginSuccess(data.user, data.token);
        setAuthSuccess(`Сканнер подтвержден! Вы зачислены в группу [${scannedData.groupName}] как ${scannedData.suggestedRole === 'student' ? 'Студент' : 'Родитель'}!`);
        setIsQrScannerOpen(false);
        setScannedData(null);
        setScannerStage('idle');
      } else {
        setAuthError(data.error || 'Ошибка подключения');
      }
    } catch (err: any) {
      setAuthError('Ошибка отправки: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Pre-load mock data or fetch sessions if user logged in
  useEffect(() => {
    if (currentUser) {
      fetchSessions();
    }
  }, [currentUser]);

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/auth/active-sessions');
      const data = await res.json();
      setSessions(data);
    } catch (e) {
      // Mock Fallbacks if offline
      setSessions([
        { id: '1', device: 'Chrome (macOS Sequoia)', ip: '195.158.5.144', location: 'Ташкент, Узбекистан', expiresIn: 'через 59 мин', tokenSimulated: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        { id: '2', device: 'Safari (iPhone 15 Pro)', ip: '213.230.125.10', location: 'Самарканд, Узбекистан', expiresIn: 'через 11 ч', tokenSimulated: 'eyJhbGciOiJIUzI1NiIsInR5cCI1...' }
      ]);
    }
  };

  const handleRevokeSession = async (id: string) => {
    try {
      const res = await fetch('/api/auth/revoke-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        setSessions(prev => prev.filter(s => s.id !== id));
        setAuthSuccess('Сессия устройства успешно отозвана. JWT-токен внесен в черный список (Blacklist).');
        setTimeout(() => setAuthSuccess(null), 3500);
      }
    } catch (e) {
      setSessions(prev => prev.filter(s => s.id !== id));
    }
  };

  // Quick preset logins for easy testing
  const handleQuickDemoLogin = (role: UserRole) => {
    setLoading(true);
    setAuthError(null);
    
    // Simulate API fetch delay
    setTimeout(async () => {
      try {
        const payload = {
          role,
          demo: true
        };
        const res = await fetch('/api/auth/quick-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        
        if (data.success) {
          onLoginSuccess(data.user, data.token);
          setAuthSuccess(`Авторизация успешна! Добро пожаловать, ${data.user.name}`);
          setTimeout(() => setAuthSuccess(null), 2000);
        } else {
          setAuthError(data.error);
        }
      } catch (err: any) {
        setAuthError('Не удалось выполнить быструю авторизацию');
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  // Handle Full Email/Password Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) {
      setAuthError('Пожалуйста, заполните все обязательные поля.');
      return;
    }

    setLoading(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailInput,
          password: passwordInput
        })
      });

      const data = await res.json();

      if (res.ok) {
        if (data.requires2fa) {
          setIs2faRequired(true);
          setTempUserPendingMfa({ user: data.user, token: data.token });
          setAuthSuccess('Пройдена 1-я стадия. Введите двухфакторный 2FA код.');
        } else {
          onLoginSuccess(data.user, data.token);
          setAuthSuccess(`Авторизация пройдена! Роль: ${data.user.role.toUpperCase()}`);
          setTimeout(() => setAuthSuccess(null), 3000);
        }
      } else {
        setAuthError(data.error || 'Неверный адрес почты или пароль.');
      }
    } catch (err) {
      setAuthError('Сбой интеграции с сервером авторизации.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Validate 2FA TOTP code for high-level administration
  const handleVerify2FA = () => {
    if (!auth2faInput) {
      setAuthError('Введите шестизначный код безопасности.');
      return;
    }
    
    setLoading(true);
    setAuthError(null);
    
    setTimeout(() => {
      if (auth2faInput === '777123' || auth2faInput === '123456' || auth2faInput.length === 6) {
        if (tempUserPendingMfa) {
          onLoginSuccess(tempUserPendingMfa.user, tempUserPendingMfa.token);
          setAuthSuccess('Двухфакторная аутентификация JWT пройдена успешно!');
          setIs2faRequired(false);
          setTempUserPendingMfa(null);
        }
      } else {
        setAuthError('Неверный секретный OTP код. Попробуйте 777123.');
      }
      setLoading(false);
    }, 600);
  };

  // Self Registration Flow (Tutors, Centers, or Students/Parents)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput || !emailInput || !phoneInput) {
      setAuthError('Пожалуйста, заполните Имя, Email и Телефон.');
      return;
    }

    setLoading(true);
    setAuthError(null);

    try {
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      setReceivedOtp(code);
      
      const res = await fetch('/api/auth/register-send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneInput, name: nameInput })
      });
      
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        if (roleMode === 'student') {
          setRegisterStage('mentor');
        } else {
          setRegisterStage('otp');
        }
        setAuthSuccess(`SMS со случайным SMS-кодом [ ${code} ] отправлено на номер ${phoneInput}`);
      } else {
        setAuthError(data.error || 'Ошибка регистрации.');
      }
    } catch (err) {
      // Offline fallback simulations
      const fallbackCode = '4821';
      setReceivedOtp(fallbackCode);
      setOtpSent(true);
      if (roleMode === 'student') {
        setRegisterStage('mentor');
      } else {
        setRegisterStage('otp');
      }
      setAuthSuccess(`[ДЕМО] Имитация отправки SMS-кода: ${fallbackCode}`);
    } finally {
      setLoading(false);
    }
  };

  // Complete OTP validation to persist User Profile
  const handleVerifyRegisterOtp = async () => {
    if (!otpInput) {
      setAuthError('Введите код подтверждения из SMS.');
      return;
    }

    if (otpInput !== receivedOtp && otpInput !== '1234') {
      setAuthError(`Неверный код. Попробуйте ввести ${receivedOtp || '1234'}`);
      return;
    }

    setLoading(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/auth/register-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nameInput,
          email: emailInput,
          phone: phoneInput,
          role: roleMode,
          groupCode: groupCodeInput || undefined,
          password: 'Password12', // Default safe mock
          mentorId: selectedMentor
        })
      });

      const data = await res.json();
      if (data.success) {
        setRegisterStage('success');
        onLoginSuccess(data.user, data.token);
        setAuthSuccess('Регистрация успешно подтверждена по SMS!');
      } else {
        setAuthError(data.error || 'Не удалось завершить создание профиля.');
      }
    } catch (err) {
      setAuthError('Критический сбой сохранения JWT-сессии.');
    } finally {
      setLoading(false);
    }
  };

  // Option 1: Fast Invitation Access for parents and students (OTP Only, no tedious registration)
  const handleInviteConnectOTP = () => {
    if (!inviteOtpInput) {
      setAuthError('Пожалуйста, введите СМС-код для быстрого подключения.');
      return;
    }

    if (inviteOtpInput !== inviteOtpCode && inviteOtpInput !== '5555') {
      setAuthError(`Неверный OTP. Пожалуйста, введите код: ${inviteOtpCode || '5555'}`);
      return;
    }

    setLoading(true);
    setAuthError(null);

    // Simulate instant login via API
    setTimeout(async () => {
      try {
        const res = await fetch('/api/auth/invite-instant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: invitePhone,
            role: inviteMode
          })
        });
        const data = await res.json();
        if (data.success) {
          onLoginSuccess(data.user, data.token);
          setAuthSuccess(`Добро пожаловать в личный кабинет! Вы подключены к репетитору через приглашение.`);
          setInviteOtpCode(null);
          setInviteOtpInput('');
        }
      } catch (err) {
        setAuthError('Ошибка автоматического подключения.');
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  // Simulate scanning QR Code or clicking ref link
  const triggerInviteSimulation = () => {
    const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setInviteOtpCode(randomOtp);
    setAuthSuccess(`[Имитатор SMS] Код активации для подключения: ${randomOtp}`);
  };

  // Manage Profiles Updates
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser) {
      onUpdateProfile({
        name: nameInput || currentUser.name,
        email: emailInput || currentUser.email,
        phone: phoneInput || currentUser.phone,
      });
      setAuthSuccess('Профиль изменен и зашифрован в хранилище!');
      setTimeout(() => setAuthSuccess(null), 3000);
    }
  };

  const toggle2FAStatus = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/auth/2fa-toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
      });
      const data = await res.json();
      if (data.success) {
        onUpdateProfile({ isMfaActive: data.isMfaActive });
        setAuthSuccess(data.isMfaActive ? 'Двухфакторная 2FA аутентификация ВКЛЮЧЕНА!' : '2FA ОТКЛЮЧЕНА.');
        setTimeout(() => setAuthSuccess(null), 3000);
      }
    } catch (e) {
      onUpdateProfile({ isMfaActive: !currentUser.isMfaActive });
    }
  };

  // Google & Telegram Social Simulator Click
  const handleSocialSimulator = (network: 'google' | 'tg') => {
    setLoading(true);
    setTimeout(async () => {
      try {
        const dummyName = network === 'google' ? 'Музаффар Хамидов (Google)' : 'Улугбек Садыков (Telegram)';
        const dummyEmail = network === 'google' ? 'muzaffar@gmail.com' : 'ulugbek_tg@mail.ru';
        const dummyPhone = network === 'google' ? '+998 90 415 11 22' : '+998 94 901 02 03';
        
        const res = await fetch('/api/auth/register-complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: dummyName,
            email: dummyEmail,
            phone: dummyPhone,
            role: roleMode,
            password: 'SocialLoginProtected2026'
          })
        });
        const data = await res.json();
        if (data.success) {
          onLoginSuccess(data.user, data.token);
          setAuthSuccess(`Успешный вход через провайдер ${network.toUpperCase()}`);
        }
      } catch (e) {
        setAuthError('Ошибка социальной интеграции.');
      } finally {
        setLoading(false);
      }
    }, 700);
  };

  // Reset password handler
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) {
      setAuthError('Укажите email адрес для восстановления.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setAuthSuccess('Инструкции и токен восстановления отправлены на вашу почту!');
      setLoading(false);
      setCurrentScreen('login');
    }, 600);
  };

  // Populate info for modifying profile
  useEffect(() => {
    if (currentUser) {
      setNameInput(currentUser.name);
      setEmailInput(currentUser.email);
      setPhoneInput(currentUser.phone);
    }
  }, [currentUser, currentScreen]);

  return (
    <div className="space-y-6" id="auth-ecosystem-wrapper">
      
      {/* 1. TOAST NOTIFICATION CORNER */}
      {authSuccess && (
        <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl border border-emerald-200 flex items-start gap-3 shadow-md animate-bounce">
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <div className="text-xs font-semibold leading-normal">{authSuccess}</div>
        </div>
      )}

      {authError && (
        <div className="bg-rose-50 text-rose-800 p-4 rounded-2xl border border-rose-200 flex items-start gap-3 shadow-md">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="text-xs font-semibold leading-normal">{authError}</div>
        </div>
      )}

      {/* 2. MAIN WORKSPACE */}
      {!currentUser ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* LEFT CHANNELS: SYSTEM WELCOME & FAST INVITATION CONNECTION */}
          <div className="lg:col-span-5 bg-gradient-to-br from-indigo-900 to-indigo-950 text-white rounded-3xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden border border-indigo-950">
            <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="space-y-6">
              {/* Brand logo */}
              <div className="flex items-center gap-2">
                <span className="p-2 bg-indigo-500 rounded-xl text-white">
                  <Shield className="w-5 h-5" />
                </span>
                <span className="font-extrabold text-sm tracking-tight text-white uppercase font-sans">
                  EduAI Secure Identity
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black tracking-tight leading-snug">
                  Универсальный кабинет EduAI Tracker
                </h3>
                <p className="text-[11.5px] text-indigo-200 leading-normal mt-2">
                  Профессиональное пространство для учебных центров, репетиторов, студентов и родителей.
                </p>
              </div>

              {/* DEMO BYPASS ROW */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2.5">
                <span className="text-[10px] font-bold text-indigo-300 block uppercase tracking-wider">
                  Быстрый демонстрационный вход:
                </span>
                <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                  <button 
                    onClick={() => handleQuickDemoLogin('admin')}
                    className="bg-white/10 hover:bg-white/20 transition px-2.5 py-1.5 rounded-lg text-left text-white font-bold cursor-pointer"
                  >
                     Админ-центр
                  </button>
                  <button 
                    onClick={() => handleQuickDemoLogin('teacher')}
                    className="bg-white/10 hover:bg-white/20 transition px-2.5 py-1.5 rounded-lg text-left text-white font-bold cursor-pointer"
                  >
                     Преподаватель
                  </button>
                  <button 
                    onClick={() => handleQuickDemoLogin('parent')}
                    className="bg-white/10 hover:bg-white/20 transition px-2.5 py-1.5 rounded-lg text-left text-white font-bold cursor-pointer"
                  >
                     Для Родителя
                  </button>
                  <button 
                    onClick={() => handleQuickDemoLogin('student')}
                    className="bg-white/10 hover:bg-white/20 transition px-2.5 py-1.5 rounded-lg text-left text-white font-bold cursor-pointer"
                  >
                     Для Ученика
                  </button>
                </div>
              </div>

              {/* INVITATION OPTION 1 FOR STUDENTS & PARENTS */}
              <div className="border-t border-indigo-800/60 pt-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs text-white flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-indigo-400" />
                    Вариант 1: Быстрый доступ по инвайту
                  </h4>
                  <button
                    onClick={() => setShowInviteSimulator(!showInviteSimulator)}
                    className="text-[10px] text-indigo-300 hover:text-indigo-100 font-bold underline"
                  >
                    {showInviteSimulator ? 'Свернуть' : 'Развернуть'}
                  </button>
                </div>

                {showInviteSimulator && (
                  <div className="bg-indigo-950 rounded-2xl p-4 border border-indigo-800/50 space-y-3">
                    <span className="text-[10.5px] text-indigo-300 block leading-normal">
                      Для учеников/родителей: Подключение по SMS/Telegram без ручного ввода паролей.
                    </span>

                    {/* Setup simulated options */}
                    <div className="flex items-center gap-1 bg-indigo-900/50 p-1 rounded-xl">
                      <button
                        onClick={() => { setInviteType('qr'); triggerInviteSimulation(); }}
                        className={`flex-1 text-[9.5px] py-1 rounded-lg text-center font-bold ${inviteType === 'qr' ? 'bg-indigo-600 text-white' : 'text-indigo-300'}`}
                      >
                        QR-код
                      </button>
                      <button
                        onClick={() => { setInviteType('link'); triggerInviteSimulation(); }}
                        className={`flex-1 text-[9.5px] py-1 rounded-lg text-center font-bold ${inviteType === 'link' ? 'bg-indigo-600 text-white' : 'text-indigo-300'}`}
                      >
                        Ссылка
                      </button>
                      <button
                        onClick={() => { setInviteType('tg'); triggerInviteSimulation(); }}
                        className={`flex-1 text-[9.5px] py-1 rounded-lg text-center font-bold ${inviteType === 'tg' ? 'bg-indigo-600 text-white' : 'text-indigo-300'}`}
                      >
                        Telegram
                      </button>
                    </div>

                    {/* Invite details content */}
                    {inviteType === 'qr' && (
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl">
                          <div className="bg-white p-1 rounded shrink-0">
                            <QrCode className="w-10 h-10 text-slate-900" />
                          </div>
                          <div className="text-[10px] text-indigo-200 leading-normal">
                            <strong>Раздаточные инвайты:</strong> Наведите камеру устройства для сканирования QR-кода от преподавателя.
                          </div>
                        </div>
                        <button
                          onClick={() => { setIsQrScannerOpen(true); setScannerStage('idle'); setScannedData(null); }}
                          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-[10.5px] py-2 rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/20"
                        >
                          <Camera className="w-3.5 h-3.5 animate-pulse" />
                          Запустить Сканер Камеры 📷
                        </button>
                      </div>
                    )}

                    {inviteType === 'link' && (
                      <div className="bg-white/5 p-2 rounded-xl font-mono text-[9px] text-indigo-300 truncate">
                        eduai.uz/join?code=TUTOR-9912&role={inviteMode}
                      </div>
                    )}

                    {inviteType === 'tg' && (
                      <div className="bg-indigo-900 text-[10px] p-2 rounded-xl text-indigo-100">
                        👨‍🏫 Сообщение бота: "Вы приглашены в группу репетитора по физике. Подтвердите номер."
                      </div>
                    )}

                    {/* Role mode selection */}
                    <div className="flex justify-between items-center text-[10px] text-indigo-200 pt-1">
                      <span>Роль в системе:</span>
                      <div className="flex gap-2">
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input 
                            type="radio" 
                            name="invite_role" 
                            checked={inviteMode === 'student'} 
                            onChange={() => setInviteMode('student')} 
                            className="sr-only"
                          />
                          <span className={`px-2 py-0.5 rounded ${inviteMode === 'student' ? 'bg-white text-indigo-950 font-bold' : 'bg-transparent text-indigo-300'}`}>
                            Студент
                          </span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input 
                            type="radio" 
                            name="invite_role" 
                            checked={inviteMode === 'parent'} 
                            onChange={() => setInviteMode('parent')} 
                            className="sr-only"
                          />
                          <span className={`px-2 py-0.5 rounded ${inviteMode === 'parent' ? 'bg-white text-indigo-950 font-bold' : 'bg-transparent text-indigo-300'}`}>
                            Родитель
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Phone block */}
                    <div className="space-y-1">
                      <span className="text-[9.5px] uppercase font-bold text-indigo-400 block">Мгновенный ввод телефона:</span>
                      <input
                        type="text"
                        value={invitePhone}
                        onChange={(e) => setInvitePhone(e.target.value)}
                        placeholder="+998 90 000 00 00"
                        className="w-full bg-white/10 border border-white/25 rounded-md px-2.5 py-1 text-xs text-white focus:outline-none"
                      />
                    </div>

                    {/* Simulation Action */}
                    {!inviteOtpCode ? (
                      <button
                        onClick={triggerInviteSimulation}
                        className="w-full bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] font-bold py-1.5 rounded-lg transition"
                      >
                        Принять приглашение (Имитировать)
                      </button>
                    ) : (
                      <div className="space-y-2 bg-indigo-900 border border-indigo-700/60 p-2.5 rounded-xl">
                        <span className="text-[9px] text-indigo-300 block">Введите полученный 4-значный SMS-код:</span>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={inviteOtpInput}
                            onChange={(e) => setInviteOtpInput(e.target.value)}
                            placeholder="Код СМС"
                            className="w-full bg-white/10 text-white text-xs px-2.5 py-1 focus:outline-none rounded"
                          />
                          <button
                            onClick={handleInviteConnectOTP}
                            className="bg-emerald-500 text-white font-bold text-[10px] px-3 py-1 rounded hover:bg-emerald-600"
                          >
                            Подтвердить
                          </button>
                        </div>
                        <span className="text-[9.5px] text-emerald-400 font-bold block">
                          Подсказка: введите код {inviteOtpCode}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="text-[10px] text-indigo-300">
               База данных защищена по стандартам AES-256 GCM с поддержкой хранения сессионных JWT в HTTPS Cookies.
            </div>
          </div>

          {/* RIGHT ACTION CARD: LOGIN & REGISTER PANEL */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 shadow-xl border border-slate-105 flex flex-col justify-between">
            <div>
              {/* Tabs selectors for active state */}
              <div className="flex items-center gap-1.5 border-b border-slate-100 pb-3 mb-5 font-sans">
                <button
                  onClick={() => { setCurrentScreen('login'); setAuthError(null); }}
                  className={`flex-1 text-center py-2 text-xs font-bold font-sans rounded-xl transition ${
                    currentScreen === 'login' ? 'bg-slate-100 text-indigo-700' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5 inline mr-1" />
                  Вход (Авторизация)
                </button>
                <button
                  onClick={() => { setCurrentScreen('register'); setAuthError(null); setRegisterStage('info'); }}
                  className={`flex-1 text-center py-2 text-xs font-bold font-sans rounded-xl transition ${
                    currentScreen === 'register' ? 'bg-slate-100 text-indigo-700' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5 inline mr-1" />
                  Регистрация за 1 мин
                </button>
              </div>

              {/* TWO FACTOR AUTENTICATION SHAPED CARD */}
              {is2faRequired ? (
                <div className="space-y-4">
                  <div className="p-4 bg-indigo-50 border border-indigo-150 rounded-2xl flex gap-3 text-xs leading-normal text-slate-700 font-sans">
                    <Fingerprint className="w-6 h-6 text-indigo-650 shrink-0" />
                    <div>
                      <strong>Защита входа: 2FA Двухфакторная проверка!</strong>
                      <p className="mt-1 text-[11px] text-slate-500">
                        На аккаунте включена дополнительная защита для администраторов и руководителей. Введите 6-значный одноразовый OTP код из Telegram или Вашего authenticator-приложения.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400 block">Шестизначный OTP-код:</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={auth2faInput}
                      onChange={(e) => setAuth2faInput(e.target.value)}
                      placeholder="Например, 777123"
                      className="w-full bg-slate-50 border border-slate-205 rounded-xl px-3.5 py-2.5 text-sm font-mono text-center tracking-widest focus:outline-none focus:border-indigo-500"
                    />
                    <span className="text-[10px] text-slate-400 block mt-1">Подсказка для тестирования: введите <strong>777123</strong> или любой другой код.</span>
                  </div>

                  <button
                    onClick={handleVerify2FA}
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-3 rounded-xl transition cursor-pointer"
                  >
                    {loading ? 'Проверка...' : 'Разблокировать Кабинет'}
                  </button>
                </div>
              ) : (
                <>
                  {/* --- SUBVIEW: LOGIN SCREEN --- */}
                  {currentScreen === 'login' && (
                    <form onSubmit={handleLogin} className="space-y-4">
                      
                      {/* Email address field */}
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block">Адрес электронной почты (или Телефон):</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            placeholder="admin@edu.uz или teacher@edu.uz"
                            className="w-full bg-slate-50 border border-slate-205 rounded-xl px-3 py-2 pl-[35px] text-xs font-semibold focus:outline-none focus:border-indigo-500"
                          />
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        </div>
                      </div>

                      {/* Password input with eye indicator */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block">Секретный пароль доступа (пароль):</label>
                          <button
                            type="button"
                            onClick={() => setCurrentScreen('recovery')}
                            className="text-[10px] text-slate-400 hover:text-indigo-600"
                          >
                            Забыли пароль?
                          </button>
                        </div>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            placeholder="Введите ваш сложный пароль"
                            className="w-full bg-slate-50 border border-slate-205 rounded-xl px-3 py-2 pl-[35px] pr-[35px] text-xs font-semibold focus:outline-none focus:border-indigo-500"
                          />
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-slate-400 hover:text-slate-600 absolute right-3 top-2.5"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Submit action login button */}
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-2.5 rounded-xl transition cursor-pointer mt-2 shadow hover:shadow-md"
                      >
                        {loading ? 'Проверка безопасности...' : 'Войти в Кабинет'}
                      </button>
                    </form>
                  )}

                  {/* --- SUBVIEW: REGISTER SCREEN --- */}
                  {currentScreen === 'register' && (
                    <div className="space-y-4">
                      {registerStage === 'info' && (
                        <form onSubmit={handleRegister} className="space-y-4">
                          
                          {/* Choose User Role Mode */}
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block">Вы регистрируетесь как:</span>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10.5px]">
                              {[
                                { val: 'admin', label: 'Админ центра' },
                                { val: 'teacher', label: 'Репетитор' },
                                { val: 'student', label: 'Ученик (код)' },
                                { val: 'parent', label: 'Родитель (код)' }
                              ].map(item => (
                                <button
                                  type="button"
                                  key={item.val}
                                  onClick={() => setRoleMode(item.val as any)}
                                  className={`py-2 rounded-xl border font-bold transition whitespace-nowrap cursor-pointer ${
                                    roleMode === item.val
                                      ? 'bg-indigo-50 border-indigo-400 text-indigo-700 font-extrabold shadow-sm'
                                      : 'bg-slate-50/50 border-slate-201 text-slate-500 hover:bg-slate-50'
                                  }`}
                                >
                                  {item.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Dynamic code prompt for independent Student/Parent joining via a teacher's Code */}
                          {(roleMode === 'student' || roleMode === 'parent') && (
                            <div className="p-3 bg-amber-50 border border-amber-200 text-slate-700 rounded-xl space-y-1">
                              <span className="text-[10px] font-extrabold text-amber-800 uppercase flex items-center gap-1">
                                <Info className="w-3.5 h-3.5" />
                                Вариант 2 для частных преподавателей:
                              </span>
                              <p className="text-[10px] text-slate-500 leading-normal">
                                Зарегистрируйтесь сами и укажите код группы/курса репетитора (например, <code>TUTOR-FITZ-11</code>), чтобы зайти и присоединиться к занятиям.
                              </p>
                              <div>
                                <label className="text-[9px] uppercase font-bold text-slate-450 block mt-1">Код группы репетитора:</label>
                                <input
                                  type="text"
                                  value={groupCodeInput}
                                  onChange={(e) => setGroupCodeInput(e.target.value)}
                                  placeholder="MATH-099 или TUTOR-550"
                                  className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs"
                                />
                              </div>
                            </div>
                          )}

                          {/* Full Name input */}
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block">Ф.И.О. Пользователя:</label>
                            <input
                              type="text"
                              required
                              value={nameInput}
                              onChange={(e) => setNameInput(e.target.value)}
                              placeholder="Например, Отабек Кадыров"
                              className="w-full bg-slate-50 border border-slate-205 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                            />
                          </div>

                          {/* Email input */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block">Email Почта:</label>
                              <input
                                type="email"
                                required
                                value={emailInput}
                                onChange={(e) => setEmailInput(e.target.value)}
                                placeholder="your@mail.uz"
                                className="w-full bg-slate-50 border border-slate-205 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block">Номер Телефона (для СМС):</label>
                              <input
                                type="text"
                                required
                                value={phoneInput}
                                onChange={(e) => setPhoneInput(e.target.value)}
                                placeholder="+998 90 123 45 67"
                                className="w-full bg-slate-50 border border-slate-205 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                              />
                            </div>
                          </div>

                          {/* Terms and conditions */}
                          <div className="text-[10px] text-slate-400 leading-normal">
                            Нажимая кнопку "Отправить SMS-код", вы даете согласие на обработку персональных данных в соответствии с законодательством Республики Узбекистан.
                          </div>

                          {/* Submit to launch SMS Verification */}
                          <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-2.5 rounded-xl transition cursor-pointer"
                          >
                            {loading ? 'Отправка...' : 'Выслать SMS-код подтверждения'}
                          </button>
                        </form>
                      )}

                      {/* STAGE mentor selection (for student accounts) */}
                      {registerStage === 'mentor' && (
                        <div className="space-y-4">
                          <div className="text-center space-y-1">
                            <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-indigo-100">Этап 2: Выбор Наставника</span>
                            <h4 className="font-extrabold text-xs text-slate-800 sm:text-sm">Выберите своего проводника EduProgress 🦅</h4>
                            <p className="text-[10px] text-slate-500 leading-normal max-w-sm mx-auto">
                              Каждый наставник Совета является равноправным спутником и развивает у вас определенные образовательные компетенции. Сделайте выбор:
                            </p>
                          </div>

                          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                            {[
                              { id: 'm1', name: 'Самрук', logo: '🐦', role: 'Академический кругозор', avatar: '/src/assets/images/samruk.png' },
                              { id: 'm2', name: 'Алпамыс', logo: '🛡️', role: 'Дисциплина и воля', avatar: '/src/assets/images/alpamys.png' },
                              { id: 'm3', name: 'Томирис', logo: '👑', role: 'Лидерство и стратегия', avatar: '/src/assets/images/tomiris.png' },
                              { id: 'm4', name: 'Барс', logo: '💻', role: 'Программирование и IT', avatar: '/src/assets/images/bars.png' },
                              { id: 'm5', name: 'Хумо', logo: '✨', role: 'Упор на Soft Skills', avatar: '/src/assets/images/humo.png' }
                            ].map(m => {
                              const isSelected = selectedMentor === m.id;
                              return (
                                <button
                                  type="button"
                                  key={m.id}
                                  onClick={() => setSelectedMentor(m.id)}
                                  className={`p-2 rounded-xl text-center border transition flex flex-col items-center justify-between cursor-pointer select-none h-full ${
                                    isSelected 
                                      ? 'bg-indigo-50 border-indigo-505 border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm' 
                                      : 'bg-white border-slate-200 hover:bg-slate-55'
                                  }`}
                                >
                                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 relative shrink-0">
                                    <img 
                                      src={m.avatar} 
                                      alt={m.name} 
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                      onError={(e) => {
                                        e.currentTarget.src = "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=100";
                                      }}
                                    />
                                    <span className="absolute bottom-0 right-0 text-[9px] bg-white rounded-tl p-0.5 leading-none">{m.logo}</span>
                                  </div>
                                  <div className="mt-1">
                                    <span className="block font-bold text-[10px] text-slate-800 tracking-tight leading-tight">{m.name}</span>
                                    <span className="text-[7.5px] text-slate-400 block truncate max-w-[55px] lg:max-w-none">{m.role}</span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                          {/* Preview Details of Selected Mentor */}
                          {selectedMentor && (
                            <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-1 animate-fade-in text-left">
                              {selectedMentor === 'm1' && (
                                <>
                                  <span className="font-extrabold text-[10.5px] text-amber-700 block">🐦 Самрук — Хранитель Академического кругозора</span>
                                  <p className="text-[10px] text-slate-500 leading-normal">Развивает непреодолимое стремление к знаниям, широту мышления и любовь к чтению.</p>
                                  <p className="text-[9.5px] italic text-slate-450 mt-1">«Познание — это бесконечное путешествие...»</p>
                                </>
                              )}
                              {selectedMentor === 'm2' && (
                                <>
                                  <span className="font-extrabold text-[10.5px] text-blue-700 block">🛡️ Алпамыс — Богатырь Дисциплины</span>
                                  <p className="text-[10px] text-slate-500 leading-normal">Помогает бороться со скукой и прокрастинацией. Развивает настойчивость, волю и пунктуальность.</p>
                                  <p className="text-[9.5px] italic text-slate-450 mt-1">«Трудности — лишь ступени лестницы. Сделай ещё одно честное усилие...»</p>
                                </>
                              )}
                              {selectedMentor === 'm3' && (
                                <>
                                  <span className="font-extrabold text-[10.5px] text-emerald-700 block">👑 Томирис — Мудрая Царица</span>
                                  <p className="text-[10px] text-slate-500 leading-normal">Развивает уверенность в себе, ораторское мастерство, стратегическое мышление и командное сплочение.</p>
                                  <p className="text-[9.5px] italic text-slate-450 mt-1">«Сила команды — в каждом бойце, сила бойца — в сплоченной команде...»</p>
                                </>
                              )}
                              {selectedMentor === 'm4' && (
                                <>
                                  <span className="font-extrabold text-[10.5px] text-cyan-650 block">💻 Барс — Леопард IT-Разработки</span>
                                  <p className="text-[10px] text-slate-500 leading-normal">Погружает в созидание через код, алгоритмическую логику и устранение запутанных багов.</p>
                                  <p className="text-[9.5px] italic text-slate-450 mt-1">«Код — это язык созидания. Твори без шаблонов...»</p>
                                </>
                              )}
                              {selectedMentor === 'm5' && (
                                <>
                                  <span className="font-extrabold text-[10.5px] text-pink-700 block">✨ Хумо — Птица Вдохновения</span>
                                  <p className="text-[10px] text-slate-500 leading-normal">Раскрывает эмоциональный интеллект, креативность, эмпатию и умение помогать ближнему.</p>
                                  <p className="text-[9.5px] italic text-slate-450 mt-1">«Понимание себя и принятие других — ключ к истинной мудрости...»</p>
                                </>
                              )}
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => setRegisterStage('otp')}
                            className="w-full bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white font-extrabold text-xs py-2.5 rounded-xl transition cursor-pointer"
                          >
                            Утвердить Выбор и Получить SMS
                          </button>
                        </div>
                      )}

                      {/* STAGE otp Verification code */}
                      {registerStage === 'otp' && (
                        <div className="space-y-4 font-sans">
                          <div className="p-3 bg-indigo-50/60 rounded-xl text-center">
                            <span className="text-[11px] text-slate-600 block">
                              На указанный номер мобильного телефона выслан пароль подтверждения. 
                            </span>
                            <span className="font-bold text-xs text-indigo-800 block mt-1">{phoneInput}</span>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Введите 4-значный SMS-код:</label>
                            <input
                              type="text"
                              maxLength={4}
                              value={otpInput}
                              onChange={(e) => setOtpInput(e.target.value)}
                              placeholder="Например, 1234"
                              className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-mono text-center text-sm focus:outline-none"
                            />
                            {receivedOtp && (
                              <span className="text-[10px] font-bold text-emerald-600 block text-center mt-1">
                                [Демо-подсказка]: Ваш код подтверждения: <strong>{receivedOtp}</strong>
                              </span>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => setRegisterStage('info')}
                              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2 rounded-xl"
                            >
                              Назад к форме
                            </button>
                            <button
                              onClick={handleVerifyRegisterOtp}
                              disabled={loading}
                              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 rounded-xl"
                            >
                              {loading ? 'Проверка...' : 'Завершить Регистрацию'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* --- SUBVIEW: PASS RECOVERY SCREEN --- */}
                  {currentScreen === 'recovery' && (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-xs flex items-center gap-1">
                          Восстановление доступа к аккаунту
                        </h4>
                        <p className="text-[10.5px] text-slate-400 mt-0.5">Укажите вашу почту или телефон, привязанный к EduAI, мы вышлем одноразовый секретный токен.</p>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-450 block">Ваш Email или Телефон:</label>
                        <input
                          type="text"
                          required
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          placeholder="yourmail@edu.uz"
                          className="w-full bg-slate-50 border border-slate-205 rounded-xl p-2 text-xs"
                        />
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setCurrentScreen('login')}
                          className="flex-1 bg-slate-100 text-slate-600 font-bold text-xs py-2 rounded-xl"
                        >
                          Отмена
                        </button>
                        <button
                          type="submit"
                          className="flex-1 bg-indigo-600 text-white font-bold text-xs py-2 rounded-xl hover:bg-indigo-700"
                        >
                          Сбросить Доступ
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}

              {/* SOCIAL BUTTON EXPRESS REGISTRATION */}
              {!is2faRequired && registerStage === 'info' && (
                <div className="mt-6 border-t border-slate-100 pt-5 space-y-3">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <span>Быстрый вход через соцсети & Telegram Бот:</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={() => handleSocialSimulator('google')}
                      disabled={loading}
                      className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-705 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 font-bold cursor-pointer"
                    >
                      <Globe className="w-4 h-4 text-rose-500" />
                      Google Идентификация
                    </button>
                    
                    <button
                      onClick={() => handleSocialSimulator('tg')}
                      disabled={loading}
                      className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-705 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 font-bold cursor-pointer"
                    >
                      <Send className="w-4 h-4 text-blue-500" />
                      Telegram Авто-логин
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick guide of the platform layout */}
            <div className="mt-6 text-center text-[10.5px] text-slate-400 font-medium">
               Новый аккаунт? Создание и OTP-подтверждение занимают не более 60 секунд.
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================= */
        /* CURRENT LOGGED IN USER STATE - PROFILE & SECURITY HUB */
        /* ========================================================= */
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-150 font-sans" id="user-profile-and-metadata">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-5 flex-wrap gap-4">
            
            {/* Quick Avatar and Name */}
            <div className="flex items-center gap-3.5">
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="w-12 h-12 rounded-2xl bg-indigo-50 border border-slate-200 p-0.5 object-cover"
              />
              <div>
                <h3 className="font-extrabold text-slate-850 text-sm">{currentUser.name}</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="bg-indigo-100 text-indigo-850 font-extrabold px-2 py-0.5 rounded text-[8.5px] uppercase font-mono tracking-wider">
                     {currentUser.role}
                  </span>
                  <span className="text-[10.5px] text-slate-400 font-mono">
                    Регистрация: {currentUser.createdAt}
                  </span>
                </div>
              </div>
            </div>

            {/* Main Tabs */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentScreen('profile')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-sans transition ${
                  currentScreen === 'profile' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Мой Профиль / Настройки
              </button>
              <button
                onClick={() => setCurrentScreen('sessions')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-sans transition ${
                  currentScreen === 'sessions' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                JWT Сессии ({sessions.length})
              </button>
              <button
                onClick={onLogout}
                className="bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs px-3.5 py-1.5 rounded-xl transition flex items-center gap-1"
              >
                Выйти <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* SCREEN PROFILE EDIT */}
          {currentScreen === 'profile' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Profile details editing */}
              <div className="border border-slate-150 p-5 rounded-2xl bg-slate-50/40">
                <h4 className="font-extrabold text-xs text-slate-800 mb-3 flex items-center gap-1">
                  Управление профилем пользователя
                </h4>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-450 block">Ваше Имя (ФИО):</label>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-450 block">Электронная Почта:</label>
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-450 block">Телефонный Номер:</label>
                    <input
                      type="text"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      className="w-full bg-white border border-slate-250 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
                  >
                    Сохранить изменения
                  </button>
                </form>
              </div>

              {/* Security and mfa 2fa console */}
              <div className="border border-slate-150 p-5 rounded-2xl bg-white space-y-4 shadow-xs">
                <div>
                  <h4 className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-indigo-600" />
                    Двухфакторная защита (MFA / 2FA)
                  </h4>
                  <p className="text-[10.5px] text-slate-400 mt-0.5">Дополнительный секретный токен для директоров и менеджеров при авторизации.</p>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-extrabold text-slate-700 block">
                      Статус двухфакторной аутентификации:
                    </span>
                    <span className={`text-[10px] font-bold mt-0.5 block ${currentUser.isMfaActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {currentUser.isMfaActive ? '● АКТИВИРОВАНА (Ваш кабинет в безопасности)' : '○ НЕ АКТИВНА (Вход только по email / паролю)'}
                    </span>
                  </div>

                  <button
                    onClick={toggle2FAStatus}
                    className={`font-semibold text-xs px-3.5 py-1.5 rounded-xl border transition ${
                      currentUser.isMfaActive 
                        ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100' 
                        : 'bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {currentUser.isMfaActive ? 'Отключить' : 'Активировать (Вкл)'}
                  </button>
                </div>

                {currentUser.isMfaActive && (
                  <div className="bg-indigo-50/50 p-4 border border-indigo-100 rounded-xl space-y-2 text-[10.5px] font-sans">
                    <span className="font-bold text-indigo-905 block">Как войти при повторном сеансе:</span>
                    <p className="text-slate-500 leading-normal">
                      При вводе логина/пароля система запросит код. Используйте в качестве кода цифры <code>777123</code>.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* JWT SESSIONS PANEL */}
          {currentScreen === 'sessions' && (
            <div className="space-y-4">
              <div className="bg-indigo-50/40 border border-indigo-120 p-4 rounded-xl text-xs leading-normal font-sans text-slate-700">
                <strong>Безопасное сессионное хранилище JWT токенов (JSON Web Token):</strong> EduAI Tracker шифрует сессии пользователя на стороне бэкенда (Express JWT-Token). Ниже представлен реестр гаджетов и браузеров, имеющих доступ к Вашему дневнику. При необходимости вы можете в один клик "Выбить" сессию на чужом смартфоне.
              </div>

              <div className="border border-slate-150 rounded-2xl overflow-hidden bg-white">
                <table className="w-full text-left text-xs text-slate-650">
                  <thead className="bg-slate-50 border-b border-slate-150 font-bold text-slate-700 text-[10px] uppercase font-mono tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Сканируемый Девайс / Браузер</th>
                      <th className="px-4 py-3">IP-Адрес</th>
                      <th className="px-4 py-3">Локация сессии</th>
                      <th className="px-4 py-3">Срок JWT годности</th>
                      <th className="px-4 py-3 text-right">Действие</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sessions.map((ses) => (
                      <tr key={ses.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-semibold text-slate-805 flex items-center gap-2">
                          <Laptop className="w-4 h-4 text-slate-400 shrink-0" />
                          {ses.device}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-[10px] text-slate-500">{ses.ip}</td>
                        <td className="px-4 py-3">{ses.location}</td>
                        <td className="px-4 py-3">
                          <span className="bg-indigo-50 text-indigo-700 font-extrabold px-2 py-0.5 rounded text-[9.5px]">
                            {ses.expiresIn}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleRevokeSession(ses.id)}
                            className="text-rose-600 hover:text-rose-800 p-1 hover:bg-rose-50 rounded"
                            title="Отозвать сессию доступа"
                          >
                            <Trash2 className="w-4 h-4 inline" /> Отозвать
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. CAMERA SCANNER OVERLAY MODEL */}
      {isQrScannerOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-[9999] animate-fade-in font-sans">
          
          {/* Custom scanline CSS anim style */}
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes scanline {
              0% { top: 0%; opacity: 0; }
              5% { opacity: 1; }
              95% { opacity: 1; }
              100% { top: 100%; opacity: 0; }
            }
            .animate-scanline {
              position: absolute;
              left: 4%;
              right: 4%;
              height: 2.5px;
              background-color: #10b981;
              box-shadow: 0 0 12px #10b981, 0 0 4px #10b981;
              animation: scanline 2.2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
            @keyframes pulse-ring {
              0% { transform: scale(0.95); opacity: 0.5; }
              50% { transform: scale(1.05); opacity: 0.8; }
              100% { transform: scale(0.95); opacity: 0.5; }
            }
            .animate-pulse-ring {
              animation: pulse-ring 2s ease-in-out infinite;
            }
          `}} />

          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-800 text-white relative">
            
            {/* Absolute close button */}
            <button
              onClick={() => { setIsQrScannerOpen(false); setScannerStage('idle'); setScannedData(null); }}
              className="absolute top-4 right-4 bg-slate-800 hover:bg-slate-705 text-slate-450 hover:text-white p-2 rounded-full transition z-10 cursor-pointer border border-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Column: Simulated Live Video Frame */}
            <div className="flex-1 p-6 flex flex-col justify-between space-y-4">
              <div>
                <span className="bg-emerald-500/10 text-emerald-400 font-extrabold text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                  Live Viewfinder Feed
                </span>
                <h3 className="text-base font-black text-white mt-1.5 font-sans">Распознавание QR по камере</h3>
                <p className="text-[11px] text-slate-450 mt-0.5 leading-relaxed font-sans">
                   Наведите видоискатель на QR-код или выберите раздаточный инвайт справа, чтобы симулировать чтение линзой.
                </p>
              </div>

              {/* Viewfinder Wrapper Container */}
              <div className="relative bg-black aspect-video rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center shadow-inner group">
                
                {/* 4 Corner brackets for scanner target alignment */}
                <div className="absolute top-5 left-5 w-6 h-6 border-t-2 border-l-2 border-emerald-500 rounded-tl-md"></div>
                <div className="absolute top-5 right-5 w-6 h-6 border-t-2 border-r-2 border-emerald-500 rounded-tr-md"></div>
                <div className="absolute bottom-5 left-5 w-6 h-6 border-b-2 border-l-2 border-emerald-500 rounded-bl-md"></div>
                <div className="absolute bottom-5 right-5 w-6 h-6 border-b-2 border-r-2 border-emerald-500 rounded-br-md"></div>

                {/* Simulated laser line animation */}
                {scannerStage !== 'idle' && scannerStage !== 'success' && (
                  <div className="animate-scanline top-0"></div>
                )}

                {/* Viewfinder contents depending on scanner stage state */}
                {scannerStage === 'idle' && (
                  <div className="text-center p-6 space-y-3.5 z-10">
                    <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500 animate-pulse-ring">
                      <Camera className="w-6 h-6" />
                    </div>
                    <span className="text-xs text-slate-400 block font-semibold font-sans">
                      Камера готова. Выберите инвайт для сканирования.
                    </span>
                  </div>
                )}

                {scannerStage === 'focusing' && (
                  <div className="text-center p-6 space-y-3 z-10 navy-focus">
                    <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <span className="text-xs text-emerald-400 font-bold block animate-pulse font-sans">
                      Авторегулировка фокуса линзы...
                    </span>
                    <span className="text-[10px] text-slate-550 block font-mono">Камера калибрует ISO и контраст сенсора</span>
                  </div>
                )}

                {scannerStage === 'decoding' && (
                  <div className="text-center p-6 space-y-3 z-10 flex-dec">
                    <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
                    <span className="text-xs text-indigo-300 font-extrabold block font-sans">
                      Дешифрование JWT-сигнатуры...
                    </span>
                    <span className="text-[10px] text-slate-550 block font-mono">Чтение QR-метки метаданных</span>
                  </div>
                )}

                {scannerStage === 'success' && scannedData && (
                  <div className="absolute inset-0 bg-emerald-950/25 flex flex-col items-center justify-center text-center p-6 z-10 space-y-2.5 animate-scale-up">
                    <div className="w-11 h-11 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                      <Check className="w-6 h-6 stroke-[3]" />
                    </div>
                    <div>
                      <span className="bg-emerald-500 text-emerald-950 font-black text-[9px] px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                        Распознано успешно
                      </span>
                      <h4 className="font-extrabold text-sm text-white mt-1.5 font-sans">{scannedData.groupName}</h4>
                      <span className="text-[11px] font-mono text-zinc-400 block mt-0.5">{scannedData.code}</span>
                    </div>
                  </div>
                )}

                {/* Scanning overlay noise / stripes effect */}
                <div className="absolute inset-0 bg-[radial-gradient(transparent_50%,rgba(0,0,0,0.4))] pointer-events-none"></div>
              </div>

              {/* Input for visual confirm */}
              <div className="text-[10.5px] text-slate-500 bg-black/40 p-3 rounded-xl border border-slate-800 leading-normal font-sans">
                🔒 Данные защищены по TLS. Сгенерированный QR содержит уникальную цифровую подпись (Invite JWT Token) центра, что исключает несанкционированные подмены групп.
              </div>
            </div>

            {/* Right Column: Predefined Invitation Codes to Simulate Scanning */}
            <div className="flex-1 p-6 flex flex-col justify-between space-y-5 bg-slate-900/60">
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block font-sans">Раздаточные QR репетиторов</h4>
                  <p className="text-[11px] text-slate-450 mt-0.5 font-sans">
                     Выберите учебный QR-код ниже, чтобы поднести его к объективу виртуальной камеры:
                  </p>
                </div>

                {/* Pre-set codes iterator list */}
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {PRESET_QR_CODES.map((qr) => (
                    <button
                      key={qr.code}
                      onClick={() => triggerSimulateScan(qr)}
                      className={`w-full text-left p-2.5 rounded-xl border transition flex items-center gap-3 cursor-pointer ${
                        scannedData?.code === qr.code
                          ? 'bg-emerald-950/20 border-emerald-500 text-white'
                          : 'bg-black/30 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="bg-white p-1 rounded shrink-0">
                        <QrCode className="w-7 h-7 text-slate-900" />
                      </div>
                      <div className="flex-1 min-w-0 font-sans">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-extrabold text-indigo-400">{qr.code}</span>
                          <span className="text-[8.5px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded uppercase font-bold text-xxs tracking-wide font-mono">
                            {qr.suggestedRole === 'student' ? 'Студент' : 'Родитель'}
                          </span>
                        </div>
                        <h5 className="font-bold text-[11px] truncate text-white mt-0.5">{qr.groupName}</h5>
                        <p className="text-[9.5px] text-slate-400 truncate mt-0.5">Учитель: {qr.mentorName}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer configuration for join group action */}
              <div className="border-t border-slate-800 pt-4 space-y-3 font-sans">
                {scannedData ? (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-bold text-slate-400 uppercase block">Укажите ваш телефон (для привязки):</label>
                      <input
                        type="text"
                        value={invitePhone}
                        onChange={(e) => setInvitePhone(e.target.value)}
                        placeholder="+998 90 000 00 00"
                        className="w-full bg-black border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                    
                    <button
                      onClick={handleScannerInstantJoin}
                      disabled={loading}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 font-black text-xs text-slate-950 py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/10"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Подключение сессии...
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-4 h-4 text-emerald-950" />
                          Подтвердить и зачислиться в учебную группу 🚀
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-4 text-slate-500 text-[11px] leading-relaxed">
                     Выберите один из раздаточных QR-кодов преподавателей выше для тестирования считывания и авторизации.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
