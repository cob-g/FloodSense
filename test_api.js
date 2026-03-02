const axios = require('axios');
const query = '[out:json][timeout:25];(relation["name"~"179|18[0-8]|Tala|Amparo|Pangarap",i](14.73, 121.04, 14.79, 121.14);way["name"~"179|18[0-8]|Tala|Amparo|Pangarap",i](14.73, 121.04, 14.79, 121.14););out geom;';

axios.post('https://maps.mail.ru/osm/tools/overpass/api/interpreter', query, { headers: { 'Content-Type': 'text/plain' } })
  .then(res => console.log('Mail.ru Success! elements:', res.data.elements.length))
  .catch(e => console.log('Mail.ru Failed:', e.message));

axios.post('https://overpass.kumi.systems/api/interpreter', query, { headers: { 'Content-Type': 'text/plain' } })
  .then(res => console.log('Kumi Success! elements:', res.data.elements.length))
  .catch(e => console.log('Kumi Failed:', e.message));

axios.post('https://z.overpass-api.de/api/interpreter', query, { headers: { 'Content-Type': 'text/plain' } })
  .then(res => console.log('De.Z Success! elements:', res.data.elements.length))
  .catch(e => console.log('De.Z Failed:', e.message));