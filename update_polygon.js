const axios = require('axios');
const fs = require('fs');
const osmtogeojson = require('osmtogeojson');
const turf = require('@turf/turf');

async function run() {
  // Fetch the full geometry for Caloocan relation 273242
  const q = `[out:json][timeout:60];relation(273242);out geom;`;
  console.log('Fetching Caloocan geometry (relation 273242)...');
  const r = await axios.post('https://z.overpass-api.de/api/interpreter', q, {headers:{'Content-Type':'text/plain'}});
  
  const geojson = osmtogeojson(r.data);
  console.log('Features:', geojson.features.length);
  geojson.features.forEach((f, i) => {
    console.log(i, f.geometry?.type, f.properties?.name);
  });

  // Pick first polygon/multipolygon
  const caloocan = geojson.features.find(f =>
    f.geometry && (f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon')
  );

  if (!caloocan) { console.log('No polygon found'); return; }
  console.log('Type:', caloocan.geometry.type);

  let rings = [];
  if (caloocan.geometry.type === 'Polygon') {
    rings.push(caloocan.geometry.coordinates[0]);
  } else {
    caloocan.geometry.coordinates.forEach(poly => rings.push(poly[0]));
  }
  
  console.log('Rings:', rings.length);
  rings.forEach((r, i) => {
    const lats = r.map(c => c[1]);
    const lngs = r.map(c => c[0]);
    console.log(`Ring ${i}: ${r.length} pts, lat ${Math.min(...lats).toFixed(4)}-${Math.max(...lats).toFixed(4)}, lng ${Math.min(...lngs).toFixed(4)}-${Math.max(...lngs).toFixed(4)}`);
  });

  // North Caloocan is the northern section. Find it by lat center > 14.73
  const northRing = rings.find(ring => {
    const avgLat = ring.reduce((s, c) => s + c[1], 0) / ring.length;
    return avgLat > 14.73;
  }) || rings.reduce((best, r) => {
    const avgLat = r.reduce((s, c) => s + c[1], 0) / r.length;
    const bestAvg = best.reduce((s, c) => s + c[1], 0) / best.length;
    return avgLat > bestAvg ? r : best;
  }, rings[0]);

  console.log('\nNorth ring size:', northRing.length);
  const lngs = northRing.map(c => c[0]);
  const lats = northRing.map(c => c[1]);
  console.log('North bbox: lat', Math.min(...lats).toFixed(5), '-', Math.max(...lats).toFixed(5), '| lng', Math.min(...lngs).toFixed(5), '-', Math.max(...lngs).toFixed(5));

  // Convert to [lat, lng] Leaflet format
  const leafletCoords = northRing.map(c => [parseFloat(c[1].toFixed(5)), parseFloat(c[0].toFixed(5))]);
  
  // Update constants.js
  const coordStr = leafletCoords.map(c => `  [${c[0]}, ${c[1]}]`).join(',\n');
  let consts = fs.readFileSync('client/src/utils/constants.js', 'utf8');
  const startIdx = consts.indexOf('export const NORTH_CALOOCAN_POLYGON = [');
  const endIdx = consts.indexOf('];', startIdx) + 2;
  const newPoly = `export const NORTH_CALOOCAN_POLYGON = [\n${coordStr}\n];`;
  consts = consts.substring(0, startIdx) + newPoly + consts.substring(endIdx);
  fs.writeFileSync('client/src/utils/constants.js', consts);
  console.log('\n✅ NORTH_CALOOCAN_POLYGON updated with', leafletCoords.length, 'vertices');
}

run().catch(e => {
  console.error('Error:', e.message);
  if (e.response) console.error('Status:', e.response.status);
});
