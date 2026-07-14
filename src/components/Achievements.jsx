import { Trophy, Star, Zap, Award } from 'lucide-react';

const ACHIEVEMENTS_DATA = [
  {
    id: 'first_bond',
    title: 'Peneroka Elektron',
    desc: 'Bina ikatan kimia pertama anda dalam mana-mana modul.',
    icon: Star,
    color: '#eab308', // yellow
    checkKey: (progress) => progress.ionicCompleted || progress.covalentCompleted
  },
  {
    id: 'ion_master',
    title: 'Master Ion',
    desc: 'Selesaikan pemindahan elektron dalam modul Ikatan Ionik.',
    icon: Zap,
    color: '#3b82f6', // blue
    checkKey: (progress) => progress.ionicCompleted
  },
  {
    id: 'covalent_creator',
    title: 'Pencipta Kovalen',
    desc: 'Selesaikan perkongsian elektron dalam modul Ikatan Kovalen.',
    icon: Award,
    color: '#a855f7', // purple
    checkKey: (progress) => progress.covalentCompleted
  },
  {
    id: 'chemvista_expert',
    title: 'Pakar ChemVista',
    desc: 'Selesaikan semua modul pembelajaran teori dan kuiz.',
    icon: Trophy,
    color: '#10b981', // green
    checkKey: (progress) => progress.ionicCompleted && progress.covalentCompleted && progress.quizHighScore > 0
  }
];

export default function Achievements({ userProgress }) {
  return (
    <div className="screen-container">
      {/* Title */}
      <div style={{ textAlign: 'center' }}>
        <h1 className="gradient-text" style={{ margin: '0 0 8px 0', fontSize: '32px' }}>Lencana Pencapaian</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
          Dapatkan lencana sains dengan melengkapkan simulasi ikatan kimia dan kuiz.
        </p>
      </div>

      {/* Grid of badges */}
      <div className="grid-cols-2" style={{ gap: '20px', maxWidth: '800px', margin: '0 auto' }}>
        {ACHIEVEMENTS_DATA.map((badge) => {
          const isUnlocked = badge.checkKey(userProgress);
          const BadgeIcon = badge.icon;

          return (
            <div 
              key={badge.id} 
              className="glass card"
              style={{
                padding: '24px',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '20px',
                opacity: isUnlocked ? 1 : 0.55,
                border: isUnlocked ? `1.5px solid ${badge.color}` : '1px solid var(--border-color)',
                transition: 'all 0.3s',
                textAlign: 'left'
              }}
            >
              {/* Badge Icon container */}
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: isUnlocked ? `${badge.color}15` : 'var(--bg-app)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isUnlocked ? `0 0 15px ${badge.color}25` : 'none',
                flexShrink: 0
              }}>
                <BadgeIcon size={32} color={isUnlocked ? badge.color : 'var(--text-muted)'} />
              </div>

              {/* Badge Details */}
              <div style={{ flexGrow: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                    {badge.title}
                  </h3>
                  <span style={{
                    fontSize: '10px',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontWeight: 600,
                    background: isUnlocked ? `${badge.color}20` : 'rgba(0,0,0,0.06)',
                    color: isUnlocked ? badge.color : 'var(--text-muted)'
                  }}>
                    {isUnlocked ? 'Terbuka' : 'Terkunci'}
                  </span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px', lineHeight: '1.4' }}>
                  {badge.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
