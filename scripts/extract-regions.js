import fs from 'fs';

const html = fs.readFileSync('regions.html', 'utf8');
const regionRegex = /<a[^>]*href=["']\/region\/([^"']+)["'][^>]*>[\s\S]*?<h3[^>]*>([\s\S]*?)<\/h3>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/gi;

const uzTranslations = {
  'head': { uz: 'Bosh sohasi', latin: 'Caput' },
  'face': { uz: 'Yuz sohasi', latin: 'Facies' },
  'neck': { uz: "Bo'yin sohasi", latin: 'Collum / Cervix' },
  'thorax': { uz: "Ko'krak qafasi sohasi", latin: 'Thorax / Pectus' },
  'abdomen': { uz: 'Qorin sohasi', latin: 'Abdomen / Venter' },
  'pelvis': { uz: 'Chanoq sohasi', latin: 'Pelvis' },
  'back': { uz: 'Orqa / Bel sohasi', latin: 'Dorsum' },
  'upper-arm': { uz: 'Yelka sohasi', latin: 'Brachium' },
  'forearm': { uz: 'Bilak sohasi', latin: 'Antebrachium' },
  'hand': { uz: "Qo'l panjasi sohasi", latin: 'Manus' },
  'thigh': { uz: 'Son sohasi', latin: 'Femur' },
  'leg': { uz: 'Boldir sohasi', latin: 'Crus' },
  'foot': { uz: 'Oyoq panjasi sohasi', latin: 'Pes' },
  'shoulder': { uz: 'Yelka bo\'g\'imi sohasi', latin: 'Omos / Regio deltoidea' },
  'hip': { uz: 'Chanoq-son sohasi', latin: 'Coxa' },
  'spine': { uz: 'Umurtqa pog\'onasi sohasi', latin: 'Columna vertebralis' },
  'brain': { uz: 'Bosh miya sohasi', latin: 'Encephalon / Cerebrum' },
  'heart-region': { uz: 'Yurak sohasi (Mediastinum)', latin: 'Regio cardiaca / Mediastinum' },
  'eye': { uz: "Ko'z sohasi (Orbita)", latin: 'Regio orbitalis / Oculus' },
  'ear': { uz: 'Quloq sohasi', latin: 'Regio auricularis / Auris' }
};

const items = [];
let m;
let id = 1;
while ((m = regionRegex.exec(html)) !== null) {
  const slug = m[1].replace(/\/$/, '').trim();
  const nameEn = m[2].replace(/<[^>]+>/g, '').trim();
  const descEn = m[3].replace(/<[^>]+>/g, '').replace(/…$/, '...').trim();

  const tr = uzTranslations[slug] || { uz: `${nameEn} sohasi`, latin: nameEn };

  items.push({
    id: `reg_${String(id++).padStart(4, '0')}`,
    latin: `${tr.latin} (${nameEn})`,
    category: 'anatomy_region',
    type: 'Region',
    type_uz: 'Tana sohasi',
    english: nameEn,
    translation_uz: tr.uz,
    definition_uz: `Inson tanasi sohasi: ${tr.uz}. ${descEn}`,
    slug: `/region/${slug}/`
  });
}

fs.writeFileSync('data/anatomy_regions.json', JSON.stringify(items, null, 2), 'utf8');
console.log(`Successfully generated ${items.length} body regions in data/anatomy_regions.json`);
