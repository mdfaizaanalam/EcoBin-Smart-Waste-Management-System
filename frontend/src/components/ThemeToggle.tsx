import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  style?: React.CSSProperties;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ style, className }) => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('ecobin_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ecobin_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle-btn ${className || ''}`}
      title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
      aria-label="Toggle theme"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '36px',
        height: '36px',
        borderRadius: '10px',
        border: '1px solid var(--border-glass, rgba(255,255,255,0.12))',
        background: 'var(--bg-secondary, #1e293b)',
        color: 'var(--text-primary, #f8fafc)',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: 'var(--shadow-sm, 0 2px 4px rgba(0,0,0,0.1))',
        ...style
      }}
    >
      {theme === 'dark' ? (
        <Sun size={17} color="var(--accent-orange, #f97316)" />
      ) : (
        <Moon size={17} color="var(--accent-cyan, #06b6d4)" />
      )}
    </button>
  );
};

export default ThemeToggle;
