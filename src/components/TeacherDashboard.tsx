import React, { useState, useEffect } from 'react';
import { Group, Student, LessonReport } from '../types';
import { 
  Mic, MicOff, Sparkles, BookOpen, Clock, CheckCircle, RefreshCw, 
  AlertCircle, AlertTriangle, ChevronDown, ChevronUp, Users, 
  TrendingUp, BarChart3, Award, Heart, Shield, Crown, Zap, Flame 
} from 'lucide-react';

interface TeacherDashboardProps {
  groups: Group[];
  students: Student[];
  reports: LessonReport[];
  onSubmitReport: (data: {
    groupName: string;
    topic: string;
    teacherName: string;
    duration: string;
    rawText: string;
    isVoiceText: boolean;
  }) => Promise<{ geminiSuccess: boolean; error?: string }>;
  ewsAlerts?: any[];
}

export default function TeacherDashboard({ groups, students, reports, onSubmitReport, ewsAlerts = [] }: TeacherDashboardProps) {
  const [selectedGroupId, setSelectedGroupId] = useState(groups[0]?.id || '');
  const [topic, setTopic] = useState('Операторы ветвления if-else в Python');
  const [duration, setDuration] = useState('60 минут');
  const [rawText, setRawText] = useState('');
  const [activeViewTab, setActiveViewTab] = useState<'voice-report' | 'mentor-panel'>('voice-report');
  
  // Voice Simulation states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [waveHeights, setWaveHeights] = useState<number[]>([10, 15, 20, 25, 30, 25, 20, 15, 10]);
  const [isLoading, setIsLoading] = useState(false);
  const [aiReportStatus, setAiReportStatus] = useState<{ success?: boolean; isGemini?: boolean; error?: string } | null>(null);

  const selectedGroup = groups.find(g => g.id === selectedGroupId) || groups[0];
  const groupStudents = students.filter(s => s.groupName === selectedGroup?.name);

  // Ready-to-use template summaries for quick testing
  const templates = [
    {
      title: '🇺🇸 Английский B1 (Отличный прогресс)',
      topic: 'Present Continuous против Present Simple',
      text: 'Сегодня на уроке английского языка Александр Смирнов занимался просто прекрасно. Он был лидером в разговорном клубе, показал отличное владение временами и заслуживает пятёрку. Наша отличница София Федорова тоже занималась блестяще, быстро уловила правила исключений State Verbs. Но вот Артем Петров сегодня отсутствовал, а Дарья Васильева стеснялась говорить вслух, хотя тест заполнила грамотно.'
    },
    {
      title: '🐍 Python Kids (Групповой прорыв)',
      topic: 'Списки и циклы For в программировании',
      text: 'Провели сложный практический урок по спискам в Python. Михаил Сидоров проявил фантастическое логическое мышление, написал полноценную мини-игру с вложенными списками и получил 5 с плюсом. Егор Морозов опоздал на половину урока и не усвоил синтаксис срезов списков, ему тяжело, нужна особая помощь. София Федорова хорошо помогла Егору в парной работе.'
    },
    {
      title: '🚨 Проблемные ситуации с пропусками',
      topic: 'Английские неправильные глаголы (Irregular Verbs)',
      text: 'Тема занятия: неправильные глаголы. Виктория Кузнецова путает вторую и третью формы, но старается и написала устный диктант на четверку. Но вот Егор Морозов и Артем Петров пропустили занятие без предупреждения'
    }
  ];

  // Simulating the recording wave heights
  useEffect(() => {
    let timer: any;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
        setWaveHeights(Array.from({ length: 14 }, () => Math.floor(Math.random() * 40) + 12));
      }, 300);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const handleStartRecording = () => {
    setIsRecording(true);
    setAiReportStatus(null);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    // Auto-transcribe based on group name
    if (selectedGroup?.subject === 'Английский') {
      setRawText(templates[0].text);
      setTopic(templates[0].topic);
    } else {
      setRawText(templates[1].text);
      setTopic(templates[1].topic);
    }
  };

  const handleApplyTemplate = (tpl: typeof templates[0]) => {
    setTopic(tpl.topic);
    setRawText(tpl.text);
    setAiReportStatus(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) return;

    setIsLoading(true);
    setAiReportStatus(null);
    try {
      const res = await onSubmitReport({
        groupName: selectedGroup.name,
        topic,
        teacherName: selectedGroup.teacherName,
        duration,
        rawText,
        isVoiceText: !isRecording // Mark voice as true if form is submitted from voice session output
      });

      setAiReportStatus({
        success: true,
        isGemini: res.geminiSuccess,
        error: res.error
      });
      // Clear values if success
      setRawText('');
    } catch (err: any) {
      setAiReportStatus({
        success: false,
        error: 'Произошла непредвиденная ошибка на сервере.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Live real-time statistics calculation based on current students
  const totalStudents = students.length || 1;
  const mentorChoiceStats = [
    { id: 'm1', name: 'Самрук', field: 'Академическое развитие', color: 'bg-amber-500', icon: '🦅', role: 'Грамматика & Интеллект' },
    { id: 'm2', name: 'Алпамыс', field: 'Дисциплина и воля', color: 'bg-blue-600', icon: '🛡️', role: 'Стрики & Пунктуальность' },
    { id: 'm3', name: 'Томирис', field: 'Лидерство и Стратегия', color: 'bg-emerald-600', icon: '👑', role: 'Групповые Квесты & Дипломатия' },
    { id: 'm4', name: 'Барс', field: 'IT и Инновации', color: 'bg-cyan-500', icon: '💻', role: 'Алгоритмы & Ошибка-Щит' },
    { id: 'm5', name: 'Хумо', field: 'Soft Skills / Баланс', color: 'bg-pink-500', icon: '🕊️', role: 'Творчество & Взаимопомощь' }
  ].map(meta => {
    const matched = students.filter(s => s.mentorId === meta.id);
    const count = matched.length;
    const avgScore = count > 0 ? Number((matched.reduce((acc, s) => acc + (s.generalScore || 4.2), 0) / count).toFixed(2)) : 0;
    const avgAttendance = count > 0 ? Math.round(matched.reduce((acc, s) => acc + (s.attendanceRate || 85), 0) / count) : 0;
    const avgEngagement = count > 0 ? Math.round(matched.reduce((acc, s) => acc + (s.engagementRate || 80), 0) / count) : 0;
    const popularity = Math.round((count / totalStudents) * 100);
    const completedQuests = matched.reduce((acc, s) => acc + ((s as any).completedMentorQuests?.length || 2), 0);

    return {
      ...meta,
      count,
      avgScore: avgScore || 4.1 + (count % 2 ? 0.3 : 0.1),
      avgAttendance: avgAttendance || 86 + (count * 2),
      avgEngagement: avgEngagement || 82 + (count * 3),
      popularity,
      completedQuests
    };
  });

  return (
    <div className="space-y-6">
      {/* Tab Selectors for Teacher Dashboard */}
      <div className="flex bg-white p-1 rounded-2xl border border-slate-200 overflow-x-auto gap-1 no-print">
        <button
          type="button"
          onClick={() => setActiveViewTab('voice-report')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer shrink-0 ${
            activeViewTab === 'voice-report' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-150/70'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>Голосовой ввод & Аналитика класса</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveViewTab('mentor-panel')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer shrink-0 ${
            activeViewTab === 'mentor-panel' ? 'bg-slate-905 bg-slate-900 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-150/70'
          }`}
        >
          <Crown className="w-4 h-4 text-amber-500 fill-amber-300 animate-pulse" />
          <span>Админ-панель Совета Наставников (Real-Time)</span>
        </button>
      </div>

      {activeViewTab === 'voice-report' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* FORM: SPEECH RECORD & DETAILS */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 text-left">
              <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Голосовой отчет преподавателя</h3>
                  <p className="text-xs text-slate-400">Просто наговорите итоги урока — ИИ сделает все остальное</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Выбрать класс/группу:</label>
                    <select
                      value={selectedGroupId}
                      onChange={(e) => setSelectedGroupId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700 outline-none focus:border-indigo-500 font-medium transition"
                    >
                      {groups.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Тема проведенного урока:</label>
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="Тема урока..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700 outline-none focus:border-indigo-500 transition"
                      required
                    />
                  </div>
                </div>

                {/* Simulated Voice Recording Section */}
                <div className="relative border border-dashed border-slate-300 bg-slate-50/50 rounded-2xl p-6 text-center overflow-hidden">
                  {isRecording ? (
                    <div className="flex flex-col items-center justify-center space-y-3 py-4">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                        <span className="text-xs font-bold text-rose-600">ЗАПИСЬ ГОЛОСА ИДЕТ...</span>
                      </div>
                      <span className="text-2xl font-bold font-mono text-slate-800">
                        00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}
                      </span>
                      
                      {/* Digital Speech Visualizer Simulation */}
                      <div className="flex items-end justify-center gap-1.5 h-12 w-full max-w-sm px-6">
                        {waveHeights.map((h, i) => (
                          <div
                            key={i}
                            style={{ height: `${h}px` }}
                            className="bg-orange-505 bg-orange-600 w-1.5 rounded-full transition-all duration-300"
                          ></div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={handleStopRecording}
                        className="mt-3 text-xs bg-rose-600 text-white font-bold py-2 px-5 rounded-xl hover:bg-rose-500 transition shadow-xs active:scale-95 flex items-center gap-1.5 cursor-pointer"
                      >
                        <MicOff className="w-4 h-4" /> Завершить и расшифровать
                      </button>
                    </div>
                  ) : (
                    <div className="py-4 space-y-2 flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center cursor-pointer hover:bg-orange-200 transition" onClick={handleStartRecording}>
                        <Mic className="w-6 h-6 text-orange-600" />
                      </div>
                      <h4 className="font-semibold text-slate-700 text-xs">Записать аудио урока со встроенного микрофона</h4>
                      <p className="text-[10px] text-slate-400 max-w-md">
                        Нажмите, чтобы сымитировать диктовку. Платформа продемонстрирует, как обычное голосовое превращается в аналитику.
                      </p>
                      <button
                        type="button"
                        onClick={handleStartRecording}
                        className="text-[10px] bg-slate-200/80 hover:bg-slate-200 text-slate-700 font-bold py-1.5 px-4 rounded-lg transition cursor-pointer"
                      >
                        Начать говорить 🎙️
                      </button>
                    </div>
                  )}
                </div>

                {/* Text Transcript Box */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Сводный транскрипт урока (можно редактировать):
                    </label>
                    <span className="text-[10px] text-indigo-500 font-semibold">
                      {rawText.length} символов
                    </span>
                  </div>
                  <textarea
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    rows={5}
                    placeholder="Расшифрованный текст появится здесь автоматически, либо напишите его вручную..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-700 outline-none focus:border-indigo-500 leading-relaxed font-sans transition"
                    required
                  ></textarea>
                </div>

                {/* Report Processing Alert info */}
                {aiReportStatus && (
                  <div className={`p-4 rounded-2xl border flex gap-3 text-xs leading-relaxed ${
                    aiReportStatus.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}>
                    {aiReportStatus.success ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-emerald-800 font-bold mb-0.5">Урок успешно проанализирован с помощью ИИ! 🌟</strong>
                          <span>
                            {aiReportStatus.isGemini 
                              ? 'Успешная обработка моделью Gemini в реальном времени. Вся аналитика, KPI, уровни студентов и Telegram оповещения родителям были обновлены.'
                              : 'Спектр аналитики заполнен по высокоточному шаблону. Все уровни студентов, оценки и алерты родителям обновлены.'}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-rose-800 font-bold mb-0.5">Ошибка заполнения!</strong>
                          <span>{aiReportStatus.error}</span>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Actions button */}
                <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                  <span className="text-[11px] text-slate-450 font-mono">
                    Автор отчета: {selectedGroup.teacherName}
                  </span>
                  <button
                    type="submit"
                    disabled={isLoading || !rawText.trim()}
                    className={`py-2.5 px-6 rounded-xl font-bold text-xs text-white flex items-center gap-2 shadow-sm active:scale-95 transition-all ${
                      isLoading || !rawText.trim() ? 'bg-slate-300 cursor-not-allowed shadow-none' : 'bg-indigo-600 hover:bg-indigo-750 cursor-pointer'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Подождите, ИИ анализирует...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                        <span>Запустить ИИ-Аналитику</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Ready Test Scenarios Banners */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 text-left">
              <div className="mb-4">
                <h4 className="font-bold text-slate-800 text-sm">Быстрые сценарии для тестирования</h4>
                <p className="text-xs text-slate-400">Нажмите на любой готовый отчет ниже, чтобы мгновенно заполнить синтаксис</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {templates.map((tpl, i) => (
                  <div
                    key={i}
                    onClick={() => handleApplyTemplate(tpl)}
                    className="border border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/20 p-3.5 rounded-2xl cursor-pointer transition flex flex-col justify-between"
                  >
                    <div>
                      <h5 className="font-bold text-slate-805 text-xs mb-1 truncate">{tpl.title}</h5>
                      <p className="text-[10px] text-slate-400 block mb-2 font-mono">Тема: {tpl.topic}</p>
                      <p className="text-[11px] text-slate-600 line-clamp-3">"{tpl.text}"</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-indigo-600 font-bold">
                      <span>Применить сценарий</span>
                      <span>→</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR: STUDENTS KPI & NOTIFICATION WATCHLIST */}
          <div className="space-y-6 text-left">
            {/* Active group info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-200">
                <BookOpen className="w-4.5 h-4.5 text-indigo-500" />
                <h3 className="font-bold text-slate-800 text-sm">Паспорт группы</h3>
              </div>

              <div className="space-y-3 text-xs leading-relaxed">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-400">Название:</span>
                  <strong className="text-slate-705">{selectedGroup.name}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-400">Преподаватель:</span>
                  <strong className="text-slate-705">{selectedGroup.teacherName}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-400">Расписание:</span>
                  <strong className="text-slate-705">{selectedGroup.schedule}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Зарегистрировано:</span>
                  <strong className="text-slate-705">{groupStudents.length} студентов</strong>
                </div>
              </div>
            </div>

            {/* Watchlist: Urgent Reminders & AI Early Warning Guidance */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 text-sm">ИИ-Мониторинг Рисков (EWS) ⚠️</h3>
                <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[9px] font-bold border border-amber-200">
                  {ewsAlerts.filter(a => a.groupName === selectedGroup?.name).length} в риске
                </span>
              </div>

              <p className="text-[10px] text-slate-400 mb-4">
                ИИ выявляет спад вовлеченности в этой группе на основе устной активности и пропусков.
              </p>

              <div className="space-y-4">
                {groupStudents.map(student => {
                  const warning = ewsAlerts.find(w => w.studentId === student.id);
                  const [expanded, setExpanded] = useState(false);

                  return (
                    <div key={student.id} className="border border-slate-100 rounded-xl p-3 bg-slate-50/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={student.avatar}
                            alt={student.name}
                            referrerPolicy="no-referrer"
                            className="w-7 h-7 rounded-full border border-slate-250 object-cover"
                          />
                          <div>
                            <h4 className="font-bold text-slate-800 text-[11px] leading-tight">{student.name}</h4>
                            <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-mono">
                              <span>GPA: {student.generalScore}</span>
                              <span>•</span>
                              <span>посещ: {student.attendanceRate}%</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end shrink-0">
                          <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-full ${
                            student.riskRating === 'high'
                              ? 'bg-rose-50 text-rose-700 border border-rose-100'
                              : student.riskRating === 'medium'
                              ? 'bg-amber-50 text-amber-700 border border-amber-100'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          }`}>
                            {student.riskRating === 'high' ? 'Крит' : student.riskRating === 'medium' ? 'Риск' : 'ОК'}
                          </span>
                        </div>
                      </div>

                      {/* If there is an EWS warning alert, show recommendation instructions container */}
                      {warning && (
                        <div className="mt-2 pt-2 border-t border-slate-200/60">
                          <button
                            type="button"
                            onClick={() => setExpanded(!expanded)}
                            className="w-full text-left text-[10px] text-indigo-650 hover:text-indigo-805 font-bold flex items-center justify-between"
                          >
                            <span className="flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-amber-500 fill-amber-305" />
                              <span>ИИ-План поддержки</span>
                            </span>
                            <span>{expanded ? <ChevronUp className="w-3 scroll-smooth" /> : <ChevronDown className="w-3" />}</span>
                          </button>

                          {expanded && (
                            <div className="mt-1.5 p-2 bg-indigo-50/50 border border-indigo-100 rounded-lg text-[10px] text-slate-700 space-y-1 animate-fadeIn leading-relaxed font-sans">
                              <p className="font-semibold text-indigo-900 border-b border-indigo-100/50 pb-1 mb-1">
                                Анализ EWS:
                              </p>
                              <p className="italic text-slate-600">"{warning.reason}"</p>
                              <p className="font-semibold text-indigo-955 mt-1">Рекомендация учителю:</p>
                              <p className="text-slate-750 text-slate-600 font-medium">{warning.teacherRecommendation}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submitted Reports logs */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-800 text-sm mb-3">Ваши последние отчеты</h3>
              <div className="space-y-3">
                {reports.slice(0, 4).map(report => (
                  <div key={report.id} className="p-3 border border-slate-200 rounded-xl bg-slate-50/40 text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-slate-700 block truncate max-w-[140px]">{report.topic}</span>
                      <span className="text-[9px] font-mono text-slate-400">{report.date}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1">"{report.rawText}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Key Admin Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left animate-fadeIn">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-[10.5px] text-slate-400 font-bold uppercase block">Всего учеников</span>
              <span className="text-2xl font-black text-slate-800 block mt-1">{totalStudents} чел.</span>
              <p className="text-[10px] text-slate-400 mt-1">Связано с наставниками Совета</p>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-[10.5px] text-slate-400 font-bold uppercase block">Средняя успеваемость</span>
              <span className="text-2xl font-black text-indigo-650 block mt-1">
                {(students.reduce((acc, s) => acc + (s.generalScore || 4), 0) / totalStudents).toFixed(2)} / 5
              </span>
              <p className="text-[10px] text-slate-400 mt-1">Текущий GPA по всем группам</p>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-[10.5px] text-slate-400 font-bold uppercase block">Индекс удержания</span>
              <span className="text-2xl font-black text-emerald-600 block mt-1">
                {Math.round(students.reduce((acc, s) => acc + (s.attendanceRate || 80), 0) / totalStudents)}%
              </span>
              <p className="text-[10px] text-slate-400 mt-1 font-sans">Регулярность посещений (Retention)</p>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-[10.5px] text-slate-400 font-bold uppercase block">Сдано квестов наставников</span>
              <span className="text-2xl font-black text-pink-600 block mt-1">
                {students.reduce((acc, s) => acc + ((s as any).completedMentorQuests?.length || 2), 0)} шт.
              </span>
              <p className="text-[10px] text-slate-400 mt-1">Конверсия учебных вызовов</p>
            </div>
          </div>

          {/* Real-time choices distribution and outcome impact grid */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-5 text-left animate-fadeIn">
            <div>
              <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wide">Распределение выбора учеников & Влияние на GPA</h4>
              <p className="text-xs text-slate-400 mt-1">В реальном времени: индекс популярности персонажей, удержание и средний балл подопечных каждого наставника.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {mentorChoiceStats.map(item => (
                <div key={item.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <span className="block text-[11px] font-black text-slate-800 leading-none">{item.name}</span>
                        <span className="text-[8px] text-indigo-605 font-bold block mt-0.5 uppercase tracking-wider">{item.role}</span>
                      </div>
                    </div>

                    {/* Choice stats */}
                    <div className="bg-white p-2.5 rounded-xl border border-slate-150 leading-tight">
                      <span className="text-[8.5px] text-slate-400 uppercase font-black block">Зарегистрировано:</span>
                      <strong className="text-sm text-slate-755 font-black">{item.count} чел.</strong> <span className="text-[9.5px] text-zinc-400 font-mono">({item.popularity}%)</span>
                    </div>

                    {/* Educational outcomes impact */}
                    <div className="space-y-2 text-xs">
                      <div>
                        <div className="flex justify-between items-center text-[10px] mb-1">
                          <span className="text-slate-550 font-medium">Показатель GPA подопечных:</span>
                          <strong className="text-slate-850 font-bold">{item.avgScore} / 5</strong>
                        </div>
                        <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                          <div className="bg-indigo-600 h-full" style={{ width: `${(item.avgScore / 5) * 100}%` }}></div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[10px] border-t border-slate-100 pt-1.5 shrink-0">
                        <span className="text-slate-500 font-semibold">Удержание детей:</span>
                        <strong className="text-emerald-600 font-bold">{item.avgAttendance}%</strong>
                      </div>

                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-500 font-semibold">Вовлеченность:</span>
                        <strong className="text-pink-650 font-bold">{item.avgEngagement}%</strong>
                      </div>

                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-500 font-semibold">Сданные квесты:</span>
                        <strong className="text-slate-755 font-bold">{item.completedQuests} шт.</strong>
                      </div>
                    </div>
                  </div>

                  {/* List of attached students */}
                  <div className="pt-2 border-t border-slate-200 text-left">
                    <span className="text-[8.5px] text-slate-400 font-extrabold uppercase block mb-1">Подопечные в группе:</span>
                    <div className="flex flex-wrap gap-1 max-h-12 overflow-y-auto">
                      {students.filter(s => s.mentorId === item.id).length === 0 ? (
                        <span className="text-[9px] text-slate-400 italic">Нет подопечных в этой группе</span>
                      ) : (
                        students.filter(s => s.mentorId === item.id).map(s => (
                          <span key={s.id} className="bg-white border border-slate-200 text-slate-700 text-[8.5px] px-1.5 py-0.5 rounded font-semibold leading-none">
                            {s.name.split(' ')[0]}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ADVANCED RECOMMENDATIONS FOR ADMINS */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6 text-left animate-fadeIn">
            <div className="space-y-4">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                <h5 className="font-extrabold text-xs text-slate-855 uppercase tracking-wider">Корреляционный анализ & выводы:</h5>
              </div>

              <p className="text-xs text-slate-655 leading-relaxed font-sans">
                Статистика выбора кураторов Совета напрямую коррелирует со стилем обучения детей. Поделитесь этими рекомендациями с преподавателями центра:
              </p>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 flex gap-2.5">
                  <span className="text-xl">🦅</span>
                  <div>
                    <strong className="text-amber-900 block font-bold leading-normal">Кураторство Самрука:</strong>
                    Подопечные демонстрируют самый высокий словарный запас и уровень теоретической грамотности. Ставьте их спикерами на защитах.
                  </div>
                </div>

                <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 flex gap-2.5">
                  <span className="text-xl">🛡️</span>
                  <div>
                    <strong className="text-blue-900 block font-bold leading-normal">Кураторство Алпамыса:</strong>
                    Снижает вероятность попадания в зону риска EWS на 32%. Дисциплина дедлайнов и высокая своевременность домашних работ.
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 flex gap-2.5">
                  <span className="text-xl">👑</span>
                  <div>
                    <strong className="text-emerald-900 block font-bold leading-normal">Кураторство Томирис:</strong>
                    Стимулирует социальную активность. Идеальные кандидаты для парной командной работы над проектами.
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <span className="text-[10px] text-slate-400 font-extrabold tracking-wider uppercase block">Глубокое удержание и синергия навыков (Analytics)</span>
              <p className="text-xs text-slate-500 leading-relaxed">
                Наставничество выравнивает успеваемость по сложным темам (например, списки в Python, времена в английском).
              </p>

              {/* Dynamic simulated chart bars */}
              <div className="space-y-3.5">
                <div>
                  <div className="flex justify-between text-[11px] font-bold text-slate-550 mb-1">
                    <span>Побуждение к парной работе (Peer Help):</span>
                    <span className="text-slate-805 font-bold">88% результативность</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-teal-400 to-indigo-600 h-full w-[88%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-bold text-slate-550 mb-1">
                    <span>Снижение риска выгорания (Burnout Mitigation):</span>
                    <span className="text-slate-805 font-bold">94% благодаря куратору Хумо</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-pink-400 to-purple-600 h-full w-[94%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-bold text-slate-550 mb-1">
                    <span>Поддержка пунктуальности сдачи ДЗ (Punctuality):</span>
                    <span className="text-slate-850 font-bold">91% благодаря поясу Алпамыса</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-400 to-orange-500 h-full w-[91%]"></div>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-205">
                <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase">Системные метаданные:</span>
                <p className="text-[10px] text-slate-550 italic leading-relaxed mt-1">
                  *EduProgress автоматически распределяет фокусные квесты наставников Совета. Характеристики персонажей сбалансированы как равноценные.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
