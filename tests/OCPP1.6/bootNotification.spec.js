import { test } from '../../fixtures/ocppFixture';
import stateManager from '../../utils/stateManager';
import testData from '../../data/testData';
import { bootNotification } from '../../utils/testHelpers';

test.describe.serial('@carga BootNotification', () => {
  test('Enviar BootNotification', async ({ ocppClient }) => {
    await test.step('Enviar BootNotification a la API', async () => {
      const bootRes = await bootNotification(ocppClient, testData.bootNotification);
      console.log('<= Respuesta BootNotification:', bootRes);
      stateManager.saveState({ bootNotificationSent: true });
    });
  });
});