# 🖼️ Venom Image Generation Workflow

## Directory Structure

```
ai-generated-images/
└── venom/
    ├── hero/          # Scene 1: The Signature
    ├── overhead/      # Scene 2: The Crown
    ├── broken/        # Scene 3: The Break
    ├── flatlay/       # Scene 4: The Four
    ├── powder/        # Scene 5: The Powder Fall
    └── texture/       # Scene 6: The Macro
```

---

## How to Generate Images in Google AI Studio

### Step 1: Open Google AI Studio
1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Click **Generate media** → **Image**

### Step 2: Settings (Apply Once)
- **Model:** `Imagen 4 Ultra`
- **Images per run:** `4`
- **Quality:** `2K resolution`
- **Format:** `PNG` (download, don't use JPEG)

### Step 3: Generate Each Scene

For each scene below:
1. Copy the **PROMPT** from `docs/image-generation/venom-ai-image-guide.md`
2. Set the **ASPECT RATIO** as specified
3. Paste the **NEGATIVE PROMPT** in the negative field (if available)
4. Click **Generate**
5. Wait for 4 images to render
6. **Choose the best one** (look for: crisp detail, correct contrast, consistent cookie appearance)
7. Download as PNG
8. **Rename** using the pattern below
9. Save to the corresponding folder

---

## Naming Convention

Once you download each image, rename it using this pattern:

```
venom-{scene}-variation-{number}.png
```

**Examples:**
- `venom-hero-variation-1.png` (first best from hero scene)
- `venom-hero-variation-2.png` (second best from hero scene)
- `venom-overhead-variation-1.png` (first best from overhead scene)
- etc.

**Recommended: Generate 2–4 variations per scene** so you have choices when uploading to Cloudinary.

---

## Scene-by-Scene Guide

### SCENE 1: The Signature (`/hero`)
- **Aspect Ratio:** `1:1` (1024×1024px)
- **Use on:** Shop page, Build Your Box, main listing
- **Find prompt:** Line ~25 in `docs/image-generation/venom-ai-image-guide.md`
- **Quality check:**
  - ✅ Cookie perfectly centred
  - ✅ 75% of frame occupied
  - ✅ Crisp white powder detail
  - ✅ Black shadow well-defined
  - ✅ No visible hand/spoon/tools

---

### SCENE 2: The Crown (`/overhead`)
- **Aspect Ratio:** `1:1` (1024×1024px)
- **Use on:** Product detail carousel, hover image
- **Find prompt:** Line ~45 in `docs/image-generation/venom-ai-image-guide.md`
- **Quality check:**
  - ✅ Perfect circular symmetry
  - ✅ Crinkle pattern radiates evenly
  - ✅ 80% of frame occupied
  - ✅ Top-down angle (no tilt)
  - ✅ Powder crystals visible

---

### SCENE 3: The Break (`/broken`)
- **Aspect Ratio:** `4:3` (1280×960px)
- **Use on:** Product detail gallery
- **Find prompt:** Line ~67 in `docs/image-generation/venom-ai-image-guide.md`
- **Quality check:**
  - ✅ Clean break (not jagged)
  - ✅ Two halves separated naturally
  - ✅ Interior fudgy texture visible
  - ✅ Sugar dust around pieces
  - ✅ Shadows define the interior

---

### SCENE 4: The Four (`/flatlay`)
- **Aspect Ratio:** `16:9` (1408×768px)
- **Use on:** Social share, homepage banner
- **Find prompt:** Line ~89 in `docs/image-generation/venom-ai-image-guide.md`
- **Quality check:**
  - ✅ Four distinct cookies
  - ✅ Organic cluster (not rigid grid)
  - ✅ Left 2/3 occupied, right 1/3 negative space
  - ✅ Sugar dust scattered
  - ✅ All cookies in sharp focus

---

### SCENE 5: The Powder Fall (`/powder`)
- **Aspect Ratio:** `1:1` (1024×1024px)
- **Use on:** Product carousel, social posts
- **Find prompt:** Line ~111 in `docs/image-generation/venom-ai-image-guide.md`
- **Quality check:**
  - ✅ Sugar particles visible mid-air
  - ✅ Particles catching light
  - ✅ Cookie in focus, sugar sharp
  - ✅ Cinematic lighting from upper-left
  - ✅ 65% of frame cookie

---

### SCENE 6: The Macro (`/texture`)
- **Aspect Ratio:** `4:3` (1280×960px)
- **Use on:** Product detail carousel
- **Find prompt:** Line ~133 in `docs/image-generation/venom-ai-image-guide.md`
- **Quality check:**
  - ✅ Surface fills entire frame
  - ✅ Cracks and fissures sharp
  - ✅ Sugar crystals visible as individuals
  - ✅ Raking light reveals texture depth
  - ✅ Slight dark charcoal edge visible

---

## Quality Assurance Checklist

Before saving each image:

- [ ] **No text or watermark visible**
- [ ] **Cookie looks identical to reference** (same shape, crinkle pattern, sugar coating)
- [ ] **Colours are accurate** (pure black background, #1A0A00 chocolate, white powder)
- [ ] **Lighting is consistent** (single key light, defined shadows)
- [ ] **Resolution is clean** (no pixelation, no AI artifacts)
- [ ] **Contrast is crisp** (sugar pops against chocolate)

---

## After All Images Are Generated

1. **Verify folder structure:**
   ```
   ai-generated-images/venom/
   ├── hero/        (contains: venom-hero-variation-1.png, venom-hero-variation-2.png, etc.)
   ├── overhead/    (contains: venom-overhead-variation-1.png, etc.)
   ├── broken/      (contains: venom-broken-variation-1.png, etc.)
   ├── flatlay/     (contains: venom-flatlay-variation-1.png, etc.)
   ├── powder/      (contains: venom-powder-variation-1.png, etc.)
   └── texture/     (contains: venom-texture-variation-1.png, etc.)
   ```

2. **Upload to Cloudinary:**
   - Go to [Cloudinary Dashboard](https://cloudinary.com/console)
   - Create folder: `/haiq/products/venom/`
   - Upload best variation from each scene
   - Organize by scene in Cloudinary (e.g., `/haiq/products/venom/hero/`, `/haiq/products/venom/overhead/`, etc.)

3. **Add to Product DB:**
   - Admin → Products → Venom
   - Upload Scene 1 (hero) as `sort_order: 0`
   - Upload Scenes 2–6 as `sort_order: 1–5`

---

## Pro Tips

### Consistency Across Generations
- **Lock the seed:** Once you find a great result, note the seed number at the bottom of the AI Studio interface
- **Re-use the seed:** For variations, use the same seed with minimal prompt tweaks
- This keeps the cookie appearance consistent across scenes

### Iterating on a Scene
If a generated image is close but not quite right:
1. Regenerate with the same seed
2. Make a small prompt adjustment (e.g., "increase the powder contrast" or "sharper crinkle detail")
3. Keep tweaking until you get a winner

### Downloading Tips
- Right-click the best image → **Save image as**
- Choose **PNG** format from the file dialog
- Don't rename it yet in the browser — rename after download to your local folder

---

## Estimated Time

- **Per scene:** ~3–5 minutes (generate 4 images, choose 1, rename, save)
- **All 6 scenes:** ~20–30 minutes
- **With variations (2–3 per scene):** ~40–60 minutes total

---

## Troubleshooting

### "Image looks wrong" — Cookie doesn't match reference
- **Regenerate** with the same seed
- Check negative prompt is applied: `text, watermark, logo, etc.`
- Reduce quality boosters if output looks "muddy"

### "Colors are off" — Background isn't pure black, powder isn't white enough
- The prompt includes color specs, but Imagen 4 sometimes drifts
- Try regenerating with small tweaks: `"pure jet black background"` instead of `"pure matte black"`
- Or increase contrast in your image editor after download (minimal tweaks only)

### "Seed isn't locked/persisting"
- Seeds in AI Studio are transient; note the number manually if you find a winner
- Imagen 4 doesn't guarantee identical output even with the same seed, but it reduces drift

---

## Questions?

Refer back to:
- **Full prompts:** `docs/image-generation/venom-ai-image-guide.md`
- **Platform guide:** Google's [Imagen 4 documentation](https://cloud.google.com/vertex-ai/generative-ai/docs/image/img-gen-prompt-guide)
