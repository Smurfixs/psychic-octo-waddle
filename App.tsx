import { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, AlertTriangle, Database, Calendar, FileText, Users, Settings, LogOut,
  Menu, X, Plus, Search, Filter, Printer, Trash2, Edit3, Eye, CheckCircle,
  XCircle, Activity, BarChart3, Shield, TrendingUp, RefreshCw, Download
} from 'lucide-react';
import {
  initDatabase, UsersDB, RollsDB, DefectsDB, EventsDB, logEvent,
  getDashboardStats, getRollsWithDefectCount, getStatisticsForPeriod, seedTestData,
  formatDate, formatDateTime, criticalityNames, statusNames, roleNames, eventTypeNames,
  type User, type Roll, type Defect, type SystemEvent
} from './database';

// ==========================================
// ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ
// ==========================================

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg"><X size={20} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function CriticalityBadge({ value }: { value: string }) {
  const cls = value === 'critical' ? 'badge-critical' : value === 'major' ? 'badge-major' : 'badge-minor';
  return <span className={`badge ${cls}`}>{criticalityNames[value] || value}</span>;
}

function StatusBadge({ value }: { value: string }) {
  const cls = value === 'open' ? 'badge-open' : value === 'in_progress' ? 'badge-in-progress' : 'badge-resolved';
  return <span className={`badge ${cls}`}>{statusNames[value] || value}</span>;
}

function EventTypeBadge({ value }: { value: string }) {
  const colors: Record<string, string> = {
    info: 'bg-blue-100 text-blue-700',
    warning: 'bg-amber-100 text-amber-700',
    error: 'bg-red-100 text-red-700',
    action: 'bg-emerald-100 text-emerald-700',
  };
  return <span className={`badge ${colors[value] || 'bg-slate-100 text-slate-600'}`}>{eventTypeNames[value] || value}</span>;
}

function EmptyState({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="text-center py-12 text-slate-400">
      <Icon size={48} className="mx-auto mb-3 opacity-50" />
      <p>{text}</p>
    </div>
  );
}

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'info'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  const bg = type === 'success' ? 'bg-emerald-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
  return (
    <div className={`fixed top-4 right-4 z-[100] ${bg} text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-[slideIn_0.3s_ease]`}>
      {type === 'success' ? <CheckCircle size={18} /> : type === 'error' ? <XCircle size={18} /> : <Activity size={18} />}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-80"><X size={16} /></button>
    </div>
  );
}

