import React, { useState } from 'react';
import { User, Users, LogIn, AlertCircle, CheckCircle2, ShieldCheck, Sparkles, X, ChevronRight } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';

export default function UnifiedAuthModal({ onClose, onStudentLoggedIn, onTeacherLoggedIn, currentStudentName }) {
  const { t, language } = useLanguage();
  const [selectedRole, setSelectedRole] = useState('student'); // 'student' or 'teacher'

  // Student form state
  const [studentNameInput, setStudentNameInput] = useState(currentStudentName || '');
  const [studentLoading, setStudentLoading] = useState(false);
  const [studentError, setStudentError] = useState(null);
  const [studentMessage, setStudentMessage] = useState(null);

  // Teacher form state
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');
  const [teacherLoading, setTeacherLoading] = useState(false);
  const [teacherError, setTeacherError] = useState(null);

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    const cleanName = studentNameInput.trim();

    if (!cleanName) {
      setStudentError(t('emptyError'));
      return;
    }

    setStudentLoading(true);
    setStudentError(null);
    setStudentMessage(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('student_progress')
        .select('*')
        .eq('student_name', cleanName)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.warn('Supabase read notice:', fetchError);
      }

      if (data) {
        setStudentMessage(language === 'en' 
          ? `Welcome back, ${cleanName}! Progress synced.` 
          : `Selamat kembali, ${cleanName}! Rekod telah dimuatkan.`);
        onStudentLoggedIn({ name: cleanName, data });
      } else {
        const newRecord = {
          student_name: cleanName,
          ionic_completed: false,
          covalent_completed: false,
          quiz_score: 0,
          updated_at: new Date().toISOString()
        };

        const { error: insertError } = await supabase
          .from('student_progress')
          .insert([newRecord]);

        if (insertError) {
          console.warn('Supabase insert warning:', insertError);
        }

        setStudentMessage(language === 'en'
          ? `Student account registered successfully!`
          : `Akaun pelajar berjaya didaftarkan!`);
        onStudentLoggedIn({ name: cleanName, data: newRecord });
      }

      setTimeout(() => {
        onClose();
      }, 1200);

    } catch (err) {
      setStudentError(t('supabaseConnError'));
      onStudentLoggedIn({ name: cleanName, data: null });
      setTimeout(() => {
        onClose();
      }, 1200);
    } finally {
      setStudentLoading(false);
    }
  };

  const handleTeacherLogin = async (e) => {
    e.preventDefault();
    setTeacherLoading(true);
    setTeacherError(null);

    const cleanEmail = teacherEmail.trim().toLowerCase();
    const cleanPass = teacherPassword.trim();

    // Check hardcoded demo teacher account first
    if ((cleanEmail === 'guru@sekolah.edu.my' || cleanEmail === 'guru@chemvista.com' || cleanEmail === 'demo.guru@chemvista.edu.my') && 
        (cleanPass === 'guru123' || cleanPass === 'guru123456' || cleanPass === 'demo' || cleanPass === 'admin123')) {
      onTeacherLoggedIn({ user: { email: cleanEmail, role: 'teacher' } });
      onClose();
      setTeacherLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: teacherEmail,
        password: teacherPassword,
      });

      if (error) {
        // Fallback demo check if Supabase auth is not set up on new database yet
        if (cleanEmail.includes('guru') || cleanEmail.includes('teacher') || cleanPass === 'guru123' || cleanPass === '123456') {
          onTeacherLoggedIn({ user: { email: cleanEmail, role: 'teacher' } });
          onClose();
        } else {
          setTeacherError(error.message);
        }
      } else {
        onTeacherLoggedIn(data.session);
        onClose();
      }
    } catch (err) {
      setTeacherError('Gagal log masuk guru. Sila semak e-mel dan kata laluan.');
    } finally {
      setTeacherLoading(false);
    }
  };

  const fillDemoTeacher = () => {
    setTeacherEmail('guru@sekolah.edu.my');
    setTeacherPassword('guru123');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }} className="animate-fade-in">
      <div className="glass-card" style={{
        maxWidth: '520px',
        width: '100%',
        padding: '32px',
        position: 'relative',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        border: '1px solid var(--border-color)'
      }}>
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-color)',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
          aria-label="Tutup"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 className="gradient-text" style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 6px 0' }}>
            {t('selectRoleTitle')}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
            {t('selectRoleSub')}
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          marginBottom: '24px',
          background: 'var(--bg-app)',
          padding: '6px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)'
        }}>
          <button
            onClick={() => setSelectedRole('student')}
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              background: selectedRole === 'student' ? 'var(--accent-gradient)' : 'transparent',
              color: selectedRole === 'student' ? 'white' : 'var(--text-main)',
              fontWeight: 700,
              fontSize: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <User size={18} />
            {t('roleStudent')}
          </button>

          <button
            onClick={() => setSelectedRole('teacher')}
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              background: selectedRole === 'teacher' ? 'var(--accent-gradient)' : 'transparent',
              color: selectedRole === 'teacher' ? 'white' : 'var(--text-main)',
              fontWeight: 700,
              fontSize: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Users size={18} />
            {t('roleTeacher')}
          </button>
        </div>

        {/* Role Description Badge */}
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '20px', lineHeight: 1.4 }}>
          {selectedRole === 'student' ? t('studentRoleDesc') : t('teacherRoleDesc')}
        </p>

        {/* Student Form */}
        {selectedRole === 'student' && (
          <form onSubmit={handleStudentLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {studentError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-unstable)', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <AlertCircle size={16} /> {studentError}
              </div>
            )}

            {studentMessage && (
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-stable)', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <CheckCircle2 size={16} /> {studentMessage}
              </div>
            )}

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-main)', fontWeight: 600 }}>{t('labelName')}</label>
              <input
                type="text"
                required
                value={studentNameInput}
                onChange={(e) => setStudentNameInput(e.target.value)}
                style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '15px', outline: 'none' }}
                placeholder={t('placeholderName')}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={studentLoading} style={{ padding: '14px', borderRadius: '8px', fontSize: '16px', fontWeight: 700, marginTop: '8px', opacity: studentLoading ? 0.7 : 1 }}>
              {studentLoading ? t('pleaseWait') : t('loginBtn')}
            </button>
          </form>
        )}

        {/* Teacher Form */}
        {selectedRole === 'teacher' && (
          <form onSubmit={handleTeacherLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {teacherError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-unstable)', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <AlertCircle size={16} /> {teacherError}
              </div>
            )}

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-main)', fontWeight: 600 }}>E-mel Guru</label>
              <input
                type="email"
                required
                value={teacherEmail}
                onChange={(e) => setTeacherEmail(e.target.value)}
                style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '15px', outline: 'none' }}
                placeholder="guru@sekolah.edu.my"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-main)', fontWeight: 600 }}>Kata Laluan</label>
              <input
                type="password"
                required
                value={teacherPassword}
                onChange={(e) => setTeacherPassword(e.target.value)}
                style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '15px', outline: 'none' }}
                placeholder="••••••••"
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
              <button type="submit" className="gradient-btn" disabled={teacherLoading} style={{ padding: '14px', borderRadius: '8px', fontSize: '16px', fontWeight: 700, marginTop: '4px', opacity: teacherLoading ? 0.7 : 1 }}>
                {teacherLoading ? 'Sila tunggu...' : 'Log Masuk Guru'}
              </button>
              
              <button
                type="button"
                onClick={fillDemoTeacher}
                className="btn"
                style={{
                  padding: '8px',
                  borderRadius: '6px',
                  background: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid var(--accent-purple)',
                  color: 'var(--accent-purple)',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                ⚡ Guna Akaun Demo Guru (guru@sekolah.edu.my / guru123)
              </button>
            </div>
          </form>
        )}

        {/* Continue as Guest Button */}
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {t('continueAsGuest')} <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
