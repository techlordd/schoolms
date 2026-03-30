// src/pages/auth/ProfilePage.jsx
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { User, Lock, GraduationCap } from 'lucide-react';
import { authApi } from '../../api/endpoints';
import { FormGroup, Avatar, SectionHeader } from '../../components/ui';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();

  const { register: regProfile, handleSubmit: submitProfile, reset: resetProfile } = useForm();
  const { register: regPw, handleSubmit: submitPw, reset: resetPw, watch } = useForm();

  useEffect(() => {
    if (user) resetProfile({ firstName: user.firstName, lastName: user.lastName, phone: user.phone || '' });
  }, [user]);

  const profileMut = useMutation({
    mutationFn: data => authApi.updateMe(data),
    onSuccess: res => {
      updateUser(res.data.data);
      toast.success('Profile updated');
    },
    onError: () => toast.error('Failed to update profile'),
  });

  const pwMut = useMutation({
    mutationFn: data => authApi.changePassword(data),
    onSuccess: () => { toast.success('Password changed'); resetPw(); },
    onError: e => toast.error(e.response?.data?.message || 'Failed to change password'),
  });

  const roleLabel = {
    admin: 'Administrator', head_teacher: 'Head Teacher', teacher: 'Teacher',
    class_teacher: 'Class Teacher', student: 'Student', parent: 'Parent',
  }[user?.role] || 'User';

  return (
    <div className="max-w-xl space-y-5">
      {/* Profile header */}
      <div className="card">
        <div className="card-body flex items-center gap-5">
          <Avatar name={user ? `${user.firstName} ${user.lastName}` : ''} size="lg" />
          <div>
            <h2 className="text-base font-semibold text-gray-800">{user?.firstName} {user?.lastName}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{user?.email}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <GraduationCap size={13} className="text-primary-500" />
              <span className="text-xs text-primary-600 font-medium">{roleLabel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit profile */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title flex items-center gap-2"><User size={15} /> Personal Information</h3>
        </div>
        <div className="card-body">
          <form onSubmit={submitProfile(d => profileMut.mutate(d))} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <FormGroup label="First Name" required>
                <input className="input" {...regProfile('firstName', { required: true })} />
              </FormGroup>
              <FormGroup label="Last Name" required>
                <input className="input" {...regProfile('lastName', { required: true })} />
              </FormGroup>
            </div>
            <FormGroup label="Phone Number">
              <input className="input" {...regProfile('phone')} placeholder="+234..." />
            </FormGroup>
            <FormGroup label="Email Address">
              <input className="input" value={user?.email || ''} disabled
                style={{ opacity: 0.5, cursor: 'not-allowed' }} />
            </FormGroup>
            <div className="flex justify-end pt-1">
              <button type="submit" className="btn btn-primary" disabled={profileMut.isPending}>
                {profileMut.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Change password */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title flex items-center gap-2"><Lock size={15} /> Change Password</h3>
        </div>
        <div className="card-body">
          <form onSubmit={submitPw(d => pwMut.mutate(d))} className="space-y-3">
            <FormGroup label="Current Password" required>
              <input type="password" className="input" {...regPw('currentPassword', { required: true })} />
            </FormGroup>
            <FormGroup label="New Password" required>
              <input type="password" className="input"
                {...regPw('newPassword', { required: true, minLength: { value: 8, message: 'Min 8 characters' } })} />
            </FormGroup>
            <FormGroup label="Confirm New Password" required>
              <input type="password" className="input"
                {...regPw('confirmPassword', {
                  required: true,
                  validate: val => val === watch('newPassword') || 'Passwords do not match',
                })} />
            </FormGroup>
            <div className="flex justify-end pt-1">
              <button type="submit" className="btn btn-primary" disabled={pwMut.isPending}>
                {pwMut.isPending ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* School info */}
      <div className="card">
        <div className="card-header"><h3 className="card-title">School Information</h3></div>
        <div className="card-body space-y-2">
          {[
            ['School Name',    user?.school?.name     || '—'],
            ['School Code',    user?.school?.code     || '—'],
            ['Academic Year',  user?.school?.currentYear || '—'],
            ['Current Term',   user?.school?.currentTerm ? `Term ${user.school.currentTerm}` : '—'],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between py-1.5 border-b border-gray-50 last:border-0">
              <span className="text-xs text-gray-400">{label}</span>
              <span className="text-xs font-medium text-gray-700">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
