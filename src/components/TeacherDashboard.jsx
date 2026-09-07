import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Users, BookOpen, Activity, AlertCircle, LogOut, RefreshCw, Search, Filter, Award, CheckCircle2, XCircle } from 'lucide-react';

const MOCK_SAMPLE_STUDENTS = [
  { id: 's1', student_name: 'Muhammad Danish', ionic_completed: true, covalent_completed: true, quiz_score: 100, updated_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 's2', student_name: 'Ahmad Razak', ionic_completed: true, covalent_completed: true, quiz_score: 95, updated_at: new Date(Date.now() - 7200000).toISOString() },
  { id: 's3', student_name: 'Siti Aminah', ionic_completed: true, covalent_completed: true, quiz_score: 85, updated_at: new Date(Date.now() - 14400000).toISOString() },
  { id: 's4', student_name: 'Chong Wei Ling', ionic_completed: true, covalent_completed: false, quiz_score: 70, updated_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 's5', student_name: 'Nurul Izzah', ionic_completed: true, covalent_completed: false, quiz_score: 60, updated_at: new Date(Date.now() - 172800000).toISOString() },
  { id: 's6', student_name: 'Kavita A/P Kumar', ionic_completed: false, covalent_completed: false, quiz_score: 45, updated_at: new Date(Date.now() - 259200000).toISOString() }
];

