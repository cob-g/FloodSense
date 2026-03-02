const axios = require('axios');
const fs = require('fs');
const osmtogeojson = require('osmtogeojson');
const turf = require('@turf/turf');

const colorMap = {
  '165': '#7EBDA3', '166': '#FA7C83', '167': '#75A0C9', '168': '#FEEE76',
  '169': '#FBB285', '170': '#FEEE76', '171': '#77B69C', '172': '#FDB786',
  '173': '#82A7CD', '174': '#FA7A80', '175': '#FA7A80', '176': '#FFF074',
  '177': '#FA7A80', '178': '#FA7A80', '179': '#FCB688', '180': '#74A1C8',
  '181': '#81BDA2', '182': '#81BDA2', '183': '#74A1C8', '184': '#74A1C8',
  '185': '#74A1C8', '186': '#74A1C8', '187': '#74A1C8', '188': '#74A1C8',
};
const groupMap = {
  '165': 'BAGBAGUIN', '166': 'KAYBIGA', '167': 'LLANO', '168': 'DEPARO',
  '169': 'BF HOMES', '170': 'DEPARO', '171': 'BAGUMBONG', '172': 'URDUJA',
  '173': 'CONGRESS', '174': 'CAMARIN', '175': 'CAMARIN', '176': 'BAGONG SILANG',
  '177': 'CAMARIN', '178': 'CAMARIN', '179': 'AMPARO', '180': 'TALA',
  '181': 'PANGARAP VILLAGE', '182': 'PANGARAP VILLAGE', '183': 'TALA',
  '184': 'TALA', '185': 'TALA', '186': 'TALA', '187': 'TALA', '188': 'TALA',
};

function formatPath(ring) {
  return ring.map(c => [parseFloat(c[1].toFixed(5)), parseFloat(c[0].toFixed(5))]);
}

async function run() {
  // Fetch ALL admin_level=10 relations within the full North Caloocan bbox
  const q = `[out:json][timeout:90];
(
  relation["admin_level"="10"](14.70, 120.99, 14.79, 121.10);
);
out geom;`;

  console.log('Fetching all barangay relations in North Caloocan bbox...');
  const r = await axios.post('https://z.overpass-api.de/api/interpreter', q, {headers:{'Content-Type':'text/plain'}});
  const geojson = osmtogeojson(r.data);
  console.log('Features returned:', geojson.features.length);

  // Group by matched barangay number
  const matched = {};

  geojson.features.forEach(f => {
    if (!f.geometry) return;
    const props = JSON.stringify(f.properties || '').toLowerCase();

    // Try to match by numeric barangay number in name/ref tags
    let num = null;
    const numMatch = props.match(/\b(16[5-9]|17[0-9]|18[0-8])\b/);
    if (numMatch) num = numMatch[1];

    // Loose name fallbacks
    if (!num) {
      if (props.includes('amparo')) num = '179';
      else if (props.includes('pangarap')) num = '181';
      else if (props.includes('tala')) num = '188';
    }

    if (!num || !colorMap[num]) return;

    let paths = [];
    if (f.geometry.type === 'Polygon') {
      paths.push(formatPath(f.geometry.coordinates[0]));
    } else if (f.geometry.type === 'MultiPolygon') {
      f.geometry.coordinates.forEach(poly => paths.push(formatPath(poly[0])));
    }

    if (paths.length > 0 && paths[0].length >= 4) {
      if (!matched[num]) matched[num] = { paths: [] };
      matched[num].paths.push(...paths);
    }
  });

  console.log('Matched barangay numbers:', Object.keys(matched).sort());

  // Build array — start from existing valid entries for 165-178, replace eastern ones
  const existing = JSON.parse(
    fs.readFileSync('client/src/utils/barangays.js', 'utf8')
      .replace('export const BARANGAYS = ', '').replace(/;\s*$/, '')
  );

  // Remove old fragmented entries for eastern barangays (179-188)
  const eastern = new Set(['179','180','181','182','183','184','185','186','187','188']);
  const kept = existing.filter(b => !eastern.has(b.name));
  console.log('Keeping', kept.length, 'existing entries for 165-178');

  // Add new proper entries from OSM
  let added = 0;
  Object.keys(matched).forEach(num => {
    kept.push({
      name: num,
      group: groupMap[num],
      color: colorMap[num],
      paths: matched[num].paths
    });
    added++;
  });
  console.log('Added', added, 'eastern entries from OSM');

  fs.writeFileSync('client/src/utils/barangays.js', 'export const BARANGAYS = ' + JSON.stringify(kept, null, 2) + ';');

  // Regenerate barangay_numbers.js
  const byName = {};
  kept.forEach(b => {
    if (!byName[b.name]) byName[b.name] = [];
    b.paths.forEach(p => p.forEach(ll => byName[b.name].push(ll)));
  });

  const numbers = Object.keys(byName).map(name => {
    const pts = byName[name];
    const lat = pts.reduce((s, p) => s + p[0], 0) / pts.length;
    const lng = pts.reduce((s, p) => s + p[1], 0) / pts.length;
    return { text: name, lat: parseFloat(lat.toFixed(5)), lng: parseFloat(lng.toFixed(5)), group: groupMap[name] };
  });

  fs.writeFileSync('client/src/utils/barangay_numbers.js', 'export const BARANGAY_NUMBERS = ' + JSON.stringify(numbers, null, 2) + ';');
  console.log('\n✅ Done! Total barangay entries:', kept.length, '| Labels:', numbers.length);
  console.log('Numbers covered:', numbers.map(n => n.text).sort().join(', '));
}

run().catch(e => {
  console.error('Error:', e.message);
  if (e.response) console.error('Status:', e.response.status, e.response.data?.substring?.(0, 200));
});
