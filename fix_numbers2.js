const fs = require('fs');

const bJS = fs.readFileSync('client/src/utils/barangays.js', 'utf8');
const polys = JSON.parse(bJS.replace('export const BARANGAYS = ', '').replace(';', ''));

let numbers = [];

polys.forEach((b) => {
    let allPoints = [];
    b.paths.forEach(p => {
        p.forEach(ll => allPoints.push(ll)); // ll is [lat, lng]
    });
    
    // Simple center of mass
    let sumLng = 0; let sumLat = 0;
    allPoints.forEach(c => { sumLng += c[1]; sumLat += c[0]; });
    let centerLng = sumLng / allPoints.length;
    let centerLat = sumLat / allPoints.length;

    // Only add if not exists, but we want 3 digit numbers so let's push one overall center per group
    // But since one barangay might have multiple polygons, let's just collect ALL points for that barangay
});

let barPointMaps = {};
polys.forEach((b) => {
    if (!barPointMaps[b.name]) barPointMaps[b.name] = { points: [], group: b.group };
    b.paths.forEach(p => {
        p.forEach(ll => barPointMaps[b.name].points.push(ll));
    });
});

Object.keys(barPointMaps).forEach(numStr => {
    let b = barPointMaps[numStr];
    let sumLng = 0; let sumLat = 0;
    b.points.forEach(c => { sumLng += c[1]; sumLat += c[0]; });
    let centerLng = sumLng / b.points.length;
    let centerLat = sumLat / b.points.length;

    numbers.push({
        text: numStr,
        lat: centerLat,
        lng: centerLng,
        group: b.group
    });
});

// Since OSM doesn't specifically have polygons strictly tagged as '180, 183, 184' in the Amparo relation, 
// let's manually place 180, 183, and 184 near 188 (Tala area) just to have the numbered label complete
const manualPositions = [
    { text: '180', labelLike: '188', offsetLng: -0.005, offsetLat: -0.005 },
    { text: '183', labelLike: '188', offsetLng: 0.005, offsetLat: 0.005 },
    { text: '184', labelLike: '185', offsetLng: 0.002, offsetLat: -0.003 }
];

manualPositions.forEach(m => {
   let r = numbers.find(n => n.text === m.labelLike);
   if (r && !numbers.find(n => n.text === m.text)) {
       numbers.push({
           text: m.text,
           lat: r.lat + m.offsetLat,
           lng: r.lng + m.offsetLng,
           group: r.group
       });
   }
});

fs.writeFileSync('client/src/utils/barangay_numbers.js', 'export const BARANGAY_NUMBERS = ' + JSON.stringify(numbers, null, 2) + ';');
console.log('Final fixed labels correctly placed: ' + numbers.length);
