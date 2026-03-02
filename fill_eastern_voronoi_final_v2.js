const fs = require('fs');
const turf = require('@turf/turf');

// Helper: robust parsing of export const
function readExport(path, varName) {
    if (!fs.existsSync(path)) return null;
    const content = fs.readFileSync(path, 'utf8');
    const regex = new RegExp(`export const ${varName} = ([\\[\\{][\\s\\S]*?[\\}\\]]);`);
    const match = content.match(regex);
    if (!match) return null;
    try {
        let clean = match[1].replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
        return eval('(' + clean + ')');
    } catch (e) {
        console.error('Parse error:', e);
        return null;
    }
}

// 1. Get Outer Polygon (Leaflet [lat, lng])
const outPolyLatLang = readExport('./client/src/utils/constants.js', 'NORTH_CALOOCAN_POLYGON');
if (!outPolyLatLang || !Array.isArray(outPolyLatLang)) {
    console.error('Could not read constants polygon');
    // Fallback? No, critical.
    process.exit(1);
}

// Convert to Turf [lng, lat]
const outPolyCoords = outPolyLatLang.map(p => [p[1], p[0]]);
if (outPolyCoords[0][0] !== outPolyCoords[outPolyCoords.length-1][0] || 
    outPolyCoords[0][1] !== outPolyCoords[outPolyCoords.length-1][1]) {
    outPolyCoords.push(outPolyCoords[0]);
}
const outer = turf.polygon([outPolyCoords]);

// 2. Get Existing Polygons (Array of Objects)
let existingBarangays = readExport('./client/src/utils/barangays.js', 'BARANGAYS');
if (!existingBarangays || !Array.isArray(existingBarangays)) existingBarangays = [];

const westernPolys = existingBarangays.filter(b => {
    const id = parseInt(b.name);
    return id >= 165 && id <= 178;
});

// Convert western to Turf for difference
let easternVoid = outer;
westernPolys.forEach(b => {
    let ring;
    if (b.paths && b.paths.length > 0 && Array.isArray(b.paths[0]) && Array.isArray(b.paths[0][0])) {
         // It's wrapped like [[[lat, lng], ...]] or MultiPolygon
         // Take the first ring for simplicity
         ring = b.paths[0].map(p => [p[1], p[0]]); 
    } else {
         // It's simple [[lat, lng], ...]
         ring = b.paths.map(p => [p[1], p[0]]);
    }
 
    if (ring[0][0] !== ring[ring.length-1][0] || ring[0][1] !== ring[ring.length-1][1]) {
        ring.push(ring[0]);
    }
    
    if (ring.length < 4) {
        console.log('Skipping invalid polygon ' + b.name);
        return;
    }

    const poly = turf.polygon([ring]);
    try {
        if (!turf.booleanDisjoint(outer, poly)) {
            const diff = turf.difference(turf.featureCollection([easternVoid, poly]));
            if (diff) {
                easternVoid = diff;
            } else {
                console.log('Difference resulted in null for ' + b.name);
            }
        }
    } catch(e) {}
});

// 3. Generate Voronoi Seeds (179-188)
const meta = readExport('./client/src/utils/barangay_numbers.js', 'BARANGAY_NUMBERS');
let seeds = [];
if (meta && Array.isArray(meta)) {
    seeds = meta.filter(m => parseInt(m.text) >= 179 && parseInt(m.text) <= 188)
                .map(m => ({ id: m.text, coords: [m.lng, m.lat] }));
}

// Ensure 179-188 exist
for(let i=179; i<=188; i++) {
    if (!seeds.find(s => parseInt(s.id) === i)) {
         // Grid distribution in empty eastern area
         // Approx Lat 14.73-14.78, Lng 121.05-121.08
         // Staggered grid
         const row = Math.floor((i-179)/3);
         const col = (i-179)%3;
         seeds.push({
             id: i.toString(),
             coords: [121.05 + (col*0.015), 14.74 + (row*0.015)]
         });
    }
}

