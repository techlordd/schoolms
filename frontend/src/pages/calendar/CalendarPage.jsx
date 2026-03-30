// src/pages/calendar/CalendarPage.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { calendarApi } from '../../api/endpoints';
import { Modal, FormGroup, Badge } from '../../components/ui';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { format, getDaysInMonth, startOfMonth, getDay, addMonths, subMonths } from 'date-fns';
import useAuthStore from '../../store/authStore';

const EVENT_COLORS = { exam:'bg-red-100 text-red-700', holiday:'bg-green-100 text-green-700', meeting:'bg-blue-100 text-blue-700', activity:'bg-amber-100 text-amber-700', sports:'bg-purple-100 text-purple-700', other:'bg-gray-100 text-gray-600' };

export default function CalendarPage() {
  const user = useAuthStore(s => s.user);
  const qc = useQueryClient();
  const [current, setCurrent] = useState(new Date());
  const [createOpen, setCreateOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const month = current.getMonth() + 1;
  const year  = current.getFullYear();
  const canManage = ['admin','head_teacher'].includes(user?.role);

  const { data: events } = useQuery({
    queryKey: ['calendar', month, year],
    queryFn: () => calendarApi.list({ month, year }).then(r => r.data.data),
  });

  const createMut = useMutation({
    mutationFn: data => calendarApi.create(data),
    onSuccess: () => { toast.success('Event created'); qc.invalidateQueries(['calendar']); setCreateOpen(false); reset(); },
    onError: () => toast.error('Failed to create event'),
  });

  // Build calendar grid
  const daysInMonth = getDaysInMonth(current);
  const startDay = getDay(startOfMonth(current)); // 0=Sun
  const totalCells = Math.ceil((daysInMonth + startDay) / 7) * 7;
  const days = [];
  for (let i = 0; i < totalCells; i++) {
    const day = i - startDay + 1;
    days.push(day >= 1 && day <= daysInMonth ? day : null);
  }

  const getEventsForDay = d => (events||[]).filter(e => new Date(e.startDate).getDate() === d && new Date(e.startDate).getMonth() === current.getMonth());
  const isToday = d => d && new Date().getDate()===d && new Date().getMonth()===current.getMonth() && new Date().getFullYear()===year;

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">School Calendar</h1><p className="page-subtitle">{format(current, 'MMMM yyyy')}</p></div>
        <div className="flex gap-2">
          <button className="btn btn-ghost" onClick={() => setCurrent(subMonths(current, 1))}><ChevronLeft size={16} /></button>
          <button className="btn btn-ghost" onClick={() => setCurrent(new Date())}>Today</button>
          <button className="btn btn-ghost" onClick={() => setCurrent(addMonths(current, 1))}><ChevronRight size={16} /></button>
          {canManage && <button className="btn btn-primary" onClick={() => setCreateOpen(true)}><Plus size={16} /> Add Event</button>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card lg:col-span-2">
          <div className="card-body p-0">
            <div className="grid grid-cols-7 border-b border-gray-100">
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                <div key={d} className="py-2 text-center text-xs font-medium text-gray-400">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {days.map((day, i) => (
                <div key={i} className={`min-h-20 p-1.5 border-b border-r border-gray-50 ${!day ? 'bg-gray-50/50' : ''}`}>
                  {day && (
                    <>
                      <div className={`w-6 h-6 flex items-center justify-center text-xs rounded-full mb-1 ${isToday(day) ? 'bg-primary-600 text-white font-semibold' : 'text-gray-600'}`}>{day}</div>
                      {getEventsForDay(day).map(ev => (
                        <div key={ev.id} className={`text-xs rounded px-1 py-0.5 mb-0.5 truncate ${EVENT_COLORS[ev.eventType] || EVENT_COLORS.other}`}>{ev.title}</div>
                      ))}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title">This Month's Events</h3></div>
          <div className="divide-y divide-gray-50">
            {events?.length ? events.map(ev => (
              <div key={ev.id} className="px-4 py-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-50 rounded-lg flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary-600 leading-none">{format(new Date(ev.startDate), 'd')}</span>
                    <span className="text-xs text-primary-400 leading-none">{format(new Date(ev.startDate), 'MMM')}</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-700">{ev.title}</p>
                    <span className={`badge text-xs mt-1 ${EVENT_COLORS[ev.eventType]}`}>{ev.eventType}</span>
                  </div>
                </div>
              </div>
            )) : <div className="px-4 py-8 text-xs text-gray-400 text-center">No events this month</div>}
          </div>
        </div>
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add Calendar Event"
        footer={<><button className="btn btn-ghost" onClick={() => setCreateOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSubmit(d => createMut.mutate(d))}>Create Event</button></>}>
        <div className="space-y-3">
          <FormGroup label="Title" required><input className="input" {...register('title', { required:true })} /></FormGroup>
          <div className="grid grid-cols-2 gap-3">
            <FormGroup label="Event Type">
              <select className="select" {...register('eventType')}>
                <option value="activity">Activity</option><option value="exam">Exam</option><option value="holiday">Holiday</option><option value="meeting">Meeting</option><option value="sports">Sports</option>
              </select>
            </FormGroup>
            <FormGroup label="Audience">
              <select className="select" {...register('audience')}>
                <option value="all">Everyone</option><option value="teacher">Teachers only</option><option value="student">Students only</option><option value="parent">Parents only</option>
              </select>
            </FormGroup>
            <FormGroup label="Start Date" required><input type="datetime-local" className="input" {...register('startDate', { required:true })} /></FormGroup>
            <FormGroup label="End Date"><input type="datetime-local" className="input" {...register('endDate')} /></FormGroup>
          </div>
          <FormGroup label="Location"><input className="input" {...register('location')} placeholder="e.g. Main Hall" /></FormGroup>
          <FormGroup label="Description"><textarea className="input min-h-16" {...register('description')} /></FormGroup>
        </div>
      </Modal>
    </div>
  );
}
