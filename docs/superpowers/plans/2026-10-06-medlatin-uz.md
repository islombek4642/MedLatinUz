# MedLatin UZ Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Oddiy fuqarolar shifokorlar retseptlari va tibbiy hujjatlardagi lotincha so'zlarni tushunishi uchun tezkor qidiruv, sodda izoh va offline (PWA) imkoniyatiga ega modulli Vanilla Web lug'atini yaratish.

**Architecture:** Modulli Vanilla arxitektura: ma'lumotlar mavzuli JSON fayllarda (`data/*.json`), stillar modulli CSS tizimida (`css/`), logika esa mustaqil ES6+ modullarida (`data-loader.js`, `search-engine.js`, `ui-renderer.js`, `app.js`). Offline rejim `sw.js` va `manifest.json` orqali ta'minlanadi.

**Tech Stack:** Vanilla HTML5, Vanilla CSS3 (Custom Properties / Design Tokens), Vanilla JavaScript (ES Modules), Service Worker (Cache API). Hech qanday tashqi freymvork ishlatilmaydi.

**Spec:** [docs/superpowers/specs/2026-10-06-medlatin-uz-design.md](file:///c:/MedLatin%20UZ/docs/superpowers/specs/2026-10-06-medlatin-uz-design.md)

## Global Constraints

- Faqat toza Vanilla HTML, CSS, JavaScript ishlatiladi.
- Hech qanday npm tobe'liklari talab qilinmaydi (runtime sof brauzerda ishlaydi).
- Har bir atama minimal 4 maydonga ega: `id`, `latin`, `category`, `translation_uz`, `definition_uz`.
- Qidiruv ikki tomonlama (lotincha va o'zbekcha) bo'lishi va tinish belgilariga/harflar registriga bog'liq bo'lmasligi kerak.
- 100% offline rejimda ishlashi shart.

## Review Focus

1. **Tinish belgilari bilan kiritish**: Foydalanuvchi "Rp." yoki "Rp" yoki "rp." yozganda bir xil to'g'ri natija chiqishi.
2. **Bo'sh kiritish yoki topilmagan natija**: Foydalanuvchi topilmaydigan so'z yozganda chiroyli "Natija topilmadi" va maslahatlar bloki chiqishi.
3. **Kategoriya filtrlari**: Kategoriya tanlanganda (masalan, "Retseptlar") faqat shu kategoriyadagi natijalar qolishi va qidiruv bilan birga to'g'ri ishlashi.
4. **Offline kesh xatosi**: Internet o'chirilganda Service Worker barcha JSON va statik fayllarni keshdan to'liq ochib berishi.
5. **Kichik ekran (mobil)**: Telefonda qidiruv maydoni va kartochkalar qulay o'qilishi, sig'ishi va ekrandan chiqib ketmasligi.

---

### Task 1: Modulli Ma'lumotlar Bazasini Yaratish (Data Seeding)

**Files:**
- Create: `data/prescriptions.json`
- Create: `data/anatomy.json`
- Create: `data/clinical.json`
- Create: `data/general.json`
- Test: `tests/validate-data.js`

**Interfaces:**
- Produces: `DictionaryEntry` obyektlar massivi:
  ```ts
  interface DictionaryEntry {
    id: string;
    latin: string;
    category: 'prescription' | 'anatomy' | 'clinical' | 'general';
    translation_uz: string;
    definition_uz: string;
  }
  ```

- [ ] **Step 1: Ma'lumotlar sxemasi va validatsiya testini yozish**
  `tests/validate-data.js` faylini yaratish: har bir JSON faylni o'qib, har bir elementda `id`, `latin`, `category`, `translation_uz`, `definition_uz` mavjudligini va bo'sh emasligini tekshiradi.

- [ ] **Step 2: Testni ishga tushirib, muvaffaqiyatsiz bo'lishini ko'rish**
  Buyruq: `node tests/validate-data.js`
  Kutilgan natija: FAIL (JSON fayllar hali mavjud emas).

- [ ] **Step 3: JSON fayllarni haqiqiy tibbiy ma'lumotlar bilan to'ldirish**
  - `data/prescriptions.json`: Shifokorlar retseptlaridagi asosiy qisqartmalar (`Rp.`, `D.t.d.N.`, `sol.`, `in tab.`, `in amp.`, `per os`, `gtt.`, `M.f.`, `S.`, `q.s.`, va h.k.).
  - `data/anatomy.json`: Asosiy inson a'zolari (`Cor`, `Cranium`, `Ren`, `Pulmo`, `Hepar`, `Musculus`, `Os`, `Arteria`, `Vena`, va h.k.).
  - `data/clinical.json`: Klinik tashxis va kasalliklar (`Cephalalgia`, `Gastritis`, `Bronchitis`, `Hypertonia`, `Pneumonia`, `Appendicitis`, va h.k.).
  - `data/general.json`: Keng tarqalgan umumiy lotincha so'zlar.

- [ ] **Step 4: Testni qayta ishga tushirish**
  Buyruq: `node tests/validate-data.js`
  Kutilgan natija: PASS (barcha fayllar va yozuvlar sxemaga mos).

---

### Task 2: Modulli CSS Tizimi va Dizayn Tokenlari

**Files:**
- Create: `css/variables.css`
- Create: `css/base.css`
- Create: `css/layout.css`
- Create: `css/components/search-bar.css`
- Create: `css/components/word-card.css`
- Create: `css/components/filters.css`
- Create: `css/components/responsive.css`
- Create: `css/main.css`

**Interfaces:**
- Produces: Zamonaviy tibbiy mavzudagi CSS o'zgaruvchilari (`--color-primary`, `--color-surface`, `--color-text`, `--font-sans`, `--radius-md`, `--shadow-sm`) va to'liq modulli komponent stillari.

- [ ] **Step 1: `css/variables.css` va `css/base.css` fayllarini yaratish**
  Ranglar palitrasi (toza oq, yumshoq yashil/ko'k tibbiy tuslar, yuqori kontrastli qora matn), shriftlar va reset stillari.

- [ ] **Step 2: `css/layout.css` va `css/components/*.css` fayllarini yaratish**
  Qidiruv paneli, kategoriya filtrlari (tabs/chips), so'z kartochkalari va mobil moslashuv stillarini yozish.

- [ ] **Step 3: `css/main.css` orqali barcha modullarni birlashtirish**
  `@import` orqali barcha CSS fayllarini to'g'ri tartibda yuklash.

---

### Task 3: Qidiruv Dvigateli Moduli (`search-engine.js` va `data-loader.js`)

**Files:**
- Create: `js/modules/data-loader.js`
- Create: `js/modules/search-engine.js`
- Test: `tests/test-search.js`

**Interfaces:**
- Consumes: `data/*.json`
- Produces:
  - `DataLoader.loadAll(): Promise<DictionaryEntry[]>`
  - `SearchEngine.init(entries: DictionaryEntry[]): void`
  - `SearchEngine.search(query: string, categoryFilter?: string): DictionaryEntry[]`

- [ ] **Step 1: Qidiruv mantiqi uchun test yozish**
  `tests/test-search.js`:
  - Kichik/bosh harflarni tenglashtirish ("rp" -> "Rp.").
  - Tinish belgilarisiz qidirish ("dtd" -> "D.t.d.N.").
  - O'zbekcha tarjima bo'yicha qidirish ("yurak" -> "Cor").
  - Kategoriya filtri bilan qidirish.

- [ ] **Step 2: Testni ishga tushirib, FAIL ekanini tekshirish**
  Buyruq: `node tests/test-search.js`
  Kutilgan natija: FAIL.

- [ ] **Step 3: `js/modules/data-loader.js` va `js/modules/search-engine.js` ni yaratish**
  Normalizatsiya (`normalizeText`), ikki tomonlama qidiruv indeksi va tezkor filtrlash funksiyalarini yozish.

- [ ] **Step 4: Testni qayta ishga tushirish**
  Buyruq: `node tests/test-search.js`
  Kutilgan natija: PASS.

---

### Task 4: UI Renderer va Asosiy Boshqaruvchi (`index.html`, `ui-renderer.js`, `app.js`)

**Files:**
- Create: `index.html`
- Create: `js/modules/ui-renderer.js`
- Create: `js/app.js`

**Interfaces:**
- Consumes: `SearchEngine`, `DataLoader`
- Produces: To'liq ishlaydigan foydalanuvchi interfeysi (qidiruv maydoni, natijalar ro'yxati, kategoriya tugmalari).

- [ ] **Step 1: Semantik `index.html` tuzilishini yaratish**
  Header (loyiha nomi, logotipi va qisqa shiori), Hero qidiruv maydoni, Kategoriya tugmalari, Natijalar konteyneri (`#resultsContainer`), Bo'sh holat xabarlari.

- [ ] **Step 2: `js/modules/ui-renderer.js` ni amalga oshirish**
  - `renderCards(entries)`: Lotincha so'z, kategoriya yorlig'i, o'zbekcha tarjima va oddiy izohli kartochkalarni DOM ga joylash.
  - `renderEmpty(query)`: Natija topilmaganda yordam beruvchi xabarni ko'rsatish.
  - `renderLoading()`: Yuklanish holatini ko'rsatish.

- [ ] **Step 3: `js/app.js` ni amalga oshirish**
  Modullarni yuklash, `input` hodisasini tinglash (real-time search), kategoriya bosilganda filtrlash va tozalash tugmasi mantiqi.

---

### Task 5: Offline Rejim (PWA Manifest va Service Worker)

**Files:**
- Create: `manifest.json`
- Create: `sw.js`
- Modify: `index.html` (manifest va SW ro'yxatdan o'tkazish)

**Interfaces:**
- Produces: 100% internetsiz ishlay oladigan kesh tizimi.

- [ ] **Step 1: `manifest.json` yaratish**
  Ilova nomi ("MedLatin UZ"), mavzu ranglari, mobil ekranda to'liq ekran ochilish sozlamalari (`standalone`).

- [ ] **Step 2: `sw.js` (Service Worker) yaratish**
  Barcha HTML, CSS, JS va `data/*.json` fayllarni keshga yozish (`install` bosqichida) va internetsiz holatda keshdan uzatish (`fetch` bosqichida).

- [ ] **Step 3: `index.html` da Service Worker'ni ro'yxatdan o'tkazish**
  Offline rejim ishga tushganini konsolda tekshirish kodi.

---

### Task 6: To'liq Tekshiruv va Verifikatsiya

- [ ] **Step 1: Barcha testlarni ishga tushirish**
  Buyruqlar: `node tests/validate-data.js` va `node tests/test-search.js`
- [ ] **Step 2: Brauzerda tekshirish**
  Lokal serverda sahifani ochib, retseptlar, anatomiya, klinik atamalarni qidirib ko'rish va offline rejimini sinash.
