import { useState } from 'react';
import { Book, Award, Info, HelpCircle, AlertCircle } from 'lucide-react';

export default function AtomicBasicsGuide() {
  const [activeTopic, setActiveTopic] = useState('what-is-atom');
  const [selectedDemoAtom, setSelectedDemoAtom] = useState('He'); // He (Duplet), Ne (Octet), Ar (Octet)

  const topics = [
    {
      id: 'what-is-atom',
      title: 'Apakah Atom?',
      icon: Book,
      content: (
        <div>
          <p style={{ marginBottom: '14px', fontSize: '15px', lineHeight: '1.6' }}>
            <strong>Atom</strong> ialah zarah paling kecil bagi sesuatu unsur yang dapat mengambil bahagian dalam sesuatu tindak balas kimia. Atom terdiri daripada subatom proton dan neutron di dalam nukleus, serta elektron yang bergerak mengelilingi nukleus dalam petala elektron.
          </p>
          <div style={{
            background: 'var(--bg-app)',
            padding: '16px',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '4px solid var(--accent-blue)',
            fontSize: '14px',
            lineHeight: '1.5'
          }}>
            <strong>Tahukah Anda?</strong> Perkataan atom berasal daripada perkataan Yunani <em>'atomos'</em> yang bermaksud tidak boleh dibahagikan lagi.
          </div>
        </div>
      )
    },
    {
      id: 'what-is-electron',
      title: 'Apakah Elektron?',
      icon: Info,
      content: (
        <div>
          <p style={{ marginBottom: '14px', fontSize: '15px', lineHeight: '1.6' }}>
            <strong>Elektron</strong> ialah zarah subatom yang bercas negatif ($-1$) dan mempunyai jisim yang sangat kecil (hampir sifar) berbanding proton dan neutron. Elektron beredar mengelilingi nukleus atom di dalam laluan bulatan yang dipanggil <strong>petala elektron</strong>.
          </p>
          <p style={{ fontSize: '15px', lineHeight: '1.6' }}>
            Setiap petala boleh memuatkan bilangan elektron tertentu: petala pertama maksimum 2 elektron, petala kedua maksimum 8 elektron, dan petala ketiga maksimum 8 elektron (untuk 20 unsur pertama).
          </p>
        </div>
      )
    },
    {
      id: 'valence-electron',
      title: 'Elektron Valens',
      icon: Award,
      content: (
        <div>
          <p style={{ marginBottom: '14px', fontSize: '15px', lineHeight: '1.6' }}>
            <strong>Elektron Valens</strong> ialah elektron yang terletak di <strong>petala paling luar</strong> sesuatu atom. Elektron valens sangat penting kerana ia menentukan sifat kimia sesuatu unsur dan terlibat secara langsung dalam pembentukan ikatan kimia.
          </p>
          <div style={{
            background: 'var(--accent-glow)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-main)',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <AlertCircle size={20} color="var(--accent-cyan)" />
            <span>Atom yang mempunyai bilangan elektron valens yang sama mempunyai sifat kimia yang serupa!</span>
          </div>
        </div>
      )
    },
    {
      id: 'stability-rules',
      title: 'Aturan Duplet & Oktet',
      icon: HelpCircle,
      content: (
        <div>
          <p style={{ marginBottom: '12px', fontSize: '15px', lineHeight: '1.6' }}>
            Semua atom mahu mencapai kestabilan. Atom yang stabil mempunyai petala luar yang dipenuhi sepenuhnya oleh elektron, seperti unsur Gas Nadir (Kumpulan 18).
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
            <div style={{
              background: 'var(--bg-app)',
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              borderLeft: '4px solid var(--color-success)'
            }}>
              <strong style={{ color: 'var(--color-success)' }}>Susunan Duplet:</strong> Susunan stabil yang mempunyai <strong>2 elektron</strong> di petala pertama (petala terluar untuk Helium).
            </div>
            <div style={{
              background: 'var(--bg-app)',
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              borderLeft: '4px solid var(--accent-purple)'
            }}>
              <strong style={{ color: 'var(--accent-purple)' }}>Susunan Oktet:</strong> Susunan stabil yang mempunyai <strong>8 elektron</strong> di petala terluar (contoh: Neon, Argon).
            </div>
          </div>
          <p style={{ marginTop: '12px', fontSize: '14px', color: 'var(--text-muted)' }}>
            Untuk mencapai susunan ini, atom akan memindahkan (kehilangan/menerima) elektron atau berkongsi elektron dengan atom lain.
          </p>
        </div>
      )
    }
  ];

  // Config data for SVG Bohr Model rendering
  const atomData = {
    He: { name: 'Helium', arrangement: '2', type: 'Duplet (Stabil)', color: 'var(--color-success)', electrons: [2] },
    Ne: { name: 'Neon', arrangement: '2.8', type: 'Oktet (Stabil)', color: 'var(--accent-purple)', electrons: [2, 8] },
    Ar: { name: 'Argon', arrangement: '2.8.8', type: 'Oktet (Stabil)', color: 'var(--accent-blue)', electrons: [2, 8, 8] }
  };

  const renderBohrModel = (atomKey) => {
    const data = atomData[atomKey];
    const width = 280;
    const height = 280;
    const centerX = width / 2;
    const centerY = height / 2;
    const shellRadii = [35, 70, 105];

    return (
      <svg width={width} height={height} style={{ background: 'transparent', overflow: 'visible' }}>
        {/* Glow backdrop for stable atom */}
        <circle cx={centerX} cy={centerY} r={115} fill="var(--accent-glow)" opacity="0.15" className="animate-pulse-light" />
        
        {/* Nucleus */}
        <circle cx={centerX} cy={centerY} r={20} fill="var(--text-main)" />
        <text 
          x={centerX} 
          y={centerY + 5} 
          textAnchor="middle" 
          fill="var(--bg-app)" 
          style={{ fontSize: '13px', fontWeight: 800 }}
        >
          {atomKey}
        </text>

        {/* Render Shells and Electrons */}
        {data.electrons.map((count, shellIdx) => {
          const radius = shellRadii[shellIdx];
          
          // Generate electron positions
          const electronsArray = [];
          for (let i = 0; i < count; i++) {
            const angle = (i * 2 * Math.PI) / count;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            electronsArray.push({ x, y });
          }

          return (
            <g key={shellIdx}>
              {/* Shell line */}
              <circle 
                cx={centerX} 
                cy={centerY} 
                r={radius} 
                fill="none" 
                stroke="var(--border-color)" 
                strokeWidth="1.5" 
                strokeDasharray="4,4"
              />
              
              {/* Orbiting electrons */}
              {electronsArray.map((e, eIdx) => (
                <g key={eIdx}>
                  {/* Electron Glow */}
                  <circle 
                    cx={e.x} 
                    cy={e.y} 
                    r={8} 
                    fill={data.color} 
                    opacity="0.4"
                    className="animate-pulse-light"
                  />
                  {/* Electron Core */}
                  <circle 
                    cx={e.x} 
                    cy={e.y} 
                    r={5} 
                    fill={data.color} 
                    stroke="var(--bg-app)"
                    strokeWidth="1"
                  />
                </g>
              ))}
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="screen-container">
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <h1 className="gradient-text" style={{ margin: '0 0 8px 0', fontSize: '32px' }}>Panduan Asas Atom</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>
          Fahami asas zarah, susunan elektron, dan mengapa ikatan kimia terbentuk.
        </p>
      </div>

      <div className="grid-cols-2" style={{ gap: '24px' }}>
        {/* Left Side: Topic Selection and Text details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass card" style={{ padding: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '12px' }}>
              Topik Pembelajaran
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {topics.map((t) => {
                const TopicIcon = t.icon;
                const isActive = activeTopic === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTopic(t.id)}
                    className="btn"
                    style={{
                      background: isActive ? 'var(--accent-gradient)' : 'var(--bg-input)',
                      color: isActive ? 'white' : 'var(--text-main)',
                      border: '1px solid var(--border-color)',
                      justifyContent: 'flex-start',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    <TopicIcon size={18} />
                    <span>{t.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="glass card" style={{ flexGrow: 1 }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {topics.find(t => t.id === activeTopic)?.title}
            </h2>
            <div style={{ color: 'var(--text-main)' }}>
              {topics.find(t => t.id === activeTopic)?.content}
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Bohr Model visualization */}
        <div className="glass card flex-center" style={{ flexDirection: 'column', minHeight: '400px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
            Visualisasi Struktur Stabil (Gas Nadir)
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', marginBottom: '16px', maxWidth: '320px' }}>
            Klik pada unsur gas nadir di bawah untuk melihat susunan elektron oktet atau duplet yang stabil.
          </p>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            {Object.keys(atomData).map((key) => (
              <button
                key={key}
                onClick={() => setSelectedDemoAtom(key)}
                className="btn"
                style={{
                  background: selectedDemoAtom === key ? 'var(--accent-gradient)' : 'var(--bg-input)',
                  color: selectedDemoAtom === key ? 'white' : 'var(--text-main)',
                  border: '1px solid var(--border-color)',
                  padding: '6px 16px',
                  fontSize: '13px',
                  borderRadius: '20px'
                }}
              >
                {atomData[key].name} ({key})
              </button>
            ))}
          </div>

          {/* Canvas area */}
          <div style={{
            background: 'var(--bg-app)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            width: '100%',
            maxWidth: '320px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            border: '1px solid var(--border-color)',
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.05)'
          }}>
            {renderBohrModel(selectedDemoAtom)}
          </div>

          {/* Details below Canvas */}
          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>
              {atomData[selectedDemoAtom].name} ({selectedDemoAtom})
            </span>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Susunan Elektron: <strong style={{ color: atomData[selectedDemoAtom].color }}>{atomData[selectedDemoAtom].arrangement}</strong> • Status: <strong style={{ color: atomData[selectedDemoAtom].color }}>{atomData[selectedDemoAtom].type}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
