import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initial Simulated Database State
let groups = [
  { id: 'g1', name: 'Английский язык - Starter B1', subject: 'Английский', teacherName: 'Анна Смирнова', schedule: 'Пн, Ср 16:00', studentsCount: 4, engagementRate: 88, questsCompleted: 2 },
  { id: 'g2', name: 'Python Kids - Робототехника', subject: 'Программирование', teacherName: 'Дмитрий Иванов', schedule: 'Вт, Чт 17:30', studentsCount: 3, engagementRate: 92, questsCompleted: 3 }
];

let students = [
  { id: 's1', name: 'Александр Смирнов', groupName: 'Английский язык - Starter B1', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=120', level: 4, xp: 1250, parentName: 'Ольга Смирнова', parentPhone: '+7 (911) 234-56-78', telegramId: '@olga_smirnova_edu', attendanceRate: 95, generalScore: 4.8, riskRating: 'low', mentorId: 'm1', academicRole: 'Лидер команды', engagementRate: 94 },
  { id: 's2', name: 'Виктория Кузнецова', groupName: 'Английский язык - Starter B1', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120', level: 3, xp: 820, parentName: 'Андрей Кузнецов', parentPhone: '+7 (921) 987-65-43', telegramId: '@kuznetsov_family', attendanceRate: 90, generalScore: 4.2, riskRating: 'low', mentorId: 'm2', academicRole: 'Коммуникатор', engagementRate: 86 },
  { id: 's3', name: 'Артем Петров', groupName: 'Английский язык - Starter B1', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120', level: 2, xp: 450, parentName: 'Мария Петрова', parentPhone: '+7 (905) 555-44-33', telegramId: '@artem_mom_petrova', attendanceRate: 75, generalScore: 3.5, riskRating: 'high', mentorId: 'm3', academicRole: 'Исследователь', engagementRate: 58 },
  { id: 's4', name: 'Дарья Васильева', groupName: 'Английский язык - Starter B1', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=120', level: 3, xp: 950, parentName: 'Елена Васильева', parentPhone: '+7 (912) 345-67-89', telegramId: '@vasilyeva_elena', attendanceRate: 85, generalScore: 3.9, riskRating: 'medium', mentorId: 'm2', academicRole: 'Эксперт', engagementRate: 72 },
  { id: 's5', name: 'Михаил Сидоров', groupName: 'Python Kids - Робототехника', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120', level: 5, xp: 2350, parentName: 'Сергей Сидоров', parentPhone: '+7 (915) 123-45-67', telegramId: '@sidorov_programming', attendanceRate: 100, generalScore: 4.9, riskRating: 'low', mentorId: 'm4', academicRole: 'Наставник', engagementRate: 98 },
  { id: 's6', name: 'София Федорова', groupName: 'Python Kids - Робототехника', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120', level: 3, xp: 910, parentName: 'Ирина Федорова', parentPhone: '+7 (916) 111-22-33', telegramId: '@fedorova_sofi', attendanceRate: 92, generalScore: 4.1, riskRating: 'low', mentorId: 'm2', academicRole: 'Исследователь', engagementRate: 84 },
  { id: 's7', name: 'Егор Морозов', groupName: 'Python Kids - Робототехника', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120', level: 2, xp: 520, parentName: 'Владимир Морозов', parentPhone: '+7 (917) 444-55-66', telegramId: '@morozov_vladimir', attendanceRate: 72, generalScore: 3.4, riskRating: 'high', mentorId: 'm3', academicRole: 'Коммуникатор', engagementRate: 48 }
];

let groupQuests = [
  { id: 'qg1', groupId: 'g1', title: '💯 Посещаемость без пропусков', description: 'Вся группа посещает 4 урока подряд без прогулов', targetCount: 4, currentCount: 3, rewardXp: 250, status: 'active' },
  { id: 'qg2', groupId: 'g1', title: '📚 Штурм домашних заданий', description: 'Все ученики сдают домашнее задание на неделе', targetCount: 4, currentCount: 4, rewardXp: 150, status: 'completed' },
  { id: 'qg3', groupId: 'g2', title: '💻 Код-Прорыв: Сдача проекта', description: 'Все участники группы завершают мини-проект на PyGame', targetCount: 3, currentCount: 1, rewardXp: 300, status: 'active' }
];

let personalChallenges = [
  { id: 'ch1', studentId: 's1', title: 'Орфографический дозор', description: 'Выучи правила правописания окончаний -ing в Present Continuous', targetCount: 1, currentCount: 0, rewardXp: 120, status: 'active', skill: 'Орфография' },
  { id: 'ch2', studentId: 's2', title: 'Супер-Спикер', description: 'Участвуй в 3 диалоговых сессиях с учителем', targetCount: 3, currentCount: 1, rewardXp: 150, status: 'active', skill: 'Устная речь' },
  { id: 'ch3', studentId: 's3', title: 'Дзен Восхождение', description: 'Закрой тему Present Simple с наставником-пандой Пингом', targetCount: 1, currentCount: 0, rewardXp: 200, status: 'active', skill: 'Грамматика' },
  { id: 'ch4', studentId: 's4', title: 'Победа над страхом', description: 'Отправь аудио-сообщение учителю на проверку произношения', targetCount: 1, currentCount: 0, rewardXp: 180, status: 'active', skill: 'Устная речь' },
  { id: 'ch5', studentId: 's5', title: 'Мастер Чистого Кода', description: 'Добавь комментарии и docstrings во все функции проекта', targetCount: 1, currentCount: 1, rewardXp: 100, status: 'completed', skill: 'Кодинг' },
  { id: 'ch6', studentId: 's6', title: 'Циклический марафон', description: 'Напиши 5 рабочих циклов for без ошибок замедления кода', targetCount: 5, currentCount: 3, rewardXp: 130, status: 'active', skill: 'Разработка' },
  { id: 'ch7', studentId: 's7', title: 'Регулярная перезагрузка', description: 'Посети 2 занятия по робототехнике без опозданий', targetCount: 2, currentCount: 0, rewardXp: 250, status: 'active', skill: 'Дисциплина' }
];

let peerHelpRecords = [
  { id: 'ph1', helperStudentId: 's5', recipientStudentId: 's7', action: 'Помог отладить бесконечный цикл в Python на списках', rewardXp: 50, date: '2026-05-25' },
  { id: 'ph2', helperStudentId: 's1', recipientStudentId: 's2', action: 'Помог разобраться с образованием Present Continuous', rewardXp: 30, date: '2026-05-28' }
];

let studentsProgress = [
  {
    id: 'p1',
    studentId: 's1',
    strengths: ['Отличное восприятие на слух', 'Быстрое усвоение новых слов', 'Отличное произношение'],
    weakTopics: ['Использование Present Continuous', 'Путает глаголы make и do'],
    recommendations: ['Повторить правила употребления времени Present Continuous', 'Выполнить упражнение 4 на стр. 18', 'Прослушать аудиозапись темы Unit 5 три раза'],
    achievements: [
      { id: 'a1', title: 'Усердный Студент', description: 'Посетил 10 уроков подряд', icon: 'Award', unlockedAt: '2026-05-10' },
      { id: 'a2', title: 'Мастер произношения', description: 'Продемонстрировал идеальный акцент', icon: 'Sparkles', unlockedAt: '2026-05-25' }
    ],
    attendanceHistory: [
      { date: '2026-05-20', status: 'present', topic: 'Введение в Starter B1' },
      { date: '2026-05-24', status: 'present', topic: 'Лексика: Еда и Напитки' },
      { date: '2026-05-28', status: 'present', topic: 'Грамматика: Настоящее Простое' },
      { date: '2026-06-01', status: 'present', topic: 'Present Continuous против Present Simple' }
    ],
    gradesHistory: [
      { date: '2026-05-20', topic: 'Введение в Starter B1', grade: 5 },
      { date: '2026-05-24', topic: 'Лексика: Еда и Напитки', grade: 4 },
      { date: '2026-05-28', topic: 'Грамматика: Настоящее Простое', grade: 5 },
      { date: '2026-06-01', topic: 'Present Continuous против Present Simple', grade: 5 }
    ]
  },
  {
    id: 'p2',
    studentId: 's2',
    strengths: ['Хороший словарный запас', 'Активное участие в диалогах'],
    weakTopics: ['Артикли a/an/the', 'Письменная орфография'],
    recommendations: ['Пройти онлайн-тест на артикли в личном кабинете', 'Написать мини-эссе "Мое хобби" (50 слов)'],
    achievements: [
      { id: 'a3', title: 'Общительный Студент', description: 'Инициировал 3 ролевых диалога на уроке', icon: 'MessageCircle', unlockedAt: '2026-05-28' }
    ],
    attendanceHistory: [
      { date: '2026-05-20', status: 'present', topic: 'Введение в Starter B1' },
      { date: '2026-05-24', status: 'present', topic: 'Лексика: Еда и Напитки' },
      { date: '2026-05-28', status: 'present', topic: 'Грамматика: Настоящее Простое' },
      { date: '2026-06-01', status: 'present', topic: 'Present Continuous против Present Simple' }
    ],
    gradesHistory: [
      { date: '2026-05-20', topic: 'Введение в Starter B1', grade: 4 },
      { date: '2026-05-24', topic: 'Лексика: Еда и Напитки', grade: 4 },
      { date: '2026-05-28', topic: 'Грамматика: Настоящее Простое', grade: 5 },
      { date: '2026-06-01', topic: 'Present Continuous против Present Simple', grade: 4 }
    ]
  },
  {
    id: 'p3',
    studentId: 's3',
    strengths: ['Творческое мышление', 'Пытается отвечать на сложные вопросы'],
    weakTopics: ['Низкая концентрация', 'Грамматическая база'],
    recommendations: ['Повторить времена Simple', 'Позаниматься с наставником-пандой Ping ежедневно по 5 минут', 'Родителям рекомендуется проконтролировать выполнение ДЗ'],
    achievements: [
      { id: 'a4', title: 'Храброе сердце', description: 'Не побоялся ответить у доски при трудной теме', icon: 'Shield', unlockedAt: '2026-05-24' }
    ],
    attendanceHistory: [
      { date: '2026-05-20', status: 'absent', topic: 'Введение в Starter B1' },
      { date: '2026-05-24', status: 'present', topic: 'Лексика: Еда и Напитки' },
      { date: '2026-05-28', status: 'late', topic: 'Грамматика: Настоящее Простое' },
      { date: '2026-06-01', status: 'absent', topic: 'Present Continuous против Present Simple' }
    ],
    gradesHistory: [
      { date: '2026-05-24', topic: 'Лексика: Еда и Напитки', grade: 3 },
      { date: '2026-05-28', topic: 'Грамматика: Настоящее Простое', grade: 4 }
    ]
  },
  {
    id: 'p4',
    studentId: 's4',
    strengths: ['Усердность в письме', 'Хорошо строит предложения'],
    weakTopics: ['Смущается говорить вслух', 'Сложности с аудированием'],
    recommendations: ['Дома прочитать текст вслух перед зеркалом 3 раза', 'Прослушать короткие диалоги на английском'],
    achievements: [
      { id: 'a5', title: 'Письменный мастер', description: 'Идеально выполненная рабочая тетрадь', icon: 'BookOpen', unlockedAt: '2026-05-28' }
    ],
    attendanceHistory: [
      { date: '2026-05-20', status: 'present', topic: 'Введение в Starter B1' },
      { date: '2026-05-24', status: 'present', topic: 'Лексика: Еда и Напитки' },
      { date: '2026-05-28', status: 'present', topic: 'Грамматика: Настоящее Простое' },
      { date: '2026-06-01', status: 'present', topic: 'Present Continuous против Present Simple' }
    ],
    gradesHistory: [
      { date: '2026-05-20', topic: 'Введение в Starter B1', grade: 4 },
      { date: '2026-05-24', topic: 'Лексика: Еда и Напитки', grade: 3 },
      { date: '2026-05-28', topic: 'Грамматика: Настоящее Простое', grade: 4 },
      { date: '2026-06-01', topic: 'Present Continuous против Present Simple', grade: 4 }
    ]
  },
  {
    id: 'p5',
    studentId: 's5',
    strengths: ['Логическое мышление', 'Отлично пишет сложные алгоритмы', 'Высокий интерес к предмету'],
    weakTopics: ['Документирование кода', 'Редко проверяет ошибки перед запуском'],
    recommendations: ['Добавить комментарии во все функции в ДЗ', 'Попробовать написать тест для своей игры'],
    achievements: [
      { id: 'a6', title: 'Мега Мозг', description: 'Решил задачу повышенной сложности на списки', icon: 'Brain', unlockedAt: '2026-05-25' },
      { id: 'a7', title: 'Код-Архитектор', description: 'Создал модульную игру на Python', icon: 'Terminal', unlockedAt: '2026-05-29' }
    ],
    attendanceHistory: [
      { date: '2026-05-21', status: 'present', topic: 'Синтаксис Python и переменные' },
      { date: '2026-05-25', status: 'present', topic: 'Условные конструкции if-else' },
      { date: '2026-05-29', status: 'present', topic: 'Списки и операции над ними' }
    ],
    gradesHistory: [
      { date: '2026-05-21', topic: 'Синтаксис Python и переменные', grade: 5 },
      { date: '2026-05-25', topic: 'Условные конструкции if-else', grade: 5 },
      { date: '2026-05-29', topic: 'Списки и операции над ними', grade: 5 }
    ]
  },
  {
    id: 'p6',
    studentId: 's6',
    strengths: ['Креативные идеи для игр', 'Хорошо работает в паре'],
    weakTopics: ['Синтаксические опечатки', 'Случайный запуск бесконечных циклов'],
    recommendations: ['Перед запуском кода проверять соблюдение отступов IndentationError', 'Пройти модуль 2 на платформе еще раз'],
    achievements: [
      { id: 'a8', title: 'Дизайнер миров', description: 'Создал красивую графику для игры на Pygame', icon: 'Palette', unlockedAt: '2026-05-29' }
    ],
    attendanceHistory: [
      { date: '2026-05-21', status: 'present', topic: 'Синтаксис Python и переменные' },
      { date: '2026-05-25', status: 'present', topic: 'Условные конструкции if-else' },
      { date: '2026-05-29', status: 'present', topic: 'Списки и операции над ними' }
    ],
    gradesHistory: [
      { date: '2026-05-21', topic: 'Синтаксис Python и переменные', grade: 4 },
      { date: '2026-05-25', topic: 'Условные конструкции if-else', grade: 4 },
      { date: '2026-05-29', topic: 'Списки и операции над ними', grade: 4.5 }
    ]
  },
  {
    id: 'p7',
    studentId: 's7',
    strengths: ['Иногда выдает супер нестандартные решения', 'Хорошо рисует блок-схемы'],
    weakTopics: ['Часто отвлекается', 'Много пропусков'],
    recommendations: ['Обязательно догнать упущенное по спискам', 'Поработать над внимательностью, убрать телефон во время программирования'],
    achievements: [],
    attendanceHistory: [
      { date: '2026-05-21', status: 'absent', topic: 'Синтаксис Python и переменные' },
      { date: '2026-05-25', status: 'present', topic: 'Условные конструкции if-else' },
      { date: '2026-05-29', status: 'absent', topic: 'Списки и операции над ними' }
    ],
    gradesHistory: [
      { date: '2026-05-25', topic: 'Условные конструкции if-else', grade: 3.5 }
    ]
  }
];

let mentorCharacters = [
  { 
    id: 'm1', 
    name: 'Самрук (Хранитель Знаний)', 
    role: 'Любознательность, Академическое развитие, Исследования', 
    avatar: '/src/assets/images/samruk.png', 
    personality: 'Мудрый, спокойный, глубоко рассудительный и вдохновляющий. Направляет, а не контролирует.', 
    motivationalPhrase: 'Познание — это бесконечное путешествие. Открывая новые миры знаний, ты открываешь лучшую версию себя!' 
  },
  { 
    id: 'm2', 
    name: 'Алпамыс (Богатырь Духа)', 
    role: 'Сила воли, Упорство, Дисциплина, Преодоление трудностей', 
    avatar: '🦁', 
    personality: 'Сильный, волевой, дисциплинированный, справедливый наставник. Помогает доводить дела до финала.', 
    motivationalPhrase: 'Трудности — лишь ступени лестницы. Сделай ещё одно честное усилие, и ты покоришь эту вершину!' 
  },
  { 
    id: 'm3', 
    name: 'Томирис (Мудрая Царица)', 
    role: 'Лидерство, Критическое мышление, Стратегия, Риторика', 
    avatar: '🦅', 
    personality: 'Стратегичная, харизматичная, справедливая предводительница и командный стратег.', 
    motivationalPhrase: 'Сила команды — в каждом бойце, сила бойца — в крепкой сплоченной команде. Мысли стратегически!' 
  },
  { 
    id: 'm4', 
    name: 'Барс (Креативный Программист)', 
    role: 'Креативность, Код, Инновации, Дизайн-мышление', 
    avatar: '🐆', 
    personality: 'Смелый, гибкий, супер-технологичный новатор. Обожает нестандартный софт и робототехнику.', 
    motivationalPhrase: 'Код — это язык созидания. Твори без оглядки на шаблоны и создавай цифровые технологии будущего!' 
  },
  { 
    id: 'm5', 
    name: 'Хумо (Птица Счастья & Soft Skills)', 
    role: 'Эмпатия, Гармония, Софт-скиллы, Психологический баланс', 
    avatar: '🕊️', 
    personality: 'Заботливая, гармоничная, сопереживающая спутница. Развивает эмоциональный интеллект.', 
    motivationalPhrase: 'Понимание себя и принятие других — ключ к истинной мудрости. Действуй с любовью к своему делу!' 
  }
];

let lessonReports = [
  {
    id: 'rep1',
    date: '2026-06-01',
    groupName: 'Английский язык - Starter B1',
    teacherName: 'Анна Смирнова',
    topic: 'Present Continuous против Present Simple',
    duration: '60 минут',
    rawText: 'Сегодня разобрали разницу между Present Simple и Present Continuous. Александр Смирнов занимался просто отлично, у него великолепное произношение, активно отвечал у доски, усвоил тему на 95%! Виктория Кузнецова тоже отлично работала в диалогах, но все еще делает опечатки в Present Continuous. Артем Петров сегодня отсутствовал без уважительной причины, надо напомнить родителям. Дарья Васильева была активна, но стесняется говорить вслух, хотя грамматический тест на Present Continuous написала на 4+.',
    isVoiceText: true,
    analyses: [
      {
        studentName: 'Александр Смирнов',
        studentId: 's1',
        lessonTopic: 'Present Continuous против Present Simple',
        attendance: 'present' as const,
        grade: 5,
        progressPercentage: 95,
        strengths: ['Превосходное произношение', 'Активные ответы в классе', 'Отличное понимание разницы времен'],
        weakTopics: ['Редкие опечатки в орфографии сложных глаголов'],
        recommendations: ['Почитать короткую статью с примерами на Present Continuous', 'Пройти мини-тест'],
        achievementsUnlocked: ['Грамматический Ниндзя']
      },
      {
        studentName: 'Виктория Кузнецова',
        studentId: 's2',
        lessonTopic: 'Present Continuous против Present Simple',
        attendance: 'present' as const,
        grade: 4,
        progressPercentage: 80,
        strengths: ['Высокая активность в диалоговых симуляциях', 'Хорошо строит устную речь'],
        weakTopics: ['Опечатки при добавлении окончания -ing (например writeing)'],
        recommendations: ['Выполнить упражнение на правописание окончаний -ing в рабочей тетради'],
        achievementsUnlocked: []
      },
      {
        studentName: 'Артем Петров',
        studentId: 's3',
        lessonTopic: 'Present Continuous против Present Simple',
        attendance: 'absent' as const,
        grade: 1,
        progressPercentage: 0,
        strengths: [],
        weakTopics: ['Пропуск важнейшей грамматической темы'],
        recommendations: ['Обязательно просмотреть видео-лекцию по теме', 'Выполнить компенсирующее домашнее задание до следующей среды'],
        achievementsUnlocked: []
      },
      {
        studentName: 'Дарья Васильева',
        studentId: 's4',
        lessonTopic: 'Present Continuous против Present Simple',
        attendance: 'present' as const,
        grade: 4,
        progressPercentage: 85,
        strengths: ['Великолепный результат письменного теста на 4+', 'Усидчивость'],
        weakTopics: ['Стеснительность в устной речи', 'Тихий голос при ответах'],
        recommendations: ['Записать короткое голосовое сообщение с прочтением текста и отправить учителю на проверку'],
        achievementsUnlocked: []
      }
    ]
  }
];

let notifications: any[] = [
  { id: 'n1', type: 'parent_alert', role: 'parent', studentName: 'Артем Петров', title: 'Пропуск занятия ⚠️', message: 'Здравствуйте! Артем Петров сегодня отсутствовал на уроке "Present Continuous против Present Simple". Пожалуйста, свяжитесь со школой или проконтролируйте изучение записанной лекции.', timestamp: '2026-06-01T17:15:00Z', sentViaTelegram: true, status: 'sent' },
  { id: 'n2', type: 'parent_alert', role: 'parent', studentName: 'Александр Смирнов', title: 'Большие успехи на уроке! 🎉', message: 'Поздравляем! Александр сегодня занимался просто отлично у доски. Получил 5 баллов и открыл достижение "Грамматический Ниндзя"! Рекомендации учителя отправлены в личный кабинет.', timestamp: '2026-06-01T17:15:00Z', sentViaTelegram: true, status: 'sent' },
  { id: 'n3', type: 'teacher_alert', role: 'teacher', title: 'Напоминание по уроку ⏰', message: 'Напоминание: Уважаемая Анна Смирнова, пожалуйста, пришлите голосовой отчет по прошедшему занятию группы "Python Kids", которое завершилось 15 минут назад.', timestamp: '2026-06-01T18:45:00Z', sentViaTelegram: true, status: 'sent' },
  { id: 'n4', type: 'teacher_alert', role: 'teacher', title: 'Студент в зоне риска ухода 🚨', message: 'Внимание: Студент Егор Морозов пропустил 2 занятия подряд по Python. Его посещаемость упала до 72%. Рекомендуем связаться с родителями.', timestamp: '2026-06-01T10:00:00Z', sentViaTelegram: false, status: 'sent' }
];

let telegramConfig = {
  botToken: "",
  testChatId: "",
  isEnabled: false,
  lastSaved: "",
  status: "disconnected", // "connected", "error", "disconnected"
  botUsername: "",
  botName: ""
};

async function sendTelegramAlert(notif: any) {
  if (!telegramConfig.botToken || telegramConfig.status !== 'connected') {
    return;
  }
  
  const isSimulated = telegramConfig.botToken.startsWith('mock_') || telegramConfig.botToken.toLowerCase().includes('test') || telegramConfig.botToken.toLowerCase().includes('dummy');
  
  // Find chatId
  let finalChatId = "";
  if (notif.studentName) {
    const s = students.find(x => x.name === notif.studentName);
    if (s && s.telegramId && !s.telegramId.startsWith('@')) {
      finalChatId = s.telegramId;
    }
  }

  // Fallback to general test Chat ID if no specific numeric chat ID is resolved
  if (!finalChatId) {
    finalChatId = telegramConfig.testChatId;
  }

  if (!finalChatId) {
    console.log(`[Telegram] No Chat ID available to route notification: "${notif.title}"`);
    return;
  }

  if (isSimulated) {
    console.log(`[Telegram Simulation] Connected bot @${telegramConfig.botUsername} sent text to ${finalChatId}: ${notif.title} - ${notif.message}`);
    return;
  }

  try {
    const text = `🔔 *[EduAI Уведомление: ${notif.role ? notif.role.toUpperCase() : 'СИСТЕМА'}]*\n\n*${notif.title}*\n${notif.message}`;
    await fetch(`https://api.telegram.org/bot${telegramConfig.botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: finalChatId,
        text: text,
        parse_mode: "Markdown"
      })
    });
  } catch (err) {
    console.error("Error dispatching real Telegram request:", err);
  }
}

let apiIntegrations = [
  { 
    id: 'i1', 
    platform: 'Moodle LMS', 
    status: 'active' as const, 
    apiKey: 'md_token_8849fae2bc4911', 
    lastUsed: '2026-06-01 12:40',
    syncStatus: 'synced',
    lastSyncedRecords: 142,
    webhookUrl: 'https://school-moodle.edu/webhooks/eduai',
    webhookEvents: ['student_graded', 'class_reported'],
    webhookLogs: [
      { timestamp: '2026-06-01 12:40:15', event: 'student_graded', payload: '{"student":"Александр Смирнов", "grade":5}', status: 'delivered' },
      { timestamp: '2026-06-01 11:20:44', event: 'class_reported', payload: '{"group":"Python Kids", "topic":"Введение в Циклы"}', status: 'delivered' }
    ]
  },
  { 
    id: 'i2', 
    platform: 'Google Classroom', 
    status: 'active' as const, 
    apiKey: 'gc_auth_9918dfacd812aa', 
    lastUsed: '2026-05-31 15:10',
    syncStatus: 'synced',
    lastSyncedRecords: 89,
    webhookUrl: 'https://classroom.google.com/webhook-receiver',
    webhookEvents: ['student_attendance_risk', 'homework_submitted'],
    webhookLogs: [
      { timestamp: '2026-05-31 15:10:02', event: 'student_attendance_risk', payload: '{"student":"Егор Морозов", "attendance":72}', status: 'delivered' }
    ]
  },
  { 
    id: 'i3', 
    platform: 'Microsoft Teams', 
    status: 'inactive' as const, 
    apiKey: 'ms_teams_019cfa12efb7a1', 
    lastUsed: '—',
    syncStatus: 'pending',
    lastSyncedRecords: 0,
    webhookUrl: '',
    webhookEvents: [],
    webhookLogs: []
  },
  { 
    id: 'i4', 
    platform: 'eMaktab.uz (Узбекистан)', 
    status: 'active' as const, 
    apiKey: 'em_auth_uzb_88fa12cd90ab12', 
    lastUsed: '2026-06-01 14:15',
    syncStatus: 'synced',
    lastSyncedRecords: 312,
    webhookUrl: 'https://api.emaktab.uz/v1/webhook-tracker',
    webhookEvents: ['student_graded', 'attendance_synced', 'quarter_summary'],
    webhookLogs: [
      { timestamp: '2026-06-01 14:15:30', event: 'attendance_synced', payload: '{"synced_students": 25, "date": "2026-06-01"}', status: 'delivered' },
      { timestamp: '2026-05-31 18:22:11', event: 'student_graded', payload: '{"studentId": "s2", "subject": "Английский язык", "score": 5}', status: 'delivered' }
    ]
  },
  { 
    id: 'i5', 
    platform: 'Open REST API Gateway', 
    status: 'active' as const, 
    apiKey: 'edu_api_key_77a28f88cd0a8174f8', 
    lastUsed: '2026-06-01 16:11',
    syncStatus: 'synced',
    lastSyncedRecords: 540,
    webhookUrl: 'https://my-custom-crm.uz/webhooks/sync',
    webhookEvents: ['student_graded', 'student_level_up', 'churn_ew_warning'],
    webhookLogs: [
      { timestamp: '2026-06-01 16:11:05', event: 'student_level_up', payload: '{"student":"Александр Смирнов", "level":12}', status: 'delivered' }
    ]
  }
];

// Helper to update student stats based on new analyses
function applyAnalysisToDatabase(groupId: string, analyzes: any[], topic: string, date: string) {
  analyzes.forEach((anal: any) => {
    // 1. Find the student
    const student = students.find(s => s.id === anal.studentId || s.name === anal.studentName);
    if (!student) return;

    // 2. Update Student properties (average grades, attendance, XP, level)
    const progress = studentsProgress.find(p => p.studentId === student.id);
    if (progress) {
      // Add record to attendance history
      progress.attendanceHistory.unshift({
        date: date,
        status: anal.attendance || 'present',
        topic: topic
      });

      // Add to grades if present
      if (anal.attendance !== 'absent' && anal.grade) {
        progress.gradesHistory.unshift({
          date: date,
          topic: topic,
          grade: anal.grade
        });
      }

      // Strengths & Weaknesses merge (let's keep them fresh or union them)
      if (anal.strengths && anal.strengths.length > 0) {
        progress.strengths = Array.from(new Set([...anal.strengths, ...progress.strengths])).slice(0, 5);
      }
      if (anal.weakTopics && anal.weakTopics.length > 0) {
        progress.weakTopics = Array.from(new Set([...anal.weakTopics, ...progress.weakTopics])).slice(0, 5);
      }
      if (anal.recommendations && anal.recommendations.length > 0) {
        progress.recommendations = anal.recommendations;
      }

      // Level-up logic & XP reward
      let gainedXp = 0;
      if (anal.attendance === 'present') gainedXp += 50;
      if (anal.attendance === 'late') gainedXp += 30;
      if (anal.grade === 5) gainedXp += 100;
      else if (anal.grade === 4) gainedXp += 50;
      
      // Bonus for unlocked achievements
      if (anal.achievementsUnlocked && anal.achievementsUnlocked.length > 0) {
        gainedXp += anal.achievementsUnlocked.length * 150;
        anal.achievementsUnlocked.forEach((title: string) => {
          const exists = progress.achievements.some(a => a.title === title);
          if (!exists) {
            progress.achievements.unshift({
              id: 'ach_' + Math.random().toString(36).substr(2, 5),
              title: title,
              description: `Экстраординарный результат на занятии по теме "${topic}"`,
              icon: 'Award',
              unlockedAt: date
            });
          }
        });
      }

      student.xp += gainedXp;
      const calculatedLevel = Math.floor(student.xp / 400) + 1;
      if (calculatedLevel > student.level) {
        student.level = calculatedLevel;
        // Trigger a system notification for level up!
        notifications.unshift({
          id: 'n_lvl_' + Math.random().toString(36).substr(2, 5),
          type: 'system',
          role: 'admin',
          studentName: student.name,
          title: `НОВЫЙ УРОВЕНЬ! 🚀`,
          message: `Студент ${student.name} достиг ${calculatedLevel} уровня благодаря усердной работе на уроке "${topic}"! Предыдущий опыт превышен на ${gainedXp} XP!`,
          timestamp: new Date().toISOString(),
          sentViaTelegram: false,
          status: 'sent'
        });
      }

      // Recalculate average grade & attendance from history
      const totalGrades = progress.gradesHistory.reduce((sum, item) => sum + item.grade, 0);
      if (progress.gradesHistory.length > 0) {
        student.generalScore = Math.round((totalGrades / progress.gradesHistory.length) * 10) / 10;
      }

      const totalLessonsCount = progress.attendanceHistory.length;
      const presentCount = progress.attendanceHistory.filter(h => h.status === 'present').length;
      const lateCount = progress.attendanceHistory.filter(h => h.status === 'late').length;
      if (totalLessonsCount > 0) {
        student.attendanceRate = Math.round(((presentCount + lateCount * 0.5) / totalLessonsCount) * 100);
      }

      // Risk score evaluation
      if (student.attendanceRate < 75) {
        student.riskRating = 'high';
      } else if (student.attendanceRate < 85) {
        student.riskRating = 'medium';
      } else {
        student.riskRating = 'low';
      }
    }

    // 3. Create automatic Telegram warning if absent/high achievements
    if (anal.attendance === 'absent') {
      notifications.unshift({
        id: 'n_' + Math.random().toString(36).substr(2, 5),
        type: 'parent_alert',
        role: 'parent',
        studentName: student.name,
        title: 'Уведомление о пропуске ⚠️',
        message: `Здравствуйте! Наш трекер зафиксировал, что ${student.name} пропустил сегодняшнее занятие по теме "${topic}". Подробная информация и запись лекции доступны в родительском кабинете.`,
        timestamp: new Date().toISOString(),
        sentViaTelegram: true,
        status: 'sent'
      });
    } else if (anal.grade === 5) {
      notifications.unshift({
        id: 'n_' + Math.random().toString(36).substr(2, 5),
        type: 'parent_alert',
        role: 'parent',
        studentName: student.name,
        title: 'Блестящие успехи ребенка! 🌟',
        message: `Отличные новости! На сегодняшнем уроке по теме "${topic}" ${student.name} показал выдающийся уровень подготовки и получил отличную оценку 5/5! Выполнены новые KPI урока.`,
        timestamp: new Date().toISOString(),
        sentViaTelegram: true,
        status: 'sent'
      });
    } else if (anal.grade <= 3) {
      notifications.unshift({
        id: 'n_' + Math.random().toString(36).substr(2, 5),
        type: 'parent_alert',
        role: 'parent',
        studentName: student.name,
        title: 'Внимание к домашнему заданию 💡',
        message: `Уважаемый родитель! Сегодня на уроке по теме "${topic}" у ${student.name} возникли некоторые сложности с материалом. Учитель оставил персональные рекомендации по ДЗ в системе. Пожалуйста, проконтролируйте их выполнение.`,
        timestamp: new Date().toISOString(),
        sentViaTelegram: true,
        status: 'sent'
      });
    }
  });
}

// Fallback generator in case Gemini API is absent, incorrect or disabled
function getMockAnalysis(groupName: string, rawText: string, topic: string) {
  const groupStudents = students.filter(s => s.groupName === groupName);
  
  // High-fidelity fallback parser
  return groupStudents.map(student => {
    const textLower = rawText.toLowerCase();
    const nameParts = student.name.split(' ');
    const isMentioned = nameParts.some(p => p.length > 2 && textLower.includes(p.toLowerCase()));

    let attendance: 'present' | 'absent' | 'late' = 'present';
    let grade = 4;
    let progressPercentage = 80;
    let strengths: string[] = [];
    let weakTopics: string[] = [];
    let recommendations: string[] = [];
    let achievementsUnlocked: string[] = [];

    if (textLower.includes('отсутств') || textLower.includes('не пришел') || textLower.includes('заболел')) {
      if (isMentioned && (textLower.includes('пропуск') || textLower.includes('не было') || textLower.includes('прогул') || textLower.includes('отсутств'))) {
        attendance = 'absent';
        grade = 1;
        progressPercentage = 0;
        weakTopics = ['Пропуск лекции'];
        recommendations = ['Посмотреть запись урока', 'Связаться с куратором группы'];
      }
    }

    if (attendance === 'present') {
      if (isMentioned) {
        if (textLower.includes('отличн') || textLower.includes('молодец') || textLower.includes('лучш') || textLower.includes('супер') || textLower.includes('великолепн') || textLower.includes('прекрасн')) {
          grade = 5;
          progressPercentage = 95;
          strengths = ['Высочайшая активность на уроке', 'Быстрое усвоение сложного материала', 'Безупречная работа'];
          recommendations = ['Решить олимпиадную задачу по теме', 'Двигаться дальше по плану'];
          achievementsUnlocked = ['Звездный Студент'];
        } else if (textLower.includes('плох') || textLower.includes('тяжел') || textLower.includes('сложн') || textLower.includes('трудност') || textLower.includes('не справ')) {
          grade = 3;
          progressPercentage = 60;
          strengths = ['Попытки вовлечься в решение', 'Хорошая самокритика'];
          weakTopics = ['Тяжело дается практический синтаксис', 'Забывает базовые формулы'];
          recommendations = ['Пересмотреть лекцию еще раз', 'Пройти тренажер в личном кабинете 3 раза'];
        } else {
          grade = 4;
          progressPercentage = 85;
          strengths = ['Трудолюбие на занятии', 'Интерес к деталям темы'];
          weakTopics = ['Редкие синтаксические помарки'];
          recommendations = ['Повторить пройденный материал дома'];
        }
      } else {
        // Not mentioned, normal progress
        grade = Math.random() > 0.5 ? 5 : 4;
        progressPercentage = grade === 5 ? 90 : 80;
        strengths = ['Стабильная работа в группе', 'Успешное выполнение базовых заданий'];
        weakTopics = ['Закрепить мелкие шероховатости'];
        recommendations = ['Продолжать заниматься в регулярном режиме'];
      }
    }

    return {
      studentName: student.name,
      studentId: student.id,
      lessonTopic: topic,
      attendance,
      grade,
      progressPercentage,
      strengths,
      weakTopics,
      recommendations,
      achievementsUnlocked
    };
  });
}

// REST APIs
app.get('/api/groups', (req, res) => {
  res.json(groups);
});

app.get('/api/students', (req, res) => {
  res.json(students);
});

app.get('/api/progress', (req, res) => {
  res.json(studentsProgress);
});

app.get('/api/reports', (req, res) => {
  res.json(lessonReports);
});

app.get('/api/notifications', (req, res) => {
  res.json(notifications);
});

app.get('/api/mentors', (req, res) => {
  res.json(mentorCharacters);
});

app.get('/api/integrations', (req, res) => {
  res.json(apiIntegrations);
});

// ==========================================
// CENTRAL AUTHENTICATION & SECURITY CONTROL SUITE
// ==========================================

interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'director' | 'teacher' | 'parent' | 'student';
  avatar: string;
  passwordHash: string;
  isMfaActive: boolean;
  mfaSecret: string;
  createdAt: string;
  groupCode?: string;
}

let registeredUsers: RegisteredUser[] = [
  {
    id: 'u1',
    name: 'СистемаУправления (Администратор)',
    email: 'admin@edu.uz',
    phone: '+998 90 000 00 01',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=admin',
    passwordHash: 'PBKDF2_SECURE_99187a',
    isMfaActive: true,
    mfaSecret: '777123',
    createdAt: '2026-01-10 09:00'
  },
  {
    id: 'u2',
    name: 'Руководитель Хаким Рахимов',
    email: 'director@edu.uz',
    phone: '+998 90 000 00 02',
    role: 'director',
    avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=hakim',
    passwordHash: 'PBKDF2_SECURE_551aa',
    isMfaActive: false,
    mfaSecret: '123456',
    createdAt: '2026-02-15 11:20'
  },
  {
    id: 'u3',
    name: 'Преподаватель Анна Смирнова',
    email: 'teacher@edu.uz',
    phone: '+998 90 000 00 03',
    role: 'teacher',
    avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=smirnova',
    passwordHash: 'PBKDF2_SECURE_88ff9',
    isMfaActive: false,
    mfaSecret: '123456',
    createdAt: '25.04.2026'
  },
  {
    id: 'u4',
    name: 'Родитель Ученика',
    email: 'parent@edu.uz',
    phone: '+998 90 000 00 04',
    role: 'parent',
    avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=roditel',
    passwordHash: 'PBKDF2_SECURE_44ab2',
    isMfaActive: false,
    mfaSecret: '123456',
    createdAt: '12.05.2026'
  },
  {
    id: 'u5',
    name: 'Александр Смирнов',
    email: 'student@edu.uz',
    phone: '+998 90 000 00 05',
    role: 'student',
    avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=sasha',
    passwordHash: 'PBKDF2_SECURE_22cc1',
    isMfaActive: false,
    mfaSecret: '123456',
    createdAt: '20.06.2026'
  }
];

let sessionRegistry = [
  { id: '1', device: 'Chrome (macOS Sequoia)', ip: '195.158.5.144', location: 'Ташкент, Узбекистан', expiresIn: 'через 59 мин', tokenSimulated: 'jwt_key_session_chrome_mac' },
  { id: '2', device: 'Safari (iPhone 15 Pro)', ip: '213.230.125.10', location: 'Самарканд, Узбекистан', expiresIn: 'через 11 ч', tokenSimulated: 'jwt_key_session_safari_ios' }
];

// POST trigger SMS simulation for registration
app.post('/api/auth/register-send-otp', (req, res) => {
  const { phone, name } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Номер телефона обязателен' });
  }
  // Generate random 4 digit code
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  
  // Log message internally as notification to show in system bot/dashboard
  notifications.unshift({
    id: 'n_' + Date.now(),
    type: 'system',
    role: 'admin',
    title: 'Отправлен СМС-код верификации EduSMS',
    message: `Код подтверждения для телефона ${phone}: ${code}. Ученик: ${name || 'Новый гость'}`,
    timestamp: new Date().toLocaleTimeString('ru-RU'),
    sentViaTelegram: true,
    status: 'sent'
  });

  res.json({ success: true, phone, simulatedCode: code });
});

// POST register user profile
app.post('/api/auth/register-complete', (req, res) => {
  const { name, email, phone, role, groupCode, password, mentorId } = req.body;
  if (!name || !email || !phone || !role) {
    return res.status(400).json({ error: 'Не все обязательные поля заполнены' });
  }

  // Create new user profile
  const newUser: RegisteredUser = {
    id: 'u_' + Math.random().toString(36).substr(2, 6),
    name,
    email,
    phone,
    role,
    avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(name)}`,
    passwordHash: 'PBKDF2_AUTO_GENERATED_' + Math.random().toString(36).substr(2, 6),
    isMfaActive: false,
    mfaSecret: '777123',
    createdAt: new Date().toLocaleDateString('ru-RU'),
    groupCode
  };

  registeredUsers.push(newUser);

  // If role is student, push into local databank of student profiles
  if (role === 'student') {
    const studentId = 's_reg_' + newUser.id;
    const newStudent = {
      id: studentId,
      name,
      groupName: 'Английский язык - Starter B1',
      avatar: newUser.avatar,
      level: 1,
      xp: 100,
      parentName: 'Родитель',
      parentPhone: '+998 90 123 45 67',
      telegramId: '@tg_parent',
      attendanceRate: 100,
      generalScore: 5.0,
      riskRating: 'low',
      mentorId: mentorId || 'm1',
      academicRole: 'Староста',
      engagementRate: 90
    };
    students.push(newStudent);
    
    studentsProgress.push({
      id: 'p_reg_' + studentId,
      studentId,
      strengths: ['Начало образовательного полета'],
      weakTopics: ['Новый материал'],
      recommendations: ['Пройти вводный тест с вашим наставником'],
      achievements: [],
      attendanceHistory: [],
      gradesHistory: []
    });
  }

  // Generate session token
  const cleanToken = 'mock_jwt_token_' + Math.random().toString(36).substr(2, 12);
  sessionRegistry.push({
    id: Math.random().toString(36).substr(2, 4),
    device: 'Веб-сессия (Самостоятельная регистрация)',
    ip: '127.0.0.1',
    location: 'Республика Узбекистан',
    expiresIn: 'через 24 ч',
    tokenSimulated: cleanToken
  });

  res.json({
    success: true,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      avatar: newUser.avatar,
      isMfaActive: newUser.isMfaActive,
      mfaSecret: newUser.mfaSecret,
      groupCode: newUser.groupCode,
      createdAt: newUser.createdAt
    },
    token: cleanToken
  });
});

// POST Authenticate login credentials
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Заполните email / телефон' });
  }

  // Find user based on email or phone
  const user = registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase() || u.phone === email);
  if (!user) {
    return res.status(401).json({ error: 'Пользователь с такими учетными данными не зарегистрирован в системе.' });
  }

  // Check 2FA factor status
  if (user.isMfaActive) {
    return res.json({
      requires2fa: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        isMfaActive: user.isMfaActive,
        mfaSecret: user.mfaSecret,
        createdAt: user.createdAt
      },
      token: 'temp_restricted_token_jwt_2fa'
    });
  }

  // Session Token
  const token = 'jwt_token_' + Math.random().toString(36).substr(2, 12);
  sessionRegistry.push({
    id: Math.random().toString(36).substr(2, 4),
    device: 'Desktop Chrome (г. Ташкент)',
    ip: '195.158.5.144',
    location: 'Ташкент, Узбекистан',
    expiresIn: 'через 1 ч',
    tokenSimulated: token
  });

  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      isMfaActive: user.isMfaActive,
      mfaSecret: user.mfaSecret,
      createdAt: user.createdAt
    },
    token
  });
});

