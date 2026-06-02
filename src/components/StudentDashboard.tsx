import React, { useState, useEffect } from 'react';
import { Student, StudentProgress, MentorCharacter, GroupQuest, PersonalChallenge, PeerHelp } from '../types';
import { 
  Sparkles, Trophy, Star, ArrowUpCircle, BookOpen, Swords, Heart, Zap, 
  Award, HelpCircle, Shield, CheckCircle2, Flame, Map, Speech, Navigation,
  ChevronRight, Compass, ShieldAlert, AwardIcon, MessageSquare, Info, RefreshCw, 
  Gift, Crown, Laptop, Eye, Printer, Share2, MessageSquareQuote, CheckSquare
} from 'lucide-react';

interface StudentDashboardProps {
  students: Student[];
  progressList: StudentProgress[];
  mentors: MentorCharacter[];
  onTriggerLevelUp: (studentId: string, xp: number) => void;
  quests?: GroupQuest[];
  challenges?: PersonalChallenge[];
  peerHelp?: PeerHelp[];
  onSelectAcademicRole?: (studentId: string, academicRole: string) => void;
  onCompleteChallenge?: (challengeId: string) => void;
  onPeerHelp?: (helperStudentId: string, recipientStudentId: string, action: string) => void;
  onClickCouncil?: () => void;
}

