async function findImages(query) {
  const url = 'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrlimit=8&prop=imageinfo&iiprop=url|mime|size&iiurlwidth=640&format=json&gsrsearch=' + encodeURIComponent(query);
  const res = await fetch(url, { headers: { 'User-Agent': 'BMWVehicleAnalytics/1.0 (contact: piyushvverma27@gmail.com)' } });
  const data = await res.json();
  if (!data.query || !data.query.pages) return [];
  return Object.values(data.query.pages).map(p => ({
    title: p.title,
    thumburl: p.imageinfo?.[0]?.thumburl,
    url: p.imageinfo?.[0]?.url,
    width: p.imageinfo?.[0]?.width,
    height: p.imageinfo?.[0]?.height,
  })).filter(x => x.thumburl);
}

async function test() {
  const models = [
    { gid: 'BMW_502', q: '"BMW 502" front' },
    { gid: 'BMW_3_E90', q: '"BMW E90" front' },
    { gid: 'BMW_3_F30', q: '"BMW F30" front' },
    { gid: 'BMW_X7_G07', q: '"BMW G07" OR "BMW X7" front' },
    { gid: 'BMW_I3_I01', q: '"BMW i3" front' }
  ];
  for (const m of models) {
    const list = await findImages(m.q);
    console.log('===', m.gid, '===');
    for (const img of list.slice(0, 3)) {
      console.log(' -', img.title);
      console.log('   ', img.thumburl);
    }
  }
}
test();
