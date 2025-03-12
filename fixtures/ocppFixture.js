import { test as base } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import OcppClient from '../api/ocppClient';
import stateManager from '../utils/stateManager';

const __filename = fileURLToPath(import.meta.url);
const fixtureDir = path.dirname(__filename);
const envPath = path.resolve(fixtureDir, '..', '.env');

if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    console.warn(`No se encontró .env en ${envPath}`);
}

const wsUrl = process.env.WS_URL;
const chargePointId = process.env.CHARGE_POINT_ID;
console.log("WS_URL:", wsUrl, "CHARGE_POINT_ID:", chargePointId);

export const test = base.extend({
    ocppClient: async ({}, use) => {
        stateManager.resetState();
        console.log(`🔌 Conectando a ${wsUrl} como punto de carga ${chargePointId}`);
        
        const client = new OcppClient(wsUrl, chargePointId);
        try {
            await client.connect();
            await use(client);
        } finally {
            client.close();
        }
    }
});