// POST quick login for easy demo walkthrough
app.post('/api/auth/quick-login', (req, res) => {
  const { role } = req.body;
  const user = registeredUsers.find(u => u.role === role);
  if (user) {
    // Return user credentials bypassing 2FA on quick demo logs for hassle-free evaluation
    const token = 'jwt_quick_session_' + role;
    res.json({
      success: true,
      user,
      token
    });
  } else {
    res.status(404).json({ error: 'Пользователь для demo роли не найден' });
  }
});

// POST toggle 2FA mfaActive
app.post('/api/auth/2fa-toggle', (req, res) => {
  const { userId } = req.body;
  const user = registeredUsers.find(u => u.id === userId);
  if (user) {
    user.isMfaActive = !user.isMfaActive;
    return res.json({ success: true, isMfaActive: user.isMfaActive });
  }
  res.status(404).json({ error: 'Пользователь не найден' });
});

// GET Active JWT Sessions
app.get('/api/auth/active-sessions', (req, res) => {
  res.json(sessionRegistry);
});

// POST Revoke session IP / device and invalidate JWT
app.post('/api/auth/revoke-session', (req, res) => {
  const { id } = req.body;
  sessionRegistry = sessionRegistry.filter(s => s.id !== id);
  res.json({ success: true });
});

// POST Connect instantly from a teacher invitation code (By-passing full registration steps)
app.post('/api/auth/invite-instant', (req, res) => {
  const { phone, role } = req.body;
  if (!phone || !role) {
    return res.status(400).json({ error: 'Телефон и роль обязательны' });
  }

  const isParent = role === 'parent';
  const name = isParent ? 'Родитель (Подключен)' : 'Студент (Подключен)';
  const avatarName = isParent ? 'parent_tag' : 'student_tag';

  const newUser: RegisteredUser = {
    id: 'u_invite_' + Math.random().toString(36).substr(2, 5),
    name,
    email: phone.replace(/[^0-9]/g, '') + '@edu.uz',
    phone,
    role: role as any,
    avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${avatarName}`,
    passwordHash: 'PBKDF2_INVITED_BYPASS_NO_PASSWD',
    isMfaActive: false,
    mfaSecret: '123456',
    createdAt: new Date().toLocaleDateString('ru-RU')
  };

  registeredUsers.push(newUser);

  const token = 'jwt_invite_session_' + Math.random().toString(36).substr(2, 10);
  sessionRegistry.push({
    id: Math.random().toString(36).substr(2, 4),
    device: 'Смартфон (Подключение по QR коду)',
    ip: '178.218.201.55',
    location: 'Самаркандская область, УЗ',
    expiresIn: 'через 30 дней',
    tokenSimulated: token
  });

  res.json({ success: true, user: newUser, token });
});

// ==========================================
// OUTSTANDING UZBEKISTAN & GLOBAL OPEN REST API SUITE
// ==========================================

let webhookConfig = {
  url: 'https://api.emaktab.uz/v1/webhook-tracker',
  events: ['student_graded', 'student_level_up', 'churn_ew_warning', 'lesson_reported']
};

let apiHomeworks = [
  { id: 'hw1', title: 'Present Simple exercises', groupName: 'Английский язык - Starter B1', deadline: '2026-06-05', status: 'Active' },
  { id: 'hw2', title: 'Python loops and lists challenges', groupName: 'Python Kids', deadline: '2026-06-07', status: 'Active' }
];

let apiSchedules = [
  { id: 'sc1', groupName: 'Английский язык - Starter B1', day: 'Понедельник, Среда', time: '16:00', room: 'Класс А' },
  { id: 'sc2', groupName: 'Python Kids', day: 'Вторник, Четверг', time: '17:30', room: 'ИКТ-Лаборатория' }
];

// Helper to trigger webhook simulations
function triggerWebhookEvent(event: string, payload: any) {
  const logEntry = {
    timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    event,
    payload: JSON.stringify(payload),
    status: 'delivered' as const
  };
  
  // Log inside the Open Rest API Gateway
  const gateway = apiIntegrations.find(i => i.id === 'i5');
  if (gateway) {
    if (!gateway.webhookLogs) gateway.webhookLogs = [];
    gateway.webhookLogs.unshift(logEntry);
    gateway.lastUsed = new Date().toLocaleString('ru-RU').replace(',', '');
  }
  
  // Log inside eMaktab (i4) if appropriate
  if (event.includes('grade') || event.includes('attendance') || event.includes('student')) {
    const emaktab = apiIntegrations.find(i => i.id === 'i4');
    if (emaktab) {
      if (!emaktab.webhookLogs) emaktab.webhookLogs = [];
      emaktab.webhookLogs.unshift({
        timestamp: logEntry.timestamp,
        event,
        payload: logEntry.payload,
        status: 'delivered'
      });
      emaktab.lastUsed = new Date().toLocaleString('ru-RU').replace(',', '');
    }
  }
}

const validateApiKeyOrToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized: Missing Authorization header' });
  }
  const token = authHeader.replace(/^Bearer\s+/, '').trim();
  
  // Find matching active integration
  const activeIntegration = apiIntegrations.find(i => i.status === 'active' && i.apiKey === token);
  
  // Custom checks or simple bypasses for simulated active tokens
  const mockTokens = ['oauth_token_simulated_2026', 'edu_api_key_77a28f88cd0a8174f8', 'em_auth_uzb_88fa12cd90ab12', 'md_token_8849fae2bc4911', 'gc_auth_9918dfacd812aa'];
  
  if (!activeIntegration && !mockTokens.includes(token)) {
    return res.status(403).json({ error: 'Forbidden: Invalid or inactive API key / Access token' });
  }
  
  // Track last used
  const matched = activeIntegration || apiIntegrations.find(i => i.apiKey === token);
  if (matched) {
    matched.lastUsed = new Date().toLocaleString('ru-RU').replace(',', '');
    matched.lastSyncedRecords = (matched.lastSyncedRecords || 0) + 1;
    matched.status = 'active'; // ensure active when querying
  }
  
  next();
};

// OAuth 2.0 Simulation Endpoint
app.post('/api/v1/oauth/token', (req, res) => {
  const { client_id, client_secret, grant_type } = req.body;
  if (grant_type === 'client_credentials') {
    res.json({
      access_token: 'oauth_token_simulated_2026',
      token_type: 'Bearer',
      expires_in: 3600,
      scope: 'read write offline_access'
    });
  } else {
    res.status(400).json({ error: 'Unsupported grant_type. Use client_credentials.' });
  }
});

// GET Students list via Open API
app.get('/api/v1/students', validateApiKeyOrToken, (req, res) => {
  res.json({ success: true, count: students.length, data: students });
});

// Import Students via JSON API
app.post('/api/v1/students/import', validateApiKeyOrToken, (req, res) => {
  const { data } = req.body;
  if (!Array.isArray(data)) {
    return res.status(400).json({ error: 'Invalid data format. Expected array of students.' });
  }
  
  data.forEach((student: any) => {
    const newId = student.id || ('s_' + Math.random().toString(36).substr(2, 5));
    const exists = students.find(s => s.id === newId || s.name === student.name);
    if (!exists) {
      const newStudent = {
        id: newId,
        name: student.name,
        groupName: student.groupName || 'Английский язык - Starter B1',
        avatar: student.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(student.name)}`,
        level: Number(student.level) || 1,
        xp: Number(student.xp) || 100,
        parentName: student.parentName || 'Родитель',
        parentPhone: student.parentPhone || '+998 90 123 45 67',
        telegramId: student.telegramId || '@tg_parent',
        attendanceRate: Number(student.attendanceRate) || 100,
        generalScore: Number(student.generalScore) || 5.0,
        riskRating: student.riskRating || 'low',
        mentorId: student.mentorId || 'm1',
        academicRole: student.academicRole || 'Староста',
        engagementRate: Number(student.engagementRate) || 85
      };
      students.push(newStudent);
      
      // Also register progress
      studentsProgress.push({
        id: 'p_' + newId,
        studentId: newId,
        strengths: ['Усердный импортированный студент', 'Интерес к знаниям'],
        weakTopics: ['Новая терминология'],
        recommendations: ['Повторить вводные концепты'],
        achievements: [],
        attendanceHistory: [],
        gradesHistory: []
      });
    }
  });
  
  triggerWebhookEvent('student_level_up', { count: data.length });
  res.json({ success: true, message: `Successfully imported ${data.length} students.`, count: students.length });
});

