import { Atom, Home, Trophy, BarChart2, Settings, Sun, Moon, Smartphone, User, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Header({ activeTab, setActiveTab, theme, toggleTheme, mobileMode, toggleMobileMode }) {
  const { language, setLanguage, t } = useLanguage();

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
            {t('appName')}
          </span>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '-3px', letterSpacing: '0.5px' }}>
            {t('appSub')}
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {[
          { id: 'home', label: t('navHome'), icon: Home },
          { id: 'student_login', label: t('navStudentLogin'), icon: User },
          { id: 'progress', label: t('navProgress'), icon: BarChart2 },
          { id: 'achievements', label: t('navAchievements'), icon: Trophy },
          { id: 'teacher_dashboard', label: t('navTeacher'), icon: BarChart2 },
          { id: 'settings', label: t('navSettings'), icon: Settings },
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
          margin: '0 4px'
        }} />

        {/* Language Switcher Button */}
        <button
          onClick={() => setLanguage(language === 'ms' ? 'en' : 'ms')}
          className="btn"
          style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border-color)',
            borderRadius: '20px',
            padding: '6px 12px',
            fontSize: '13px',
            fontWeight: 700,
            color: 'var(--accent-blue)',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer'
          }}
          title={t('langToggle')}
        >
          <Globe size={15} color="var(--accent-blue)" />
          <span>{language === 'ms' ? 'BM' : 'EN'}</span>
        </button>

        {/* Mobile Toggle Button */}
        <button
          onClick={toggleMobileMode}
          className="btn"
          style={{
            background: mobileMode ? 'var(--accent-gradient)' : 'var(--bg-input)',
            border: '1px solid var(--border-color)',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: mobileMode ? 'white' : 'var(--text-main)',
            boxShadow: 'var(--shadow-sm)'
          }}
          title={mobileMode ? t('toggleMobileOff') : t('toggleMobileOn')}
        >
          <Smartphone size={18} color={mobileMode ? 'white' : 'var(--accent-blue)'} />
        </button>

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
          title={theme === 'dark' ? t('toggleLight') : t('toggleDark')}
        >
          {theme === 'dark' ? <Sun size={18} color="var(--color-warning)" /> : <Moon size={18} color="var(--accent-purple)" />}
        </button>
      </nav>
    </header>
  );
}
