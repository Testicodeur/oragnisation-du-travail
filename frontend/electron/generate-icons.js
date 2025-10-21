const fs = require('fs');
const path = require('path');

// Créer un SVG simple pour l'icône Electron
const createIconSVG = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#3b82f6" rx="${size * 0.2}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.4}" font-weight="bold" text-anchor="middle" dominant-baseline="middle" fill="white">OW</text>
</svg>
`;

// Créer le dossier electron s'il n'existe pas
const electronDir = path.join(__dirname);
if (!fs.existsSync(electronDir)) {
  fs.mkdirSync(electronDir, { recursive: true });
}

// Générer l'icône PNG pour Linux
const svg = createIconSVG(512);
fs.writeFileSync(path.join(electronDir, 'icon.png'), svg);

// Créer des fichiers temporaires pour les autres formats
// (Dans un vrai projet, vous utiliseriez des outils comme electron-icon-builder)
fs.writeFileSync(path.join(electronDir, 'icon.ico'), '');
fs.writeFileSync(path.join(electronDir, 'icon.icns'), '');

console.log('🎉 Icônes Electron générées !');
console.log('📝 Note: Remplacez ces icônes temporaires par de vraies icônes pour une meilleure qualité.');
