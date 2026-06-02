import React, { useState } from 'react';
import { Group, Student, StudentProgress, LessonReport } from '../types';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Activity, 
  Award, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  Sparkles, 
  Search, 
  Filter, 
  ThumbsUp, 
  Eye, 
  Check, 
  Star,
  FileText
} from 'lucide-react';

interface DirectorDashboardProps {
  groups: Group[];
  students: Student[];
  progressList: StudentProgress[];
  reports: LessonReport[];
  ewsAlerts?: any[];
}

export default function DirectorDashboard({
  groups,
  students,
  progressList,
  reports,
  ewsAlerts = []
}: DirectorDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [teacherFilter, setTeacherFilter] = useState('all');
  const [auditScores, setAuditScores] = useState<Record<string, { rating: number; feedback: string }>>({});
  const [auditingId, setAuditingId] = useState<string | null>(null);

  // Stats Calculations
  const totalStudents = students.length;
  const totalGroups = groups.length;
  const avgAttendance = Math.round(students.reduce((sum, s) => sum + s.attendanceRate, 0) / (totalStudents || 1));
  const avgScore = (students.reduce((sum, s) => sum + s.generalScore, 0) / (totalStudents || 1)).toFixed(2);

  // Strategic KPI Indices
  const clientLoyaltyIndex = 94; // NPS / Customer Satisfaction
  const teacherFulfillmentRate = 96; // % of lessons reported on time
  const highRiskStudents = students.filter(s => s.riskRating === 'high');

  // Audit simulations
  const runAiAudit = (reportId: string, text: string) => {
    setAuditingId(reportId);
    setTimeout(() => {
      let rating = 95;
      let feedback = "Отличная детализация. Отражен академический прогресс каждого ученика, даны четкие барьеры трудностей.";
      
      if (text.length < 150) {
        rating = 58;
        feedback = "Отчет слишком краткий. Не хватает анализа устной активности отстающих студентов и рекомендаций.";
      } else if (text.toLowerCase().includes('пропустила') || text.toLowerCase().includes('отсутствовал')) {
        rating = 88;
        feedback = "Хороший отчет. Зафиксированы пропуски, однако стоит добавить ИИ-рекомендации для отработавших дома.";
      }

      setAuditScores(prev => ({
        ...prev,
        [reportId]: { rating, feedback }
      }));
      setAuditingId(null);
    }, 900);
  };

  // Get unique teachers for filtering
  const teachers = Array.from(new Set(groups.map(g => g.teacherName)));

  // Filter groups / reports
  const filteredReports = reports.filter(r => {
    const matchesSearch = r.topic.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.groupName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTeacher = teacherFilter === 'all' || r.teacherName === teacherFilter;
    return matchesSearch && matchesTeacher;
  });

  return (
    <div className="space-y-6">
      
      {/* 1. STRATEGIC EXECUTIVE KPI BLOCKS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 rounded-2xl p-4 text-white shadow-md border border-indigo-950">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-300">Лояльность LTV (NPS)</span>
            <div className="p-1.5 bg-white/10 rounded-lg text-indigo-300">
              <Star className="w-4 h-4 fill-indigo-300 text-indigo-300" />
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-2xl font-extrabold font-mono tracking-tight block">{clientLoyaltyIndex}%</span>
            <p className="text-[10px] text-indigo-200 font-sans leading-tight">Индекс стабильности удержания клиентов</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Сдача отчетов учителями</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-2xl font-extrabold text-slate-800 block font-mono tracking-tight">{teacherFulfillmentRate}%</span>
            <p className="text-[10px] text-slate-400 font-sans leading-tight">Заполнение журналов в день урока</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Сводная успеваемость GPA</span>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-2xl font-extrabold text-slate-800 block font-mono tracking-tight">{avgScore} / 5</span>
            <p className="text-[10px] text-slate-400 font-sans leading-tight">Средний балл по всей школе</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Посещаемость классов</span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-2xl font-extrabold text-slate-800 block font-mono tracking-tight">{avgAttendance}%</span>
            <p className="text-[10px] text-slate-400 font-sans leading-tight">Хороший результат за месяц</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2. MAIN TEACHER REPORTS AUDIT TAB (LEFT COLUMN - 2 SPANS) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6 pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-500" />
                  Аудит работы преподавателей и конспектов
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Входной контроль качества ИИ-заполнения журналов педагогами</p>
              </div>

              {/* Filters */}
              <div className="flex gap-2 flex-wrap">
                <select
                  value={teacherFilter}
                  onChange={(e) => setTeacherFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-600 rounded-xl px-2.5 py-1.5 focus:outline-none"
                >
                  <option value="all">Все преподаватели</option>
                  {teachers.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Reports List */}
            <div className="space-y-4">
              {filteredReports.map((report) => {
                const audit = auditScores[report.id];
                return (
                  <div key={report.id} className="border border-slate-150 rounded-xl p-4 hover:border-indigo-300 transition-all bg-slate-50/50">
                    <div className="flex justify-between items-start gap-4 flex-wrap">
                      <div>
                        <span className="text-[9px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded font-mono uppercase">
                          {report.groupName}
                        </span>
                        <h4 className="font-bold text-slate-800 text-xs mt-1.5">{report.topic}</h4>
                        <div className="flex gap-4 text-[10px] text-slate-400 mt-1 flex-wrap">
                          <span>👩‍🏫 Педагог: <strong className="text-slate-600">{report.teacherName}</strong></span>
                          <span>⏳ Длительность: {report.duration}</span>
                          <span>📅 Дата: {report.date}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {report.isVoiceText && (
                          <span className="bg-orange-50 border border-orange-250 text-orange-700 text-[8.5px] font-extrabold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 font-sans">
                            🎤 Голосовой отчет
                          </span>
                        )}
                        
                        {audit ? (
                          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-150 rounded-xl p-1.5 px-2.5">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-[10px] font-extrabold text-emerald-800 font-mono">
                              ИИ-Качество: {audit.rating}%
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={() => runAiAudit(report.id, report.rawText)}
                            disabled={auditingId === report.id}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl transition shadow-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            {auditingId === report.id ? 'Скан...' : 'ИИ-Аудит качества'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Raw Text View */}
                    <div className="mt-3 bg-white p-3 border border-slate-200/60 rounded-xl text-[11px] text-slate-600 font-sans leading-relaxed">
                      <span className="font-bold text-slate-400 block mb-1 uppercase text-[8px] tracking-wider">Оригинальный конспект:</span>
                      "{report.rawText}"
                    </div>

                    {/* Audit Output Result */}
                    {audit && (
                      <div className="mt-2.5 bg-emerald-100/40 p-3 border border-emerald-200/50 rounded-xl text-[10.5px] text-slate-600 leading-normal flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-extrabold text-emerald-900 block mb-0.5">Резолюция ИИ-Службы Контроля качества:</span>
                          <p className="font-sans font-medium">{audit.feedback}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredReports.length === 0 && (
                <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                  <p className="text-slate-400 text-xs">Нет подходящих отчетов для проверки.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. GROUP LEADERBOARDS & EXECUTIVE WARNINGS (RIGHT COLUMN - 1 SPAN) */}
        <div className="space-y-6">
          
          {/* Executive Warnings Risk Board */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
              <AlertTriangle className="w-5 h-5 text-amber-500 animate-pulse" />
              <div>
                <h3 className="font-bold text-slate-800 text-xs text-sm">Сводка тревог по оттоку (EWS)</h3>
                <p className="text-[10px] text-slate-400">Снижение вовлеченности на {highRiskStudents.length} учениках</p>
              </div>
            </div>

            <div className="space-y-3.5 leading-relaxed font-sans">
              {highRiskStudents.map((student) => {
                const activeAlert = ewsAlerts.find(a => a.studentId === student.id);
                return (
                  <div key={student.id} className="border border-red-150 bg-red-50/40 p-3.5 rounded-xl">
                    <div className="flex items-center gap-2">
                      <img src={student.avatar} alt={student.name} className="w-7 h-7 rounded-lg object-cover" />
                      <div>
                        <h4 className="font-bold text-slate-800 text-[11px]">{student.name}</h4>
                        <span className="text-[9px] text-slate-400">{student.groupName}</span>
                      </div>
                    </div>
                    <div className="mt-2 text-[10px] text-slate-650 bg-white/80 p-2 rounded-lg border border-red-100">
                      <span className="font-bold text-rose-950 block">ИИ-Диагноз оттока:</span>
                      "{activeAlert ? activeAlert.reason : 'Критическое количество пропусков занятий за 14 дней.'}"
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* School Groups Leaderboard */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
              <Award className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Рейтинг учебных групп</h3>
                <p className="text-[10px] text-slate-400">Сортировка по вовлеченности и квестам</p>
              </div>
            </div>

            <div className="space-y-3.5">
              {groups.map((group, idx) => (
                <div key={group.id} className="flex items-center justify-between gap-2.5 p-2 border border-slate-100 rounded-xl hover:bg-slate-50 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-[10.5px] leading-tight-none">{group.name}</h4>
                      <div className="flex gap-2 text-[8.5px] text-slate-400 mt-0.5">
                        <span>Студентов: {group.studentsCount}</span>
                        <span>Квесты: {group.questsCompleted || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-extrabold text-indigo-700 font-mono tracking-tight block">
                      {group.engagementRate || 85}%
                    </span>
                    <span className="text-[8.5px] text-slate-400 uppercase tracking-wide block">КПД класса</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
