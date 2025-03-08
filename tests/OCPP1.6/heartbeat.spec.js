import { test } from '../../fixtures/ocppFixture';

test.describe.serial('@carga 🩺 Enviar Heartbeat', () => {
    test('🩺 Heartbeat', { timeout: 7000 }, async ({ ocppClient }) => {
        for (let i = 1; i <= 5; i++) {
            ocppClient.sendMessage([2, `005-${i}`, "Heartbeat", {}]);
            console.log(`🩺 Heartbeat enviado (${i})`);
            // Se reduce el delay para evitar tiempo de espera excesivo
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    });
});