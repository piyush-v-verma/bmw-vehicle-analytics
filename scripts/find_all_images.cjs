const fs = require('fs');

const inv = JSON.parse(fs.readFileSync('dataset/inventory.json', 'utf8'));

// Forbidden terms that indicate non-exterior or non-front-3/4 views
const BAD_TERMS = [
  'interior', 'cockpit', 'dashboard', 'engine', 'motor', 'badge', 'emblem',
  'logo', 'wheel', 'rim', 'steering', 'side skirt', 'detail', 'light',
  'headlight', 'taillight', 'rear', 'back', 'heck', 'innenraum', 'tacho',
  'instrument', 'trunk', 'kofferraum', 'door', 'exhaust', 'exhausts',
  'crash', 'wreck', 'tuning badge'
];

function isGoodTitle(title) {
  const lower = title.toLowerCase();
  for (const b of BAD_TERMS) {
    if (lower.includes(b)) return false;
  }
  return true;
}

// Generate search query for each generation
function getQueries(model) {
  const { generation_id, model_name, generation_code, full_generation_name } = model;
  const queries = [];
  
  // Specific generation code search
  const cleanCode = generation_code ? generation_code.replace(/^(3-|BMW\s*)/i, '').trim() : '';
  
  if (cleanCode && cleanCode.length > 1 && !/^\d+$/.test(cleanCode)) {
    queries.push(`"BMW ${cleanCode}" front`);
    queries.push(`"BMW ${cleanCode}"`);
  }
  
  // Model name + code
  if (model_name && cleanCode && model_name !== cleanCode) {
    queries.push(`"BMW ${model_name}" "${cleanCode}" front`);
  }
  
  // Pre-war / vintage numbered models
  if (/^\d{3}$/.test(model_name)) {
    queries.push(`"BMW ${model_name}" front`);
    queries.push(`"BMW ${model_name}"`);
  } else if (/^3-\d+/.test(generation_code)) {
    queries.push(`"BMW 3/${generation_code.split('-')[1]}"`);
    queries.push(`"BMW ${generation_code}"`);
  }
  
  // Standard series
  if (model_name.includes('Series') || /^\d\s*Series/i.test(model_name)) {
    const seriesNum = model_name.split(' ')[0];
    queries.push(`"BMW ${seriesNum} Series" "${cleanCode}"`);
  }
  
  // Fallback query
  queries.push(`"BMW ${model_name}"`);
  
  return [...new Set(queries)];
}

async function searchWikimedia(query) {
  const url = 'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrlimit=12&prop=imageinfo&iiprop=url|mime|size&iiurlwidth=800&format=json&gsrsearch=' + encodeURIComponent(query);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'BMWVehicleAnalytics/1.0 (contact: piyushvverma27@gmail.com)' }
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.query || !data.query.pages) return [];
    
    return Object.values(data.query.pages)
      .map(p => {
        const info = p.imageinfo?.[0];
        if (!info || !info.thumburl) return null;
        if (info.mime !== 'image/jpeg' && info.mime !== 'image/png') return null;
        return {
          title: p.title,
          thumburl: info.thumburl,
          url: info.url,
          width: info.width,
          height: info.height,
          descriptionurl: info.descriptionurl
        };
      })
      .filter(Boolean);
  } catch (err) {
    return [];
  }
}

async function testMatch() {
  console.log(`Starting scan for ${inv.length} models...`);
  const results = {};
  
  for (let idx = 0; idx < inv.length; idx++) {
    const m = inv[idx];
    const queries = getQueries(m);
    let matched = null;
    
    for (const q of queries) {
      const candidates = await searchWikimedia(q);
      const goodCandidates = candidates.filter(c => isGoodTitle(c.title));
      
      // Look for front/quarter preference
      const best = goodCandidates.find(c => {
        const l = c.title.toLowerCase();
        return l.includes('front') || l.includes('quarter') || l.includes('3/4');
      }) || goodCandidates[0];
      
      if (best) {
        matched = { query: q, ...best };
        break;
      }
      // Small delay between queries to respect Wikimedia
      await new Promise(r => setTimeout(r, 200));
    }
    
    results[m.generation_id] = matched;
    console.log(`[${idx + 1}/${inv.length}] ${m.generation_id}: ${matched ? matched.title : 'NO MATCH'}`);
    await new Promise(r => setTimeout(r, 150));
  }
  
  fs.writeFileSync('scripts/candidate_matches.json', JSON.stringify(results, null, 2));
  const matchedCount = Object.values(results).filter(Boolean).length;
  console.log(`\nScan finished. Matched ${matchedCount}/${inv.length} models.`);
}

testMatch();
