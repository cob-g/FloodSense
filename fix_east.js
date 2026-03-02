const fs = require('fs');
const axios = require('axios');
const turf = require('@turf/turf');
const osmtogeojson = require('osmtogeojson');

console.log('Fetching Loose Bounds for Eastern North Caloocan...');

const exactMapping = {
    '165': { group: 'BAGBAGUIN', color: '#7EBDA3' },
    '166': { group: 'KAYBIGA', color: '#FA7C83' },
    '167': { group: 'LLANO', color: '#75A0C9' },
    '168': { group: 'DEPARO', color: '#FEEE76' },
    '169': { group: 'BF HOMES', color: '#FBB285' },
    '170': { group: 'DEPARO', color: '#FEEE76' },
    '171': { group: 'BAGUMBONG', color: '#77B69C' },
    '172': { group: 'URDUJA', color: '#FDB786' },
    '173': { group: 'CONGRESS', color: '#82A7CD' },
    '174': { group: 'CAMARIN', color: '#FA7A80' },
    '175': { group: 'CAMARIN', color: '#FA7A80' },
    '176': { group: 'BAGONG SILANG', color: '#FFF074' },
    '177': { group: 'CAMARIN', color: '#FA7A80' },
    '178': { group: 'CAMARIN', color: '#FA7A80' },
    // Missing Eastern ones
    '179': { group: 'AMPARO', color: '#FCB688' },
    '180': { group: 'TALA', color: '#74A1C8' },
    '181': { group: 'PANGARAP VILLAGE', color: '#81BDA2' },
    '182': { group: 'PANGARAP VILLAGE', color: '#81BDA2' },
    '183': { group: 'TALA', color: '#74A1C8' },
    '184': { group: 'TALA', color: '#74A1C8' },
    '185': { group: 'TALA', color: '#74A1C8' },
    '186': { group: 'TALA', color: '#74A1C8' },
    '187': { group: 'TALA', color: '#74A1C8' },
    '188': { group: 'TALA', color: '#74A1C8' },
};

async function run() {
  const query = '[out:json][timeout:120];area["name"="Caloocan"]->.caloocan;rel(area.caloocan)["admin_level"="10"];out geom;';
  const res = await axios.post('https://overpass-api.de/api/interpreter', query);
  const geojson = osmtogeojson(res.data);
  let out = [];

  // Read existing working barangays data
  const existingJS = fs.readFileSync('client/src/utils/barangays.js', 'utf8');
  let currentArr = JSON.parse(existingJS.replace('export const BARANGAYS = ', '').replace(';', ''));
  out = [...currentArr];

  let missingNums = ['179', '180', '181', '182', '183', '184', '185', '186', '187', '188'];
  
  geojson.features.forEach(f => {
      let propsStr = JSON.stringify(f.properties).toLowerCase();
      let matchedNum = null;
      
      // Try to find if this polygon is one of the missing ones, even if not explicitly numbered
      // Sometimes they use keywords like "amparo", "pangarap", "tala". Look at properties
      for(let m of missingNums) {
         if (propsStr.includes(m)) {
             matchedNum = m; break;
         }
      }
      
      if (!matchedNum) {
          if(propsStr.includes('amparo')) matchedNum = '179';
          else if(propsStr.includes('pangarap')) matchedNum = '181';
          else if(propsStr.includes('tala')) matchedNum = '188';
      }

      if (matchedNum && exactMapping[matchedNum]) {
          // make sure we don't duplicate
          // but we might need multiple polygons for one barangay
          
          // Verify it's actually in Eastern Caloocan (Long > 121.04)
          if(f.geometry && f.geometry.coordinates) {
              let flat = f.geometry.coordinates;
              while(Array.isArray(flat[0])) flat = flat[0];
              if (flat[0] > 121.03 && flat[1] > 14.73) {
                  let paths = [];
                  if (f.geometry.type === 'Polygon') {
                      paths.push(formatCoords(f.geometry.coordinates[0]));
                  } else if (f.geometry.type === 'MultiPolygon') {
                      f.geometry.coordinates.forEach(poly => {
                          paths.push(formatCoords(poly[0]));
                      });
                  }
                  
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

  // What if OSM literal does not have ANY polygons for 180-188?
  // We can fetch the generic bounding relation for "Tala" or "Amparo" without admin_level=10 restriction!
  const query2 = '[out:json][timeout:120];(relation["name"~"Tala|Amparo|Pangarap", i](14.73, 121.04, 14.79, 121.14);way["name"~"Tala|Amparo|Pangarap", i](14.73, 121.04, 14.79, 121.14););out geom;';
  const res2 = await axios.post('https://overpass-api.de/api/interpreter', query2);
  const geojson2 = osmtogeojson(res2.data);
  
  geojson2.features.forEach(f => {
      let propsStr = JSON.stringify(f.properties).toLowerCase();
      let matchedNum = null;
      if(propsStr.includes('amparo')) matchedNum = '179';
      else if(propsStr.includes('pangarap')) matchedNum = '181';
      else if(propsStr.includes('tala')) matchedNum = '188';
      
      if(matchedNum && f.geometry) {
           let paths = [];
           if (f.geometry.type === 'Polygon') {
                paths.push(formatCoords(f.geometry.coordinates[0]));
            } else if (f.geometry.type === 'MultiPolygon') {
                f.geometry.coordinates.forEach(poly => {
                    paths.push(formatCoords(poly[0]));
                });
            }
            if(paths.length > 0) {
               out.push({
                  name: matchedNum,
                  group: exactMapping[matchedNum].group,
                  color: exactMapping[matchedNum].color,
                  paths: paths
               });
            }
      }
  });

  fs.writeFileSync('client/src/utils/barangays.js', 'export const BARANGAYS = ' + JSON.stringify(out) + ';');
  console.log('Saved extended barangays! Now building master polygon...');
  buildMasterPolygon(out);
}

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

function buildMasterPolygon(out) {
    let master = null;
    out.forEach(b => {
        b.paths.forEach(p => {
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

    const consts = fs.readFileSync('client/src/utils/constants.js', 'utf8');
    const regex = /export const NORTH_CALOOCAN_POLYGON = \[[^]*?\];/;
    const updated = consts.replace(regex, 'export const NORTH_CALOOCAN_POLYGON = ' + polyArrayString + ';');
    fs.writeFileSync('client/src/utils/constants.js', updated);

    console.log('Constants.js bounds fully patched and perfected! Vertices: ' + outerCoords.length);
}

run().catch(console.error);