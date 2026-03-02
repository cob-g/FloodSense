// Fetch the official Caloocan administrative boundary and extract the North Caloocan outer polygon
const fs = require('fs');
const axios = require('axios');
const osmtogeojson = require('osmtogeojson');
const turf = require('@turf/turf');

async function run() {
  // Caloocan City relation on OSM is 2558088. Fetch it with full geometry.
  const query = `[out:json][timeout:60];
relation(2558088);
out geom;`;

  console.log('Fetching Caloocan City boundary from OSM...');
  const res = await axios.post('https://z.overpass-api.de/api/interpreter', query, {
    headers: { 'Content-Type': 'text/plain' }
  });

  const geojson = osmtogeojson(res.data);
  console.log('Features returned:', geojson.features.length);

  // The relation should give us the full Caloocan boundary
  // We need to filter to only North Caloocan portion (lat > ~14.73)
  const caloocan = geojson.features.find(f =>
    f.geometry && (f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon')
  );

  if (!caloocan) {
    console.log('No polygon found. Feature types:', geojson.features.map(f => f.geometry?.type));
    return;
  }

  console.log('Caloocan geometry type:', caloocan.geometry.type);

  // Get all outer ring coordinates
  let outerCoords = [];
  if (caloocan.geometry.type === 'Polygon') {
    outerCoords = caloocan.geometry.coordinates[0];
  } else {
    // MultiPolygon - take the largest ring
    let maxLen = 0;
    caloocan.geometry.coordinates.forEach(poly => {
      if (poly[0].length > maxLen) {
        maxLen = poly[0].length;
        outerCoords = poly[0];
      }
    });
  }

  console.log('Total vertices:', outerCoords.length);
  console.log('Bbox lng range:', Math.min(...outerCoords.map(c=>c[0])).toFixed(5), '-', Math.max(...outerCoords.map(c=>c[0])).toFixed(5));
  console.log('Bbox lat range:', Math.min(...outerCoords.map(c=>c[1])).toFixed(5), '-', Math.max(...outerCoords.map(c=>c[1])).toFixed(5));

  // Caloocan has North + South sections. North Caloocan is separated from South by a gap.
  // Filter to only North (lat > 14.72) and lng > 120.99 to exclude islands
  const northCoords = outerCoords.filter(c => c[1] > 14.72 && c[0] > 120.99);
  console.log('North portion vertices:', northCoords.length);

  // Convert to [lat, lng] format for Leaflet
  const leafletCoords = outerCoords.map(c => [
    parseFloat(c[1].toFixed(5)),
    parseFloat(c[0].toFixed(5))
  ]);

  // Save raw for inspection
  fs.writeFileSync('caloocan_raw.json', JSON.stringify({ outerCoords, leafletCoords }, null, 2));
  console.log('Saved caloocan_raw.json for inspection');
}

run().catch(err => {
  console.error('Error:', err.message);
  if (err.response) console.error('Status:', err.response.status);
});
