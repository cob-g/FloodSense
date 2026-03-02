const fs = require('fs');
const turf = require('@turf/turf');

function readExport(path, varName) {
    const content = fs.readFileSync(path, 'utf8');
    // Regex to find the array export
    const regex = new RegExp(`export const ${varName} = ([\\[\\{][\\s\\S]*?[\\}\\]]);`);
    const match = content.match(regex);
    if (!match) return null;
    try {
        return eval('(' + match[1] + ')'); 
    } catch (e) {
        console.error('Parse error:', e);
        return null;
    }
}

// 1. Get Outer Polygon (Leaflet [lat, lng])
const outPolyLatLang = readExport('./client/src/utils/constants.js', 'NORTH_CALOOCAN_POLYGON');
if (!outPolyLatLang || !Array.isArray(outPolyLatLang)) {
    console.error('Could not read constants polygon');
    process.exit(1);
}

// Convert to Turf [lng, lat]
// Leaflet uses [lat, lng], Turf uses [lng, lat]
const outPolyCoords = outPolyLatLang.map(p => [p[1], p[0]]);
// Ensure closed ring
if (outPolyCoords[0][0] !== outPolyCoords[outPolyCoords.length-1][0] || 
    outPolyCoords[0][1] !== outPolyCoords[outPolyCoords.length-1][1]) {
    outPolyCoords.push(outPolyCoords[0]);
}
const outer = turf.polygon([outPolyCoords]);

// 2. Get Existing Polygons
let existingBarangays = readExport('./client/src/utils/barangays.js', 'BARANGAYS');
if (!existingBarangays) existingBarangays = { type: 'FeatureCollection', features: [] };

// Filter Western (165-178) - keep them as they are good
const westernPolys = existingBarangays.features.filter(f => {
    const name = f.properties.name || '';
    const id = parseInt(name.replace('Barangay ', ''));
    return id >= 165 && id <= 178;
});

// 3. Compute Eastern Void
let easternVoid = outer;
// Iteratively subtract western polygons
// Use simpler difference to avoid topology errors if possible
westernPolys.forEach(p => {
    try {
        if (!turf.booleanDisjoint(outer, p)) {
             const diff = turf.difference(easternVoid, p);
             if (diff) easternVoid = diff;
        }
    } catch (e) {
        // ignore
    }
});

// 4. Generate Voronoi Seeds for 179-188
// We need approximate centers. If barangay_numbers.js has them, use them.
// If not, we need to hardcode some rough coordinates for the eastern area to distribute Voronoi cells.
let seeds = [];
const allNumbers = readExport('./client/src/utils/barangay_numbers.js', 'BARANGAY_NUMBERS');

if (allNumbers && Array.isArray(allNumbers)) {
    seeds = allNumbers.filter(n => {
        const id = parseInt(n.text || n.name || '0'); 
        return id >= 179 && id <= 188;
    }).map(n => ({
        id: n.text || n.name,
        coords: [n.lng, n.lat] // [lng, lat] for turf
    }));
}

// Fallback seeds if file is missing/empty (Eastern area approx Lat 14.75-14.78, Lng 121.05-121.08)
if (seeds.length < 5) {
    console.log('Using fallback seeds for eastern barangays');
    // Manually approximate positions for 179-188 (Amparo, Pangarap, Tala area)
    // Distributed in grid
    const startLat = 14.75, startLng = 121.05;
    for (let i=0; i<10; i++) {
        seeds.push({
            id: (179+i).toString(),
            coords: [startLng + (Math.random()*0.03), startLat + (Math.random()*0.03)]
        });
    }
}

const points = turf.featureCollection(seeds.map(s => turf.point(s.coords, {name: s.id})));
const voronoi = turf.voronoi(points, {bbox: turf.bbox(outer)});

const newEasternPolys = [];
// Process Voronoi results
// turf.voronoi returns a FeatureCollection of Polygons
voronoi.features.forEach((v, i) => {
    if (v) {
        try {
            const intersection = turf.intersect(v, easternVoid);
            if (intersection) {
                // Assign properties
                // Find matching seed? voronoi indices match input points?
                // Turf documentation says: "The output collection has the same order as the input points"
                // But let's check if v has properties? No, voronoi cells don't inherit properties by default in some versions.
                // But index i should match.
                
                // Also check if intersection is a Polygon or MultiPolygon
                // If MultiPolygon, take the largest piece or keep all?
                
                intersection.properties = {
                    name: 'Barangay ' + seeds[i].id,
                    fill: '#3b82f6',
                    stroke: '#1e40af',
                    fillOpacity: 0.5
                };
                newEasternPolys.push(intersection);
            }
        } catch (e) {
            console.log('Intersection error', e.message);
        }
    }
});

// 5. Save Output
const finalFeatures = [...westernPolys, ...newEasternPolys];
const fc = turf.featureCollection(finalFeatures);
fs.writeFileSync('./client/src/utils/barangays.js', `export const BARANGAYS = ${JSON.stringify(fc, null, 2)};`);

// 6. Recalculate Labels
const newLabels = finalFeatures.map(f => {
    const center = turf.centerOfMass(f);
    const [lng, lat] = center.geometry.coordinates;
    const name = f.properties.name || '';
    const text = name.replace('Barangay ', '');
    return {
        text: text,
        lat: lat,
        lng: lng
    };
});
newLabels.sort((a,b) => parseInt(a.text) - parseInt(b.text)); // numerical sort

fs.writeFileSync('./client/src/utils/barangay_numbers.js', `export const BARANGAY_NUMBERS = ${JSON.stringify(newLabels, null, 2)};`);

console.log(`Generated ${newEasternPolys.length} eastern polygons. Total: ${finalFeatures.length}. Labels updated.`);