// GET Groups
app.get('/api/v1/groups', validateApiKeyOrToken, (req, res) => {
  res.json({ success: true, count: groups.length, data: groups });
});

// Import Groups
app.post('/api/v1/groups/import', validateApiKeyOrToken, (req, res) => {
  const { data } = req.body;
  if (!Array.isArray(data)) {
    return res.status(400).json({ error: 'Invalid data format. Expected array of groups.' });
  }
  
  data.forEach((g: any) => {
    const exists = groups.find(item => item.name === g.name);
    if (!exists) {
      groups.push({
        id: g.id || ('g_' + Math.random().toString(36).substr(2, 5)),
        name: g.name,
        subject: g.subject || 'LMS Курс',
        teacherName: g.teacherName || 'Анна Смирнова',
        schedule: g.schedule || 'Пн-Ср 18:00',
        studentsCount: g.studentsCount || 5,
        engagementRate: g.engagementRate || 85,
        questsCompleted: g.questsCompleted || 0
      });
    }
  });
  
  triggerWebhookEvent('class_reported', { count: data.length });
  res.json({ success: true, message: `Successfully imported ${data.length} groups.`, count: groups.length });
});

// GET Attendance
app.get('/api/v1/attendance', validateApiKeyOrToken, (req, res) => {
  const attendanceList = studentsProgress.map(p => ({
    studentId: p.studentId,
    studentName: students.find(s => s.id === p.studentId)?.name || 'Неизвестно',
    attendanceHistory: p.attendanceHistory
  }));
  res.json({ success: true, data: attendanceList });
});

