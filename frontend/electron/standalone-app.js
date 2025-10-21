const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

// Garder une référence globale de l'objet window
let mainWindow;

function createWindow() {
  // Créer la fenêtre du navigateur
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true
    },
    icon: path.join(__dirname, 'icon.png'),
    titleBarStyle: 'default',
    show: false
  });

  // Charger une page de démonstration simple
  const demoHTML = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Organisation du Travail</title>
        <style>
            body {
                margin: 0;
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #1a1b3a 0%, #2d1b69 50%, #1a1b3a 100%);
                color: white;
                height: 100vh;
                display: flex;
                flex-direction: column;
            }
            .header {
                padding: 20px;
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }
            .header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: 600;
            }
            .content {
                flex: 1;
                padding: 40px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
            }
            .welcome {
                max-width: 600px;
            }
            .welcome h2 {
                font-size: 32px;
                margin-bottom: 20px;
                color: #3b82f6;
            }
            .welcome p {
                font-size: 18px;
                line-height: 1.6;
                margin-bottom: 30px;
                color: #e5e7eb;
            }
            .features {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin-top: 40px;
            }
            .feature {
                background: rgba(255,255,255,0.05);
                padding: 20px;
                border-radius: 8px;
                border: 1px solid rgba(255,255,255,0.1);
            }
            .feature h3 {
                margin: 0 0 10px 0;
                color: #3b82f6;
            }
            .feature p {
                margin: 0;
                color: #9ca3af;
            }
            .status {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: rgba(0,0,0,0.8);
                padding: 10px 15px;
                border-radius: 5px;
                font-size: 14px;
                color: #10b981;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Organisation du Travail</h1>
        </div>
        <div class="content">
            <div class="welcome">
                <h2>Bienvenue dans votre application desktop !</h2>
                <p>Votre application de gestion de projets et tâches est maintenant disponible en version desktop native.</p>
                
                <div class="features">
                    <div class="feature">
                        <h3>📱 PWA Mobile</h3>
                        <p>Installez l'app sur votre téléphone depuis le navigateur</p>
                    </div>
                    <div class="feature">
                        <h3>🖥️ Desktop Native</h3>
                        <p>Application native avec menu et raccourcis clavier</p>
                    </div>
                    <div class="feature">
                        <h3>⚡ Performance</h3>
                        <p>Interface rapide et responsive</p>
                    </div>
                    <div class="feature">
                        <h3>🔧 Personnalisable</h3>
                        <p>Thème sombre et interface moderne</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="status">
            ✅ Application Electron prête
        </div>
    </body>
    </html>
  `;

  mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(demoHTML)}`);

  // Montrer la fenêtre quand elle est prête
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Ouvrir les DevTools en mode développement
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Gérer la fermeture de la fenêtre
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Ouvrir les liens externes dans le navigateur par défaut
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// Cette méthode sera appelée quand Electron aura fini de s'initialiser
app.whenReady().then(() => {
  createWindow();

  // Sur macOS, il est courant de recréer une fenêtre quand l'icône du dock est cliquée
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // Créer le menu de l'application
  createMenu();
});

// Quitter quand toutes les fenêtres sont fermées
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Créer le menu de l'application
function createMenu() {
  const template = [
    {
      label: 'Fichier',
      submenu: [
        {
          label: 'Nouveau Projet',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            console.log('Nouveau projet');
          }
        },
        {
          label: 'Nouvelle Tâche',
          accelerator: 'CmdOrCtrl+T',
          click: () => {
            console.log('Nouvelle tâche');
          }
        },
        { type: 'separator' },
        {
          label: 'Quitter',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Édition',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: 'Affichage',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Aide',
      submenu: [
        {
          label: 'À propos',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'À propos',
              message: 'Organisation du Travail',
              detail: 'Application de gestion de projets et tâches\nVersion 1.0.0\n\nDéveloppé avec Electron + Next.js'
            });
          }
        }
      ]
    }
  ];

  // Sur macOS, ajouter le menu de l'application
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Gérer les erreurs non capturées
process.on('uncaughtException', (error) => {
  console.error('Erreur non capturée:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesse rejetée non gérée:', reason);
});
