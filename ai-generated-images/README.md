# 🍪 Venom AI Image Generation Project

## What's Here

This folder contains everything you need to generate professional product images for the **Venom** cookie using Google AI Studio (Imagen 4).

```
ai-generated-images/
├── README.md                          (you are here)
├── QUICK_REFERENCE.md                 (quick copy-paste prompts)
├── GENERATION_WORKFLOW.md             (detailed step-by-step guide)
└── venom/
    ├── hero/                          (Scene 1: The Signature)
    ├── overhead/                      (Scene 2: The Crown)
    ├── broken/                        (Scene 3: The Break)
    ├── flatlay/                       (Scene 4: The Four)
    ├── powder/                        (Scene 5: The Powder Fall)
    └── texture/                       (Scene 6: The Macro)
```

---

## 📋 What to Do

### Step 1: Read the Full Guide (5 min)
Open **`GENERATION_WORKFLOW.md`** — it has:
- Detailed instructions for each scene
- Quality checks to look for
- Troubleshooting tips
- Folder structure explanation

### Step 2: Open Google AI Studio (1 min)
Go to [aistudio.google.com](https://aistudio.google.com) → **Generate media** → **Image**

### Step 3: Generate Images (30–60 min)
For each of the 6 scenes:
1. Open **`QUICK_REFERENCE.md`** in a side window
2. Set aspect ratio (1:1, 4:3, or 16:9 depending on scene)
3. Copy the PROMPT from Quick Reference
4. Paste into AI Studio
5. Paste NEGATIVE prompt (if field available)
6. Click **Generate**
7. Choose the best of 4 images
8. Download as PNG
9. Rename using pattern: `venom-{scene}-variation-{number}.png`
10. Save to corresponding folder in `/venom/{scene-name}/`

### Step 4: Generate 2–3 Variations Per Scene (Optional but Recommended)
Repeat Step 3 for each scene 2–3 times to get variations, then choose the best ones to upload to Cloudinary.

### Step 5: Upload to Cloudinary
Once done:
1. Go to [Cloudinary Dashboard](https://cloudinary.com/console)
2. Create folder: `/haiq/products/venom/`
3. Upload best version of each scene:
   - Scene 1 (hero) → `sort_order: 0`
   - Scenes 2–6 → `sort_order: 1–5`

### Step 6: Add to Product Database
1. Admin Dashboard → **Products** → **Venom**
2. Add the Cloudinary URLs to the product image gallery
3. Images will automatically appear on shop page, product detail page, and Build Your Box selector

---

## 📖 Quick Reference for Each Scene

| Scene | Folder | Aspect | Use | Key Feature |
|-------|--------|--------|-----|-------------|
| The Signature | `/hero` | 1:1 | Main product card, shop listing | Centred cookie, crisp lighting |
| The Crown | `/overhead` | 1:1 | Carousel 2nd image, hover | Top-down radial crinkle pattern |
| The Break | `/broken` | 4:3 | Carousel interior reveal | Split in half, fudgy interior |
| The Four | `/flatlay` | 16:9 | Social share, banner | Four cookies in cluster |
| The Powder Fall | `/powder` | 1:1 | Carousel dynamic shot | Powdered sugar particles falling |
| The Macro | `/texture` | 4:3 | Carousel texture detail | Extreme close-up surface |

---

## ⚙️ Settings (Set Once)

In Google AI Studio:
- **Model:** `Imagen 4 Ultra` (highest quality)
- **Images per run:** `4` (choose the best)
- **Quality:** `2K resolution`
- **Format:** `PNG` (not JPEG — lossless for web)

---

## 📝 Naming Convention

When you download, rename each image:

```
venom-{scene-name}-variation-{number}.png
```

**Examples:**
```
venom-hero-variation-1.png              ← 1st attempt at scene 1
venom-hero-variation-2.png              ← 2nd attempt at scene 1
venom-overhead-variation-1.png          ← 1st attempt at scene 2
venom-broken-variation-1.png            ← 1st attempt at scene 3
venom-flatlay-variation-1.png           ← 1st attempt at scene 4
venom-powder-variation-2.png            ← 2nd attempt at scene 5
venom-texture-variation-1.png           ← 1st attempt at scene 6
```

**Recommended:** Generate 2–3 variations per scene so you have choices.

---

## ✅ Quality Checklist

Before saving each image, verify:

- [ ] **No text, watermark, or logo visible**
- [ ] **Cookie shape matches reference** (domed hemisphere, crinkled)
- [ ] **Powder is crisp white**, chocolate is near-black
- [ ] **Background is pure matte black** (no texture, no gradient)
- [ ] **Single hard key light** from upper-left
- [ ] **Sharp focus** on cookie detail
- [ ] **Aspect ratio correct** (1:1, 4:3, or 16:9)
- [ ] **No visible hands, spoons, or tools**
- [ ] **No cartoon or illustration style**

---

## 🚀 Expected Timeline

- **Per scene (1 generation):** 3–5 minutes
- **All 6 scenes (1 version each):** 20–30 minutes
- **With 2–3 variations per scene:** 40–60 minutes

---

## 📚 Reference Documents

In the project docs:
- **Full prompts:** `docs/image-generation/venom-ai-image-guide.md`
- **Detailed workflow:** `GENERATION_WORKFLOW.md` (in this folder)
- **Quick copy-paste:** `QUICK_REFERENCE.md` (in this folder)

---

## 🎯 Next Steps After Generation

1. **Download all images** to the appropriate `/venom/{scene}/` folders
2. **Choose best variations** (1–2 per scene)
3. **Upload to Cloudinary** (or ask your team to do it)
4. **Add to Venom product** in Admin dashboard
5. **Verify on live site** (shop page, product detail, Build Your Box)

---

## ❓ Need Help?

**Images don't look right?**
- See **Troubleshooting** section in `GENERATION_WORKFLOW.md`

**Forgot a prompt?**
- Open `QUICK_REFERENCE.md` (quick copy-paste)
- Or `docs/image-generation/venom-ai-image-guide.md` (full guide)

**Settings question?**
- Google's [Imagen 4 Documentation](https://cloud.google.com/vertex-ai/generative-ai/docs/image/img-gen-prompt-guide)

---

## 📂 Folder Checklist

When done, your folders should look like:

```
ai-generated-images/venom/
├── hero/
│   ├── venom-hero-variation-1.png
│   ├── venom-hero-variation-2.png
│   └── venom-hero-variation-3.png
├── overhead/
│   ├── venom-overhead-variation-1.png
│   ├── venom-overhead-variation-2.png
│   └── venom-overhead-variation-3.png
├── broken/
│   ├── venom-broken-variation-1.png
│   └── venom-broken-variation-2.png
├── flatlay/
│   ├── venom-flatlay-variation-1.png
│   └── venom-flatlay-variation-2.png
├── powder/
│   ├── venom-powder-variation-1.png
│   ├── venom-powder-variation-2.png
│   └── venom-powder-variation-3.png
└── texture/
    ├── venom-texture-variation-1.png
    └── venom-texture-variation-2.png
```

---

**Ready to generate?** Start with `QUICK_REFERENCE.md` open in one window and `GENERATION_WORKFLOW.md` in another. Good luck! 🍪
