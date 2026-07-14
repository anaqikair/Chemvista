import { useState } from 'react';
import { Award, CheckCircle2, XCircle, Zap, RefreshCw, BookOpen, ChevronRight, HelpCircle } from 'lucide-react';

// Quiz data in Malay
const QUIZ_QUESTIONS = {
  ionic: [
    {
      id: 'i1',
      type: 'mcq',
      question: 'Apakah jenis ikatan yang terbentuk di antara unsur Natrium (Na) dan Klorin (Cl)?',
      options: [
        { text: 'Ikatan Logam', isCorrect: false },
        { text: 'Ikatan Ionik', isCorrect: true },
        { text: 'Ikatan Kovalen', isCorrect: false }
      ],
      explanation: 'Ikatan ionik terbentuk apabila atom natrium memindahkan elektron valensnya kepada klorin.'
    },
    {
      id: 'i2',
      type: 'mcq',
      question: 'Apakah cas ion yang terbentuk apabila atom Kalsium kehilangan 2 elektron valens?',
      options: [
        { text: 'Ca⁻', isCorrect: false },
        { text: 'Ca⁺', isCorrect: false },
        { text: 'Ca²⁺', isCorrect: true }
      ],
      explanation: 'Apabila atom kehilangan elektron bercas negatif, ia membentuk ion bercas positif (kation) setara dengan bilangan elektron yang hilang.'
    },
    {
      id: 'i3',
      type: 'prediction',
      question: 'Ramalan Simulasi: Jika atom Magnesium (2.8.2) bertindak balas dengan Oksigen (2.6), berapakah elektron valens yang perlu dipindahkan?',
      options: [
        { text: '1 elektron', isCorrect: false },
        { text: '2 elektron', isCorrect: true },
        { text: '3 elektron', isCorrect: false }
      ],
      explanation: 'Magnesium menderma 2 elektron valens untuk membentuk Mg²⁺, manakala Oksigen menerima 2 elektron untuk membentuk O²⁻.'
    }
  ],
  covalent: [
    {
      id: 'c1',
      type: 'mcq',
      question: 'Adakah elektron dipindahkan atau berkongsi di dalam ikatan kovalen?',
      options: [
        { text: 'Elektron Dipindahkan', isCorrect: false },
        { text: 'Elektron Berkongsi', isCorrect: true }
      ],
      explanation: 'Ikatan kovalen berlaku melalui perkongsian elektron antara atom bukan logam.'
    },
    {
      id: 'c2',
      type: 'mcq',
      question: 'Apakah jenis ikatan kovalen yang terdapat dalam molekul Nitrogen (N₂)?',
      options: [
        { text: 'Ikatan Tunggal', isCorrect: false },
        { text: 'Ikatan Ganda Dua', isCorrect: false },
        { text: 'Ikatan Ganda Tiga', isCorrect: true }
      ],
      explanation: 'Setiap atom Nitrogen berkongsi 3 pasang elektron untuk mencapai susunan elektron oktet yang stabil.'
    },
    {
      id: 'c3',
      type: 'mcq',
      question: 'Berapakah bilangan sepasang elektron berkongsi dalam satu molekul air (H₂O)?',
      options: [
        { text: '1 pasang', isCorrect: false },
        { text: '2 pasang', isCorrect: true },
        { text: '4 pasang', isCorrect: false }
      ],
      explanation: 'Dalam H₂O, terdapat dua ikatan kovalen tunggal, maka terdapat 2 pasang elektron yang berkongsi.'
    }
  ],
  arrangement: [
    {
      id: 'a1',
      type: 'mcq',
      question: 'Apakah susunan elektron bagi ion Klorida (Cl⁻)? (Atom Cl = 2.8.7)',
      options: [
        { text: '2.8', isCorrect: false },
        { text: '2.8.8', isCorrect: true },
        { text: '2.8.7', isCorrect: false }
      ],
      explanation: 'Ion klorida (Cl⁻) dibentuk apabila atom klorin menerima 1 elektron untuk mencapai oktet stabil.'
    },
    {
      id: 'a2',
      type: 'mcq',
      question: 'Manakah unsur berikut yang mempunyai susunan elektron duplet yang stabil?',
      options: [
        { text: 'Helium (He)', isCorrect: true },
        { text: 'Neon (Ne)', isCorrect: false },
        { text: 'Argon (Ar)', isCorrect: false }
      ],
      explanation: 'Helium mempunyai 2 elektron di dalam petala pertamanya yang merupakan petala terluar, memenuhi syarat duplet stabil.'
    }
  ],
  identification: [
    {
      id: 'id1',
      type: 'mcq',
      question: 'Berdasarkan formula sebatian, yang manakah merupakan sebatian ionik?',
      options: [
        { text: 'CO₂', isCorrect: false },
        { text: 'H₂O', isCorrect: false },
        { text: 'MgO', isCorrect: true }
      ],
      explanation: 'Magnesium Oksida (MgO) terdiri daripada logam Magnesium dan bukan logam Oksigen, menjadikannya sebatian ionik.'
    },
    {
      id: 'id2',
      type: 'mcq',
      question: 'Antara sebatian berikut, yang manakah dibentuk oleh ikatan kovalen?',
      options: [
        { text: 'NaCl', isCorrect: false },
        { text: 'CH₄', isCorrect: true },
        { text: 'CaCl₂', isCorrect: false }
      ],
      explanation: 'Metana (CH₄) terdiri daripada Karbon dan Hidrogen yang merupakan bukan logam, berkongsi elektron membentuk ikatan kovalen.'
    }
  ]
};

