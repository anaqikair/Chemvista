import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { User, LogIn, AlertCircle, CheckCircle2, LogOut, Sparkles, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function StudentAuth({ onStudentLoggedIn, currentStudentName }) {
  const { t, language } = useLanguage();
  const [studentNameInput, setStudentNameInput] = useState(currentStudentName || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (currentStudentName) {
      setStudentNameInput(currentStudentName);
    }
  }, [currentStudentName]);

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    const cleanName = studentNameInput.trim();

    if (!cleanName) {
      setError(t('emptyError'));
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

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
        setMessage(language === 'en' 
          ? `Welcome back, ${cleanName}! Your learning record has been loaded from Supabase.` 
          : `Selamat kembali, ${cleanName}! Rekod pembelajaran anda telah dimuatkan dari Supabase.`);
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

        setMessage(language === 'en'
          ? `Student account "${cleanName}" registered successfully! Your progress is ready to sync.`
          : `Akaun pelajar "${cleanName}" berjaya didaftarkan! Kemajuan anda sedia disinkronkan.`);
        onStudentLoggedIn({ name: cleanName, data: newRecord });
      }
    } catch (err) {
      setError(t('supabaseConnError'));
      onStudentLoggedIn({ name: cleanName, data: null });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setStudentNameInput('');
    setMessage(null);
    setError(null);
    onStudentLoggedIn(null);
  };

  if (currentStudentName) {
    return (
      <div className="screen-container" style={{ padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '75vh' }}>
        <div className="glass-card" style={{ maxWidth: '500px', width: '100%', padding: '32px', textAlign: 'center' }}>
          <div style={{ background: 'var(--accent-gradient)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 0 20px var(--accent-glow)' }}>
            <ShieldCheck size={32} color="white" />
          </div>
          <h2 className="gradient-text" style={{ fontSize: '26px', fontWeight: 800 }}>{t('activeStudentTitle')}</h2>
          <p style={{ fontSize: '18px', color: 'var(--text-main)', fontWeight: 700, margin: '8px 0' }}>
            {currentStudentName}
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
            {t('activeStudentDesc')}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button onClick={handleLogout} className="btn" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--color-unstable)', color: 'var(--color-unstable)', padding: '12px 24px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
              <LogOut size={16} /> {t('logoutBtn')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen-container" style={{ padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '75vh' }}>
      <div className="glass-card" style={{ maxWidth: '440px', width: '100%', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ background: 'var(--accent-gradient)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 0 20px var(--accent-glow)' }}>
            <Sparkles size={30} color="white" />
          </div>
          <h2 className="gradient-text" style={{ fontSize: '26px', fontWeight: 800 }}>
            {t('loginTitle')}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            {t('loginDesc')}
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-unstable)', padding: '12px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {message && (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-stable)', padding: '12px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <CheckCircle2 size={16} />
            {message}
          </div>
        )}

        <form onSubmit={handleStudentLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '14px', borderRadius: '8px', fontSize: '16px', fontWeight: 600, marginTop: '8px', opacity: loading ? 0.7 : 1 }}>
            {loading ? t('pleaseWait') : t('loginBtn')}
          </button>
        </form>
      </div>
    </div>
  );
}
