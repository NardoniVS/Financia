import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Ensure light mode is strictly applied
document.documentElement.classList.remove('dark');
document.documentElement.classList.add('light');
localStorage.setItem('finology_theme', 'light');

createRoot(document.getElementById('root')!).render(<App />);
