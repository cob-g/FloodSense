const axios = require('axios');
const fs = require('fs');
const osmtogeojson = require('osmtogeojson');

async function run() {
  const q = `[out:json][timeout:90];
(
  relation["admin_level"="10"](14.70, 120.99, 14.79, 121.10);
);
out geom;`;

  console.log('Fetching...');
  const r = await axios.post('https://overpass.kumi.systems/api/interpreter', q, {headers:{'Content-Type':'text/plain'}});
  const geojson = osmtogeojson(r.data);
  console.log('Total features:', geojson.features.length);

  geojson.features.forEach((f, i) => {
    if (!f.geometry) return;
    const p = f.properties || {};
    const lngs = [];
    const coords = f.geometry.type === 'Polygon' ? f.geometry.coordinates[0]
      : f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates[0][0] : [];
    coords.forEach(c => lngs.push(c[0]));
    const maxLng = lngs.length ? Math.max(...lngs) : 0;
    
    // Show features that are in the eastern area (lng > 121.05)
    if (maxLng > 121.05) {
      console.log(i, '|', f.geometry.type, '| name:', p.name, '| ref:', p.ref, '| all:', JSON.stringify(p).substring(0, 200));
    }
  });
}

run().catch(e => console.error(e.message));
