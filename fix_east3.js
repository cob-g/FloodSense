const fs = require('fs');
const axios = require('axios');
const turf = require('@turf/turf');
const osmtogeojson = require('osmtogeojson');

console.log('Fetching Loose Bounds for Eastern North Caloocan manually...');

const exactMapping = {
    '179': { group: 'AMPARO', color: '#FCB688' },
    '180': { group: 'TALA', color: '#74A1C8' },
    '181': { group: 'PANGARAP VILLAGE', color: '#81BDA2' },
    '182': { group: 'PANGARAP VILLAGE', color: '#81BDA2' },
    '183': { group: 'TALA', color: '#74A1C8' },
    '184': { group: 'TALA', color: '#74A1C8' },
    '185': { group: 'TALA', color: '#74A1C8' },
    '186': { group: 'TALA', color: '#74A1C8' },
    '187': { group: 'TALA', color: '#74A1C8' },
    '188': { group: 'TALA', color: '#74A1C8' }
};

function formatCoords(coords) {
    let res = [];
    for(let i=0; i<coords.length; i++) {
        res.push([ parseFloat(coords[i][1].toFixed(5)), parseFloat(coords[i][0].toFixed(5)) ]);
    }
    if(res.length > 0 && (res[0][0] !== res[res.length-1][0] || res[0][1] !== res[res.length-1][1])) {
        res.push(res[0]);
    }
    return res;
}

async function run() {
  const query = `[out:json][timeout:30];
(
  relation["name"~"179|18[0-8]|Tala|Amparo|Pangarap",i](14.73, 121.04, 14.79, 121.14);
  way["name"~"179|18[0-8]|Tala|Amparo|Pangarap",i](14.73, 121.04, 14.79, 121.14);
);
out geom;`;

  console.log('Fetching Overpass API from z.overpass-api.de...');
  const res = await axios.post('https://z.overpass-api.de/api/interpreter', query, { headers: { 'Content-Type': 'text/plain' } });
  const geojson = osmtogeojson(res.data);
  let out = [];

  let currentArr = [];
  try {
     const existingJS = fs.readFileSync('client/src/utils/barangays.js', 'utf8');
     currentArr = JSON.parse(existingJS.replace('export const BARANGAYS = ', '').replace(';', ''));
  } catch(e) { }

  out = [...currentArr];
  let initialLen = out.length;

  geojson.features.forEach(f => {
      let propsStr = JSON.stringify(f.properties).toLowerCase();
      let matchedNum = null;
      let numMatch = propsStr.match(/\b(179|18[0-8])\b/);
      if (numMatch) matchedNum = numMatch[1];
      else if(propsStr.includes('amparo')) matchedNum = '179';
      else if(propsStr.includes('pangarap')) matchedNum = '181';
      else if(propsStr.includes('tala')) matchedNum = '188';

      if (matchedNum && exactMapping[matchedNum]) {
          if(f.geometry && f.geometry.coordinates) {
              let paths = [];
              if (f.geometry.type === 'Polygon') {
                  paths.push(formatCoords(f.geometry.coordinates[0]));
              } else if (f.geometry.type === 'MultiPolygon') {
                  f.geometry.coordinates.forEach(poly => { paths.push(formatCoords(poly[0])); });
              } else if (f.geometry.type === 'LineString') { // Sometimes ways return LineString
                  let polyPath = formatCoords(f.geometry.coordinates);
                  if (polyPath.length >= 3) {
                     paths.push(polyPath);
                  }
              }

              if (paths.length > 0) {
                  out.push({
                      name: matchedNum,
                      group: exactMapping[matchedNum].group,
                      color: exactMapping[matchedNum].color,
                      paths: paths
                  });
              }
          }
      }
  });

  console.log(`Found ${out.length - initialLen} matching geometries! Saving...`);
  fs.writeFileSync('client/src/utils/barangays.js', 'export const BARANGAYS = ' + JSON.stringify(out, null, 2) + ';');
  
  let master = null;
  out.forEach(b => {
      b.paths.forEach(p => {
          if(p.length < 4) return;
          let coords = p.map(ll => [ll[1], ll[0]]);
          if(coords[0][0] !== coords[coords.length-1][0] || coords[0][1] !== coords[coords.length-1][1]) coords.push(coords[0]);
          
          let poly;
          try { poly = turf.polygon([coords]); } catch(e) { return; }
          if(!master) master = poly;
          else {
              try { master = turf.union(turf.featureCollection([master, poly])); } catch(e) {}
          }
      });
  });

  if (master) {
      let outerCoords = [];
      if(master.geometry.type === 'Polygon') outerCoords = master.geometry.coordinates[0];
      else if(master.geometry.type === 'MultiPolygon') {
          let maxArea = 0;
          master.geometry.coordinates.forEach(poly => {
              if(poly[0].length > maxArea) {
                  maxArea = poly[0].length;
                  outerCoords = poly[0];
              }
          });
      }

      let coordsJoined = outerCoords.map(c => '[' + c[1].toFixed(5) + ', ' + c[0].toFixed(5) + ']').join(',\n  ');
      let polyArrayString = '[\n  ' + coordsJoined + '\n]';

      let consts = fs.readFileSync('client/src/utils/constants.js', 'utf8');
      
      consts = consts.split('export const NORTH_CALOOCAN_POLYGON')[0] + 'export const NORTH_CALOOCAN_POLYGON = ' + polyArrayString + ';\n';
      fs.writeFileSync('client/src/utils/constants.js', consts);

      console.log('Constants.js bounds fully patched and perfected! Vertices: ' + outerCoords.length);
  }
}

run().catch(console.error);