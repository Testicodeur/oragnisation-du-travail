const fs = require('fs');
const path = require('path');

// Créer un SVG simple pour l'icône
const createIconSVG = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#3b82f6" rx="${size * 0.2}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.4}" font-weight="bold" text-anchor="middle" dominant-baseline="middle" fill="white">OW</text>
</svg>
`;

// Tailles d'icônes nécessaires
const sizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];

// Créer le dossier icons s'il n'existe pas
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Générer les icônes SVG
sizes.forEach(size => {
  const svg = createIconSVG(size);
  const filename = `icon-${size}x${size}.svg`;
  fs.writeFileSync(path.join(iconsDir, filename), svg);
  console.log(`✅ Généré: ${filename}`);
});

// Créer un favicon.ico simple
const faviconSVG = createIconSVG(32);
fs.writeFileSync(path.join(__dirname, '../public/favicon.svg'), faviconSVG);

// Créer browserconfig.xml pour Windows
const browserconfig = `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
    <msapplication>
        <tile>
            <square150x150logo src="/icons/icon-144x144.svg"/>
            <TileColor>#3b82f6</TileColor>
        </tile>
    </msapplication>
</browserconfig>`;

fs.writeFileSync(path.join(iconsDir, 'browserconfig.xml'), browserconfig);

console.log('🎉 Toutes les icônes ont été générées !');
console.log('📝 Note: Remplacez ces icônes temporaires par de vraies icônes PNG pour une meilleure qualité.');
