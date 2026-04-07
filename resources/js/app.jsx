import '../css/app.css';
import './bootstrap';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

router.on('navigate', () => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        event: 'pageview',
        page_path: window.location.pathname,
        page_title: document.title,
    });
});

const appName = import.meta.env.VITE_APP_NAME || 'Project Tracker';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => {
        const pages = import.meta.glob('./Pages/**/*.{jsx,tsx}');
        const tsxPath = `./Pages/${name}.tsx`;
        const jsxPath = `./Pages/${name}.jsx`;
        return resolvePageComponent(pages[tsxPath] ? tsxPath : jsxPath, pages);
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
