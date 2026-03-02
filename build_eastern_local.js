// Build approximate eastern barangay polygons by computing:
// Eastern zone = Full North Caloocan polygon MINUS the already-mapped 165-178 area
// Then subdivide the eastern zone into rough regions for each barangay number.
// No Overpass API needed — all done locally.

const fs = require('fs');
const turf = require('@turf/turf');

const colorMap = {
  '179': '#FCB688', '180': '#74A1C8', '181': '#81BDA2', '182': '#81BDA2',
  '183': '#74A1C8', '184': '#74A1C8', '185': '#74A1C8',
  '186': '#74A1C8', '187': '#74A1C8', '188': '#74A1C8',
};
const groupMap = {
  '179': 'AMPARO', '180': 'TALA', '181': 'PANGARAP VILLAGE',
  '182': 'PANGARAP VILLAGE', '183': 'TALA', '184': 'TALA',
  '185': 'TALA', '186': 'TALA', '187': 'TALA', '188': 'TALA',
};

function leafletToTurf(path) {
  // path is [[lat, lng], ...] → turf wants [[lng, lat], ...]
  const coords = path.map(p => [p[1], p[0]]);
  if (coords[0][0] !== coords[coords.length - 1][0] || coords[0][1] !== coords[coords.length - 1][1]) {
    coords.push(coords[0]);
  }
  return coords;
}

function turfToLeaflet(coords) {
  return coords.map(c => [parseFloat(c[1].toFixed(5)), parseFloat(c[0].toFixed(5))]);
}

function safePoly(coords) {
  try { return turf.polygon([coords]); } catch(e) { return null; }
}

function safeUnion(a, b) {
  try { return turf.union(turf.featureCollection([a, b])); } catch(e) { return a; }
}

function safeDiff(a, b) {
  try { return turf.difference(turf.featureCollection([a, b])); } catch(e) { return a; }
}

// Load existing barangays (165-178 have valid polygons)
const existing = JSON.parse(
  fs.readFileSync('client/src/utils/barangays.js', 'utf8')
    .replace('export const BARANGAYS = ', '').replace(/;\s*$/, '')
);
const eastern = new Set(['179','180','181','182','183','184','185','186','187','188']);
const western = existing.filter(b => !eastern.has(b.name));
console.log('Western barangays (165-178):', western.length, 'entries');

// Load North Caloocan outer polygon
const constsRaw = fs.readFileSync('client/src/utils/constants.js', 'utf8');
const polyStr = constsRaw.split('export const NORTH_CALOOCAN_POLYGON = ')[1].split(';')[0];
const ncPoly = JSON.parse(polyStr);
console.log('NC polygon vertices:', ncPoly.length);

// Build turf union of all western barangay fills
console.log('Building union of western barangays...');
let westernUnion = null;
western.forEach(b => {
  b.paths.forEach(p => {
    if (p.length < 4) return;
    const coords = leafletToTurf(p);
    const poly = safePoly(coords);
    if (!poly) return;
    westernUnion = westernUnion ? safeUnion(westernUnion, poly) : poly;
  });
});
console.log('Western union built:', !!westernUnion);

// Build the full NC polygon as turf
const ncCoords = leafletToTurf(ncPoly);
const ncTurf = safePoly(ncCoords);
console.log('NC polygon valid:', !!ncTurf);

// Eastern zone = NC minus western fills
let easternZone = ncTurf;
if (westernUnion) {
  easternZone = safeDiff(ncTurf, westernUnion);
}
console.log('Eastern zone computed:', !!easternZone, '| type:', easternZone?.geometry?.type);

if (!easternZone) {
  console.error('Failed to compute eastern zone');
  process.exit(1);
}

// Helper: mask the eastern zone to a specific bounding box
function clipToBox(geom, minLat, maxLat, minLng, maxLng) {
  const box = turf.bboxPolygon([minLng, minLat, maxLng, maxLat]);
  try {
    return turf.intersect(turf.featureCollection([geom, box]));
  } catch(e) { return null; }
}

// Get bounding box of the eastern zone itself
const [eBBoxMinLng, eBBoxMinLat, eBBoxMaxLng, eBBoxMaxLat] = turf.bbox(easternZone);
console.log('Eastern zone bbox:', { minLat: eBBoxMinLat.toFixed(4), maxLat: eBBoxMaxLat.toFixed(4), minLng: eBBoxMinLng.toFixed(4), maxLng: eBBoxMaxLng.toFixed(4) });

