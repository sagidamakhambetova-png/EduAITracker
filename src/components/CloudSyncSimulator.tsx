import React, { useEffect, useState } from 'react';
import { Cloud, Check, RefreshCw, Laptop, Tablet, Smartphone } from 'lucide-react';

interface CloudSyncProps {
  lastSyncTime: Date;
  isSyncing: boolean;
  dataSummary: {
    studentsCount: number;
    reportsCount: number;
    notificationsCount: number;
  };
}

export default function CloudSyncSimulator({ lastSyncTime, isSyncing, dataSummary }: CloudSyncProps) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    setPulse(true);
    const timer = setTimeout(() => setPulse(false), 2000);
    return () => clearTimeout(timer);
  }, [dataSummary]);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <Cloud className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">Служба Realtime Cloud Sync</h3>
            <p className="text-xs text-slate-400">Синхронизация между устройствами</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium bg-emerald-50 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Равный доступ</span>
        </div>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed mb-6">
        Наша ИИ-платформа поставляется с архитектурой единого источника правды: любые изменения, внесённые преподавателем через голосовой отчёт, мгновенно синхронизируются в реальном времени. Все изменения видны родителям со смартфонов и администрации за ПК без перезагрузки.
      </p>

      {/* Mini Devices Simulator Grid */}
      <div className="grid grid-cols-3 gap-3 mb-6 relative">
        {pulse && (
          <div className="absolute inset-0 bg-brand-500/5 rounded-2xl animate-ping pointer-events-none border border-brand-500/30"></div>
        )}

        {/* Laptop mini */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-center flex flex-col items-center relative shadow-sm">
          <Laptop className={`w-6 h-6 mb-1 text-slate-600 ${pulse ? 'text-indigo-600 scale-110 transition-all duration-300' : ''}`} />
          <span className="font-semibold text-[10px] text-slate-700 block">ПК Администратора</span>
          <span className="text-[8px] text-slate-400 font-mono mt-1">Клиент v4.2</span>
          <div className="mt-2 text-[8px] bg-indigo-50 text-indigo-700 font-semibold px-1 rounded truncate w-full">
            Ученики: {dataSummary.studentsCount}
          </div>
        </div>

        {/* Tablet mini */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-center flex flex-col items-center relative shadow-sm">
          <Tablet className={`w-6 h-6 mb-1 text-slate-600 ${pulse ? 'text-indigo-600 scale-110 transition-all duration-300' : ''}`} />
          <span className="font-semibold text-[10px] text-slate-700 block">Планшет учителя</span>
          <span className="text-[8px] text-slate-400 font-mono mt-1">Голосовой ввод</span>
          <div className="mt-2 text-[8px] bg-violet-50 text-violet-700 font-semibold px-1 rounded truncate w-full">
            Отчёты: {dataSummary.reportsCount}
          </div>
        </div>

        {/* Phone mini */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-center flex flex-col items-center relative shadow-sm">
          <Smartphone className={`w-6 h-6 mb-1 text-slate-600 ${pulse ? 'text-indigo-600 scale-110 transition-all duration-300' : ''}`} />
          <span className="font-semibold text-[10px] text-slate-700 block">Смартфон Родителя</span>
          <span className="text-[8px] text-slate-400 font-mono mt-1">Push & Telegram</span>
          <div className="mt-2 text-[8px] bg-blue-50 text-blue-700 font-semibold px-1 rounded truncate w-full">
            Алерты: {dataSummary.notificationsCount}
          </div>
        </div>
      </div>

      <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/60 font-mono text-[11px] text-slate-600 space-y-1.5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Состояние базы данных:</span>
          <span className="text-emerald-600 font-semibold flex items-center gap-1">
            <Check className="w-3 h-3" /> Стабильно
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Сервер откликов:</span>
          <span className="text-slate-700">Cloud Run (Tokyo/Asia)</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Последний Sync:</span>
          <span className="text-indigo-600">{lastSyncTime.toLocaleTimeString('ru-RU')}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Хранилище:</span>
          <span className="text-slate-700">Firestore NoSQL [Mock-Active]</span>
        </div>
      </div>
    </div>
  );
}
