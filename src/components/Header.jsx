import { Atom, Home, Trophy, BarChart2, Settings, Sun, Moon } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, theme, toggleTheme }) {

  return (
    <header className="glass" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid var(--border-color)',
      borderRadius: '0 0 var(--radius-md) var(--radius-md)',
      marginBottom: '16px'
    }}>
      {/* Logo Section */}
      <div 
        onClick={() => setActiveTab('home')} 
        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
      >
        <div style={{
          background: 'var(--accent-gradient)',
          padding: '8px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px var(--accent-glow)'
        }}>
          <Atom size={24} color="white" className="animate-orbit-slow" />
        </div>
        <div>
          <span style={{ 
            fontSize: '22px', 
            fontWeight: 800, 
            letterSpacing: '-0.5px' 
          }} className="gradient-text">
            ChemVista
          </span>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500, marginTop: '-3px' }}>
            IKATAN KIMIA KSSM
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {[
          { id: 'home', label: 'Utama', icon: Home },
          { id: 'progress', label: 'Kemajuan', icon: BarChart2 },
          { id: 'achievements', label: 'Pencapaian', icon: Trophy },
          { id: 'settings', label: 'Tetapan', icon: Settings },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="btn"
              style={{
                background: isActive ? 'var(--accent-gradient)' : 'transparent',
                color: isActive ? 'white' : 'var(--text-main)',
                padding: '8px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 500,
                border: 'none',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Icon size={16} />
              <span className="nav-label" style={{ display: 'inline' }}>{item.label}</span>
            </button>
          );
        })}

        <div style={{
          height: '24px',
          width: '1px',
          background: 'var(--border-color)',
          margin: '0 8px'
        }} />

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="btn"
          style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border-color)',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-main)',
            boxShadow: 'var(--shadow-sm)'
          }}
          title={theme === 'dark' ? 'Tukar ke Mod Cerah' : 'Tukar ke Mod Gelap'}
        >
          {theme === 'dark' ? <Sun size={18} color="var(--color-warning)" /> : <Moon size={18} color="var(--accent-purple)" />}
        </button>
      </nav>
    </header>
  );
}
