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
import { Compass, Atom, HelpCircle, FlaskConical, BookOpen, Trophy } from 'lucide-react';
import { sounds } from './utils/audio';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('home'); // home, progress, achievements, settings, ionic, covalent, challenge, sandbox, guide, quiz
  const [theme, setTheme] = useState(() => localStorage.getItem('chemvista_theme') || 'dark');
  const [mobileMode, setMobileMode] = useState(false);
  
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

  // Sync progress
  useEffect(() => {
    localStorage.setItem('chemvista_progress', JSON.stringify(userProgress));
  }, [userProgress]);

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

  const handleChallengeSolved = (challengeId) => {
    setUserProgress(prev => {
      if (prev.challengesSolved.includes(challengeId)) return prev;
      return {
        ...prev,
        challengesSolved: [...prev.challengesSolved, challengeId]
      };
    });
  };

  const resetAllProgress = () => {
    sounds.playError();
    if (window.confirm('Adakah anda pasti mahu memadamkan semua data kemajuan dan markah kuiz anda?')) {
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
        return <ProgressDashboard userProgress={userProgress} onResetProgress={resetAllProgress} />;
      case 'achievements':
        return <Achievements userProgress={userProgress} />;
      case 'settings':
        return renderSettingsScreen();
      default:
        return renderHomeScreen();
    }
  };

  const renderHomeScreen = () => {
    const menus = [
      { id: 'ionic', title: 'Ikatan Ionik', desc: 'Teroka pemindahan elektron.', icon: Compass, color: 'var(--accent-blue)' },
      { id: 'covalent', title: 'Ikatan Kovalen', desc: 'Bina molekul dengan perkongsian.', icon: Atom, color: 'var(--accent-purple)' },
      { id: 'sandbox', title: 'Eksperimen Bebas', desc: 'Gabung sebarang unsur kegemaran anda.', icon: FlaskConical, color: 'var(--accent-cyan)' },
      { id: 'guide', title: 'Asas Atom', desc: 'Fahami kestabilan duplet & oktet.', icon: BookOpen, color: 'var(--color-almost)' },
      { id: 'quiz', title: 'Kuiz Interaktif', desc: 'Uji pemahaman tentang ikatan kimia.', icon: HelpCircle, color: 'var(--color-unstable)' }
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
            ChemVista
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '18px', fontWeight: 500, letterSpacing: '0.5px' }}>
            "See Chemical Bonds Come Alive"
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
          <h1 className="gradient-text" style={{ fontSize: '32px', fontWeight: 800 }}>Tetapan Makmal</h1>
          <p style={{ color: 'var(--text-muted)' }}>Suaikan pengalaman pembelajaran ChemVista anda.</p>
        </div>

        <div className="glass-card" style={{ maxWidth: '500px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="flex-between" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <strong>Mod Gelap / Cerah</strong>
            <button className="gradient-btn" onClick={toggleTheme} style={{ padding: '8px 16px', borderRadius: '8px' }}>
              {theme === 'dark' ? 'Cerah' : 'Gelap'}
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>Padam Seluruh Progress</strong>
            <button className="gradient-btn" onClick={resetAllProgress} style={{ background: 'var(--color-unstable)', boxShadow: '0 0 15px rgba(239,68,68,0.2)', padding: '8px 16px', borderRadius: '8px' }}>
              Padam Data
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