const CATEGORIES = [
  { id: 'ionic', title: 'Ikatan Ionik', count: 3 },
  { id: 'covalent', title: 'Ikatan Kovalen', count: 3 },
  { id: 'arrangement', title: 'Susunan Elektron', count: 2 },
  { id: 'identification', title: 'Kenal Pasti Ikatan', count: 2 }
];

export default function InteractiveQuiz({ onScoreSubmitted }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [mistakes, setMistakes] = useState([]); // List of question objects where user got wrong

  const startQuiz = (catId) => {
    setSelectedCategory(catId);
    setCurrentQuestionIdx(0);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setQuizFinished(false);
    setMistakes([]);
  };

  const handleOptionClick = (option) => {
    if (isAnswered) return;
    setSelectedOption(option);
  };

  const submitAnswer = () => {
    if (selectedOption === null || isAnswered) return;

    setIsAnswered(true);
    const questions = QUIZ_QUESTIONS[selectedCategory];
    const currentQuestion = questions[currentQuestionIdx];

    if (selectedOption.isCorrect) {
      const newStreak = streak + 1;
      const points = 10 + (newStreak >= 3 ? 5 : 0); // streak bonus of 5 points
      setScore(prev => prev + points);
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);
    } else {
      setStreak(0);
      // Log mistake
      setMistakes(prev => [...prev, {
        question: currentQuestion.question,
        userAnswer: selectedOption.text,
        correctAnswer: currentQuestion.options.find(o => o.isCorrect).text,
        explanation: currentQuestion.explanation
      }]);
    }
  };

  const handleNext = () => {
    const questions = QUIZ_QUESTIONS[selectedCategory];
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
      if (onScoreSubmitted) {
        onScoreSubmitted(score);
      }
    }
  };

  // Generate Suggested Revision topics based on mistakes
  const getSuggestedRevision = () => {
    if (mistakes.length === 0) return 'Tiada. Syabas! Prestasi anda sangat cemerlang.';
    
    // Simple custom recommendation text
    if (selectedCategory === 'ionic') {
      return 'Disyorkan ulang kaji konsep pemindahan elektron valens dari atom logam dan cara pengiraan cas ion positif (kation) / negatif (anion) di bahagian Panduan Asas Atom.';
    }
    if (selectedCategory === 'covalent') {
      return 'Disyorkan ulang kaji topik perkongsian elektron terutamanya beza ikatan tunggal, ganda dua, dan ganda tiga di Modul 2.';
    }
    return 'Gunakan bahagian Panduan Asas Atom untuk melihat kestabilan oktet/duplet gas nadir dan bezakan sifat fizikal sebatian.';
  };

  return (
    <div className="screen-container">
      {/* Title */}
      <div style={{ textAlign: 'center' }}>
        <h1 className="gradient-text" style={{ margin: '0 0 8px 0', fontSize: '32px' }}>Kuiz Interaktif</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
          Uji kefahaman anda tentang konsep ikatan ionik, kovalen, dan susunan elektron stabil.
        </p>
      </div>

      {!selectedCategory ? (
        /* Category selection grid */
        <div className="grid-cols-2" style={{ gap: '20px', maxWidth: '640px', margin: '0 auto' }}>
          {CATEGORIES.map((cat) => (
            <div key={cat.id} className="glass card" style={{ padding: '20px', alignItems: 'center', textAlign: 'center' }}>
              <div style={{
                background: 'var(--accent-glow)',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px'
              }}>
                <HelpCircle size={24} color="var(--accent-cyan)" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>{cat.title}</h3>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                {cat.count} Soalan Ujian
              </span>
              <button
                onClick={() => startQuiz(cat.id)}
                className="btn btn-primary"
                style={{ width: '100%', borderRadius: 'var(--radius-sm)' }}
              >
                Mula Kuiz
              </button>
            </div>
          ))}
        </div>
      ) : quizFinished ? (
        /* Quiz Summary Report */
        <div className="glass card" style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <Award size={64} color="var(--color-warning)" className="animate-float" />
            <h2 style={{ fontSize: '26px', fontWeight: 800, marginTop: '10px' }} className="gradient-text">
              Keputusan Kuiz Anda
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              Modul: {CATEGORIES.find(c => c.id === selectedCategory)?.title}
            </p>
          </div>

          <div className="grid-cols-3" style={{ gap: '12px', marginBottom: '20px' }}>
            <div style={{ background: 'var(--bg-app)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Mata Skor</span>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent-blue)' }}>{score}</div>
            </div>
            <div style={{ background: 'var(--bg-app)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Ketepatan</span>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-success)' }}>
                {Math.round(((QUIZ_QUESTIONS[selectedCategory].length - mistakes.length) / QUIZ_QUESTIONS[selectedCategory].length) * 100)}%
              </div>
            </div>
            <div style={{ background: 'var(--bg-app)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Streak Maks</span>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-warning)' }}>{maxStreak}</div>
            </div>
          </div>

          {/* Mistakes and explanation review */}
          {mistakes.length > 0 && (
            <div style={{ marginBottom: '20px', textAlign: 'left' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px', color: 'var(--color-danger)' }}>
                Ulasan Kesalahan ({mistakes.length}):
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto', paddingRight: '6px' }}>
                {mistakes.map((m, idx) => (
                  <div key={idx} style={{ padding: '10px', background: 'var(--bg-app)', borderRadius: '6px', fontSize: '12.5px' }}>
                    <strong>S: {m.question}</strong>
                    <div style={{ color: 'var(--color-danger)', marginTop: '3px' }}>Jawapan Anda: {m.userAnswer}</div>
                    <div style={{ color: 'var(--color-success)' }}>Betul: {m.correctAnswer}</div>
                    <div style={{ fontStyle: 'italic', marginTop: '4px', color: 'var(--text-muted)' }}>AI: {m.explanation}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Revision Box */}
          <div style={{
            background: 'var(--accent-glow)',
            padding: '16px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13.5px',
            textAlign: 'left',
            marginBottom: '20px',
            borderLeft: '4px solid var(--accent-purple)'
          }}>
            <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-purple)' }}>
              <BookOpen size={16} /> Cadangan Ulang Kaji:
            </strong>
            <p style={{ marginTop: '4px', color: 'var(--text-main)' }}>{getSuggestedRevision()}</p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setSelectedCategory(null)}
              className="btn btn-secondary"
              style={{ flexGrow: 1 }}
            >
              Kembali ke Kategori
            </button>
            <button
              onClick={() => startQuiz(selectedCategory)}
              className="btn btn-primary"
              style={{ flexGrow: 1 }}
            >
              <RefreshCw size={14} /> Cuba Lagi
            </button>
          </div>
        </div>
      ) : (
        /* Active Question rendering */
        <div className="glass card" style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
          {/* Progress bar and Streak Indicator */}
          <div className="flex-between" style={{ marginBottom: '14px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Soalan {currentQuestionIdx + 1} daripada {QUIZ_QUESTIONS[selectedCategory].length}
            </span>
            {streak >= 2 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(245, 158, 11, 0.15)',
                color: 'var(--color-warning)',
                padding: '2px 10px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 700
              }} className="animate-float">
                <Zap size={14} fill="var(--color-warning)" /> Streak x{streak}
              </div>
            )}
          </div>

          <div style={{
            background: 'var(--bg-app)',
            height: '6px',
            borderRadius: '3px',
            width: '100%',
            marginBottom: '20px',
            overflow: 'hidden'
          }}>
            <div style={{
              background: 'var(--accent-gradient)',
              height: '100%',
              width: `${((currentQuestionIdx + 1) / QUIZ_QUESTIONS[selectedCategory].length) * 100}%`,
              transition: 'width 0.3s'
            }} />
          </div>

          {/* Question Text */}
          <h3 style={{ fontSize: '18px', fontWeight: 700, textAlign: 'left', marginBottom: '20px', lineHeight: '1.4' }}>
            {QUIZ_QUESTIONS[selectedCategory][currentQuestionIdx].question}
          </h3>

          {/* Options List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {QUIZ_QUESTIONS[selectedCategory][currentQuestionIdx].options.map((option, idx) => {
              const isSelected = selectedOption === option;
              let btnBg = 'var(--bg-input)';
              let btnBorder = 'var(--border-color)';
              let btnColor = 'var(--text-main)';

              if (isAnswered) {
                if (option.isCorrect) {
                  btnBg = 'rgba(16, 185, 129, 0.15)';
                  btnBorder = 'var(--color-success)';
                  btnColor = 'var(--color-success)';
                } else if (isSelected) {
                  btnBg = 'rgba(239, 68, 68, 0.15)';
                  btnBorder = 'var(--color-danger)';
                  btnColor = 'var(--color-danger)';
                }
              } else if (isSelected) {
                btnBg = 'var(--accent-glow)';
                btnBorder = 'var(--accent-cyan)';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(option)}
                  className="btn"
                  style={{
                    background: btnBg,
                    border: `1.5px solid ${btnBorder}`,
                    color: btnColor,
                    justifyContent: 'flex-start',
                    padding: '14px 18px',
                    textAlign: 'left',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '14.5px',
                    fontWeight: isSelected ? 600 : 500
                  }}
                  disabled={isAnswered}
                >
                  <span style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: isSelected ? 'var(--accent-cyan)' : 'var(--bg-app)',
                    color: isSelected ? 'white' : 'var(--text-muted)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '10px',
                    fontSize: '12px',
                    fontWeight: 700
                  }}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {option.text}
                </button>
              );
            })}
          </div>

          {/* Actions / AI explanation */}
          {isAnswered && (
            <div style={{
              background: selectedOption.isCorrect ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
              padding: '16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13.5px',
              textAlign: 'left',
              lineHeight: '1.5',
              marginBottom: '20px',
              border: `1.5px solid ${selectedOption.isCorrect ? 'var(--color-success)' : 'var(--color-danger)'}`,
              borderLeft: `6px solid ${selectedOption.isCorrect ? 'var(--color-success)' : 'var(--color-danger)'}`,
              boxShadow: 'var(--shadow-sm)'
            }}>
              <strong style={{ display: 'flex', alignItems: 'center', gap: '8px', color: selectedOption.isCorrect ? 'var(--color-success)' : 'var(--color-danger)', fontSize: '15px' }}>
                {selectedOption.isCorrect ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                {selectedOption.isCorrect ? 'Syabas, Jawapan Anda Betul! 🎉' : 'Opps, Jawapan Kurang Tepat.'}
              </strong>
              
              <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
                <span style={{ fontWeight: 700, display: 'block', color: 'var(--text-main)', marginBottom: '4px' }}>
                  💡 Penjelasan Konsep Kimia:
                </span>
                <p style={{ color: 'var(--text-muted)' }}>
                  {QUIZ_QUESTIONS[selectedCategory][currentQuestionIdx].explanation}
                </p>
              </div>

              {!selectedOption.isCorrect && (
                <div style={{ marginTop: '8px', fontSize: '12px', background: 'var(--bg-app)', padding: '8px', borderRadius: '4px', color: 'var(--color-success)', fontWeight: 600 }}>
                  ✓ Jawapan betul ialah: {QUIZ_QUESTIONS[selectedCategory][currentQuestionIdx].options.find(o => o.isCorrect).text}
                </div>
              )}
            </div>
          )}

          <div className="flex-between">
            <button
              onClick={() => setSelectedCategory(null)}
              className="btn btn-outline"
              style={{ fontSize: '13px' }}
            >
              Keluar Kuiz
            </button>

            {!isAnswered ? (
              <button
                onClick={submitAnswer}
                className="btn btn-primary"
                disabled={selectedOption === null}
                style={{ fontSize: '13.5px' }}
              >
                Hantar Jawapan
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="btn btn-success"
                style={{ fontSize: '13.5px' }}
              >
                Seterusnya <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
