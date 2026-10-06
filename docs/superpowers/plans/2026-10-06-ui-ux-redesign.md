# MedLatin UZ UI/UX Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** MedLatin UZ platformasini zamonaviy, qorong'u/yorug' rejimli, Iconify SVG ikonalari, guruhlangan iyerarxik filtrlar, qidiruv matnini bo'yash, nusxa olish va sevimlilar (xatcho'p) imkoniyatlariga ega yuqori darajadagi tibbiy PWA ilovasiga aylantirish.

**Architecture:** Modulli Vanilla arxitektura saqlanadi. Yangi `ThemeManager` va `BookmarkManager` mustaqil ES6 modullari yaratiladi. `variables.css` kengaytirilib `data-theme` selektorlari qo'shiladi. Kartochkalar renderingi `UIRenderer` ichida Iconify va interaktiv hodisalar bilan boyitiladi.

**Tech Stack:** Vanilla HTML5, Vanilla CSS3 (Custom Properties), Vanilla JavaScript (ES6 Modules), Iconify SVG Web Component, Service Worker (Cache API), LocalStorage.

**Spec:** [docs/superpowers/specs/2026-10-06-ui-ux-redesign.md](file:///d:/MedLatinUz/docs/superpowers/specs/2026-10-06-ui-ux-redesign.md)

## Global Constraints

- 100% Vanilla HTML/CSS/JavaScript (runtime freymvorklarsiz).
- 100% offline PWA qo'llab-quvvatlash (`sw.js` yangilanadi).
- WCAG AA kontrast minimal `4.5:1` (Light va Dark rejimlar uchun).
- Ikonalar emojilar/stikerlar emas, toza Iconify SVG lari orqali chiqariladi.
- Barcha mavjud 23 ta ma'lumot fayli va qidiruv tizimi testlari buzilmasligi shart (`npm test` har doim yashil).

## Review Focus

1. **Dark/Light rejim saqlanishi**: Foydalanuvchi sahifani yangilaganda yoki qayta ochganda tanlangan mavzu `localStorage`dan to'g'ri tiklanishi.
2. **Offline Iconify ko'rinishi**: Internet bo'lmaganda ham ikonalar g'oyib bo'lmasdan keshdan yoki SVG zaxiradan to'liq ochilishi.
3. **Qidiruv so'zini bo'yash (`highlight`)**: Tinish belgilari yoki bosh/kichik harflar bo'lishidan qat'i nazar (masalan, `Rp.` yoki `aorta`) to'g'ri so'z qismini `<mark>` bilan bo'yashi.
4. **Xatcho'plar (Bookmarks)**: Sevimlilar bosilganda `localStorage`ga yozilishi va "Tanlanganlar" tabida to'g'ri filtrlana olishi.
5. **Nusxa olish (Copy)**: Kartochkadagi atama va tarjimani buferga ko'chirish va toast xabari chiqishi.

---

### Task 1: Tungi va Kunduzgi Mavzu Tizimi (ThemeManager & CSS Tokens)

**Files:**
- Modify: `css/variables.css`
- Create: `css/components/theme-toggle.css`
- Create: `js/modules/theme-manager.js`
- Test: `tests/test-theme.js`

- [ ] **Step 1: Test yozish (`tests/test-theme.js`)**
  `ThemeManager` klassi uchun birlik test: `getTheme()`, `setTheme('dark' | 'light')`, `toggleTheme()`, va `localStorage` bilan ishlashini tekshirish.
- [ ] **Step 2: Testni ishga tushirib FAIL ekanini ko'rish**
  Buyruq: `node tests/test-theme.js`
  Kutilgan natija: FAIL (`ThemeManager` hali yaratilmagan).
- [ ] **Step 3: `css/variables.css` ni `data-theme` atributlari bilan yangilash**
  `:root[data-theme="light"]` va `:root[data-theme="dark"]` tokenlari, yuqori kontrastli fon, matn va kartochka ranglari.
- [ ] **Step 4: `css/components/theme-toggle.css` yaratish**
  Headerdagi Quyosh/Oy o'tish tugmasi stillari va mikro-animatsiyalari.
- [ ] **Step 5: `js/modules/theme-manager.js` ni yaratish**
  Tizim afzalligini tekshirish, `localStorage`ga saqlash va `document.documentElement.setAttribute('data-theme', theme)` mantiqi.
- [ ] **Step 6: Testni qayta ishga tushirish**
  Buyruq: `node tests/test-theme.js`
  Kutilgan natija: PASS.
- [ ] **Step 7: `css/main.css` ga `@import './components/theme-toggle.css';` qo'shish**

---

### Task 2: Iconify Kutubxonasi va Offline PWA Kesh Integratsiyasi

**Files:**
- Modify: `index.html`
- Modify: `sw.js`

- [ ] **Step 1: `index.html` ga Iconify skriptini qo'shish**
  `<script src="https://code.iconify.design/iconify-icon/2.1.0/iconify-icon.min.js"></script>` ni `<head>` qismiga joylash.
- [ ] **Step 2: `sw.js` kesh ro'yxatini yangilash**
  Iconify CDN manzili va yangi CSS komponent fayllarini `ASSETS_TO_CACHE` ro'yxatiga kiritish va `CACHE_NAME`ni `medlatin-v7`ga yangilash.
- [ ] **Step 3: Headerdagi logotip va mavzu tugmasini Iconify bilan boyitish**
  Headerga `themeToggleBtn` tugmasini qo'shish (quyosh/oy ikonasi bilan).

---

### Task 3: Tanlanganlar (Bookmarks) Moduli va Mini-Toast Bildirishnomasi

**Files:**
- Create: `js/modules/bookmark-manager.js`
- Create: `css/components/toast.css`
- Test: `tests/test-bookmarks.js`

- [ ] **Step 1: Test yozish (`tests/test-bookmarks.js`)**
  `BookmarkManager` uchun testlar: `getAll()`, `isBookmarked(id)`, `add(id)`, `remove(id)`, `toggle(id)`.
- [ ] **Step 2: Testni ishga tushirib FAIL ekanini ko'rish**
  Buyruq: `node tests/test-bookmarks.js`
  Kutilgan natija: FAIL.
- [ ] **Step 3: `js/modules/bookmark-manager.js` ni yaratish**
  Xatcho'plarni `medlatin_bookmarks` kaliti bilan `localStorage`da xavfsiz boshqarish.
- [ ] **Step 4: `css/components/toast.css` yaratish**
  Ekranning pastki o'ng qismida silliq paydo bo'lib yo'qoluvchi "Nusxalandi!" bildirishnomasi.
- [ ] **Step 5: `css/main.css` ga `@import './components/toast.css';` qo'shish**
- [ ] **Step 6: Testni qayta ishga tushirish**
  Buyruq: `node tests/test-bookmarks.js`
  Kutilgan natija: PASS.

---

### Task 4: Iyerarxik Guruhlangan Filtrlar va Mashhur So'rov Chiplari

**Files:**
- Modify: `css/components/filters.css`
- Modify: `css/components/search-bar.css`
- Modify: `index.html`

- [ ] **Step 1: `index.html` dagi 16 ta filtrlarni 5 ta asosiy guruh va sub-chiplarga o'zgartirish**
  1. `all` (Barchasi)
  2. `prescription` (Retseptlar)
  3. `anatomy_group` (Anatomiya - tanlanganda sub-chiplar ochiladi: *Barchasi, Tizimlar, Sohalar, Mushaklar, Suyaklar, Nervlar, Tomirlar, A'zolar, Bezlar, Bo'g'imlar*)
  4. `clinical` (Klinika)
  5. `latin_group` (Lotin tili - *Barchasi, Otlar, Sifatlar, Fe'llar*)
  6. `bookmarks` (Tanlanganlar ⭐)
- [ ] **Step 2: `index.html` ga Discovery Chips qo'shish**
  Qidiruv ostiga mashhur so'rovlar: `Rp.`, `D.t.d.N.`, `Aorta`, `Gastritis`, `Biceps`, `Cor`.
- [ ] **Step 3: `css/components/filters.css` stillarini boyitish**
  Asosiy tablar va ochiluvchi sub-chiplar uchun zamonaviy dizayn.
- [ ] **Step 4: `css/components/search-bar.css` ga `Ctrl+K` nishoni va chiplar stillarini qo'shish**

---

### Task 5: So'z Kartochkalari 2.0 (Highlight, Copy, Star, Rx Watermark)

**Files:**
- Modify: `js/modules/search-engine.js`
- Modify: `css/components/word-card.css`
- Modify: `js/modules/ui-renderer.js`

- [ ] **Step 1: `search-engine.js` ga `highlightMatch(text, query)` funksiyasini qo'shish**
  Tinish belgilariga qaramasdan qidirilgan qismni xavfsiz `<mark class="search-highlight">` ga olish.
- [ ] **Step 2: `word-card.css` ga yangi stillarni qo'shish**
  - `<mark.search-highlight>` stili (och sariq/oltin fon, qora matn).
  - Kartochka burchagidagi nusxa olish (`.card-action-btn.copy-btn`) va yulduzcha (`.card-action-btn.star-btn`) tugmalari.
  - Retsept kartochkalari foni uchun nafis yarim-shaffof `℞` farmatsevtik belgisi.
- [ ] **Step 3: `ui-renderer.js` ni yangilash**
  Har bir kartochkaga Iconify ikonalari (`lucide:copy`, `lucide:star`), highlight matni, nusxa olish va sevimlilar funksionalligini ulash.
- [ ] **Step 4: Mini-toast chiqarish funksiyasini `UIRenderer.showToast(message)` orqali joriy qilish**

---

### Task 6: Boshqaruvchi (Controller) Integratsiyasi, Klaviatura Shortcuts va Dinamik PWA Holati

**Files:**
- Modify: `js/app.js`
- Modify: `index.html`
- Test: `npm test`

- [ ] **Step 1: `js/app.js` da barcha modullarni birlashtirish**
  - `ThemeManager.init()` ni ulash va tugmaga hodisa bog'lash.
  - `BookmarkManager` orqali saqlanganlarni filtrlash.
  - Sub-filtrlar tanlanganda `SearchEngine`ga tegishli toifani uzatish.
  - `Ctrl + K` va `/` tugmalarini qidiruvga yo'naltirish (`keydown` tinglovchisi).
  - Discovery chiplari bosilganda avtomatik qidiruvni ishga tushirish.
- [ ] **Step 2: Dinamik Onlayn/Offlayn indikatorini ulash**
  `window.addEventListener('online', ...)` va `offline` hodisalarida headerdagi nishonni yangilash.
- [ ] **Step 3: Loyihaning barcha testlarini ishga tushirish**
  Buyruq: `npm test`
  Kutilgan natija: Barcha ma'lumotlar va qidiruv testlari 100% PASS.
- [ ] **Step 4: Yakuniy tekshiruv va verifikatsiya**
