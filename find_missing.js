const fs = require('fs');
const axios = require('axios');
const osmtogeojson = require('osmtogeojson');

const query = '[out:json][timeout:120];area["name"="Caloocan"]->.caloocan;rel(area.caloocan)["admin_level"="10"];out geom;';
axios.post('https://overpass-api.de/api/interpreter', query).then(res => {
    const geojson = osmtogeojson(res.data);
    let allProps = geojson.features.map((f, i) => {
        if(!f.geometry || !f.geometry.coordinates) return null;
        let coords = f.geometry.coordinates;
        while(Array.isArray(coords[0])) coords = coords[0];
        return {
           idx: i,
           name: f.properties.name,
           lat: coords[1],
           props: JSON.stringify(f.properties)
        }
    }).filter(x => x && x.lat > 14.66);
    
    // search for anything NOT matching 165-178
    let missingFound = allProps.filter(p => !p.props.match(/\b(17[0-8]|16[5-9])\b/));
    
    missingFound.forEach(m => console.log(m.name, m.props));
});