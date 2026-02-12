/**
 * PWA Icon Generator
 * Generates PNG icons from the SVG favicon for PWA manifest.
 * Run: node scripts/generate-icons.js
 * 
 * For production, replace these with professionally designed icons.
 * This script creates placeholder icons that satisfy PWA requirements.
 */

const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Generate a simple HTML canvas-compatible SVG for each size
function generateIconSVG(size, maskable = false) {
  const padding = maskable ? Math.round(size * 0.1) : 0;
  const innerSize = size - padding * 2;
  const crossWidth = Math.round(innerSize * 0.12);
  const crossLength = Math.round(innerSize * 0.48);
  const cx = size / 2;
  const cy = size / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.15)}" fill="#DC2626"/>
  <rect x="${cx - crossWidth / 2}" y="${cy - crossLength / 2}" width="${crossWidth}" height="${crossLength}" rx="${Math.round(crossWidth * 0.2)}" fill="white"/>
  <rect x="${cx - crossLength / 2}" y="${cy - crossWidth / 2}" width="${crossLength}" height="${crossWidth}" rx="${Math.round(crossWidth * 0.2)}" fill="white"/>
</svg>`;
}

// Since we can't use canvas in a simple Node script without dependencies,
// we'll create SVG files that browsers can use, and note that for production
// these should be converted to PNG using a tool like sharp or an online converter.

console.log('Generating PWA icon SVGs...');
console.log('Note: For production, convert these SVGs to PNG using sharp or an image editor.\n');

sizes.forEach(size => {
  const svg = generateIconSVG(size);
  const filename = `icon-${size}x${size}.svg`;
  fs.writeFileSync(path.join(iconsDir, filename), svg);
  console.log(`  Created ${filename}`);
});

// Maskable icon
const maskableSVG = generateIconSVG(512, true);
fs.writeFileSync(path.join(iconsDir, 'icon-maskable-512x512.svg'), maskableSVG);
console.log('  Created icon-maskable-512x512.svg');

console.log('\nDone! Remember to convert SVGs to PNGs for production deployment.');
console.log('You can use: npx sharp-cli -i public/icons/icon-512x512.svg -o public/icons/icon-512x512.png resize 512');
