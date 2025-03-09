import fs from 'fs';
import path from 'path';

class StateManager {
    constructor() {
        // Definir la ruta del archivo de estado en la raíz del proyecto
        this.filePath = path.join(process.cwd(), 'data', 'state.json');
        this.state = { bootNotificationSent: false, authorized: false, transactionId: null };
        this.initializeState();
    }

    initializeState() {
        try {
            // Asegurar que el directorio existe
            const dirPath = path.dirname(this.filePath);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
                console.log(`🗂️ Directorio creado: ${dirPath}`);
            }

            // Intentar cargar el estado existente
            if (fs.existsSync(this.filePath)) {
                const savedState = JSON.parse(fs.readFileSync(this.filePath, 'utf-8'));
                this.state = { ...this.state, ...savedState };
                console.log('📝 Estado cargado:', this.state);
            } else {
                // Si no existe, crear archivo con estado inicial
                fs.writeFileSync(this.filePath, JSON.stringify(this.state, null, 2));
                console.log('📝 Archivo de estado creado con valores iniciales');
            }
        } catch (error) {
            console.error('❌ Error al inicializar el estado:', error);
        }
    }

    saveState(newState) {
        try {
            this.state = { ...this.state, ...newState };
            fs.writeFileSync(this.filePath, JSON.stringify(this.state, null, 2));
            console.log('💾 Estado guardado:', this.state);
        } catch (error) {
            console.error('❌ Error al guardar el estado:', error);
        }
    }

    resetState() {
        try {
            this.state = { bootNotificationSent: false, authorized: false, transactionId: null };
            
            // Asegurar que el directorio existe antes de escribir
            const dirPath = path.dirname(this.filePath);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }
            
            fs.writeFileSync(this.filePath, JSON.stringify(this.state, null, 2));
            console.log('🔄 Estado reiniciado');
        } catch (error) {
            console.error('❌ Error al reiniciar el estado:', error);
        }
    }
}

// Singleton para usar en toda la aplicación
const stateManager = new StateManager();
export default stateManager;
