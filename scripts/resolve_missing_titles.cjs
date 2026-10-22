const fs = require('fs');

// We test finding the exact image files for the missing items
const MISSING_GIDS = [
  { gid: 'BMW_3-15_DA2', wiki: 'BMW 3/15' },
  { gid: 'BMW_3-20_AM', wiki: 'BMW 3/20' },
  { gid: 'BMW_303', wiki: 'BMW 303' },
  { gid: 'BMW_320', wiki: 'BMW 320' },
  { gid: 'BMW_321', wiki: 'BMW 321' },
  { gid: 'BMW_326', wiki: 'BMW 326' },
  { gid: 'BMW_327', wiki: 'BMW 327' },
  { gid: 'BMW_328', wiki: 'BMW 328' },
  { gid: 'BMW_335', wiki: 'BMW 335 (1939)' },
  { gid: 'BMW_503', wiki: 'BMW 503' },
  { gid: 'BMW_3200_CS', wiki: 'BMW 3200 CS' },
  { gid: 'BMW_600', wiki: 'BMW 600' },
  { gid: 'BMW_700', wiki: 'BMW 700' },
  { gid: 'BMW_02_SERIES', wiki: 'BMW 02 Series' },
  { gid: 'BMW_E9_COUPE', wiki: 'BMW E9' },
  { gid: 'BMW_3_E21', wiki: 'BMW 3 Series (E21)' },
  { gid: 'BMW_3_E36', wiki: 'BMW 3 Series (E36)' },
  { gid: 'BMW_5_E12', wiki: 'BMW 5 Series (E12)' },
  { gid: 'BMW_5_E28', wiki: 'BMW 5 Series (E28)' },
  { gid: 'BMW_5_E34', wiki: 'BMW 5 Series (E34)' },
  { gid: 'BMW_5_E39', wiki: 'BMW 5 Series (E39)' },
  { gid: 'BMW_5_E60', wiki: 'BMW 5 Series (E60)' },
  { gid: 'BMW_5_G60', wiki: 'BMW 5 Series (G60)' },
  { gid: 'BMW_7_E23', wiki: 'BMW 7 Series (E23)' },
  { gid: 'BMW_7_E32', wiki: 'BMW 7 Series (E32)' },
  { gid: 'BMW_7_E38', wiki: 'BMW 7 Series (E38)' },
  { gid: 'BMW_7_E65', wiki: 'BMW 7 Series (E65)' },
  { gid: 'BMW_7_G11', wiki: 'BMW 7 Series (G11)' },
  { gid: 'BMW_6_E24', wiki: 'BMW 6 Series (E24)' },
  { gid: 'BMW_6_E63', wiki: 'BMW 6 Series (E63)' },
  { gid: 'BMW_6_F12', wiki: 'BMW 6 Series (F12)' },
  { gid: 'BMW_6_G32', wiki: 'BMW 6 Series (G32)' },
  { gid: 'BMW_8_E31', wiki: 'BMW 8 Series (E31)' },
  { gid: 'BMW_1_E87', wiki: 'BMW 1 Series (E87)' },
  { gid: 'BMW_1_F20', wiki: 'BMW 1 Series (F20)' },
  { gid: 'BMW_1_F70', wiki: 'BMW 1 Series (F70)' },
  { gid: 'BMW_2_F22', wiki: 'BMW 2 Series (F22)' },
  { gid: 'BMW_2_F45', wiki: 'BMW 2 Series Active Tourer' },
  { gid: 'BMW_2_F44', wiki: 'BMW 2 Series Gran Coupé' },
  { gid: 'BMW_2_U06', wiki: 'BMW 2 Series Active Tourer' },
  { gid: 'BMW_4_F32', wiki: 'BMW 4 Series (F32)' },
  { gid: 'BMW_4_G22', wiki: 'BMW 4 Series (G22)' },
  { gid: 'BMW_X1_E84', wiki: 'BMW X1 (E84)' },
  { gid: 'BMW_X1_F48', wiki: 'BMW X1 (F48)' },
  { gid: 'BMW_X1_U11', wiki: 'BMW X1 (U11)' },
  { gid: 'BMW_X2_F39', wiki: 'BMW X2' },
  { gid: 'BMW_X5_E53', wiki: 'BMW X5 (E53)' },
  { gid: 'BMW_X5_E70', wiki: 'BMW X5 (E70)' },
  { gid: 'BMW_X5_F15', wiki: 'BMW X5 (F15)' },
  { gid: 'BMW_Z1_E30Z', wiki: 'BMW Z1' },
  { gid: 'BMW_Z4_E85', wiki: 'BMW Z4 (E85)' },
  { gid: 'BMW_Z8_E52', wiki: 'BMW Z8' },
  { gid: 'BMW_IX_I20', wiki: 'BMW iX' },
  { gid: 'BMW_I4_G26', wiki: 'BMW i4' },
  { gid: 'BMW_IX1_U11', wiki: 'BMW iX1' },
  { gid: 'BMW_IX3_G08', wiki: 'BMW iX3' },
  { gid: 'BMW_I5_G60', wiki: 'BMW i5' }
];

async function getWikiImages(title) {
  const url = 'https://en.wikipedia.org/w/api.php?action=query&titles=' + encodeURIComponent(title) + '&prop=images|pageimages&pithumbsize=960&imlimit=30&format=json';
  const res = await fetch(url, { headers: { 'User-Agent': 'BMWVehicleAnalytics/1.0 (contact: piyushvverma27@gmail.com)' } });
  if (!res.ok) return { lead: null, images: [] };
  const data = await res.json();
  const page = Object.values(data.query.pages)[0];
  if (!page || page.missing !== undefined) return { lead: null, images: [] };
  return {
    lead: page.thumbnail?.source ? {
      thumb: page.thumbnail.source,
      pageTitle: page.title
    } : null,
    images: (page.images || []).map(i => i.title).filter(t => !t.endsWith('.svg'))
  };
}

async function resolveAll() {
  const resolved = {};
  for (const item of MISSING_GIDS) {
    const data = await getWikiImages(item.wiki);
    if (data.lead) {
      resolved[item.gid] = { type: 'lead', title: data.lead.pageTitle, thumb: data.lead.thumb };
      console.log(`[LEAD] ${item.gid} (${item.wiki}) -> ${data.lead.thumb}`);
    } else if (data.images.length > 0) {
      console.log(`[IMAGES] ${item.gid} (${item.wiki}):`);
      for (const img of data.images.slice(0, 5)) {
        console.log(`   ${img}`);
      }
      resolved[item.gid] = { type: 'images', list: data.images };
    } else {
      console.log(`[NONE] ${item.gid} (${item.wiki})`);
    }
    await new Promise(r => setTimeout(r, 60));
  }
  fs.writeFileSync('scripts/resolved_missing_data.json', JSON.stringify(resolved, null, 2));
}

resolveAll();
