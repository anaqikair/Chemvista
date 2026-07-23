import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Users, BookOpen, Activity, AlertCircle, LogOut, RefreshCw } from 'lucide-react';

export default function TeacherDashboard() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [error, setError] = useState(null);
  const [studentsProgress, setStudentsProgress] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchStudentData();
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchStudentData();
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchStudentData = async () => {
    setFetchingData(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('student_progress')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setStudentsProgress(data || []);
    } catch (err) {
      console.warn('Could not fetch from Supabase table student_progress:', err);
      setError('Gagal memuatkan data dari Supabase. Pastikan jadual `student_progress` telah dicipta di Supabase SQL Editor.');
    } finally {
      setFetchingData(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (!session) {
    return (
      <div className="screen-container" style={{ padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div className="glass-card" style={{ maxWidth: '400px', width: '100%', padding: '30px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ background: 'var(--accent-gradient)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Users size={30} color="white" />
            </div>
            <h2 className="gradient-text" style={{ fontSize: '24px', fontWeight: 800 }}>Log Masuk Guru</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Akses papan pemuka kelas anda (Supabase Live)</p>
          </div>

          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-unstable)', padding: '12px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-main)', fontWeight: 600 }}>E-mel Guru</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-main)', outline: 'none' }}
                placeholder="guru@sekolah.edu.my"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-main)', fontWeight: 600 }}>Kata Laluan</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-main)', outline: 'none' }}
                placeholder="••••••••"
              />
            </div>
            <button type="submit" className="gradient-btn" disabled={loading} style={{ padding: '14px', borderRadius: '8px', fontSize: '16px', fontWeight: 600, marginTop: '8px', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Sila tunggu...' : 'Log Masuk'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const totalStudents = studentsProgress.length;
  const completedCount = studentsProgress.filter(s => s.ionic_completed && s.covalent_completed).length;
  const avgQuizScore = totalStudents > 0 
    ? Math.round(studentsProgress.reduce((acc, curr) => acc + (curr.quiz_score || 0), 0) / totalStudents)
    : 0;

  return (
    <div className="screen-container" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '32px', fontWeight: 800 }}>Papan Pemuka Guru</h1>
          <p style={{ color: 'var(--text-muted)' }}>Pantau kemajuan pelajar kelas anda secara masa nyata (Supabase).</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={fetchStudentData} className="btn" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
            <RefreshCw size={16} className={fetchingData ? 'animate-orbit-slow' : ''} /> Muat Semula
          </button>
          <button onClick={handleLogout} className="btn" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
            <LogOut size={16} /> Log Keluar
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '16px', borderRadius: '12px', color: 'var(--accent-blue)' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)' }}>{totalStudents}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Jumlah Pelajar Berdaftar</div>
          </div>
        </div>
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '16px', borderRadius: '12px', color: 'var(--accent-purple)' }}>
            <BookOpen size={24} />
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)' }}>{totalStudents > 0 ? Math.round((completedCount / totalStudents) * 100) : 0}%</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Selesai Kedua-dua Modul</div>
          </div>
        </div>
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '16px', borderRadius: '12px', color: 'var(--color-stable)' }}>
            <Activity size={24} />
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)' }}>{avgQuizScore}/100</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Purata Markah Kuiz</div>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '24px', overflowX: 'auto' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', color: 'var(--text-main)' }}>Status Kemajuan Pelajar</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '14px' }}>
              <th style={{ padding: '12px 16px' }}>Nama Pelajar</th>
              <th style={{ padding: '12px 16px' }}>Ikatan Ionik</th>
              <th style={{ padding: '12px 16px' }}>Ikatan Kovalen</th>
              <th style={{ padding: '12px 16px' }}>Markah Kuiz</th>
              <th style={{ padding: '12px 16px' }}>Kemaskini Terakhir</th>
            </tr>
          </thead>
          <tbody>
            {studentsProgress.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Tiada rekod pelajar dijumpai. Minta pelajar anda mendaftar / log masuk di tab <strong>Log Masuk Pelajar</strong> untuk melihat kemajuan mereka di sini.
                </td>
              </tr>
            ) : (
              studentsProgress.map((student) => (
                <tr key={student.id || student.student_name} style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '14px' }}>
                  <td style={{ padding: '16px', fontWeight: 600 }}>{student.student_name}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '12px', background: student.ionic_completed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: student.ionic_completed ? 'var(--color-stable)' : 'var(--color-unstable)' }}>
                      {student.ionic_completed ? 'Selesai' : 'Belum Selesai'}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '12px', background: student.covalent_completed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: student.covalent_completed ? 'var(--color-stable)' : 'var(--color-unstable)' }}>
                      {student.covalent_completed ? 'Selesai' : 'Belum Selesai'}
                    </span>
                  </td>
                  <td style={{ padding: '16px', fontWeight: 600, color: (student.quiz_score || 0) >= 80 ? 'var(--color-stable)' : ((student.quiz_score || 0) >= 50 ? 'var(--color-warning)' : 'var(--color-unstable)') }}>
                    {student.quiz_score || 0}%
                  </td>
                  <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '12px' }}>
                    {student.updated_at ? new Date(student.updated_at).toLocaleDateString() : 'Hari ini'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
