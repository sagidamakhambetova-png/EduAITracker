import React, { useState, useEffect } from 'react';
import { 
  Github, Globe, Key, Check, CheckCircle2, XCircle, Clipboard, 
  Download, Terminal, Settings, Play, Sparkles, BookOpen, 
  ArrowRight, Lock, Eye, EyeOff, ExternalLink, X, RefreshCw 
} from 'lucide-react';

interface GitHubPublishModalProps {
  onClose: () => void;
}

export default function GitHubPublishModal({ onClose }: GitHubPublishModalProps) {
  const [customKey, setCustomKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [copiedText, setCopiedText] = useState<'clone' | 'install' | 'dev' | 'build' | 'key' | null>(null);
  
  // Validation State
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    checked: boolean;
    success: boolean;
    message?: string;
    quote?: string;
  } | null>(null);

  // Load custom key on open
  useEffect(() => {
    const savedKey = localStorage.getItem('custom_gemini_api_key') || '';
    setCustomKey(savedKey);
  }, []);

  const handleSaveKey = (val: string) => {
    setCustomKey(val);
    if (val.trim()) {
      localStorage.setItem('custom_gemini_api_key', val.trim());
    } else {
      localStorage.removeItem('custom_gemini_api_key');
    }
    setValidationResult(null);
  };

  const verifyKey = async () => {
    if (!customKey.trim()) return;
    setIsValidating(true);
    setValidationResult(null);

    try {
      const res = await fetch('/api/check-custom-gemini-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ customGeminiKey: customKey.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setValidationResult({
          checked: true,
          success: true,
          message: data.message,
          quote: data.quote
        });
      } else {
        setValidationResult({
          checked: true,
          success: false,
          message: data.error || 'Критическая ошибка проверки авторизации'
        });
      }
    } catch (err: any) {
      setValidationResult({
        checked: true,
        success: false,
        message: 'Не удалось связаться с сервером валидации: ' + err.message
      });
    } finally {
      setIsValidating(false);
    }
  };

  const copyToClipboard = (text: string, type: 'clone' | 'install' | 'dev' | 'build' | 'key') => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const downloadEnvFile = () => {
    const envContent = `# .env — Настройки конфигурации для EduAI Tracker
# Скопируйте этот файл в корень проекта, переименуйте в .env и укажите ваши ключи

# Порт запуска приложения (Реверс-прокси перенаправляет на 3000)
PORT=3000

# Режим окружения
NODE_ENV=production

# Ваш Ключ API Google Gemini (Получите бесплатно на https://aistudio.google.com/)
GEMINI_API_KEY=${customKey ? customKey.trim() : 'ВАШ_API_КЛЮЧ_GEMINI'}

# (Опционально) Настройки вашего Telegram-бота для реальных оповещений родителей
# TELEGRAM_BOT_TOKEN=
# TELEGRAM_TEST_CHAT_ID=
`;

    const blob = new Blob([envContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '.env';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn no-print text-left font-sans">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600/30 rounded-xl flex items-center justify-center border border-indigo-500/30">
              <Github className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">Экспорт в GitHub & Публикация ИИ</h2>
              <p className="text-[11px] text-slate-300">Интеграция проекта, автономный запуск и развертывание для сторонних родителей и учителей</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          
          {/* Welcome Info Banner */}
          <div className="bg-indigo-50/60 border border-indigo-120 p-4 rounded-2xl flex gap-3.5">
            <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5 animate-pulse" />
            <div className="text-xs leading-relaxed text-slate-700">
              <strong>Адаптивность для публикации и репозиториев:</strong> Проект полностью подготовлен к публикации и переносу на GitHub сторонними пользователями! Поскольку ключи окружения (например, Gemini API) не выгружаются в публичный доступ по соображениям безопасности, мы внедрили <strong>клиентский шлюз</strong>. Теперь любой человек, открыв вашу публикацию или запустив репозиторий, сможет указать свой собственный ключ API, сделав функционал реального ИИ мгновенно активным.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* LEFT CELL: CUSTOM GEMINI API KEY CONTROLS */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <h3 className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5 uppercase tracking-wide mb-1.5">
                  <Key className="w-4 h-4 text-indigo-505" />
                  Ваш Ключ API Gemini (Local)
                </h3>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Позволяет сторонним пользователям публикации или локального репозитория делать в реальном времени устные ИИ-отчеты силами своего ключа.
                </p>

                {/* Input block with toggle visibility */}
                <div className="mt-3.5 relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={customKey}
                    onChange={(e) => handleSaveKey(e.target.value)}
                    placeholder="Вставьте ваш AI API Key (AIzaSy...)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 pr-10 text-xs font-mono text-slate-650 outline-none focus:border-indigo-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-2 text-slate-400 hover:text-slate-600"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Verify & Status Indicator */}
              <div className="space-y-3">
                {validationResult ? (
                  <div className={`p-3.5 rounded-xl border text-[11px] leading-relaxed ${
                    validationResult.success 
                      ? 'bg-emerald-50 border-emerald-150 text-emerald-900' 
                      : 'bg-rose-50 border-rose-150 text-rose-900'
                  }`}>
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      {validationResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <span>{validationResult.success ? 'Соединение с ИИ установлено!' : 'Ошибка валидации ключа'}</span>
                    </div>
                    <p>{validationResult.message}</p>
                    {validationResult.quote && (
                      <p className="mt-1.5 italic text-slate-500 bg-white/60 p-2 rounded border border-emerald-100 font-medium">
                        *Ответ Gemini 3.5: "{validationResult.quote}"
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-400 bg-slate-50 p-2.5 rounded-xl border border-dashed border-slate-200">
                    * Ключ сохраняется локально только в вашем браузере (в localStorage), гарантируя 100% приватность без передачи третьим лицам.
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 justify-between">
                  {customKey.trim() && (
                    <button
                      type="button"
                      onClick={verifyKey}
                      disabled={isValidating}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[11.5px] px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isValidating ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Проверка...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Проверить ключ ⚡</span>
                        </>
                      )}
                    </button>
                  )}
                  
                  <button
                    type="button"
                    onClick={downloadEnvFile}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11.5px] px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ml-auto"
                    title="Скачать преднастроенный .env файл"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Скачать .env</span>
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT CELL: GITHUB LOCAL SETUP COMMANDS */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5 uppercase tracking-wide">
                <Terminal className="w-4 h-4 text-slate-700" />
                Быстрый запуск на ПК через Терминал
              </h3>
              
              <div className="space-y-3.5">
                {/* Clone */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                    <span>1. Клонирование репозитория:</span>
                    <button 
                      onClick={() => copyToClipboard('git clone <ссылка_на_ваш_экспорт_гитхаб>', 'clone')}
                      className="text-indigo-600 hover:text-indigo-800 shrink-0 font-bold"
                    >
                      {copiedText === 'clone' ? 'Скопировано!' : 'Копировать'}
                    </button>
                  </div>
                  <div className="bg-slate-900 rounded-xl p-2.5 font-mono text-[11px] text-emerald-400 flex items-center justify-between border border-slate-855">
                    <span>git clone &lt;ссылка_на_ваш_экспорт_гитхаб&gt;</span>
                  </div>
                </div>

                {/* Install */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                    <span>2. Установка зависимостей (Express/Typescript):</span>
                    <button 
                      onClick={() => copyToClipboard('npm install', 'install')}
                      className="text-indigo-600 hover:text-indigo-800 shrink-0 font-bold"
                    >
                      {copiedText === 'install' ? 'Скопировано!' : 'Копировать'}
                    </button>
                  </div>
                  <div className="bg-slate-900 rounded-xl p-2.5 font-mono text-[11px] text-emerald-400 flex items-center justify-between border border-slate-855">
                    <span>npm install</span>
                  </div>
                </div>

                {/* Run Dev Server */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                    <span>3. Запуск ИИ-платформы в dev-режиме:</span>
                    <button 
                      onClick={() => copyToClipboard('npm run dev', 'dev')}
                      className="text-indigo-600 hover:text-indigo-800 shrink-0 font-bold"
                    >
                      {copiedText === 'dev' ? 'Скопировано!' : 'Копировать'}
                    </button>
                  </div>
                  <div className="bg-slate-900 rounded-xl p-2.5 font-mono text-[11px] text-emerald-400 flex items-center justify-between border border-slate-855">
                    <span>npm run dev</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CLOUD RUN & OTHER CHANNELS INTEGRATIONS */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5 uppercase tracking-wide">
              <Globe className="w-4 h-4 text-indigo-650 animate-pulse" />
              Как опубликовать приложение для родителей и руководства (Cloud Run)
            </h3>
            
            <p className="text-xs text-slate-550 leading-relaxed">
              Вы можете опубликовать приложение для внешних пользователей. Вот шаги для бесшовной публикации:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs text-left">
              <div className="p-3.5 bg-slate-50 border border-slate-180 rounded-xl">
                <span className="font-bold text-slate-800 block mb-1">📤 1. Прямая ссылка</span>
                <p className="text-[11px] text-slate-500 leading-normal">
                  В правом верхнем углу панели AI Studio нажмите на кнопку "Поделиться" (Share). Вы получите стабильную ссылку для демонстрации.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-180 rounded-xl">
                <span className="font-bold text-slate-800 block mb-1">🚀 2. Деплой в Cloud Run</span>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Платформа предоставляет кнопку быстрого деплоя на защищенный хостинг Google Cloud Run для высокопроизводительной работы Express-сервера.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-180 rounded-xl">
                <span className="font-bold text-slate-800 block mb-1">💬 3. Настройка ENV ключа</span>
                <p className="text-[11px] text-slate-500 leading-normal">
                  При публикации добавьте реальный <code>GEMINI_API_KEY</code> в настройки переменных окружения (Settings), чтобы другие люди не вводили его вручную.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* FOOTER ACTION */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center shrink-0">
          <span className="text-[10.5px] font-mono text-indigo-600 font-extrabold uppercase">РЕГЛАМЕНТ ЭКСПОРТА: ACTIVE</span>
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-850 text-white font-extrabold text-xs px-6 py-2 rounded-xl cursor-pointer transition active:scale-95 shadow"
          >
            Все готово
          </button>
        </div>

      </div>
    </div>
  );
}
