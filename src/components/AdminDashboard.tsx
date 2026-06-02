import React, { useState } from 'react';
import { Group, Student, StudentProgress, LessonReport, apiIntegrations, GroupQuest } from '../types';
import { 
  Users, 
  BookOpen, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  ChevronRight, 
  Sparkles, 
  RefreshCw,
  Trophy,
  Award,
  Send,
  Zap,
  Activity,
  Shield,
  MessageSquare,
  Volume2
} from 'lucide-react';
import OpenApiPanel from './OpenApiPanel';
import CloudSyncSimulator from './CloudSyncSimulator';

interface AdminDashboardProps {
  groups: Group[];
  students: Student[];
  progressList: StudentProgress[];
  reports: LessonReport[];
  integrations: apiIntegrations[];
  onToggleIntegration: (id: string) => void;
  onGenerateToken: (id: string) => void;
  isSyncing: boolean;
  lastSyncTime: Date;
  onResetDb?: () => void;
  quests?: GroupQuest[];
  ewsAlerts?: any[];
  onAdvanceQuest?: (questId: string) => void;
}

export default function AdminDashboard({
  groups,
  students,
  progressList,
  reports,
  integrations,
  onToggleIntegration,
  onGenerateToken,
  isSyncing,
  lastSyncTime,
  onResetDb,
  quests = [],
  ewsAlerts = [],
  onAdvanceQuest
}: AdminDashboardProps) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [leaderboardTab, setLeaderboardTab] = useState<'students' | 'groups'>('students');
  const [sortField, setSortField] = useState<'engagement' | 'xp' | 'attendance' | 'score'>('engagement');
  const [notifiedRoles, setNotifiedRoles] = useState<string[]>([]);

  const handleSendNotification = (studentName: string, role: 'teacher' | 'parent') => {
    const key = `${studentName}-${role}`;
    setNotifiedRoles(prev => [...prev, key]);
    alert(`Уведомление успешно отправлено для ${studentName} (${role === 'teacher' ? 'Преподавателю' : 'Родителям'}) c персональными ИИ-рекомендациями по поддержке!`);
  };

  // Stats Calculations
  const totalStudents = students.length;
  const totalGroups = groups.length;
  const avgAttendance = Math.round(students.reduce((sum, s) => sum + s.attendanceRate, 0) / (totalStudents || 1));
  const avgScore = (students.reduce((sum, s) => sum + s.generalScore, 0) / (totalStudents || 1)).toFixed(2);

  // Risk Counts
  const highRiskCount = students.filter(s => s.riskRating === 'high').length;
  const medRiskCount = students.filter(s => s.riskRating === 'medium').length;
  const lowRiskCount = students.filter(s => s.riskRating === 'low').length;

  // Selected student extra details helper
  const selectedProgress = selectedStudent
    ? progressList.find(p => p.studentId === selectedStudent.id)
    : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* LEFT & CENTER PARTS (Analytics & Lists) */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center gap-3.5">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">Студенты</span>
              <span className="text-xl font-bold font-display text-slate-905">{totalStudents}</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center gap-3.5">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">Группы</span>
              <span className="text-xl font-bold font-display text-slate-905">{totalGroups}</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center gap-3.5">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">Посещаемость</span>
              <span className="text-xl font-bold font-display text-slate-905">{avgAttendance}%</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center gap-3.5">
            <div className="p-3 bg-pink-50 text-pink-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">Успеваемость</span>
              <span className="text-xl font-bold font-display text-slate-905">{avgScore}/5</span>
            </div>
          </div>
        </div>

        {/* AI EARLY WARNING SYSTEM (EWS) CONTROL CONSOLE */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse" />
                <h3 className="font-bold text-slate-800 text-sm">AI Early Warning System (Контроль рисков & Мотивации)</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Автоматический ИИ-анализ посещаемости, трендов успеваемости и вовлеченности</p>
            </div>
            <span className="bg-rose-50 text-rose-700 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border border-rose-200">
              {ewsAlerts.length} Студентов в риске
            </span>
          </div>

          {/* Master Risk Indicator Bar */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 mb-5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Общая статистика оттока в центре:</span>
            <div className="h-4 w-full bg-slate-200 rounded-full flex overflow-hidden mb-2">
              <div
                style={{ width: `${(highRiskCount / (totalStudents || 1)) * 100}%` }}
                className="bg-rose-500 h-full transition-all duration-500"
                title="Высокий риск"
              ></div>
              <div
                style={{ width: `${(medRiskCount / (totalStudents || 1)) * 100}%` }}
                className="bg-amber-400 h-full transition-all duration-500"
                title="Средний риск"
              ></div>
              <div
                style={{ width: `${(lowRiskCount / (totalStudents || 1)) * 100}%` }}
                className="bg-emerald-500 h-full transition-all duration-500"
                title="Вне зоны риска"
              ></div>
            </div>
            <div className="flex justify-between text-[9px] text-slate-500 font-mono">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span> Крит: {highRiskCount}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span> Ворнинг: {medRiskCount}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Окей: {lowRiskCount}</span>
            </div>
          </div>

          {/* Individual Detailed Alerts with Support Recommendations */}
          <div className="space-y-4">
            {ewsAlerts.map((alertItem: any) => {
              const isTeacherNotified = notifiedRoles.includes(`${alertItem.studentName}-teacher`);
              const isParentNotified = notifiedRoles.includes(`${alertItem.studentName}-parent`);

              return (
                <div key={alertItem.studentId} className="border border-rose-100 rounded-xl p-4 bg-gradient-to-r from-white to-rose-50/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${alertItem.riskLevel === 'high' ? 'bg-rose-500' : 'bg-amber-400'}`}></span>
                      <strong className="text-xs text-slate-800 font-bold">{alertItem.studentName}</strong>
                      <span className="text-[10px] text-slate-400 font-medium font-mono">({alertItem.groupName})</span>
                    </div>
                    <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                      alertItem.riskLevel === 'high' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-805'
                    }`}>
                      {alertItem.riskLevel === 'high' ? 'Критический риск' : 'Снижение мотивации'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 mb-3 bg-white p-2 rounded-lg border border-slate-100 italic">
                    <strong>Индикатор:</strong> {alertItem.reason}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mb-3">
                    <div className="bg-white p-2.5 rounded-xl border border-indigo-50">
                      <span className="font-bold text-[10px] text-indigo-700 block mb-1">👩‍🏫 Рекомендации для преподавателя:</span>
                      <p className="text-[10px] text-slate-600 font-medium leading-relaxed">{alertItem.teacherRecommendation}</p>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-amber-50">
                      <span className="font-bold text-[10px] text-amber-700 block mb-1">👪 Рекомендации для родителей (Early Alert):</span>
                      <p className="text-[10px] text-slate-600 font-medium leading-relaxed">{alertItem.parentRecommendation}</p>
                    </div>
                  </div>

                  {/* Actions to Notify */}
                  <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-100">
                    <span className="text-[9px] text-slate-400 font-mono">
                      Родитель: {alertItem.contactTelegram} ({alertItem.parentPhone})
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSendNotification(alertItem.studentName, 'teacher')}
                        disabled={isTeacherNotified}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                          isTeacherNotified 
                            ? 'bg-slate-100 text-slate-400 border border-slate-205'
                            : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200'
                        }`}
                      >
                        <Send className="w-3 h-3" />
                        {isTeacherNotified ? 'Учитель уведомлен' : 'Уведомить Учителя'}
                      </button>
                      <button
                        onClick={() => handleSendNotification(alertItem.studentName, 'parent')}
                        disabled={isParentNotified}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                          isParentNotified 
                            ? 'bg-slate-100 text-slate-405 border border-slate-205'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200'
                        }`}
                      >
                        <MessageSquare className="w-3 h-3" />
                        {isParentNotified ? 'Родитель уведомлен' : 'Уведомить Родителей'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* GAMIFICATION & LEADERBOARD SYSTEM PANEL */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500 animate-bounce" />
                <h3 className="font-bold text-slate-800 text-sm">Игровая Таблица Лидеров & Квесты</h3>
              </div>
              <p className="text-xs text-slate-400">Рейтинги вовлеченности, прогресса, посещаемости и еженедельные вызовы групп</p>
            </div>
          </div>

          {/* Tabs switch */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-4 text-xs font-bold font-display">
            <button
              onClick={() => setLeaderboardTab('students')}
              className={`flex-1 py-1.5 rounded-lg text-center transition cursor-pointer ${
                leaderboardTab === 'students' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              🏆 Рейтинг Учеников
            </button>
            <button
              onClick={() => setLeaderboardTab('groups')}
              className={`flex-1 py-1.5 rounded-lg text-center transition cursor-pointer ${
                leaderboardTab === 'groups' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              👥 Группы & Квесты
            </button>
          </div>

          {/* Student Leaderboard content */}
          {leaderboardTab === 'students' && (
            <div className="space-y-4">
              {/* Sorting filters */}
              <div className="flex items-center justify-between flex-wrap gap-2 text-[10px] font-bold text-slate-500">
                <span>Сортировка по:</span>
                <div className="flex gap-1">
                  {[
                    { field: 'engagement' as const, label: 'Вовлеченности' },
                    { field: 'xp' as const, label: 'Опыту (XP)' },
                    { field: 'attendance' as const, label: 'Посещаемости' },
                    { field: 'score' as const, label: 'Оценке (GPA)' }
                  ].map(f => (
                    <button
                      key={f.field}
                      onClick={() => setSortField(f.field)}
                      className={`px-2 py-1 rounded bg-slate-100 border transition cursor-pointer ${
                        sortField === f.field ? 'bg-indigo-600 text-white border-indigo-700' : 'hover:bg-slate-200 border-slate-200 text-slate-600'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Leaderboard List */}
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {[...students].sort((a, b) => {
                  if (sortField === 'xp') return b.xp - a.xp;
                  if (sortField === 'attendance') return b.attendanceRate - a.attendanceRate;
                  if (sortField === 'score') return b.generalScore - a.generalScore;
                  return (b.engagementRate || 0) - (a.engagementRate || 0);
                }).map((student, index) => {
                  const placeColors = ['bg-amber-100 text-amber-800 border-amber-300', 'bg-slate-100 text-slate-800 border-slate-300', 'bg-orange-100 text-orange-850 border-orange-300'];
                  const awardBadge = idx => idx < 3 ? placeColors[idx] : 'bg-slate-50 text-slate-500 border-slate-200';

                  return (
                    <div key={student.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Position */}
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] border shrink-0 ${awardBadge(index)}`}>
                          {index + 1}
                        </span>
                        
                        {/* Avatar */}
                        <img
                          src={student.avatar}
                          alt={student.name}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-full border border-slate-200 object-cover shrink-0"
                        />

                        {/* Name & Role */}
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-800 text-[11.5px] truncate">{student.name}</h4>
                          <span className="inline-flex items-center gap-0.5 text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold font-sans">
                            <Sparkles className="w-2.5 h-2.5" />
                            {student.academicRole || 'Студент'}
                          </span>
                        </div>
                      </div>

                      {/* Stat display depending on sort options */}
                      <div className="text-right shrink-0">
                        <span className="text-xs font-extrabold text-slate-800 block">
                          {sortField === 'xp' ? `${student.xp} XP` :
                           sortField === 'attendance' ? `${student.attendanceRate}%` :
                           sortField === 'score' ? `★ ${student.generalScore}` :
                           `${student.engagementRate || 80}%`}
                        </span>
                        <span className="text-[8.5px] uppercase tracking-wide font-extrabold font-mono text-indigo-500">
                          {sortField === 'xp' ? `ур. ${student.level}` :
                           sortField === 'attendance' ? 'посещаемость' :
                           sortField === 'score' ? 'средний балл' :
                           'Вовлеченность'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Group Leaderboards & Quest Monitoring */}
          {leaderboardTab === 'groups' && (
            <div className="space-y-5">
              {/* Leaderboard Groups List */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Рейтинг Групп по КПД:</span>
                {[...groups].sort((a, b) => (b.engagementRate || 0) - (a.engagementRate || 0)).map((group, index) => (
                  <div key={group.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-150 bg-slate-50/50">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-slate-400">#{index + 1}</span>
                        <h4 className="font-bold text-slate-800 text-xs">{group.name}</h4>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 font-medium">{group.subject} • {group.teacherName}</p>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg px-2 py-0.5 text-[10px] font-bold">
                        <Trophy className="w-3 h-3 text-amber-500" />
                        {group.questsCompleted || 0} Квестов
                      </span>
                      <span className="block text-[11px] font-extrabold text-indigo-650 mt-1 font-mono">
                        КПД: {group.engagementRate || 85}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Group Quests monitor */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-indigo-805 uppercase tracking-wider flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                    Еженедельные Командные Квесты:
                  </span>
                  <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 text-[9px] font-bold rounded">
                    +XP Всем членам группы
                  </span>
                </div>

                <div className="space-y-3">
                  {quests.map((quest) => {
                    const groupItem = groups.find(g => g.id === quest.groupId);
                    const percent = Math.min((quest.currentCount / quest.targetCount) * 100, 100);

                    return (
                      <div key={quest.id} className="border border-slate-200 rounded-xl p-3.5 bg-white relative overflow-hidden">
                        {/* completed watermark or corner mark */}
                        {quest.status === 'completed' && (
                          <div className="absolute right-0 top-0 bg-emerald-500 text-white text-[8px] uppercase tracking-wide font-bold px-2 py-0.5 rounded-bl shadow">
                            СХВАЧЕНО! ✓
                          </div>
                        )}

                        <div className="flex justify-between items-start gap-2 mb-1.5 pr-14">
                          <div>
                            <span className="text-[9px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-md uppercase">
                              {groupItem?.name || 'Группа'}
                            </span>
                            <h5 className="font-extrabold text-slate-800 text-[11.5px] mt-1 flex items-center gap-1.5">
                              {quest.title}
                            </h5>
                            <p className="text-[10px] text-slate-400 font-medium leading-normal mt-0.5">{quest.description}</p>
                          </div>
                        </div>

                        {/* progress row */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[9px] font-bold text-slate-500">
                            <span>Продвижение: {quest.currentCount} из {quest.targetCount}</span>
                            <span className="text-indigo-605">{quest.rewardXp} XP на участника</span>
                          </div>
                          
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200 flex">
                            <div
                              style={{ width: `${percent}%` }}
                              className={`h-full transition-all duration-300 ${quest.status === 'completed' ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                            ></div>
                          </div>
                        </div>

                        {/* simulation run triggers */}
                        {quest.status === 'active' && onAdvanceQuest && (
                          <div className="mt-3 flex justify-end">
                            <button
                              onClick={() => {
                                onAdvanceQuest(quest.id);
                                alert(`Успешный командный рывок! Все участники группы получили по +${quest.rewardXp} XP в личный зачет! Уровни пересчитаны.`);
                              }}
                              className="text-[10px] font-extrabold bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                            >
                              <Zap className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                              Закрыть квест (Симуляция команды)
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Master Student List & Interactive Modal */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Все студенты учебного центра</h3>
              <p className="text-xs text-slate-400">Нажмите на карточку любого ученика для получения подробной AI-диагностики</p>
            </div>
            {onResetDb && (
              <button
                onClick={onResetDb}
                className="text-xs text-indigo-705 font-bold flex items-center gap-1.5 hover:text-indigo-805 transition bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-xl cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Сбросить прогресс
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {students.map((student) => {
              const isSelected = selectedStudent?.id === student.id;
              return (
                <div
                  key={student.id}
                  onClick={() => setSelectedStudent(isSelected ? null : student)}
                  className={`border rounded-2xl p-4 transition-all duration-300 cursor-pointer flex items-center justify-between hover:shadow-md ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/40 shadow-sm'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={student.avatar}
                      alt={student.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="font-semibold text-xs text-slate-800">{student.name}</h4>
                      <p className="text-[10px] text-slate-400 font-medium">{student.groupName}</p>
                      
                      {/* Stats row */}
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] font-mono text-slate-505">
                        <span className="bg-slate-100 rounded-md py-0.5 px-1.5 text-[9px] font-bold text-slate-600">Lvl {student.level}</span>
                        <span>Балл: <strong className="text-indigo-650">{student.generalScore}</strong></span>
                        <span>Посещ: <strong className="text-slate-700">{student.attendanceRate}%</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                      student.riskRating === 'high'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : student.riskRating === 'medium'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {student.riskRating === 'high' ? 'Крит' : student.riskRating === 'medium' ? 'Ворнинг' : 'Окей'}
                    </span>
                    <span className="text-[9px] text-indigo-600 font-bold hover:underline flex items-center gap-0.5">
                      {isSelected ? 'Свернуть' : 'Детали'} <ChevronRight className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Student AI Diagnostics Expanded Panel */}
          {selectedStudent && selectedProgress && (
            <div className="mt-6 border-t border-slate-200 pt-6 animate-fadeIn">
              <div className="bg-indigo-50/60 rounded-2xl p-5 border border-indigo-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-600 text-white rounded-xl">
                    <Sparkles className="w-5 h-5 text-yellow-350 fill-yellow-300" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-indigo-950">Мгновенный AI-Анализ & Уязвимости: {selectedStudent.name}</h4>
                    <p className="text-[10px] text-indigo-600 font-medium">Суммарный цифровой профиль студента на базе последних уроков</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Сильные стороны (Strengths):</span>
                    <ul className="space-y-1.5">
                      {selectedProgress.strengths.map((str, i) => (
                        <li key={i} className="text-xs text-slate-700 flex items-start gap-1.5">
                          <span className="text-emerald-500 font-bold h-4 flex items-center">✓</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Зоны роста / Проблемные темы:</span>
                    <ul className="space-y-1.5">
                      {selectedProgress.weakTopics.map((wt, i) => (
                        <li key={i} className="text-xs text-slate-700 flex items-start gap-1.5">
                          <span className="text-rose-500 font-bold h-4 flex items-center">✗</span>
                          <span>{wt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-indigo-100">
                  <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block mb-1.5">Рекомендованный план обучения (AI Plan):</span>
                  <div className="bg-white rounded-xl p-3 border border-indigo-100 leading-relaxed space-y-1.5">
                    {selectedProgress.recommendations.map((rec, i) => (
                      <p key={i} className="text-xs text-slate-700 flex gap-2">
                        <span className="text-indigo-600 font-bold font-mono">{i + 1}.</span>
                        <span>{rec}</span>
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Historic Lesson Reports Timeline */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 text-sm mb-1">Журнал ИИ-анализа проведенных уроков</h3>
          <p className="text-xs text-slate-400 mb-4">Архив уроков учебного центра и результаты дешифровки голосовой аналитики</p>

          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="border border-slate-200 rounded-2xl p-4 hover:bg-slate-50 transition-all">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400">{report.date} • {report.duration}</span>
                    <h4 className="font-bold text-xs text-slate-800 mt-0.5">{report.topic}</h4>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium inline-block mt-1">
                      Группа: {report.groupName}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Учитель: {report.teacherName}</span>
                    <span className={`text-[9px] font-bold tracking-wider uppercase px-2 py-1 rounded-full border ${
                      report.isVoiceText ? 'bg-orange-50 text-orange-900 border-orange-200' : 'bg-blue-50 text-blue-805 border-blue-200'
                    }`}>
                      {report.isVoiceText ? '🎙️ Голосовой' : '✏️ Текстовый'}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-600 leading-relaxed italic border-l-4 border-indigo-500 mb-3">
                  <strong className="text-slate-800 not-italic block mb-1">Сводный транскрипт урока (ввод):</strong>
                  "{report.rawText}"
                </div>

                {/* Expanded Micro Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white text-xs">
                  <div className="grid grid-cols-4 bg-slate-50 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400 text-center border-b border-slate-200">
                    <span>Студент</span>
                    <span>Посещ.</span>
                    <span>Степень</span>
                    <span>Оценка ИИ</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {report.analyses.map((an, idx) => (
                      <div key={idx} className="grid grid-cols-4 px-3 py-2 items-center text-center">
                        <span className="font-semibold text-slate-700 text-left truncate">{an.studentName}</span>
                        <span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                            an.attendance === 'present' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : an.attendance === 'late' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                          }`}>
                            {an.attendance === 'present' ? 'Был' : an.attendance === 'late' ? 'Оп.' : 'Н/Б'}
                          </span>
                        </span>
                        <span className="font-mono text-slate-600 font-semibold">{an.progressPercentage}%</span>
                        <span className="font-bold text-amber-600">{an.attendance === 'present' ? `★ ${an.grade}` : '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR (Sync Engine & Open API Configuration) */}
      <div className="space-y-6">
        <CloudSyncSimulator
          lastSyncTime={lastSyncTime}
          isSyncing={isSyncing}
          dataSummary={{
            studentsCount: students.length,
            reportsCount: reports.length,
            notificationsCount: 4
          }}
        />

        <OpenApiPanel
          integrations={integrations}
          onToggleIntegration={onToggleIntegration}
          onGenerateToken={onGenerateToken}
        />
      </div>
    </div>
  );
}
