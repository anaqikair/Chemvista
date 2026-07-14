import { BookOpen } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="glass" style={{
      marginTop: 'auto',
      padding: '20px 24px',
      borderTop: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      fontSize: '13px',
      color: 'var(--text-muted)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <BookOpen size={16} color="var(--accent-blue)" />
        <span>KSSM Kimia Tingkatan 4 • Bab 5: Ikatan Kimia</span>
      </div>
      <div>
        <span>Versi 1.0.0 (Stabil)</span>
      </div>
      <div>
        <span>Hak Cipta Terpelihara © {new Date().getFullYear()} • <strong>ChemVista</strong></span>
      </div>
    </footer>
  );
}
