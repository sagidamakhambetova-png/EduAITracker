import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Users,
  BookOpen,
  User,
  Activity,
  Smartphone,
  CheckCircle,
  Clock,
  LogOut,
  Bell,
  Shield,
  HelpCircle,
  Layers,
  MessageSquare,
  Volume2
} from 'lucide-react';

import { Group, Student, StudentProgress, MentorCharacter, LessonReport, apiIntegrations, Notification, UserRole, GroupQuest, PersonalChallenge, PeerHelp } from './types';
import AdminDashboard from './components/AdminDashboard';
import DirectorDashboard from './components/DirectorDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import ParentDashboard from './components/ParentDashboard';
import StudentDashboard from './components/StudentDashboard';
import TelegramBotSimulator from './components/TelegramBotSimulator';
import AuthPortal, { AuthUser } from './components/AuthPortal';
import SamrukDocPortal from './components/SamrukDocPortal';

export default function App() {
  const [activeRole, setActiveRole] = useState<UserRole>('admin');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [showSamrukPortal, setShowSamrukPortal] = useState(false);

  const handleLoginSuccess = (user: AuthUser, token: string) => {
    setCurrentUser(user);
    setActiveRole(user.role);
    localStorage.setItem('auth_token_simulated', token);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('auth_token_simulated');
  };

  const handleUpdateProfile = (updated: Partial<AuthUser>) => {
    if (currentUser) {
      setCurrentUser(prev => prev ? { ...prev, ...updated } : null);
    }
  };
  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsProgress, setStudentsProgress] = useState<StudentProgress[]>([]);
  const [lessonReports, setLessonReports] = useState<LessonReport[]>([]);
  const [mentors, setMentors] = useState<MentorCharacter[]>([]);
  const [integrations, setIntegrations] = useState<apiIntegrations[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const [quests, setQuests] = useState<GroupQuest[]>([]);
  const [challenges, setChallenges] = useState<PersonalChallenge[]>([]);
  const [peerHelp, setPeerHelp] = useState<PeerHelp[]>([]);
  const [ewsAlerts, setEwsAlerts] = useState<any[]>([]);

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);

  // Load database state on initial boot
  const fetchAllData = async () => {
    setIsSyncing(true);
    try {
      const responses = await Promise.all([
        fetch('/api/groups'),
        fetch('/api/students'),
        fetch('/api/progress'),
        fetch('/api/reports'),
        fetch('/api/mentors'),
        fetch('/api/integrations'),
        fetch('/api/notifications'),
        fetch('/api/quests'),
        fetch('/api/challenges'),
        fetch('/api/peer-help'),
        fetch('/api/ews/warnings')
      ]);

      const [gData, sData, pData, rData, mData, iData, nData, qData, cData, phData, ewsData] = await Promise.all(
        responses.map(res => res.json())
      );

      setGroups(gData);
      setStudents(sData);
      setStudentsProgress(pData);
      setLessonReports(rData);
      setMentors(mData);
      setIntegrations(iData);
      setNotifications(nData);
      setQuests(qData);
      setChallenges(cData);
      setPeerHelp(phData);
      setEwsAlerts(ewsData);
      
      setLastSyncTime(new Date());
    } catch (err) {
      console.error('Error synchronising educational database:', err);
    } finally {
      setIsSyncing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Post lesson report & run AI analytics proxy
  const handleSubmitReport = async (reportData: {
    groupName: string;
    topic: string;
    teacherName: string;
    duration: string;
    rawText: string;
    isVoiceText: boolean;
  }) => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      });
      const data = await res.json();
      if (data.success) {
        // Redraw updated components with new properties
        setStudents(data.students);
        setStudentsProgress(data.studentsProgress);
        setNotifications(data.notifications);
        // Refresh master lesson reports
        const rRes = await fetch('/api/reports');
        const rData = await rRes.json();
        setLessonReports(rData);
        setLastSyncTime(new Date());
        return { geminiSuccess: data.geminiSuccess };
      } else {
        throw new Error(data.error || 'Server error occurred');
      }
    } catch (err: any) {
      console.error(err);
      return { geminiSuccess: false, error: err.message };
    } finally {
      setIsSyncing(false);
    }
  };

  // Trigger manual simulation in Telegram Bot Simulator
  const handleTriggerMockNotification = async (title: string, message: string, role: 'parent' | 'teacher', studentName?: string) => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/notifications/telegram-trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message, role, studentName })
      });
      const newNotif = await res.json();
      setNotifications(prev => [newNotif, ...prev]);
      setLastSyncTime(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Toggle third party LMS integrations
  const handleToggleIntegration = async (id: string) => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/integrations/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        setIntegrations(data.apiIntegrations);
        setLastSyncTime(new Date());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Regenerate Token Key for LMS Integration
  const handleGenerateToken = async (id: string) => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/integrations/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        setIntegrations(data.apiIntegrations);
        setLastSyncTime(new Date());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Level Up interactive playground trigger from student portal
  const handleTriggerLevelUp = async (studentId: string, xp: number) => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/students/level-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, xp })
      });
      const data = await res.json();
      if (data.success) {
        await fetchAllData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Select active mentor handler
  const handleSelectMentor = async (mentorId: string) => {
    const activeStudent = students.find(s => s.name === currentUser?.name) || students[0];
    if (!activeStudent) return;
    setIsSyncing(true);
    try {
      const res = await fetch(`/api/students/${activeStudent.id}/mentor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mentorId })
      });
      const data = await res.json();
      if (data.success) {
        await fetchAllData();
      } else {
        setStudents(prev => prev.map(s => s.id === activeStudent.id ? { ...s, mentorId } : s));
      }
    } catch (err) {
      console.error(err);
      setStudents(prev => prev.map(s => s.id === activeStudent.id ? { ...s, mentorId } : s));
    } finally {
      setIsSyncing(false);
    }
  };

  // Submit Academic Role choice
  const handleSelectAcademicRole = async (studentId: string, academicRole: string) => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/students/academic-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, academicRole })
      });
      const data = await res.json();
      if (data.success) {
        setStudents(data.students);
        setLastSyncTime(new Date());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Complete Personal Challenge
  const handleCompleteChallenge = async (challengeId: string) => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/challenges/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId })
      });
      const data = await res.json();
      if (data.success) {
        await fetchAllData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Submit Peer Support Record
  const handlePeerHelp = async (helperStudentId: string, recipientStudentId: string, action: string) => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/peer-help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ helperStudentId, recipientStudentId, action })
      });
      const data = await res.json();
      if (data.success) {
        await fetchAllData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Advance/Complete Group Quest reward
  const handleAdvanceQuest = async (questId: string) => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/quests/advance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questId })
      });
      const data = await res.json();
      if (data.success) {
        await fetchAllData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Reset simulated DB
  const handleResetDb = async () => {
    setIsSyncing(true);
    try {
      await fetch('/api/notifications/clear', { method: 'POST' });
      await fetchAllData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-xl animate-spin">
            <Layers className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold font-display text-slate-800">Инициализация EduAI Tracker...</h2>
          <p className="text-xs text-slate-400">Проверка защищенных каналов дешифрования голосовой аналитики</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col transition-colors duration-300">
      
      {/* GLOBAL SYSTEM HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 no-print">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm">
              E
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-slate-900">EduAI<span className="text-indigo-600">Tracker</span></span>
              <span className="text-[9px] text-indigo-500 font-mono tracking-wider uppercase block -mt-1 font-semibold">ИИ Успеваемость & Аналитика</span>
            </div>
          </div>

          {/* Sync status pills */}
          <div className="hidden sm:flex items-center gap-4 text-xs">
            <div className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
              isSyncing 
                ? 'bg-indigo-50 text-indigo-700 border-indigo-100 animate-pulse' 
                : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-indigo-500 animate-spin border border-dashed border-indigo-700' : 'bg-emerald-500'}`}></div>
              <span>
                {isSyncing ? 'Синхронизация Cloud...' : `Служба активна (Sync Active: ${lastSyncTime.toLocaleTimeString('ru-RU')})`}
              </span>
            </div>
          </div>

          {/* Role selector dropdown/tab */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowSamrukPortal(true)}
              className="bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white font-extrabold text-[11px] px-3.5 py-1.5 rounded-xl transition shadow-md shadow-indigo-500/10 flex items-center gap-1.5 cursor-pointer border border-indigo-500/10"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>Совет Наставников EduProgress 🦅</span>
            </button>
            <span className="text-xs text-slate-400 font-medium hidden lg:inline">Ваш кабинет:</span>
            <div className="bg-slate-100 p-1 rounded-xl flex">
              <select
                value={activeRole}
                onChange={(e) => setActiveRole(e.target.value as UserRole)}
                className="bg-white border border-slate-200 font-bold text-xs text-slate-700 rounded-xl px-2.5 py-1 focus:outline-none focus:border-indigo-500 shadow-sm transition"
              >
                <option value="admin">💻 Администрация (Администратор)</option>
                <option value="director">🕵️‍♂️ Руководство (Руководитель)</option>
                <option value="teacher">👩‍🏫 Преподаватель (Педагог)</option>
                <option value="parent">👪 Родительский портал</option>
                <option value="student">🎮 Игровая ученика</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* DETAILED ROOT CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 flex-1 w-full flex flex-col lg:flex-row gap-6">
        
        {/* ACTIVE DASHBOARD CONTAINER */}
        <div className="flex-1 min-w-0">
          {!currentUser ? (
            <div className="space-y-6">
              <div className="bg-indigo-50 border border-indigo-100 text-indigo-950 rounded-2xl p-4 text-xs leading-normal">
                🔐 <strong>Доступ ограничен безопасным JWT-аудитом:</strong> Пожалуйста, пройдите авторизацию. Выберите вариант быстрого демонстрационного входа (в левой колонке) или заполните форму простой регистрации за 1 минуту. Студенты и родители могут моментально подтвердить номер через СМС по коду приглашения.
              </div>
              <AuthPortal 
                currentUser={currentUser} 
                onLoginSuccess={handleLoginSuccess}
                onLogout={handleLogout}
                onUpdateProfile={handleUpdateProfile}
              />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeRole}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* ACTIVE SECURITY HUB & PROFILE CONFIGURATION */}
                <div className="bg-slate-100 border border-slate-200 rounded-3xl p-4 space-y-3.5 no-print">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-505 bg-emerald-500 animate-ping"></div>
                      <span className="text-xs font-extrabold text-slate-800">
                        Идентификатор сеанса: <span className="font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">{currentUser.role.toUpperCase()}_SECURE_SESSION</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10.5px] text-slate-450 font-bold">
                        Владелец: {currentUser.name}
                      </span>
                      <button
                        onClick={handleLogout}
                        className="text-[10px] bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-2 py-1 rounded transition"
                      >
                        Выйти
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-2xl border border-slate-150 p-2 shadow-xs">
                    <AuthPortal 
                      currentUser={currentUser} 
                      onLoginSuccess={handleLoginSuccess}
                      onLogout={handleLogout}
                      onUpdateProfile={handleUpdateProfile}
                    />
                  </div>
                </div>

                {/* Context Role Intro Banner */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print relative overflow-hidden">
                <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-2xl pointer-events-none"></div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {activeRole === 'admin' && '📊'}
                      {activeRole === 'director' && '🕵️‍♂️'}
                      {activeRole === 'teacher' && '👩‍🏫'}
                      {activeRole === 'parent' && '👪'}
                      {activeRole === 'student' && '🎮'}
                    </span>
                    <h2 className="text-base font-bold text-slate-900 font-display">
                      {activeRole === 'admin' && 'Кабинет Управления & Analytics'}
                      {activeRole === 'director' && 'Панель Контроля & Руководства'}
                      {activeRole === 'teacher' && 'Панель преподавателя (Ввод репорта)'}
                      {activeRole === 'parent' && 'Кабинет Родительского Наблюдения'}
                      {activeRole === 'student' && 'Игровая комната и квесты'}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                    {activeRole === 'admin' && 'Контроль успеваемости групп в реальном времени, аудит загрузки отчетов учителей, предотвращение оттока студентов через прогноз рисков и управление кодами интеграции.'}
                    {activeRole === 'director' && 'Сквозной надзор за качеством работы педагогического состава, успеваемостью всей школы (GPA), командными квестами и динамикой лояльности клиентов.'}
                    {activeRole === 'teacher' && 'Запишите короткое голосовое сообщение (или наберите текст) после урока. ИИ мгновенно сформирует отметки, скорректирует слабые темы и уведомит родителей.'}
                    {activeRole === 'parent' && 'Мы превращаем сухие отчеты в красивые графики и персональные подсказки. Вы будете видеть сильные стороны ребенка, прогресс домашних заданий и сможете скачать PDF-табель.'}
                    {activeRole === 'student' && 'Соревнуйтесь с другими учениками в таблице рекордов, получайте XP за правильные ответы и тренируйтесь с забавными ИИ-наставниками, повышая свой игровой статус!'}
                  </p>
                </div>
                
                {/* Micro details badge */}
                <span className="bg-indigo-50 text-indigo-700 font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider shadow-xs shrink-0 font-mono">
                  {activeRole === 'admin' && 'Роль: Администрация'}
                  {activeRole === 'director' && 'Роль: Руководитель'}
                  {activeRole === 'teacher' && 'Роль: Учитель'}
                  {activeRole === 'parent' && 'Роль: Родитель'}
                  {activeRole === 'student' && 'Роль: Ученик'}
                </span>
              </div>

              {/* DASHBOARD CONTENT SWITCH ROUTING */}
              {activeRole === 'admin' && (
                <AdminDashboard
                  groups={groups}
                  students={students}
                  progressList={studentsProgress}
                  reports={lessonReports}
                  integrations={integrations}
                  onToggleIntegration={handleToggleIntegration}
                  onGenerateToken={handleGenerateToken}
                  isSyncing={isSyncing}
                  lastSyncTime={lastSyncTime}
                  onResetDb={handleResetDb}
                  quests={quests}
                  ewsAlerts={ewsAlerts}
                  onAdvanceQuest={handleAdvanceQuest}
                />
              )}

              {activeRole === 'director' && (
                <DirectorDashboard
                  groups={groups}
                  students={students}
                  progressList={studentsProgress}
                  reports={lessonReports}
                  ewsAlerts={ewsAlerts}
                />
              )}

              {activeRole === 'teacher' && (
                <TeacherDashboard
                  groups={groups}
                  students={students}
                  reports={lessonReports}
                  onSubmitReport={handleSubmitReport}
                  ewsAlerts={ewsAlerts}
                />
              )}

              {activeRole === 'parent' && (
                <ParentDashboard
                  students={students}
                  progressList={studentsProgress}
                  reports={lessonReports}
                  ewsAlerts={ewsAlerts}
                />
              )}

              {activeRole === 'student' && (
                <StudentDashboard
                  students={students}
                  progressList={studentsProgress}
                  mentors={mentors}
                  onTriggerLevelUp={handleTriggerLevelUp}
                  quests={quests}
                  challenges={challenges}
                  peerHelp={peerHelp}
                  onSelectAcademicRole={handleSelectAcademicRole}
                  onCompleteChallenge={handleCompleteChallenge}
                  onPeerHelp={handlePeerHelp}
                  onClickCouncil={() => setShowSamrukPortal(true)}
                />
              )}
            </motion.div>
          </AnimatePresence>
          )}
        </div>

        {/* SIDE TRIGGER PANEL (Active Telegram Mobile Simulator) */}
        <div className="w-full lg:w-96 shrink-0 space-y-6 no-print">
          <TelegramBotSimulator
            notifications={notifications}
            onTriggerMockNotification={handleTriggerMockNotification}
          />
        </div>

      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400 no-print">
        <p>© 2026 EduAI Tracker. Платформа автоматизации контроля успеваемости на базе ИИ.</p>
        <p className="mt-1 text-[11px] text-slate-300 font-mono">
          Разработано в соответствии с регламентом AI Studio Cloud Run Stack. Версия ядра: 2.5
        </p>
      </footer>

      {showSamrukPortal && (
        <SamrukDocPortal 
          onClose={() => setShowSamrukPortal(false)} 
          activeStudentId={students.find(s => s.name === currentUser?.name)?.id || 's1'}
          activeMentorId={students.find(s => s.name === currentUser?.name)?.mentorId || 'm1'}
          onSelectMentor={handleSelectMentor}
        />
      )}
    </div>
  );
}
