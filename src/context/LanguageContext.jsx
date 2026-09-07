import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  ms: {
    // Header & Nav
    appName: 'ChemVista',
    appSub: 'IKATAN KIMIA KSSM',
    navHome: 'Utama',
    navStudentLogin: 'Log Masuk Pelajar',
    navProgress: 'Kemajuan',
    navAchievements: 'Pencapaian',
    navTeacher: 'Guru',
    navSettings: 'Tetapan',
    toggleMobileOn: 'Mod Mudah Alih',
    toggleMobileOff: 'Mod Biasa',
    toggleLight: 'Tukar ke Mod Cerah',
    toggleDark: 'Tukar ke Mod Gelap',
    langToggle: 'Tukar Bahasa',

    // Home
    homeTagline: '"Lihat Ikatan Kimia Menjadi Nyata"',
    ionicTitle: 'Ikatan Ionik',
    ionicDesc: 'Teroka pemindahan elektron.',
    covalentTitle: 'Ikatan Kovalen',
    covalentDesc: 'Bina molekul dengan perkongsian.',
    sandboxTitle: 'Eksperimen Bebas',
    sandboxDesc: 'Gabung sebarang unsur kegemaran anda.',
    guideTitle: 'Asas Atom',
    guideDesc: 'Fahami kestabilan duplet & oktet.',
    quizTitle: 'Kuiz Interaktif',
    quizDesc: 'Uji pemahaman tentang ikatan kimia.',

    // Settings
    settingsTitle: 'Tetapan Makmal',
    settingsSub: 'Suaikan pengalaman pembelajaran ChemVista anda.',
    themeLabel: 'Mod Gelap / Cerah',
    themeLightBtn: 'Cerah',
    themeDarkBtn: 'Gelap',
    languageLabel: 'Pilihan Bahasa',
    langMalay: 'Bahasa Melayu (BM)',
    langEnglish: 'English (EN)',
    resetProgressLabel: 'Padam Seluruh Progress',
    resetProgressBtn: 'Padam Data',
    resetConfirmText: 'Adakah anda pasti mahu memadamkan semua data kemajuan dan markah kuiz anda?',

    // Student Auth
    activeStudentTitle: 'Akaun Pelajar Aktif',
    activeStudentDesc: 'Akaun anda telah tersambung ke sistem Supabase. Setiap modul yang anda lengkapkan (Ikatan Ionik, Ikatan Kovalen) dan markah kuiz anda disinkronkan secara automatik ke Papan Pemuka Guru.',
    logoutBtn: 'Log Keluar / Tukar Pelajar',
    loginTitle: 'Log Masuk Pelajar',
    loginDesc: 'Masukkan nama penuh anda untuk mula atau menyambung rekod pembelajaran di Supabase.',
    labelName: 'Nama Penuh / ID Pelajar',
    placeholderName: 'Contoh: Muhammad Ali',
    loginBtn: 'Log Masuk & Mula Pembelajaran',
    pleaseWait: 'Sila tunggu...',
    emptyError: 'Sila masukkan nama atau ID pelajar anda.',
    supabaseConnError: 'Terdapat masalah menyambung ke Supabase. Sila pastikan sambungan internet aktif.',

    // Progress Dashboard
    progressTitle: 'Papan Kemajuan',
    progressSub: 'Jejak status pembelajaran anda, pencapaian modul, dan keputusan kuiz.',
    studentStatus: 'Status Pelajar:',
    offlineStatus: 'Luar Talian / Belum Log Masuk',
    syncedDesc: 'Kemajuan anda akan disinkronkan secara automatik ke Papan Pemuka Guru.',
    offlineDesc: 'Log masuk di tab Log Masuk Pelajar untuk menyimpan rekod anda.',
    syncedStatus: 'Supabase Disinkronkan',
    localStatus: 'Mod Tempatan',
    theoryModules: 'Modul Teori',
    completed: 'Selesai',
    quizScoreTitle: 'Skor Kuiz',
    points: 'Mata',
    noRecord: 'Tiada Rekod',
    highestRecord: 'Rekod markah tertinggi anda',
    covalentMolecules: 'Molekul Kovalen',
    moleculesCrafted: 'Molekul berjaya dibina',
    checklistTitle: 'Senarai Semak Pembinaan Molekul',
    checklistSub: 'Molekul kovalen berikut tersedia untuk dibina di dalam Modul 2.',
    manageDataTitle: 'Urus Data Pembelajaran',
    manageDataDesc: 'Memadamkan semua kemajuan, rekod markah kuiz teratas, dan lencana pencapaian daripada pelayar ini.',
    resetAllBtn: 'Set Semula Semua Data',

    // Achievements
    achievementsTitle: 'Pencapaian & Lencana',
    achievementsSub: 'Kumpul lencana penghargaan semasa anda menguasai pelbagai topik ikatan kimia!',

    // Footer
    footerSyllabus: 'KSSM Kimia Tingkatan 4 • Bab 5: Ikatan Kimia',
    footerVersion: 'Versi 1.0.0 (Stabil)',
    footerRights: 'Hak Cipta Terpelihara ©',
  },
  en: {
    // Header & Nav
    appName: 'ChemVista',
    appSub: 'KSSM CHEMICAL BONDS',
    navHome: 'Home',
    navStudentLogin: 'Student Login',
    navProgress: 'Progress',
    navAchievements: 'Achievements',
    navTeacher: 'Teacher',
    navSettings: 'Settings',
    toggleMobileOn: 'Mobile Mode',
    toggleMobileOff: 'Standard Mode',
    toggleLight: 'Switch to Light Mode',
    toggleDark: 'Switch to Dark Mode',
    langToggle: 'Switch Language',

    // Home
    homeTagline: '"See Chemical Bonds Come Alive"',
    ionicTitle: 'Ionic Bonding',
    ionicDesc: 'Explore electron transfer.',
    covalentTitle: 'Covalent Bonding',
    covalentDesc: 'Build molecules through sharing.',
    sandboxTitle: 'Sandbox Mode',
    sandboxDesc: 'Combine any elements of your choice.',
    guideTitle: 'Atomic Basics',
    guideDesc: 'Understand duplet & octet stability.',
    quizTitle: 'Interactive Quiz',
    quizDesc: 'Test your chemical bonding knowledge.',

    // Settings
    settingsTitle: 'Lab Settings',
    settingsSub: 'Customize your ChemVista learning experience.',
    themeLabel: 'Dark / Light Mode',
    themeLightBtn: 'Light',
    themeDarkBtn: 'Dark',
    languageLabel: 'Language Selection',
    langMalay: 'Bahasa Melayu (BM)',
    langEnglish: 'English (EN)',
    resetProgressLabel: 'Reset All Progress',
    resetProgressBtn: 'Clear Data',
    resetConfirmText: 'Are you sure you want to reset all your progress data and quiz scores?',

    // Student Auth
    activeStudentTitle: 'Active Student Account',
    activeStudentDesc: 'Your account is connected to Supabase. Every completed module (Ionic Bonding, Covalent Bonding) and your quiz scores are synced automatically to the Teacher Dashboard.',
    logoutBtn: 'Log Out / Switch Student',
    loginTitle: 'Student Login',
    loginDesc: 'Enter your full name to start or resume your learning record on Supabase.',
    labelName: 'Full Name / Student ID',
    placeholderName: 'Example: Muhammad Ali',
    loginBtn: 'Log In & Start Learning',
    pleaseWait: 'Please wait...',
    emptyError: 'Please enter your name or student ID.',
    supabaseConnError: 'Problem connecting to Supabase. Please ensure your internet connection is active.',

    // Progress Dashboard
    progressTitle: 'Progress Dashboard',
    progressSub: 'Track your learning status, module achievements, and quiz results.',
    studentStatus: 'Student Status:',
    offlineStatus: 'Offline / Not Logged In',
    syncedDesc: 'Your progress will automatically sync to the Teacher Dashboard.',
    offlineDesc: 'Log in on the Student Login tab to save your records.',
    syncedStatus: 'Supabase Synced',
    localStatus: 'Local Mode',
    theoryModules: 'Theory Modules',
    completed: 'Completed',
    quizScoreTitle: 'Quiz Score',
    points: 'Points',
    noRecord: 'No Record',
    highestRecord: 'Your highest score record',
    covalentMolecules: 'Covalent Molecules',
    moleculesCrafted: 'Molecules crafted',
    checklistTitle: 'Molecule Crafting Checklist',
    checklistSub: 'The following covalent molecules are available to build in Module 2.',
    manageDataTitle: 'Manage Learning Data',
    manageDataDesc: 'Reset all progress, top quiz scores, and achievement badges from this browser.',
    resetAllBtn: 'Reset All Data',

    // Achievements
    achievementsTitle: 'Achievements & Badges',
    achievementsSub: 'Collect badges as you master various chemical bonding topics!',

    // Footer
    footerSyllabus: 'KSSM Chemistry Form 4 • Chapter 5: Chemical Bonds',
    footerVersion: 'Version 1.0.0 (Stable)',
    footerRights: 'All Rights Reserved ©',
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('chemvista_lang') || 'ms';
  });

  useEffect(() => {
    localStorage.setItem('chemvista_lang', language);
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations['ms']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
