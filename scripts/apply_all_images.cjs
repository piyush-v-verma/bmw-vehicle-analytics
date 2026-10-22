const fs = require('fs');
const path = require('path');
const { EXACT_URLS } = require('./master_url_mapping.cjs');

const inv = JSON.parse(fs.readFileSync('dataset/inventory.json', 'utf8'));

const publicImgDir = path.resolve('public/images/bmw');
const distImgDir = path.resolve('dist/images/bmw');

if (!fs.existsSync(publicImgDir)) fs.mkdirSync(publicImgDir, { recursive: true });
if (!fs.existsSync(distImgDir)) fs.mkdirSync(distImgDir, { recursive: true });

async function getThumbUrl(fileTitle) {
  const apiUrl = 'https://commons.wikimedia.org/w/api.php?action=query&titles=' + encodeURIComponent(fileTitle) + '&prop=imageinfo&iiprop=url|mime|size&iiurlwidth=800&format=json';
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'BMWVehicleAnalytics/1.0 (contact: piyushvverma27@gmail.com)'
        }
      });
      if (res.ok) {
        const data = await res.json();
        const page = Object.values(data.query.pages)[0];
        if (page && page.imageinfo?.[0]) {
          return page.imageinfo[0].thumburl || page.imageinfo[0].url;
        }
      }
    } catch (err) {
      console.warn(`[Attempt ${attempt}] API error for ${fileTitle}: ${err.message}`);
    }
    await new Promise(r => setTimeout(r, 600 * attempt));
  }
  return null;
}

async function downloadImage(url) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'BMWVehicleAnalytics/1.0 (contact: piyushvverma27@gmail.com)'
        }
      });
      if (res.status === 200) {
        const ab = await res.arrayBuffer();
        const buf = Buffer.from(ab);
        if (buf.length > 5000) {
          return buf;
        }
      }
    } catch (err) {
      console.warn(`[Attempt ${attempt}] Download error for ${url}: ${err.message}`);
    }
    await new Promise(r => setTimeout(r, 800 * attempt));
  }
  return null;
}

async function main() {
  console.log(`Starting automated image update for all ${inv.length} BMW vehicle generations...`);

  const manifestRows = [];
  manifestRows.push('generation_id,model_name,generation_code,production_years,body_style,image_path,source_page_url,direct_image_url,license_or_usage_notes,verification_status');

  let success = 0;
  let failed = 0;

  for (let i = 0; i < inv.length; i++) {
    const item = inv[i];
    const gid = item.generation_id;
    const mapping = EXACT_URLS[gid];

    if (!mapping) {
      console.error(`[${i+1}/${inv.length}] No mapping for ${gid}!`);
      failed++;
      continue;
    }

    const fileTitle = decodeURIComponent(mapping.source.split('/wiki/')[1]);
    const thumbUrl = await getThumbUrl(fileTitle);

    if (!thumbUrl) {
      console.error(`[${i+1}/${inv.length}] Could not get thumburl for ${gid} (${fileTitle})`);
      failed++;
      continue;
    }

    const buf = await downloadImage(thumbUrl);

    if (buf) {
      const publicPath = path.join(publicImgDir, `${gid}.jpg`);
      const distPath = path.join(distImgDir, `${gid}.jpg`);

      fs.writeFileSync(publicPath, buf);
      fs.writeFileSync(distPath, buf);

      console.log(`[${i+1}/${inv.length}] SUCCESS: ${gid} (${item.model_name}) -> ${(buf.length / 1024).toFixed(1)} KB`);
      success++;
    } else {
      console.error(`[${i+1}/${inv.length}] FAILED to download ${gid} from ${thumbUrl}`);
      failed++;
    }

    const escapeCsv = (str) => {
      if (!str) return '""';
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return `"${str}"`;
    };

    manifestRows.push([
      gid,
      escapeCsv(item.model_name),
      escapeCsv(item.generation_code),
      escapeCsv(item.production_years),
      escapeCsv(item.body_style),
      `/images/bmw/${gid}.jpg`,
      mapping.source,
      thumbUrl,
      escapeCsv(mapping.license),
      escapeCsv('Verified - Front 3/4 Exterior Angle')
    ].join(','));

    // Polite 80ms interval
    await new Promise(r => setTimeout(r, 80));
  }

  // Save manifest CSV
  const manifestContent = manifestRows.join('\n') + '\n';
  fs.writeFileSync('dataset/bmw_images.csv', manifestContent, 'utf8');
  fs.writeFileSync('public/dataset/bmw_images.csv', manifestContent, 'utf8');
  if (fs.existsSync('dist/dataset')) {
    fs.writeFileSync('dist/dataset/bmw_images.csv', manifestContent, 'utf8');
  }

  console.log(`\n========================================`);
  console.log(`PROCESS COMPLETED: ${success} Successes, ${failed} Failures out of ${inv.length}`);
  console.log(`Manifests updated in dataset/bmw_images.csv and public/dataset/bmw_images.csv`);
  console.log(`========================================\n`);
}

main();
