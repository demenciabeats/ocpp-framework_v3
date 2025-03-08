import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
    timeout: 300000, // 5 minutos para cubrir los 2 minutos de carga y cualquier retraso adicional
    use: {
        baseURL: process.env.WS_URL
    },
    reporter: [['html', { outputFolder: 'reports' }]],
});
