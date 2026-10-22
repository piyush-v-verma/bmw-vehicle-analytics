const fs = require('fs');
const { VERIFIED_FILES } = require('./verified_files_catalog.cjs');
const inv = JSON.parse(fs.readFileSync('dataset/inventory.json', 'utf8'));

async function checkTitle(fileTitle) {
  const url = 'https://commons.wikimedia.org/w/api.php?action=query&titles=' + encodeURIComponent(fileTitle) + '&prop=imageinfo&iiprop=url|mime|size&iiurlwidth=960&format=json';
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'BMWVehicleAnalytics/1.0 (contact: piyushvverma27@gmail.com)' } });
    if (!res.ok) return null;
    const data = await res.json();
    const page = Object.values(data.query.pages)[0];
    if (!page || page.missing !== undefined) return null;
    return page.imageinfo?.[0]?.thumburl ? page : null;
  } catch (e) {
    return null;
  }
}

async function runCheck() {
  console.log(`Checking ${inv.length} models against Wikimedia...`);
  const missing = [];
  
  for (let i = 0; i < inv.length; i++) {
    const m = inv[i];
    const title = VERIFIED_FILES[m.generation_id];
    if (!title) {
      missing.push({ gid: m.generation_id, reason: 'No title in VERIFIED_FILES' });
      console.log(`[${i+1}/${inv.length}] NO TITLE: ${m.generation_id}`);
      continue;
    }
    const page = await checkTitle(title);
    if (!page) {
      missing.push({ gid: m.generation_id, title });
      console.log(`[${i+1}/${inv.length}] MISSING: ${m.generation_id} -> ${title}`);
    } else {
      console.log(`[${i+1}/${inv.length}] OK: ${m.generation_id}`);
    }
    await new Promise(r => setTimeout(r, 60));
  }
  
  console.log(`\nCheck Complete. Total: ${inv.length}, Missing: ${missing.length}`);
  if (missing.length > 0) {
    console.log('Missing files:', JSON.stringify(missing, null, 2));
  }
}

runCheck();
