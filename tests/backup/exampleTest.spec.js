import { test, expect } from '../../fixtures/ocppFixture';
import { waitForResponse } from '../../utils/waitForResponse';

test.describe('Ejemplo de Test OCPP con Fixture', () => {
    test('Enviar BootNotification y manejar respuesta', async ({ ocppClient }) => {
        const uniqueId = ocppClient.sendBootNotification(
            "Dhemax",
            "Model-X",
            "SN-12345678",
            "EV.2S7P04",
            "3.3.0.10",
            "8901120000000000000",
            "123456789012345",
            "DhemaxMeter",
            "MTR-001"
        );

        const response = await waitForResponse(ocppClient, uniqueId);
        console.log("📥 Respuesta recibida:", response);

        // Validar la respuesta
        expect(response.status).toBe("Accepted");
    });
});