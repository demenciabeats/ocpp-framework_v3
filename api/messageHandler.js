export function handleMessage(data) {
    console.log('📥 Recibido:', data);
    let parsedData;

    try {
        parsedData = JSON.parse(data);
    } catch (error) {
        console.error('❌ Error al parsear el mensaje:', error);
        return;
    }
}