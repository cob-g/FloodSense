const fs = require('fs');
const turf = require('@turf/turf');

// Helper to read simple JS export const
function readExport(path, varName) {
    const content = fs.readFileSync(path, 'utf8');
    const start = content.indexOf(`export const ${varName} = `) + `export const ${varName} = `.length;
    const end = content.lastIndexOf(';');
    const jsonStr = content.substring(start, end);
    // Handle unquoted property names if any, but assume JSON-like structure
    // Actually, just eval in a sandbox or rely on JSON.parse if it's strict JSON
    // The previous script wrote JSON.stringify, so it should be valid JSON.
    try {
        return JSON.parse(jsonStr);
    } catch (e) {
        // Fallback: simple eval
        return eval('(' + jsonStr + ')');
    }
}

const OUT_POLY = readExport('./client/src/utils/constants.js', 'NORTH_CALOOCAN_POLYGON');
const ALL_NUMBERS = readExport('./client/src/utils/barangay_numbers.js', 'BARANGAY_NUMBERS');
const EXISTING_ polys = readExport('./client/src/utils/barangays.js', 'BARANGAYS'); 
// Wait, BARANGAYS was just overwritten by me. It contains valid western and eastern.
// But to ensure recalculation is correct, I should extract only 165-178 from it.

const westernPolys = EXISTING_ polys.features.filter(f => {
    const id = parseInt(f.properties.name.replace('Barangay ', ''));
    return id >= 165 && id <= 178;
});

// Calculate the full "Eastern Void"
const outer = turf.polygon([OUT_POLY]);
let easternVoid = outer;
westernPolys.forEach(p => {
    if (turf.booleanOverlap(outer, p) || turf.booleanWithin(p, outer)) {
        try {
            easternVoid = turf.difference(easternVoid, p);
        } catch (e) { 
            console.log('Error cutting ' + p.properties.name);
        }
    }
});

if (!easternVoid) {
    console.error('No eastern void left!');
    process.exit(1);
}

// Generate Voronoi for 179-188 using existing centers
const easternSeeds = ALL_NUMBERS.filter(n => {
    const id = parseInt(n.name.replace('Barangay ', ''));
    return id >= 179 && id <= 188;
});

const points = turf.featureCollection(easternSeeds.map(s => turf.point(s.center)));
const voronoi = turf.voronoi(points, {bbox: turf.bbox(outer)});

const newEasternPolys = [];
voronoi.features.forEach((v, i) => {
    if (v) {
        const intersection = turf.intersect(v, easternVoid);
        if (intersection) {
            intersection.properties = {
                name: easternSeeds[i].name,
                fill: '#3b82f6', // blue
                stroke: '#1e40af' // dark blue
            };
            newEasternPolys.push(intersection);
        }
    }
});

// Combine all polygons
const allPolys = [...westernPolys, ...newEasternPolys];
const fc = turf.featureCollection(allPolys);

// Save Polygons
fs.writeFileSync('./client/src/utils/barangays.js', `export const BARANGAYS = ${JSON.stringify(fc, null, 2)};`);

// Recalculate Labels for ALL (165-188) based on centroid
const newLabels = allPolys.map(f => {
    const center = turf.centerOfMass(f);
    return {
        name: f.properties.name,
        center: center.geometry.coordinates
    };
});

// Save Labels
fs.writeFileSync('./client/src/utils/barangay_numbers.js', `export const BARANGAY_NUMBERS = ${JSON.stringify(newLabels, null, 2)};`);

console.log('Regenerated ' + newEasternPolys.length + ' eastern polygons and updated all labels.');
