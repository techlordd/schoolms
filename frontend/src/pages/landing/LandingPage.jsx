// src/pages/landing/LandingPage.jsx
import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  GraduationCap, Video, FileText, CheckCircle,
  ArrowRight, Star, Users, Award, Clock, BookOpen,
  ChevronRight, Play,
} from 'lucide-react';

// ─── Small reusable pieces ───────────────────────────────────────────────────

function Logo({ light = false }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center flex-shrink-0">
        <GraduationCap size={20} className="text-white" />
      </div>
      <span className={`font-bold text-lg leading-none ${light ? 'text-white' : 'text-primary-700'}`}>
        SmartMathz
      </span>
    </div>
  );
}

function StatItem({ value, label }) {
  return (
    <div className="text-center py-6 px-4">
      <div className="text-3xl font-bold text-primary-700 mb-1">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}

function ServiceCard({ icon: Icon, title, desc, badge }) {
  return (
    <div className="card relative p-6 hover:shadow-md transition-shadow">
      {badge && (
        <span className="absolute top-4 right-4 bg-accent text-white text-xs font-semibold px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
      <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
        <Icon size={22} className="text-primary-600" />
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function StepItem({ number, title, desc }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg mb-4 flex-shrink-0"
        style={{ backgroundColor: '#f4a261' }}
      >
        {number}
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed max-w-xs">{desc}</p>
    </div>
  );
}

function TestimonialCard({ name, role, quote }) {
  return (
    <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
      <div className="flex gap-1 mb-3">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={14} className="text-accent fill-accent" />
        ))}
      </div>
      <p className="text-white/90 text-sm leading-relaxed mb-4">"{quote}"</p>
      <div>
        <div className="text-white font-semibold text-sm">{name}</div>
        <div className="text-white/50 text-xs">{role}</div>
      </div>
    </div>
  );
}

function SuccessState() {
  return (
    <div className="flex flex-col items-center text-center py-12">
      <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mb-4">
        <CheckCircle size={36} className="text-primary-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        You're booked in!
      </h3>
      <p className="text-gray-500 max-w-sm">
        We'll be in touch within 24 hours to confirm your free trial session.
        Check your inbox for a confirmation email.
      </p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef(null);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const scrollToForm = () =>
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const onSubmit = () => setSubmitted(true);

  return (
    <div className="font-sans antialiased text-gray-800" style={{ fontFamily: 'Sora, sans-serif' }}>

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <button
              onClick={scrollToForm}
              className="hidden sm:inline-flex btn btn-ghost btn-sm text-primary-700"
            >
              Book Free Trial
            </button>
            <Link to="/login" className="btn btn-primary btn-sm">
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section
        className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-20"
        style={{ background: 'linear-gradient(135deg, #1a5f4a 0%, #14503e 60%, #0e3d2f 100%)' }}
      >
        <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-white/80 text-sm mb-8">
          <Play size={12} className="text-accent fill-accent" />
          Trusted by 2,400+ K–12 students across the globe
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight max-w-3xl mb-6">
          Expert 1-on-1 Math Tutoring
          <span className="block" style={{ color: '#f4a261' }}> for K–12 Students</span>
        </h1>

        <p className="text-lg text-white/75 max-w-xl leading-relaxed mb-10">
          Live online sessions tailored to your child's curriculum, pace, and learning style.
          Real results, real confidence — starting with a{' '}
          <strong className="text-white">free trial session</strong>.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={scrollToForm}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-white text-base transition-transform hover:scale-105 active:scale-95"
            style={{ backgroundColor: '#f4a261' }}
          >
            Book Your FREE Trial Session
            <ArrowRight size={18} />
          </button>
          <button
            onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-white text-base border border-white/30 hover:bg-white/10 transition-colors"
          >
            See How It Works
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="mt-12 flex items-center gap-6 text-white/60 text-sm">
          <span className="flex items-center gap-1"><CheckCircle size={14} className="text-green-400" /> No credit card required</span>
          <span className="flex items-center gap-1"><CheckCircle size={14} className="text-green-400" /> Cancel any time</span>
          <span className="flex items-center gap-1"><CheckCircle size={14} className="text-green-400" /> 30-min intro session</span>
        </div>
      </section>

      {/* ── Stats bar ──────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100">
            <StatItem value="2,400+" label="Students Tutored" />
            <StatItem value="98%" label="Grade Improvement" />
            <StatItem value="4.9/5" label="Average Rating" />
            <StatItem value="50+" label="Expert Tutors" />
          </div>
        </div>
      </section>

      {/* ── Services ───────────────────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">What SmartMathz Offers</h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Everything your child needs to master maths — from live tutoring to self-paced practice.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <ServiceCard
              icon={Users}
              title="1-on-1 Online Tutoring"
              desc="Live sessions with a dedicated tutor, tailored exactly to your child's grade, curriculum, and learning pace."
              badge="Most Popular"
            />
            <ServiceCard
              icon={Video}
              title="Math Video Library"
              desc="Hundreds of concept videos for K–12, organized by grade and topic so your child can revisit lessons any time."
            />
            <ServiceCard
              icon={FileText}
              title="Quizzes & Worksheets"
              desc="Interactive quizzes and printable worksheets that reinforce every lesson and track progress over time."
            />
            <ServiceCard
              icon={BookOpen}
              title="Curriculum-Aligned Content"
              desc="All resources are aligned to major curricula including Common Core, GCSE, and Cambridge."
            />
            <ServiceCard
              icon={Award}
              title="Progress Reports"
              desc="Regular progress updates so parents always know how their child is improving and what to focus on next."
            />
            <ServiceCard
              icon={Clock}
              title="Flexible Scheduling"
              desc="Book sessions at times that suit your family — mornings, evenings, or weekends, across all time zones."
            />
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Get Started in 3 Simple Steps</h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              From booking to your first lesson — it takes less than 5 minutes.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-10 relative">
            {/* connector line (desktop only) */}
            <div className="hidden sm:block absolute top-6 left-1/6 right-1/6 h-px bg-gray-200" />
            <StepItem
              number="1"
              title="Book a Free Trial"
              desc="Fill in the short form below. No credit card, no commitment — just a quick intro to see if we're a great fit."
            />
            <StepItem
              number="2"
              title="Meet Your Tutor"
              desc="We'll match your child with the perfect tutor and schedule a 30-minute intro session at a time that suits you."
            />
            <StepItem
              number="3"
              title="Watch Them Thrive"
              desc="After the trial, we create a personalised learning plan and your child starts seeing real results — fast."
            />
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────────────────── */}
      <section
        className="py-20"
        style={{ background: 'linear-gradient(135deg, #1a5f4a 0%, #0e3d2f 100%)' }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">What Parents Are Saying</h2>
            <p className="text-white/60 max-w-lg mx-auto">
              Join thousands of families who have seen real improvements in their child's maths grades.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            <TestimonialCard
              name="Sarah M."
              role="Parent of Grade 7 student"
              quote="My son went from a C to an A in just one term. The tutor is incredibly patient and explains concepts in a way that finally clicks for him."
            />
            <TestimonialCard
              name="David O."
              role="Parent of Grade 10 student"
              quote="The live sessions are so convenient. My daughter logs in from home and learns entirely at her own pace. Her confidence has grown enormously."
            />
            <TestimonialCard
              name="Priya K."
              role="Parent of Grade 5 student"
              quote="The worksheets and quizzes are brilliant for extra practice. She actually looks forward to doing maths now — I never thought that would happen!"
            />
          </div>
        </div>
      </section>

      {/* ── Booking Form ───────────────────────────────────────────────────── */}
      <section ref={formRef} id="booking" className="py-20 bg-gray-50 scroll-mt-16">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Book Your FREE Trial Session</h2>
            <p className="text-gray-500">
              No credit card required. No commitment. Just great maths tutoring.
            </p>
          </div>

          <div className="card p-8">
            {submitted ? (
              <SuccessState />
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  {/* Name */}
                  <div className="form-group">
                    <label className="label">Parent / Student Name <span className="text-red-500">*</span></label>
                    <input
                      className={`input ${errors.name ? 'border-red-400 focus:border-red-400' : ''}`}
                      placeholder="e.g. James Wilson"
                      {...register('name', { required: 'Name is required' })}
                    />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                  </div>

                  {/* Email */}
                  <div className="form-group">
                    <label className="label">Email Address <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      className={`input ${errors.email ? 'border-red-400 focus:border-red-400' : ''}`}
                      placeholder="you@example.com"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' },
                      })}
                    />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                  </div>

                  {/* Grade */}
                  <div className="form-group">
                    <label className="label">Child's Grade Level <span className="text-red-500">*</span></label>
                    <select
                      className={`input ${errors.grade ? 'border-red-400 focus:border-red-400' : ''}`}
                      {...register('grade', { required: 'Please select a grade' })}
                    >
                      <option value="">Select grade…</option>
                      {['Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
                        'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'].map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                    {errors.grade && <p className="text-xs text-red-500 mt-1">{errors.grade.message}</p>}
                  </div>

                  {/* Preferred time */}
                  <div className="form-group">
                    <label className="label">Preferred Session Time <span className="text-red-500">*</span></label>
                    <select
                      className={`input ${errors.preferredTime ? 'border-red-400 focus:border-red-400' : ''}`}
                      {...register('preferredTime', { required: 'Please select a preferred time' })}
                    >
                      <option value="">Select time…</option>
                      <option value="weekday_morning">Weekday Mornings</option>
                      <option value="weekday_afternoon">Weekday Afternoons</option>
                      <option value="weekday_evening">Weekday Evenings</option>
                      <option value="weekend">Weekends</option>
                    </select>
                    {errors.preferredTime && <p className="text-xs text-red-500 mt-1">{errors.preferredTime.message}</p>}
                  </div>
                </div>

                {/* Message */}
                <div className="form-group mb-6">
                  <label className="label">Anything else we should know? <span className="text-gray-400 font-normal">(optional)</span></label>
                  <textarea
                    className="input resize-none"
                    rows={3}
                    placeholder="e.g. specific topics struggling with, upcoming exams, curriculum type…"
                    {...register('message')}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-full justify-center py-3 text-base gap-2"
                >
                  Reserve My Free Trial
                  <ArrowRight size={18} />
                </button>

                <p className="text-center text-xs text-gray-400 mt-4">
                  By submitting you agree to be contacted by SmartMathz. No spam, ever.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer
        className="py-10 text-center"
        style={{ backgroundColor: '#0e3d2f' }}
      >
        <div className="flex justify-center mb-4">
          <Logo light />
        </div>
        <p className="text-white/40 text-sm mb-3">
          &copy; {new Date().getFullYear()} SmartMathz. All rights reserved.
        </p>
        <Link to="/login" className="text-white/30 hover:text-white/60 text-xs transition-colors">
          Staff / Tutor Login
        </Link>
      </footer>
    </div>
  );
}