// ==========================================
// СТРАНИЦА ВХОДА
// ==========================================
function LoginPage({ onLogin }: { onLogin: (user: User) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = UsersDB.getByUsername(username);
    if (user && user.password === password) {
      onLogin(user);
    } else {
      setError('Неверный логин или пароль');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/30">
            <Shield size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">СКК ПАО «НЛМК»</h1>
          <p className="text-blue-300 text-sm">Система контроля качества металлопродукции</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <div className="mb-5">
            <label className="block text-sm text-blue-200 mb-2">Логин</label>
            <input type="text" value={username} onChange={e => { setUsername(e.target.value); setError(''); }}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Введите логин" />
          </div>
          <div className="mb-6">
            <label className="block text-sm text-blue-200 mb-2">Пароль</label>
            <input type="password" value={password} onChange={e => { setPassword(e.target.value); setError(''); }}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Введите пароль" />
          </div>
          {error && <p className="text-red-400 text-sm mb-4 flex items-center gap-2"><XCircle size={16} />{error}</p>}
          <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors">
            Войти в систему
          </button>
          <div className="mt-5 p-3 bg-white/5 rounded-lg">
            <p className="text-blue-300/70 text-xs text-center">Тестовый вход: admin / admin123</p>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// ПАНЕЛЬ УПРАВЛЕНИЯ (DASHBOARD)
// ==========================================
function DashboardPage(_props: { currentUser: User }) {
  const stats = getDashboardStats();
  const defects = DefectsDB.getAll();
  const rolls = RollsDB.getAll();
  const recentDefects = [...defects].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8);

  const byCriticality = DefectsDB.countByCriticality();
  const byStatus = DefectsDB.countByStatus();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Панель управления</h1>
          <p className="text-slate-500 text-sm mt-1">Обзор системы контроля качества</p>
        </div>
        <div className="text-right text-sm text-slate-500">
          <p>{new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      {/* Статус линии */}
      <div className="card bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity size={20} />
              <h4 className="font-semibold">Статус линии</h4>
            </div>
            <p className="text-emerald-100">Работает в штатном режиме</p>
          </div>
          <div className="flex gap-6 text-sm">
            <div className="text-center">
              <p className="text-emerald-200">Текущий рулон</p>
              <p className="font-bold text-lg">{rolls.length > 0 ? rolls[rolls.length - 1].number : '—'}</p>
            </div>
            <div className="text-center">
              <p className="text-emerald-200">Скорость линии</p>
              <p className="font-bold text-lg">850 м/мин</p>
            </div>
          </div>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-500 text-sm font-medium">Всего рулонов</span>
            <Database size={20} className="text-blue-500" />
          </div>
          <h3 className="text-3xl font-bold text-slate-800">{stats.totalRolls}</h3>
          <p className="text-xs text-slate-400 mt-1">Загружено в систему</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-500 text-sm font-medium">Всего дефектов</span>
            <AlertTriangle size={20} className="text-amber-500" />
          </div>
          <h3 className="text-3xl font-bold text-slate-800">{stats.totalDefects}</h3>
          <p className="text-xs text-slate-400 mt-1">Зарегистрировано</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-500 text-sm font-medium">Критических</span>
            <XCircle size={20} className="text-red-500" />
          </div>
          <h3 className="text-3xl font-bold text-red-600">{stats.criticalDefects}</h3>
          <p className="text-xs text-slate-400 mt-1">Требуют внимания</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-500 text-sm font-medium">Устранено</span>
            <CheckCircle size={20} className="text-emerald-500" />
          </div>
          <h3 className="text-3xl font-bold text-emerald-600">{stats.resolvedPercent}%</h3>
          <p className="text-xs text-slate-400 mt-1">От общего числа</p>
        </div>
      </div>

      {/* Сводка по критичности и статусу */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2"><BarChart3 size={18} /> Дефекты по критичности</h3>
          <div className="space-y-3">
            {['critical', 'major', 'minor'].map(c => {
              const count = byCriticality[c] || 0;
              const pct = stats.totalDefects > 0 ? Math.round((count / stats.totalDefects) * 100) : 0;
              const color = c === 'critical' ? 'bg-red-500' : c === 'major' ? 'bg-amber-500' : 'bg-blue-500';
              return (
                <div key={c}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">{criticalityNames[c]}</span>
                    <span className="font-medium text-slate-700">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full"><div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} /></div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="card">
          <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2"><TrendingUp size={18} /> Дефекты по статусу</h3>
          <div className="space-y-3">
            {['open', 'in_progress', 'resolved'].map(s => {
              const count = byStatus[s] || 0;
              const pct = stats.totalDefects > 0 ? Math.round((count / stats.totalDefects) * 100) : 0;
              const color = s === 'open' ? 'bg-red-500' : s === 'in_progress' ? 'bg-amber-500' : 'bg-emerald-500';
              return (
                <div key={s}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">{statusNames[s]}</span>
                    <span className="font-medium text-slate-700">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full"><div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} /></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Последние дефекты */}
      <div className="card">
        <h3 className="font-semibold text-slate-700 mb-4">Последние зарегистрированные дефекты</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr><th>ID</th><th>Рулон</th><th>Тип</th><th>Критичность</th><th>Статус</th><th>Дата</th></tr>
            </thead>
            <tbody>
              {recentDefects.map(d => {
                const roll = RollsDB.getById(d.rollId);
                return (
                  <tr key={d.id}>
                    <td className="font-mono text-xs">#{d.id}</td>
                    <td className="font-medium">{roll?.number || '—'}</td>
                    <td>{d.type}</td>
                    <td><CriticalityBadge value={d.criticality} /></td>
                    <td><StatusBadge value={d.status} /></td>
                    <td className="text-slate-500 text-xs">{formatDateTime(d.createdAt)}</td>
                  </tr>
                );
              })}
              {recentDefects.length === 0 && <tr><td colSpan={6}><EmptyState icon={AlertTriangle} text="Дефекты не зарегистрированы" /></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// СТРАНИЦА ДЕФЕКТОВ
// ==========================================
function DefectsPage({ currentUser, showToast }: { currentUser: User; showToast: (msg: string, type: 'success' | 'error' | 'info') => void }) {
  const [defects, setDefects] = useState<Defect[]>([]);
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', rollId: '', criticality: '', status: '' });
  const [showModal, setShowModal] = useState(false);
  const [editingDefect, setEditingDefect] = useState<Defect | null>(null);
  const [form, setForm] = useState({ rollId: '', type: 'Царапина', criticality: 'minor', status: 'open', position: '', description: '' });

  const rolls = RollsDB.getAll();

  const loadDefects = useCallback(() => {
    const params: any = {};
    if (filters.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters.dateTo) params.dateTo = filters.dateTo;
    if (filters.rollId) params.rollId = Number(filters.rollId);
    if (filters.criticality) params.criticality = filters.criticality;
    if (filters.status) params.status = filters.status;
    const hasFilters = Object.keys(params).length > 0;
    setDefects(hasFilters ? DefectsDB.filterByParams(params) : DefectsDB.getAll());
  }, [filters]);

  useEffect(() => { loadDefects(); }, [loadDefects]);

  const openCreate = () => {
    setEditingDefect(null);
    setForm({ rollId: rolls[0]?.id.toString() || '', type: 'Царапина', criticality: 'minor', status: 'open', position: '', description: '' });
    setShowModal(true);
  };
  const openEdit = (d: Defect) => {
    setEditingDefect(d);
    setForm({ rollId: d.rollId.toString(), type: d.type, criticality: d.criticality, status: d.status, position: d.position.toString(), description: d.description });
    setShowModal(true);
  };
  const handleSave = () => {
    if (!form.rollId || !form.position) { showToast('Заполните все обязательные поля', 'error'); return; }
    if (editingDefect) {
      DefectsDB.update(editingDefect.id, { rollId: Number(form.rollId), type: form.type, criticality: form.criticality as any, status: form.status as any, position: Number(form.position), description: form.description });
      logEvent('action', `Дефект #${editingDefect.id} обновлён`, currentUser);
      showToast('Дефект обновлён', 'success');
    } else {
      const nd = DefectsDB.create({ rollId: Number(form.rollId), type: form.type, criticality: form.criticality as any, status: form.status as any, position: Number(form.position), description: form.description, createdBy: currentUser.id });
      logEvent('action', `Зарегистрирован дефект #${nd.id}`, currentUser);
      showToast('Дефект зарегистрирован', 'success');
    }
    setShowModal(false);
    loadDefects();
  };
  const handleDelete = (id: number) => {
    if (confirm('Удалить дефект?')) {
      DefectsDB.delete(id);
      logEvent('action', `Дефект #${id} удалён`, currentUser);
      showToast('Дефект удалён', 'info');
      loadDefects();
    }
  };
  const resetFilters = () => setFilters({ dateFrom: '', dateTo: '', rollId: '', criticality: '', status: '' });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Реестр дефектов</h1>
          <p className="text-slate-500 text-sm mt-1">Управление и контроль дефектов металлопродукции</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary"><Plus size={16} /> Добавить дефект</button>
      </div>

      {/* Фильтры — запрос на выборку по параметрам */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3"><Filter size={16} className="text-slate-400" /><span className="text-sm font-medium text-slate-600">Фильтры (Запрос по параметрам)</span></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div><label className="label">Дата от</label><input type="date" className="input" value={filters.dateFrom} onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))} /></div>
          <div><label className="label">Дата до</label><input type="date" className="input" value={filters.dateTo} onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))} /></div>
          <div><label className="label">Рулон</label>
            <select className="select" value={filters.rollId} onChange={e => setFilters(f => ({ ...f, rollId: e.target.value }))}>
              <option value="">Все</option>
              {rolls.map(r => <option key={r.id} value={r.id}>{r.number}</option>)}
            </select>
          </div>
          <div><label className="label">Критичность</label>
            <select className="select" value={filters.criticality} onChange={e => setFilters(f => ({ ...f, criticality: e.target.value }))}>
              <option value="">Все</option>
              <option value="critical">Критический</option>
              <option value="major">Значительный</option>
              <option value="minor">Незначительный</option>
            </select>
          </div>
          <div><label className="label">Статус</label>
            <select className="select" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
              <option value="">Все</option>
              <option value="open">Открыт</option>
              <option value="in_progress">В работе</option>
              <option value="resolved">Устранён</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={loadDefects} className="btn btn-primary btn-sm"><Search size={14} /> Применить</button>
          <button onClick={resetFilters} className="btn btn-secondary btn-sm"><RefreshCw size={14} /> Сбросить</button>
        </div>
      </div>

      {/* Таблица */}
      <div className="card p-0">
        <div className="px-5 py-3 border-b border-slate-200 flex justify-between items-center">
          <span className="text-sm text-slate-500">Найдено: <strong>{defects.length}</strong></span>
        </div>
        <div className="table-container border-0">
          <table className="data-table">
            <thead>
              <tr><th>ID</th><th>Рулон</th><th>Тип дефекта</th><th>Критичность</th><th>Статус</th><th>Позиция (м)</th><th>Дата</th><th>Действия</th></tr>
            </thead>
            <tbody>
              {defects.map(d => {
                const roll = RollsDB.getById(d.rollId);
                return (
                  <tr key={d.id}>
                    <td className="font-mono text-xs">#{d.id}</td>
                    <td className="font-medium">{roll?.number || '—'}</td>
                    <td>{d.type}</td>
                    <td><CriticalityBadge value={d.criticality} /></td>
                    <td><StatusBadge value={d.status} /></td>
                    <td>{d.position.toFixed(1)}</td>
                    <td className="text-xs text-slate-500">{formatDateTime(d.createdAt)}</td>
                    <td>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(d)} className="p-1.5 hover:bg-blue-50 rounded text-blue-600"><Edit3 size={14} /></button>
                        <button onClick={() => handleDelete(d.id)} className="p-1.5 hover:bg-red-50 rounded text-red-600"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {defects.length === 0 && <tr><td colSpan={8}><EmptyState icon={AlertTriangle} text="Дефекты не найдены" /></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Модальное окно */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingDefect ? 'Редактировать дефект' : 'Новый дефект'}>
        <div className="space-y-4">
          <div><label className="label">Рулон *</label>
            <select className="select" value={form.rollId} onChange={e => setForm(f => ({ ...f, rollId: e.target.value }))}>
              {rolls.map(r => <option key={r.id} value={r.id}>{r.number} — {r.steelGrade}</option>)}
            </select>
          </div>
          <div><label className="label">Тип дефекта *</label>
            <select className="select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              {['Царапина', 'Вмятина', 'Трещина', 'Коррозия', 'Расслоение', 'Плена', 'Закат', 'Риска'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Критичность *</label>
              <select className="select" value={form.criticality} onChange={e => setForm(f => ({ ...f, criticality: e.target.value }))}>
                <option value="minor">Незначительный</option>
                <option value="major">Значительный</option>
                <option value="critical">Критический</option>
              </select>
            </div>
            <div><label className="label">Статус *</label>
              <select className="select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="open">Открыт</option>
                <option value="in_progress">В работе</option>
                <option value="resolved">Устранён</option>
              </select>
            </div>
          </div>
          <div><label className="label">Позиция на полосе (м) *</label>
            <input type="number" step="0.1" className="input" value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} placeholder="Например: 125.5" />
          </div>
          <div><label className="label">Описание</label>
            <textarea className="input" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Описание дефекта..." />
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={handleSave} className="btn btn-primary flex-1">Сохранить</button>
            <button onClick={() => setShowModal(false)} className="btn btn-secondary">Отмена</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ==========================================
// СТРАНИЦА РУЛОНОВ
// ==========================================
function RollsPage({ currentUser, showToast }: { currentUser: User; showToast: (msg: string, type: 'success' | 'error' | 'info') => void }) {
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRoll, setEditingRoll] = useState<Roll | null>(null);
  const [form, setForm] = useState({ number: '', steelGrade: 'Ст3сп', thickness: '', width: '', weight: '', productionDate: '' });
  const [detailRoll, setDetailRoll] = useState<Roll | null>(null);

  // Запрос с вычисляемыми полями (количество дефектов на рулон)
  const rollsWithDefects = getRollsWithDefectCount();
  const grades = [...new Set(rollsWithDefects.map(r => r.steelGrade))];

  const filtered = rollsWithDefects.filter(r => {
    if (search && !r.number.toLowerCase().includes(search.toLowerCase())) return false;
    if (gradeFilter && r.steelGrade !== gradeFilter) return false;
    return true;
  });

  const openCreate = () => {
    setEditingRoll(null);
    setForm({ number: '', steelGrade: 'Ст3сп', thickness: '', width: '', weight: '', productionDate: new Date().toISOString().split('T')[0] });
    setShowModal(true);
  };
  const openEdit = (r: Roll) => {
    setEditingRoll(r);
    setForm({ number: r.number, steelGrade: r.steelGrade, thickness: r.thickness.toString(), width: r.width.toString(), weight: r.weight.toString(), productionDate: r.productionDate });
    setShowModal(true);
  };
  const handleSave = () => {
    if (!form.number || !form.thickness || !form.width || !form.weight) { showToast('Заполните все поля', 'error'); return; }
    if (editingRoll) {
      RollsDB.update(editingRoll.id, { number: form.number, steelGrade: form.steelGrade, thickness: Number(form.thickness), width: Number(form.width), weight: Number(form.weight), productionDate: form.productionDate });
      logEvent('action', `Рулон ${form.number} обновлён`, currentUser);
      showToast('Рулон обновлён', 'success');
    } else {
      RollsDB.create({ number: form.number, steelGrade: form.steelGrade, thickness: Number(form.thickness), width: Number(form.width), weight: Number(form.weight), productionDate: form.productionDate });
      logEvent('action', `Добавлен рулон ${form.number}`, currentUser);
      showToast('Рулон добавлен', 'success');
    }
    setShowModal(false);
  };
  const handleDelete = (r: Roll) => {
    if (confirm(`Удалить рулон ${r.number}?`)) {
      RollsDB.delete(r.id);
      logEvent('action', `Рулон ${r.number} удалён`, currentUser);
      showToast('Рулон удалён', 'info');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Рулоны</h1>
          <p className="text-slate-500 text-sm mt-1">Учёт металлопродукции</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary"><Plus size={16} /> Добавить рулон</button>
      </div>

      {/* Фильтры */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3"><Search size={16} className="text-slate-400" /><span className="text-sm font-medium text-slate-600">Поиск и фильтрация</span></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><label className="label">Поиск по номеру</label><input type="text" className="input" placeholder="Введите номер рулона..." value={search} onChange={e => setSearch(e.target.value)} /></div>
          <div><label className="label">Марка стали</label>
            <select className="select" value={gradeFilter} onChange={e => setGradeFilter(e.target.value)}>
              <option value="">Все марки</option>
              {grades.map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Таблица рулонов с вычисляемым полем "Дефектов" */}
      <div className="card p-0">
        <div className="px-5 py-3 border-b border-slate-200">
          <span className="text-sm text-slate-500">Найдено: <strong>{filtered.length}</strong></span>
        </div>
        <div className="table-container border-0">
          <table className="data-table">
            <thead>
              <tr><th>Номер рулона</th><th>Марка стали</th><th>Толщина (мм)</th><th>Ширина (мм)</th><th>Вес (т)</th><th>Дата производства</th><th>Дефектов</th><th>Действия</th></tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}>
                  <td className="font-medium">{r.number}</td>
                  <td>{r.steelGrade}</td>
                  <td>{r.thickness.toFixed(1)}</td>
                  <td>{r.width}</td>
                  <td>{r.weight.toFixed(1)}</td>
                  <td className="text-xs text-slate-500">{formatDate(r.productionDate)}</td>
                  <td>
                    <span className={`font-medium ${r.criticalCount > 0 ? 'text-red-600' : r.defectCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {r.defectCount}{r.criticalCount > 0 && <span className="text-red-500 text-xs ml-1">({r.criticalCount} крит.)</span>}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => setDetailRoll(r)} className="p-1.5 hover:bg-blue-50 rounded text-blue-600" title="Подробности"><Eye size={14} /></button>
                      <button onClick={() => openEdit(r)} className="p-1.5 hover:bg-blue-50 rounded text-blue-600"><Edit3 size={14} /></button>
                      <button onClick={() => handleDelete(r)} className="p-1.5 hover:bg-red-50 rounded text-red-600"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={8}><EmptyState icon={Database} text="Рулоны не найдены" /></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Модальное создания/редактирования */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingRoll ? 'Редактировать рулон' : 'Новый рулон'}>
        <div className="space-y-4">
          <div><label className="label">Номер рулона *</label><input className="input" value={form.number} onChange={e => setForm(f => ({ ...f, number: e.target.value }))} placeholder="R-2024-XXXX" /></div>
          <div><label className="label">Марка стали *</label>
            <select className="select" value={form.steelGrade} onChange={e => setForm(f => ({ ...f, steelGrade: e.target.value }))}>
              {['Ст3сп', '08пс', '09Г2С', '10ХСНД', '17Г1С', '20'].map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="label">Толщина (мм) *</label><input type="number" step="0.1" className="input" value={form.thickness} onChange={e => setForm(f => ({ ...f, thickness: e.target.value }))} /></div>
            <div><label className="label">Ширина (мм) *</label><input type="number" className="input" value={form.width} onChange={e => setForm(f => ({ ...f, width: e.target.value }))} /></div>
            <div><label className="label">Вес (т) *</label><input type="number" step="0.1" className="input" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} /></div>
          </div>
          <div><label className="label">Дата производства *</label><input type="date" className="input" value={form.productionDate} onChange={e => setForm(f => ({ ...f, productionDate: e.target.value }))} /></div>
          <div className="flex gap-2 pt-2">
            <button onClick={handleSave} className="btn btn-primary flex-1">Сохранить</button>
            <button onClick={() => setShowModal(false)} className="btn btn-secondary">Отмена</button>
          </div>
        </div>
      </Modal>

      {/* Детали рулона */}
      <Modal open={!!detailRoll} onClose={() => setDetailRoll(null)} title={`Паспорт рулона ${detailRoll?.number || ''}`}>
        {detailRoll && (() => {
          const defects = DefectsDB.getByRollId(detailRoll.id);
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-slate-500">Номер:</span><p className="font-medium">{detailRoll.number}</p></div>
                <div><span className="text-slate-500">Марка стали:</span><p className="font-medium">{detailRoll.steelGrade}</p></div>
                <div><span className="text-slate-500">Толщина:</span><p className="font-medium">{detailRoll.thickness} мм</p></div>
                <div><span className="text-slate-500">Ширина:</span><p className="font-medium">{detailRoll.width} мм</p></div>
                <div><span className="text-slate-500">Вес:</span><p className="font-medium">{detailRoll.weight} т</p></div>
                <div><span className="text-slate-500">Дата производства:</span><p className="font-medium">{formatDate(detailRoll.productionDate)}</p></div>
              </div>
              <h4 className="font-semibold text-slate-700 pt-2">Дефекты рулона ({defects.length})</h4>
              {defects.length > 0 ? (
                <div className="table-container">
                  <table className="data-table">
                    <thead><tr><th>Тип</th><th>Критичность</th><th>Статус</th><th>Позиция</th></tr></thead>
                    <tbody>
                      {defects.map(d => (
                        <tr key={d.id}><td>{d.type}</td><td><CriticalityBadge value={d.criticality} /></td><td><StatusBadge value={d.status} /></td><td>{d.position.toFixed(1)} м</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p className="text-sm text-emerald-600">Дефекты не обнаружены ✓</p>}
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}

// ==========================================
// ЖУРНАЛ СОБЫТИЙ
// ==========================================
function EventsPage() {
  const [filters, setFilters] = useState({ type: '', dateFrom: '', dateTo: '' });
  const [events, setEvents] = useState<SystemEvent[]>([]);

  const loadEvents = useCallback(() => {
    const params: any = {};
    if (filters.type) params.type = filters.type;
    if (filters.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters.dateTo) params.dateTo = filters.dateTo;
    const hasFilters = Object.keys(params).length > 0;
    const all = hasFilters ? EventsDB.filterByParams(params) : EventsDB.getAll();
    setEvents([...all].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }, [filters]);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Журнал событий</h1>
        <p className="text-slate-500 text-sm mt-1">История всех действий и системных событий</p>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-3"><Filter size={16} className="text-slate-400" /><span className="text-sm font-medium text-slate-600">Фильтры</span></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div><label className="label">Тип события</label>
            <select className="select" value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}>
              <option value="">Все типы</option>
              <option value="info">Информация</option>
              <option value="warning">Предупреждение</option>
              <option value="error">Ошибка</option>
              <option value="action">Действие</option>
            </select>
          </div>
          <div><label className="label">Дата от</label><input type="date" className="input" value={filters.dateFrom} onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))} /></div>
          <div><label className="label">Дата до</label><input type="date" className="input" value={filters.dateTo} onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))} /></div>
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={loadEvents} className="btn btn-primary btn-sm"><Search size={14} /> Применить</button>
          <button onClick={() => setFilters({ type: '', dateFrom: '', dateTo: '' })} className="btn btn-secondary btn-sm"><RefreshCw size={14} /> Сбросить</button>
        </div>
      </div>

      <div className="card p-0">
        <div className="px-5 py-3 border-b border-slate-200">
          <span className="text-sm text-slate-500">Событий: <strong>{events.length}</strong></span>
        </div>
        <div className="table-container border-0">
          <table className="data-table">
            <thead><tr><th>ID</th><th>Тип</th><th>Описание</th><th>Пользователь</th><th>Дата и время</th></tr></thead>
            <tbody>
              {events.map(e => (
                <tr key={e.id}>
                  <td className="font-mono text-xs">#{e.id}</td>
                  <td><EventTypeBadge value={e.type} /></td>
                  <td className="max-w-sm">{e.description}</td>
                  <td className="text-slate-600">{e.userName}</td>
                  <td className="text-xs text-slate-500">{formatDateTime(e.createdAt)}</td>
                </tr>
              ))}
              {events.length === 0 && <tr><td colSpan={5}><EmptyState icon={Calendar} text="События не найдены" /></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// ОТЧЁТЫ
// ==========================================
function ReportsPage({ currentUser, showToast }: { currentUser: User; showToast: (msg: string, type: 'success' | 'error' | 'info') => void }) {
  const [reportHTML, setReportHTML] = useState('');

  const openReport = (html: string) => {
    setReportHTML(html);
    logEvent('action', 'Сформирован отчёт', currentUser);
  };

  const printReport = () => {
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`<!DOCTYPE html><html><head><title>Отчёт</title><style>
        body{font-family:'Segoe UI',sans-serif;padding:30px;color:#1e293b;}
        h1{font-size:20px;margin-bottom:5px;}h2{font-size:16px;margin:15px 0 8px;color:#334155;}
        .subtitle{color:#64748b;font-size:13px;margin-bottom:20px;}
        table{border-collapse:collapse;width:100%;margin:10px 0;}
        th,td{border:1px solid #cbd5e1;padding:7px 10px;text-align:left;font-size:12px;}
        th{background:#f1f5f9;font-weight:600;color:#475569;}
        .total-row td{font-weight:700;background:#f8fafc;}
        .header{border-bottom:2px solid #1e40af;padding-bottom:10px;margin-bottom:15px;}
        .footer{border-top:1px solid #e2e8f0;margin-top:20px;padding-top:10px;font-size:11px;color:#94a3b8;}
        .critical{color:#dc2626;font-weight:600}.major{color:#d97706;}.minor{color:#2563eb;}
        .badge{display:inline-block;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:500;}
        .stat-block{display:inline-block;margin-right:30px;margin-bottom:10px;}
        .stat-block .value{font-size:24px;font-weight:700;color:#1e40af;}.stat-block .label{font-size:11px;color:#64748b;}
      </style></head><body>${reportHTML}<div class="footer">Сформировано: ${new Date().toLocaleString('ru-RU')} | Пользователь: ${currentUser.fullName} | СКК ПАО «НЛМК»</div></body></html>`);
      win.document.close();
      win.print();
    }
  };

  // 1. Отчёт по дефектам
  const generateDefectsReport = () => {
    const defects = DefectsDB.getAll();
    const rolls = RollsDB.getAll();
    const stats = getStatisticsForPeriod();
    let html = `<div class="header"><h1>Отчёт по дефектам металлопродукции</h1><p class="subtitle">ПАО «НЛМК» — Система контроля качества</p></div>`;
    html += `<div>`;
    html += `<div class="stat-block"><div class="value">${defects.length}</div><div class="label">Всего дефектов</div></div>`;
    html += `<div class="stat-block"><div class="value">${stats.byCriticality['critical'] || 0}</div><div class="label">Критических</div></div>`;
    html += `<div class="stat-block"><div class="value">${stats.byCriticality['major'] || 0}</div><div class="label">Значительных</div></div>`;
    html += `<div class="stat-block"><div class="value">${stats.byCriticality['minor'] || 0}</div><div class="label">Незначительных</div></div>`;
    html += `</div>`;
    html += `<h2>Реестр дефектов</h2><table><thead><tr><th>№</th><th>Рулон</th><th>Тип</th><th>Критичность</th><th>Статус</th><th>Позиция (м)</th><th>Дата</th><th>Описание</th></tr></thead><tbody>`;
    defects.forEach((d, i) => {
      const roll = rolls.find(r => r.id === d.rollId);
      const critClass = d.criticality === 'critical' ? 'critical' : d.criticality === 'major' ? 'major' : 'minor';
      html += `<tr><td>${i + 1}</td><td>${roll?.number || '—'}</td><td>${d.type}</td><td class="${critClass}">${criticalityNames[d.criticality]}</td><td>${statusNames[d.status]}</td><td>${d.position.toFixed(1)}</td><td>${formatDate(d.createdAt)}</td><td>${d.description}</td></tr>`;
    });
    html += `<tr class="total-row"><td colspan="7">ИТОГО</td><td>${defects.length} дефектов</td></tr>`;
    html += `</tbody></table>`;

    // Итоги по типам
    html += `<h2>Итоги по типам дефектов</h2><table><thead><tr><th>Тип дефекта</th><th>Количество</th><th>Доля (%)</th></tr></thead><tbody>`;
    Object.entries(stats.byType).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
      html += `<tr><td>${type}</td><td>${count}</td><td>${((count / defects.length) * 100).toFixed(1)}%</td></tr>`;
    });
    html += `<tr class="total-row"><td>ИТОГО</td><td>${defects.length}</td><td>100%</td></tr>`;
    html += `</tbody></table>`;
    openReport(html);
  };

  // 2. Паспорт рулона
  const [rollForPassport, setRollForPassport] = useState('');
  const generateRollPassport = () => {
    const roll = rollForPassport ? RollsDB.getById(Number(rollForPassport)) : RollsDB.getAll()[0];
    if (!roll) { showToast('Рулон не найден', 'error'); return; }
    const defects = DefectsDB.getByRollId(roll.id);
    const critCount = defects.filter(d => d.criticality === 'critical').length;
    const resolvedCount = defects.filter(d => d.status === 'resolved').length;

    let html = `<div class="header"><h1>Паспорт рулона ${roll.number}</h1><p class="subtitle">ПАО «НЛМК» — Система контроля качества</p></div>`;
    html += `<h2>Характеристики рулона</h2><table>`;
    html += `<tr><td><strong>Номер рулона</strong></td><td>${roll.number}</td></tr>`;
    html += `<tr><td><strong>Марка стали</strong></td><td>${roll.steelGrade}</td></tr>`;
    html += `<tr><td><strong>Толщина</strong></td><td>${roll.thickness} мм</td></tr>`;
    html += `<tr><td><strong>Ширина</strong></td><td>${roll.width} мм</td></tr>`;
    html += `<tr><td><strong>Вес</strong></td><td>${roll.weight} т</td></tr>`;
    html += `<tr><td><strong>Дата производства</strong></td><td>${formatDate(roll.productionDate)}</td></tr>`;
    html += `<tr><td><strong>Количество дефектов</strong></td><td>${defects.length} (критических: ${critCount})</td></tr>`;
    html += `<tr><td><strong>Устранено дефектов</strong></td><td>${resolvedCount} из ${defects.length}</td></tr>`;
    html += `</table>`;

    if (defects.length > 0) {
      html += `<h2>Обнаруженные дефекты</h2><table><thead><tr><th>№</th><th>Тип</th><th>Критичность</th><th>Статус</th><th>Позиция (м)</th><th>Описание</th><th>Дата</th></tr></thead><tbody>`;
      defects.forEach((d, i) => {
        html += `<tr><td>${i + 1}</td><td>${d.type}</td><td class="${d.criticality}">${criticalityNames[d.criticality]}</td><td>${statusNames[d.status]}</td><td>${d.position.toFixed(1)}</td><td>${d.description}</td><td>${formatDate(d.createdAt)}</td></tr>`;
      });
      html += `<tr class="total-row"><td colspan="6">ИТОГО дефектов</td><td>${defects.length}</td></tr>`;
      html += `</tbody></table>`;
    } else {
      html += `<p style="color:#16a34a;font-weight:600;margin-top:15px;">✓ Дефекты на рулоне не обнаружены. Рулон соответствует стандартам качества.</p>`;
    }
    openReport(html);
  };

  // 3. Статистический отчёт
  const generateStatisticsReport = () => {
    const stats = getStatisticsForPeriod();
    const rolls = RollsDB.getAll();
    const rollsWithDef = getRollsWithDefectCount();
    const totalWeight = rolls.reduce((s, r) => s + r.weight, 0);
    const rollsWithDefects = rollsWithDef.filter(r => r.defectCount > 0).length;
    const avgDefPerRoll = rolls.length > 0 ? (stats.total / rolls.length).toFixed(1) : '0';

    let html = `<div class="header"><h1>Статистический отчёт</h1><p class="subtitle">ПАО «НЛМК» — Анализ показателей качества</p></div>`;
    html += `<div>`;
    html += `<div class="stat-block"><div class="value">${rolls.length}</div><div class="label">Рулонов</div></div>`;
    html += `<div class="stat-block"><div class="value">${totalWeight.toFixed(1)} т</div><div class="label">Общий вес</div></div>`;
    html += `<div class="stat-block"><div class="value">${stats.total}</div><div class="label">Дефектов</div></div>`;
    html += `<div class="stat-block"><div class="value">${avgDefPerRoll}</div><div class="label">Среднее на рулон</div></div>`;
    html += `</div>`;

    html += `<h2>Распределение по критичности</h2><table><thead><tr><th>Критичность</th><th>Количество</th><th>Доля (%)</th></tr></thead><tbody>`;
    ['critical', 'major', 'minor'].forEach(c => {
      const cnt = stats.byCriticality[c] || 0;
      html += `<tr><td class="${c}">${criticalityNames[c]}</td><td>${cnt}</td><td>${stats.total > 0 ? ((cnt / stats.total) * 100).toFixed(1) : 0}%</td></tr>`;
    });
    html += `<tr class="total-row"><td>ИТОГО</td><td>${stats.total}</td><td>100%</td></tr></tbody></table>`;

    html += `<h2>Распределение по типам</h2><table><thead><tr><th>Тип дефекта</th><th>Количество</th><th>Доля (%)</th></tr></thead><tbody>`;
    Object.entries(stats.byType).sort((a, b) => b[1] - a[1]).forEach(([t, c]) => {
      html += `<tr><td>${t}</td><td>${c}</td><td>${((c / stats.total) * 100).toFixed(1)}%</td></tr>`;
    });
    html += `<tr class="total-row"><td>ИТОГО</td><td>${stats.total}</td><td>100%</td></tr></tbody></table>`;

    html += `<h2>Распределение по статусу</h2><table><thead><tr><th>Статус</th><th>Количество</th><th>Доля (%)</th></tr></thead><tbody>`;
    ['open', 'in_progress', 'resolved'].forEach(s => {
      const cnt = stats.byStatus[s] || 0;
      html += `<tr><td>${statusNames[s]}</td><td>${cnt}</td><td>${stats.total > 0 ? ((cnt / stats.total) * 100).toFixed(1) : 0}%</td></tr>`;
    });
    html += `<tr class="total-row"><td>ИТОГО</td><td>${stats.total}</td><td>100%</td></tr></tbody></table>`;

    html += `<h2>Рулоны с дефектами</h2><table><thead><tr><th>Рулон</th><th>Марка стали</th><th>Дефектов</th><th>Критических</th></tr></thead><tbody>`;
    rollsWithDef.filter(r => r.defectCount > 0).forEach(r => {
      html += `<tr><td>${r.number}</td><td>${r.steelGrade}</td><td>${r.defectCount}</td><td class="${r.criticalCount > 0 ? 'critical' : ''}">${r.criticalCount}</td></tr>`;
    });
    html += `<tr class="total-row"><td>ИТОГО рулонов с дефектами</td><td></td><td>${rollsWithDefects}</td><td></td></tr></tbody></table>`;
    openReport(html);
  };

  // 4. Суточный отчёт
  const generateDailyReport = () => {
    const today = new Date().toISOString().split('T')[0];
    const allDefects = DefectsDB.getAll();
    const todayDefects = allDefects.filter(d => d.createdAt.startsWith(today));
    const todayEvents = EventsDB.getAll().filter(e => e.createdAt.startsWith(today));
    const rolls = RollsDB.getAll();
    const todayRolls = rolls.filter(r => r.productionDate === today);
    const resolvedToday = allDefects.filter(d => d.status === 'resolved' && d.createdAt.startsWith(today)).length;
    const openDefects = allDefects.filter(d => d.status === 'open').length;

    let html = `<div class="header"><h1>Суточный отчёт</h1><p class="subtitle">ПАО «НЛМК» — ${new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div>`;
    html += `<div>`;
    html += `<div class="stat-block"><div class="value">${todayRolls.length}</div><div class="label">Рулонов за сутки</div></div>`;
    html += `<div class="stat-block"><div class="value">${todayDefects.length}</div><div class="label">Новых дефектов</div></div>`;
    html += `<div class="stat-block"><div class="value">${resolvedToday}</div><div class="label">Устранено за сутки</div></div>`;
    html += `<div class="stat-block"><div class="value">${openDefects}</div><div class="label">Открытых всего</div></div>`;
    html += `</div>`;

    html += `<h2>Общая сводка по базе</h2><table>`;
    html += `<tr><td><strong>Всего рулонов в системе</strong></td><td>${rolls.length}</td></tr>`;
    html += `<tr><td><strong>Всего дефектов</strong></td><td>${allDefects.length}</td></tr>`;
    html += `<tr><td><strong>Открытых дефектов</strong></td><td>${openDefects}</td></tr>`;
    html += `<tr><td><strong>В работе</strong></td><td>${allDefects.filter(d => d.status === 'in_progress').length}</td></tr>`;
    html += `<tr><td><strong>Устранённых</strong></td><td>${allDefects.filter(d => d.status === 'resolved').length}</td></tr>`;
    const pct = allDefects.length > 0 ? ((allDefects.filter(d => d.status === 'resolved').length / allDefects.length) * 100).toFixed(1) : '0';
    html += `<tr class="total-row"><td><strong>Процент устранения</strong></td><td>${pct}%</td></tr>`;
    html += `</table>`;

    if (todayDefects.length > 0) {
      html += `<h2>Дефекты за сутки</h2><table><thead><tr><th>Рулон</th><th>Тип</th><th>Критичность</th><th>Статус</th><th>Время</th></tr></thead><tbody>`;
      todayDefects.forEach(d => {
        const roll = rolls.find(r => r.id === d.rollId);
        html += `<tr><td>${roll?.number || '—'}</td><td>${d.type}</td><td class="${d.criticality}">${criticalityNames[d.criticality]}</td><td>${statusNames[d.status]}</td><td>${formatDateTime(d.createdAt)}</td></tr>`;
      });
      html += `<tr class="total-row"><td colspan="4">ИТОГО</td><td>${todayDefects.length}</td></tr></tbody></table>`;
    }

    if (todayEvents.length > 0) {
      html += `<h2>Журнал событий за сутки</h2><table><thead><tr><th>Тип</th><th>Описание</th><th>Пользователь</th><th>Время</th></tr></thead><tbody>`;
      todayEvents.forEach(e => {
        html += `<tr><td>${eventTypeNames[e.type]}</td><td>${e.description}</td><td>${e.userName}</td><td>${formatDateTime(e.createdAt)}</td></tr>`;
      });
      html += `<tr class="total-row"><td colspan="3">ИТОГО событий</td><td>${todayEvents.length}</td></tr></tbody></table>`;
    }
    openReport(html);
  };

  const rolls = RollsDB.getAll();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Отчёты</h1>
        <p className="text-slate-500 text-sm mt-1">Формирование и печать отчётных документов</p>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-2">
          <FileText size={20} className="text-blue-600" />
          <h3 className="font-semibold text-slate-700">Система отчётов</h3>
        </div>
        <p className="text-sm text-slate-500 mb-4">Выберите необходимый отчёт для формирования. Все отчёты содержат актуальные данные из базы и могут быть распечатаны.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card hover:shadow-md transition-shadow cursor-pointer group" onClick={generateDefectsReport}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0 group-hover:bg-red-200 transition-colors">
              <AlertTriangle size={24} className="text-red-600" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-800">Отчёт по дефектам</h4>
              <p className="text-sm text-slate-500 mt-1">Полный список дефектов с группировкой по типам и критичности, итоговые значения</p>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-md transition-shadow">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Database size={24} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-slate-800">Паспорт рулона</h4>
              <p className="text-sm text-slate-500 mt-1">Детальная информация о рулоне и его дефектах</p>
              <div className="flex gap-2 mt-3">
                <select className="select text-sm flex-1" value={rollForPassport} onChange={e => setRollForPassport(e.target.value)}>
                  {rolls.map(r => <option key={r.id} value={r.id}>{r.number}</option>)}
                </select>
                <button onClick={generateRollPassport} className="btn btn-primary btn-sm">Сформировать</button>
              </div>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-md transition-shadow cursor-pointer group" onClick={generateStatisticsReport}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-200 transition-colors">
              <BarChart3 size={24} className="text-emerald-600" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-800">Статистический отчёт</h4>
              <p className="text-sm text-slate-500 mt-1">Анализ дефектов по типам, критичности, статусам и рулонам с расчётом итогов</p>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-md transition-shadow cursor-pointer group" onClick={generateDailyReport}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-200 transition-colors">
              <Calendar size={24} className="text-amber-600" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-800">Суточный отчёт</h4>
              <p className="text-sm text-slate-500 mt-1">Сводка за текущие сутки по всем показателям, дефектам и событиям</p>
            </div>
          </div>
        </div>
      </div>

      {/* Предпросмотр отчёта */}
      {reportHTML && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-700">Предпросмотр отчёта</h3>
            <div className="flex gap-2">
              <button onClick={printReport} className="btn btn-primary btn-sm"><Printer size={14} /> Печать</button>
              <button onClick={() => setReportHTML('')} className="btn btn-secondary btn-sm"><X size={14} /> Закрыть</button>
            </div>
          </div>
          <div className="border border-slate-200 rounded-lg p-6 bg-white report-print" dangerouslySetInnerHTML={{ __html: reportHTML }} />
        </div>
      )}
    </div>
  );
}

// ==========================================
// УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ
// ==========================================
function UsersPage({ currentUser, showToast }: { currentUser: User; showToast: (msg: string, type: 'success' | 'error' | 'info') => void }) {
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({ username: '', password: '', fullName: '', role: 'operator', email: '' });

  const load = () => setUsers(UsersDB.getAll());
  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditingUser(null);
    setForm({ username: '', password: '', fullName: '', role: 'operator', email: '' });
    setShowModal(true);
  };
  const openEdit = (u: User) => {
    setEditingUser(u);
    setForm({ username: u.username, password: '', fullName: u.fullName, role: u.role, email: u.email });
    setShowModal(true);
  };
  const handleSave = () => {
    if (!form.username || !form.fullName || !form.email) { showToast('Заполните все поля', 'error'); return; }
    if (editingUser) {
      const updateData: Partial<User> = { username: form.username, fullName: form.fullName, role: form.role as any, email: form.email };
      if (form.password) updateData.password = form.password;
      UsersDB.update(editingUser.id, updateData);
      logEvent('action', `Пользователь ${form.fullName} обновлён`, currentUser);
      showToast('Пользователь обновлён', 'success');
    } else {
      if (!form.password) { showToast('Укажите пароль', 'error'); return; }
      UsersDB.create({ username: form.username, password: form.password, fullName: form.fullName, role: form.role as any, email: form.email });
      logEvent('action', `Создан пользователь ${form.fullName}`, currentUser);
      showToast('Пользователь создан', 'success');
    }
    setShowModal(false);
    load();
  };
  const handleDelete = (u: User) => {
    if (u.id === currentUser.id) { showToast('Нельзя удалить себя', 'error'); return; }
    if (confirm(`Удалить пользователя ${u.fullName}?`)) {
      UsersDB.delete(u.id);
      logEvent('action', `Пользователь ${u.fullName} удалён`, currentUser);
      showToast('Пользователь удалён', 'info');
      load();
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Пользователи</h1>
          <p className="text-slate-500 text-sm mt-1">Управление учётными записями</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary"><Plus size={16} /> Добавить</button>
      </div>

      <div className="card p-0">
        <div className="table-container border-0">
          <table className="data-table">
            <thead><tr><th>ID</th><th>Логин</th><th>ФИО</th><th>Роль</th><th>Email</th><th>Дата создания</th><th>Действия</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td className="font-mono text-xs">#{u.id}</td>
                  <td className="font-medium">{u.username}</td>
                  <td>{u.fullName}</td>
                  <td><span className={`badge ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : u.role === 'engineer' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>{roleNames[u.role]}</span></td>
                  <td className="text-slate-500">{u.email}</td>
                  <td className="text-xs text-slate-500">{formatDate(u.createdAt)}</td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(u)} className="p-1.5 hover:bg-blue-50 rounded text-blue-600"><Edit3 size={14} /></button>
                      <button onClick={() => handleDelete(u)} className="p-1.5 hover:bg-red-50 rounded text-red-600" disabled={u.id === currentUser.id}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingUser ? 'Редактировать пользователя' : 'Новый пользователь'}>
        <div className="space-y-4">
          <div><label className="label">Логин *</label><input className="input" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} /></div>
          <div><label className="label">Пароль {editingUser ? '(оставьте пустым чтобы не менять)' : '*'}</label><input type="password" className="input" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} /></div>
          <div><label className="label">ФИО *</label><input className="input" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} /></div>
          <div><label className="label">Роль *</label>
            <select className="select" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
              <option value="operator">Оператор</option>
              <option value="engineer">Инженер</option>
              <option value="admin">Администратор</option>
            </select>
          </div>
          <div><label className="label">Email *</label><input type="email" className="input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
          <div className="flex gap-2 pt-2">
            <button onClick={handleSave} className="btn btn-primary flex-1">Сохранить</button>
            <button onClick={() => setShowModal(false)} className="btn btn-secondary">Отмена</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ==========================================
// НАСТРОЙКИ
// ==========================================
function SettingsPage({ showToast }: { showToast: (msg: string, type: 'success' | 'error' | 'info') => void }) {
  const resetData = () => {
    if (confirm('Вы уверены? Все данные будут удалены!')) {
      localStorage.removeItem('skk_users');
      localStorage.removeItem('skk_rolls');
      localStorage.removeItem('skk_defects');
      localStorage.removeItem('skk_events');
      seedTestData();
      showToast('Данные сброшены и загружены тестовые', 'success');
    }
  };
  const loadTestData = () => {
    seedTestData();
    showToast('Тестовые данные загружены', 'success');
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Настройки</h1>
        <p className="text-slate-500 text-sm mt-1">Управление системой</p>
      </div>

      <div className="card">
        <h3 className="font-semibold text-slate-700 mb-4">Управление данными</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <h4 className="font-medium text-slate-700">Загрузить тестовые данные</h4>
              <p className="text-sm text-slate-500">Заполнить базу демонстрационными данными (12 рулонов, 20 дефектов, 5 пользователей)</p>
            </div>
            <button onClick={loadTestData} className="btn btn-primary btn-sm"><Download size={14} /> Загрузить</button>
          </div>
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
            <div>
              <h4 className="font-medium text-red-700">Сбросить все данные</h4>
              <p className="text-sm text-red-500">Удалить все данные и вернуть систему к начальному состоянию</p>
            </div>
            <button onClick={resetData} className="btn btn-danger btn-sm"><Trash2 size={14} /> Сбросить</button>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-slate-700 mb-4">О системе</h3>
        <div className="text-sm space-y-2 text-slate-600">
          <p><strong>Название:</strong> СКК ПАО «НЛМК» — Система контроля качества металлопродукции</p>
          <p><strong>Версия:</strong> 1.0.0</p>
          <p><strong>Хранение данных:</strong> LocalStorage (локальная база данных браузера)</p>
          <p><strong>Технологии:</strong> HTML, CSS, JavaScript (React + Tailwind CSS)</p>
          <p><strong>Разработчик:</strong> Жуков В.А., гр. ИСиП 22-2</p>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// ГЛАВНЫЙ КОМПОНЕНТ ПРИЛОЖЕНИЯ
// ==========================================
type Page = 'dashboard' | 'defects' | 'rolls' | 'events' | 'reports' | 'users' | 'settings';

const navItems: { id: Page; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Панель управления', icon: LayoutDashboard },
  { id: 'defects', label: 'Дефекты', icon: AlertTriangle },
  { id: 'rolls', label: 'Рулоны', icon: Database },
  { id: 'events', label: 'Журнал событий', icon: Calendar },
  { id: 'reports', label: 'Отчёты', icon: FileText },
  { id: 'users', label: 'Пользователи', icon: Users },
  { id: 'settings', label: 'Настройки', icon: Settings },
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [page, setPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => { initDatabase(); }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    logEvent('info', `Пользователь ${user.fullName} вошёл в систему`, user);
  };

  const handleLogout = () => {
    if (currentUser) logEvent('info', `Пользователь ${currentUser.fullName} вышел из системы`, currentUser);
    setCurrentUser(null);
    setPage('dashboard');
  };

  if (!currentUser) return <LoginPage onLogin={handleLogin} />;

  return (
    <div className="flex min-h-screen">
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 bg-slate-800 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0 lg:w-20'} flex flex-col overflow-hidden`}>
        <div className="p-4 border-b border-slate-700 flex items-center gap-3 min-h-[64px]">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Shield size={22} className="text-white" />
          </div>
          {sidebarOpen && (
            <div className="min-w-0">
              <h2 className="text-white font-bold text-sm truncate">СКК НЛМК</h2>
              <p className="text-slate-400 text-xs truncate">Контроль качества</p>
            </div>
          )}
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setPage(item.id); if (window.innerWidth < 1024) setSidebarOpen(false); }}
              className={`sidebar-link w-full ${page === item.id ? 'active' : ''} ${!sidebarOpen ? 'justify-center px-0' : ''}`}>
              <item.icon size={20} className="flex-shrink-0" />
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-700">
          {sidebarOpen && (
            <div className="px-3 py-2 mb-2">
              <p className="text-white text-sm font-medium truncate">{currentUser.fullName}</p>
              <p className="text-slate-400 text-xs">{roleNames[currentUser.role]}</p>
            </div>
          )}
          <button onClick={handleLogout} className={`sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-900/30 ${!sidebarOpen ? 'justify-center px-0' : ''}`}>
            <LogOut size={20} className="flex-shrink-0" />
            {sidebarOpen && <span>Выйти</span>}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-4 lg:px-6 h-16 flex items-center justify-between sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 hidden sm:block">{currentUser.fullName}</span>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-700 text-sm font-bold">{currentUser.fullName.charAt(0)}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {page === 'dashboard' && <DashboardPage currentUser={currentUser} />}
          {page === 'defects' && <DefectsPage currentUser={currentUser} showToast={showToast} />}
          {page === 'rolls' && <RollsPage currentUser={currentUser} showToast={showToast} />}
          {page === 'events' && <EventsPage />}
          {page === 'reports' && <ReportsPage currentUser={currentUser} showToast={showToast} />}
          {page === 'users' && <UsersPage currentUser={currentUser} showToast={showToast} />}
          {page === 'settings' && <SettingsPage showToast={showToast} />}
        </main>
      </div>
    </div>
  );
}
