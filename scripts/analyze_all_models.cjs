const fs = require('fs');
const path = require('path');

const inv = JSON.parse(fs.readFileSync('dataset/inventory.json', 'utf8'));
const imgDir = 'public/images/bmw';

const report = inv.map(m => {
  const file = path.join(imgDir, `${m.generation_id}.jpg`);
  let exists = fs.existsSync(file);
  let size = exists ? (fs.statSync(file).size / 1024).toFixed(1) + ' KB' : 'MISSING';
  return {
    gid: m.generation_id,
    name: m.model_name,
    code: m.generation_code,
    years: m.production_years,
    body: m.body_style,
    size
  };
});

console.log(JSON.stringify(report, null, 2));
