// src/components/ui/index.jsx
import { X, Loader2 } from 'lucide-react';

// ── Stat Card ─────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, icon: Icon, color = 'primary', trend }) {
  const colors = {
    primary: 'bg-primary-50 text-primary-600',
    green:   'bg-green-50 text-green-600',
    blue:    'bg-blue-50 text-blue-600',
    red:     'bg-red-50 text-red-600',
    amber:   'bg-amber-50 text-amber-600',
  };
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="stat-label">{label}</div>
          <div className="stat-value">{value ?? '—'}</div>
          {sub && <div className="stat-sub">{sub}</div>}
          {trend != null && (
            <div className={`text-xs mt-1 font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </div>
          )}
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  if (!open) return null;
  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`modal w-full ${widths[size]}`}>
        <div className="modal-header">
          <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="btn-icon"><X size={16} /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 20, className = '' }) {
  return <Loader2 size={size} className={`animate-spin text-primary-500 ${className}`} />;
}

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <Spinner size={32} />
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────
export function EmptyState({ icon = '📭', title = 'No data', description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
      {description && <p className="empty-text">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────────
const COLORS = ['bg-primary-100 text-primary-700','bg-blue-100 text-blue-700','bg-amber-100 text-amber-700','bg-green-100 text-green-700','bg-rose-100 text-rose-700','bg-violet-100 text-violet-700'];

export function Avatar({ name = '', size = 'md', src }) {
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const color = COLORS[name.charCodeAt(0) % COLORS.length];
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' };
  if (src) return <img src={src} className={`${sizes[size]} rounded-full object-cover`} alt={name} />;
  return <div className={`${sizes[size]} ${color} rounded-full flex items-center justify-center font-semibold flex-shrink-0`}>{initials}</div>;
}

// ── Badge ─────────────────────────────────────────────────────────────────────
const BADGE_MAP = {
  A:'badge-green', 'A+':'badge-green', B:'badge-blue', C:'badge-yellow',
  D:'badge-red', F:'badge-red',
  present:'badge-green', absent:'badge-red', late:'badge-yellow',
  active:'badge-green', inactive:'badge-red', pending:'badge-yellow',
  paid:'badge-green', unpaid:'badge-red',
};

export function Badge({ label, type }) {
  const cls = type ? BADGE_MAP[type] || 'badge-gray' : BADGE_MAP[label] || 'badge-gray';
  return <span className={`badge ${cls}`}>{label}</span>;
}

// ── Confirm Dialog ────────────────────────────────────────────────────────────
export function ConfirmDialog({ open, onClose, onConfirm, title, message, danger }) {
  return (
    <Modal open={open} onClose={onClose} title={title || 'Confirm'}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>Confirm</button>
        </>
      }
    >
      <p className="text-sm text-gray-600">{message}</p>
    </Modal>
  );
}

// ── Form Components ───────────────────────────────────────────────────────────
export function FormGroup({ label, error, children, required }) {
  return (
    <div className="form-group">
      {label && <label className="label">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>}
      {children}
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────
export function Pagination({ page, pages, total, limit, onPage }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
      <span>Showing {Math.min((page-1)*limit+1, total)}–{Math.min(page*limit, total)} of {total}</span>
      <div className="flex gap-1">
        <button className="btn btn-ghost btn-sm" disabled={page<=1} onClick={() => onPage(page-1)}>←</button>
        {Array.from({length: Math.min(5, pages)}, (_,i) => {
          const p = page <= 3 ? i+1 : page-2+i;
          if (p < 1 || p > pages) return null;
          return (
            <button key={p} className={`btn btn-sm ${p===page ? 'btn-primary' : 'btn-ghost'}`} onClick={() => onPage(p)}>{p}</button>
          );
        })}
        <button className="btn btn-ghost btn-sm" disabled={page>=pages} onClick={() => onPage(page+1)}>→</button>
      </div>
    </div>
  );
}

// ── Section Header ────────────────────────────────────────────────────────────
export function SectionHeader({ title, action }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-sm font-semibold text-gray-700">{title}</span>
      <div className="flex-1 h-px bg-gray-100" />
      {action}
    </div>
  );
}
