export function generateUniqueId() {
    return Math.random().toString(36).substr(2, 9);
}

export async function generateAndSendMeterValues(ocppClient, transactionId, intervalSeconds, durationSeconds, connector) {
    const { maxPower, batteryCapacity, initialSoc } = connector;
    let currentSoc = initialSoc;
    let meterValueCounter = 0;

    const intervalId = setInterval(() => {
        if (durationSeconds <= 0) {
            clearInterval(intervalId);
            return;
        }

        const power = maxPower * 1000; // Convertir kW a W
        const energyDelivered = (power * intervalSeconds) / 3600; // Energía en Wh
        meterValueCounter += energyDelivered;
        currentSoc += (energyDelivered / (batteryCapacity * 1000)) * 100; // Actualizar SOC

        const meterValue = {
            timestamp: new Date().toISOString(),
            sampledValue: [
                {
                    value: `${meterValueCounter}`,
                    unit: "Wh",
                    measurand: "Energy.Active.Import.Register"
                },
                {
                    value: `${power}`,
                    unit: "W",
                    measurand: "Power.Active.Import"
                },
                {
                    value: `${currentSoc.toFixed(2)}`,
                    unit: "%",
                    measurand: "SoC"
                }
            ]
        };

        sendMeterValues(ocppClient, transactionId, [meterValue]);
        durationSeconds -= intervalSeconds;
    }, intervalSeconds * 1000);
}