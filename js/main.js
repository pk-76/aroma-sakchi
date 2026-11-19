/* AROMA — entry point. Each module is isolated so one failure can never take the page down. */
import { initCore } from './core.js';
import { initMotion } from './motion.js';
import { initMenu } from './menu.js';
import { initAI } from './ai.js';
import { initForms } from './forms.js';
import { initContent } from './content.js';

const safe = (name, fn) => { try { const r = fn(); if (r && r.catch) r.catch((e) => console.warn('[aroma]', name, e)); } catch (e) { console.warn('[aroma]', name, e); } };

safe('core', initCore);
safe('motion', initMotion);
safe('menu', initMenu);
safe('ai', initAI);
safe('forms', initForms);
safe('content', initContent);
