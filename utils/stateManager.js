import fs from 'fs';

class StateManager {
    constructor(filePath = './data/state.json') {
        this.filePath = filePath;
        this.state = this.loadState();
    }

    loadState() {
        try {
            return JSON.parse(fs.readFileSync(this.filePath, 'utf-8'));
        } catch (error) {
            return { bootNotificationSent: false, authorized: false, transactionId: null };
        }
    }

    saveState(newState) {
        this.state = { ...this.state, ...newState };
        fs.writeFileSync(this.filePath, JSON.stringify(this.state, null, 2));
    }

    resetState() {
        this.state = { bootNotificationSent: false, authorized: false, transactionId: null };
        fs.writeFileSync(this.filePath, JSON.stringify(this.state, null, 2));
    }
}

export default new StateManager();
