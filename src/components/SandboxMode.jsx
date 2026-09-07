import { useState } from 'react';
import { RefreshCw, HelpCircle, Activity, Sparkles } from 'lucide-react';
import { sounds } from '../utils/audio';

const SANDBOX_ATOMS = [
  { symbol: 'Na', name: 'Natrium', type: 'metal', valence: 1, config: '2.8.1' },
  { symbol: 'Mg', name: 'Magnesium', type: 'metal', valence: 2, config: '2.8.2' },
  { symbol: 'Ca', name: 'Kalsium', type: 'metal', valence: 2, config: '2.8.8.2' },
  { symbol: 'Al', name: 'Aluminium', type: 'metal', valence: 3, config: '2.8.3' },
  { symbol: 'H', name: 'Hidrogen', type: 'nonmetal', valence: 1, config: '1' },
  { symbol: 'C', name: 'Karbon', type: 'nonmetal', valence: 4, config: '2.4' },
  { symbol: 'O', name: 'Oksigen', type: 'nonmetal', valence: 6, config: '2.6' },
  { symbol: 'F', name: 'Fluorin', type: 'nonmetal', valence: 7, config: '2.7' },
  { symbol: 'Cl', name: 'Klorin', type: 'nonmetal', valence: 7, config: '2.8.7' }
];

function toSubscript(num) {
  const map = { 0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄', 5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉' };
  if (num === 1) return '';
  return String(num).split('').map(d => map[d] || d).join('');
}

function chargeText(charge) {
  const abs = Math.abs(charge);
  if (charge > 0) return abs === 1 ? '⁺' : `${abs}⁺`;
  if (charge < 0) return abs === 1 ? '⁻' : `${abs}⁻`;
  return '';
}

const CrossMethodAnimation = ({ details }) => {
  if (!details) return null;
  const { symbolA, valencyA, symbolB, valencyB, subA, subB, factor } = details;

  return (
    <div className="glass-card animate-fade-in" style={{ marginTop: '16px', padding: '16px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>Simulasi Kaedah Silang (Pembentukan Formula)</h4>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '50px', alignItems: 'center', position: 'relative', height: '80px', marginTop: '10px' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', zIndex: 2 }}>
          <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)' }}>{symbolA}</span>
          <span className="animate-fade-in" style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-almost)', animationDelay: '0.5s', animationFillMode: 'both' }}>{valencyA}</span>
        </div>

        {/* Cross arrows SVG */}
        <svg style={{ position: 'absolute', top: '35px', left: '50%', transform: 'translateX(-50%)', width: '90px', height: '40px', overflow: 'visible', zIndex: 1 }}>
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--text-muted)" />
            </marker>
          </defs>
          <path d="M 15 0 L 75 35" stroke="var(--text-muted)" strokeWidth="2" strokeDasharray="4" markerEnd="url(#arrow)" className="animate-draw-path" style={{ animationDelay: '1.2s' }} />
          <path d="M 75 0 L 15 35" stroke="var(--text-muted)" strokeWidth="2" strokeDasharray="4" markerEnd="url(#arrow)" className="animate-draw-path" style={{ animationDelay: '1.2s' }} />
        </svg>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', zIndex: 2 }}>
          <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)' }}>{symbolB}</span>
          <span className="animate-fade-in" style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-almost)', animationDelay: '0.8s', animationFillMode: 'both' }}>{valencyB}</span>
        </div>
      </div>

      <div className="animate-fade-in" style={{ textAlign: 'center', marginTop: '4px', fontSize: '16px', animationDelay: '2.2s', animationFillMode: 'both' }}>
        <span style={{ color: 'var(--text-muted)' }}>Hasil Silang: </span>
        <strong style={{ color: 'var(--text-main)', letterSpacing: '1px' }}>
          {symbolA}<sub style={{ fontSize: '12px' }}>{valencyB}</sub>{symbolB}<sub style={{ fontSize: '12px' }}>{valencyA}</sub>
        </strong>
      </div>
      
      {factor > 1 && (
        <div className="animate-fade-in" style={{ textAlign: 'center', marginTop: '4px', fontSize: '14px', color: 'var(--color-stable)', animationDelay: '3s', animationFillMode: 'both' }}>
          Diringkaskan (÷{factor}) ➔ <strong style={{ fontSize: '16px' }}>{symbolA}{subA > 1 ? <sub>{subA}</sub> : ''}{symbolB}{subB > 1 ? <sub>{subB}</sub> : ''}</strong>
        </div>
      )}
    </div>
  );
};

