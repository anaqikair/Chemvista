import { BookOpen, Trophy, RefreshCw, Percent, UserCheck, Cloud } from 'lucide-react';

export default function ProgressDashboard({ userProgress, onResetProgress, studentName, setStudentName }) {
  const totalLessons = 2;
  const completedLessons = (userProgress.ionicCompleted ? 1 : 0) + (userProgress.covalentCompleted ? 1 : 0);
  const lessonsProgressPercent = Math.round((completedLessons / totalLessons) * 100);

  const moleculesList = [
    { key: 'H2', name: 'Hidrogen (H₂)' },
    { key: 'HCl', name: 'Hidrogen Klorida (HCl)' },
    { key: 'H2O', name: 'Air (H₂O)' },
    { key: 'NH3', name: 'Amonia (NH₃)' },
    { key: 'CH4', name: 'Metana (CH₄)' },
    { key: 'O2', name: 'Oksigen (O₂)' },
    { key: 'CO2', name: 'Karbon Dioksida (CO₂)' },
    { key: 'N2', name: 'Nitrogen (N₂)' }
  ];

  return (
    <div className="screen-container">
      {/* Title */}
      <div style={{ textAlign: 'center' }}>
        <h1 className="gradient-text" style={{ margin: '0 0 8px 0', fontSize: '32px' }}>Papan Kemajuan</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
          Jejak status pembelajaran anda, pencapaian modul, dan keputusan kuiz.
        </p>
      </div>

      {/* Student Session Banner */}
      <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', background: 'var(--bg-card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'var(--accent-gradient)', padding: '10px', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserCheck size={18} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>
              Status Pelajar: {studentName ? <span style={{ color: 'var(--accent-blue)' }}>{studentName}</span> : <span style={{ color: 'var(--text-muted)' }}>Luar Talian / Belum Log Masuk</span>}
            </h4>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
              {studentName ? 'Kemajuan anda akan disinkronkan secara automatik ke Papan Pemuka Guru.' : 'Log masuk di tab Log Masuk Pelajar untuk menyimpan rekod anda.'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: studentName ? 'var(--color-stable)' : 'var(--color-warning)', fontWeight: 600 }}>
          <Cloud size={18} />
          <span>{studentName ? 'Supabase Disinkronkan' : 'Mod Tempatan'}</span>
        </div>
      </div>

      {/* Stats Cards grid */}
      <div className="grid-cols-3" style={{ gap: '20px' }}>
        {/* Card 1: Lessons Progress */}
        <div className="glass card" style={{ padding: '20px', alignItems: 'center', textAlign: 'center' }}>
          <BookOpen size={32} color="var(--accent-blue)" />
          <h3 style={{ fontSize: '16px', fontWeight: 650, marginTop: '8px' }}>Modul Teori</h3>
          <div style={{ fontSize: '28px', fontWeight: 800, margin: '6px 0' }}>{completedLessons} / {totalLessons}</div>
          <div style={{
            background: 'var(--bg-app)',
            height: '6px',
            borderRadius: '3px',
            width: '100%',
            overflow: 'hidden'
          }}>
            <div style={{
              background: 'var(--accent-blue)',
              height: '100%',
              width: `${lessonsProgressPercent}%`
            }} />
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {lessonsProgressPercent}% Selesai
          </span>
        </div>

        {/* Card 2: Quiz Score Average */}
        <div className="glass card" style={{ padding: '20px', alignItems: 'center', textAlign: 'center' }}>
          <Percent size={32} color="var(--color-warning)" />
          <h3 style={{ fontSize: '16px', fontWeight: 650, marginTop: '8px' }}>Skor Kuiz</h3>
          <div style={{ fontSize: '28px', fontWeight: 800, margin: '6px 0' }}>
            {userProgress.quizHighScore > 0 ? `${userProgress.quizHighScore} Mata` : 'Tiada Rekod'}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Rekod markah tertinggi anda
          </span>
        </div>

        {/* Card 3: Molecules Crafted */}
        <div className="glass card" style={{ padding: '20px', alignItems: 'center', textAlign: 'center' }}>
          <Trophy size={32} color="var(--accent-purple)" />
          <h3 style={{ fontSize: '16px', fontWeight: 650, marginTop: '8px' }}>Molekul Kovalen</h3>
          <div style={{ fontSize: '28px', fontWeight: 800, margin: '6px 0' }}>
            {userProgress.covalentCompleted ? '8 / 8' : '0 / 8'}
          </div>
          <div style={{
            background: 'var(--bg-app)',
            height: '6px',
            borderRadius: '3px',
            width: '100%',
            overflow: 'hidden'
          }}>
            <div style={{
              background: 'var(--accent-purple)',
              height: '100%',
              width: userProgress.covalentCompleted ? '100%' : '0%'
            }} />
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Molekul berjaya dibina
          </span>
        </div>
      </div>

      <div className="grid-cols-2" style={{ gap: '20px', gridTemplateColumns: '1.3fr 0.7fr' }}>
        {/* Left: Covalent molecules checkboard */}
        <div className="glass card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>
            Senarai Semak Pembinaan Molekul
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
            Molekul kovalen berikut tersedia untuk dibina di dalam Modul 2.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: '10px'
          }}>
            {moleculesList.map((mol) => {
              const isDone = userProgress.covalentCompleted; // simplified state checking
              return (
                <div 
                  key={mol.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px',
                    background: 'var(--bg-app)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '4px',
                    background: isDone ? 'var(--color-success)' : 'transparent',
                    border: `2px solid ${isDone ? 'var(--color-success)' : 'var(--text-muted)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '11px',
                    fontWeight: 900
                  }}>
                    {isDone && '✓'}
                  </div>
                  <span>{mol.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Reset Data Card */}
        <div className="glass card" style={{ padding: '20px', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
              Urus Data Pembelajaran
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.4' }}>
              Memadamkan semua kemajuan, rekod markah kuiz teratas, dan lencana pencapaian daripada pelayar ini.
            </p>
          </div>

          <button
            onClick={onResetProgress}
            className="btn btn-danger"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}
          >
            <RefreshCw size={16} /> Set Semula Semua Data
          </button>
        </div>
      </div>
    </div>
  );
}