// Sync Attendance
app.post('/api/v1/attendance/sync', validateApiKeyOrToken, (req, res) => {
  const { data } = req.body;
  if (!Array.isArray(data)) {
    return res.status(400).json({ error: 'Invalid data format. Expected array.' });
  }
  
  let synced = 0;
  data.forEach(item => {
    const progress = studentsProgress.find(p => p.studentId === item.studentId);
    if (progress) {
      const hasRecord = progress.attendanceHistory.some(h => h.date === item.date && h.topic === item.topic);
      if (!hasRecord) {
        progress.attendanceHistory.unshift({
          date: item.date,
          status: item.status || 'present',
          topic: item.topic || 'Академический Урок'
        });
        synced++;
      }
    }
  });
  
  triggerWebhookEvent('attendance_synced', { synced_records: synced });
  res.json({ success: true, message: `Attendance synchronization complete. Synced ${synced} new records.` });
});

// GET Grades
app.get('/api/v1/grades', validateApiKeyOrToken, (req, res) => {
  const gradesList = studentsProgress.map(p => ({
    studentId: p.studentId,
    studentName: students.find(s => s.id === p.studentId)?.name || 'Неизвестно',
    gradesHistory: p.gradesHistory
  }));
  res.json({ success: true, data: gradesList });
});