const points = turf.featureCollection(seeds.map(s => turf.point(s.coords)));
const voronoi = turf.voronoi(points, {bbox: turf.bbox(outer)});

const newEasternPolys = [];
voronoi.features.forEach((v, i) => {
    if (v) {
        try {
            if (!easternVoid) {
                console.log('Eastern void is null/undefined!');
                return;
            }
            // Turf v7: intersect(FeatureCollection)
            const intersection = turf.intersect(turf.featureCollection([v, easternVoid]));
            if (intersection) {
                // Check if multipolygon
                let coords = intersection.geometry.coordinates;
                let poly = intersection;
                
                if (intersection.geometry.type === 'MultiPolygon') {
                    // Flatten to largest Polygon
                    let maxArea = 0;
                    let bestRing = null;
                    coords.forEach(polyCoords => {
                        const temp = turf.polygon(polyCoords);
                        const area = turf.area(temp);
                        if (area > maxArea) {
                            maxArea = area;
                            bestRing = polyCoords;
                        }
                    });
                    if (bestRing) {
                         poly = turf.polygon(bestRing);
                         coords = [bestRing]; // wrap for consistency? No, check target format
                    }
                }
                
                // Convert back to Leaflet format
                // Polygon coords are [[lng, lat], ...] (ring 0)
                // Need to handle holes? Simplified: no holes for now.
                // Take outer ring
                const finalRing = poly.geometry.coordinates[0];
                const paths = [finalRing.map(c => [c[1], c[0]])]; // [lat, lng], wrapped in outer array
                
                const id = seeds[i].id;
                newEasternPolys.push({
                    name: id,
                    paths: paths,
                    color: '#3b82f6', // placeholder
                    stroke: '#1e40af'
                });
            }
        } catch (e) {
            console.log('Error intersecting ' + seeds[i].id + ': ' + e.message);
        }
    }
});

// Assign random colors
const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1'];
newEasternPolys.forEach((p, idx) => {
    p.color = colors[idx % colors.length];
});

// 4. Save BARANGAYS
const allPolys = [...westernPolys, ...newEasternPolys].sort((a,b) => parseInt(a.name) - parseInt(b.name));
fs.writeFileSync('./client/src/utils/barangays.js', `export const BARANGAYS = ${JSON.stringify(allPolys, null, 2)};`);


// 5. Update Labels
const newLabels = allPolys.map(p => {
    // Determine ring
    let ring;
    if (p.paths && p.paths.length > 0) {
        if (Array.isArray(p.paths[0]) && Array.isArray(p.paths[0][0])) {
            // Depth 3: MultiPolygon or Polygon with outer ring
            ring = p.paths[0]; 
        } else {
            // Depth 2: Simple Polygon
            ring = p.paths;
        }
    }
    
    // Map to turf [lng, lat]
    const turfCoords = ring.map(c => [c[1], c[0]]);
    // Close ring
    if (turfCoords[0][0] !== turfCoords[turfCoords.length-1][0] || 
        turfCoords[0][1] !== turfCoords[turfCoords.length-1][1]) {
        turfCoords.push(turfCoords[0]);
    }
    
    try {
        const poly = turf.polygon([turfCoords]);
        const center = turf.centerOfMass(poly);
        return {
            text: p.name,
            lat: center.geometry.coordinates[1],
            lng: center.geometry.coordinates[0]
        };
    } catch(e) {
        // Fallback: simple average
        let sumLat=0, sumLng=0;
        ring.forEach(c => { sumLat+=c[0]; sumLng+=c[1]; });
        return {
            text: p.name,
            lat: sumLat/ring.length,
            lng: sumLng/ring.length
        };
    }
});

fs.writeFileSync('./client/src/utils/barangay_numbers.js', `export const BARANGAY_NUMBERS = ${JSON.stringify(newLabels, null, 2)};`);

console.log(`Success! Generated ${newEasternPolys.length} eastern polygons. Total ${allPolys.length}.`);
