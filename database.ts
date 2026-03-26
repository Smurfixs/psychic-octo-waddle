// ==========================================
// ТИПЫ ДАННЫХ (Логическая структура БД)
// ==========================================

export interface User {
  id: number;
  username: string;
  password: string;
  fullName: string;
  role: 'admin' | 'engineer' | 'operator';
  email: string;
  createdAt: string;
}

export interface Roll {
  id: number;
  number: string;
  steelGrade: string;
  thickness: number;
  width: number;
  weight: number;
  productionDate: string;
}

export interface Defect {
  id: number;
  rollId: number;
  type: string;
  criticality: 'critical' | 'major' | 'minor';
  status: 'open' | 'in_progress' | 'resolved';
  position: number;
  description: string;
  createdAt: string;
  createdBy: number;
}

export interface SystemEvent {
  id: number;
  type: 'info' | 'warning' | 'error' | 'action';
  description: string;
  userId: number;
  userName: string;
  createdAt: string;
}

// ==========================================
// CRUD ОПЕРАЦИИ С LOCALSTORAGE
// ==========================================

function getCollection<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveCollection<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function getNextId(key: string): number {
  const items = getCollection<{ id: number }>(key);
  return items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
}

// --- Users ---
export const UsersDB = {
  getAll: (): User[] => getCollection<User>('skk_users'),
  getById: (id: number): User | undefined => getCollection<User>('skk_users').find(u => u.id === id),
  getByUsername: (username: string): User | undefined => getCollection<User>('skk_users').find(u => u.username === username),
  create: (user: Omit<User, 'id' | 'createdAt'>): User => {
    const users = getCollection<User>('skk_users');
    const newUser: User = { ...user, id: getNextId('skk_users'), createdAt: new Date().toISOString() };
    users.push(newUser);
    saveCollection('skk_users', users);
    return newUser;
  },
  update: (id: number, data: Partial<User>): void => {
    const users = getCollection<User>('skk_users');
    const idx = users.findIndex(u => u.id === id);
    if (idx !== -1) { users[idx] = { ...users[idx], ...data }; saveCollection('skk_users', users); }
  },
  delete: (id: number): void => {
    saveCollection('skk_users', getCollection<User>('skk_users').filter(u => u.id !== id));
  },
};

// --- Rolls ---
export const RollsDB = {
  getAll: (): Roll[] => getCollection<Roll>('skk_rolls'),
  getById: (id: number): Roll | undefined => getCollection<Roll>('skk_rolls').find(r => r.id === id),
  getByNumber: (num: string): Roll | undefined => getCollection<Roll>('skk_rolls').find(r => r.number === num),
  create: (roll: Omit<Roll, 'id'>): Roll => {
    const rolls = getCollection<Roll>('skk_rolls');
    const newRoll: Roll = { ...roll, id: getNextId('skk_rolls') };
    rolls.push(newRoll);
    saveCollection('skk_rolls', rolls);
    return newRoll;
  },
  update: (id: number, data: Partial<Roll>): void => {
    const rolls = getCollection<Roll>('skk_rolls');
    const idx = rolls.findIndex(r => r.id === id);
    if (idx !== -1) { rolls[idx] = { ...rolls[idx], ...data }; saveCollection('skk_rolls', rolls); }
  },
  delete: (id: number): void => {
    saveCollection('skk_rolls', getCollection<Roll>('skk_rolls').filter(r => r.id !== id));
  },
};

