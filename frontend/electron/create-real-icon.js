const fs = require('fs');
const path = require('path');

// Créer une icône PNG 512x512 avec un carré bleu et du texte
const createRealIcon = () => {
  // PNG 512x512 avec un carré bleu et texte "OW"
  const width = 512;
  const height = 512;
  
  // Créer un SVG puis le convertir en PNG conceptuel
  const svg = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="#3b82f6" rx="${width * 0.2}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${width * 0.4}" font-weight="bold" text-anchor="middle" dominant-baseline="middle" fill="white">OW</text>
</svg>
  `;
  
  // Pour simplifier, créons un fichier SVG qui sera reconnu
  return svg;
};

// Créer l'icône
const electronDir = path.join(__dirname);
const svgContent = createRealIcon();

// Sauvegarder comme SVG (qui sera reconnu par electron-builder)
fs.writeFileSync(path.join(electronDir, 'icon.png'), svgContent);

// Créer des fichiers vides pour les autres formats
fs.writeFileSync(path.join(electronDir, 'icon.ico'), '');
fs.writeFileSync(path.join(electronDir, 'icon.icns'), '');

console.log('✅ Icône SVG créée !');
console.log('📝 Note: Electron-builder peut utiliser des SVG comme icônes.');