// Subdivide the eastern zone into approximate barangay regions
// Based on geographic positions in the reference image:
// Northern tier: 183, 185, 184 (roughly lat 14.755-14.786, lng 121.055-121.099)
// Middle tier:   186, 188, 187, 181, 182 (lat 14.745-14.775, lng 121.055-121.099)
// Southern tier: 179, 180 (roughly lat 14.730-14.758, lng 121.055-121.099)
const regions = [
  // [number, minLat, maxLat, minLng, maxLng]
  // Southern
  ['179', 14.735, 14.760, 121.062, 121.090],
  ['180', 14.730, 14.762, 121.055, 121.085],
  // Middle-west
  ['187', 14.754, 14.775, 121.055, 121.070],
  ['186', 14.754, 14.775, 121.068, 121.080],
  ['188', 14.754, 14.775, 121.068, 121.085],
  // Middle-east
  ['182', 14.754, 14.772, 121.080, 121.092],
  ['181', 14.754, 14.775, 121.088, 121.100],
  // Northern
  ['183', 14.764, 14.787, 121.078, 121.093],
  ['185', 14.762, 14.787, 121.087, 121.100],
  ['184', 14.760, 14.787, 121.087, 121.100],
];

// Convert extracted paths to Leaflet format
function geoToLeaflet(geom) {
  let paths = [];
  if (geom.geometry.type === 'Polygon') {
    paths.push(turfToLeaflet(geom.geometry.coordinates[0]));
  } else if (geom.geometry.type === 'MultiPolygon') {
    geom.geometry.coordinates.forEach(poly => {
      if (poly[0].length >= 4) paths.push(turfToLeaflet(poly[0]));
    });
  }
  return paths;
}

// Build the new eastern entries
const newEastern = [];
const consumed = [];

// Strategy: instead of subdivision, just clip the whole eastern zone per number
// This gives accurate boundaries without per-pixel precision required
regions.forEach(([num, minLat, maxLat, minLng, maxLng]) => {
  const clipped = clipToBox(easternZone, minLat, maxLat, minLng, maxLng);
  if (!clipped) {
    console.log(`  ${num}: No geometry in box`);
    return;
  }
  const paths = geoToLeaflet(clipped);
  if (paths.length > 0) {
    newEastern.push({ name: num, group: groupMap[num], color: colorMap[num], paths });
    console.log(`  ${num}: ${paths.length} paths, first has ${paths[0].length} pts`);
  }
});

// Combine with western
const allBarangays = [...western, ...newEastern];
fs.writeFileSync('client/src/utils/barangays.js',
  'export const BARANGAYS = ' + JSON.stringify(allBarangays, null, 2) + ';');
console.log('\n✅ Saved', allBarangays.length, 'total barangay entries');

// Rebuild barangay_numbers.js
const byName = {};
allBarangays.forEach(b => {
  if (!byName[b.name]) byName[b.name] = { pts: [], group: b.group };
  b.paths.forEach(p => p.forEach(ll => byName[b.name].pts.push(ll)));
});

const groupMap2 = { ...groupMap,
  '165': 'BAGBAGUIN', '166': 'KAYBIGA', '167': 'LLANO', '168': 'DEPARO',
  '169': 'BF HOMES', '170': 'DEPARO', '171': 'BAGUMBONG', '172': 'URDUJA',
  '173': 'CONGRESS', '174': 'CAMARIN', '175': 'CAMARIN', '176': 'BAGONG SILANG',
  '177': 'CAMARIN', '178': 'CAMARIN',
};

const numbers = Object.keys(byName).sort().map(name => {
  const pts = byName[name].pts;
  const lat = pts.reduce((s, p) => s + p[0], 0) / pts.length;
  const lng = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  return { text: name, lat: parseFloat(lat.toFixed(5)), lng: parseFloat(lng.toFixed(5)), group: groupMap2[name] || byName[name].group };
});

fs.writeFileSync('client/src/utils/barangay_numbers.js',
  'export const BARANGAY_NUMBERS = ' + JSON.stringify(numbers, null, 2) + ';');
console.log('✅ Labels:', numbers.map(n => n.text).join(', '));
