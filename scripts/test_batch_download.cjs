const fs = require('fs');
const path = require('path');
const { VERIFIED_FILES } = require('./verified_files_catalog.cjs');

async function getFileInfo(fileTitle) {
  const url = 'https://commons.wikimedia.org/w/api.php?action=query&titles=' + encodeURIComponent(fileTitle) + '&prop=imageinfo&iiprop=url|mime|size|extmetadata&iiurlwidth=960&format=json';
  const res = await fetch(url, { headers: { 'User-Agent': 'BMWVehicleAnalytics/1.0 (contact: piyushvverma27@gmail.com)' } });
  if (!res.ok) return null;
  const data = await res.json();
  const page = Object.values(data.query.pages)[0];
  if (!page || page.missing !== undefined) return null;
  const info = page.imageinfo?.[0];
  if (!info) return null;
  const meta = info.extmetadata || {};
  return {
    title: page.title,
    thumburl: info.thumburl,
    url: info.url,
    width: info.thumbwidth || info.width,
    height: info.thumbheight || info.height,
    author: (meta.Artist?.value || 'Wikimedia Commons Contributor').replace(/<[^>]+>/g, '').trim(),
    license: meta.LicenseShortName?.value || 'CC BY-SA 4.0',
    descriptionUrl: info.descriptionurl
  };
}

async function downloadFile(url, destPath) {
  const res = await fetch(url, { headers: { 'User-Agent': 'BMWVehicleAnalytics/1.0 (contact: piyushvverma27@gmail.com)' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  const ab = await res.arrayBuffer();
  const buf = Buffer.from(ab);
  fs.writeFileSync(destPath, buf);
  return buf.length;
}

async function testBatch() {
  const testIds = ['BMW_502', 'BMW_3_E90', 'BMW_3_F30', 'BMW_5_G30', 'BMW_I3_I01'];
  for (const gid of testIds) {
    const fileTitle = VERIFIED_FILES[gid];
    console.log(`Checking ${gid} -> ${fileTitle}...`);
    const info = await getFileInfo(fileTitle);
    if (!info) {
      console.log(`  FAIL: File not found: ${fileTitle}`);
      continue;
    }
    console.log(`  OK: Thumb=${info.thumburl} (${info.width}x${info.height}) Author=${info.author} License=${info.license}`);
    const dest = path.join('public/images/bmw', `${gid}.jpg`);
    const bytes = await downloadFile(info.thumburl, dest);
    console.log(`  DOWNLOADED: ${bytes} bytes saved to ${dest}`);
  }
}

testBatch();
