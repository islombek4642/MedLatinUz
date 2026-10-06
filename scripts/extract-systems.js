import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const html = fs.readFileSync('systems.html', 'utf8');

// Regex to extract systems:
// <a href="/system/([^/]+)/" ...>
//   ...
//   <h3 ...>([^<]+)</h3>
//   <p class="mt-0.5 text-xs italic ...">([^<]+)</p>
//   ...
//   <span ...>\s*(\d+)\s*</span>
//   ...
//   <p class="mt-3 line-clamp-2 ...">([^<]+)</p>

const sysRegex = /<a href="\/system\/([^/]+)\/"[^>]*>[\s\S]*?<h3[^>]*>([^<]+)<\/h3>[\s\S]*?<p[^>]*class="[^"]*italic[^"]*"[^>]*>([^<]+)<\/p>[\s\S]*?<span[^>]*class="[^"]*rounded-full[^"]*"[^>]*>\s*(\d+)\s*<\/span>[\s\S]*?<p[^>]*class="[^"]*line-clamp-2[^"]*"[^>]*>([^<]+)<\/p>/g;

const uzTranslations = {
  skeletal: {
    uzName: "Suyak-tayanch tizimi",
    uzDesc: "Inson tanasiga tayanch beruvchi, ichki a'zolarni himoyalovchi va harakatni ta'minlovchi 206 ta suyak va bo'g'imlar majmuasi."
  },
  muscular: {
    uzName: "Mushak tizimi",
    uzDesc: "Tana harakati, qomatni saqlash va issiqlik ajratishni ta'minlovchi 600 dan ortiq skelet mushaklari majmuasi."
  },
  cardiovascular: {
    uzName: "Yurak-qon tomir tizimi",
    uzDesc: "Yurak va qon tomirlari (arteriya, vena, kapillarlar) orqali butun tanaga qon, kislorod va ozuqa moddalarini yetkazib beruvchi tizim."
  },
  nervous: {
    uzName: "Asab tizimi (Nerv tizimi)",
    uzDesc: "Bosh miya, orqa miya va asab tolalari orqali butun organizm faoliyatini va barcha sezgilarni boshqaruvchi bosh markaziy tizim."
  },
  respiratory: {
    uzName: "Nafas olish tizimi",
    uzDesc: "Burun bo'shlig'i, kekirdak, bronxlar va o'pka orqali havoni qabul qilib, qonni kislorod bilan to'yintiruvchi va karbonat angidridni chiqaruvchi tizim."
  },
  digestive: {
    uzName: "Ovqat hazm qilish tizimi",
    uzDesc: "Og'iz bo'shlig'idan to to'g'ri ichakkacha bo'lgan, oziq-ovqatni qayta ishlab organizmga kerakli moddalarni so'ruvchi hazm a'zolari tizimi."
  },
  endocrine: {
    uzName: "Endokrin tizimi (Ichki sekretsiya)",
    uzDesc: "Qalqonsimon bez, gipofiz, buyrak usti bezi kabi a'zolar orqali qonga gormonlar ajratib, tana funksiyalarini boshqaruvchi bezlar tizimi."
  },
  'lymphatic-immune': {
    uzName: "Limfa va immunitet tizimi",
    uzDesc: "Organizmning infeksiyalar, viruslar va bakteriyalarga qarshi kurashuvchi mudofaa qalqoni (limfa tugunlari, taloq, timus)."
  },
  urinary: {
    uzName: "Siydik ajratish tizimi",
    uzDesc: "Buyraklar, siydik yo'llari va qovuq orqali qonni zararli moddalardan tozalab, ortiqcha suv va tuzlarni chiqaruvchi a'zolar tizimi."
  },
  reproductive: {
    uzName: "Reproduktiv tizim (Ko'payish tizimi)",
    uzDesc: "Nasl qoldirish, jinsiy gormonlar va hujayralarni ishlab chiqarish uchun mas'ul a'zolar tizimi."
  },
  integumentary: {
    uzName: "Qoplovchi tizim (Teri va hosilalari)",
    uzDesc: "Tananing eng katta a'zolar tizimi: teri, soch, tirnoqlar va teri bezlaridan iborat bo'lib, tanani tashqi muhitdan himoya qiladi."
  },
  'special-senses': {
    uzName: "Maxsus sezgi a'zolari tizimi",
    uzDesc: "Ko'rish (ko'z), eshitish va muvozanat (quloq), hid bilish, ta'm bilish a'zolarini o'z ichiga oluvchi sezgi tizimi."
  }
};

let match;
const systems = [];
let index = 1;

while ((match = sysRegex.exec(html)) !== null) {
  const slug = match[1].trim();
  const title = match[2].trim();
  const latin = match[3].trim();
  const count = parseInt(match[4].trim(), 10);
  const englishDesc = match[5].trim().replace(/&#x27;/g, "'").replace(/&amp;/g, '&');

  const uzInfo = uzTranslations[slug] || {
    uzName: `${title} tizimi`,
    uzDesc: englishDesc
  };

  const id = `sys_${String(index).padStart(2, '0')}`;
  index++;

  systems.push({
    id,
    latin,
    english: title,
    category: 'anatomy_system',
    type: 'Body System',
    type_uz: 'Tana tizimi',
    translation_uz: `${uzInfo.uzName} (${title} system)`,
    definition_uz: `${uzInfo.uzDesc} (Jami ${count} ta anatomik tuzilmani birlashtiradi).`,
    structures_count: count,
    slug: `/system/${slug}/`
  });
}

console.log(`Extracted ${systems.length} human body systems:`);
systems.forEach(s => console.log(`- ${s.latin} (${s.english}) -> ${s.translation_uz}`));

const targetFile = path.resolve(__dirname, '../data/anatomy_systems.json');
fs.writeFileSync(targetFile, JSON.stringify(systems, null, 2), 'utf8');
console.log(`\n✓ Saved to data/anatomy_systems.json!`);
