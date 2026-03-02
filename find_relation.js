const axios = require('axios');
const fs = require('fs');
const osmtogeojson = require('osmtogeojson');

async function run() {
  // Find Caloocan relation ID
  const q1 = `[out:json][timeout:30];relation["name"="Caloocan"]["admin_level"="6"];out tags;`;
  const r1 = await axios.post('https://z.overpass-api.de/api/interpreter', q1, {headers:{'Content-Type':'text/plain'}});
  console.log('Caloocan relations:', JSON.stringify(r1.data.elements.map(e => ({id:e.id, tags:e.tags}))));

  if (r1.data.elements.length === 0) {
    // Try admin_level 5
    const q2 = `[out:json][timeout:30];relation["name"~"Caloocan"]["type"="boundary"];out tags;`;
    const r2 = await axios.post('https://z.overpass-api.de/api/interpreter', q2, {headers:{'Content-Type':'text/plain'}});
    console.log('Fallback search:', JSON.stringify(r2.data.elements.map(e => ({id:e.id, tags:e.tags}))));
  }
}

run().catch(e => {
  console.error('Error:', e.message);
  if (e.response) console.error('Status:', e.response.status);
});
