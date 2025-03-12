import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
    timeout: 600000, // Aumentar el tiempo de espera global a 10 minutos (600000 ms)
    use: {
        baseURL: process.env.WS_URL
    },
    reporter: [['html', { outputFolder: 'reports' }]],
});
