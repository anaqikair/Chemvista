import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import AtomicBasicsGuide from './components/AtomicBasicsGuide';
import IonicBonding from './components/IonicBonding';
import CovalentBonding from './components/CovalentBonding';
import SandboxMode from './components/SandboxMode';
import InteractiveQuiz from './components/InteractiveQuiz';
import ProgressDashboard from './components/ProgressDashboard';
import Achievements from './components/Achievements';
import TeacherDashboard from './components/TeacherDashboard';
import StudentAuth from './components/StudentAuth';
import { Compass, Atom, HelpCircle, FlaskConical, BookOpen, Globe } from 'lucide-react';
import { sounds } from './utils/audio';
import { useLanguage } from './context/LanguageContext';
import './App.css';

import { supabase } from './supabaseClient';

export default function App() {
  const { language, setLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('home'); // home, progress, achievements, settings, ionic, covalent, sandbox, guide, quiz, student_login, teacher_dashboard
  const [theme, setTheme] = useState(() => localStorage.getItem('chemvista_theme') || 'light');
  const [mobileMode, setMobileMode] = useState(false);
  const [studentName, setStudentName] = useState(() => localStorage.getItem('chemvista_student_name') || '');
  
  // Progress states
  const [userProgress, setUserProgress] = useState(() => {
    const saved = localStorage.getItem('chemvista_progress');
    return saved ? JSON.parse(saved) : {
      ionicCompleted: false,
      covalentCompleted: false,
      quizHighScore: 0,
      challengesSolved: []
    };
  });

  // Sync theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('chemvista_theme', theme);
  }, [theme]);

  // Sync progress to LocalStorage & Supabase
  useEffect(() => {
    localStorage.setItem('chemvista_progress', JSON.stringify(userProgress));
    localStorage.setItem('chemvista_student_name', studentName);

    if (studentName.trim().length > 0) {
      syncToSupabase(studentName, userProgress);
    }
  }, [userProgress, studentName]);

  const syncToSupabase = async (name, progress) => {
    try {
      await supabase.from('student_progress').upsert({
        student_name: name,
        ionic_completed: progress.ionicCompleted,
        covalent_completed: progress.covalentCompleted,
        quiz_score: progress.quizHighScore,
        updated_at: new Date().toISOString()
      }, { onConflict: 'student_name' });
    } catch (err) {
      console.warn('Supabase sync warning:', err);
    }
  };

  const toggleTheme = () => {
    sounds.playElectron();
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleActionCompleted = (type) => {
    sounds.playBond();
    setUserProgress(prev => {
      const updated = { ...prev };
      if (type === 'ionic_bond') updated.ionicCompleted = true;
      if (type === 'covalent_bond') updated.covalentCompleted = true;
      return updated;
    });
  };

  const resetAllProgress = () => {
    sounds.playError();
    if (window.confirm(t('resetConfirmText'))) {
      const clean = {
        ionicCompleted: false,
        covalentCompleted: false,
        quizHighScore: 0,
        challengesSolved: []
      };
      setUserProgress(clean);
      localStorage.setItem('chemvista_progress', JSON.stringify(clean));
      setActiveTab('home');
    }
  };

  const handleMenuClick = (tabId) => {
    sounds.playElectron();
    setActiveTab(tabId);
  };

  const handleStudentLoggedIn = (studentObj) => {
    if (!studentObj) {
      setStudentName('');
      localStorage.removeItem('chemvista_student_name');
      return;
    }

    const { name, data } = studentObj;
    setStudentName(name);
    localStorage.setItem('chemvista_student_name', name);

    if (data) {
      setUserProgress(prev => ({
        ...prev,
        ionicCompleted: data.ionic_completed || prev.ionicCompleted,
        covalentCompleted: data.covalent_completed || prev.covalentCompleted,
        quizHighScore: Math.max(prev.quizHighScore || 0, data.quiz_score || 0)
      }));
    }
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return renderHomeScreen();
      case 'ionic':
        return <IonicBonding onActionCompleted={handleActionCompleted} />;
      case 'covalent':
        return <CovalentBonding onActionCompleted={handleActionCompleted} />;
      case 'sandbox':
        return <SandboxMode />;
      case 'guide':
        return <AtomicBasicsGuide />;
      case 'quiz':
        return <InteractiveQuiz onScoreSubmitted={(score) => {
          sounds.playCorrect();
          setUserProgress(prev => ({ ...prev, quizHighScore: Math.max(prev.quizHighScore, score) }));
        }} />;
      case 'progress':
        return <ProgressDashboard userProgress={userProgress} onResetProgress={resetAllProgress} studentName={studentName} setStudentName={setStudentName} />;
      case 'achievements':
        return <Achievements userProgress={userProgress} />;
      case 'settings':
        return renderSettingsScreen();
      case 'student_login':
        return <StudentAuth onStudentLoggedIn={handleStudentLoggedIn} currentStudentName={studentName} />;
      case 'teacher_dashboard':
        return <TeacherDashboard />;
      default:
        return renderHomeScreen();
    }
  };

  const renderHomeScreen = () => {
    const menus = [
      { id: 'ionic', title: t('ionicTitle'), desc: t('ionicDesc'), icon: Compass, color: 'var(--accent-blue)' },
      { id: 'covalent', title: t('covalentTitle'), desc: t('covalentDesc'), icon: Atom, color: 'var(--accent-purple)' },
      { id: 'sandbox', title: t('sandboxTitle'), desc: t('sandboxDesc'), icon: FlaskConical, color: 'var(--accent-cyan)' },
      { id: 'guide', title: t('guideTitle'), desc: t('guideDesc'), icon: BookOpen, color: 'var(--color-almost)' },
      { id: 'quiz', title: t('quizTitle'), desc: t('quizDesc'), icon: HelpCircle, color: 'var(--color-unstable)' }
    ];

    return (
      <div className="screen-container" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: '20px' }}>
        {/* Animated Background Atom Section */}
        <div style={{ position: 'relative', width: '220px', height: '220px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            border: '1.5px dashed rgba(37, 99, 235, 0.15)',
            borderRadius: '50%'
          }} className="animate-orbit-slow" />
          <div style={{
            position: 'absolute',
            width: '75%',
            height: '75%',
            border: '1.5px dashed rgba(139, 92, 246, 0.15)',
            borderRadius: '50%'
          }} className="animate-orbit-fast" />
          
          {/* Animated Electrons Orbiting */}
          <div style={{
            position: 'absolute',
            width: '10px',
            height: '10px',
            background: 'var(--accent-cyan)',
            borderRadius: '50%',
            boxShadow: '0 0 10px var(--accent-cyan)',
            top: '0px',
            left: '110px'
          }} className="animate-float" />

          <div style={{
            position: 'absolute',
            width: '10px',
            height: '10px',
            background: 'var(--accent-purple)',
            borderRadius: '50%',
            boxShadow: '0 0 10px var(--accent-purple)',
            bottom: '25px',
            right: '25px'
          }} className="animate-float" />

          {/* Central Core */}
          <div style={{
            background: 'var(--accent-gradient)',
            display: 'inline-flex',
            padding: '24px',
            borderRadius: '50%',
            boxShadow: '0 0 40px var(--accent-glow)',
            zIndex: 2
          }}>
            <Atom size={56} color="white" className="animate-orbit-slow" />
          </div>
        </div>

        {/* Hero title & Tagline */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 className="gradient-text" style={{ fontSize: '52px', fontWeight: 900, letterSpacing: '-1.5px', margin: '0 0 8px 0' }}>
            {t('appName')}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '18px', fontWeight: 500, letterSpacing: '0.5px' }}>
            {t('homeTagline')}
          </p>
        </div>

        {/* Menu Buttons Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          width: '100%',
          maxWidth: '850px',
          gap: '20px'
        }}>
          {menus.map((m) => {
            const MenuIcon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => handleMenuClick(m.id)}
                className="glass-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '24px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div style={{
                  background: `${m.color}15`,
                  padding: '16px',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: m.color,
                  boxShadow: `0 0 15px ${m.color}10`
                }}>
                  <MenuIcon size={28} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>{m.title}</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.3' }}>{m.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSettingsScreen = () => {
    return (
      <div className="screen-container" style={{ padding: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 className="gradient-text" style={{ fontSize: '32px', fontWeight: 800 }}>{t('settingsTitle')}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{t('settingsSub')}</p>
        </div>

        <div className="glass-card" style={{ maxWidth: '500px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Theme Toggle */}
          <div className="flex-between" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <strong style={{ color: 'var(--text-main)' }}>{t('themeLabel')}</strong>
            <button className="btn btn-primary" onClick={toggleTheme} style={{ padding: '8px 16px', borderRadius: '8px' }}>
              {theme === 'dark' ? t('themeLightBtn') : t('themeDarkBtn')}
            </button>
          </div>

          {/* Language Toggle */}
          <div className="flex-between" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={18} color="var(--accent-blue)" />
              <strong style={{ color: 'var(--text-main)' }}>{t('languageLabel')}</strong>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setLanguage('ms')}
                className="btn"
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  background: language === 'ms' ? 'var(--accent-gradient)' : 'var(--bg-input)',
                  color: language === 'ms' ? 'white' : 'var(--text-main)',
                  border: '1px solid var(--border-color)'
                }}
              >
                {t('langMalay')}
              </button>
              <button 
                onClick={() => setLanguage('en')}
                className="btn"
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  background: language === 'en' ? 'var(--accent-gradient)' : 'var(--bg-input)',
                  color: language === 'en' ? 'white' : 'var(--text-main)',
                  border: '1px solid var(--border-color)'
                }}
              >
                {t('langEnglish')}
              </button>
            </div>
          </div>

          {/* Reset Progress */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ color: 'var(--text-main)' }}>{t('resetProgressLabel')}</strong>
            <button className="btn btn-danger" onClick={resetAllProgress} style={{ padding: '8px 16px', borderRadius: '8px' }}>
              {t('resetProgressBtn')}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div id="root">
      <Header activeTab={activeTab} setActiveTab={handleMenuClick} theme={theme} toggleTheme={toggleTheme} mobileMode={mobileMode} toggleMobileMode={() => setMobileMode(!mobileMode)} />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
        <div className={mobileMode ? 'mobile-scale-container' : ''} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {renderScreen()}
        </div>
      </main>
      <Footer />
    </div>
  );
}
