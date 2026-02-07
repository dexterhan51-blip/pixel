/**
 * Calculate growth points based on training duration (minutes).
 */
export function calculatePoints(duration) {
  if (duration < 20) return 0;
  if (duration < 60) return 1;
  if (duration < 90) return 2;
  return 3;
}

const LEVEL_TITLES = [
  { minLevel: 1, title: '루키' },
  { minLevel: 3, title: '도전자' },
  { minLevel: 5, title: '중급자' },
  { minLevel: 8, title: '상급자' },
  { minLevel: 12, title: '마스터' },
  { minLevel: 16, title: '챔피언' },
];

export function getLevelTitle(level) {
  for (let i = LEVEL_TITLES.length - 1; i >= 0; i--) {
    if (level >= LEVEL_TITLES[i].minLevel) {
      return LEVEL_TITLES[i].title;
    }
  }
  return '루키';
}

/**
 * Calculate training streak from logs.
 * "Rest day" rule: allows 1 rest day per week without breaking the streak.
 */
export function calculateStreak(logs) {
  if (!Array.isArray(logs) || logs.length === 0) {
    return { current: 0, longest: 0, thisWeek: 0 };
  }

  // Get unique training dates sorted descending
  const dateSet = new Set(logs.map(l => l.date));
  const sortedDates = [...dateSet].sort((a, b) => b.localeCompare(a));

  // Calculate this week's training days
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfWeekStr = startOfWeek.toISOString().split('T')[0];
  const thisWeek = sortedDates.filter(d => d >= startOfWeekStr).length;

  // Calculate current streak (with rest day tolerance)
  const todayStr = now.toISOString().split('T')[0];
  const yesterdayStr = new Date(now.getTime() - 86400000).toISOString().split('T')[0];

  let current = 0;
  let checkDate = dateSet.has(todayStr) ? new Date(now) : dateSet.has(yesterdayStr) ? new Date(now.getTime() - 86400000) : null;

  if (checkDate) {
    let consecutiveRest = 0;
    let d = new Date(checkDate);
    while (true) {
      const ds = d.toISOString().split('T')[0];
      if (dateSet.has(ds)) {
        current++;
        consecutiveRest = 0;
      } else {
        consecutiveRest++;
        if (consecutiveRest > 1) break;
      }
      d.setDate(d.getDate() - 1);
      // Safety limit
      if (current + consecutiveRest > 400) break;
    }
  }

  // Calculate longest streak (with same rest day tolerance)
  let longest = 0;
  if (sortedDates.length > 0) {
    const allDates = [...dateSet].sort((a, b) => a.localeCompare(b));
    const firstDate = new Date(allDates[0]);
    const lastDate = new Date(allDates[allDates.length - 1]);

    let streak = 0;
    let consecutiveRest = 0;
    let d = new Date(firstDate);
    while (d <= lastDate) {
      const ds = d.toISOString().split('T')[0];
      if (dateSet.has(ds)) {
        streak++;
        consecutiveRest = 0;
      } else {
        consecutiveRest++;
        if (consecutiveRest > 1) {
          longest = Math.max(longest, streak);
          streak = 0;
          consecutiveRest = 0;
        }
      }
      d.setDate(d.getDate() + 1);
    }
    longest = Math.max(longest, streak);
  }

  return { current, longest, thisWeek };
}

/**
 * Calculate achievements based on logs, level, and stats.
 */
export function calculateAchievements(logs, level, stats) {
  const safeLogs = Array.isArray(logs) ? logs : [];
  const totalMinutes = safeLogs.reduce((sum, l) => sum + (l.duration || 0), 0);
  const streak = calculateStreak(safeLogs);

  const hasLesson = safeLogs.some(l => l.type === 'lesson');
  const hasGame = safeLogs.some(l => l.type === 'game');
  const hasPractice = safeLogs.some(l => l.type === 'practice');

  return [
    // Level-based (existing)
    { id: 'lv1', title: '테니스 입문', desc: '레벨 1 달성', unlocked: level >= 1, category: 'level' },
    { id: 'lv3', title: '꾸준함의 시작', desc: '레벨 3 달성', unlocked: level >= 3, category: 'level' },
    { id: 'lv5', title: '중급자의 길', desc: '레벨 5 달성', unlocked: level >= 5, category: 'level' },
    { id: 'lv10', title: '코트의 지배자', desc: '레벨 10 달성', unlocked: level >= 10, category: 'level' },
    // Streak-based (new)
    { id: 'streak3', title: '3일 연속', desc: '3일 스트릭 달성', unlocked: streak.longest >= 3, category: 'streak' },
    { id: 'streak7', title: '일주일 개근', desc: '7일 스트릭 달성', unlocked: streak.longest >= 7, category: 'streak' },
    { id: 'streak30', title: '한 달의 습관', desc: '30일 스트릭 달성', unlocked: streak.longest >= 30, category: 'streak' },
    // Count-based (new)
    { id: 'first', title: '첫 발걸음', desc: '첫 기록 달성', unlocked: safeLogs.length >= 1, category: 'count' },
    { id: 'log10', title: '10회 달성', desc: '10개 기록 달성', unlocked: safeLogs.length >= 10, category: 'count' },
    { id: 'log50', title: '50회 달성', desc: '50개 기록 달성', unlocked: safeLogs.length >= 50, category: 'count' },
    { id: 'hour100', title: '100시간 클럽', desc: '총 운동 100시간 달성', unlocked: totalMinutes >= 6000, category: 'count' },
    // Diversity (new)
    { id: 'allrounder', title: '올라운더', desc: '레슨+경기+연습 각 1회 이상', unlocked: hasLesson && hasGame && hasPractice, category: 'diversity' },
  ];
}

/**
 * Aggregate logs by month for the last N months.
 */
export function aggregateByMonth(logs, months = 6) {
  const safeLogs = Array.isArray(logs) ? logs : [];
  const now = new Date();
  const result = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthLogs = safeLogs.filter(l => l.date && l.date.startsWith(yearMonth));
    const totalMinutes = monthLogs.reduce((sum, l) => sum + (l.duration || 0), 0);
    result.push({
      month: `${d.getMonth() + 1}월`,
      yearMonth,
      totalMinutes,
      count: monthLogs.length,
    });
  }

  return result;
}

/**
 * Aggregate logs by date (total minutes per date).
 */
export function aggregateByDate(logs) {
  const safeLogs = Array.isArray(logs) ? logs : [];
  const map = new Map();
  safeLogs.forEach(l => {
    if (!l.date) return;
    map.set(l.date, (map.get(l.date) || 0) + (l.duration || 0));
  });
  return map;
}
