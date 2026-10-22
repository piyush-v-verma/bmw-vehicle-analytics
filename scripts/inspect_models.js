const fs = require('fs');
const inv = JSON.parse(fs.readFileSync('dataset/inventory.json', 'utf8'));
console.log('Total:', inv.length);
for (const i of inv) {
  console.log(`${i.generation_id} | ${i.model_name} | ${i.generation_code} | ${i.production_years} | ${i.body_style}`);
}
