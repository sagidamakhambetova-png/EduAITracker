import React, { useState, useEffect } from 'react';
import { Send, Smartphone, Bell, MessageSquare, CheckCircle, AlertTriangle, Play, RefreshCw, User } from 'lucide-react';
import { Notification } from '../types';

interface TelegramBotSimulatorProps {
  notifications: Notification[];
  onTriggerMockNotification: (title: string, text: string, role: 'parent' | 'teacher', studentName?: string) => void;
}

export default function TelegramBotSimulator({ notifications, onTriggerMockNotification }: TelegramBotSimulatorProps) {
  const [activeTab, setActiveTab] = useState<'parent' | 'teacher'>('parent');
  const [messageText, setMessageText] = useState('');

  // Filter messages for current view
  const activeNotifs = notifications.filter(n => {
    if (activeTab === 'parent' && n.role === 'parent') return true;
    if (activeTab === 'teacher' && n.role === 'teacher') return true;
    return false;
  }).slice(0, 15);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    if (activeTab === 'parent') {
      onTriggerMockNotification(
        'Вопрос от родителя 💬',
        messageText,
        'parent',
        'Александр Смирнов'
      );
    } else {
      onTriggerMockNotification(
        'Сообщение от учителя 💡',
        messageText,
        'teacher'
      );
    }
    setMessageText('');
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 flex flex-col h-full max-w-sm mx-auto overflow-hidden">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
            <Smartphone className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">Симулятор Telegram-Бота</h3>
            <p className="text-xs text-slate-400">Синхронизация в реальном времени</p>
          </div>
        </div>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('parent')}
            className={`text-xs px-2.5 py-1 rounded-md transition-all ${
              activeTab === 'parent'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Родитель
          </button>
          <button
            onClick={() => setActiveTab('teacher')}
            className={`text-xs px-2.5 py-1 rounded-md transition-all ${
              activeTab === 'teacher'
                ? 'bg-indigo-500 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Учитель
          </button>
        </div>
      </div>

      {/* Mobile Shell Frame */}
      <div className="flex-1 bg-slate-950 rounded-2xl p-3 shadow-inner border border-slate-800 flex flex-col aspect-[9/16] overflow-hidden">
        {/* Phone Top Notch */}
        <div className="flex justify-between items-center px-4 py-1 text-[10px] text-slate-400 font-mono select-none">
          <span>15:59</span>
          <div className="w-16 h-3.5 bg-slate-900 rounded-full border border-slate-800 mx-auto -mt-1 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-indigo-900"></div>
          </div>
          <div className="flex items-center gap-1">
            <span>5G</span>
            <div className="w-4 h-2 bg-slate-400 rounded-xs"></div>
          </div>
        </div>

        {/* Telegram Chat Header */}
        <div className="bg-slate-900/90 backdrop-blur-md rounded-xl p-3 flex items-center justify-between mb-2 border border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
              EJ
            </div>
            <div>
              <h4 className="text-slate-100 font-medium text-xs">EduAI Notification Bot</h4>
              <p className="text-[10px] text-blue-400">бот школы • online</p>
            </div>
          </div>
          <div className="p-1 bg-slate-800/80 rounded-full text-slate-400 hover:text-white cursor-pointer transition">
            <Bell className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Chat Bubbles Container */}
        <div className="flex-1 overflow-y-auto px-1 py-2 space-y-3 flex flex-col-reverse text-xs scrollbar-none">
          {activeNotifs.length === 0 ? (
            <div className="my-auto text-center space-y-2 py-8">
              <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 mx-auto">
                <MessageSquare className="w-5 h-5" />
              </div>
              <p className="text-slate-500 text-xs">История сообщений пуста</p>
              <p className="text-slate-600 text-[10px] px-4">
                {activeTab === 'parent'
                  ? 'Здесь будут появляться оповещения об успеваемости, пропусках, оценках и ДЗ вашего ребенка.'
                  : 'Здесь преподаватели получают напоминания об отчетах и алерты по ученикам из зоны риска ухода.'}
              </p>
            </div>
          ) : (
            activeNotifs.map((notif) => {
              const isAlert = notif.title.includes('⚠️') || notif.title.includes('🚨') || notif.type === 'teacher_alert';
              return (
                <div
                  key={notif.id}
                  className={`max-w-[85%] rounded-2xl p-3 leading-relaxed transition-all self-start ${
                    isAlert
                      ? 'bg-red-950/40 text-red-100 border border-red-900/50'
                      : 'bg-blue-950/40 text-blue-100 border border-blue-900/50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-[11px] mb-1">
                    {isAlert ? (
                      <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                    ) : (
                      <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                    )}
                    <span className={isAlert ? 'text-amber-300' : 'text-emerald-300'}>
                      {notif.title}
                    </span>
                  </div>
                  {notif.studentName && (
                    <span className="text-[10px] text-slate-400 block -mt-1 mb-1 font-mono">
                      Студент: {notif.studentName}
                    </span>
                  )}
                  <p className="text-slate-300 text-xs text-[11px]">{notif.message}</p>
                  
                  {/* Action inline buttons */}
                  <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex justify-between items-center text-[9px] text-slate-400">
                    <span className="font-mono">16:00</span>
                    <span className="text-blue-400 hover:underline cursor-pointer flex items-center gap-0.5">
                      Открыть в ЛК →
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Message Input Form */}
        <form onSubmit={handleSendMessage} className="mt-2 pt-2 border-t border-slate-900 flex items-center gap-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder={
              activeTab === 'parent'
                ? 'Напишите школе...'
                : 'Сообщение в администрацию...'
            }
            className="flex-1 bg-slate-900 text-slate-100 border border-slate-800 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 placeholder-slate-600 transition"
          />
          <button
            type="submit"
            className="p-1.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition shadow-md active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Simulator Actions helper */}
      <div className="mt-4 space-y-2">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Быстрые триггеры бота:</h4>
        {activeTab === 'parent' ? (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onTriggerMockNotification('Успешно сдан зачёт! 🏆', 'Здравствуйте! Виктория сегодня блестяще защитила проектную работу и перешла на уровень "Junior Pro"! Рекомендация в системе.', 'parent', 'Виктория Кузнецова')}
              className="text-[10px] bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 py-1 px-2 rounded-lg text-left truncate transition"
            >
              🎉 Наградить Вику
            </button>
            <button
              onClick={() => onTriggerMockNotification('Не выполнено ДЗ ⚠️', 'Студент Артем Петров пропустил сдачу ДЗ по теме "Грамматика". Требуется уделить внимание повторению слов.', 'parent', 'Артем Петров')}
              className="text-[10px] bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 py-1 px-2 rounded-lg text-left truncate transition"
            >
              ⚠️ ДЗ Артема
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onTriggerMockNotification('Напоминание преподавателю ⏰', 'Уважаемый учитель, у группы "Python Kids" скоро занятие. Пожалуйста, не забудьте включить запись голоса.', 'teacher')}
              className="text-[10px] bg-indigo-50 hover:bg-slate-100 border border-indigo-100 text-indigo-700 py-1 px-2 rounded-lg text-left truncate transition"
            >
              ⏰ Дедлайн отчета
            </button>
            <button
              onClick={() => onTriggerMockNotification('Критическое падение KPI 🚨', 'Обратите внимание: студент Егор Морозов рискует сойти с дистанции. KPI успеваемости упал до 62%.', 'teacher')}
              className="text-[10px] bg-pink-50 hover:bg-pink-100 border border-pink-100 text-pink-700 py-1 px-2 rounded-lg text-left truncate transition"
            >
              🚨 Риск Морозова
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
