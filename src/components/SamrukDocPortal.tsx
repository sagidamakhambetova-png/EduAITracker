import React, { useState } from 'react';
import { 
  Sparkles, Scroll, Compass, Trophy, Gem, Feather, 
  Award, Heart, MessageSquare, Shield, Smartphone, 
  Star, X, Check, HeartHandshake, Eye, BookOpen, 
  Terminal, Zap, Swords, UserCheck, Flame
} from 'lucide-react';

interface SamrukDocPortalProps {
  onClose?: () => void;
  activeStudentId?: string;
  activeMentorId?: string;
  onSelectMentor?: (mentorId: string) => void;
}

export default function SamrukDocPortal({ 
  onClose, 
  activeStudentId = 's1', 
  activeMentorId = 'm1', 
  onSelectMentor 
}: SamrukDocPortalProps) {
  
  const [selectedMentorIndex, setSelectedMentorIndex] = useState<number>(0);
  const [activeSubTab, setActiveSubTab] = useState<'lore' | 'competencies' | 'items' | 'stories'>('lore');
  
  // Interactive Simulator States
  const [simulationStep, setSimulationStep] = useState<number>(0);
  const [certNameInput, setCertNameInput] = useState('Александр Смирнов');
  const [isGeneratingCert, setIsGeneratingCert] = useState(false);
  const [generationSuccessMsg, setGenerationSuccessMsg] = useState('');
  const [comicFrameActive, setComicFrameActive] = useState<number>(0);
  const [unlockedItems, setUnlockedItems] = useState<Record<string, boolean>>({
    'item-feather': true,
    'item-shield': true
  });

  const mentorsList = [
    {
      id: 'm1',
      name: 'Самрук',
      fullName: 'Самрук (Хранитель Знаний)',
      themeColor: 'from-amber-500 to-yellow-600',
      textColor: 'text-amber-400 border-amber-500/30',
      shadowColor: 'shadow-amber-500/20',
      avatar: '/src/assets/images/samruk.png',
      role: 'Знания, Академическое развитие, Исследование миров и Любовь к обучению',
      personality: 'Мудрый, вдохновляющий, глубоко рассудительный. Любит открывать неизведанное.',
      motivationalPhrase: 'Познание — это бесконечное путешествие. Открывая новые миры знаний, ты открываешь лучшую версию себя!',
      legend: 'По легендам EduProgress, великая птица Самрук обитает на самой вершине Древа Познания Байтерек. Оттуда она видит всю панораму образовательных миров — от простых формул до сложных нейросетей. Самрук помогает студентам найти свой истинный академический интерес, развивая непреодолимую страсть к науке и самореализации.',
      competencies: [
        { title: 'Аналитическое мышление', desc: 'Умение разлагать сложные теоремы и концепции на понятные части.' },
        { title: 'Академический кругозор', desc: 'Установление связей между программированием, астрономией и искусством.' },
        { title: 'Научное любопытство', desc: 'Привычка задавать вопросы "как?" и "почему?", исследуя скрытые темы библиотеки.' }
      ],
      qualities: ['Глубина ума', 'Способность к самообразованию', 'Умение видеть логические связи'],
      achievements: ['Первооткрыватель', 'Академический Лорд', 'Золотое Перо Познания'],
      questTypes: 'Квесты на изучение факультативных лекций, прохождение теоретических тестов и наполнение терминологического словаря.',
      items: [
        { id: 'item-feather', name: 'Золотое Перо Мудрости', desc: 'Оброненное перо, дарующее +15% к скорости чтения и запоминания терминов.', icon: <Feather className="w-5 h-5 text-amber-400" /> },
        { id: 'item-compass', name: 'Латунный Компас', desc: 'Указывает на слабые темы и повышает XP за их успешное закрытие на 20%.', icon: <Compass className="w-5 h-5 text-yellow-400" /> }
      ]
    },
    {
      id: 'm2',
      name: 'Алпамыс',
      fullName: 'Алпамыс (Богатырь Дисциплины)',
      themeColor: 'from-blue-600 to-indigo-700',
      textColor: 'text-blue-400 border-blue-500/30',
      shadowColor: 'shadow-blue-500/20',
      avatar: '/src/assets/images/alpamys.png',
      role: 'Дисциплина, Настойчивость, Постановка целей и Формирование привычек',
      personality: 'Сильный, волевой, дисциплинированный, справедливый и надежный наставник.',
      motivationalPhrase: 'Трудности — лишь ступени лестницы. Сделай ещё одно честное усилие, и ты покоришь эту вершину!',
      legend: 'Степей и заоблачных гор богатырь Алпамыс вырос в суровом ветреном краю, где каждый день требовал силы воли. На платформе он охраняет фокус внимания ребенка от монстра Прокрастинации. Он учит, что величайшие открытия строятся на фундаменте ежедневных маленьких, регулярных шагов.',
      competencies: [
        { title: 'Волевой фокус', desc: 'Способность отключать отвлекающие факторы во время выполнения уроков.' },
        { title: 'Тайм-менеджмент', desc: 'Правильное планирование загрузки и своевременное закрытие домашних дедлайнов.' },
        { title: 'Стойкость перед ошибками', desc: 'Умение не сдаваться при плохих оценках, а пробовать снова и снова.' }
      ],
      qualities: ['Железная воля', 'Пунктуальность', 'Стрессоустойчивость и настойчивость'],
      achievements: ['Железная Дисциплина', 'Стойкий Курсант', 'Щит Спокойствия'],
      questTypes: 'Квесты на непрерывную серию входов (Daily Streak), сдачу 3-х сложных заданий раньше срока.',
      items: [
        { id: 'item-shield', name: 'Щит Спокойствия', desc: 'Крепкий щит, защищающий от потери XP при случайных опечатках на тестах.', icon: <Shield className="w-5 h-5 text-indigo-400" /> },
        { id: 'item-belt', name: 'Пояс Силы Богатыря', desc: 'Добавляет +50 XP к каждой вовремя сданной домашней работе.', icon: <Zap className="w-5 h-5 text-blue-400" /> }
      ]
    },
    {
      id: 'm3',
      name: 'Томирис',
      fullName: 'Томирис (Мудрая Царица)',
      themeColor: 'from-emerald-600 to-teal-700',
      textColor: 'text-emerald-400 border-emerald-500/30',
      shadowColor: 'shadow-emerald-500/20',
      avatar: '/src/assets/images/tomiris.png',
      role: 'Лидерство, Стратегическое мышление, Уверенность и Ораторское мастерство',
      personality: 'Величественная, харизматичная, стратегичная, справедливая предводительница.',
      motivationalPhrase: 'Сила команды — в каждом бойце, сила бойца — в крепкой сплоченной команде. Мысли стратегически!',
      legend: 'Дальновидная царица Томирис прославилась умением просчитывать шаги на десятки ходов вперед и побеждать умом, а не силой. Она верит, что каждый ученик EduProgress — прирожденный лидер. Томирис учит аргументированно отстаивать свою точку зрения и побеждать в олимпиадах.',
      competencies: [
        { title: 'Критическое суждение', desc: 'Анализ фактов, умение отделять истинные аргументы от ложных.' },
        { title: 'Ораторский талант', desc: 'Четкое, громкое произношение и легкое ведение публичных споров.' },
        { title: 'Командное сплочение', desc: 'Навыки координации общих усилий при решении групповых ИИ-квестов.' }
      ],
      qualities: ['Уверенность в себе', 'Харизматичное лидерство', 'Стратегическое планирование'],
      achievements: ['Стратег Победы', 'Оратор Века', 'Верховный Маршал'],
      questTypes: 'Квесты на участие в разговорных спаррингах, олимпиадных вызовах и лидерство в командном зачете.',
      items: [
        { id: 'item-scepter', name: 'Изумрудный Скипетр', desc: 'Увеличивает командную силу на 25% во время групповых дуэлей.', icon: <Award className="w-5 h-5 text-emerald-400" /> },
        { id: 'item-crown', name: 'Венец Мудрого Лидера', desc: 'Выделяет имя студента золотым цветом в глобальной таблице рекордов.', icon: <Sparkles className="w-5 h-5 text-teal-400" /> }
      ]
    },
    {
      id: 'm4',
      name: 'Барс',
      fullName: 'Барс (Креативный Программист)',
      themeColor: 'from-cyan-500 to-blue-600',
      textColor: 'text-cyan-400 border-cyan-500/30',
      shadowColor: 'shadow-cyan-500/20',
      avatar: '/src/assets/images/bars.png',
      role: 'Исследования, IT-Технологии, Программирование, Инновации и Вычислительное мышление',
      personality: 'Смелый, супер-технологичный, гибкий, сообразительный изобретатель.',
      motivationalPhrase: 'Код — это язык созидания. Твори без оглядки на шаблоны и создавай цифровые технологии будущего!',
      legend: 'Высокогорный и ловкий снежный барс живет на острие прогресса в заоблачной обсерватории. Окруженный гаджетами, голограммами карт и кодовыми дисплеями, он исследует новые IT-миры. Он учит детей не бояться экспериментов и видеть в программировании искусство творить.',
      competencies: [
        { title: 'Алгоритмическое мышление', desc: 'Умение быстро строить логику работы ветвлений и условных операторов.' },
        { title: 'Исключение багов (Debugging)', desc: 'Легкое нахождение синтаксических опечаток и пропущенных отступов.' },
        { title: 'Проектирование будущего', desc: 'Понимание структур баз данных, логики работы ИИ и робототехники.' }
      ],
      qualities: ['Инновационное видение', 'Гибкость ума', 'Любовь к техническим экспериментам'],
      achievements: ['Магистр Кода', 'Цифровой Архитектор', 'Истребитель Багов'],
      questTypes: 'Квесты на проектирование архитектуры личного проекта, написание чистого синтаксиса и решение математических головоломок.',
      items: [
        { id: 'item-goggles', name: 'Очки Высокого Полёта', desc: 'Подсвечивают скрытые ошибки в коде подсказками и экономят время разборов.', icon: <Eye className="w-5 h-5 text-cyan-400" /> },
        { id: 'item-telescope', name: 'Подзорная Труба Барса', desc: 'Дает +10% вероятности выпадения двойного опыта (XP x2) при сдаче IT-квеста.', icon: <Scroll className="w-5 h-5 text-blue-400" /> }
      ]
    },
    {
      id: 'm5',
      name: 'Хумо',
      fullName: 'Хумо (Птица Вдохновения & Soft Skills)',
      themeColor: 'from-pink-500 to-purple-600',
      textColor: 'text-pink-400 border-pink-500/30',
      shadowColor: 'shadow-pink-500/20',
      avatar: '/src/assets/images/humo.png',
      role: 'Творчество, Вдохновение, Эмпатия, Soft Skills и Эмоциональный баланс',
      personality: 'Заботливая, гармоничная, эмпатичная, утонченная и жизнерадостная.',
      motivationalPhrase: 'Понимание себя и принятие других — ключ к истинной мудрости. Действуй с любовью к своему делу!',
      legend: 'Священная птица Хумо из восточных мифов приносит на своих радужных крыльях счастье, вдохновение и гармонию. Она верит, что сухие факты без искры творчества мертвы. Хумо воспитывает эмоциональный интеллект, учит сопереживать, рисовать свои мысли и учиться без выгорания.',
      competencies: [
        { title: 'Эмоциональный интеллект', desc: 'Умение понимать свое душевное состояние, бороться со скукой и страхом.' },
        { title: 'Креативное воображение', desc: 'Письмо образных сочинений, разработка красивых пользовательских интерфейсов.' },
        { title: 'Взаимовыручка (Soft Skills)', desc: 'Оказание активной дружеской поддержки одногруппникам через сервис Peer Help.' }
      ],
      qualities: ['Эмпатия', 'Творческая свобода', 'Коммуникабельность и психологическая гибкость'],
      achievements: ['Творец Атмосферы', 'Посол Доброй Воли', 'Муза Сердца'],
      questTypes: 'Квесты на дружескую помощь (Peer Support), участие в разговорных клубах и креативное оформление проектов.',
      items: [
        { id: 'item-brush', name: 'Волшебная Кисть Хумо', desc: 'Световая кисть, раскрашивающая табель успеваемости радужными эффектами.', icon: <UserCheck className="w-5 h-5 text-pink-400" /> },
        { id: 'item-lightbulb', name: 'Искрящаяся Лампочка', desc: 'Мгновенно снимает усталость и восстанавливает уровень ежедневного фокуса.', icon: <Flame className="w-5 h-5 text-purple-400" /> }
      ]
    }
  ];

  const currentMentor = mentorsList[selectedMentorIndex];

  const handleSelectActiveMentor = () => {
    if (onSelectMentor) {
      onSelectMentor(currentMentor.id);
      alert(`Вы успешно утвердили наставника ${currentMentor.name} как вашего основного образовательного проводника!`);
    }
  };

  const handleGenerateCertificateDemo = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingCert(true);
    setTimeout(() => {
      setIsGeneratingCert(false);
      setGenerationSuccessMsg(`Официальный именной сертификат для "${certNameInput}" успешно сгенерирован под покровительством наставника ${currentMentor.name}! Успеваемость сертифицирована печатью Совета Наставников.`);
    }, 1000);
  };

  const toggleDemoItem = (id: string) => {
    setUnlockedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Educational Journey Maps Demo
  const journeyStepsDemo = [
    { title: 'Старт Пути', desc: 'Запуск первого модуля, калибровка темпа и привычек.', guideMsg: `Вам помогает ${currentMentor.name}! Он шепчет слова ободрения: "${currentMentor.motivationalPhrase}"` },
    { title: 'Пик Алгоритмов', desc: 'Решение сложных практических сессий.', guideMsg: `Наставник ${currentMentor.name} активирует свои ключевые компетенции в развитии ваших качеств: ${currentMentor.qualities.join(', ')}.` },
    { title: 'Взаимоиспытание', desc: 'Командные вызовы и спарринги.', guideMsg: `Ваш наставник сопровождает: {${currentMentor.questTypes}} для максимальной синергии.` },
    { title: 'Выпускной Рубеж', desc: 'Аттестационная защита зачетного проекта.', guideMsg: `Генерация уникального сертификата под печатью ${currentMentor.name}!` },
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 z-[9999] animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800/80 rounded-3xl w-full max-w-6xl overflow-hidden shadow-2xl flex flex-col h-full max-h-[92vh] text-white">
        
        {/* HEADER BAR */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-5 border-b border-zinc-805 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
                  Единая Экосистема
                </span>
                <span className="bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
                  5 Равноправных Героев
                </span>
              </div>
              <h2 className="text-md sm:text-lg font-black text-white tracking-tight">Совет Наставников EduProgress</h2>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-705 text-slate-400 hover:text-white p-2 rounded-full transition cursor-pointer border border-slate-700/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TOP FIVE SIMULTANEOUS MENTORS CARDS (EQUAL SIZE, NO BIAS) */}
        <div className="bg-slate-950/50 p-4 border-b border-slate-800 shrink-0">
          <p className="text-center text-[10px] sm:text-xs text-zinc-400 font-medium mb-3">
            Выберите любого наставника для просмотра легенды, интерактивной мотивации, коллекции наград и AI-генератора сертификатов:
          </p>
          <div className="grid grid-cols-5 gap-2 sm:gap-3.5">
            {mentorsList.map((mentor, index) => {
              const isSelected = selectedMentorIndex === index;
              const isActiveUserGuide = activeMentorId === mentor.id;
              return (
                <button
                  key={mentor.id}
                  onClick={() => {
                    setSelectedMentorIndex(index);
                    setGenerationSuccessMsg('');
                  }}
                  className={`relative p-2.5 sm:p-4 rounded-2xl border transition-all duration-300 text-center flex flex-col items-center justify-between h-full cursor-pointer select-none group ${
                    isSelected 
                      ? `bg-slate-850 border-indigo-500 shadow-lg ${mentor.shadowColor}` 
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
                  }`}
                >
                  {/* Status Indicator overlay */}
                  {isActiveUserGuide && (
                    <span className="absolute -top-1 -right-1 bg-teal-500 text-slate-950 rounded-full p-1 border border-slate-900 shadow-sm z-10 animate-pulse">
                      <UserCheck className="w-3 h-3" />
                    </span>
                  )}

                  {/* Character Avatar Container */}
                  <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-xl overflow-hidden mb-2 relative shrink-0 border border-slate-750 bg-black/40">
                    <img 
                      src={mentor.avatar} 
                      alt={mentor.name} 
                      className="w-full h-full object-cover transition duration-300 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=200";
                      }}
                    />
                  </div>

                  {/* Mentor Visual Metadata Name */}
                  <div>
                    <span className="block font-sans font-black text-white text-[10px] sm:text-xs tracking-tight">
                      {mentor.name}
                    </span>
                    <span className="hidden sm:block text-[8px] text-zinc-500 font-mono mt-0.5 truncate max-w-[100px]">
                      {mentor.name === 'Самрук' ? 'Знания' :
                       mentor.name === 'Алпамыс' ? 'Дисциплина' :
                       mentor.name === 'Томирис' ? 'Лидерство' :
                       mentor.name === 'Барс' ? 'Технологии' : 'Креатив'}
                    </span>
                  </div>

                  {/* Active selection spotlight ring */}
                  <div className={`mt-2 w-1.5 h-1.5 rounded-full transition-all ${
                    isSelected ? 'bg-indigo-500 scale-125' : 'bg-transparent'
                  }`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* BOTTOM WORKSPACE SPLIT (DETAILED PROFILES & SIMULATOR EXPERIENCES) */}
        <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-800/80">
          
          {/* LEFT COLUMN: ACTIVE CHARACTER DETAILED INFORMATION */}
          <div className="w-full lg:w-[48%] p-6 space-y-5 bg-slate-950/25">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border border-slate-755 overflow-hidden shadow-md shrink-0 bg-slate-900 relative">
                <img 
                  src={currentMentor.avatar} 
                  alt={currentMentor.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="space-y-1.5 min-w-0">
                <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 text-[8.5px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider inline-block">
                  Профиль Наставника Советa
                </span>
                <h3 className="text-xl font-black text-white font-sans">{currentMentor.fullName}</h3>
                <p className="text-xs text-indigo-300 font-medium font-sans leading-normal">
                  <strong className="text-zinc-400 font-mono">Специализация:</strong> {currentMentor.role}
                </p>
              </div>
            </div>

            {/* Motivational Speech Dialogue */}
            <div className="relative bg-indigo-950/20 border border-indigo-900/60 p-4 rounded-2xl">
              <div className="absolute top-2 right-2.5 flex gap-1">
                <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></span>
                <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>
              </div>
              <span className="text-[9px] uppercase font-bold text-yellow-400 block tracking-wider mb-1">Голос наставника:</span>
              <p className="text-xs leading-relaxed text-zinc-200 italic font-sans">
                « {currentMentor.motivationalPhrase} »
              </p>
            </div>

            {/* Action panel to set as active guide */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="space-y-0.5 text-center sm:text-left min-w-0">
                <span className="text-[9px] font-extrabold text-zinc-500 uppercase block">Управление Персонализацией</span>
                <p className="text-[11px] text-zinc-300">
                  {activeMentorId === currentMentor.id 
                    ? `🛡️ ${currentMentor.name} уже является вашим основным проводником.` 
                    : `Сменить наставника на ${currentMentor.name} для мотивации и стилей.`}
                </p>
              </div>
              <button
                onClick={handleSelectActiveMentor}
                disabled={activeMentorId === currentMentor.id}
                className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer shrink-0 ${
                  activeMentorId === currentMentor.id
                    ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 cursor-not-allowed'
                    : 'bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white shadow-md'
                }`}
              >
                {activeMentorId === currentMentor.id ? 'Выбран' : 'Утвердить наставником'}
              </button>
            </div>

            {/* SUB-TABS INTERFACE FOR DETAILED SPECS */}
            <div className="border-b border-slate-800 flex gap-2 overflow-x-auto select-none py-1">
              {[
                { id: 'lore', label: '📖 История и Характер' },
                { id: 'competencies', label: '🎓 Метрики и Квесты' },
                { id: 'items', label: '💎 Коллекция Наград' },
                { id: 'stories', label: '📜 ИИ-Путешествие' }
              ].map(subTab => (
                <button
                  key={subTab.id}
                  onClick={() => setActiveSubTab(subTab.id as any)}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-xl transition whitespace-nowrap cursor-pointer ${
                    activeSubTab === subTab.id
                      ? 'bg-slate-800 text-white underline decoration-indigo-500 decoration-2 underline-offset-4'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {subTab.label}
                </button>
              ))}
            </div>

            {/* SUB-TAB CONTENTS */}
            <div className="space-y-4">
              
              {activeSubTab === 'lore' && (
                <div className="space-y-3.5 leading-relaxed text-xs text-zinc-300 font-sans">
                  <div>
                    <h5 className="font-extrabold text-white text-[12px] flex items-center gap-1">
                      <Scroll className="w-3.5 h-3.5 text-indigo-400" />
                      Легенда происхождения:
                    </h5>
                    <p className="mt-1 leading-relaxed text-zinc-400">{currentMentor.legend}</p>
                  </div>
                  <div>
                    <h5 className="font-extrabold text-white text-[12px] flex items-center gap-1">
                      <HeartHandshake className="w-3.5 h-3.5 text-pink-400" />
                      Миссия и характер наставника:
                    </h5>
                    <p className="mt-1 leading-relaxed text-zinc-400">
                      <strong>Характер:</strong> {currentMentor.personality}
                    </p>
                  </div>
                </div>
              )}

              {activeSubTab === 'competencies' && (
                <div className="space-y-4 font-sans text-xs">
                  <div>
                    <h5 className="font-extrabold text-white text-[12px] mb-2">Метрики и Качества (развиваемые у школьника):</h5>
                    <div className="grid grid-cols-1 gap-2.5">
                      {currentMentor.competencies.map((comp, idx) => (
                        <div key={idx} className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-800">
                          <span className="font-bold text-[11px] text-white block">{comp.title}</span>
                          <p className="text-[10px] text-zinc-400 leading-normal mt-0.5">{comp.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-black/35 rounded-xl border border-slate-850">
                    <span className="font-bold text-[11.5px] text-zinc-300 block">Типы сопровождаемых квестов:</span>
                    <p className="text-[10.5px] text-zinc-400 leading-relaxed mt-1">{currentMentor.questTypes}</p>
                  </div>

                  <div>
                    <span className="font-bold text-[11.5px] text-zinc-300 block mb-1">Курируемые личные качества:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {currentMentor.qualities.map((q, idx) => (
                        <span key={idx} className="bg-indigo-950/40 text-indigo-300 text-[9.5px] font-extrabold px-2.5 py-0.5 rounded-full border border-indigo-900/30">
                          {q}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeSubTab === 'items' && (
                <div className="space-y-3 font-sans text-xs">
                  <h5 className="font-extrabold text-white text-[12px]">Коллекционные предметы наставника за успехи:</h5>
                  <div className="grid grid-cols-2 gap-3">
                    {currentMentor.items.map(item => {
                      const isUnlocked = !!unlockedItems[item.id];
                      return (
                        <div 
                          key={item.id} 
                          className={`p-3 rounded-xl border flex flex-col justify-between space-y-2.5 transition ${
                            isUnlocked ? 'bg-slate-900 border-slate-750' : 'bg-slate-950/40 border-slate-850 opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-slate-800/80 rounded-lg">
                              {item.icon}
                            </div>
                            <span className="font-bold text-[11px] text-white block">{item.name}</span>
                          </div>
                          <p className="text-[10px] text-zinc-400 leading-normal">{item.desc}</p>
                          
                          <button
                            onClick={() => toggleDemoItem(item.id)}
                            className={`w-full text-center py-1 rounded text-[9px] font-bold cursor-pointer transition ${
                              isUnlocked ? 'bg-slate-800 hover:bg-slate-700 text-zinc-400' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            }`}
                          >
                            {isUnlocked ? '🔓 Заблокировать' : '🎁 Разблокировать'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[9.5px] text-zinc-500 font-mono text-center">
                    💡 Артефакты интегрируются с личным кабинетом студента и предоставляют бонусы к XP и защите от ошибок.
                  </p>
                </div>
              )}

              {activeSubTab === 'stories' && (
                <div className="space-y-3 font-sans text-xs">
                  <h5 className="font-extrabold text-white text-[12px]">Роль в Образовательном путешествии</h5>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Наставник {currentMentor.name} не просто пассивный персонаж. На учебной карте мира он дает подсказки, страхует на контрольных точках, выступает судьей в квестах и генерирует ИИ-напутствия.
                  </p>

                  <div className="space-y-2">
                    {journeyStepsDemo.map((st, idx) => (
                      <div key={idx} className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80 space-y-1">
                        <div className="flex justify-between font-bold text-[10.5px]">
                          <span className="text-white">Этап {idx + 1}: {st.title}</span>
                          <span className="text-indigo-400 font-mono text-[9.5px]">{st.desc}</span>
                        </div>
                        <p className="text-[10px] text-zinc-400 italic">
                          {st.guideMsg}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* RIGHT COLUMN: SIMULATORS & INTERACTIVE GENERATORS (AI INTEGRATIONS) */}
          <div className="w-full lg:w-[52%] p-6 space-y-6">
            
            {/* INSTRUCTOR COMIC GENERATOR PREVIEW */}
            <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">AI-Комикс Успеха с Наставником</h4>
                </div>
                <span className="bg-zinc-800 text-[9px] text-zinc-400 px-2.5 py-0.5 rounded-md font-mono">Simulated GPU Engine</span>
              </div>

              <p className="text-xs text-zinc-400 leading-normal">
                При наборе +500 XP платформа автоматически генерирует сюжетный комикс, где выбранный наставник помогает школьнику одолеть Прокрастинацию.
              </p>

              {/* Simulated Comic strip */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { frame: 1, title: 'Вызов', desc: 'Сложное домашнее задание навевает скуку.', action: 'Студент засыпает...' },
                  { frame: 2, title: 'Появление', desc: `Приходит ${currentMentor.name}!`, action: `Мотивирует цитатой!` },
                  { frame: 3, title: 'Триумф', desc: 'Компетенции активированы! ДЗ сдано.', action: '+100 XP начислено!' }
                ].map((f, i) => {
                  const isActive = comicFrameActive === i;
                  return (
                    <button
                      key={i}
                      onClick={() => setComicFrameActive(i)}
                      className={`p-2.5 rounded-xl text-left transition select-none cursor-pointer border flex flex-col justify-between h-28 ${
                        isActive 
                          ? 'bg-indigo-950/40 border-indigo-505 border-indigo-500 text-white' 
                          : 'bg-black/30 border-slate-850 text-zinc-400 hover:border-slate-800'
                      }`}
                    >
                      <div className="font-mono text-[8px] opacity-65">СЦЕНА {f.frame}</div>
                      <h5 className="font-black text-[10px] text-yellow-300 mt-0.5">{f.title}</h5>
                      <p className="text-[9px] text-zinc-300 leading-normal tracking-tight line-clamp-2 my-1">{f.desc}</p>
                      <span className="text-[8.5px] bg-slate-900 px-1 py-0.1 border border-slate-800 rounded text-cyan-400 font-medium truncate block">
                        {f.action}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Active frame explanation */}
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80 flex gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-700 shrink-0 bg-slate-950">
                  <img src={currentMentor.avatar} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <div className="space-y-1 min-w-0">
                  <span className="text-[10px] text-indigo-400 font-extrabold uppercase">Участие наставника:</span>
                  <p className="text-xs text-zinc-300 italic">
                    {comicFrameActive === 0 && `«Я вижу твою усталость, путник. Но помни: даже величайшие мастера начинали с борьбы с собственной ленью. Давай разобьем этот узел вместе!»`}
                    {comicFrameActive === 1 && `«Активирую внутренние резервы! Мой ${currentMentor.role} к твоим услугам. Сфокусируйся на первой строчке кода!»`}
                    {comicFrameActive === 2 && `«Ура! Славная победа. Я заношу твою историю в книгу величия и выдаю тебе достижение "${currentMentor.achievements[0]}"!»`}
                  </p>
                </div>
              </div>
            </div>

            {/* AI-CERTIFICATE GENERATOR */}
            <div className="bg-slate-950/45 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-teal-400" />
                  <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">AI-Сертификаты и Бренд наставника</h4>
                </div>
                <span className="bg-emerald-950 text-[9px] text-emerald-400 border border-emerald-900/30 px-2 py-0.5 rounded-full font-bold">PDF Signature Active</span>
              </div>

              <p className="text-xs text-zinc-400 leading-normal">
                Каждый успешно законченный учебный модуль сертифицируется подписью вашего выбранного наставника:
              </p>

              <form onSubmit={handleGenerateCertificateDemo} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-zinc-500 block">ФИО Ученика:</label>
                    <input 
                      type="text" 
                      value={certNameInput}
                      onChange={(e) => setCertNameInput(e.target.value)}
                      required
                      placeholder="Александр Смирнов" 
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.8"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-zinc-500 block">Направление:</label>
                    <select className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-1.8 text-zinc-300">
                      <option>Английский язык Starter B1</option>
                      <option>Python Kids - Робототехника</option>
                      <option>Ментальная Арифметика</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isGeneratingCert}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 rounded-xl transition cursor-pointer"
                >
                  {isGeneratingCert ? 'Генерация AI-Сертификата...' : `Сгенерировать сертификат от ${currentMentor.name}`}
                </button>
              </form>

              {/* Output Cert Success */}
              {generationSuccessMsg && (
                <div className="p-4 bg-teal-950/20 border border-teal-900/80 rounded-2xl text-center space-y-3.5 animate-fade-in relative overflow-hidden">
                  <div className="absolute top-1 right-1 bg-emerald-500 text-slate-950 rounded-full p-0.5 text-[8px] font-bold">OK</div>
                  <p className="text-xs text-zinc-100 italic leading-relaxed">
                    "{generationSuccessMsg}"
                  </p>
                  
                  {/* Visual Diploma Mock Card with Mentor brand */}
                  <div className={`mx-auto max-w-sm rounded-xl border border-slate-755 bg-gradient-to-b from-slate-950 to-slate-900 p-4 shadow-xl ${currentMentor.shadowColor}`}>
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                      <span className="text-[8px] uppercase tracking-widest text-zinc-500 font-mono">EDUPROGRESS INTERNATIONAL</span>
                      <Award className="w-3.5 h-3.5 text-yellow-500" />
                    </div>
                    <div className="py-4 text-center space-y-1">
                      <h6 className="text-[10px] text-zinc-400">СЕРТИФИКАТ ОТЛИЧИЯ</h6>
                      <p className="font-extrabold text-sm text-yellow-300 tracking-tight">{certNameInput}</p>
                      <p className="text-[9.5px] text-zinc-300">За успешный прорыв в образовательных мирах</p>
                    </div>
                    <div className="flex justify-between items-end border-t border-slate-800 pt-2.5">
                      <div className="text-left font-mono text-[8px] text-zinc-500">
                        <span>Лицензия: № AI-50098</span>
                        <span className="block">Дата: 2026-06-02</span>
                      </div>
                      <div className="text-right flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full overflow-hidden border border-slate-700 shrink-0">
                          <img src={currentMentor.avatar} alt="Seal" className="w-full h-full object-cover" />
                        </div>
                        <div className="text-left leading-normal font-sans">
                          <span className="block text-[8px] font-extrabold text-white">Печать мудрости</span>
                          <span className="block text-[7px] text-zinc-400 font-mono">{currentMentor.name} (Подпись)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SEASONS & EVENTS OF COUNCIL */}
            <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
              <div className="p-3.5 bg-indigo-500/10 text-indigo-400 rounded-xl shrink-0">
                <Flame className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <span className="bg-amber-400/10 text-amber-400 text-[8.5px] font-extrabold px-2 py-0.5 rounded border border-amber-400/20 block uppercase tracking-wider w-max mb-1">
                  Активное Сезонное Мероприятие
                </span>
                <span className="font-bold text-xs text-white block">Июньский Марафон Совета Наставников 🦅</span>
                <p className="text-[10.5px] text-zinc-400 leading-normal mt-0.5">
                  Пройдите 10 уроков за месяц! Каждый наставник подарит вашей команде по 1 коллекционному артефакту в зависимости от успеваемости.
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* CONTROLS FOOTER */}
        <div className="bg-zinc-950 p-4 border-t border-slate-805 shrink-0 flex items-center justify-between flex-wrap gap-4">
          <div className="text-zinc-500 text-[10.5px] font-mono">
            Регламент EduProgress Council of Mentors. Все права подтверждены. Свободный выбор без ограничений обучения.
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs px-5 py-2 rounded-xl transition cursor-pointer"
          >
            Закрыть Портал Совета
          </button>
        </div>

      </div>
    </div>
  );
}