// --- Defects ---
export const DefectsDB = {
  getAll: (): Defect[] => getCollection<Defect>('skk_defects'),
  getById: (id: number): Defect | undefined => getCollection<Defect>('skk_defects').find(d => d.id === id),
  getByRollId: (rollId: number): Defect[] => getCollection<Defect>('skk_defects').filter(d => d.rollId === rollId),
  create: (defect: Omit<Defect, 'id' | 'createdAt'>): Defect => {
    const defects = getCollection<Defect>('skk_defects');
    const newDefect: Defect = { ...defect, id: getNextId('skk_defects'), createdAt: new Date().toISOString() };
    defects.push(newDefect);
    saveCollection('skk_defects', defects);
    return newDefect;
  },
  update: (id: number, data: Partial<Defect>): void => {
    const defects = getCollection<Defect>('skk_defects');
    const idx = defects.findIndex(d => d.id === id);
    if (idx !== -1) { defects[idx] = { ...defects[idx], ...data }; saveCollection('skk_defects', defects); }
  },
  delete: (id: number): void => {
    saveCollection('skk_defects', getCollection<Defect>('skk_defects').filter(d => d.id !== id));
  },
  // Запрос на выборку по заданному условию
  filterByCriticality: (crit: string): Defect[] => getCollection<Defect>('skk_defects').filter(d => d.criticality === crit),
  // Запрос на выборку по параметрам
  filterByParams: (params: { dateFrom?: string; dateTo?: string; rollId?: number; criticality?: string; status?: string }): Defect[] => {
    return getCollection<Defect>('skk_defects').filter(d => {
      if (params.dateFrom && d.createdAt < params.dateFrom) return false;
      if (params.dateTo && d.createdAt > params.dateTo + 'T23:59:59') return false;
      if (params.rollId && d.rollId !== params.rollId) return false;
      if (params.criticality && d.criticality !== params.criticality) return false;
      if (params.status && d.status !== params.status) return false;
      return true;
    });
  },
  // Итоговый (групповой) запрос — по критичности
  countByCriticality: (): Record<string, number> => {
    const defects = getCollection<Defect>('skk_defects');
    return defects.reduce((acc, d) => { acc[d.criticality] = (acc[d.criticality] || 0) + 1; return acc; }, {} as Record<string, number>);
  },
  // Итоговый (групповой) запрос — по типу
  countByType: (): Record<string, number> => {
    const defects = getCollection<Defect>('skk_defects');
    return defects.reduce((acc, d) => { acc[d.type] = (acc[d.type] || 0) + 1; return acc; }, {} as Record<string, number>);
  },
  // Итоговый (групповой) запрос — по статусу
  countByStatus: (): Record<string, number> => {
    const defects = getCollection<Defect>('skk_defects');
    return defects.reduce((acc, d) => { acc[d.status] = (acc[d.status] || 0) + 1; return acc; }, {} as Record<string, number>);
  },
};

// --- Events ---
export const EventsDB = {
  getAll: (): SystemEvent[] => getCollection<SystemEvent>('skk_events'),
  create: (event: Omit<SystemEvent, 'id' | 'createdAt'>): SystemEvent => {
    const events = getCollection<SystemEvent>('skk_events');
    const newEvent: SystemEvent = { ...event, id: getNextId('skk_events'), createdAt: new Date().toISOString() };
    events.push(newEvent);
    saveCollection('skk_events', events);
    return newEvent;
  },
  filterByParams: (params: { type?: string; dateFrom?: string; dateTo?: string }): SystemEvent[] => {
    return getCollection<SystemEvent>('skk_events').filter(e => {
      if (params.type && e.type !== params.type) return false;
      if (params.dateFrom && e.createdAt < params.dateFrom) return false;
      if (params.dateTo && e.createdAt > params.dateTo + 'T23:59:59') return false;
      return true;
    });
  },
};

// ==========================================
// ЛОГИРОВАНИЕ СОБЫТИЙ
// ==========================================
export function logEvent(type: SystemEvent['type'], description: string, user?: User): void {
  EventsDB.create({
    type,
    description,
    userId: user?.id || 0,
    userName: user?.fullName || 'Система',
  });
}