/* Interactive SVG Bond Formation Animation Component */
const BondAnimationRenderer = ({ atomA, atomB, result }) => {
  if (!atomA || !atomB || !result) return null;

  const isIonic = result.type === 'Ikatan Ionik';
  const isCovalent = result.type === 'Ikatan Kovalen';

  if (!isIonic && !isCovalent) return null;

  const width = 360;
  const height = 180;

  if (isIonic) {
    const metal = atomA.type === 'metal' ? atomA : atomB;
    const nonmetal = atomA.type === 'metal' ? atomB : atomA;
    const chargeM = metal.valence;
    const chargeN = -(8 - nonmetal.valence);

    return (
      <div className="glass-card animate-fade-in" style={{ marginTop: '16px', padding: '16px', textAlign: 'center' }}>
        <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Simulasi Pembentukan Ikatan Ionik</h4>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', maxHeight: '180px', overflow: 'visible' }}>
          {/* Metal Atom / Ion Left */}
          <g transform="translate(100, 90)">
            {/* Outer boundary */}
            <circle cx="0" cy="0" r="45" fill="rgba(37,99,235,0.05)" stroke="var(--accent-blue)" strokeWidth="1.5" strokeDasharray="4,4" />
            {/* Valence Shell */}
            <circle cx="0" cy="0" r="32" fill="none" stroke="var(--border-color)" strokeWidth="1" />
            {/* Nucleus */}
            <circle cx="0" cy="0" r="16" fill="var(--bg-app)" stroke="var(--border-color)" strokeWidth="2" />
            <text x="0" y="5" textAnchor="middle" fill="var(--text-main)" style={{ fontWeight: 900, fontSize: '14px' }}>
              {metal.symbol}
            </text>
            
            {/* Square Bracket & Charge */}
            <g className="animate-fade-in" style={{ animationDelay: '1.8s', animationFillMode: 'both' }}>
              <path d="M -40 -50 L -50 -50 L -50 50 L -40 50" fill="none" stroke="var(--text-main)" strokeWidth="2" />
              <path d="M 40 -50 L 50 -50 L 50 50 L 40 50" fill="none" stroke="var(--text-main)" strokeWidth="2" />
              <text x="56" y="-38" fill="var(--accent-blue)" style={{ fontWeight: 900, fontSize: '18px' }}>
                {chargeText(chargeM)}
              </text>
            </g>
          </g>

          {/* Transfer Electron Arrow */}
          <g transform="translate(100, 90)">
            <circle cx="32" cy="0" r="5" fill="var(--accent-purple)" className="animate-pulse-ring">
              <animate attributeName="cx" values="32;128" dur="2s" repeatCount="indefinite" />
              <animate attributeName="cy" values="0;0" dur="2s" repeatCount="indefinite" />
            </circle>
          </g>

          {/* Electrostatic attraction line */}
          <line x1="150" y1="90" x2="210" y2="90" stroke="var(--accent-cyan)" strokeWidth="2" strokeDasharray="4,4" className="animate-pulse-light" />

          {/* Nonmetal Atom / Ion Right */}
          <g transform="translate(260, 90)">
            {/* Outer boundary */}
            <circle cx="0" cy="0" r="45" fill="rgba(147,51,234,0.05)" stroke="var(--accent-purple)" strokeWidth="1.5" strokeDasharray="4,4" />
            {/* Valence Shell */}
            <circle cx="0" cy="0" r="32" fill="none" stroke="var(--border-color)" strokeWidth="1" />
            {/* Nucleus */}
            <circle cx="0" cy="0" r="16" fill="var(--bg-app)" stroke="var(--border-color)" strokeWidth="2" />
            <text x="0" y="5" textAnchor="middle" fill="var(--text-main)" style={{ fontWeight: 900, fontSize: '14px' }}>
              {nonmetal.symbol}
            </text>
            
            {/* Square Bracket & Charge */}
            <g className="animate-fade-in" style={{ animationDelay: '1.8s', animationFillMode: 'both' }}>
              <path d="M -40 -50 L -50 -50 L -50 50 L -40 50" fill="none" stroke="var(--text-main)" strokeWidth="2" />
              <path d="M 40 -50 L 50 -50 L 50 50 L 40 50" fill="none" stroke="var(--text-main)" strokeWidth="2" />
              <text x="56" y="-38" fill="var(--accent-purple)" style={{ fontWeight: 900, fontSize: '18px' }}>
                {chargeText(chargeN)}
              </text>
            </g>
          </g>
        </svg>
      </div>
    );
  }

  // Covalent bond overlap animation
  return (
    <div className="glass-card animate-fade-in" style={{ marginTop: '16px', padding: '16px', textAlign: 'center' }}>
      <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Simulasi Perkongsian Elektron (Ikatan Kovalen)</h4>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', maxHeight: '180px', overflow: 'visible' }}>
        {/* Overlapping Shells */}
        <g transform="translate(135, 90)">
          <circle cx="0" cy="0" r="42" fill="rgba(147,51,234,0.08)" stroke="var(--accent-purple)" strokeWidth="2" />
          <circle cx="0" cy="0" r="16" fill="var(--bg-app)" stroke="var(--border-color)" strokeWidth="2" />
          <text x="0" y="5" textAnchor="middle" fill="var(--text-main)" style={{ fontWeight: 900, fontSize: '14px' }}>
            {atomA.symbol}
          </text>
        </g>

        <g transform="translate(225, 90)">
          <circle cx="0" cy="0" r="42" fill="rgba(37,99,235,0.08)" stroke="var(--accent-blue)" strokeWidth="2" />
          <circle cx="0" cy="0" r="16" fill="var(--bg-app)" stroke="var(--border-color)" strokeWidth="2" />
          <text x="0" y="5" textAnchor="middle" fill="var(--text-main)" style={{ fontWeight: 900, fontSize: '14px' }}>
            {atomB.symbol}
          </text>
        </g>

        {/* Shared electrons in overlap zone */}
        <g transform="translate(180, 90)">
          <ellipse cx="0" cy="0" rx="20" ry="32" fill="rgba(16,185,129,0.15)" stroke="var(--color-stable)" strokeWidth="1.5" strokeDasharray="3,3" />
          <circle cx="-6" cy="-8" r="4" fill="var(--accent-purple)" className="animate-float" />
          <circle cx="6" cy="8" r="4" fill="var(--accent-blue)" className="animate-float" style={{ animationDelay: '0.5s' }} />
        </g>
      </svg>
    </div>
  );
};