// Sync Grades (eMaktab & LMS core)
app.post('/api/v1/grades/sync', validateApiKeyOrToken, (req, res) => {
  const { data } = req.body;
  if (!Array.isArray(data)) {
    return res.status(400).json({ error: 'Invalid data format. Expected array.' });
  }
  
  let synced = 0;
  data.forEach(item => {
    const progress = studentsProgress.find(p => p.studentId === item.studentId);
    if (progress) {
      const hasRecord = progress.gradesHistory.some(g => g.date === item.date && g.topic === item.topic && g.grade === item.grade);
      if (!hasRecord) {
        progress.gradesHistory.unshift({
          date: item.date,
          topic: item.topic,
          grade: Number(item.grade) || 5
        });
        synced++;
      }
    }
  });
  
  triggerWebhookEvent('student_graded', { synced_grades: synced });
  res.json({ success: true, message: `Grades synchronization complete. Synced ${synced} marks.` });
});

// GET Homeworks
app.get('/api/v1/homeworks', validateApiKeyOrToken, (req, res) => {
  res.json({ success: true, count: apiHomeworks.length, data: apiHomeworks });
});

// Sync Homeworks
app.post('/api/v1/homeworks/sync', validateApiKeyOrToken, (req, res) => {
  const { data } = req.body;
  if (!Array.isArray(data)) {
    return res.status(400).json({ error: 'Invalid data format.' });
  }
  data.forEach(hw => {
    apiHomeworks.unshift({
      id: hw.id || 'hw_' + Math.random().toString(36).substr(2, 5),
      title: hw.title,
      groupName: hw.groupName,
      deadline: hw.deadline || '2026-06-10',
      status: hw.status || 'Active'
    });
  });
  triggerWebhookEvent('homework_submitted', { count: data.length });
  res.json({ success: true, data: apiHomeworks });
});

