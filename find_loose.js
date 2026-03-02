const fs = require('fs');
const axios = require('axios');
const osmtogeojson = require('osmtogeojson');

console.log('Fetching Loose Bounds...');
const query = '[out:json][timeout:120];(way[boundary="administrative"](14.73, 121.04, 14.79, 121.14);relation[boundary="administrative"](14.73, 121.04, 14.79, 121.14););out geom;';
axios.post('https://overpass-api.de/api/interpreter', query).then(res => {
    const geojson = osmtogeojson(res.data);
    let out = [];
    geojson.features.forEach(f => {
        let propsStr = JSON.stringify(f.properties).toLowerCase();
        if (propsStr.includes("179") || propsStr.includes("180") || propsStr.includes("181") || propsStr.includes("182") || propsStr.includes("tala") || propsStr.includes("amparo") || propsStr.includes("pangarap")) {
            out.push(f.properties.name || "UNNAMED");
        }
    });
    console.log('Found loose specific names:', [...new Set(out)]);
});