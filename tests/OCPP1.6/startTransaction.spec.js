import { test } from '../../fixtures/ocppFixture';
import stateManager from '../../utils/stateManager';

test.describe.serial('@carga ⚡ Iniciar StartTransaction', () => {
    test('⚡ StartTransaction', async ({ ocppClient }) => {
        if (!stateManager.state.bootNotificationSent) {
            throw new Error('🚨 No se puede iniciar la transacción sin BootNotification.');
        }

        if (!stateManager.state.authorized) {
            throw new Error('🚨 No se puede iniciar la transacción sin Authorize.');
        }

        // ID único para este request (OCPP usa [2, <uniqueId>, "StartTransaction", {...}])
        const uniqueId = "003";
        
        // Petición StartTransaction válida con campos requeridos para OCPP 1.6
        const startTransactionMessage = [
            2,
            uniqueId,
            "StartTransaction",
            {
                connectorId: Number(process.env.CONNECTOR_ID),
                idTag: process.env.ID_TAG,
                meterStart: 100,
                timestamp: new Date().toISOString()
                // reservationId: 123 // (opcional, si tu backend lo necesita)
            }
        ];

        console.log("📤 Enviando StartTransaction:", JSON.stringify(startTransactionMessage));
        ocppClient.sendMessage(startTransactionMessage);

        // Escucha la respuesta del servidor para capturar el transactionId y guardarlo
        ocppClient.socket.on('message', (rawData) => {
            try {
                const data = JSON.parse(rawData);
                // data[0] = tipo de mensaje (3 = Respuesta), data[1] = mismo 'uniqueId', data[2] = payload
                if (data[0] === 3 && data[1] === uniqueId) {
                    const response = data[2];
                    console.log("📥 Respuesta StartTransaction:", JSON.stringify(response));

                    // Si el servidor confirma la transacción con "Accepted", guardamos la transactionId real
                    if (response.idTagInfo && response.idTagInfo.status === "Accepted") {
                        const realTransactionId = response.transactionId;
                        console.log(`🤝 StartTransaction aceptado con transactionId: ${realTransactionId}`);
                        stateManager.saveState({ transactionId: realTransactionId });
                    } else {
                        console.log("⚠️ StartTransaction rechazado o con estado desconocido:", response);
                    }
                }
            } catch (err) {
                console.error("❌ Error procesando la respuesta de StartTransaction:", err);
            }
        });

        // Espera breve para dar tiempo a recibir respuesta (ajusta según tu escenario)
        await new Promise(resolve => setTimeout(resolve, 5000));
    });
});
