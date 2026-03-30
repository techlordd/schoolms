// src/pages/students/EnrollPage.jsx
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { studentsApi, classesApi } from '../../api/endpoints';
import { FormGroup } from '../../components/ui';
import toast from 'react-hot-toast';

export default function EnrollPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classesApi.list().then(r => r.data.data),
  });

  const mutation = useMutation({
    mutationFn: data => studentsApi.create(data),
    onSuccess: (res) => {
      toast.success(`Student enrolled! ID: ${res.data.data.studentId}`);
      qc.invalidateQueries(['students']);
      navigate('/students');
    },
    onError: err => toast.error(err.response?.data?.message || 'Enrollment failed'),
  });

  return (
    <div className="max-w-2xl">
      <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors"
        onClick={() => navigate('/students')}>
        <ArrowLeft size={16} /> Back to Students
      </button>

      <form onSubmit={handleSubmit(data => mutation.mutate(data))}>
        {/* Bio data */}
        <div className="card mb-4">
          <div className="card-header"><h3 className="card-title">Bio Data</h3></div>
          <div className="card-body">
            <div className="grid grid-cols-2 gap-3">
              <FormGroup label="First Name" required error={errors.firstName?.message}>
                <input className="input" {...register('firstName', { required: 'Required' })} placeholder="e.g. Kofi" />
              </FormGroup>
              <FormGroup label="Last Name" required error={errors.lastName?.message}>
                <input className="input" {...register('lastName', { required: 'Required' })} placeholder="e.g. Mensah" />
              </FormGroup>
              <FormGroup label="Date of Birth" required error={errors.dateOfBirth?.message}>
                <input type="date" className="input" {...register('dateOfBirth', { required: 'Required' })} />
              </FormGroup>
              <FormGroup label="Gender" required error={errors.gender?.message}>
                <select className="select" {...register('gender', { required: 'Required' })}>
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </FormGroup>
              <FormGroup label="Class" required error={errors.classId?.message}>
                <select className="select" {...register('classId', { required: 'Required' })}>
                  <option value="">Select class...</option>
                  {classes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </FormGroup>
              <FormGroup label="Blood Group">
                <select className="select" {...register('bloodGroup')}>
                  <option value="">Unknown</option>
                  {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </FormGroup>
            </div>
          </div>
        </div>

        {/* Parent / Guardian */}
        <div className="card mb-4">
          <div className="card-header"><h3 className="card-title">Parent / Guardian</h3></div>
          <div className="card-body">
            <div className="grid grid-cols-2 gap-3">
              <FormGroup label="Parent Name" error={errors.parentName?.message}>
                <input className="input" {...register('parentName')} placeholder="Full name" />
              </FormGroup>
              <FormGroup label="Relationship">
                <select className="select" {...register('parentRelationship')}>
                  <option value="father">Father</option>
                  <option value="mother">Mother</option>
                  <option value="guardian">Guardian</option>
                </select>
              </FormGroup>
              <FormGroup label="Phone Number">
                <input className="input" {...register('parentPhone')} placeholder="+234..." />
              </FormGroup>
              <FormGroup label="Email">
                <input type="email" className="input" {...register('parentEmail')} placeholder="parent@email.com" />
              </FormGroup>
            </div>
          </div>
        </div>

        {/* Medical */}
        <div className="card mb-6">
          <div className="card-header"><h3 className="card-title">Medical Information</h3></div>
          <div className="card-body">
            <div className="grid grid-cols-2 gap-3">
              <FormGroup label="Allergies / Conditions" className="col-span-2">
                <textarea className="input min-h-20" {...register('allergies')} placeholder="Known allergies or medical conditions..." />
              </FormGroup>
              <FormGroup label="Emergency Contact">
                <input className="input" {...register('emergencyPhone')} placeholder="Emergency phone" />
              </FormGroup>
              <FormGroup label="Medical Notes">
                <input className="input" {...register('medicalNotes')} placeholder="Any other notes" />
              </FormGroup>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/students')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
            {mutation.isPending ? 'Enrolling...' : 'Enroll Student'}
          </button>
        </div>
      </form>
    </div>
  );
}
