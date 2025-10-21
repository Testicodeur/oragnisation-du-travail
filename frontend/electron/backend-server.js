const { spawn } = require('child_process');
const path = require('path');

class BackendServer {
  constructor() {
    this.process = null;
    this.port = 8001;
  }

  start() {
    return new Promise((resolve, reject) => {
      // Chemin vers le backend Django
      const backendPath = path.join(__dirname, '../../backend');
      
      // Démarrer le serveur Django
      this.process = spawn('python', ['manage.py', 'runserver', `0.0.0.0:${this.port}`], {
        cwd: backendPath,
        stdio: 'pipe'
      });

      this.process.stdout.on('data', (data) => {
        console.log(`Backend: ${data}`);
        if (data.includes('Starting development server')) {
          resolve();
        }
      });

      this.process.stderr.on('data', (data) => {
        console.error(`Backend Error: ${data}`);
      });

      this.process.on('error', (error) => {
        console.error('Erreur lors du démarrage du backend:', error);
        reject(error);
      });

      this.process.on('close', (code) => {
        console.log(`Backend fermé avec le code ${code}`);
      });

      // Timeout de sécurité
      setTimeout(() => {
        if (!this.process.killed) {
          resolve();
        }
      }, 5000);
    });
  }

  stop() {
    if (this.process) {
      this.process.kill();
      this.process = null;
    }
  }
}

module.exports = BackendServer;