// ==========================================
// ТЕСТОВЫЕ ДАННЫЕ
// ==========================================
export function seedTestData(): void {
  // Очистка
  localStorage.removeItem('skk_users');
  localStorage.removeItem('skk_rolls');
  localStorage.removeItem('skk_defects');
  localStorage.removeItem('skk_events');

  // Пользователи
  const users: User[] = [
    { id: 1, username: 'admin', password: 'admin123', fullName: 'Петров Алексей Иванович', role: 'admin', email: 'petrov@nlmk.com', createdAt: '2024-01-15T08:00:00' },
    { id: 2, username: 'engineer1', password: 'eng123', fullName: 'Сидорова Мария Петровна', role: 'engineer', email: 'sidorova@nlmk.com', createdAt: '2024-02-10T09:30:00' },
    { id: 3, username: 'operator1', password: 'op123', fullName: 'Козлов Дмитрий Сергеевич', role: 'operator', email: 'kozlov@nlmk.com', createdAt: '2024-03-05T10:00:00' },
    { id: 4, username: 'engineer2', password: 'eng456', fullName: 'Новикова Елена Александровна', role: 'engineer', email: 'novikova@nlmk.com', createdAt: '2024-03-20T08:45:00' },
    { id: 5, username: 'operator2', password: 'op456', fullName: 'Морозов Андрей Викторович', role: 'operator', email: 'morozov@nlmk.com', createdAt: '2024-04-01T07:30:00' },
  ];
  saveCollection('skk_users', users);

  // Рулоны
  const rolls: Roll[] = [
    { id: 1, number: 'R-2024-0145', steelGrade: 'Ст3сп', thickness: 0.8, width: 1250, weight: 12.5, productionDate: '2024-11-01' },
    { id: 2, number: 'R-2024-0146', steelGrade: '08пс', thickness: 1.0, width: 1500, weight: 15.3, productionDate: '2024-11-01' },
    { id: 3, number: 'R-2024-0147', steelGrade: 'Ст3сп', thickness: 0.5, width: 1000, weight: 8.7, productionDate: '2024-11-02' },
    { id: 4, number: 'R-2024-0148', steelGrade: '09Г2С', thickness: 2.0, width: 1500, weight: 22.1, productionDate: '2024-11-02' },
    { id: 5, number: 'R-2024-0149', steelGrade: '08пс', thickness: 0.7, width: 1250, weight: 10.2, productionDate: '2024-11-03' },
    { id: 6, number: 'R-2024-0150', steelGrade: '10ХСНД', thickness: 1.5, width: 1800, weight: 28.4, productionDate: '2024-11-03' },
    { id: 7, number: 'R-2024-0151', steelGrade: 'Ст3сп', thickness: 1.2, width: 1250, weight: 16.8, productionDate: '2024-11-04' },
    { id: 8, number: 'R-2024-0152', steelGrade: '09Г2С', thickness: 0.6, width: 1000, weight: 7.5, productionDate: '2024-11-04' },
    { id: 9, number: 'R-2024-0153', steelGrade: '08пс', thickness: 1.8, width: 1500, weight: 25.0, productionDate: '2024-11-05' },
    { id: 10, number: 'R-2024-0154', steelGrade: 'Ст3сп', thickness: 0.9, width: 1250, weight: 11.3, productionDate: '2024-11-05' },
    { id: 11, number: 'R-2024-0155', steelGrade: '10ХСНД', thickness: 2.5, width: 1800, weight: 32.0, productionDate: '2024-11-06' },
    { id: 12, number: 'R-2024-0156', steelGrade: '09Г2С', thickness: 1.0, width: 1500, weight: 18.6, productionDate: '2024-11-06' },
  ];
  saveCollection('skk_rolls', rolls);

  // Дефекты
  const defects: Defect[] = [
    { id: 1, rollId: 1, type: 'Царапина', criticality: 'minor', status: 'resolved', position: 125.5, description: 'Поверхностная царапина длиной 15 мм на верхней стороне полосы', createdAt: '2024-11-01T10:15:00', createdBy: 3 },
    { id: 2, rollId: 1, type: 'Вмятина', criticality: 'major', status: 'resolved', position: 340.2, description: 'Вмятина диаметром 8 мм, глубина 0.3 мм', createdAt: '2024-11-01T10:45:00', createdBy: 3 },
    { id: 3, rollId: 2, type: 'Трещина', criticality: 'critical', status: 'in_progress', position: 89.0, description: 'Поперечная трещина длиной 25 мм на кромке рулона', createdAt: '2024-11-01T14:20:00', createdBy: 5 },
    { id: 4, rollId: 2, type: 'Коррозия', criticality: 'major', status: 'open', position: 560.8, description: 'Участок коррозии площадью 50х30 мм', createdAt: '2024-11-01T15:10:00', createdBy: 3 },
    { id: 5, rollId: 3, type: 'Плена', criticality: 'critical', status: 'resolved', position: 200.0, description: 'Плена длиной 40 мм, нарушение поверхности', createdAt: '2024-11-02T09:30:00', createdBy: 5 },
    { id: 6, rollId: 4, type: 'Расслоение', criticality: 'critical', status: 'open', position: 45.3, description: 'Расслоение кромки на участке 100 мм', createdAt: '2024-11-02T11:00:00', createdBy: 3 },
    { id: 7, rollId: 4, type: 'Царапина', criticality: 'minor', status: 'resolved', position: 780.1, description: 'Мелкая продольная царапина', createdAt: '2024-11-02T13:45:00', createdBy: 5 },
    { id: 8, rollId: 5, type: 'Закат', criticality: 'major', status: 'in_progress', position: 312.7, description: 'Закат на поверхности длиной 20 мм', createdAt: '2024-11-03T08:20:00', createdBy: 3 },
    { id: 9, rollId: 6, type: 'Риска', criticality: 'minor', status: 'open', position: 156.9, description: 'Продольная риска на нижней поверхности', createdAt: '2024-11-03T10:55:00', createdBy: 5 },
    { id: 10, rollId: 6, type: 'Трещина', criticality: 'critical', status: 'in_progress', position: 890.4, description: 'Продольная трещина длиной 35 мм в центральной части', createdAt: '2024-11-03T14:30:00', createdBy: 3 },
    { id: 11, rollId: 7, type: 'Вмятина', criticality: 'minor', status: 'resolved', position: 445.6, description: 'Небольшая вмятина от валка', createdAt: '2024-11-04T09:10:00', createdBy: 5 },
    { id: 12, rollId: 8, type: 'Коррозия', criticality: 'major', status: 'open', position: 67.2, description: 'Начальная стадия коррозии на кромке', createdAt: '2024-11-04T11:25:00', createdBy: 3 },
    { id: 13, rollId: 9, type: 'Плена', criticality: 'major', status: 'resolved', position: 523.8, description: 'Плена с отслоением на площади 20х15 мм', createdAt: '2024-11-05T10:00:00', createdBy: 5 },
    { id: 14, rollId: 10, type: 'Царапина', criticality: 'minor', status: 'resolved', position: 234.1, description: 'Технологическая царапина от направляющей', createdAt: '2024-11-05T13:40:00', createdBy: 3 },
    { id: 15, rollId: 11, type: 'Расслоение', criticality: 'critical', status: 'open', position: 178.5, description: 'Расслоение по толщине на участке 60 мм', createdAt: '2024-11-06T08:50:00', createdBy: 5 },
    { id: 16, rollId: 12, type: 'Закат', criticality: 'minor', status: 'in_progress', position: 401.3, description: 'Мелкий закат на поверхности', createdAt: '2024-11-06T11:15:00', createdBy: 3 },
    { id: 17, rollId: 12, type: 'Трещина', criticality: 'critical', status: 'open', position: 612.0, description: 'Поперечная микротрещина на кромке', createdAt: '2024-11-06T14:00:00', createdBy: 5 },
    { id: 18, rollId: 3, type: 'Вмятина', criticality: 'minor', status: 'resolved', position: 88.4, description: 'Точечная вмятина от окалины', createdAt: '2024-11-02T10:20:00', createdBy: 3 },
    { id: 19, rollId: 7, type: 'Коррозия', criticality: 'major', status: 'in_progress', position: 290.0, description: 'Пятно коррозии 30х20 мм на верхней стороне', createdAt: '2024-11-04T15:30:00', createdBy: 5 },
    { id: 20, rollId: 9, type: 'Риска', criticality: 'minor', status: 'open', position: 715.6, description: 'Множественные мелкие риски от транспортировки', createdAt: '2024-11-05T16:00:00', createdBy: 3 },
  ];
  saveCollection('skk_defects', defects);

  // События
  const events: SystemEvent[] = [
    { id: 1, type: 'info', description: 'Система запущена', userId: 1, userName: 'Петров А.И.', createdAt: '2024-11-01T08:00:00' },
    { id: 2, type: 'action', description: 'Загружены данные рулона R-2024-0145', userId: 3, userName: 'Козлов Д.С.', createdAt: '2024-11-01T08:15:00' },
    { id: 3, type: 'warning', description: 'Обнаружен критический дефект на рулоне R-2024-0146', userId: 5, userName: 'Морозов А.В.', createdAt: '2024-11-01T14:20:00' },
    { id: 4, type: 'action', description: 'Создан отчёт по дефектам за 01.11.2024', userId: 2, userName: 'Сидорова М.П.', createdAt: '2024-11-01T17:00:00' },
    { id: 5, type: 'info', description: 'Смена оператора: Козлов Д.С. → Морозов А.В.', userId: 1, userName: 'Петров А.И.', createdAt: '2024-11-02T08:00:00' },
    { id: 6, type: 'error', description: 'Ошибка калибровки датчика толщины #3', userId: 0, userName: 'Система', createdAt: '2024-11-02T09:15:00' },
    { id: 7, type: 'action', description: 'Дефект #5 устранён, рулон R-2024-0147 допущен', userId: 2, userName: 'Сидорова М.П.', createdAt: '2024-11-02T14:30:00' },
    { id: 8, type: 'warning', description: 'Критический дефект на рулоне R-2024-0148: расслоение', userId: 3, userName: 'Козлов Д.С.', createdAt: '2024-11-02T11:00:00' },
    { id: 9, type: 'action', description: 'Добавлен новый оператор: Морозов А.В.', userId: 1, userName: 'Петров А.И.', createdAt: '2024-11-03T08:00:00' },
    { id: 10, type: 'info', description: 'Плановое техобслуживание линии завершено', userId: 2, userName: 'Сидорова М.П.', createdAt: '2024-11-03T12:00:00' },
    { id: 11, type: 'warning', description: 'Превышение допуска по толщине на рулоне R-2024-0150', userId: 5, userName: 'Морозов А.В.', createdAt: '2024-11-03T14:30:00' },
    { id: 12, type: 'action', description: 'Сформирован суточный отчёт за 03.11.2024', userId: 2, userName: 'Сидорова М.П.', createdAt: '2024-11-03T18:00:00' },
    { id: 13, type: 'error', description: 'Потеря связи с датчиком дефектоскопии на 5 минут', userId: 0, userName: 'Система', createdAt: '2024-11-04T10:30:00' },
    { id: 14, type: 'action', description: 'Статус дефекта #8 изменён на "В работе"', userId: 2, userName: 'Сидорова М.П.', createdAt: '2024-11-04T11:00:00' },
    { id: 15, type: 'info', description: 'Выпущено 12 рулонов, план выполнен на 100%', userId: 1, userName: 'Петров А.И.', createdAt: '2024-11-06T18:00:00' },
  ];
  saveCollection('skk_events', events);
}

