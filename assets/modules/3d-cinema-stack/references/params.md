# Cinema Stack parameters

Generated from the exact module guiSchema. Scene units are illustrative.

| key | Label | Range / options | Step | Default |
| --- | --- | --- | --- | --- |
| quality | 质量 Quality | low / mid / high / cinematic | — | high |
| glow | 辉光 Glow | 0–2 | 0.02 | 0.65 |
| exposure | 曝光 Exposure | 0.4–1.8 | 0.02 | 1 |
| chromatic | 色差 Chromatic | 0–0.014 | 0.0005 | 0.0025 |
| vignette | 暗角 Vignette | 0–1 | 0.01 | 0.35 |
| grain | 颗粒 Grain | 0–0.09 | 0.002 | 0.018 |

## Looks

### Warm Editorial / 暖调

Controlled warm highlights and a gentle lens finish.

```json
{
  "color": "#d99b68",
  "glow": 0.55,
  "exposure": 1.12,
  "chromatic": 0.0015,
  "vignette": 0.3
}
```

### Cold Precision / 冷调

A crisp blue-green material study.

```json
{
  "color": "#77b9c5",
  "glow": 0.3,
  "exposure": 0.95,
  "grain": 0.008,
  "chromatic": 0
}
```

### Night Cinema / 夜景

Tighter exposure and broader, low-key glow.

```json
{
  "color": "#b3a0d9",
  "glow": 1.05,
  "exposure": 0.82,
  "vignette": 0.55,
  "chromatic": 0.004
}
```

## Tuning and boundaries

Start from the first look. Vary one control at a time. Zero speed/spin freezes that automatic motion; the preview Pause freezes all updates. ?low selects the reduced budget. A lightweight artistic lens stack; no depth of field, film emulation calibration or spectral lens simulation. Integrate into an existing composer rather than nesting output transforms.


This module owns three render targets and one output transform. render(ctx) restores the host render target, tone mapping, autoClear and XR state. Integrate into an existing host composer rather than nesting output transforms. Quality low/mid/high/cinematic changes blur resolution and iterations; ctx.lowEnd forces low.
