import { test as base } from '@playwright/test';
import OcppClient from '../api/ocppClient';
import dotenv from 'dotenv';
import stateManager from '../utils/stateManager';

dotenv.config();

export const test = base.extend({
    ocppClient: async ({}, use) => {
    
        stateManager.resetState();

        const client = new OcppClient(process.env.WS_URL, process.env.CHARGE_POINT_ID);
        await client.connect();
        await use(client);
        client.close();
    }
});
