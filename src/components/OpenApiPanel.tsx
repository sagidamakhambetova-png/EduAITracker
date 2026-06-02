import React, { useState, useEffect } from 'react';
import { 
  Key, Globe, Eye, EyeOff, Clipboard, Check, RefreshCw, 
  Settings, Database, Cloud, Terminal, Link, Code, 
  Send, Users, BookOpen, Clock, FileJson, AlertCircle, Play, 
  ArrowUpRight, ArrowDownRight, Lightbulb, ShieldCheck, HelpCircle,
  FileText, CheckCircle, Activity, Settings2, Info, Plus, Sparkles
} from 'lucide-react';
import { apiIntegrations } from '../types';

interface OpenApiPanelProps {
  integrations: apiIntegrations[];
  onToggleIntegration: (id: string) => void;
  onGenerateToken: (id: string) => void;
}

type TabType = 'connections' | 'credentials' | 'tester' | 'webhooks' | 'telegram';

export default function OpenApiPanel({ 
  integrations, 
  onToggleIntegration, 
  onGenerateToken 
}: OpenApiPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('connections');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<{ [key: string]: boolean }>({});
  
  // Local active integrations for real-time updates
  const [localIntegrations, setLocalIntegrations] = useState<any[]>(integrations);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [isAutomatedSync, setIsAutomatedSync] = useState(true);

  // Telegram Bot Integration State
  const [telegramToken, setTelegramToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [telegramConfig, setTelegramConfig] = useState<any>({
    botToken: "",
    testChatId: "",
    isEnabled: false,
    lastSaved: "",
    status: "disconnected",
    botUsername: "",
    botName: ""
  });
  const [telegramLoading, setTelegramLoading] = useState(false);
  const [telegramStatusMessage, setTelegramStatusMessage] = useState('');
  const [telegramError, setTelegramError] = useState('');
  const [testSendLoading, setTestSendLoading] = useState(false);

  // REST API Client State
  const [selectedMethod, setSelectedMethod] = useState<'GET' | 'POST'>('GET');
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('/api/v1/students');
  const [apiToken, setApiToken] = useState<string>('');
  const [requestBody, setRequestBody] = useState<string>(
    JSON.stringify([
      {
        name: "Сардор Рахимов",
        groupName: "Python Kids",
        level: 2,
        xp: 320,
        parentName: "Равшан Рахимов",
        parentPhone: "+998 90 999 11 22",
        telegramId: "@sardor_parent",
        attendanceRate: 95,
        generalScore: 4.8
      },
      {
        name: "Шахзода Каримова",
        groupName: "Английский язык - Starter B1",
        level: 3,
        xp: 450,
        parentName: "Дильноза Каримова",
        parentPhone: "+998 93 444 55 66",
        telegramId: "@shahzoda_parent",
        attendanceRate: 100,
        generalScore: 5.0
      }
    ], null, 2)
  );
  
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiLoading, setApiLoading] = useState<boolean>(false);

  // Webhooks State
  const [webhookUrl, setWebhookUrl] = useState<string>('https://api.emaktab.uz/v1/webhook-tracker');
  const [webhookEvents, setWebhookEvents] = useState<string[]>(['student_graded', 'student_level_up', 'churn_ew_warning', 'lesson_reported']);
  const [isSavingWebhook, setIsSavingWebhook] = useState(false);
  const [webhookAlert, setWebhookAlert] = useState(false);

  // Code Snippet Language
  const [selectedLanguage, setSelectedLanguage] = useState<'curl' | 'python' | 'node'>('curl');

  // Keep local integrations aligned with props
  useEffect(() => {
    if (integrations && integrations.length > 0) {
      setLocalIntegrations(integrations);
      // Auto-populate API token with the first active one for testing convenience
      const activeOne = integrations.find(i => i.status === 'active');
      if (activeOne && !apiToken) {
        setApiToken(activeOne.apiKey);
      }
    }
  }, [integrations]);

  const fetchTelegramConfig = async () => {
    try {
      const res = await fetch('/api/telegram/config');
      const data = await res.json();
      setTelegramConfig(data);
      if (data.botToken) {
        setTelegramToken(data.botToken);
      }
      if (data.testChatId) {
        setTelegramChatId(data.testChatId);
      }
    } catch (e) {
      console.error("Error fetching telegram config:", e);
    }
  };

  useEffect(() => {
    fetchTelegramConfig();
  }, []);

  const saveTelegramConfig = async () => {
    setTelegramLoading(true);
    setTelegramError('');
    setTelegramStatusMessage('');
    try {
      const res = await fetch('/api/telegram/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken: telegramToken,
          testChatId: telegramChatId
        })
      });
      const data = await res.json();
      if (data.success) {
        setTelegramConfig(data.config);
        setTelegramStatusMessage(data.message || 'Токен успешно сохранен!');
      } else {
        setTelegramError(data.error || 'Не удалось сохранить токен');
        if (data.config) {
          setTelegramConfig(data.config);
        }
      }
    } catch (err: any) {
      setTelegramError('Ошибка отправки: ' + err.message);
    } finally {
      setTelegramLoading(false);
    }
  };

  const handleTestTelegramConnection = async () => {
    setTestSendLoading(true);
    setTelegramError('');
    setTelegramStatusMessage('');
    try {
      const res = await fetch('/api/telegram/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken: telegramToken,
          testChatId: telegramChatId
        })
      });
      const data = await res.json();
      if (data.success) {
        setTelegramStatusMessage(data.message || 'Проверка связи успешна!');
        await fetchTelegramConfig();
      } else {
        setTelegramError(data.error || 'Ошибка проверки связи');
      }
    } catch (err: any) {
      setTelegramError('Ошибка сети: ' + err.message);
    } finally {
      setTestSendLoading(false);
    }
  };

  const toggleVisibility = (id: string) => {
    setVisibleKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Run Real Sync against the server
  const handleIntelligentSync = async (id: string) => {
    setSyncingId(id);
    try {
      const res = await fetch('/api/integrations/sync-trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        setLocalIntegrations(data.apiIntegrations);
        // Dispatch local warning / hint in tester too
        const selected = data.apiIntegrations.find((x: any) => x.id === id);
        if (selected && selected.apiKey) {
          setApiToken(selected.apiKey);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => {
        setSyncingId(null);
      }, 1000);
    }
  };

  // Run active Rest API Call instantly from UI client
  const executeApiRequest = async () => {
    setApiLoading(true);
    setApiResponse(null);

    // If POST to students import, the body goes as a property 'data'
    let finalBody: any = null;
    if (selectedMethod === 'POST') {
      try {
        const parsed = JSON.parse(requestBody);
        finalBody = JSON.stringify({ data: parsed });
      } catch (err) {
        setApiResponse({ error: "Критическая ошибка: Невалидный JSON-формат в теле запроса." });
        setApiLoading(false);
        return;
      }
    }

    try {
      const res = await fetch(selectedEndpoint, {
        method: selectedMethod,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiToken}`
        },
        body: finalBody
      });
      const data = await res.json();
      setApiResponse(data);
      
      // Update local integrations metrics since calling the API updates status:
      const integrationsRes = await fetch('/api/integrations');
      const latestInt = await integrationsRes.json();
      setLocalIntegrations(latestInt);
    } catch (err: any) {
      setApiResponse({ error: "Не удалось связаться с сервером API Gateway", details: err?.message });
    } finally {
      setApiLoading(false);
    }
  };

  // Save custom webhook configuration
  const saveWebhookConfig = async () => {
    setIsSavingWebhook(true);
    try {
      const res = await fetch('/api/v1/webhooks/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiToken || 'edu_api_key_77a28f88cd0a8174f8'}`
        },
        body: JSON.stringify({
          url: webhookUrl,
          events: webhookEvents
        })
      });
      const data = await res.json();
      if (data.success) {
        setWebhookAlert(true);
        setTimeout(() => setWebhookAlert(false), 3000);
        
        // Refresh
        const integrationsRes = await fetch('/api/integrations');
        const latestInt = await integrationsRes.json();
        setLocalIntegrations(latestInt);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingWebhook(false);
    }
  };

  // Endpoint Presets to make query testing simple
  const endpointsPresets = [
    { label: 'Список учеников (GET)', val: '/api/v1/students', method: 'GET' },
    { label: 'Аналитика и AI отчеты (GET)', val: '/api/v1/ai-analytics', method: 'GET' },
    { label: 'Импорт учеников (POST JSON)', val: '/api/v1/students/import', method: 'POST' },
    { label: 'Список учебных групп (GET)', val: '/api/v1/groups', method: 'GET' },
    { label: 'Оценки журналов (GET)', val: '/api/v1/grades', method: 'GET' },
    { label: 'Посещаемость (GET)', val: '/api/v1/attendance', method: 'GET' },
    { label: 'Расписание занятий (GET)', val: '/api/v1/schedule', method: 'GET' },
    { label: 'Домашние работы (GET)', val: '/api/v1/homeworks', method: 'GET' }
  ];

  const codeSnippets = {
    curl: `curl -X POST "${window.location.origin}/api/v1/students/import" \\
  -H "Authorization: Bearer ${apiToken || 'YOUR_API_TOKEN'}" \\
  -H "Content-Type: application/json" \\
  -d '[
    {
      "name": "Алишер Навоий",
      "groupName": "Python Kids",
      "level": 4,
      "xp": 820,
      "parentPhone": "+998 90 123 45 67"
    }
  ]'`,
    python: `import requests

url = "${window.location.origin}/api/v1/students/import"
headers = {
    "Authorization": "Bearer ${apiToken || 'YOUR_API_TOKEN'}",
    "Content-Type": "application/json"
}
payload = {
    "data": [
        {
            "name": "Алишер Навоий",
            "groupName": "Python Kids",
            "level": 4,
            "xp": 820,
            "parentPhone": "+998 90 123 45 67"
        }
    ]
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`,
    node: `import fetch from 'node-fetch';

const url = '${window.location.origin}/api/v1/students/import';
const token = '${apiToken || 'YOUR_API_TOKEN'}';

const response = await fetch(url, {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${token}\`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    data: [
      {
        name: 'Алишер Навоий',
        groupName: 'Python Kids',
        level: 4,
        xp: 820,
        parentPhone: '+998 90 123 45 67'
      }
    ]
  })
});

const data = await response.json();
console.log(data);`
  };

  // Render specific connection logo
  const getConnectionDetails = (platformName: string) => {
    if (platformName.includes('eMaktab')) {
      return {
        desc: 'Национальный электронный журнал Узбекистана (eMaktab.uz)',
        country: 'Узбекистан 🇺🇿',
        badgeColor: 'bg-blue-50 text-blue-800 border-blue-200'
      };
    } else if (platformName.includes('Moodle')) {
      return {
        desc: 'Международная цифровая LMS система Moodle',
        country: 'Глобальный рынок 🌍',
        badgeColor: 'bg-orange-50 text-orange-850 border-orange-205'
      };
    } else if (platformName.includes('Google Classroom')) {
      return {
        desc: 'Интеграция с сервисами Google Workspace for Education',
        country: 'Глобальный рынок 🌍',
        badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200'
      };
    } else if (platformName.includes('Microsoft Teams')) {
      return {
        desc: 'Корпоративная шина вещания Microsoft Teams',
        country: 'Глобальный рынок 🌍',
        badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200'
      };
    } else {
      return {
        desc: 'Универсальный REST API шлюз для CRM / 1С / сторонних баз',
        country: 'Custom Dev 🛠️',
        badgeColor: 'bg-slate-100 text-slate-700 border-slate-250'
      };
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-105" id="integrations-system-panel">
      
      {/* Header and Brand */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-2xl shadow-md shadow-indigo-120">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-850 text-sm tracking-tight flex items-center gap-1.5">
              Интеграции & Сквозной API
              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                v1.2 PRO
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Синхронизация с eMaktab.uz, Moodle, GClassroom и Teams</p>
          </div>
        </div>

        {/* Sync Mode Information */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-[10.5px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-slate-100 select-none">
            <span className={`w-2 h-2 rounded-full ${isAutomatedSync ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
            Авто-обновление
            <input 
              type="checkbox" 
              checked={isAutomatedSync} 
              onChange={() => setIsAutomatedSync(!isAutomatedSync)} 
              className="sr-only"
            />
          </label>
        </div>
      </div>

      {/* TABS SELECTOR */}
      <div className="flex border-b border-slate-150 mb-6 font-semibold overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab('connections')}
          className={`pb-2.5 px-3.5 text-xs transition-all relative flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'connections' ? 'text-indigo-600 border-b-2 border-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          Внешние LMS и eMaktab
        </button>
        <button
          onClick={() => setActiveTab('credentials')}
          className={`pb-2.5 px-3.5 text-xs transition-all relative flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'credentials' ? 'text-indigo-600 border-b-2 border-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          OAuth 2.0 & API Ключи
        </button>
        <button
          onClick={() => setActiveTab('tester')}
          className={`pb-2.5 px-3.5 text-xs transition-all relative flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'tester' ? 'text-indigo-600 border-b-2 border-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          REST API Тестер (Песочница)
        </button>
        <button
          onClick={() => setActiveTab('webhooks')}
          className={`pb-2.5 px-3.5 text-xs transition-all relative flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'webhooks' ? 'text-indigo-600 border-b-2 border-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Link className="w-3.5 h-3.5" />
          Webhooks {webhookEvents.length > 0 && <span className="bg-rose-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-mono">{webhookEvents.length}</span>}
        </button>
        <button
          onClick={() => setActiveTab('telegram')}
          className={`pb-2.5 px-3.5 text-xs transition-all relative flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'telegram' ? 'text-indigo-600 border-b-2 border-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          Telegram Интеграция
        </button>
      </div>

      {/* TAB CONTENT: CONNECTIONS AND EMAKTAB.UZ */}
      {activeTab === 'connections' && (
        <div className="space-y-4">
          <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100 flex gap-3.5">
            <Info className="w-5 h-5 text-indigo-650 shrink-0 mt-0.5" />
            <div className="text-[11.5px] leading-relaxed text-slate-700 font-sans">
              <strong>Синхронизация в реальном времени:</strong> Оценки за AI-аналитику, посещаемость, домашние задания и показатели Early Warning System автоматически загружаются в подключенные платформы. Для <strong>eMaktab.uz</strong> подгружаются данные о четвертных итогах и академической успеваемости в школах Узбекистана.
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {localIntegrations.map((item) => {
              const meta = getConnectionDetails(item.platform);
              const isVisible = visibleKeys[item.id] || false;
              const isSyncing = syncingId === item.id;

              return (
                <div key={item.id} className="border border-slate-150 rounded-2xl p-4 hover:border-slate-350 bg-slate-50/40 relative hover:shadow-xs transition">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div>
                      {/* Name & Country Group */}
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${item.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                        <h4 className="font-extrabold text-slate-800 text-xs">{item.platform}</h4>
                        <span className={`px-2 py-0.5 rounded text-[8.5px] font-bold border ${meta.badgeColor}`}>
                          {meta.country}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-400 mt-1 max-w-xl">{meta.desc}</p>
                    </div>

                    {/* Right corner actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onToggleIntegration(item.id)}
                        className={`text-[10px] font-extrabold px-3 py-1.5 rounded-xl transition ${
                          item.status === 'active'
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                        }`}
                      >
                        {item.status === 'active' ? 'Отключить' : 'Подключить'}
                      </button>

                      {item.status === 'active' && (
                        <button
                          onClick={() => handleIntelligentSync(item.id)}
                          disabled={isSyncing}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl cursor-pointer transition flex items-center gap-1 hover:shadow"
                        >
                          <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                          {isSyncing ? 'Синхронизация...' : 'Синхронизировать'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Sync Metrics panel */}
                  {item.status === 'active' && (
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white border border-slate-200/60 p-3 rounded-xl text-[10.5px] font-sans">
                      <div>
                        <span className="text-slate-400 block mb-0.5">Статус синхронизации:</span>
                        <span className="font-extrabold text-emerald-600 flex items-center gap-1 font-mono uppercase text-[9.5px]">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Успешно
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Внутренних записей:</span>
                        <span className="font-extrabold text-slate-705 font-mono">{item.lastSyncedRecords || 120} шт</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Последний экспорт:</span>
                        <span className="font-bold text-slate-705 font-mono">{item.lastUsed}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Обновление:</span>
                        <span className="text-indigo-600 font-bold uppercase text-[9.5px]">
                          {isAutomatedSync ? 'Автоматически' : 'По запросу'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* API Key Inline Container */}
                  <div className="mt-3 flex items-center justify-between bg-white/70 rounded-xl border border-slate-200/60 p-2 text-xs">
                    <div className="flex items-center gap-2 truncate flex-1 mr-2 pl-1.5">
                      <Key className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono text-[10.5px] text-slate-600 shrink-0 font-bold uppercase tracking-wider">Токен авторизации:</span>
                      <span className="font-mono text-[10.5px] text-slate-500 truncate">
                        {isVisible ? item.apiKey : '• • • • • • • • • • • • • • • • • • • •'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleVisibility(item.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 transition rounded hover:bg-slate-100"
                        title={isVisible ? "Скрыть" : "Показать"}
                      >
                        {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => copyToClipboard(item.apiKey, item.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 transition rounded hover:bg-slate-100"
                        title="Копировать токен"
                      >
                        {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-500 font-bold" /> : <Clipboard className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => onGenerateToken(item.id)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 transition rounded hover:bg-slate-100"
                        title="Перевыпустить ключ"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mt-2">
            <h4 className="font-bold text-xs text-slate-700 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Как eMaktab.uz облегчает работу школ в Узбекистане
            </h4>
            <p className="text-[11px] text-slate-500 leading-normal mt-1">
              Благодаря нашему ИИ, преподавателю не нужно вручную вбивать успеваемость в eMaktab. Учитель просто надиктовывает голосовой отчет. Наш алгоритм извлекает имена учеников, выставленные баллы и оценки по пятибалльной шкале, а затем по REST API мгновенно транслирует их в соответствующий дневник ученика в eMaktab.
            </p>
          </div>
        </div>
      )}

      {/* TAB CONTENT: CREDENTIALS AND OAUTH 2.0 */}
      {activeTab === 'credentials' && (
        <div className="space-y-6">
          <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50">
            <h4 className="font-extrabold text-slate-800 text-xs mb-2">Авторизация по протоколу OAuth 2.0</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
              Сторонние приложения могут запрашивать доступ от лица директоров или учителей по стандарту <strong>OAuth 2.0 (RFC 6749)</strong> используя авторизационный грант <code>client_credentials</code>.
            </p>

            {/* OAuth Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                <span className="text-[9.5px] text-slate-400 block font-bold uppercase">Client ID (Идентификатор клиента)</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-mono text-[11px] text-slate-700 font-bold">uz_edu_platform_sandbox_client_2026</span>
                  <button 
                    onClick={() => copyToClipboard('uz_edu_platform_sandbox_client_2026', 'clientId')}
                    className="text-slate-400 hover:text-slate-650"
                  >
                    {copiedId === 'clientId' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Clipboard className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                <span className="text-[9.5px] text-slate-400 block font-bold uppercase">Client Secret (Секрет клиента)</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-mono text-[11px] text-slate-700">••••••••••••••••••••••••••••••••••</span>
                  <button 
                    onClick={() => copyToClipboard('sec_dev_ai_studio_platform_secret_uzb', 'clientSecret')}
                    className="text-slate-400 hover:text-slate-650"
                  >
                    {copiedId === 'clientSecret' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Clipboard className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Simulated OAuth Flow test */}
            <div className="mt-4 bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-center justify-between flex-wrap gap-2">
              <div>
                <h5 className="font-bold text-[11px] text-indigo-900">Протестировать получение OAuth токена</h5>
                <p className="text-[10px] text-indigo-750">Тестовый запрос curl совершит POST на <code>/api/v1/oauth/token</code></p>
              </div>
              <button 
                onClick={async () => {
                  setApiLoading(true);
                  try {
                    const res = await fetch('/api/v1/oauth/token', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        client_id: 'uz_edu_platform_sandbox_client_2026',
                        client_secret: 'sec_dev_ai_studio_platform_secret_uzb',
                        grant_type: 'client_credentials'
                      })
                    });
                    const d = await res.json();
                    setApiToken(d.access_token);
                    alert(`Симуляция OAuth 2.0 успешна!\n\nAccess Token: ${d.access_token}\nТокен автоматически подставлен в буфер Swagger-тестера!`);
                  } catch (e: any) {
                    alert('Не удалось запустить симуляцию OAuth ' + e.message);
                  } finally {
                    setApiLoading(false);
                  }
                }}
                className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-[10px] px-3.5 py-2 rounded-lg transition"
              >
                Запустить OAuth Грант
              </button>
            </div>
          </div>

          {/* Quick API references */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-800 text-xs">Документация и заготовки для разработчиков</h4>
            
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-900 shadow-sm">
              <div className="flex items-center justify-between bg-slate-800 px-4 py-2 text-xs border-b border-slate-700">
                <div className="flex gap-2 font-bold">
                  <button
                    onClick={() => setSelectedLanguage('curl')}
                    className={`px-2.5 py-1 rounded transition ${selectedLanguage === 'curl' ? 'bg-slate-700 text-slate-100' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    cURL
                  </button>
                  <button
                    onClick={() => setSelectedLanguage('python')}
                    className={`px-2.5 py-1 rounded transition ${selectedLanguage === 'python' ? 'bg-slate-700 text-slate-100' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Python requests
                  </button>
                  <button
                    onClick={() => setSelectedLanguage('node')}
                    className={`px-2.5 py-1 rounded transition ${selectedLanguage === 'node' ? 'bg-slate-700 text-slate-100' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Node.js Fetch
                  </button>
                </div>
                <button
                  onClick={() => copyToClipboard(codeSnippets[selectedLanguage], 'code')}
                  className="text-slate-400 hover:text-slate-200 flex items-center gap-1 hover:bg-slate-750 p-1 rounded font-bold text-[10px]"
                >
                  {copiedId === 'code' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Скопировано!</span>
                    </>
                  ) : (
                    <>
                      <Clipboard className="w-3.5 h-3.5" />
                      <span>Скопировать код</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-4 overflow-x-auto text-[11px] font-mono leading-relaxed text-slate-350 max-h-56">
                <pre>{codeSnippets[selectedLanguage]}</pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: API TESTER (SWAGGER-LIKE CONSOLE) */}
      {activeTab === 'tester' && (
        <div className="space-y-5">
          <div className="bg-indigo-50/40 border border-indigo-120 p-4 rounded-2xl">
            <h4 className="font-extrabold text-slate-850 text-xs mb-1">Интерактивный REST API Клиент</h4>
            <p className="text-[11.5px] text-slate-650">Выбирайте эндпоинты, задавайте Bearer токен и отправляйте запросы к базе данных школы напрямую из AI-интерфейса!</p>
          </div>

          {/* Form console */}
          <div className="space-y-3 font-sans">
            <div>
              <label className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block mb-1">Выбрать готовый эндпоинт реестра:</label>
              <select
                onChange={(e) => {
                  const preset = endpointsPresets.find(p => p.val === e.target.value);
                  if (preset) {
                    setSelectedEndpoint(preset.val);
                    setSelectedMethod(preset.method as any);
                  }
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500"
              >
                {endpointsPresets.map((p, idx) => (
                  <option key={idx} value={p.val}>{p.label}</option>
                ))}
              </select>
            </div>

            {/* Target Query Bar */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
              <div className="md:col-span-2">
                <select 
                  value={selectedMethod}
                  onChange={(e) => setSelectedMethod(e.target.value as any)}
                  className="w-full bg-slate-900 text-white font-extrabold text-xs rounded-xl px-3 py-2 focus:outline-none h-[38px] text-center"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                </select>
              </div>
              
              <div className="md:col-span-10">
                <div className="relative flex items-center bg-slate-100 rounded-xl border border-slate-200/80 px-3 py-2 w-full h-[38px]">
                  <span className="text-[10px] font-mono text-slate-400 font-bold shrink-0 uppercase tracking-wider mr-1.5">URL:</span>
                  <span className="text-xs text-slate-400 shrink-0 select-none font-mono">{window.location.origin}</span>
                  <input
                    type="text"
                    value={selectedEndpoint}
                    onChange={(e) => setSelectedEndpoint(e.target.value)}
                    className="bg-transparent text-xs font-mono text-slate-700 focus:outline-none flex-1 pl-1"
                  />
                </div>
              </div>
            </div>

            {/* Bearer Token and Send Button */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-8">
                <label className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block mb-1">Bearer Токен Авторизации (API Key):</label>
                <div className="relative">
                  <input
                    type="text"
                    value={apiToken}
                    onChange={(e) => setApiToken(e.target.value)}
                    placeholder="Введите em_auth_uzb_... или md_token_..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 pl-[32px] text-xs font-mono text-slate-650 focus:outline-none focus:border-indigo-500"
                  />
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div className="md:col-span-4">
                <button
                  onClick={executeApiRequest}
                  disabled={apiLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-2 rounded-xl h-[38px] transition shadow flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {apiLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Отправить Запрос (Send)
                </button>
              </div>
            </div>

            {/* Post Request Body if POST */}
            {selectedMethod === 'POST' && (
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block">Тело запроса (JSON Array of Students):</label>
                  <button 
                    onClick={() => {
                      // Autocomplete sample
                      const presetBody = [
                        {
                          name: "Мухаммад Кадыров",
                          groupName: "Python Kids",
                          level: 1,
                          xp: 150,
                          parentPhone: "+998 90 777 88 99",
                          riskRating: "low"
                        }
                      ];
                      setRequestBody(JSON.stringify(presetBody, null, 2));
                    }}
                    className="text-indigo-600 hover:text-indigo-800 text-[10px] font-bold"
                  >
                    Загрузить заготовку
                  </button>
                </div>
                <textarea
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  rows={6}
                  className="w-full bg-slate-900 text-emerald-400 font-mono text-xs p-3.5 rounded-xl border border-slate-755 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            )}

            {/* Response Area */}
            <div className="border border-slate-250 bg-slate-950 rounded-2xl overflow-hidden shadow-inner mt-4">
              <div className="flex justify-between items-center px-4 py-2 bg-slate-900 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-indigo-400" />
                  <span className="text-[10px] text-slate-350 uppercase tracking-wider font-extrabold">Тело Ответа (HTTP Response Body)</span>
                </div>
                {apiResponse && (
                  <button
                    onClick={() => {
                      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(apiResponse, null, 2));
                      const downloadAnchor = document.createElement('a');
                      downloadAnchor.setAttribute("href", dataStr);
                      downloadAnchor.setAttribute("download", `api_export_response_${Date.now()}.json`);
                      downloadAnchor.click();
                    }}
                    className="text-[10px] text-indigo-400 hover:text-indigo-200 font-extrabold bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg"
                  >
                    Быстрый Экспорт в JSON
                  </button>
                )}
              </div>
              <div className="p-4 text-[11px] font-mono leading-relaxed text-slate-300 max-h-72 overflow-y-auto">
                {apiResponse ? (
                  <pre className="whitespace-pre-wrap">{JSON.stringify(apiResponse, null, 2)}</pre>
                ) : (
                  <div className="text-center py-8 text-slate-500 text-xs">
                    Здесь появится JSON ответ сервера после нажатия кнопки "Отправить запрос".
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: WEBHOOK CONNECTIONS AND DISPATCH LOGGER */}
      {activeTab === 'webhooks' && (
        <div className="space-y-5">
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
            <h4 className="font-extrabold text-slate-800 text-xs mb-1">Шина событий (Webhooks)</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Платформа отправляет POST HTTP-запросы с JSON объектами на ваш эндпоинт при наступлении событий с учениками или учителями.
            </p>
          </div>

          <div className="space-y-4">
            {/* Input URL */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block">Адрес Webhook-приемника (Callback URL):</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://your-domain.uz/receiver"
                  className="flex-1 bg-slate-50 border border-slate-180 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={saveWebhookConfig}
                  disabled={isSavingWebhook}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer disabled:opacity-50"
                >
                  {isSavingWebhook ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
              {webhookAlert && (
                <span className="text-[10px] font-bold text-emerald-600 block mt-1">✓ Webhook-конфигурация успешно сохранена и протестирована!</span>
              )}
            </div>

            {/* Events checklist */}
            <div>
              <label className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block mb-2">Слушать события:</label>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-650">
                {[
                  { id: 'student_graded', label: 'Оценивание в журнале (student_graded)' },
                  { id: 'student_level_up', label: 'Рост уровня в геймификации (student_level_up)' },
                  { id: 'churn_ew_warning', label: 'Предупреждение об уходе EWS (churn_ew_warning)' },
                  { id: 'lesson_reported', label: 'Транскрипт нового урока (lesson_reported)' }
                ].map((ev) => (
                  <label key={ev.id} className="flex items-center gap-2 bg-slate-50/50 hover:bg-slate-50 p-2 border border-slate-150 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={webhookEvents.includes(ev.id)}
                      onChange={() => {
                        if (webhookEvents.includes(ev.id)) {
                          setWebhookEvents(webhookEvents.filter(x => x !== ev.id));
                        } else {
                          setWebhookEvents([...webhookEvents, ev.id]);
                        }
                      }}
                      className="rounded text-indigo-600 focus:ring-0 focus:outline-none"
                    />
                    <span>{ev.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Webhook logs stream tracker */}
            <div className="mt-4">
              <h5 className="text-[10.5px] uppercase font-extrabold text-slate-400 tracking-wider mb-2.5 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-505" />
                Логи шины событий в реальном времени (Webhook Logs Feed)
              </h5>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {/* Find logs inside gateway or eMaktab platforms */}
                {(() => {
                  const logs = [];
                  localIntegrations.forEach(int => {
                    if (int.webhookLogs && int.webhookLogs.length > 0) {
                      int.webhookLogs.forEach((l: any) => {
                        logs.push({ ...l, platform: int.platform });
                      });
                    }
                  });

                  // Sort by timestamp or reverse order
                  if (logs.length === 0) {
                    return (
                      <div className="bg-slate-50/60 rounded-xl text-center p-6 text-slate-400 text-xs border border-dashed border-slate-205">
                        Лента вебхуков пуста. Надиктовывайте отчеты или выставляйте оценки, чтобы сгенерировать хуки!
                      </div>
                    );
                  }

                  return logs.slice(0, 5).map((log, index) => (
                    <div key={index} className="border border-slate-150 bg-slate-50/40 p-3 rounded-xl hover:border-slate-300">
                      <div className="flex justify-between items-center text-[10px] mb-1.5 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-indigo-605 bg-indigo-50 px-2 py-0.5 rounded font-extrabold uppercase">
                            {log.event}
                          </span>
                          <span className="text-slate-400">→ {log.platform}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-slate-400">{log.timestamp}</span>
                          <span className="bg-emerald-100 text-emerald-850 font-bold px-1.5 py-0.5 rounded text-[8.5px] uppercase font-sans">
                            {log.status}
                          </span>
                        </div>
                      </div>
                      <div className="bg-white p-2 border border-slate-200/60 rounded-lg text-[9.5px] font-mono text-slate-500 whitespace-pre-wrap max-h-24 overflow-y-auto">
                        {log.payload}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: TELEGRAM BOT INTEGRATION PANEL */}
      {activeTab === 'telegram' && (
        <div className="space-y-6">
          <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100 flex gap-3.5">
            <Info className="w-5 h-5 text-indigo-650 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-extrabold text-indigo-900 mb-0.5">Раздел Telegram Integration (SMS Шлюз и Оповещения)</h4>
              <p className="text-[11.5px] text-indigo-750 leading-relaxed">
                Интеграция позволяет использовать ваш собственный бот в Telegram для мгновенной обратной связи. Настройте Bot Token, чтобы рассылать умные алерты EduAI (от ухода студентов в EWS до успехов в геймификации) прямо родителям и преподавателям!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left side: Setup Form */}
            <div className="md:col-span-2 space-y-4">
              <div className="bg-white border border-slate-150 p-5 rounded-2xl space-y-4 shadow-sm">
                <h4 className="font-extrabold text-slate-800 text-xs tracking-tight uppercase flex items-center gap-1.5 border-b border-slate-100 pb-3">
                  <Settings2 className="w-4 h-4 text-indigo-600" />
                  Параметры Telegram Bot API
                </h4>

                <div className="space-y-4">
                  {/* Token input */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider flex items-center justify-between">
                      <span>Telegram Bot Token (HTTP API Token)</span>
                      <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline text-[9.5px] normal-case">Создать через @BotFather →</a>
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={telegramToken}
                        onChange={(e) => setTelegramToken(e.target.value)}
                        placeholder="5273902341:AAEyF_x16vI..."
                        className="w-full bg-slate-50 border border-slate-180 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-700 focus:outline-none focus:border-indigo-500 transition"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Используйте ваш реальный токен или введите <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-500">mock_token_123</code> для демонстрационного режима.
                    </p>
                  </div>

                  {/* Chat ID input */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                      Административный Chat ID или Группа для Тестирования / Копий
                    </label>
                    <input
                      type="text"
                      value={telegramChatId}
                      onChange={(e) => setTelegramChatId(e.target.value)}
                      placeholder="-100123456789 или 987654321"
                      className="w-full bg-slate-50 border border-slate-180 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-700 focus:outline-none focus:border-indigo-500 transition"
                    />
                    <p className="text-[10px] text-slate-400">
                      Укажите числовой Chat ID вашего аккаунта или учебной группы, чтобы бот мог слать копии уведомлений. (Получить ID можно через @userinfobot).
                    </p>
                  </div>

                  {/* Notification Status Messages */}
                  {telegramStatusMessage && (
                    <div className="bg-emerald-50 text-emerald-800 border border-emerald-150 p-3 rounded-xl flex items-start gap-2 text-xs">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="font-semibold">{telegramStatusMessage}</div>
                    </div>
                  )}

                  {telegramError && (
                    <div className="bg-rose-50 text-rose-800 border border-rose-150 p-3 rounded-xl flex items-start gap-2 text-xs">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div className="font-semibold">{telegramError}</div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      onClick={saveTelegramConfig}
                      disabled={telegramLoading || testSendLoading}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {telegramLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Сохранение...
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Сохранить Настройки
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleTestTelegramConnection}
                      disabled={telegramLoading || testSendLoading || !telegramToken}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {testSendLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Связываемся...
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5 text-slate-500" />
                          Проверить Подключение
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: Connection Dashboard Info */}
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-150 p-5 rounded-2xl shadow-inner space-y-4">
                <h4 className="font-extrabold text-slate-700 text-[10px] uppercase tracking-wider block">Панель Состояния Шлюза</h4>
                
                <div className="space-y-3.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                    <span className="font-medium text-slate-550">Статус соединения:</span>
                    {telegramConfig.status === 'connected' ? (
                      <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                        Активен
                      </span>
                    ) : telegramConfig.status === 'error' ? (
                      <span className="bg-rose-100 text-rose-800 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase">Ошибка</span>
                    ) : (
                      <span className="bg-slate-200 text-slate-650 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase">Не подключен</span>
                    )}
                  </div>

                  {telegramConfig.status === 'connected' && (
                    <>
                      <div className="space-y-1 pb-2.5 border-b border-slate-200">
                        <span className="font-medium text-slate-550 block">Авторизованный Бот:</span>
                        <div className="font-extrabold text-slate-800 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          {telegramConfig.botName || 'EduAI Bot'}
                        </div>
                        <a 
                          href={`https://t.me/${telegramConfig.botUsername}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-[10.5px] font-mono text-indigo-600 hover:underline block"
                        >
                          @{telegramConfig.botUsername}
                        </a>
                      </div>

                      <div className="pb-2.5 border-b border-slate-200">
                        <span className="font-medium text-slate-550 block">Последняя синхронизация:</span>
                        <span className="font-mono text-slate-800 text-[11px] block mt-0.5">
                          {telegramConfig.lastSaved ? new Date(telegramConfig.lastSaved).toLocaleString('ru-RU') : '—'}
                        </span>
                      </div>
                    </>
                  )}

                  <div className="space-y-1">
                    <h5 className="font-extrabold text-[10px] uppercase text-slate-450 tracking-wider">Где бот берёт Chat ID получателей?</h5>
                    <p className="text-[10.5px] text-slate-500 leading-relaxed">
                      Бот отправляет оповещения родителям и студентам по их <code className="bg-white border border-slate-200 font-mono px-1 py-0.2 rounded text-[9.5px]">Telegram Chat ID</code>, прописанным в их профилях. Посмотрите карточки студентов на панели Early Warning System для настройки ID конкретных получателей.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