export default function SandboxMode() {
  const [atomA, setAtomA] = useState(null);
  const [atomB, setAtomB] = useState(null);

  const resetSandbox = () => {
    sounds.playElectron();
    setAtomA(null);
    setAtomB(null);
  };

  const evaluateBond = () => {
    if (!atomA || !atomB) return null;

    const isMetalA = atomA.type === 'metal';
    const isMetalB = atomB.type === 'metal';

    // Special Check: Hydrogen (H) or Carbon (C)
    const isHC_A = atomA.symbol === 'H' || atomA.symbol === 'C';
    const isHC_B = atomB.symbol === 'H' || atomB.symbol === 'C';

    // Carbon + Oxygen check
    if ((atomA.symbol === 'C' && atomB.symbol === 'O') || (atomA.symbol === 'O' && atomB.symbol === 'C')) {
      return {
        type: 'Ikatan Kovalen',
        color: 'var(--accent-purple)',
        formula: 'CO₂',
        reason: 'Perkongsian elektron (ganda dua).',
        desc: 'Karbon (2.4) dan Oksigen (2.6) berkongsi elektron untuk mencapai kestabilan oktet dalam molekul Karbon Dioksida (CO₂).',
        details: {
          symbolA: 'C',
          valencyA: 4,
          symbolB: 'O',
          valencyB: 2,
          subA: 1,
          subB: 2,
          factor: 2
        }
      };
    }

    // Hydrogen or Carbon combined with Metal
    if ((isHC_A && isMetalB) || (isMetalA && isHC_B)) {
      const hcAtom = isHC_A ? atomA : atomB;
      const metalAtom = isMetalA ? atomA : atomB;
      return {
        type: 'Hanya Ikatan Kovalen',
        color: 'var(--accent-purple)',
        formula: `Sebatian Kovalen / Hidrida`,
        reason: 'Unsur ini tidak membentuk ikatan ionik ringkas.',
        desc: `${hcAtom.name} dan ${metalAtom.name} tidak membentuk ikatan ionik biasa. Hidrogen dan Karbon secara umumnya hanya membentuk ikatan kovalen melalui perkongsian elektron.`,
        details: null
      };
    }

    // 1. Metal + Non-metal (Ionic)
    if ((isMetalA && !isMetalB) || (!isMetalA && isMetalB)) {
      const metal = isMetalA ? atomA : atomB;
      const nonmetal = isMetalA ? atomB : atomA;
      
      const metalValency = metal.valence;
      const nonmetalValency = 8 - nonmetal.valence;
      
      const gcd = (x, y) => (!y ? x : gcd(y, x % y));
      const factor = gcd(metalValency, nonmetalValency);
      
      const mSub = nonmetalValency / factor;
      const nSub = metalValency / factor;
      
      const formula = `${metal.symbol}${toSubscript(mSub)}${nonmetal.symbol}${toSubscript(nSub)}`;

      return {
        type: 'Ikatan Ionik',
        color: 'var(--accent-blue)',
        formula,
        reason: 'Pemindahan elektron berlaku.',
        desc: `Logam ${metal.name} memindahkan elektron kepada ${nonmetal.name}. Ion bercas bertentangan tertarik menghasilkan sebatian ${formula}.`,
        details: {
          symbolA: metal.symbol,
          valencyA: metalValency,
          symbolB: nonmetal.symbol,
          valencyB: nonmetalValency,
          subA: mSub,
          subB: nSub,
          factor
        }
      };
    }

    // 2. Non-metal + Non-metal (Covalent)
    if (!isMetalA && !isMetalB) {
      let formula;
      if (atomA.symbol === atomB.symbol) {
        formula = `${atomA.symbol}₂`;
      } else {
        const valA = atomA.symbol === 'H' ? 1 : 8 - atomA.valence;
        const valB = atomB.symbol === 'H' ? 1 : 8 - atomB.valence;
        
        const gcd = (x, y) => (!y ? x : gcd(y, x % y));
        const factor = gcd(valA, valB);
        
        const subA = valB / factor;
        const subB = valA / factor;
        
        formula = `${atomA.symbol}${toSubscript(subA)}${atomB.symbol}${toSubscript(subB)}`;
      }

      return {
        type: 'Ikatan Kovalen',
        color: 'var(--accent-purple)',
        formula,
        reason: 'Perkongsian elektron berlaku.',
        desc: `Kedua-dua atom bukan logam berkongsi elektron luaran untuk mencapai kestabilan duplet atau oktet.`,
        details: atomA.symbol === atomB.symbol ? null : {
          symbolA: atomA.symbol,
          valencyA: atomA.symbol === 'H' ? 1 : 8 - atomA.valence,
          symbolB: atomB.symbol,
          valencyB: atomB.symbol === 'H' ? 1 : 8 - atomB.valence,
          subA: (atomB.symbol === 'H' ? 1 : 8 - atomB.valence) / gcd(atomA.symbol === 'H' ? 1 : 8 - atomA.valence, atomB.symbol === 'H' ? 1 : 8 - atomB.valence),
          subB: (atomA.symbol === 'H' ? 1 : 8 - atomA.valence) / gcd(atomA.symbol === 'H' ? 1 : 8 - atomA.valence, atomB.symbol === 'H' ? 1 : 8 - atomB.valence),
          factor: gcd(atomA.symbol === 'H' ? 1 : 8 - atomA.valence, atomB.symbol === 'H' ? 1 : 8 - atomB.valence)
        }
      };
    }

    // 3. Metal + Metal
    return {
      type: 'Tiada Ikatan Stabil',
      color: 'var(--color-unstable)',
      formula: 'Tiada Sebatian',
      reason: 'Kedua-dua cenderung menderma.',
      desc: `Atom logam tidak bertindak balas sesama sendiri secara ionik mahupun kovalen.`
    };
  };

  const selectAtom = (atom) => {
    sounds.playElectron();
    if (!atomA) {
      setAtomA(atom);
    } else if (!atomB) {
      setAtomB(atom);
      sounds.playBond();
    }
  };

  const renderStabilityRing = (filled, total) => {
    const arr = [];
    for (let i = 0; i < total; i++) arr.push(i < filled);
    return (
      <div className="stability-ring" style={{ marginTop: '8px' }}>
        {arr.map((f, i) => (
          <div key={i} className={`stability-dot ${f ? 'filled' : 'empty'}`} />
        ))}
      </div>
    );
  };

  const result = evaluateBond();

  return (
    <div className="screen-container" style={{ padding: '24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1 className="gradient-text" style={{ fontSize: '32px', fontWeight: 800 }}>Eksperimen Bebas</h1>
        <p style={{ color: 'var(--text-muted)' }}>Sandbox: Pilih dan gabungkan atom secara rawak untuk meramal pembentukan ikatan.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        {/* Slot board */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', minHeight: '300px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Meja Eksperimen</h3>
          
          <div style={{ display: 'flex', gap: '30px', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            {/* Slot A */}
            <div 
              onClick={() => { sounds.playElectron(); setAtomA(null); }}
              style={{
                width: '110px',
                height: '110px',
                borderRadius: '50%',
                border: `2px dashed ${atomA ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                background: 'rgba(0,0,0,0.2)'
              }}
            >
              {atomA ? (
                <>
                  <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-cyan)' }}>{atomA.symbol}</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{atomA.name}</span>
                  {renderStabilityRing(atomA.valence, atomA.symbol === 'H' ? 2 : 8)}
                </>
              ) : (
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Atom A</span>
              )}
            </div>

            <div style={{ fontSize: '28px', fontWeight: 300, color: 'var(--text-muted)' }}>+</div>

            {/* Slot B */}
            <div 
              onClick={() => { sounds.playElectron(); setAtomB(null); }}
              style={{
                width: '110px',
                height: '110px',
                borderRadius: '50%',
                border: `2px dashed ${atomB ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                background: 'rgba(0,0,0,0.2)'
              }}
            >
              {atomB ? (
                <>
                  <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-cyan)' }}>{atomB.symbol}</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{atomB.name}</span>
                  {renderStabilityRing(atomB.valence, atomB.symbol === 'H' ? 2 : 8)}
                </>
              ) : (
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Atom B</span>
              )}
            </div>
          </div>

          {(atomA || atomB) && (
            <button className="gradient-btn" onClick={resetSandbox} style={{ padding: '8px 16px', borderRadius: '8px' }}>
              Reset Meja
            </button>
          )}
        </div>

        {/* Results */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color="var(--accent-cyan)" /> Analisis
          </h3>
          
          {result ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Jenis Ikatan:</span>
                <div style={{ fontSize: '22px', fontWeight: 800, color: result.color }}>{result.type}</div>
              </div>
              <div style={{ background: 'var(--bg-app)', padding: '10px', borderRadius: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Formula / Penerangan:</span>
                <strong style={{ fontSize: '16px', color: 'var(--text-main)' }}>{result.formula}</strong>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>{result.desc}</p>
              </div>

              {/* Dynamic Bond Formation Animation */}
              <BondAnimationRenderer atomA={atomA} atomB={atomB} result={result} />

              <CrossMethodAnimation details={result.details} />
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
              <HelpCircle size={40} style={{ opacity: 0.3, margin: '0 auto 10px auto' }} />
              <p style={{ fontSize: '13px', margin: 0 }}>Pilih dua unsur atom untuk menjalankan simulasi ramalan ikatan.</p>
            </div>
          )}
        </div>
      </div>

      {/* Select List */}
      <div className="glass-card">
        <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Pilih Atom:</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '10px' }}>
          {SANDBOX_ATOMS.map((atom) => {
            const isFull = !!(atomA && atomB);
            return (
              <button
                key={atom.symbol}
                onClick={() => selectAtom(atom)}
                disabled={isFull}
                className="gradient-btn"
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  background: 'var(--bg-input)',
                  border: '1.5px solid var(--border-color)',
                  opacity: isFull ? 0.4 : 1,
                  cursor: isFull ? 'not-allowed' : 'pointer'
                }}
              >
                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>{atom.symbol}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{atom.name}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