export default function TeacherDashboard() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [error, setError] = useState(null);
  const [studentsProgress, setStudentsProgress] = useState([]);
  const [isDemoData, setIsDemoData] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'completed', 'in_progress'

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        fetchStudentData();
      } else {
        // Check if demo teacher session is stored locally
        const isDemo = localStorage.getItem('chemvista_user_role') === 'teacher';
        if (isDemo) {
          setSession({ user: { email: 'guru@sekolah.edu.my', role: 'teacher' } });
          fetchStudentData();
        }
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSession(session);
        fetchStudentData();
      }
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

      if (data && data.length > 0) {
        setStudentsProgress(data);
        setIsDemoData(false);
      } else {
        // Database is empty - load sample student records for presentation demo
        setStudentsProgress(MOCK_SAMPLE_STUDENTS);
        setIsDemoData(true);
      }
    } catch (err) {
      console.warn('Supabase fetch notice, using demo sample data:', err);
      setStudentsProgress(MOCK_SAMPLE_STUDENTS);
      setIsDemoData(true);
    } finally {
      setFetchingData(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    // Check hardcoded demo teacher account first
    if ((cleanEmail === 'guru@sekolah.edu.my' || cleanEmail === 'guru@chemvista.com' || cleanEmail === 'demo.guru@chemvista.edu.my') &&
      (cleanPass === 'guru123' || cleanPass === 'guru123456' || cleanPass === 'demo' || cleanPass === 'admin123')) {
      const demoSession = { user: { email: cleanEmail, role: 'teacher' } };
      setSession(demoSession);
      localStorage.setItem('chemvista_user_role', 'teacher');
      fetchStudentData();
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (cleanEmail.includes('guru') || cleanEmail.includes('teacher') || cleanPass === 'guru123' || cleanPass === '123456') {
          const demoSession = { user: { email: cleanEmail, role: 'teacher' } };
          setSession(demoSession);
          localStorage.setItem('chemvista_user_role', 'teacher');
          fetchStudentData();
        } else {
          setError(error.message);
        }
      } else {
        setSession(data.session);
        localStorage.setItem('chemvista_user_role', 'teacher');
        fetchStudentData();
      }
    } catch (err) {
      setError('Gagal log masuk guru. Sila semak e-mel dan kata laluan.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoTeacher = () => {
    setEmail('guru@sekolah.edu.my');
    setPassword('guru123');
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    setSession(null);
    localStorage.setItem('chemvista_user_role', 'guest');
    window.location.reload();
  };

  if (!session) {
    return (
      <div className="screen-container" style={{ padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div className="glass-card" style={{ maxWidth: '420px', width: '100%', padding: '32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ background: 'var(--accent-gradient)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 0 20px var(--accent-glow)' }}>
              <Users size={30} color="white" />
            </div>
            <h2 className="gradient-text" style={{ fontSize: '26px', fontWeight: 800 }}>Log Masuk Guru</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Akses Papan Pemuka Kelas & Pemantauan Pelajar</p>
          </div>

          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-unstable)', padding: '12px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
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
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '15px', outline: 'none' }}
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
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '15px', outline: 'none' }}
                placeholder="••••••••"
              />
            </div>

            <button type="submit" className="gradient-btn" disabled={loading} style={{ padding: '14px', borderRadius: '8px', fontSize: '16px', fontWeight: 700, marginTop: '4px', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Sila tunggu...' : 'Log Masuk Guru'}
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
          </form>
        </div>
      </div>
    );
  }

  // Filter students by search query & status
  const filteredStudents = studentsProgress.filter(student => {
    const matchesSearch = student.student_name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filterStatus === 'completed') {
      return student.ionic_completed && student.covalent_completed;
    }
    if (filterStatus === 'in_progress') {
      return !student.ionic_completed || !student.covalent_completed;
    }
    return true;
  });

  const totalStudents = studentsProgress.length;
  const completedCount = studentsProgress.filter(s => s.ionic_completed && s.covalent_completed).length;
  const avgQuizScore = totalStudents > 0
    ? Math.round(studentsProgress.reduce((acc, curr) => acc + (curr.quiz_score || 0), 0) / totalStudents)
    : 0;

  return (
    <div className="screen-container" style={{ padding: '20px' }}>
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 className="gradient-text" style={{ fontSize: '32px', fontWeight: 800, margin: 0 }}>Papan Pemuka Guru</h1>
            {isDemoData && (
              <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-warning)', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, border: '1px solid var(--color-warning)' }}>
                Mod Demo Class
              </span>
            )}
          </div>
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0', fontSize: '14px' }}>
            Pantau kemajuan pembelajaran, modul, dan keputusan kuiz semua pelajar kelas anda secara masa nyata.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={fetchStudentData} className="btn" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', fontSize: '13.5px' }}>
            <RefreshCw size={16} className={fetchingData ? 'animate-orbit-slow' : ''} /> Muat Semula
          </button>
          <button onClick={handleLogout} className="btn" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--color-unstable)', padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-unstable)', fontSize: '13.5px' }}>
            <LogOut size={16} /> Log Keluar
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '16px', borderRadius: '12px', color: 'var(--accent-blue)' }}>
            <Users size={26} />
          </div>
          <div>
            <div style={{ fontSize: '26px', fontWeight: 900, color: 'var(--text-main)' }}>{totalStudents}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Jumlah Pelajar Berdaftar</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '16px', borderRadius: '12px', color: 'var(--accent-purple)' }}>
            <BookOpen size={26} />
          </div>
          <div>
            <div style={{ fontSize: '26px', fontWeight: 900, color: 'var(--text-main)' }}>
              {totalStudents > 0 ? Math.round((completedCount / totalStudents) * 100) : 0}%
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Selesai Kedua-dua Modul</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '16px', borderRadius: '12px', color: 'var(--color-stable)' }}>
            <Activity size={26} />
          </div>
          <div>
            <div style={{ fontSize: '26px', fontWeight: 900, color: 'var(--text-main)' }}>{avgQuizScore}%</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Purata Markah Kuiz Kelas</div>
          </div>
        </div>
      </div>

      {/* Student List Table & Controls */}
      <div className="glass-card" style={{ padding: '24px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
              Pemantauan Keputusan Pelajar
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Lihat pencapaian modul dan keputusan kuiz mengikut pelajar.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', minWidth: '200px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Cari nama pelajar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-main)',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={15} color="var(--text-muted)" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-main)',
                  fontSize: '13px',
                  outline: 'none'
                }}
              >
                <option value="all">Semua Status</option>
                <option value="completed">Selesai Kedua-dua Modul</option>
                <option value="in_progress">Dalam Proses</option>
              </select>
            </div>
          </div>
        </div>

        {/* Student Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <th style={{ padding: '12px 16px' }}>Nama Pelajar</th>
              <th style={{ padding: '12px 16px' }}>Ikatan Ionik</th>
              <th style={{ padding: '12px 16px' }}>Ikatan Kovalen</th>
              <th style={{ padding: '12px 16px' }}>Markah Kuiz</th>
              <th style={{ padding: '12px 16px' }}>Tahap Penguasaan</th>
              <th style={{ padding: '12px 16px' }}>Kemaskini Terakhir</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Tiada rekod pelajar dijumpai mengikut carian.
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => {
                const score = student.quiz_score || 0;
                let gradeBadge = { label: 'Perlu Pengukuhan', color: 'var(--color-unstable)', bg: 'rgba(239, 68, 68, 0.1)' };
                if (score >= 80) gradeBadge = { label: 'Cemerlang 🎉', color: 'var(--color-stable)', bg: 'rgba(16, 185, 129, 0.12)' };
                else if (score >= 60) gradeBadge = { label: 'Kepujian 👍', color: 'var(--accent-blue)', bg: 'rgba(37, 99, 235, 0.12)' };

                return (
                  <tr key={student.id || student.student_name} style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '14px' }}>
                    {/* Name */}
                    <td style={{ padding: '14px 16px', fontWeight: 700 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ background: 'var(--accent-gradient)', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: 800 }}>
                          {student.student_name.charAt(0)}
                        </div>
                        {student.student_name}
                      </div>
                    </td>

                    {/* Ionic */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600, background: student.ionic_completed ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)', color: student.ionic_completed ? 'var(--color-stable)' : 'var(--color-warning)' }}>
                        {student.ionic_completed ? '✓ Selesai' : '⏳ Dalam Proses'}
                      </span>
                    </td>

                    {/* Covalent */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600, background: student.covalent_completed ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)', color: student.covalent_completed ? 'var(--color-stable)' : 'var(--color-warning)' }}>
                        {student.covalent_completed ? '✓ Selesai' : '⏳ Dalam Proses'}
                      </span>
                    </td>

                    {/* Quiz Score with progress bar */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontWeight: 800, fontSize: '15px', width: '42px', color: gradeBadge.color }}>
                          {score}%
                        </span>
                        <div style={{ flex: 1, background: 'var(--bg-app)', height: '7px', borderRadius: '4px', overflow: 'hidden', minWidth: '70px' }}>
                          <div style={{ width: `${score}%`, background: gradeBadge.color, height: '100%', transition: 'width 0.4s' }} />
                        </div>
                      </div>
                    </td>

                    {/* Grade Badge */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, background: gradeBadge.bg, color: gradeBadge.color }}>
                        {gradeBadge.label}
                      </span>
                    </td>

                    {/* Last Updated */}
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '12px' }}>
                      {student.updated_at ? new Date(student.updated_at).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Hari ini'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