export default function StudentDashboard({
  students: initialStudents,
  progressList,
  mentors,
  onTriggerLevelUp,
  quests = [],
  challenges = [],
  peerHelp = [],
  onSelectAcademicRole,
  onCompleteChallenge,
  onPeerHelp,
  onClickCouncil
}: StudentDashboardProps) {
  // We mirror the raw student list to support fast responsive state updates in playground
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [sessionStudentId, setSessionStudentId] = useState('s1');

  // Input states for peer support
  const [peerRecipientId, setPeerRecipientId] = useState('');
  const [peerAction, setPeerAction] = useState('');

  // Sync state with parent changes
  useEffect(() => {
    setStudents(initialStudents);
  }, [initialStudents]);

  const activeStudent = students.find(s => s.id === sessionStudentId) || students[0];
  const progress = progressList.find(p => p.studentId === activeStudent?.id);
  
  // Custom Character Dialog reaction states
  const [reactionEvent, setReactionEvent] = useState<'greet' | 'homework' | 'goal' | 'levelup' | 'cert'>('greet');
  const [characterMessage, setCharacterMessage] = useState<string>('');
  const [isAnimatingReaction, setIsAnimatingReaction] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'journey' | 'quests' | 'creative' | 'seasonal'>('dashboard');

  // Local state for daily quests
  const [dailyQuests, setDailyQuests] = useState([
    { id: 'q1', text: 'Повторить грамматику и разницу Present Simple / Continuous', xpReward: 50, done: false },
    { id: 'q2', text: 'Решить 3 логические кодовые задачи в модуле', xpReward: 60, done: false },
    { id: 'q3', text: 'Провести разговорный спарринг со ИИ-помощником', xpReward: 40, done: true }
  ]);

  // Success story generators
  const [successStory, setSuccessStory] = useState<{ title: string; story: string; date: string } | null>(null);
  const [generationLoading, setGenerationLoading] = useState(false);

  // Comic Frame state
  const [activeComicFrame, setActiveComicFrame] = useState(0);

  // Cert state
  const [certName, setCertName] = useState('');
  const [certGenerated, setCertGenerated] = useState(false);
  const [certCode, setCertCode] = useState('');

  // Initializing selected mentor from active student metadata
  const mentor = mentors.find(m => m.id === activeStudent?.mentorId) || mentors[0];

  // Helper: Retrieve Trust Points for active mentor
  const getTrustPoints = (mId: string) => {
    return activeStudent?.trustPoints?.[mId] || 120;
  };

  const activeTrust = getTrustPoints(mentor.id);

  // Relationship Stages
  const getRelationStage = (points: number) => {
    if (points >= 250) return { title: '🔋 Интеллектуальный симбиоз (Lvl 5)', desc: 'Вы понимаете друг друга без слов, секретные уроки доступны.' };
    if (points >= 180) return { title: '🔗 Родственные души (Lvl 4)', desc: 'Высшее доверие. Разблокированы элитные артефакты.' };
    if (points >= 120) return { title: '🤝 Верный соратник (Lvl 3)', desc: 'Ваше взаимопонимание крепнет с каждым решенным на дом багом.' };
    if (points >= 60) return { title: '🌱 Теплая связь (Lvl 2)', desc: 'Начальный этап сближения. Персонаж начинает хвалить чаще.' };
    return { title: '🔍 Первое знакомство (Lvl 1)', desc: 'Период притирки и калибровки образовательных ритмов.' };
  };

  const relation = getRelationStage(activeTrust);

  // Custom reaction system text provider
  useEffect(() => {
    const dialogs: Record<string, Record<string, string>> = {
      m1: {
        greet: `Приветствую тебя, взыскательный исследователь! Глубокое погружение в знания — лучший путь к успеху. Как твоё стремление к познанию нового сегодня?`,
        homework: `Славный триумф ума! Твое упорство принесло плоды. Каждое решённое задание расширяет твои горизонты. Начисляю заслуженные XP!`,
        goal: `В этом модуле нашей святой целью является глубокое понимание грамматических структур и академического мышления. Мы разберем суть до мелочей!`,
        levelup: `Восхитительно! Архитектура твоего разума переходит на совершенно новый уровень. Твои учебные успехи сияют как путеводные звезды!`,
        cert: `С глубоким трепетом вручаю тебе этот Знак Академического Отличия. Твой образовательный путь достоин внесения в золотые летописи Совета!`
      },
      m2: {
        greet: `Рад видеть в строю, соратник! Дисциплина — наш главный боевой щит перед ленью. Уверен, сегодня мы выполним все цели вовремя!`,
        homework: `Железный шаг вперед! Честный и честный труд всегда окупается уважением и победой. Ты укрепил свою волю. Награждаю опытом!`,
        goal: `Наша непреклонная цель — заложить железобетонную дисциплину ежедневного обучения и исключить дедлайны. Боремся со всякой прокрастинацией!`,
        levelup: `Сила прибывает с каждым твоим сознательным решением! Твой уровень прокачан. Ты стал еще крепче и выносливее!`,
        cert: `Ты прошел горнило знаний и с честью выдержал суровые испытания. Прими этот Щит Спокойствия и боевой диплом богатырской воли!`
      },
      m3: {
        greet: `Приветствую будущего лидера и стратега! Помни: настоящий оратор покоряет умы не силой, а величием тактики. Начнем наш образовательный раунд!`,
        homework: `Великолепный тактический ход! Твоя победа близка, а конкуренты далеко позади. Начисляю XP за отличный результат!`,
        goal: `Цель этого этапа — развить навыки критического суждения, ораторского таланта и командной координации. Мы завоюем эту учебную вершину!`,
        levelup: `Твой статус и авторитет в группе существенно возросли! Твой образовательный ранг повышен. Весь класс равняется на тебя.`,
        cert: `Ты проявил королевское благородство и мудрость правления. Вручаю почетный Сертификат Победителя соавторства Совета!`
      },
      m4: {
        greet: `Приветствую, великий повелитель кода! Наша локальная сеть зафиксировала твою активность. Готов закоммитить несколько шедевральных алгоритмов без багов?`,
        homework: `Компиляция успешна! Зеленые тесты пройдены! Баги уничтожены, функционал готов. Копи XP в свой стек опыта!`,
        goal: `В этом юните мы осваиваем структуры ветвления, работу со списками и циклы. Твори без шаблонов и создавай IT будущего!`,
        levelup: `Обновление версии прошло успешно! Применил хотфикс: твой уровень вырос. Больше памяти, выше производительность!`,
        cert: `Твой финальный проект успешно залит в глобальный продакшн без единого бага. С гордостью подписываю сертификат Мастера Цифровых Систем!`
      },
      m5: {
        greet: `Радостного и теплого дня, солнце моё! Пусть гармония, любовь к учебе и эмоциональное вдохновение светятся в твоих глазах сегодня!`,
        homework: `Ах, какое чудное созидание! Твой труд наполнен искрой таланта и эмпатичной заботы. Опыт зачислен с огромным удовольствием!`,
        goal: `Цель этого пути — раскрыть внутренний творческий потенциал, прокачать Soft Skills, развить эмпатию и помогать ближним учиться с улыбкой.`,
        levelup: `Твои волшебные крылышки расправляются еще шире! Твой уровень вырос, а значит, твоя душевная энергия согревает весь окружающий класс.`,
        cert: `Твоё любящее сердце полно мудрости и участия. Вручаю самый теплый и красивый диплом Гармонии и Наставничества!`
      }
    };

    const mentorId = mentor.id as keyof typeof dialogs || 'm1';
    const msg = dialogs[mentorId]?.[reactionEvent] || dialogs['m1'][reactionEvent];
    
    setIsAnimatingReaction(true);
    setCharacterMessage(msg);
    const timeout = setTimeout(() => setIsAnimatingReaction(false), 350);
    return () => clearTimeout(timeout);
  }, [reactionEvent, mentor.id]);

  useEffect(() => {
    if (activeStudent) {
      setCertName(activeStudent.name);
    }
  }, [sessionStudentId]);

  // Handle local cheat level up action
  const handleTriggerCheatXp = () => {
    onTriggerLevelUp(activeStudent.id, 100);
    
    // Auto sync level state locally for instant snappy response
    const currentXp = activeStudent.xp + 100;
    const currentLvl = Math.floor(currentXp / 400) + 1;
    setStudents(prev => prev.map(s => {
      if (s.id === activeStudent.id) {
        // Boost trust with active mentor too!
        const plusTrust = { ...(s.trustPoints || {}) };
        plusTrust[mentor.id] = (plusTrust[mentor.id] || 120) + 15;
        return {
          ...s,
          xp: currentXp,
          level: currentLvl,
          trustPoints: plusTrust
        };
      }
      return s;
    }));
    setReactionEvent('levelup');
  };

  // Claim quest from active student dashboard
  const handleCompleteQuest = (id: string, xpReward: number) => {
    setDailyQuests(prev => prev.map(q => q.id === id ? { ...q, done: true } : q));
    onTriggerLevelUp(activeStudent.id, xpReward);
    
    // Add XP and Trust immediately to local mirrored state
    setStudents(prev => prev.map(s => {
      if (s.id === activeStudent.id) {
        const plusTrust = { ...(s.trustPoints || {}) };
        plusTrust[mentor.id] = (plusTrust[mentor.id] || 120) + 20;
        return {
          ...s,
          xp: s.xp + xpReward,
          level: Math.floor((s.xp + xpReward) / 400) + 1,
          trustPoints: plusTrust
        };
      }
      return s;
    }));
    
    setReactionEvent('homework');
  };

  const handlePeerHelpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!peerRecipientId || !peerAction.trim()) {
      alert('Пожалуйста, выберите одногруппника и кратко опишите помощь.');
      return;
    }
    if (onPeerHelp) {
      onPeerHelp(activeStudent.id, peerRecipientId, peerAction);
      
      // Award XP and relationship points immediately!
      setStudents(prev => prev.map(s => {
        if (s.id === activeStudent.id) {
          const plusTrust = { ...(s.trustPoints || {}) };
          plusTrust['m5'] = (plusTrust['m5'] || 30) + 25; // Humo loves peer service
          plusTrust[mentor.id] = (plusTrust[mentor.id] || 120) + 15;
          return {
            ...s,
            xp: s.xp + 50,
            level: Math.floor((s.xp + 50) / 400) + 1,
            trustPoints: plusTrust
          };
        }
        return s;
      }));

      alert('Центр наставничества зафиксировал Peer Help! Наставник Хумо дарит вам +25 к Soft Skills связи, ваш друг получил оповещение!');
      setPeerAction('');
      setPeerRecipientId('');
    }
  };

  // Playable Mentor Quests List
  const customMentorQuests = [
    { id: 'mq_m1_1', mentorId: 'm1', title: 'Факультатив: Тайны древних символов', desc: 'Прочесть дополнительную статью о происхождении языков программирования.', xp: 120, trust: 35, difficulty: 'Легко' },
    { id: 'mq_m1_2', mentorId: 'm1', title: 'Исследовательский штурм', desc: 'Заполнить в словаре 10 сложных академических определений.', xp: 180, trust: 50, difficulty: 'Средне' },
    { id: 'mq_m2_1', mentorId: 'm2', title: 'Дисциплинарный марафон (3 дня)', desc: 'Заходить на платформу 3 дня подряд без единой задержки.', xp: 150, trust: 40, difficulty: 'Средне' },
    { id: 'mq_m2_2', mentorId: 'm2', title: 'Досрочный выстрел дедлайна', desc: 'Сдать следующее домашнее задание за 24 часа до урока.', xp: 190, trust: 55, difficulty: 'Сложно' },
    { id: 'mq_m3_1', mentorId: 'm3', title: 'Капитанский речевой раунд', desc: 'Победить в разговорной дуэли лидера другого учебного класса.', xp: 160, trust: 45, difficulty: 'Средне' },
    { id: 'mq_m3_2', mentorId: 'm3', title: 'Стратегический чек-лист команды', desc: 'Организовать созвон группы и утвердить план мини-проекта.', xp: 200, trust: 60, difficulty: 'Сложно' },
    { id: 'mq_m4_1', mentorId: 'm4', title: 'Отладка спагетти-кода', desc: 'Найти и устранить 4 скрытых синтаксических бага в тестовом файле.', xp: 150, trust: 45, difficulty: 'Средне' },
    { id: 'mq_m4_2', mentorId: 'm4', title: 'Разработка ИИ Рекомендатора', desc: 'Написать алгоритм ветвления "if-else", выдающий советы пользователю.', xp: 220, trust: 65, difficulty: 'Высокая кодовая' },
    { id: 'mq_m5_1', mentorId: 'm5', title: 'Теплые слова поддержки', desc: 'Написать развернутую ободряющую подсказку отстающему студенту в чате.', xp: 120, trust: 40, difficulty: 'Эмпатичный' },
    { id: 'mq_m5_2', mentorId: 'm5', title: 'Оформление UI-презентации курса', desc: 'Создать креативную блок-схему своего проекта с цветовым кодированием.', xp: 170, trust: 50, difficulty: 'Творческий' }
  ];

  const activeMentorQuests = customMentorQuests.filter(q => q.mentorId === mentor.id);

  const handleClaimMentorQuest = async (questId: string, rewardXp: number, trustReward: number) => {
    try {
      const res = await fetch(`/api/students/${activeStudent.id}/claim-mentor-quest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questId, rewardXp, trustReward, mentorId: mentor.id })
      });
      const data = await res.json();
      if (data.success) {
        // Update local mirrored state immediately
        setStudents(prev => prev.map(s => {
          if (s.id === activeStudent.id) {
            const plusTrust = { ...(s.trustPoints || {}) };
            plusTrust[mentor.id] = (plusTrust[mentor.id] || 120) + trustReward;
            const completed = [...(s.completedMentorQuests || [])];
            if (!completed.includes(questId)) completed.push(questId);
            return {
              ...s,
              xp: s.xp + rewardXp,
              level: Math.floor((s.xp + rewardXp) / 400) + 1,
              trustPoints: plusTrust,
              completedMentorQuests: completed
            };
          }
          return s;
        }));
        setReactionEvent('homework');
        alert(`Квест наставника успешно выполнен! Получено +${rewardXp} XP и +${trustReward} очков связи с ${mentor.name}!`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Store of Mentor Artifacts/Relics
  const mentorCollectibles = [
    { id: 'item-feather', name: 'Перо познания Самрука', desc: 'Скорость освоения теоретических терминов увеличена на 15%', cost: 180, icon: '🪶', mId: 'm1' },
    { id: 'item-compass', name: 'Компас горизонтов', desc: 'Указывает на пробелы и дает +10% к их быстрому устранению', cost: 240, icon: '🧭', mId: 'm1' },
    { id: 'item-shield', name: 'Щит Алпамыса', desc: 'Защищает ваш ежедневный стрик от случайного пропуска', cost: 140, icon: '🛡️', mId: 'm2' },
    { id: 'item-belt', name: 'Пояс Силы Богатыря', desc: 'Повышает XP на 50 за вовремя присланные домашние задания', cost: 220, icon: '🥋', mId: 'm2' },
    { id: 'item-crown', name: 'Венец Мудрого Лидера', desc: 'Подсвечивает имя в лидерборде королевским золотым золотом', cost: 250, icon: '👑', mId: 'm3' },
    { id: 'item-scepter', name: 'Изумрудный Скипетр', desc: 'Увеличивает групповую силу вовлечения ваших напарников на 15%', cost: 170, icon: '⚜️', mId: 'm3' },
    { id: 'item-goggles', name: 'Кибер-Очки Барса', desc: 'Автоматически подсвечивают забытые скобки или кавычки в ИИ-подсказчике', cost: 200, icon: '👓', mId: 'm4' },
    { id: 'item-telescope', name: 'Линза Аналитика', desc: 'Дает +20% вероятности заиметь критические баллы без ошибок', cost: 230, icon: '🔭', mId: 'm4' },
    { id: 'item-brush', name: 'Кисть Гармонии Хумо', desc: 'Раскрашивает карточку профиля переливающимися эффектами', cost: 150, icon: '🖌️', mId: 'm5' },
    { id: 'item-lightbulb', name: 'Лампа Креативного Инсайта', desc: 'Мгновенно восстанавливает боевой фокус ученика', cost: 190, icon: '💡', mId: 'm5' }
  ];

  const handleBuyRelic = async (itemId: string, costPoints: number) => {
    if (activeTrust < costPoints) {
      alert(`Недостаточно очков связи с наставником. Нужно ${costPoints}, у вас только ${activeTrust}. Complete more mentor quests!`);
      return;
    }
    try {
      const res = await fetch(`/api/students/${activeStudent.id}/unlock-relic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, mentorId: mentor.id, costPoints })
      });
      const data = await res.json();
      if (data.success) {
        setStudents(prev => prev.map(s => {
          if (s.id === activeStudent.id) {
            const plusTrust = { ...(s.trustPoints || {}) };
            plusTrust[mentor.id] = (plusTrust[mentor.id] || 120) - costPoints;
            const items = [...(s.unlockedItems || [])];
            if (!items.includes(itemId)) items.push(itemId);
            return {
              ...s,
              trustPoints: plusTrust,
              unlockedItems: items
            };
          }
          return s;
        }));
        alert('Поздравляем! Артефакт разблокирован и дает пассивный бонус к вашей учетной записи!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Dynamic coach dynamic messages based on active metrics
  const getDynamicCoachingAdvice = () => {
    const adviceList = [];
    if (activeStudent.attendanceRate < 80) {
      adviceList.push({
        type: 'danger',
        msg: `⚠️ Критическая яма посещаемости (${activeStudent.attendanceRate}%). Твой наставник бьет тревогу! Пропущенные занятия рушат непрерывность понимания.`
      });
    }
    if (activeStudent.generalScore < 4.0) {
      adviceList.push({
        type: 'warning',
        msg: `📉 Твоя средняя успеваемость сейчас составляет ${activeStudent.generalScore} из 5. Наставник советует исправить старые домашние работы и запросить устный спарринг.`
      });
    }
    if (activeStudent.engagementRate && activeStudent.engagementRate < 80) {
      adviceList.push({
        type: 'info',
        msg: `💤 Индекс твоего учебного фокуса снижен до ${activeStudent.engagementRate}%. Регулярнее используй Peer Help или сделай ИИ-челлендж для восстановления мотивации.`
      });
    }
    if (activeStudent.riskRating === 'high') {
      adviceList.push({
        type: 'danger',
        msg: `🚨 Внимание: Модели прогнозирования зафиксировали риск угасания учебной мотивации. Рекомендована срочная сессия 1-на-1 с вашим персональным проводником.`
      });
    }
    if (adviceList.length === 0) {
      adviceList.push({
        type: 'success',
        msg: `✨ Твои образовательные метрики идеальны! Посещаемость ${activeStudent.attendanceRate}%, успеваемость ${activeStudent.generalScore}/5, высокая вовлеченность. Продолжай держать темп!`
      });
    }
    return adviceList;
  };

  const currentAdvisorList = getDynamicCoachingAdvice();

  // Character-specific Recommendations List
  const getPersonalRecommendations = () => {
    if (mentor.id === 'm1') {
      return [
        { topic: 'Факультатив "Введение в NLP нейросети"', type: 'Редкий курс', xpBoost: '+150 XP', desc: 'Самрук рекомендует расширить границы своего кругозора!' },
        { topic: 'Учебный материал: Лексический словарь Cambridge English (Starter)', type: 'Книга', xpBoost: '+80 XP', desc: 'Изучите 50 продвинутых словесных форм.' }
      ];
    }
    if (mentor.id === 'm2') {
      return [
        { topic: 'Челлендж "Ранняя птица"', type: 'Дисциплина', xpBoost: '+140 XP', desc: 'Решение домашней работы на опережение основного класса.' },
        { topic: 'Тайм-боксинг по методу Помидора', type: 'Методика', xpBoost: '+70 XP', desc: 'Предотвратит утомление и повысит общий фокус.' }
      ];
    }
    if (mentor.id === 'm3') {
      return [
        { topic: 'Штурм олимпиады: EduCup 2026', type: 'Турнир', xpBoost: '+250 XP', desc: 'Томирис видит в вас огромный стратегический стержень!' },
        { topic: 'Роль: Председатель Клуба Кода', type: 'Академическая', xpBoost: '+120 XP', desc: 'Координируйте еженедельный квест группы.' }
      ];
    }
    if (mentor.id === 'm4') {
      return [
        { topic: 'Проект на PyGame: Боевой Космос', type: 'STEM Разработка', xpBoost: '+300 XP', desc: 'Барс предлагает разработать интерактивный игровой симулятор.' },
        { topic: 'Интерактивный тренажер: Условия "if/else"', type: 'Алгоритмы', xpBoost: '+100 XP', desc: 'Разберите тонкие моменты вложенных конструкций.' }
      ];
    }
    return [
      { topic: 'Парный спарринг в Центре Взаимопомощи', type: 'Взаимовыручка', xpBoost: '+120 XP', desc: 'Помогите другу Егору Морозову разобраться с Python циклами.' },
      { topic: 'Творческий челлендж: Дизайн аватара', type: 'Креатив', xpBoost: '+90 XP', desc: 'Оформите презентацию своего проекта красочным лого.' }
    ];
  };

  const mentorRecommendations = getPersonalRecommendations();

  // Generate Success Story
  const handleGenerateSuccessStory = () => {
    setGenerationLoading(true);
    setSuccessStory(null);
    setTimeout(() => {
      const titles = {
        m1: 'Сказание о Великом Восхождении Знаний',
        m2: 'Ода Несокрушимой Дисциплины и Триумфа',
        m3: 'Стратегический Рапорт о Победах Полководца',
        m4: 'Документ Компиляции Кода и Системного Прорыва',
        m5: 'История о Расправившихся Радужных Крыльях'
      };

      const stories = {
        m1: `В соавторстве с Самруком, Хранителем Знаний. \n\nВ великой книге успехов EduProgress появилась новая яркая страница, принадлежащая ученику по имени ${activeStudent.name}. Под мудрым крылом Самрука, ${activeStudent.name} продемонстрировал непревзойденное академическое рвение. Имея посещаемость ${activeStudent.attendanceRate}% и уверенную среднюю оценку ${activeStudent.generalScore}, он совершил качественный прыжок в изучении модулей. Его утонченный разум не страшится сложных тем, а жажда открытий ведет его прямо к вершинам образования!`,
        m2: `В соавторстве с Богатырем Дисциплины Алпамысом. \n\nС гордостью сообщаю, что воин дисциплины ${activeStudent.name} проявил стальной характер. Борясь с монстром лени и прокрастинации, этот ученик удерживает посещаемость на уровне ${activeStudent.attendanceRate}%. Каждая его сданная вовремя работа — это победа над собой. Алпамыс лично ставит свою печать на этом повествовании: "Трудности пали перед твоей волей!".`,
        m3: `В соавторстве с Мудрой Царицей Томирис. \n\nРапорт Совета командиров. Ученик ${activeStudent.name} выдвинулся на авангард Лидерской таблицы школы со счетом ${activeStudent.xp} XP. Взяв на себя стратегическую роль "${activeStudent.academicRole || 'Лидер'} в классе", ${activeStudent.name} не просто решает задачи, но и мотивирует всю свою команду отстаивать интеллектуальную честь класса. Это путь настоящего генерала!`,
        m4: `В соавторстве с Креативным Кодером Барсом. \n\nЛистинг компиляции: ${activeStudent.name} задеплоил идеальный уровень усердия. Наш умный детектор багов не зафиксировал сбоев в его посещаемости (${activeStudent.attendanceRate}%). С GPA ${activeStudent.generalScore} из 5, он сдает безупречный синтаксис кодовых алгоритмов. Все стеки переполнены успехом, а его проект готов к глобальному релизу!`,
        m5: `В соавторстве с Птицей Вдохновения Хумо. \n\nМоё дорогое солнце ${activeStudent.name} расправил свои крылья эмпатии и Soft Skills. Продемонстрировав душевное тепло, он активно регистрирует помощь одногруппникам в Центре Взаимовыручки. Его средний балл ${activeStudent.generalScore} согревает сердца учителей. Творческий путь обучения полон гармонии и радостных побед!`
      };

      const key = mentor.id as keyof typeof stories;
      setSuccessStory({
        title: titles[key] || 'История Успеха Куратора',
        story: stories[key] || 'Ученик демонстрирует великолепную отдачу в обучении!',
        date: new Date().toLocaleDateString('ru-RU')
      });
      setGenerationLoading(false);
    }, 1500);
  };

  // Generate AI-Certificate Signature Setup
  const handleGenerateCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certName.trim()) return;
    setCertGenerated(false);
    setTimeout(() => {
      setCertCode('EDUPROGRESS-' + Math.floor(Math.random() * 90000 + 10000));
      setCertGenerated(true);
    }, 1000);
  };

  // Interactive progress path points
  const journeyNodes = [
    { id: 1, name: 'Вводный модуль и синтаксис', requiredLvl: 1, desc: 'Знакомство с базой', dialog: 'Здесь закладываются камни фундамента. Собери первые крохи опыта!' },
    { id: 2, name: 'Условия ветвления и if-else', requiredLvl: 2, desc: 'Развилка судьбы программиста', dialog: 'Мир разделился на ветви "ИСТИНА" и "ЛОЖЬ". Помоги своей программе сделать выбор!' },
    { id: 3, name: 'Списки и циклы For', requiredLvl: 3, desc: 'Множества и повторения', dialog: 'Мы вошли в великий цикл бесконечности! Научись управлять массивами.' },
    { id: 4, name: 'Парный кодовый спарринг', requiredLvl: 4, desc: 'Тест на командную работу', dialog: 'Сплочение — ключ к продвижению. Сдай проект с напарником!' },
    { id: 5, name: 'Финальный ИИ-Синтез', requiredLvl: 5, desc: 'Выпускной триумф', dialog: 'Перед тобой врата дипломного проекта. Получи заветную подпись!' }
  ];

  const currentLevelNode = Math.min(activeStudent.level, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 font-sans">
      
      {/* 1. PLAYGROUND HEADER SELECTOR BLOCK */}
      <div className="lg:col-span-4 bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-xl text-indigo-700">
            <Crown className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 text-sm leading-tight">Система Обучения & Наставничества Real-Time 🦅</h4>
            <p className="text-[10px] text-slate-500 font-medium">Сектор взаимодействия Совета персонажей, AI-генерации квестов и отношений</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl flex-wrap">
          <span className="text-[9.5px] uppercase font-bold text-slate-450 px-2 font-mono">Выбор ученика:</span>
          {students.map(st => {
            const isMe = st.id === sessionStudentId;
            return (
              <button
                key={st.id}
                onClick={() => {
                  setSessionStudentId(st.id);
                  setSuccessStory(null);
                  setCertGenerated(false);
                }}
                className={`text-[10px] px-3 py-1.5 rounded-lg transition font-extrabold cursor-pointer flex items-center gap-1 ${
                  isMe
                    ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{st.name.split(' ')[0]}</span>
                <span className="text-[8px] bg-black/25 px-1 py-0.1 rounded text-yellow-300">Lvl {st.level}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. DYNAMIC CHARACTER BOARD / ACTION CORNER */}
      <div className="lg:col-span-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 rounded-3xl p-6 text-white border border-indigo-900 shadow-md relative overflow-hidden flex flex-col md:flex-row gap-6 items-center">
        
        {/* Glowing Background effect */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        {/* Avatar Circle Container with Expression state badges */}
        <div className="relative shrink-0 flex flex-col items-center">
          <div className="w-28 h-28 rounded-2xl bg-indigo-950 border border-indigo-700 p-1 overflow-hidden relative group shadow-2xl">
            <img 
              src={mentor.avatar} 
              alt={mentor.name} 
              className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=400";
              }}
            />
            {/* Expression Indicator Badge */}
            <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-slate-950/80 border border-slate-700 tracking-wider">
              {reactionEvent === 'greet' && '😊 Приветствует'}
              {reactionEvent === 'homework' && '🎉 Поздравляет'}
              {reactionEvent === 'goal' && '📖 Цели обучения'}
              {reactionEvent === 'levelup' && '📈 Уровень UP'}
              {reactionEvent === 'cert' && '🎓 Вручает диплом'}
            </span>
          </div>

          <span className="mt-2 text-[10px] font-mono text-zinc-400">Связь: {activeTrust} очков</span>
        </div>

        {/* Dynamic dialog chat speech block */}
        <div className="flex-1 space-y-3 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md tracking-wider">
              Цифровой Проводник: {mentor.name}
            </span>
            <span className="text-zinc-400 text-xs truncate max-w-[200px]">{mentor.role}</span>
          </div>

          {/* Dialog Bubble */}
          <div className={`p-4 bg-black/35 rounded-2xl border border-indigo-900/40 relative min-h-16 flex items-center transition duration-300 ${isAnimatingReaction ? 'scale-98 opacity-50' : 'scale-100 opacity-100'}`}>
            <p className="text-xs sm:text-sm font-medium leading-relaxed italic text-zinc-100 font-sans">
              « {characterMessage} »
            </p>
          </div>

          {/* Action Trigger Buttons for Students Events */}
          <div className="flex flex-wrap gap-1.5 items-center bg-black/15 p-2 rounded-xl">
            <span className="text-[8px] font-mono uppercase text-zinc-500 font-bold block mr-1 sm:block hidden">Эмоциональные реакции:</span>
            {[
              { id: 'greet', label: '👋 Вход в систему' },
              { id: 'homework', label: '✏️ Сдать ДЗ' },
              { id: 'goal', label: '📖 Объяснить юнит' },
              { id: 'levelup', label: '⚡ Набрать XP' },
              { id: 'cert', label: '🎓 Сертификат' }
            ].map(act => (
              <button
                key={act.id}
                onClick={() => {
                  setReactionEvent(act.id as any);
                  if (act.id === 'levelup') {
                    handleTriggerCheatXp();
                  }
                }}
                className={`text-[9.5px] px-2.5 py-1.5 rounded-lg font-bold cursor-pointer transition active:scale-95 ${
                  reactionEvent === act.id 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-slate-800 text-zinc-300 hover:bg-slate-750'
                }`}
              >
                {act.label}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* 3. COGNITIVE TABS SWITCH */}
      <div className="lg:col-span-4 flex bg-white p-1 rounded-2xl border border-slate-200 overflow-x-auto gap-1">
        {[
          { id: 'dashboard', label: '📊 Личные метрики', icon: <Crown className="w-4 h-4" /> },
          { id: 'journey', label: '🗺️ Карта путешествия', icon: <Map className="w-4 h-4" /> },
          { id: 'quests', label: '🎯 Квесты & Связь', icon: <Zap className="w-4 h-4 font-bold" /> },
          { id: 'creative', label: '🎨 AI Лаборатория', icon: <Sparkles className="w-4 h-4" /> },
          { id: 'seasonal', label: '🌋 Сезонный Пик', icon: <Flame className="w-4 h-4" /> }
        ].map(tb => (
          <button
            key={tb.id}
            onClick={() => {
              setActiveTab(tb.id as any);
              if (tb.id === 'journey') setReactionEvent('goal');
              if (tb.id === 'creative') setReactionEvent('cert');
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition shrink-0 cursor-pointer ${
              activeTab === tb.id 
                ? 'bg-slate-900 text-white shadow-xs' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tb.icon}
            <span>{tb.label}</span>
          </button>
        ))}
      </div>

      {/* 4. ACTIVE SUB-VIEW LAYOUT */}

      {activeTab === 'dashboard' && (
        <>
          {/* CLIENT METRICS LEFT COLUMN */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Relationship trust status */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:border-r border-slate-100 pr-4 space-y-1 text-center md:text-left">
                <span className="text-[9px] uppercase font-mono font-bold text-slate-400">Шкала отношений</span>
                <h5 className="font-extrabold text-sm text-slate-805">{relation.title}</h5>
                <p className="text-[10px] text-slate-450 leading-tight">{relation.desc}</p>
              </div>

              <div className="md:col-span-2 space-y-3">
                <div className="flex justify-between items-center text-xs font-bold font-mono">
                  <span className="text-slate-600 flex items-center gap-1">
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" /> Доверие наставника:
                  </span>
                  <span className="text-rose-600">
                    {activeTrust} / 300 очков связи
                  </span>
                </div>
                {/* Visual relationship bar */}
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex">
                  <div
                    style={{ width: `${Math.min((activeTrust / 3) || 12, 100)}%` }}
                    className="bg-gradient-to-r from-pink-500 to-rose-500 h-full rounded-full transition-all duration-500"
                  ></div>
                </div>

                <div className="flex justify-between items-center text-[9px] text-slate-400">
                  <span>Lvl 1 "Знакомство" (0+)</span>
                  <span>Lvl 3 "Верный соратник" (120+)</span>
                  <span>Lvl 5 "Симбиоз" (250+)</span>
                </div>
              </div>
            </div>

            {/* Dynamic messages based on stats */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-205">
              <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                ИИ-Анализ метрик активности
              </span>
              <h5 className="font-extrabold text-xs text-slate-800 mt-1 mb-2">Оперативные уведомления об уязвимостях ученика:</h5>
              
              <div className="space-y-2">
                {currentAdvisorList.map((adv, idx) => (
                  <div 
                    key={idx} 
                    className={`p-3 rounded-xl text-xs font-medium leading-relaxed flex items-start gap-2.5 ${
                      adv.type === 'danger' 
                        ? 'bg-red-50 text-red-700 border border-red-100' 
                        : adv.type === 'warning'
                        ? 'bg-amber-50 text-amber-700 border border-amber-100'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    }`}
                  >
                    <div className="mt-0.5">
                      {adv.type === 'danger' ? <ShieldAlert className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                    </div>
                    <span>{adv.msg}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Personalized Recommendations */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
              <div className="flex items-center gap-1.5 mb-3">
                <Sparkles className="w-4.5 h-4.5 text-yellow-500" />
                <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">Персональные шаги развития от {mentor.name}</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-35 gap-3">
                {mentorRecommendations.map((rec, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-150 p-3.5 rounded-2xl flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="bg-indigo-100 text-indigo-705 text-[8.5px] font-extrabold px-1.5 py-0.5 rounded leading-none">{rec.type}</span>
                        <span className="text-emerald-600 font-mono text-[9px] font-bold">{rec.xpBoost}</span>
                      </div>
                      <span className="font-extrabold text-xs text-slate-800 block leading-tight">{rec.topic}</span>
                      <p className="text-[10.5px] text-slate-500 mt-1 leading-normal">{rec.desc}</p>
                    </div>
                    <button 
                      onClick={() => {
                        alert(`Наставник ${mentor.name} занес рекомендацию "${rec.topic}" в ваш персональный квестбук! Наберитесь сил!`);
                        handleTriggerCheatXp();
                      }}
                      className="mt-3.5 w-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-250 font-bold text-[9.5px] py-1.5 rounded-xl cursor-pointer select-none transition"
                    >
                      Активировать задание
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Quests block */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <CheckSquare className="w-4.5 h-4.5 text-indigo-500" />
                <h4 className="font-extrabold text-xs text-slate-805 uppercase tracking-wide">Домашняя образовательная миссия</h4>
              </div>

              <div className="space-y-2">
                {dailyQuests.map((quest) => (
                  <div
                    key={quest.id}
                    className={`border rounded-xl p-3.5 flex items-center justify-between transition ${
                      quest.done
                        ? 'border-emerald-100 bg-emerald-50/10 opacity-70'
                        : 'border-slate-200 bg-white hover:border-slate-350 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                        quest.done ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {quest.done ? '✓' : '⚡'}
                      </div>
                      <div>
                        <p className={`text-xs text-slate-800 font-extrabold ${quest.done ? 'line-through text-slate-400 font-medium' : ''}`}>
                          {quest.text}
                        </p>
                        <span className="text-[9px] text-emerald-600 font-bold block mt-0.5 font-mono">Награда за сдачу: +{quest.xpReward} XP</span>
                      </div>
                    </div>

                    {!quest.done && (
                      <button
                        onClick={() => handleCompleteQuest(quest.id, quest.xpReward)}
                        className="bg-emerald-500 hover:bg-emerald-600 font-extrabold text-[9.5px] text-white py-1.5 px-3 rounded-lg flex items-center gap-1 active:scale-95 transition cursor-pointer shrink-0"
                      >
                        Сдать задание
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* SYSTEM OF ACADEMIC ROLES CHOICE */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                <div>
                  <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">Роль ученика в учебной группе</h4>
                  <p className="text-[10px] text-slate-450">Выберите роль, которая лучше всего отражает вашу помощь соратникам</p>
                </div>
                <span className="text-[10px] font-mono font-black bg-indigo-5 hover:bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1 rounded-xl uppercase">
                  Ваша роль: {activeStudent.academicRole || 'Студент'}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
                {[
                  { title: 'Исследователь', icon: '🔍', desc: 'Фокус на глубокий анализ кода, циклы и сложные грамматические разборы.' },
                  { title: 'Наставник', icon: '🤝', desc: 'Упор на взаимовыручку отстающих соратников, совместный разбор багов.' },
                  { title: 'Эксперт', icon: '🎓', desc: 'Повышенное внимание идеальному выполнению устных зачетов и тестов.' },
                  { title: 'Лидер команды', icon: '👑', desc: 'Координация еженедельных квестов класса, поддержка высокой успеваемости.' },
                  { title: 'Коммуникатор', icon: '🗣️', desc: 'Снятие барьера ведения разговорной речи в языковых дуэлях.' }
                ].map((role) => {
                  const isCurrent = activeStudent.academicRole === role.title;
                  return (
                    <button
                      key={role.title}
                      onClick={() => {
                        if (onSelectAcademicRole) {
                          onSelectAcademicRole(activeStudent.id, role.title);
                          setStudents(prev => prev.map(s => s.id === activeStudent.id ? { ...s, academicRole: role.title as any } : s));
                          alert(`Роль успешно обновлена на "${role.title}"!`);
                        }
                      }}
                      className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-between group cursor-pointer hover:border-indigo-400 ${
                        isCurrent 
                          ? 'border-indigo-500 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-500/20' 
                          : 'border-slate-200 bg-slate-50/40 hover:bg-white'
                      }`}
                    >
                      <span className="text-2xl mb-1">{role.icon}</span>
                      <div>
                        <span className="block text-[10px] font-black text-slate-800">{role.title}</span>
                        <p className="text-[8px] text-slate-400 leading-tight line-clamp-2 mt-1 min-h-6 group-hover:line-clamp-none">
                          {role.desc}
                        </p>
                      </div>
                      <span className={`text-[8px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded mt-2 block ${
                        isCurrent ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {isCurrent ? 'Выбрана' : 'Взять'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CENTER OF PEER SUPPORT */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
              <div className="flex items-center gap-1.5 mb-3">
                <Heart className="w-4.5 h-4.5 text-rose-500 fill-rose-500" />
                <h4 className="font-extrabold text-xs text-slate-850 uppercase tracking-wider">Центр Совместной Поддержки & Регистрации Взаимопомощи</h4>
              </div>

              <form onSubmit={handlePeerHelpSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-150">
                <div className="md:col-span-1">
                  <label className="text-[8px] text-slate-500 uppercase font-black font-mono block mb-1">Кому помог в классе:</label>
                  <select
                    value={peerRecipientId}
                    onChange={(e) => setPeerRecipientId(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-700 outline-none"
                    required
                  >
                    <option value="">Выберите...</option>
                    {students.filter(s => s.id !== activeStudent.id).map(st => (
                      <option key={st.id} value={st.id}>{st.name}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-[8px] text-slate-500 uppercase font-black font-mono block mb-1">Грамматический/кодовый решенный баг:</label>
                  <input
                    type="text"
                    value={peerAction}
                    onChange={(e) => setPeerAction(e.target.value)}
                    placeholder="Какую конкретно тему/функцию помогли отладить соратнику?.."
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700 outline-none"
                    required
                  />
                </div>

                <div className="md:col-span-1 flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-bold py-3.5 px-4 rounded-xl transition cursor-pointer font-sans"
                  >
                    🤝 Записать взаимовыручку
                  </button>
                </div>
              </form>
            </div>

          </div>

          {/* LEADERBOARD RIGHT COLUMN */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Gamified Level & XP Section */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-3.5">
              <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 font-mono block">Ваш игровой опыт</span>
              
              <div className="flex flex-col items-center py-2 bg-slate-50 border border-slate-150 rounded-2xl">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-teal-500 p-0.5 flex items-center justify-center text-center shadow">
                  <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center">
                    <span className="text-[8px] text-slate-450 uppercase font-black leading-none">Уровень</span>
                    <span className="text-xl font-black text-slate-800 leading-tight">{activeStudent.level}</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 font-mono font-semibold mt-2">Титул: Master Scholar ⭐</span>
                <span className="bg-indigo-50 text-indigo-700 font-mono font-bold text-[9px] px-2.5 py-0.5 rounded-full mt-1.5 border border-indigo-100">
                  {activeStudent.xp} XP всего
                </span>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1 font-mono">
                  <span>До Lvl {activeStudent.level + 1} осталось:</span>
                  <span>{400 - (activeStudent.xp % 400)} XP</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden shadow-inner flex">
                  <div
                    style={{ width: `${(activeStudent.xp % 400) / 4}%` }}
                    className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  ></div>
                </div>
              </div>

              {/* Developer Cheat Booster */}
              <button
                onClick={handleTriggerCheatXp}
                className="w-full bg-slate-100 hover:bg-slate-200 font-extrabold text-[10px] text-slate-700 p-2 rounded-xl flex items-center justify-center gap-1 cursor-pointer transition"
              >
                <ArrowUpCircle className="w-3.5 h-3.5 text-indigo-600 animate-bounce" /> Имитировать получение +100 XP
              </button>
            </div>

            {/* School Leaderboard */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
              <div className="flex items-center gap-1.5 mb-3 pb-2 border-b border-slate-100">
                <Swords className="w-4 h-4 text-indigo-500 animate-pulse" />
                <h4 className="font-extrabold text-xs text-slate-805 uppercase tracking-wider">Таблица рекордов класса ⚔️</h4>
              </div>

              <div className="space-y-2.5">
                {[...students].sort((a,b) => b.xp - a.xp).map((item, index) => {
                  const isMe = item.id === activeStudent.id;
                  return (
                    <div 
                      key={item.id} 
                      className={`flex items-center justify-between p-2 rounded-xl border transition ${
                        isMe ? 'bg-indigo-50/50 border-indigo-300/60 font-black' : 'bg-white border-slate-150'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-mono text-slate-400 text-[10px] w-4 text-center font-bold">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                        </span>
                        <img src={item.avatar} alt="Avatar" className="w-7 h-7 rounded-lg border border-slate-200" />
                        <span className="text-[11px] text-slate-800 truncate block font-bold">
                          {item.name.split(' ')[0]} {isMe && '⭐'}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500 font-bold">{item.xp} XP</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </>
      )}

      {/* INTERACTIVE PROGRESS JOURNEY ADVENTURE MAP */}
      {activeTab === 'journey' && (
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div className="space-y-1">
            <span className="bg-teal-50 text-teal-700 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-teal-100">
              Интерактивная Карта Образовательных Путешествий 🗺️
            </span>
            <h4 className="font-extrabold text-sm text-slate-800">Сопровождение {mentor.name} на учебных точках:</h4>
            <p className="text-[11px] text-slate-400 leading-normal max-w-2xl">
              Ваш наставник автоматически перемещается по узлам прогресса по мере роста вашего реального уровня. Открывайте сундуки с наградами и слушайте напутствия!
            </p>
          </div>

          {/* Visual Canvas timeline route map */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 relative overflow-x-auto min-h-60 flex items-center justify-center">
            
            {/* Horizontal line curve path background */}
            <div className="absolute top-1/2 left-20 right-20 h-1 bg-gradient-to-r from-teal-400 via-indigo-400 to-pink-500 -translate-y-1/2 rounded-full opacity-40"></div>

            <div className="flex justify-between min-w-[700px] w-full px-5 relative z-10">
              {journeyNodes.map((node) => {
                const isCompleted = currentLevelNode >= node.id;
                const isActive = currentLevelNode === node.id;
                
                return (
                  <div key={node.id} className="flex flex-col items-center text-center space-y-3.5 relative w-[120px]">
                    
                    {/* Node Circle Point */}
                    <div className="relative">
                      
                      {/* Mentor portrait sitting on active node */}
                      {isActive && (
                        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full p-0.5 bg-yellow-400 border border-yellow-300 shadow-lg animate-bounce z-20">
                          <img 
                            src={mentor.avatar} 
                            alt="Active Mentor character" 
                            className="w-full h-full object-cover rounded-full bg-slate-900" 
                          />
                          <span className="absolute -bottom-1 -right-1 bg-slate-950 text-white rounded-full p-0.5 leading-none text-[8px] border border-zinc-700 animate-pulse">💡</span>
                        </div>
                      )}

                      <button
                        onClick={() => {
                          alert(`Наставник ${mentor.name} передает на этапе «${node.name}»: \n\n"${node.dialog}"`);
                        }}
                        className={`w-12 h-12 rounded-full flex flex-col items-center justify-center font-bold font-mono text-xs transition border shadow cursor-pointer select-none relative ${
                          isActive
                            ? 'bg-yellow-400 border-yellow-500 text-slate-950 scale-110 ring-4 ring-yellow-400/25 animate-pulse'
                            : isCompleted
                            ? 'bg-teal-500 border-teal-600 text-white'
                            : 'bg-white border-slate-300 text-slate-400'
                        }`}
                      >
                        {isCompleted ? '✓' : node.id}
                      </button>

                      {/* Chest Rewards trigger */}
                      <button
                        onClick={() => {
                          if (isCompleted) {
                            alert(`Вы открыли золотой ларец Прогресса на этапе ${node.id}! Получено +50 XP и редкий коллекционный кристалл связи!`);
                            handleTriggerCheatXp();
                          } else {
                            alert(`Сундук временно заблокирован. Вам необходим образовательный уровень ${node.requiredLvl}!`);
                          }
                        }}
                        className={`absolute -bottom-2 -right-2 text-sm p-1 rounded-md transition shadow border cursor-pointer ${
                          isCompleted
                            ? 'bg-amber-100 border-amber-300 animate-pulse hover:scale-110'
                            : 'bg-slate-200 border-slate-300 grayscale'
                        }`}
                      >
                        🎁
                      </button>
                    </div>

                    {/* Node info block */}
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-black text-slate-800 leading-tight block">{node.name}</span>
                      <span className="text-[8.5px] text-slate-400 block">{node.desc}</span>
                      <span className="text-[7.5px] font-black text-indigo-600 block leading-tight">Требуемый Lvl: {node.requiredLvl}</span>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>

          {/* Prompt speech from current stage */}
          <div className="bg-indigo-50 border border-indigo-150 p-4 rounded-2xl flex gap-3.5 items-start">
            <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-300 shrink-0 bg-slate-900">
              <img src={mentor.avatar} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-[9.5px] uppercase font-mono font-black text-indigo-700 block">Разъяснение целей модуля от {mentor.name}:</span>
              <p className="text-xs text-slate-700 font-medium italic leading-relaxed mt-1">
                « Прекрасно, мой соратник! Сейчас наш караван путей остановился на Юните {currentLevelNode}. Твоя цель на этой территории — глубинная сдача текущей домашки и наведение порядка в личных квестах. Я застрахую твой стрик на этом холме. Двигаемся вперед к следующим вехам! »
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MENTOR QUESTS & EXCLUSIVE RELICS TABS */}
      {activeTab === 'quests' && (
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="bg-rose-50 text-rose-700 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-rose-100">
                Задания & Испытания Проводников
              </span>
              <h4 className="font-extrabold text-sm text-slate-805 mt-1">Миссии наставничества для {activeStudent.name}:</h4>
              <p className="text-[11px] text-slate-405 mt-0.5">Выполняйте тематические задания для повышения доверия и открытия редкой атрибутики наставника.</p>
            </div>

            <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
              <span className="text-[9.5px] font-mono leading-relaxed text-indigo-700 font-bold px-2 py-1 select-none">Текущая связь с {mentor.name}: {activeTrust} очков</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* List of custom mentor quests (Left columns) */}
            <div className="lg:col-span-2 space-y-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide block">Доступные личные квесты:</span>
              
              {activeMentorQuests.map((quest) => {
                const isClaimed = activeStudent?.completedMentorQuests?.includes(quest.id);
                return (
                  <div key={quest.id} className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                    isClaimed 
                      ? 'border-emerald-100 bg-emerald-50/10 opacity-70' 
                      : 'border-slate-150 bg-white hover:shadow-xs hover:border-slate-300'
                  }`}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold bg-amber-50 rounded text-amber-700 border border-amber-200 px-1.5 py-0.2 leading-none">{quest.difficulty}</span>
                        <h5 className={`font-extrabold text-xs text-slate-800 ${isClaimed ? 'line-through text-slate-400' : ''}`}>{quest.title}</h5>
                      </div>
                      <p className="text-[10.5px] text-slate-505 leading-normal">{quest.desc}</p>
                      
                      <div className="flex gap-4 text-[9px] font-bold font-mono">
                        <span className="text-emerald-600">Опыт: +{quest.xp} XP</span>
                        <span className="text-pink-600">Связь: +{quest.trust} очков</span>
                      </div>
                    </div>

                    {!isClaimed ? (
                      <button
                        onClick={() => handleClaimMentorQuest(quest.id, quest.xp, quest.trust)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] py-1.8 px-3.5 rounded-xl cursor-pointer active:scale-95 transition"
                      >
                        Сдать Миссию
                      </button>
                    ) : (
                      <span className="text-[9px] text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded font-black uppercase">Выполнено ✓</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Rare relics of this mentor */}
            <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-5 space-y-3.5">
              <div className="flex items-center gap-1">
                <Gift className="w-4 h-4 text-pink-400" />
                <h5 className="font-extrabold text-xs text-white uppercase tracking-wider">Сувенирная Атрибутика Мудрости:</h5>
              </div>
              <p className="text-[10.5px] text-zinc-405 leading-normal">
                Раскройте сокровища своего проводника. Покупка предметов открывает пожизненные баффы в вашем профиле ученика!
              </p>

              <div className="space-y-3.5">
                {mentorCollectibles.filter(col => col.mId === mentor.id).map(item => {
                  const isBought = activeStudent?.unlockedItems?.includes(item.id);
                  return (
                    <div key={item.id} className="p-3 bg-black/30 border border-slate-800 rounded-xl flex items-center justify-between gap-3 min-h-16">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <span className="block font-bold text-[10.5px] text-zinc-100">{item.name}</span>
                          <span className="text-[9px] text-zinc-400 block max-w-[120px] lg:max-w-none">{item.desc}</span>
                        </div>
                      </div>

                      {!isBought ? (
                        <button
                          onClick={() => handleBuyRelic(item.id, item.cost)}
                          className="bg-pink-600 hover:bg-pink-700 text-white text-[9.5px] font-black py-1.5 px-2.5 rounded-lg transition shrink-0 cursor-pointer select-none"
                        >
                          💸 {item.cost} CP
                        </button>
                      ) : (
                        <span className="text-[8.5px] text-emerald-400 bg-emerald-950/40 border border-emerald-900 font-extrabold px-1.5 py-0.5 rounded shrink-0 uppercase tracking-widest text-center">Куплено</span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="text-[8.5px] text-zinc-500 font-mono text-center">
                *CP (Connection Points) — ваши накопленные баллы взаимопонимания с текущим наставником Совета.
              </div>
            </div>

          </div>

        </div>
      )}

      {/* AI CREATIVE LAB: SUCCESS STOREIS, COMICS & AI CERTIFICATE CHANNELS */}
      {activeTab === 'creative' && (
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div className="space-y-1">
            <span className="bg-teal-50 text-teal-750 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-teal-100">
              Генеративная AI Лаборатория Достижений
            </span>
            <h4 className="font-extrabold text-sm text-slate-805">ИИ-Автоматизация историй успеха, комиксов и дипломов:</h4>
            <p className="text-[11px] text-slate-405">Синергия ваших реальных достижений и метафоры персонажей-проводников Совета EduProgress.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* SUCCESS STORY ENGINE */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col justify-between space-y-4">
              <div className="space-y-1.5 text-left">
                <span className="bg-amber-100 text-amber-800 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded">Storyteller GPU v2.1</span>
                <h5 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">AI-Генерация Историй Успеха</h5>
                <p className="text-[10.5px] text-slate-505 leading-normal">
                  Соберите ваши результаты (GPA {activeStudent.generalScore}, посещаемость {activeStudent.attendanceRate}%) в вдохновляющий рассказ от имени вашего проводника!
                </p>
              </div>

              {/* Generated Story Box */}
              {successStory && (
                <div className="p-3 bg-white border border-dashed border-slate-250 rounded-xl space-y-2 animate-fade-in text-left">
                  <span className="block font-black text-xs text-indigo-700 font-display">{successStory.title}</span>
                  <p className="text-[10px] text-slate-600 leading-relaxed font-sans whitespace-pre-line bg-slate-50 p-2.5 rounded-lg">
                    {successStory.story}
                  </p>
                  <div className="flex justify-between items-center text-[8.5px] text-slate-400 font-mono">
                    <span>Дата: {successStory.date}</span>
                    <span>Регламент Совета 🦅</span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <button
                  onClick={handleGenerateSuccessStory}
                  disabled={generationLoading}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-2.5 rounded-xl cursor-pointer transition select-none flex items-center justify-center gap-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${generationLoading ? 'animate-spin' : ''}`} />
                  {generationLoading ? 'Ткань повествования генерируется...' : `Напечатать историю от ${mentor.name}`}
                </button>

                {successStory && (
                  <button 
                    onClick={() => {
                      alert('История успеха подготовлена для выгрузки! Ссылка для родителей отправлена в Telegram.');
                    }}
                    className="w-full bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 font-extrabold text-[10px] py-1.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Share2 className="w-3 h-3 text-slate-450" />
                    Поделиться историей с родителями
                  </button>
                )}
              </div>
            </div>

            {/* AI STORY COMIC VIEWER */}
            <div className="bg-slate-950 text-white rounded-2xl p-5 border border-slate-800 flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <span className="bg-cyan-900/40 text-cyan-400 border border-cyan-800/30 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded">Comics Engine Alpha</span>
                <h5 className="font-extrabold text-xs text-white uppercase tracking-wider">AI-Комикс Успеха</h5>
                <p className="text-[10.5px] text-zinc-405 leading-normal">
                  Художественная раскадровка, где ученик {activeStudent.name.split(' ')[0]} и его спутник {mentor.name} преодолевают преграды скуки.
                </p>
              </div>

              {/* Slider panels */}
              <div className="bg-black/40 border border-slate-800 p-3.5 rounded-xl text-center space-y-2.5 min-h-[140px] flex flex-col justify-between">
                <div className="font-mono text-[8px] text-cyan-400 font-bold uppercase tracking-widest">Сцена {activeComicFrame + 1} из 3</div>
                
                <p className="text-xs italic text-zinc-250 font-sans tracking-tight leading-relaxed px-1">
                  {activeComicFrame === 0 && `«На пороге сдачи ИИ-челленджа по теме циклов школьник ${activeStudent.name.split(' ')[0]} заскучал и выронил клавиатуру... Силы прокрастинации сгущаются над его экраном!»`}
                  {activeComicFrame === 1 && `«Но вещая вспышка озаряет комнату! Наставник ${mentor.name} простирает свое сияющее руководство: "Поверь во внутреннюю искру!"»`}
                  {activeComicFrame === 2 && `«Уровни доверия взлетели! С GPA ${activeStudent.generalScore} ученик делает идеальный коммит кода, рассеивая тьму ошибок и получая +${activeStudent.xp} XP!»`}
                </p>

                <div className="flex justify-center gap-1 pb-1">
                  {[0, 1, 2].map((i) => (
                    <button
                      key={i}
                      onClick={() => setActiveComicFrame(i)}
                      className={`w-5 h-1.5 rounded-full transition cursor-pointer ${
                        activeComicFrame === i ? 'bg-indigo-505 bg-indigo-500' : 'bg-zinc-800'
                      }`}
                    ></button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded shrink-0 overflow-hidden bg-slate-950">
                  <img src={mentor.avatar} alt="Sealed Icon" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <span className="text-[8px] font-bold uppercase text-indigo-400 block">Диалог в комиксе:</span>
                  <span className="text-[10px] text-zinc-300 italic truncate block">
                    {activeComicFrame === 0 && `«Я не могу отладить этот синтаксический баг... Сил больше нет!»`}
                    {activeComicFrame === 1 && `«Код — лишь язык созидания, друг мой! Направь лазер ума на if-else!»`}
                    {activeComicFrame === 2 && `«Великая победа! Качество образования зафиксировано моделью!»`}
                  </span>
                </div>
              </div>
            </div>

            {/* AI CERTIFICATE DIPLOMA GENERATOR */}
            <div className="bg-slate-50 border border-slate-205 rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-1.5 text-left">
                <span className="bg-teal-100 text-teal-800 border border-teal-200 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded">PDF Stamp Engine</span>
                <h5 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">ИИ-Сертификаты и Бренд</h5>
                <p className="text-[10.5px] text-slate-505 leading-normal">
                  Выпустите официальный диплом прохождения курса, с автографом {mentor.name} и перечнем задействованных вами навыков!
                </p>
              </div>

              <form onSubmit={handleGenerateCertificate} className="space-y-2 text-xs">
                <div className="space-y-1">
                  <label className="text-[8px] uppercase font-black text-slate-500 block">ФИО на бланке:</label>
                  <input
                    type="text"
                    value={certName}
                    onChange={(e) => {
                      setCertGenerated(false);
                      setCertName(e.target.value);
                    }}
                    required
                    className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs outline-none"
                    placeholder="Александр Смирнов"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white font-extrabold text-xs py-2.5 rounded-xl cursor-pointer transition select-none"
                >
                  Сгенерировать официальный сертификат
                </button>
              </form>

              {certGenerated && (
                <div className="p-3 bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-800 rounded-2xl text-white shadow-xl space-y-3.5 relative">
                  
                  {/* Visual Layout representation */}
                  <div className="text-center space-y-1">
                    <span className="font-mono text-[7px] tracking-widest text-zinc-500 block uppercase">EDUPROGRESS INTERNATIONAL</span>
                    <h6 className="font-bold text-[9px] text-zinc-400">СЕРТИФИКАТ ОТЛИЧИЯ СОВЕТА</h6>
                    <span className="text-sm font-black text-yellow-300 block">{certName}</span>
                    <p className="text-[8.5px] text-zinc-300">С успехом завершил модуль под покровительством {mentor.name}</p>
                  </div>

                  <div className="flex justify-between items-end border-t border-slate-800/80 pt-2 text-[8px] font-mono text-zinc-500">
                    <div>
                      <span>Код: {certCode}</span>
                      <span className="block">Лицензия: № AI-50098</span>
                    </div>

                    <div className="flex items-center gap-1 text-right text-zinc-300 font-sans leading-tight">
                      <div className="w-5 h-5 rounded-full overflow-hidden border border-slate-700">
                        <img src={mentor.avatar} alt="Seal avatar" className="w-full h-full object-cover" />
                      </div>
                      <div className="text-left font-sans text-[7.5px]">
                        <span className="block font-black text-white">Печать Совета</span>
                        <span className="block text-[6.5px] text-zinc-400">{mentor.name} (Sign)</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      window.print();
                    }}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-[9px] py-1.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Распечатать физическую копию диплома
                  </button>

                </div>
              )}

            </div>

          </div>

        </div>
      )}

      {/* SEASONAL EVENTS AND REWARDS: SUMMER PEAK MARATHON */}
      {activeTab === 'seasonal' && (
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div className="bg-gradient-to-r from-orange-500 via-pink-600 to-indigo-700 rounded-3xl p-6 text-white text-left relative overflow-hidden shadow">
            <div className="absolute top-0 right-0 w-60 h-60 bg-yellow-400/20 rounded-full blur-2xl pointer-events-none"></div>

            <div className="space-y-2 max-w-xl">
              <span className="bg-yellow-400 text-slate-950 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border border-yellow-300 tracking-wider">
                Событие Сезона: Активно в июне 2026
              </span>
              <h4 className="font-extrabold text-lg sm:text-xl text-white font-display">Летний STEM-Пик Совета Наставников ⛰️</h4>
              <p className="text-xs text-orange-50 leading-relaxed font-medium">
                Во время праздников и летних лагерей все пять персонажей выдают специальные временные челленджи! Ученики зарабатывают редкие коллекционные сокровища этого сезона.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Особые сезонные миссии персонажей:</span>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { mLogo: '🐦 Самрук', title: 'Книга книжного червя', reward: 'Редкий артефакт "Том Лорда Знаний"', xp: '+250 XP', desc: 'Прочитать 3 факультативные публикации в библиотеке лагеря.' },
                { mLogo: '🛡️ Алпамыс', title: 'Ранний подъем богатыря', reward: 'Редкий артефакт "Огненный щит дедлайна"', xp: '+300 XP', desc: 'Закрыть все 5 уроков олимпиадной сетки без единой задержки сдачи.' },
                { mLogo: '👑 Томирис', title: 'Арена юных чемпионов', reward: 'Титул в профиль "Маршал Сезона"', xp: '+350 XP', desc: 'Занять первое место во всеобщей олимпиаде по направлению.' },
                { mLogo: '💻 Барс', title: 'Архитектурный джем кода', reward: 'Редкий артефакт "Ядро Ускорения Барса"', xp: '+300 XP', desc: 'Написать программную логику бота-помощника в Telegram.' }
              ].map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10.5px] font-black text-indigo-700">{item.mLogo}</span>
                      <span className="bg-orange-100 text-orange-700 text-[9px] font-black px-1.5 py-0.4 rounded">{item.xp}</span>
                    </div>

                    <span className="font-extrabold text-xs text-slate-800 block leading-tight mt-1">{item.title}</span>
                    <p className="text-[10.5px] text-slate-505 mt-1 leading-normal">{item.desc}</p>
                    <span className="text-[9px] text-orange-600 block font-bold font-mono mt-2">✨ Награда: {item.reward}</span>
                  </div>

                  <button
                    onClick={() => {
                      alert(`Вы отправили заявку на проверку сезонного задания "${item.title}"! Наставники одобрят отчет в течение 2 часов.`);
                    }}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[9px] py-2 rounded-xl mt-3.5 transition cursor-pointer select-none"
                  >
                    Подать заявку на Летний Пик ⛰️
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
