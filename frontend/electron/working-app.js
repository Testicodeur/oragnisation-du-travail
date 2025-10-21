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

  // Charger votre vraie app Next.js
  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, '../out/index.html')}`;
  
  mainWindow.loadURL(startUrl);
        <title>Organisation du Travail</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #1a1b3a 0%, #2d1b69 50%, #1a1b3a 100%);
                color: white;
                height: 100vh;
                overflow: hidden;
            }
            
            .app-container {
                display: flex;
                height: 100vh;
            }
            
            .sidebar {
                width: 250px;
                background: rgba(0,0,0,0.3);
                border-right: 1px solid rgba(255,255,255,0.1);
                padding: 20px;
            }
            
            .sidebar h2 {
                color: #3b82f6;
                margin-bottom: 30px;
                font-size: 18px;
            }
            
            .nav-item {
                display: block;
                padding: 12px 16px;
                color: #e5e7eb;
                text-decoration: none;
                border-radius: 8px;
                margin-bottom: 8px;
                transition: all 0.2s;
                cursor: pointer;
            }
            
            .nav-item:hover, .nav-item.active {
                background: rgba(59, 130, 246, 0.2);
                color: #3b82f6;
            }
            
            .main-content {
                flex: 1;
                padding: 30px;
                overflow-y: auto;
            }
            
            .header {
                display: flex;
                justify-content: between;
                align-items: center;
                margin-bottom: 30px;
            }
            
            .header h1 {
                font-size: 28px;
                color: #3b82f6;
            }
            
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            
            .stat-card {
                background: rgba(255,255,255,0.05);
                padding: 20px;
                border-radius: 12px;
                border: 1px solid rgba(255,255,255,0.1);
            }
            
            .stat-card h3 {
                color: #3b82f6;
                margin-bottom: 8px;
            }
            
            .stat-card .number {
                font-size: 24px;
                font-weight: bold;
                color: white;
            }
            
            .projects-section {
                background: rgba(255,255,255,0.05);
                border-radius: 12px;
                padding: 20px;
                border: 1px solid rgba(255,255,255,0.1);
            }
            
            .projects-section h3 {
                color: #3b82f6;
                margin-bottom: 20px;
            }
            
            .project-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 0;
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }
            
            .project-item:last-child {
                border-bottom: none;
            }
            
            .project-name {
                color: white;
                font-weight: 500;
            }
            
            .project-status {
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 500;
            }
            
            .status-active {
                background: rgba(34, 197, 94, 0.2);
                color: #22c55e;
            }
            
            .status-pending {
                background: rgba(251, 191, 36, 0.2);
                color: #fbbf24;
            }
            
            .status-completed {
                background: rgba(59, 130, 246, 0.2);
                color: #3b82f6;
            }
            
            .welcome-banner {
                background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                padding: 20px;
                border-radius: 12px;
                margin-bottom: 30px;
                text-align: center;
            }
            
            .welcome-banner h2 {
                margin-bottom: 10px;
            }
            
            .welcome-banner p {
                color: rgba(255,255,255,0.9);
            }
        </style>
    </head>
    <body>
        <div class="app-container">
            <div class="sidebar">
                <h2>Organisation du Travail</h2>
                <a href="#" class="nav-item active" onclick="showSection('dashboard')">📊 Dashboard</a>
                <a href="#" class="nav-item" onclick="showSection('tasks')">✅ Tâches</a>
                <a href="#" class="nav-item" onclick="showSection('projects')">📁 Projets</a>
                <a href="#" class="nav-item" onclick="showSection('planning')">📅 Planning</a>
                <a href="#" class="nav-item" onclick="showSection('schedule')">⏰ Planning</a>
                <a href="#" class="nav-item" onclick="showSection('clients')">👥 Clients</a>
                <a href="#" class="nav-item" onclick="showSection('settings')">⚙️ Paramètres</a>
            </div>
            
            <div class="main-content">
                <div id="dashboard" class="content-section">
                    <div class="header">
                        <h1>Dashboard</h1>
                    </div>
                    
                    <div class="welcome-banner">
                        <h2>🎉 Application Desktop Prête !</h2>
                        <p>Votre application de gestion de projets fonctionne maintenant en mode desktop natif</p>
                    </div>
                    
                    <div class="stats-grid">
                        <div class="stat-card">
                            <h3>Projets Actifs</h3>
                            <div class="number">12</div>
                        </div>
                        <div class="stat-card">
                            <h3>Tâches en Cours</h3>
                            <div class="number">28</div>
                        </div>
                        <div class="stat-card">
                            <h3>Heures Travaillées</h3>
                            <div class="number">156h</div>
                        </div>
                        <div class="stat-card">
                            <h3>Clients</h3>
                            <div class="number">8</div>
                        </div>
                    </div>
                    
                    <div class="projects-section">
                        <h3>Projets Récents</h3>
                        <div class="project-item">
                            <span class="project-name">Site Web E-commerce</span>
                            <span class="project-status status-active">En cours</span>
                        </div>
                        <div class="project-item">
                            <span class="project-name">Application Mobile</span>
                            <span class="project-status status-pending">En attente</span>
                        </div>
                        <div class="project-item">
                            <span class="project-name">Refonte UI/UX</span>
                            <span class="project-status status-completed">Terminé</span>
                        </div>
                    </div>
                </div>
                
                <div id="tasks" class="content-section" style="display: none;">
                    <div class="header">
                        <h1>Tâches</h1>
                    </div>
                    <p>Gestion des tâches - Interface en cours de développement</p>
                </div>
                
                <div id="projects" class="content-section" style="display: none;">
                    <div class="header">
                        <h1>Projets</h1>
                    </div>
                    <p>Gestion des projets - Interface en cours de développement</p>
                </div>
                
                <div id="planning" class="content-section" style="display: none;">
                    <div class="header">
                        <h1>Planning</h1>
                    </div>
                    <p>Planning et calendrier - Interface en cours de développement</p>
                </div>
                
                <div id="schedule" class="content-section" style="display: none;">
                    <div class="header">
                        <h1>Planning</h1>
                    </div>
                    <p>Gestion du planning - Interface en cours de développement</p>
                </div>
                
                <div id="clients" class="content-section" style="display: none;">
                    <div class="header">
                        <h1>Clients</h1>
                    </div>
                    <p>Gestion des clients - Interface en cours de développement</p>
                </div>
                
                <div id="settings" class="content-section" style="display: none;">
                    <div class="header">
                        <h1>Paramètres</h1>
                    </div>
                    <p>Paramètres de l'application - Interface en cours de développement</p>
                </div>
            </div>
        </div>
        
        <script>
            function showSection(sectionId) {
                // Masquer toutes les sections
                const sections = document.querySelectorAll('.content-section');
                sections.forEach(section => section.style.display = 'none');
                
                // Afficher la section sélectionnée
                document.getElementById(sectionId).style.display = 'block';
                
                // Mettre à jour la navigation
                const navItems = document.querySelectorAll('.nav-item');
                navItems.forEach(item => item.classList.remove('active'));
                event.target.classList.add('active');
            }
        </script>
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
      label: 'Navigation',
      submenu: [
        {
          label: 'Dashboard',
          accelerator: 'CmdOrCtrl+1',
          click: () => {
            mainWindow.webContents.executeJavaScript('showSection("dashboard")');
          }
        },
        {
          label: 'Tâches',
          accelerator: 'CmdOrCtrl+2',
          click: () => {
            mainWindow.webContents.executeJavaScript('showSection("tasks")');
          }
        },
        {
          label: 'Projets',
          accelerator: 'CmdOrCtrl+3',
          click: () => {
            mainWindow.webContents.executeJavaScript('showSection("projects")');
          }
        },
        {
          label: 'Planning',
          accelerator: 'CmdOrCtrl+4',
          click: () => {
            mainWindow.webContents.executeJavaScript('showSection("planning")');
          }
        }
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
