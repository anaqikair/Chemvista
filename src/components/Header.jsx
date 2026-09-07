import { Atom, Home, Trophy, BarChart2, Settings, Sun, Moon, Smartphone, User, Globe, LogIn, LogOut, Users } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  theme, 
  toggleTheme, 
  mobileMode, 
  toggleMobileMode,
  userRole = 'guest', // 'guest', 'student', 'teacher'
  studentName = '',
  onOpenAuthModal,
  onLogout
}) {
  const { language, setLanguage, t } = useLanguage();

  // Determine navigation items depending on role
  const navItems = [
    { id: 'home', label: t('navHome'), icon: Home }
  ];

  if (userRole === 'teacher') {
    navItems.push({ id: 'teacher_dashboard', label: t('navTeacher'), icon: BarChart2 });
  } else {
    // Student or Guest navigation
    navItems.push(
      { id: 'progress', label: t('navProgress'), icon: BarChart2 },
      { id: 'achievements', label: t('navAchievements'), icon: Trophy }
    );
  }

  navItems.push({ id: 'settings', label: t('navSettings'), icon: Settings });

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

      {/* Navigation & Role Controls */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {navItems.map((item) => {
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

        {/* Auth / Role Controls */}
        {userRole === 'guest' ? (
          <button
            onClick={onOpenAuthModal}
            className="gradient-btn"
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13.5px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <LogIn size={15} />
            <span>{t('navLogin')}</span>
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* User Role Badge */}
            <div style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              borderRadius: '20px',
              padding: '4px 12px',
              fontSize: '12px',
              fontWeight: 700,
              color: userRole === 'teacher' ? 'var(--accent-purple)' : 'var(--accent-blue)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              {userRole === 'teacher' ? <Users size={14} /> : <User size={14} />}
              <span>
                {userRole === 'teacher' 
                  ? `${t('roleTeacher')}` 
                  : `${t('roleStudent')}: ${studentName || ''}`}
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="btn"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid var(--color-unstable)',
                color: 'var(--color-unstable)',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
              title={t('navLogout')}
            >
              <LogOut size={14} />
              <span>{t('navLogout')}</span>
            </button>
          </div>
        )}

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
