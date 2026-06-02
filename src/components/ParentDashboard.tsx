import React, { useState } from 'react';
import { Student, StudentProgress, LessonReport } from '../types';
import { Award, Calendar, AlertTriangle, BookOpen, Printer, User, Sparkles } from 'lucide-react';

interface ParentDashboardProps {
  students: Student[];
  progressList: StudentProgress[];
  reports: LessonReport[];
  ewsAlerts?: any[];
}

export default function ParentDashboard({ students, progressList, reports, ewsAlerts = [] }: ParentDashboardProps) {
  // Simulating parents seeing context for Alexander and Victoria
  const parentStudents = students.filter(s => s.id === 's1' || s.id === 's2' || s.id === 's3');
  const [activeStudentId, setActiveStudentId] = useState(parentStudents[0]?.id || 's1');

  const selectedChild = students.find(s => s.id === activeStudentId) || parentStudents[0];
  const progress = progressList.find(p => p.studentId === selectedChild?.id);

  const handlePrint = () => {
    window.print();
  };

  if (!selectedChild || !progress) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-3">
        <p className="text-slate-500">Загрузка данных родительского кабинета...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* CHILD SWITCHER & EXPORT BAR */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center justify-between flex-wrap gap-4 no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <User className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Ученики вашей семьи</h3>
            <p className="text-[10px] text-slate-400">Переключайте детей для просмотра результатов</p>
          </div>
        </div>

        {/* Switchers buttons */}
        <div className="flex items-center gap-2">
          {parentStudents.map((child) => (
            <button
              key={child.id}
              onClick={() => setActiveStudentId(child.id)}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition active:scale-95 flex items-center gap-2 cursor-pointer ${
                activeStudentId === child.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <img
                src={child.avatar}
                alt={child.name}
                referrerPolicy="no-referrer"
                className="w-5 h-5 rounded-full object-cover"
              />
              <span>{child.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Export action */}
        <button
          onClick={handlePrint}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 px-5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Printer className="w-4 h-4" /> Скачать PDF-Отчет
        </button>
      </div>

      {/* PRINT-ONLY HEADER */}
      <div className="hidden print:block p-6 border-b border-slate-300 mb-8 font-sans">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-display">AI EdCenter Tracker</h1>
            <p className="text-xs text-slate-500">Автоматически сгенерированный табель успеваемости ученика</p>
          </div>
          <div className="text-right text-xs text-slate-400">
            <p>Дата печати: {new Date().toLocaleDateString('ru-RU')}</p>
            <p>Лицензия: № RL-8849-0</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div>
            <p className="text-slate-505 font-semibold uppercase tracking-wider text-[9px]">Студент:</p>
            <p className="text-sm font-bold text-slate-800">{selectedChild.name}</p>
            <p className="text-slate-600 font-medium">Группа: {selectedChild.groupName}</p>
          </div>
          <div>
            <p className="text-slate-505 font-semibold uppercase tracking-wider text-[9px]">Родитель:</p>
            <p className="text-sm font-bold text-slate-800">{selectedChild.parentName}</p>
            <p className="text-slate-600 font-medium">Телеграм для уведомлений: {selectedChild.telegramId}</p>
          </div>
        </div>
      </div>

      {/* CORE INFO SUMMARY GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Metric Cards */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 flex flex-col justify-between shadow-sm relative overflow-hidden print-card">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Игровой Уровень</span>
          <div className="my-3 flex items-baseline gap-1">
            <span className="text-4xl font-extrabold text-indigo-600 font-display">{selectedChild.level}</span>
            <span className="text-sm text-slate-400">левел</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
            <div
              style={{ width: `${(selectedChild.xp % 400) / 4}%` }}
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
            ></div>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">До следующего уровня: {400 - (selectedChild.xp % 400)} XP</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 flex flex-col justify-between shadow-sm relative overflow-hidden print-card">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Средний балл уроков</span>
          <div className="my-3 flex items-baseline gap-1">
            <span className="text-4xl font-extrabold text-emerald-600 font-display">{selectedChild.generalScore}</span>
            <span className="text-sm text-slate-400">из 5</span>
          </div>
          <span className="text-emerald-700 text-[10px] font-semibold bg-emerald-50 py-1 px-2.5 border border-emerald-150 rounded-full inline-block self-start">
            ★ {selectedChild.generalScore >= 4.5 ? 'Превосходно' : 'Хорошо'}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 flex flex-col justify-between shadow-sm relative overflow-hidden print-card">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Посещаемость занятий</span>
          <div className="my-3 flex items-baseline gap-1">
            <span className="text-4xl font-extrabold text-slate-800 font-display">{selectedChild.attendanceRate}%</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Лимит для зачета:</span>
              <span className="font-semibold text-slate-705">75%</span>
            </div>
            {selectedChild.attendanceRate < 75 ? (
              <span className="text-rose-600 font-semibold text-[10px] flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Опасно низкая
              </span>
            ) : (
              <span className="text-emerald-600 font-semibold text-[10px]">✓ Соответствует нормативам</span>
            )}
          </div>
        </div>
      </div>

      {/* Parental EWS Alert Notification if exists */}
      {(() => {
        const activeAlert = ewsAlerts.find(a => a.studentId === selectedChild.id);
        if (!activeAlert) return null;

        return (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 shadow-xs flex items-start gap-4 animate-fadeIn no-print">
            <div className="p-3 bg-amber-500 text-white rounded-xl shadow-xs shrink-0">
              <AlertTriangle className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <h4 className="font-bold text-slate-800 text-sm">
                  ⚠️ Телеграм ИИ-Предупреждение: Риск снижения вовлеченности
                </h4>
                <span className="bg-amber-100 border border-amber-300 text-amber-800 font-bold text-[9px] uppercase px-2.5 py-0.5 rounded-full">
                  Требуется внимание
                </span>
              </div>
              <p className="text-xs text-slate-650 leading-relaxed font-sans">
                Система автоматического мониторинга успеваемости (EWS) зафиксировала спад активности у Вашего ребенка.
              </p>
              <div className="bg-white/80 p-3 rounded-xl border border-amber-200/50 text-[11px] text-slate-700 font-sans leading-normal">
                <span className="font-bold text-amber-900 block mb-0.5">Причина тревоги:</span>
                "{activeAlert.reason}"
              </div>
              <div className="text-[11px] text-slate-705 font-medium leading-relaxed font-sans pt-1">
                <span className="font-bold text-indigo-900 block mb-0.5">💡 Персональный ИИ-Совет родителю:</span>
                {activeAlert.parentRecommendation}
              </div>
            </div>
          </div>
        );
      })()}

      {/* AI INTELLIGENT REMINDERS & THREATS DIAGNOSIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print-card">
        
        {/* Child's Strengths - AI generated */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <Sparkles className="w-4 h-4 text-emerald-500 fill-emerald-500" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm">Сильные стороны ребенка (Победы):</h4>
          </div>

          <div className="space-y-3">
            {progress.strengths.map((strength, i) => (
              <div key={i} className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  ✓
                </span>
                <div>
                  <p className="text-xs text-slate-700 mt-0.5">{strength}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Areas of concern & Churn mitigation recommendations */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
            <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm">Проблемные темы и слабые места:</h4>
          </div>

          <div className="space-y-3">
            {progress.weakTopics.map((topic, i) => (
              <div key={i} className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  !
                </span>
                <div>
                  <p className="text-xs text-slate-700 mt-0.5">{topic}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RECENT HOMEWORKS AND ROADMAP PLANS */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm print-card">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <BookOpen className="w-4 h-4 text-indigo-500" />
          </div>
          <h4 className="font-bold text-slate-800 text-sm">Домашнее задание и план занятий на дом:</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {progress.recommendations.map((rec, i) => (
            <div key={i} className="bg-slate-50/50 rounded-2xl p-4 border border-slate-200">
              <span className="text-[10px] font-bold text-indigo-650 uppercase tracking-wider block mb-1">Задача {i + 1}</span>
              <p className="text-xs text-slate-705 leading-relaxed">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* TRACK CHRONICLES TIMELINE VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Attendance Chronicle Log */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm print-card">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
            <Calendar className="w-4.5 h-4.5 text-slate-500" />
            <h4 className="font-bold text-slate-800 text-sm">Хроника посещаемости и тем уроков</h4>
          </div>

          <div className="space-y-4">
            {progress.attendanceHistory.map((history, idx) => (
              <div key={idx} className="flex items-start justify-between flex-wrap gap-2 text-xs border-b border-slate-200 pb-3 last:border-0 last:pb-0">
                <div className="flex items-start gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 ${
                    history.status === 'present'
                      ? 'bg-emerald-500'
                      : history.status === 'late'
                      ? 'bg-amber-400'
                      : 'bg-rose-500'
                  }`}></span>
                  <div>
                    <h5 className="font-bold text-slate-705">{history.topic}</h5>
                    <span className="text-[10px] text-slate-400 font-mono">Дата: {history.date}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                    history.status === 'present'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      : history.status === 'late'
                      ? 'bg-amber-50 text-amber-700 border-amber-100'
                      : 'bg-rose-50 text-rose-700 border-rose-100'
                  }`}>
                    {history.status === 'present' ? 'Присутствовал' : history.status === 'late' ? 'Опоздал' : 'Отсутствовал'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Badges / Gamified Achievements Unlocked */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm print-card">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
            <Award className="w-4.5 h-4.5 text-amber-505" />
            <h4 className="font-bold text-slate-800 text-sm">Достижения и трофеи 🏆</h4>
          </div>

          <div className="space-y-4">
            {progress.achievements.length === 0 ? (
              <div className="text-center py-6">
                <span className="text-2xl block mb-1">🥉</span>
                <p className="text-xs text-slate-400">Пока нет разблокированных достижений</p>
              </div>
            ) : (
              progress.achievements.map((ach) => (
                <div key={ach.id} className="flex items-center gap-3 border border-slate-200 rounded-xl p-3 bg-slate-50/50 hover:bg-slate-50 transition">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">
                    ⭐
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-800">{ach.title}</h5>
                    <p className="text-[10px] text-slate-500 leading-tight">{ach.description}</p>
                    <span className="text-[9px] text-slate-400 font-mono mt-1 block">Достигнуто: {ach.unlockedAt}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* PRINT-ONLY SIGNATURE ROW */}
      <div className="hidden print:flex justify-between items-center mt-12 pt-12 border-t border-slate-250 text-xs">
        <div>
          <p className="text-slate-400 font-medium">Генеральный директор школы:</p>
          <div className="w-40 border-b border-slate-400 h-8"></div>
          <p className="mt-1 font-semibold text-slate-700">А. В. Кузнецов</p>
        </div>
        <div className="text-right">
          <p className="text-slate-400 font-medium">Штамп Учебного Центра:</p>
          <div className="w-24 h-24 border border-slate-300 rounded-full flex items-center justify-center text-[10px] text-indigo-650 font-bold border-dashed mx-auto my-1">
            EduAI Certified
          </div>
        </div>
      </div>
    </div>
  );
}