// GET Achievements
app.get('/api/v1/achievements', validateApiKeyOrToken, (req, res) => {
  const merged = studentsProgress.map(p => ({
    studentId: p.studentId,
    studentName: students.find(s => s.id === p.studentId)?.name || 'Неизвестно',
    achievements: p.achievements
  }));
  res.json({ success: true, data: merged });
});

// GET Schedule
app.get('/api/v1/schedule', validateApiKeyOrToken, (req, res) => {
  res.json({ success: true, data: apiSchedules });
});

// GET AI Analytics
app.get('/api/v1/ai-analytics', validateApiKeyOrToken, (req, res) => {
  const latestAnalytics = lessonReports.slice(0, 5).map(report => ({
    reportId: report.id,
    date: report.date,
    groupName: report.groupName,
    topic: report.topic,
    analyses: report.analyses
  }));
  res.json({ success: true, data: latestAnalytics });
});

// Webhook config update
app.post('/api/v1/webhooks/config', validateApiKeyOrToken, (req, res) => {
  const { url, events } = req.body;
  if (url) webhookConfig.url = url;
  if (events) webhookConfig.events = events;
  
  const gateway = apiIntegrations.find(i => i.id === 'i5');
  if (gateway) {
    gateway.webhookUrl = webhookConfig.url;
    gateway.webhookEvents = webhookConfig.events;
  }
  res.json({ success: true, webhookConfig });
});

app.post('/api/notifications/clear', (req, res) => {
  notifications = [];
  res.json({ success: true });
});

app.post('/api/notifications/telegram-trigger', (req, res) => {
  const { title, message, role, studentName } = req.body;
  const newNotif = {
    id: 'n_tg_' + Math.random().toString(36).substr(2, 5),
    type: role === 'parent' ? 'parent_alert' : 'teacher_alert',
    role,
    studentName,
    title,
    message,
    timestamp: new Date().toISOString(),
    sentViaTelegram: true,
    status: 'sent'
  };
  notifications.unshift(newNotif);
  
  // Actually dispatch to Telegram Bot API if configured
  sendTelegramAlert(newNotif).catch(e => console.error("Auto Telegram dispatch error:", e));
  
  res.json(newNotif);
});

// Telegram Configuration API Endpoints
app.get('/api/telegram/config', (req, res) => {
  res.json(telegramConfig);
});

app.post('/api/telegram/config', async (req, res) => {
  const { botToken, testChatId } = req.body;
  telegramConfig.botToken = botToken || "";
  telegramConfig.testChatId = testChatId || "";
  telegramConfig.lastSaved = new Date().toISOString();
  
  if (!botToken) {
    telegramConfig.status = 'disconnected';
    telegramConfig.botUsername = "";
    telegramConfig.botName = "";
    telegramConfig.isEnabled = false;
    return res.json({ success: true, config: telegramConfig });
  }

  telegramConfig.isEnabled = true;

  // Try to connect to Telegram Bot API to get username/name
  try {
    const checkRes = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const checkData = await checkRes.json();
    if (checkData.ok) {
      telegramConfig.status = 'connected';
      telegramConfig.botUsername = checkData.result.username;
      telegramConfig.botName = checkData.result.first_name;
      res.json({ success: true, config: telegramConfig, message: "Соединение успешно установлено!" });
    } else {
      telegramConfig.status = 'error';
      res.json({ success: false, error: checkData.description || "Невалидный токен бота.", config: telegramConfig });
    }
  } catch (err: any) {
    if (botToken.startsWith('mock_') || botToken.toLowerCase().includes('test') || botToken.toLowerCase().includes('dummy')) {
      telegramConfig.status = 'connected';
      telegramConfig.botUsername = "EduAI_mock_bot";
      telegramConfig.botName = "EduAI Demo Bot (Симулятор)";
      return res.json({ success: true, config: telegramConfig, simulated: true, message: "Токен сохранен в демонстрационном режиме!" });
    }
    
    telegramConfig.status = 'error';
    res.json({ success: false, error: "Ошибка сети API: " + err.message, config: telegramConfig });
  }
});

