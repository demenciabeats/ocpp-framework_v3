import { test } from '../../fixtures/ocppFixture';
import { waitForResponse } from '../../utils/waitForResponse';
import { execFileSync } from 'child_process';
import path from 'path';
import stateManager from '../../utils/stateManager';
import fs from 'fs';

const testData = JSON.parse(fs.readFileSync('./data/testData.json', 'utf-8'));
const scriptPath = path.join(process.cwd(), 'utils', 'analyzeMeterValues.js');

test.describe.serial('@carga 🛑 Finalizar StopTransaction', () => {
    test('🛑 StopTransaction', { timeout: 120000 }, async ({ ocppClient }) => {
        // 1. Obtenemos la transacción real guardada
        const transactionId = stateManager.state.transactionId;
        if (!transactionId) {
            throw new Error('🚨 No existe transactionId, no se puede detener la transacción.');
        }

        // 2. Enviamos StatusNotification cada 10s durante 60s para mantener la conexión
        console.log('⏳ Manteniendo la carga activa y enviando StatusNotification cada 10s durante 1 minuto...');
        for (let i = 0; i < 6; i++) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            ocppClient.sendStatusNotification(Number(process.env.CONNECTOR_ID), "Charging", "NoError");
            console.log(`⏱ StatusNotification #${i + 1} enviado`);
        }

        // 3. Enviamos StopTransaction con el transactionId real
        console.log('🛑 Enviando StopTransaction...');
        const stopData = testData.stopTransaction;
        const uniqueId = ocppClient.sendStopTransaction(transactionId, stopData.meterStop, stopData.timestamp);

        const response = await waitForResponse(ocppClient, uniqueId);
        console.log("📥 Respuesta recibida:", response);

        console.log('📊 Ejecutando análisis de MeterValues...');
        execFileSync('node', [scriptPath], { stdio: 'inherit' });
    });
});
