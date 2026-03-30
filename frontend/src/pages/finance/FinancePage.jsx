// src/pages/finance/FinancePage.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, DollarSign, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { financeApi, studentsApi } from '../../api/endpoints';
import { StatCard, PageSpinner, Badge, Modal, FormGroup } from '../../components/ui';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function FinancePage() {
  const qc = useQueryClient();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const { data: dashboard } = useQuery({ queryKey:['finance-dashboard'], queryFn: () => financeApi.dashboard({ term:2, academicYear:'2024/2025' }).then(r=>r.data.data) });
  const { data: paymentsData, isLoading } = useQuery({ queryKey:['payments'], queryFn: () => financeApi.listPayments({ term:2, limit:20 }).then(r=>r.data) });
  const { data: outstanding } = useQuery({ queryKey:['outstanding'], queryFn: () => financeApi.outstanding({ term:2 }).then(r=>r.data.data) });
  const { data: studentsData } = useQuery({ queryKey:['students-simple'], queryFn: () => studentsApi.list({ limit:200 }).then(r=>r.data.data) });

  const recordMut = useMutation({
    mutationFn: data => financeApi.recordPayment({ ...data, term:2, academicYear:'2024/2025' }),
    onSuccess: res => { toast.success(`Payment recorded. Receipt: ${res.data.data.receiptNumber}`); qc.invalidateQueries(['payments']); qc.invalidateQueries(['finance-dashboard']); setPaymentOpen(false); reset(); },
    onError: e => toast.error(e.response?.data?.message || 'Failed to record payment'),
  });

  const fmtN = v => `₦${(Number(v||0)/1000).toFixed(0)}k`;

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Finance</h1><p className="page-subtitle">Term 2 · 2024/2025</p></div>
        <button className="btn btn-primary" onClick={() => setPaymentOpen(true)}><Plus size={16} /> Record Payment</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Collected"  value={fmtN(dashboard?.totalCollected)} icon={TrendingUp}  color="green" sub={`${dashboard?.collectionRate ?? 0}% of target`} />
        <StatCard label="Outstanding"      value={fmtN(dashboard?.outstanding)}     icon={AlertCircle} color="red"   sub={`${outstanding?.length ?? 0} students`} />
        <StatCard label="Total Expenses"   value={fmtN(dashboard?.totalExpenses)}   icon={TrendingDown}color="amber" />
        <StatCard label="Net Balance"      value={fmtN(dashboard?.netBalance)}      icon={DollarSign}  color="primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card">
          <div className="card-header"><h3 className="card-title">Recent Payments</h3></div>
          {isLoading ? <PageSpinner /> : (
            <div className="table-container">
              <table className="table">
                <thead><tr><th>Student</th><th>Amount</th><th>Method</th><th>Date</th><th>Receipt</th></tr></thead>
                <tbody>
                  {paymentsData?.data?.map(p => (
                    <tr key={p.id}>
                      <td className="font-medium">{p.student?.firstName} {p.student?.lastName}</td>
                      <td className="font-mono text-green-600 font-medium">₦{Number(p.amountPaid).toLocaleString()}</td>
                      <td><span className="badge badge-gray capitalize">{p.paymentMethod}</span></td>
                      <td className="text-gray-500">{format(new Date(p.paymentDate), 'MMM d')}</td>
                      <td className="font-mono text-xs text-gray-400">{p.receiptNumber}</td>
                    </tr>
                  ))}
                  {!paymentsData?.data?.length && <tr><td colSpan={5} className="text-center py-8 text-gray-400">No payments recorded</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title">Outstanding Fees</h3></div>
          <div className="table-container">
            <table className="table">
              <thead><tr><th>Student</th><th>Class</th><th>Balance</th><th></th></tr></thead>
              <tbody>
                {outstanding?.slice(0,10).map(p => (
                  <tr key={p.id}>
                    <td className="font-medium">{p.student?.firstName} {p.student?.lastName}</td>
                    <td className="text-gray-500">{p.student?.class?.name}</td>
                    <td className="font-mono text-red-600 font-medium">₦{Number(p.balance).toLocaleString()}</td>
                    <td><button className="btn btn-ghost btn-sm">Remind</button></td>
                  </tr>
                ))}
                {!outstanding?.length && <tr><td colSpan={4} className="text-center py-8 text-gray-400">No outstanding fees</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal open={paymentOpen} onClose={() => setPaymentOpen(false)} title="Record Fee Payment"
        footer={<><button className="btn btn-ghost" onClick={() => setPaymentOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSubmit(d => recordMut.mutate(d))} disabled={recordMut.isPending}>{recordMut.isPending ? 'Recording...' : 'Record Payment'}</button></>}>
        <div className="space-y-3">
          <FormGroup label="Student" required>
            <select className="select" {...register('studentId', { required:true })}>
              <option value="">Select student...</option>
              {studentsData?.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} — {s.class?.name}</option>)}
            </select>
          </FormGroup>
          <div className="grid grid-cols-2 gap-3">
            <FormGroup label="Amount Paid (₦)" required><input type="number" className="input" {...register('amountPaid', { required:true })} placeholder="45000" /></FormGroup>
            <FormGroup label="Amount Due (₦)" required><input type="number" className="input" {...register('amountDue', { required:true })} placeholder="45000" /></FormGroup>
            <FormGroup label="Payment Method">
              <select className="select" {...register('paymentMethod')}>
                <option value="cash">Cash</option><option value="transfer">Bank Transfer</option><option value="card">Card</option>
              </select>
            </FormGroup>
            <FormGroup label="Payment Date"><input type="date" className="input" {...register('paymentDate')} /></FormGroup>
          </div>
          <FormGroup label="Notes"><input className="input" {...register('notes')} placeholder="Optional notes..." /></FormGroup>
        </div>
      </Modal>
    </div>
  );
}
