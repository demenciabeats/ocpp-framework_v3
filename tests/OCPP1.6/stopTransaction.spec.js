import { test } from '../../fixtures/ocppFixture';
import { execFileSync } from 'child_process';
import path from 'path';
import stateManager from '../../utils/stateManager';

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
        for (let i = 0; i < 12; i++) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            ocppClient.sendMessage([2, `status-${i}`, "StatusNotification", {
                connectorId: Number(process.env.CONNECTOR_ID),
                status: "Charging",
                errorCode: "NoError",
                timestamp: new Date().toISOString()
            }]);
            console.log(`⏱ StatusNotification #${i + 1} enviado`);
        }

        // 3. Enviamos StopTransaction con el transactionId real
        console.log('🛑 Enviando StopTransaction...');
        ocppClient.sendMessage([2, "006", "StopTransaction", {
            transactionId,
            meterStop: 300,
            timestamp: new Date().toISOString()
        }]);

        console.log('📊 Ejecutando análisis de MeterValues...');
        execFileSync('node', [scriptPath], { stdio: 'inherit' });
    });
});
