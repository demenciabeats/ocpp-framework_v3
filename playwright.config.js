import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
    timeout: 480000,
    use: {
        baseURL: process.env.WS_URL
    },
    reporter: [['html', { outputFolder: 'reports' }]],
});
