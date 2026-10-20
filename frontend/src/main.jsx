import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { readPreferences } from './utils/preferences';
document.documentElement.dataset.density = readPreferences().compactTables ? 'compact' : 'comfortable';
createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>);