// ==========================================
// ВЫЧИСЛЯЕМЫЕ ЗАПРОСЫ (Запросы с вычисляемыми полями)
// ==========================================

// Рулоны с количеством дефектов (вычисляемое поле)
export function getRollsWithDefectCount(): (Roll & { defectCount: number; criticalCount: number })[] {
  const rolls = RollsDB.getAll();
  const defects = DefectsDB.getAll();
  return rolls.map(r => ({
    ...r,
    defectCount: defects.filter(d => d.rollId === r.id).length,
    criticalCount: defects.filter(d => d.rollId === r.id && d.criticality === 'critical').length,
  }));
}

// Статистика дашборда (итоговый/групповой запрос)
export function getDashboardStats() {
  const rolls = RollsDB.getAll();
  const defects = DefectsDB.getAll();
  const totalDefects = defects.length;
  const criticalDefects = defects.filter(d => d.criticality === 'critical').length;
  const resolvedDefects = defects.filter(d => d.status === 'resolved').length;
  const resolvedPercent = totalDefects > 0 ? Math.round((resolvedDefects / totalDefects) * 100) : 0;
  return {
    totalRolls: rolls.length,
    totalDefects,
    criticalDefects,
    resolvedPercent,
  };
}

// Статистика за период (для отчёта)
export function getStatisticsForPeriod(dateFrom?: string, dateTo?: string) {
  const defects = DefectsDB.getAll().filter(d => {
    if (dateFrom && d.createdAt < dateFrom) return false;
    if (dateTo && d.createdAt > dateTo + 'T23:59:59') return false;
    return true;
  });

  const byCriticality = defects.reduce((acc, d) => {
    acc[d.criticality] = (acc[d.criticality] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byType = defects.reduce((acc, d) => {
    acc[d.type] = (acc[d.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byStatus = defects.reduce((acc, d) => {
    acc[d.status] = (acc[d.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return { total: defects.length, byCriticality, byType, byStatus, defects };
}

// Инициализация (создание admin если пусто)
export function initDatabase(): void {
  const users = UsersDB.getAll();
  if (users.length === 0) {
    seedTestData();
  }
}

// Форматирование даты
export function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch { return dateStr; }
}

export function formatDateTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return dateStr; }
}

// Названия
export const criticalityNames: Record<string, string> = {
  critical: 'Критический',
  major: 'Значительный',
  minor: 'Незначительный',
};

export const statusNames: Record<string, string> = {
  open: 'Открыт',
  in_progress: 'В работе',
  resolved: 'Устранён',
};

export const roleNames: Record<string, string> = {
  admin: 'Администратор',
  engineer: 'Инженер',
  operator: 'Оператор',
};

export const eventTypeNames: Record<string, string> = {
  info: 'Информация',
  warning: 'Предупреждение',
  error: 'Ошибка',
  action: 'Действие',
};
