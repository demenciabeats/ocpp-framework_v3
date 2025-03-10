import { test as base } from '@playwright/test';
import OcppClient from '../api/ocppClient';
import dotenv from 'dotenv';
import stateManager from '../utils/stateManager';
import path from 'path';
import fs from 'fs';

dotenv.config();

// Verificar si existe un archivo .env.local y también cargarlo (tiene precedencia)
const envLocalPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
    dotenv.config({ path: envLocalPath });
}

export const test = base.extend({
    ocppClient: async ({}, use) => {
        stateManager.resetState();

        // Obtener URL y ID del punto de carga desde variables de entorno o usar valores predeterminados
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
