import fs from 'fs';
import path from 'path';

class StateManager {
    constructor() {
        this.filePath = path.join(process.cwd(), 'data', 'state.json');
        this.state = { bootNotificationSent: false, authorized: false, transactionId: null };
        this.initializeState();
    }

    initializeState() {
        try {
            const dirPath = path.dirname(this.filePath);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
                console.log(`🗂️ Directorio creado: ${dirPath}`);
            }

            if (fs.existsSync(this.filePath)) {
                const savedState = JSON.parse(fs.readFileSync(this.filePath, 'utf-8'));
                this.state = { ...this.state, ...savedState };
                console.log('📝 Estado interno de test cargado:', this.state);
            } else {
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
            console.log('💾 Estado interno de test  guardado:', this.state);
        } catch (error) {
            console.error('❌ Error al guardar el estado:', error);
        }
    }

    resetState() {
        try {
            this.state = { bootNotificationSent: false, authorized: false, transactionId: null };
            
            const dirPath = path.dirname(this.filePath);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }
            
            fs.writeFileSync(this.filePath, JSON.stringify(this.state, null, 2));
            console.log('🔄 Estado interno de test reiniciado');
        } catch (error) {
            console.error('❌ Error al reiniciar el estado:', error);
        }
    }
}

const stateManager = new StateManager();
export default stateManager;
