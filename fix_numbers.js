// Fix missing names in Barangay Numbers
const fs = require('fs');
const turf = require('@turf/turf');

const existingPolyJS = fs.readFileSync('client/src/utils/barangays.js', 'utf8');
const polys = JSON.parse(existingPolyJS.replace('export const BARANGAYS = ', '').replace(';', ''));

let numbers = [];

polys.forEach(b => {
    let allPoints = [];
    b.paths.forEach(p => {
        p.forEach(ll => allPoints.push(ll)); // ll is [lat, lng]
    });
    
    // To find the center we use turf
    let turfCoords = allPoints.map(p => [p[1], p[0]]); // to [lng, lat]
    // simple center of mass
    let sumLng = 0; let sumLat = 0;
    turfCoords.forEach(c => { sumLng += c[0]; sumLat += c[1]; });
    let centerLng = sumLng / turfCoords.length;
    let centerLat = sumLat / turfCoords.length;

    // Check if b.name is not already in numbers
    let exists = numbers.find(n => n.text === b.name);
    if (!exists) {
        numbers.push({
            text: b.name,
            lat: centerLat,
            lng: centerLng,
            group: b.group
        });
    }
});

fs.writeFileSync('client/src/utils/barangay_numbers.js', 'export const BARANGAY_NUMBERS = ' + JSON.stringify(numbers, null, 2) + ';');
console.log('Generated numbers successfully: ', numbers.length);