app.post('/api/telegram/test-connection', async (req, res) => {
  const { botToken, testChatId } = req.body;
  const tokenToUse = botToken || telegramConfig.botToken;
  const chatIdToUse = testChatId || telegramConfig.testChatId;

  if (!tokenToUse) {
    return res.status(400).json({ success: false, error: "Token не указан!" });
  }

  try {
    const checkRes = await fetch(`https://api.telegram.org/bot${tokenToUse}/getMe`);
    const checkData = await checkRes.json();
    
    if (!checkData.ok) {
      if (tokenToUse.startsWith('mock_') || tokenToUse.toLowerCase().includes('test') || tokenToUse.toLowerCase().includes('dummy')) {
        const testNotif = {
          id: 'n_tg_' + Math.random().toString(36).substr(2, 5),
          type: 'system',
          role: 'admin',
          title: 'Тест Telegram (Имитация) 🚀',
          message: `Тестовое сообщение успешно отправлено в чат ${chatIdToUse || '@default_chat_id'} (С симуляцией токена)`,
          timestamp: new Date().toISOString(),
          sentViaTelegram: true,
          status: 'sent'
        };
        notifications.unshift(testNotif);
        
        return res.json({ 
          success: true, 
          simulated: true, 
          botInfo: { username: "EduAI_mock_bot", first_name: "EduAI Demo Bot (Симулятор)" },
          message: "Успешная имитация подключения! Уведомление записано в журнал."
        });
      }
      return res.status(400).json({ success: false, error: checkData.description || "Неверный токен бота" });
    }

    const botInfo = checkData.result;
    let messageSent = false;
    let statusText = "Чат ID не указан. Проверка самого бота пройдена.";

    if (chatIdToUse) {
      const cleanMsgText = `🎉 *EduAI Tracker: Тестовое подключение*\n\nИнтеграция с Telegram-ботом *@${botInfo.username}* успешно подтверждена. Теперь родители, преподаватели и студенты будут получать отчеты по успеваемости и Early WarningSystem-оповещения моментально! 🚀`;
      
      const sendRes = await fetch(`https://api.telegram.org/bot${tokenToUse}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatIdToUse,
          text: cleanMsgText,
          parse_mode: "Markdown"
        })
      });
      const sendData = await sendRes.json();
      if (sendData.ok) {
        messageSent = true;
        statusText = `Тестовое сообщение успешно отправлено в чат ${chatIdToUse}!`;
      } else {
        statusText = `Бот активен, но не смог отправить сообщение: ${sendData.description}. Пожалуйста, откройте диалог с ботом и нажмите кнопку /start!`;
      }
    }

    const newNotif = {
      id: 'n_tg_' + Math.random().toString(36).substr(2, 5),
      type: 'system',
      role: 'admin',
      title: 'Подключение Telegram 📲',
      message: messageSent 
        ? `Успешно установлен шлюз @${botInfo.username}. Тестовое сообщение доставлено.`
        : `Шлюз @${botInfo.username} активен. Подключение верифицировано без отправки теста (Чат ID пуст).`,
      timestamp: new Date().toISOString(),
      sentViaTelegram: true,
      status: messageSent ? 'sent' : 'pending'
    };
    notifications.unshift(newNotif);

    res.json({
      success: true,
      botInfo,
      messageSent,
      message: `Подключение подтверждено: @${botInfo.username} (${botInfo.first_name}). ${statusText}`
    });

  } catch (err: any) {
    if (tokenToUse.startsWith('mock_') || tokenToUse.toLowerCase().includes('test') || tokenToUse.toLowerCase().includes('dummy')) {
      const testNotif = {
        id: 'n_tg_' + Math.random().toString(36).substr(2, 5),
        type: 'system',
        role: 'admin',
        title: 'Тест Telegram (Имитация) 🚀',
        message: `Имитация тестового сообщения отправлена в чат ${chatIdToUse || '@default_chat_id'}.`,
        timestamp: new Date().toISOString(),
        sentViaTelegram: true,
        status: 'sent'
      };
      notifications.unshift(testNotif);
      
      return res.json({
        success: true,
        simulated: true,
        botInfo: { username: "EduAI_mock_bot", first_name: "EduAI Demo Bot (Симулятор)" },
        message: "Демо-подключение верифицировано благодаря симуляции токена!"
      });
    }
    res.status(500).json({ success: false, error: "Ошибка сети с Telegram Bot API: " + err.message });
  }
});

app.post('/api/integrations/toggle', (req, res) => {
  const { id } = req.body;
  const integration = apiIntegrations.find(i => i.id === id);
  if (integration) {
    integration.status = integration.status === 'active' ? 'inactive' : 'active';
    integration.lastUsed = new Date().toLocaleString('ru-RU', { hour12: false }).replace(',', '');
    res.json({ success: true, apiIntegrations });
  } else {
    res.status(404).json({ error: 'Integration not found' });
  }
});

app.post('/api/integrations/generate', (req, res) => {
  const { id } = req.body;
  const integration = apiIntegrations.find(i => i.id === id);
  if (integration) {
    const prefixes: { [key: string]: string } = { 
      i1: 'md_token_', 
      i2: 'gc_auth_', 
      i3: 'ms_teams_',
      i4: 'em_auth_uzb_',
      i5: 'edu_api_key_'
    };
    const prefix = prefixes[id] || 'api_key_';
    integration.apiKey = prefix + Math.random().toString(36).substr(2, 14);
    integration.lastUsed = new Date().toLocaleString('ru-RU', { hour12: false }).replace(',', '');
    res.json({ success: true, token: integration.apiKey, apiIntegrations });
  } else {
    res.status(404).json({ error: 'Integration not found' });
  }
});

app.post('/api/integrations/sync-trigger', (req, res) => {
  const { id } = req.body;
  const integration = apiIntegrations.find(i => i.id === id);
  if (integration) {
    integration.status = 'active';
    integration.lastUsed = new Date().toLocaleString('ru-RU', { hour12: false }).replace(',', '');
    integration.syncStatus = 'synced';
    const delta = Math.floor(Math.random() * 25) + 5;
    integration.lastSyncedRecords = (integration.lastSyncedRecords || 0) + delta;
    
    // Add Webhook log
    if (!integration.webhookLogs) integration.webhookLogs = [];
    integration.webhookLogs.unshift({
      timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      event: 'attendance_synced',
      payload: JSON.stringify({ synced_records: delta, platform: integration.platform, status: 'success' }),
      status: 'delivered'
    });
    
    // Trigger webhook event
    triggerWebhookEvent('platform_sync', { platform: integration.platform, synced_records: delta });
    
    res.json({ success: true, apiIntegrations });
  } else {
    res.status(404).json({ error: 'Integration not found' });
  }
});

app.get('/api/quests', (req, res) => {
  res.json(groupQuests);
});

app.get('/api/challenges', (req, res) => {
  res.json(personalChallenges);
});

app.get('/api/peer-help', (req, res) => {
  res.json(peerHelpRecords);
});

app.get('/api/ews/warnings', (req, res) => {
  const warnings = students.map(student => {
    const isAtAttendanceRisk = student.attendanceRate < 75;
    const isAtScoreRisk = student.generalScore < 3.8;
    const isAtMotivationRisk = student.riskRating === 'high' || student.riskRating === 'medium';

    if (isAtAttendanceRisk || isAtScoreRisk || isAtMotivationRisk) {
      const riskLevel = isAtAttendanceRisk || (student.attendanceRate < 75 && isAtScoreRisk) ? 'high' : 'medium';
      const pathType = student.groupName.includes('Python') ? 'робототехнике' : 'английскому языку';
      
      let reason = '';
      if (isAtAttendanceRisk && isAtScoreRisk) {
        reason = `Снижение посещаемости до ${student.attendanceRate}% и слабая оценка (${student.generalScore}/5). Пропуски ключевых тем мешают усвоению материала.`;
      } else if (isAtAttendanceRisk) {
        reason = `Критически низкий показатель присутствия на уроках (${student.attendanceRate}%). Растет риск утери учебной нити.`;
      } else {
        reason = `Оценка успеваемости опустилась до ${student.generalScore}/5. Наблюдается угасание вовлеченности на уроках по ${pathType}.`;
      }

      const teacherRecommendation = student.groupName.includes('Python') 
        ? `Назначить парное занятие с Лидером группы для разбора структуры циклов, подключить Robo-Cat ИИ-ассистента для микро-челленджей на дом.` 
        : `Провести созвон 1-на-1 с родителями, выслать подборку видео-лекций по Present Continuous, организовать разговорный спарринг со сильным учеником-ментором в группе.`;

      const parentRecommendation = student.groupName.includes('Python')
        ? `Проверить выполнение персонального ИИ-челленджа в кабинете ученика, ограничить отвлекающие факторы (игры, телефон) во время домашних сессий.`
        : `Проконтролировать устный разбор неправильных глаголов, подключить Telegram-алерты, хвалить ребенка за микро-достижения для повышения мотивации.`;

      return {
        studentId: student.id,
        studentName: student.name,
        groupName: student.groupName,
        riskLevel,
        riskRating: student.riskRating,
        indicator: `Шкала EWS: Посещаемость ${student.attendanceRate}% • Оценка ${student.generalScore}/5`,
        reason,
        teacherRecommendation,
        parentRecommendation,
        contactTelegram: student.telegramId,
        parentPhone: student.parentPhone
      };
    }
    return null;
  }).filter(w => w !== null);

  res.json(warnings);
});

app.post('/api/students/academic-role', (req, res) => {
  const { studentId, academicRole } = req.body;
  const student = students.find(s => s.id === studentId);
  if (student) {
    student.academicRole = academicRole;
    res.json({ success: true, student, students });
  } else {
    res.status(404).json({ error: 'Student not found' });
  }
});

app.post('/api/challenges/complete', (req, res) => {
  const { challengeId } = req.body;
  const challenge = personalChallenges.find(c => c.id === challengeId);
  if (challenge) {
    challenge.status = 'completed';
    challenge.currentCount = challenge.targetCount;
    
    const student = students.find(s => s.id === challenge.studentId);
    if (student) {
      student.xp += challenge.rewardXp;
      student.level = Math.floor(student.xp / 400) + 1;
      
      notifications.unshift({
        id: 'n_ch_' + Math.random().toString(36).substr(2, 5),
        type: 'system',
        role: 'admin',
        studentName: student.name,
        title: 'Челлендж выполнен! 🎉',
        message: `Студент ${student.name} успешно завершил ИИ-челлендж "${challenge.title}" и заработал +${challenge.rewardXp} XP!`,
        timestamp: new Date().toISOString(),
        sentViaTelegram: false,
        status: 'sent'
      });
    }
    res.json({ success: true, challenge, students, notifications });
  } else {
    res.status(404).json({ error: 'Challenge not found' });
  }
});

app.post('/api/peer-help', (req, res) => {
  const { helperStudentId, recipientStudentId, action } = req.body;
  const helper = students.find(s => s.id === helperStudentId);
  const recipient = students.find(s => s.id === recipientStudentId);

  if (helper && recipient) {
    const newRecord = {
      id: 'ph_' + Math.random().toString(36).substr(2, 5),
      helperStudentId,
      recipientStudentId,
      action,
      rewardXp: 50,
      date: new Date().toISOString().split('T')[0]
    };
    peerHelpRecords.unshift(newRecord);
    
    helper.xp += 50;
    helper.level = Math.floor(helper.xp / 400) + 1;
    recipient.xp += 20;
    recipient.level = Math.floor(recipient.xp / 400) + 1;

    notifications.unshift({
      id: 'n_ph_' + Math.random().toString(36).substr(2, 5),
      type: 'system',
      role: 'admin',
      title: 'Взаимопомощь в группе! 🤝',
      message: `${helper.name} (${helper.academicRole || 'Студент'}) помог одногруппнику ${recipient.name} в задаче: "${action}". Оба студента получили XP-бонусы!`,
      timestamp: new Date().toISOString(),
      sentViaTelegram: false,
      status: 'sent'
    });

    res.json({ success: true, record: newRecord, students, notifications });
  } else {
    res.status(404).json({ error: 'Helper or recipient not found' });
  }
});

app.post('/api/quests/advance', (req, res) => {
  const { questId } = req.body;
  const quest = groupQuests.find(q => q.id === questId);
  if (quest) {
    quest.currentCount = quest.targetCount;
    quest.status = 'completed';
    
    const group = groups.find(g => g.id === quest.groupId);
    if (group) {
      if (!group.questsCompleted) group.questsCompleted = 0;
      group.questsCompleted += 1;
      
      const groupStudents = students.filter(s => s.groupName === group.name);
      groupStudents.forEach(s => {
        s.xp += quest.rewardXp;
        s.level = Math.floor(s.xp / 400) + 1;
      });

      notifications.unshift({
        id: 'n_qg_' + Math.random().toString(36).substr(2, 5),
        type: 'system',
        role: 'admin',
        title: 'Командный квест выполнен! 🏆',
        message: `Группа "${group.name}" выполнила квест "${quest.title}"! Все участники группы получили по +${quest.rewardXp} XP.`,
        timestamp: new Date().toISOString(),
        sentViaTelegram: false,
        status: 'sent'
      });
    }
    res.json({ success: true, quest, students, groups, notifications });
  } else {
    res.status(404).json({ error: 'Quest not found' });
  }
});

// Main AI analysis route
app.post('/api/reports', async (req, res) => {
  const { groupName, topic, teacherName, duration, rawText, isVoiceText } = req.body;

  if (!groupName || !topic || !rawText) {
    return res.status(400).json({ error: 'Missing required fields (groupName, topic, rawText)' });
  }

  const groupStudents = students.filter(s => s.groupName === groupName);

  let analyses: any[] = [];
  let geminiSuccess = false;
  let geminiErrorMessage = '';

  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: { 'User-Agent': 'aistudio-build' }
        }
      });

      const prompt = `
Ты — интеллектуальный ИИ-ассистент образовательной платформы "AI EdCenter Tracker". Твоя задача — проанализировать отчет преподавателя о сегодняшнем уроке и сгенерировать структурированную аналитику по каждому упомянутому в тексте студенту.

Группа: "${groupName}"
Тема урока: "${topic}"
Сводный текст отчета от преподавателя:
"${rawText}"

Список зарегистрированных студентов в этой группе:
${groupStudents.map(s => `- ${s.name} (id: ${s.id})`).join('\n')}

Сгенерируй строго JSON-массив результатов анализа. Каждый элемент массива должен соответствовать следующей схеме:
[{
  "studentName": string (должно точно совпадать с именем студента из списка выше),
  "studentId": string (должно точно совпасть с его id),
  "lessonTopic": string (тема сегодняшнего урока),
  "attendance": "present" | "absent" | "late",
  "grade": number (оценка от 1 до 5 за урок, где 5 - отлично, 4 - хорошо, 3 - средне, 1 - пропуск),
  "progressPercentage": number (число от 0 до 100, насколько студент усвоил тему),
  "strengths": string[] (массив сильных сторон продемонстрированных сегодня, например ["Отличное произношение", "Быстро понял циклы"]),
  "weakTopics": string[] (массив тем или навыков, вызвавших трудность сегодня, например ["Путает can и could", "Забыл двоеточие в синтаксисе"]),
  "recommendations": string[] (массив конкретных полезных рекомендаций на дом, например ["Посмотреть видео про условные операторы", "Выучить 5 неправильных глаголов"]),
  "achievementsUnlocked": string[] (массив названий открытых достижений, если у студента выдающийся результат сегодня, или пустой массив [])
}]

Важно:
1. Твой ответ должен состоять ИСКЛЮЧИТЕЛЬНО из JSON-массива. Никакого форматирования Markdown, никакого текста до или после JSON. Не оборачивай ответ в \`\`\`json ... \`\`\`. Строго валидный JSON.
2. Проанализируй упомянутых студентов. Если студент прямо не упомянут, сделай допущение на основе общей тональности и контекста отчета (если класс занимался отлично, поставь 4 или 5; если пропустил — отмeть "absent" со средним баллом 1-2).
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          temperature: 0.2,
          responseMimeType: 'application/json'
        }
      });

      if (response && response.text) {
        let textResult = response.text.trim();
        // Just in case markdown brackets are present
        if (textResult.startsWith('```json')) textResult = textResult.replace(/^```json/, '');
        if (textResult.endsWith('```')) textResult = textResult.replace(/```$/, '');
        textResult = textResult.trim();

        analyses = JSON.parse(textResult);
        geminiSuccess = true;
      }
    } catch (err: any) {
      console.error('Error with Gemini API, falling back to mock:', err);
      geminiErrorMessage = err.message || 'Gemini processing error';
    }
  }

  // Fallback if Gemini failed or wasn't configured
  if (!geminiSuccess) {
    analyses = getMockAnalysis(groupName, rawText, topic);
  }

  const currentDate = new Date().toISOString().split('T')[0];
  const newReport: any = {
    id: 'rep_' + Math.random().toString(36).substr(2, 5),
    date: currentDate,
    groupName,
    teacherName: teacherName || 'Анна Смирнова',
    topic,
    duration: duration || '60 минут',
    rawText,
    isVoiceText: !!isVoiceText,
    analyses
  };

  lessonReports.unshift(newReport);
  // Apply changes to database stats (xp, grades, level, risk, strengths...)
  applyAnalysisToDatabase(groupName, analyses, topic, currentDate);

  res.json({
    success: true,
    report: newReport,
    geminiSuccess,
    geminiErrorMessage,
    students,
    studentsProgress,
    notifications
  });
});

// Helper to lazy-initialize student mentor stats
function initStudentMentorStats(student: any) {
  if (!student.trustPoints) {
    student.trustPoints = { m1: 150, m2: 60, m3: 40, m4: 100, m5: 30 };
  }
  if (!student.completedMentorQuests) {
    student.completedMentorQuests = ['mq_m1_1'];
  }
  if (!student.unlockedItems) {
    student.unlockedItems = ['item-feather'];
  }
  if (!student.unlockedAchievements) {
    student.unlockedAchievements = ['ach_m1_1'];
  }
}

// GET mentor statistics for the teacher administration panel
app.get('/api/mentors/stats', (req, res) => {
  // Ensure students are initialized
  students.forEach(s => initStudentMentorStats(s));

  const stats = {
    m1: { count: 0, totalScore: 0, totalEngagement: 0, questsCompleted: 0, names: [] as string[] },
    m2: { count: 0, totalScore: 0, totalEngagement: 0, questsCompleted: 0, names: [] as string[] },
    m3: { count: 0, totalScore: 0, totalEngagement: 0, questsCompleted: 0, names: [] as string[] },
    m4: { count: 0, totalScore: 0, totalEngagement: 0, questsCompleted: 0, names: [] as string[] },
    m5: { count: 0, totalScore: 0, totalEngagement: 0, questsCompleted: 0, names: [] as string[] }
  };

  students.forEach(student => {
    const mId = (student.mentorId || 'm1') as keyof typeof stats;
    if (stats[mId]) {
      stats[mId].count++;
      stats[mId].totalScore += student.generalScore || 4.0;
      stats[mId].totalEngagement += student.engagementRate || 80;
      stats[mId].questsCompleted += (student.completedMentorQuests || []).length;
      stats[mId].names.push(student.name);
    }
  });

  const finalStats = Object.keys(stats).map(key => {
    const k = key as keyof typeof stats;
    const item = stats[k];
    const avgScore = item.count > 0 ? Number((item.totalScore / item.count).toFixed(2)) : 0;
    const avgEngagement = item.count > 0 ? Math.round(item.totalEngagement / item.count) : 0;
    
    // Mentor metadata helper
    const namesMap = {
      m1: 'Самрук (Хранитель Знаний)',
      m2: 'Алпамыс (Богатырь Духа)',
      m3: 'Томирис (Мудрая Царица)',
      m4: 'Барс (Креативный Программист)',
      m5: 'Хумо (Птица Вдохновения)'
    };

    return {
      id: k,
      name: namesMap[k] || k,
      choiceCount: item.count,
      popularityPercentage: Math.round((item.count / Math.max(students.length, 1)) * 100),
      avgGPA: avgScore || 4.2,
      avgEngagementRate: avgEngagement || 82,
      questsCompletedCount: item.questsCompleted,
      studentsList: item.names
    };
  });

  res.json({ success: true, stats: finalStats, totalStudentsCount: students.length });
});

// POST claim a mentor-specific quest
app.post('/api/students/:id/claim-mentor-quest', (req, res) => {
  const { id } = req.params;
  const { questId, rewardXp, trustReward, mentorId } = req.body;
  const student = students.find(s => s.id === id);

  if (student) {
    initStudentMentorStats(student);
    student.xp += (rewardXp || 120);
    student.level = Math.floor(student.xp / 400) + 1;
    
    // Ensure trustPoints has space
    if (!student.trustPoints) student.trustPoints = {};
    const curTrust = student.trustPoints[mentorId] || 0;
    student.trustPoints[mentorId] = curTrust + (trustReward || 35);

    // Save to completed tracking
    if (!student.completedMentorQuests) student.completedMentorQuests = [];
    if (!student.completedMentorQuests.includes(questId)) {
      student.completedMentorQuests.push(questId);
    }

    // Auto-unlock an achievement if trust is high enough
    const mTrust = student.trustPoints[mentorId];
    if (mTrust >= 200 && !student.unlockedAchievements.includes(`ach_${mentorId}_high`)) {
      student.unlockedAchievements.push(`ach_${mentorId}_high`);
      
      // Notify parent/teacher about this mentor breakthrough!
      const titleMap = {
        m1: 'Орден Высшего Познания Самрука',
        m2: 'Орден Золотого Щита Алпамыса',
        m3: 'Медаль Триумфа Томирис',
        m4: 'Орден Мастера Системы Барса',
        m5: 'Звезда Душевного Равновесия Хумо'
      };
      const badgeTitle = titleMap[mentorId as keyof typeof titleMap] || 'Почетный Золотой Символ';
      notifications.unshift({
        id: 'not_ach_' + Math.random().toString(36).substr(2, 5),
        type: 'system',
        role: 'parent',
        studentName: student.name,
        title: `🏆 Новая награда наставника!`,
        message: `${student.name} заслужил высшее доверие наставника и разблокировал достижение [ ${badgeTitle} ]!`,
        timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        sentViaTelegram: true,
        status: 'sent'
      });
    }

    res.json({ success: true, student });
  } else {
    res.status(404).json({ error: 'Student not found' });
  }
});

// POST purchase/unlock relic
app.post('/api/students/:id/unlock-relic', (req, res) => {
  const { id } = req.params;
  const { itemId, mentorId, costPoints } = req.body;
  const student = students.find(s => s.id === id);

  if (student) {
    initStudentMentorStats(student);
    const mTrust = student.trustPoints?.[mentorId] || 0;
    if (mTrust >= costPoints) {
      student.trustPoints[mentorId] = mTrust - costPoints;
      if (!student.unlockedItems) student.unlockedItems = [];
      if (!student.unlockedItems.includes(itemId)) {
        student.unlockedItems.push(itemId);
      }
      res.json({ success: true, student });
    } else {
      res.status(400).json({ error: 'Недостаточно очков доверия с наставником для покупки артефакта.' });
    }
  } else {
    res.status(404).json({ error: 'Student not found' });
  }
});

// POST claim seasonal milestone reward
app.post('/api/students/:id/claim-seasonal-reward', (req, res) => {
  const { id } = req.params;
  const { xpAmount, itemReward } = req.body;
  const student = students.find(s => s.id === id);

  if (student) {
    initStudentMentorStats(student);
    student.xp += (xpAmount || 200);
    student.level = Math.floor(student.xp / 400) + 1;

    if (itemReward) {
      if (!student.unlockedItems) student.unlockedItems = [];
      if (!student.unlockedItems.includes(itemReward)) {
        student.unlockedItems.push(itemReward);
      }
    }

    res.json({ success: true, student });
  } else {
    res.status(404).json({ error: 'Student not found' });
  }
});

// Hook existing student GET route to guarantee lazy initialization
app.get('/api/students/init-all', (req, res) => {
  students.forEach(s => initStudentMentorStats(s));
  res.json({ success: true, students });
});

// Direct level up simulation for students (easy playground action)
app.post('/api/students/:id/mentor', (req, res) => {
  const { id } = req.params;
  const { mentorId } = req.body;
  const student = students.find(s => s.id === id);
  if (student) {
    initStudentMentorStats(student);
    student.mentorId = mentorId || 'm1';
    res.json({ success: true, student });
  } else {
    res.status(404).json({ error: 'Student not found' });
  }
});

app.post('/api/students/level-up', (req, res) => {
  const { studentId, xp } = req.body;
  const student = students.find(s => s.id === studentId);
  if (student) {
    initStudentMentorStats(student);
    student.xp += (xp || 400);
    student.level = Math.floor(student.xp / 400) + 1;
    res.json({ success: true, student });
  } else {
    res.status(404).json({ error: 'Student not found' });
  }
});

// Handle serving the frontend app
const isProd = process.env.NODE_ENV === 'production';

async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Educational Tracking Server] Listening on http://localhost:${PORT}`);
  });
}

startServer();
