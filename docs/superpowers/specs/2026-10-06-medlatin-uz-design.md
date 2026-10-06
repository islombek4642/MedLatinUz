# MedLatin UZ - Tibbiy Lotincha-O'zbekcha Lug'at Platformasi
**Texnik Dizayn Hujjati (Design Specification)**  
**Sana**: 2026-10-06  
**Holat**: Ko'rib chiqish bosqichida

---

## 1. Muammo va Maqsad

### 1.1 Muammo
Oddiy fuqarolar, bemorlar va hatto boshlang'ich tibbiyot talabalari shifokorlar retseptlarida, tibbiy ko'chirmalarda (epikriz) yoki tashxislarda yoziladigan lotincha atamalarni, dori qisqartmalarini tushunishda qiynalishadi. Mavjud lotincha lug'atlar (masalan, `latin.html` dagi klassik Latdict ro'yxati) umumiy lotin tili bo'lib, ularda o'zbekcha tarjimalar, retsept qisqartmalari va sodda tushuntirishlar yo'q.

### 1.2 Maqsad
Foydalanuvchi lotincha atama yoki shifokor retseptidagi so'zni kiritganda, unga so'zning:
1. **Lotincha to'g'ri shakli**;
2. **Kategoriyasi** (Retsept, Anatomiya, Klinik tashxis, Umumiy);
3. **O'zbekcha aniq tarjimasi**;
4. **Oddiy va tushunarli xalq tilidagi ta'rifi (izohi)**ni ko'rsatib beruvchi, to'liq **offline** ishlay oladigan zamonaviy Web ilova yaratish.

Kelajakda ushbu tizimga Telegram bot va butun retsept matnini tahlil qiluvchi modul qo'shilishi mumkin.

---

## 2. Texnologiyalar va Cheklovlar

- **Front-end**: Sof Vanilla HTML5, Vanilla CSS3, Vanilla JavaScript (ES6+ Modules).
- **Freymvorklar**: Ishlatilmaydi (ortiqcha yuk va sekinlashuvsiz).
- **Offline qo'llab-quvvatlash**: Service Worker (Cache API) va PWA Manifest.
- **Ma'lumotlar saqlash**: Modulli JSON fayllar (kelajakda SQLite yoki backend API'ga osongina o'tkazish mumkin bo'lgan tuzilma).

---

## 3. Loyiha va Fayllar Strukturasi

Loyiha to'liq modulli prinsip asosida tuziladi:

```
MedLatin-UZ/
│
├── index.html                   # Semantik asosiy sahifa
├── manifest.json                # PWA sozlamalari
├── sw.js                        # Offline ishlash uchun Service Worker
│
├── css/                         # Modulli CSS arxitekturasi
│   ├── main.css                 # Barcha CSS modullarini ulovchi markaz
│   ├── variables.css            # Ranglar, shriftlar, o'lchamlar (Design Tokens)
│   ├── base.css                 # Reset va asosiy body/matn stillari
│   ├── layout.css               # Header, container, footer va sahifa joylashuvi
│   └── components/
│       ├── search-bar.css       # Qidiruv paneli va kiritish maydoni
│       ├── word-card.css        # Natija kartochkalari va kategoriya nishonlari
│       ├── modal.css            # So'zning batafsil ta'rif darchasi
│       ├── filters.css          # Kategoriya va alifbo filtrlari
│       └── responsive.css       # Mobil va planshet ekranlar moslashuvi
│
├── js/                          # Modulli JavaScript arxitekturasi
│   ├── app.js                   # Asosiy kirish nuqtasi (Controller)
│   └── modules/
│       ├── data-loader.js       # JSON modullarini yuklash va xotirada saqlash
│       ├── search-engine.js     # Aqlli qidiruv indeksi, filtrlash, xatolikka chidamlilik
│       └── ui-renderer.js       # Kartochkalar, modallar va xabarlarni DOM'da chizish
│
└── data/                        # Modulli ma'lumotlar bazasi
    ├── prescriptions.json       # Retsept qisqartmalari va farmatsevtik atamalar
    ├── anatomy.json             # Inson tana a'zolari va anatomik atamalar
    ├── clinical.json            # Kasalliklar, tashxislar va klinik belgilar
    └── general.json             # Umumiy lotincha so'zlar
```

---

## 4. Ma'lumotlar Modeli (Data Schema)

Foydalanuvchi talabiga ko'ra, dastlabki bosqichda ma'lumotlar modeli ixcham va eng zarur 4 ta ustunga qaratiladi (talaffuz va boshqa murakkab elementlar keyingi bosqichlarga qoldiriladi):

```json
{
  "id": "rec_001",
  "latin": "Rp.",
  "category": "prescription",
  "translation_uz": "Ol / Oling (Retsept)",
  "definition_uz": "Shifokor farmatsevtga dori vositasini berishni buyuruvchi ko'rsatma. Har qanday retseptning boshlanishi."
}
```

### Kategoriyalar ro'yxati:
1. `prescription` — Retsept qisqartmalari (`Rp.`, `D.t.d.N.`, `sol.`, `in tab.`, `per os`);
2. `anatomy` — Inson tanasi a'zolari (`Cor`, `Cranium`, `Musculus`, `Ren`);
3. `clinical` — Kasalliklar va belgilar (`Cephalalgia`, `Gastritis`, `Bronchitis`);
4. `general` — Umumiy lotincha so'zlar.

---

## 5. Qidiruv va Interfeys Funksionalligi

### 5.1 Qidiruv tajribasi:
- Harf yozilishi bilanoq natijalar dinamik yangilanadi (real-time filtering).
- So'z boshidan yoki ichidan qidirish (Substring & Prefix).
- Lotincha atama bo'yicha ham, o'zbekcha tarjimasi bo'yicha ham qidirish (Ikki tomonlama).
- Katta-kichik harflar va tinish belgilariga sezgir bo'lmagan qidiruv (`rp.` = `Rp` = `RP`).

### 5.2 Foydalanuvchi interfeysi (UI):
- **Hero / Qidiruv bloki**: Katta, markaziy, qulay qidiruv qutisi va tozalash tugmasi.
- **Kategoriya filtrlari (Chips/Tabs)**: Barchasi | Retseptlar | Anatomiya | Klinika | Umumiy.
- **Natijalar ro'yxati**: 
  - Har bir natija alohida zamonaviy kartochka ko'rinishida:
    - Yuqori qismida: Lotincha so'z va Kategoriya yorlig'i (badge).
    - O'rtada: O'zbekcha qisqa va aniq tarjimasi.
    - Pastida: Oddiy odam tushunadigan sodda ta'rif (izoh).
- **Responsive dizayn**: Smartfonlarda bir qo'l bilan boshqarishga qulay mobil interfeys.

---

## 6. Offline va Kengaytirish Imkoniyatlari

1. **Offline ishlash**: Service Worker barcha statik resurslar va `data/*.json` fayllarni keshlaydi. Internet o'chgan taqdirda ham dastur to'liq quvvatda ishlaydi.
2. **Telegram botga ulanish**: `data/` papkasidagi JSON fayllar standart JSON formatida bo'lgani sababli, ularni kelajakda Telegram bot skriptiga to'g'ridan-to'g'ri o'qitish mumkin.
3. **B rejimi (Retsept tahlilchisi)**: Kelajakda `js/modules/prescription-parser.js` qo'shilganda arxitekturani o'zgartirish talab qilinmaydi.
