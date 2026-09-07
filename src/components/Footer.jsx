import { BookOpen } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

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
        <span>{t('footerSyllabus')}</span>
      </div>
      <div>
        <span>{t('footerVersion')}</span>
      </div>
      <div>
        <span>{t('footerRights')} {new Date().getFullYear()} • <strong>ChemVista</strong></span>
      </div>
    </footer>
  );
}
