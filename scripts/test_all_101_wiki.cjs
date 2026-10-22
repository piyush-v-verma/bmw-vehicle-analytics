const fs = require('fs');

const inv = JSON.parse(fs.readFileSync('dataset/inventory.json', 'utf8'));

// Special manual search overrides for vintage or shared Wikipedia articles
const QUERY_OVERRIDES = {
  'BMW_3-15_DA2': 'BMW 3/15',
  'BMW_3-20_AM': 'BMW 3/20',
  'BMW_303': 'BMW 303',
  'BMW_309': 'BMW 309',
  'BMW_315': 'BMW 315',
  'BMW_319': 'BMW 319',
  'BMW_329': 'BMW 329',
  'BMW_320': 'BMW 320',
  'BMW_321': 'BMW 321',
  'BMW_326': 'BMW 326',
  'BMW_327': 'BMW 327',
  'BMW_328': 'BMW 328',
  'BMW_335': 'BMW 335 (1939)',
  'BMW_501': 'BMW 501',
  'BMW_502': 'BMW 501',
  'BMW_503': 'BMW 503',
  'BMW_507': 'BMW 507',
  'BMW_3200_CS': 'BMW 3200 CS',
  'BMW_ISETTA': 'Isetta',
  'BMW_600': 'BMW 600',
  'BMW_700': 'BMW 700',
  'BMW_NK_SEDAN': 'BMW New Class',
  'BMW_NK_COUPE': 'BMW New Class coupe',
  'BMW_02_SERIES': 'BMW 02 Series',
  'BMW_E3_SEDAN': 'BMW New Six',
  'BMW_E9_COUPE': 'BMW E9',
  'BMW_M1_E26': 'BMW M1',
  'BMW_Z1_E30Z': 'BMW Z1',
  'BMW_Z3_E36': 'BMW Z3',
  'BMW_Z4_E85': 'BMW Z4 (E85)',
  'BMW_Z4_E89': 'BMW Z4 (E89)',
  'BMW_Z4_G29': 'BMW Z4 (G29)',
  'BMW_Z8_E52': 'BMW Z8',
  'BMW_I3_I01': 'BMW i3',
  'BMW_I8_I12': 'BMW i8',
  'BMW_IX_I20': 'BMW iX',
  'BMW_I4_G26': 'BMW i4',
  'BMW_IX1_U11': 'BMW iX1',
  'BMW_IX2_U10': 'BMW iX2',
  'BMW_IX3_G08': 'BMW iX3',
  'BMW_I5_G60': 'BMW i5',
  'BMW_I7_G70': 'BMW i7',
  'BMW_XM_G09': 'BMW XM',
  'BMW_1_F70': 'BMW 1 Series (F70)',
  'BMW_X3_G45': 'BMW X3 (G45)',
  'BMW_2_U06': 'BMW 2 Series Active Tourer',
  'BMW_2_F44': 'BMW 2 Series Gran Coupe',
  'BMW_6_G32': 'BMW 6 Series (G32)',
  'BMW_3_G20': 'BMW 3 Series (G20)',
  'BMW_5_G60': 'BMW 5 Series (G60)',
  'BMW_7_G70': 'BMW 7 Series (G70)'
};

function getSearchQuery(model) {
  if (QUERY_OVERRIDES[model.generation_id]) {
    return QUERY_OVERRIDES[model.generation_id];
  }
  const cleanCode = model.generation_code ? model.generation_code.replace(/^BMW\s*/i, '').trim() : '';
  if (model.model_name.includes('Series')) {
    return `BMW ${model.model_name} (${cleanCode})`;
  }
  if (cleanCode && !/^\d+$/.test(cleanCode)) {
    return `BMW ${model.model_name} (${cleanCode})`;
  }
  return `BMW ${model.model_name}`;
}

async function findWikiLeadImage(query) {
  const sUrl = 'https://en.wikipedia.org/w/api.php?action=query&list=search&srlimit=1&format=json&srsearch=' + encodeURIComponent(query);
  const sRes = await fetch(sUrl, { headers: { 'User-Agent': 'BMWVehicleAnalytics/1.0 (contact: piyushvverma27@gmail.com)' } });
  const sData = await sRes.json();
  const title = sData.query?.search?.[0]?.title;
  if (!title) return null;
  const pUrl = 'https://en.wikipedia.org/w/api.php?action=query&titles=' + encodeURIComponent(title) + '&prop=pageimages|info&inprop=url&pithumbsize=960&format=json';
  const pRes = await fetch(pUrl, { headers: { 'User-Agent': 'BMWVehicleAnalytics/1.0 (contact: piyushvverma27@gmail.com)' } });
  const pData = await pRes.json();
  const page = Object.values(pData.query.pages)[0];
  return {
    matchedTitle: title,
    pageUrl: page.canonicalurl,
    thumb: page.thumbnail?.source,
    width: page.thumbnail?.width,
    height: page.thumbnail?.height
  };
}

async function testAll() {
  console.log(`Testing all ${inv.length} models...`);
  const mapping = {};
  const missing = [];
  
  for (let i = 0; i < inv.length; i++) {
    const m = inv[i];
    const q = getSearchQuery(m);
    try {
      const res = await findWikiLeadImage(q);
      if (res && res.thumb) {
        mapping[m.generation_id] = {
          generation_id: m.generation_id,
          model_name: m.model_name,
          generation_code: m.generation_code,
          production_years: m.production_years,
          body_style: m.body_style,
          query: q,
          ...res
        };
        console.log(`[${i+1}/${inv.length}] OK: ${m.generation_id} -> ${res.matchedTitle}`);
      } else {
        missing.push({ gid: m.generation_id, query: q, res });
        console.log(`[${i+1}/${inv.length}] MISSING: ${m.generation_id} (query: ${q})`);
      }
    } catch (e) {
      missing.push({ gid: m.generation_id, error: e.message });
      console.log(`[${i+1}/${inv.length}] ERR: ${m.generation_id} - ${e.message}`);
    }
    await new Promise(r => setTimeout(r, 80));
  }
  
  fs.writeFileSync('scripts/wiki_lead_mapping.json', JSON.stringify(mapping, null, 2));
  console.log(`\nDone. Found: ${Object.keys(mapping).length}/${inv.length}. Missing: ${missing.length}`);
  if (missing.length > 0) {
    console.log('Missing items:', JSON.stringify(missing, null, 2));
  }
}

testAll();
