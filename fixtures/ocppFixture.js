import { test as base } from '@playwright/test';
import OcppClient from '../api/ocppClient';
import dotenv from 'dotenv';
import stateManager from '../utils/stateManager';
import path from 'path';
import fs from 'fs';

dotenv.config();

const envLocalPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
    dotenv.config({ path: envLocalPath });
}

export const test = base.extend({
    ocppClient: async ({}, use) => {
        stateManager.resetState();

        const wsUrl = process.env.WS_URL;
        const chargePointId = process.env.CHARGE_POINT_ID;
        
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
