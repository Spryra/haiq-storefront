# 🍪 Venom — Image Generation Master Guide

## Cookie Analysis (What We're Replicating)

From the reference image, the Venom cookie is:
- **Form:** A perfectly domed hemisphere — no flat base visible, pure round silhouette
- **Surface:** Deeply crinkled/cracked exterior — fissures radiate outward from centre like a dark starburst
- **Coating:** Heavy powdered sugar — pure white on peaks and ridges, dark near-black chocolate exposed deep in the crevices. This contrast IS the identity of the cookie
- **Colour:** Near-black dark chocolate base, #1A0A00-level darkness, not brown
- **Backdrop:** Pure matte black — zero texture, zero gradient, just void
- **Surface it rests on:** Dark charcoal/black matte textured surface (appears to be dark fabric or matte board)
- **Lighting:** Single dramatic key light from upper-left — hard but refined, creates a strong directional shadow falling lower-right, cookie glows on its lit side
- **Framing:** Fills 75–80% of the frame, centred, slight 3/4 elevation angle (roughly 45°)
- **Depth of field:** Very shallow — the background is pure black, no distraction

---

## Platform Setup (Google AI Studio)

> ⚠️ Imagen 3 is deprecated — you're now on **Imagen 4**. Here's how to maximise it:

| Setting | What to select |
|---|---|
| **Model** | `Imagen 4 Ultra` — highest detail, best for print/web |
| **Images per run** | **4** — always generate 4 and choose the best |
| **Quality** | 2K resolution where available |
| **Format** | Download as PNG (not JPEG) for upload to Cloudinary — lossless |
| **Access** | [aistudio.google.com](https://aistudio.google.com) → Generate media → Image |
| **Seed** | Lock a seed once you find a great result — re-use it with small prompt edits to maintain consistency across scenes |

### Prompting Rules for Imagen 4

- Begin with `"A photo of..."` — triggers the photorealistic engine
- Keep constraint statements positive: `"pure black background"` rather than `"no background"`
- Layer in camera specs explicitly: focal length + aperture + shot type
- Use 2–3 quality boosters max: `"award-winning food photography, 4K HDR, hyperrealistic"` — don't stack more or it gets muddy
- Negative prompt field (if available): `"text, watermark, logo, human hands, blurry, cartoon, illustration, multiple cookies visible"`

---

## Image Use Cases on the HAIQ Website

From the codebase, these are every place a Venom image appears:

| Location | File Reference | Rendered Size | Aspect | Priority |
|---|---|---|---|---|
| Shop page product card | `/images/products/venom.jpg` | ~400–600px square | **1:1** | 🔴 Critical |
| Build Your Box selector | `/images/products/venom.jpg` | ~280px square | **1:1** | 🔴 Critical |
| Product detail carousel (main) | Cloudinary URL | ~600–800px | **1:1** | 🔴 Critical |
| Product card hover (2nd image) | Cloudinary URL | ~400–600px square | **1:1** | 🟠 High |
| Product detail gallery thumbs | Cloudinary URL | 80×80px | **1:1** | 🟡 Medium |
| Cart drawer thumbnail | Same main image | 64×64px | **1:1** | 🟡 Auto |
| OG/Social share | SEO component | 1200×630px | **16:9** | 🟠 High |
| Admin analytics thumbnail | Cloudinary URL | ~80px | **1:1** | 🟢 Low |

---

## The 6 Scenes — Full Prompts & Specs

---

### **SCENE 1 — The Signature** 
*(Primary product image — mirrors the reference photo)*

**File name:** `venom-hero.png`
**Aspect:** `1:1` → `1024×1024px`
**Use on:** Shop page card, Build Your Box selector, main listing image

**PROMPT:**
```
A photo of a single dark chocolate crinkle cookie, perfectly domed hemisphere shape, 
deeply cracked and fissured surface radiating outward from the centre, heavily coated 
with thick white powdered sugar sitting on peaks and exposing near-black dark chocolate 
in the crevices, dramatic white-on-dark contrast, cookie centred and occupying 75 percent 
of the frame, pure matte black void background, dark charcoal matte textured surface, 
single hard key light from upper-left casting directional shadow to lower-right, 
3/4 elevation angle, 85mm macro lens, f/2.8 aperture, shallow depth of field, 
ultra high definition, award-winning commercial food photography, hyperrealistic, 4K HDR
```

**NEGATIVE PROMPT:**
```
text, watermark, logo, multiple cookies, human hands, cartoon, illustration, 
bright background, colourful, blurry, brown background
```

---

### **SCENE 2 — The Crown** 
*(Overhead angle — shows full dome + crinkle pattern)*

**File name:** `venom-overhead.png`
**Aspect:** `1:1` → `1024×1024px`
**Use on:** Product detail carousel (second slide), hover image on product card

**PROMPT:**
```
A photo of a single dark chocolate crinkle cookie photographed from directly above, 
perfectly circular dome viewed top-down, the crinkle crack pattern radiates symmetrically 
outward from the centre like a starburst, thick white powdered sugar coating contrasts 
starkly against near-black chocolate crevices, centred occupying 80 percent of frame, 
pure matte black void background with cookie resting on dark matte surface, 
overhead flat lay with a single diffused key light from the upper-left creating 
subtle texture-revealing shadows, 100mm macro lens, f/5.6 aperture, 
dead-sharp focus across entire surface, commercial food photography, hyperrealistic, 
award-winning, 4K HDR
```

**NEGATIVE PROMPT:**
```
text, watermark, angle, tilt, side view, multiple cookies, human hands, blurry, cartoon
```

---

### **SCENE 3 — The Break** 
*(Interior reveal — fudgy dark chocolate inside)*

**File name:** `venom-broken.png`
**Aspect:** `4:3` → `1280×960px`
**Use on:** Product detail carousel (third slide / gallery), shows the interior quality

**PROMPT:**
```
A photo of a dark chocolate crinkle cookie broken cleanly in half, the two halves 
resting apart on a dark matte black surface revealing a dense fudgy near-black 
chocolate interior with a moist glistening crumb structure, thick white powdered sugar 
coating visible on the domed exterior of each half, fine powdered sugar dust settling 
around the broken pieces, pure matte black void background, dramatic hard side light 
from the left at 90 degrees casting long shadows, the broken cross-section of the 
cookie interior is sharp and fully in focus, 85mm macro lens, f/4 aperture, 
3/4 elevation angle, editorial food magazine style, hyperrealistic, commercial food 
photography, 4K HDR, ultra high definition
```

**NEGATIVE PROMPT:**
```
text, watermark, whole cookie, unbroken, bright background, cartoon, illustration, blurry interior
```

---

### **SCENE 4 — The Four** 
*(Group flat lay — for OG/social share and feature banners)*

**File name:** `venom-flatlay.png`
**Aspect:** `16:9` → `1408×768px`
**Use on:** OG/social share meta image, potential homepage feature banner

**PROMPT:**
```
A photo of four dark chocolate crinkle cookies arranged in a loose organic cluster 
on a dark charcoal matte black textured linen surface, each cookie a perfect domed 
hemisphere with deeply cracked and crinkled surfaces coated in thick white powdered 
sugar, fine powdered sugar dust scattered across the surface between the cookies, 
pure matte black void background, wide composition with cookies occupying the 
left-centre two-thirds of the frame leaving negative space on the right, 
dramatic hard key light from directly above and slightly left creating crisp 
directional shadows, aerial 3/4 angle, 50mm lens, f/8 aperture, 
commercial food photography, hyperrealistic, award-winning editorial, 4K HDR
```

**NEGATIVE PROMPT:**
```
text, watermark, logo, human hands, cartoon, close-up, single cookie, bright background, colour
```

---

### **SCENE 5 — The Powder Fall** 
*(Dynamic editorial shot — powdered sugar in motion)*

**File name:** `venom-powder.png`
**Aspect:** `1:1` → `1024×1024px`
**Use on:** Product detail carousel (fourth slide), social media posts

**PROMPT:**
```
A photo of a single dark chocolate crinkle cookie being dusted with fine white 
powdered sugar falling from above, the sugar caught mid-fall as individual particles 
drift and settle onto the domed crinkled surface, sugar landing on the peaked cracks 
and catching the light, near-black dark chocolate crevices contrast sharply against 
the white powder, pure matte black void background, cookie centred and occupying 
65 percent of the frame, dramatic single hard key light from upper-left, 
fast shutter speed freezing the falling sugar particles, 85mm macro lens, 
f/2.8 aperture, shallow depth of field background, ultra cinematic, 
hyperrealistic commercial food photography, award-winning, 4K HDR
```

**NEGATIVE PROMPT:**
```
text, watermark, blurry sugar, motion blur, multiple cookies, human hands, cartoon, bright background, spoon
```

---

### **SCENE 6 — The Macro** 
*(Extreme texture close-up — for detail page immersion)*

**File name:** `venom-texture.png`
**Aspect:** `4:3` → `1280×960px`
**Use on:** Product detail carousel (fifth slide), shows craft and quality up close

**PROMPT:**
```
An extreme close-up macro photograph filling the entire frame with the crinkled 
surface of a dark chocolate crinkle cookie, the cracks and fissures of the domed 
surface dominate the composition revealing the rough near-black chocolate texture, 
thick white powdered sugar granules visible as individual crystals on the peaks 
and ridges catching the light, sharp focus on the surface texture with natural 
soft falloff to edges, single raking side light from the left at low angle 
revealing maximum surface texture depth and shadow in the crevices, 
100mm macro lens, f/8 aperture, razor sharp focus, dark charcoal background 
visible at edges, professional food photography, hyperrealistic, 
4K HDR, ultra fine detail
```

**NEGATIVE PROMPT:**
```
text, watermark, full cookie visible, whole cookie, blurry texture, smooth, bright background, multiple cookies
```

---

## 🎨 Consistency Checklist — Run Before Every Generation

Every time you generate, verify these are in the prompt:

- [ ] `near-black dark chocolate` (not "brown")
- [ ] `pure matte black void background`
- [ ] `heavily cracked and crinkled surface`
- [ ] `thick white powdered sugar`
- [ ] `commercial food photography, hyperrealistic, 4K HDR`
- [ ] `no text, no watermark` in negative prompt
- [ ] Correct aspect ratio selected in the UI

---

## After Generation — Upload to Cloudinary

Once you have the final PNGs:

1. Go to [Cloudinary Dashboard](https://cloudinary.com/console)
2. Upload to folder: `/haiq/products/venom/`
3. Add to the product in **Admin → Products → Venom**
4. Upload Scene 1 as `sort_order: 0` (primary)
5. Scenes 2–6 as `sort_order: 1–5` (gallery carousel)
6. The database `product_images` table will serve them to the website automatically

---

## Sources & References

- [Prompt and image attribute guide — Google Cloud / Vertex AI](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/image/img-gen-prompt-guide)
- [6 Prompt Patterns for Realistic AI Product Photos — Nightjar](https://nightjar.so/blog/prompt-patterns-realistic-ai-product-photos)
- [Ultimate Imagen 4 Prompting Guide — Atlabs AI](https://www.atlabs.ai/blog/imagen-4-prompting-guide)
- [Generate images using Imagen — Google AI for Developers](https://ai.google.dev/gemini-api/docs/imagen)
- [Google Imagen 4: Advanced Features & Expert Prompt Tips](https://gpt4oimageprompt.com/pages/blog/google-imagen-4-features-and-prompt-tips.html)
