# Implementation origin and dependency notices

Date: 2026-10-23. Local only; no upload/publication.

Effect implementation, helper infrastructure, geometry, shaders, generated textures, preview UI and documentation were authored anew for this batch. No candidate-repository implementation, demo HTML, model, texture, photograph, font, audio or shader is included. Canvas surfaces are generated from authored fields/strokes; geometry comes from primitives or authored coordinates. UI uses installed system fonts without embedding font files.

Theme trace only: research item [add-postprocessing](https://github.com/skinnye/3d-web-pack/blob/cabd2213daf6cbcc4a6d371d20dfdba0329cee49/skills/add-postprocessing/module-guide.md), subject 电影后期效果组合. That repository's code and assets are not build inputs. The user's rewrite requirement supersedes the old guide's mother-library extraction method.

New authored files: [MIT](LICENSE.txt). Unmodified dependencies isolated in demos/vendor:

- Three.js 0.160.0 including OrbitControls: [MIT notice](demos/vendor/THREE-MIT.txt).
- lil-gui 0.19.2: [MIT notice](demos/vendor/LIL-GUI-MIT.txt).

Official npm tarballs were verified against registry SHA-512 integrity before extracting only the allowlisted files. Per-file SHA-256 and sources: [DEPENDENCIES.json](DEPENDENCIES.json). Studio reflections come from generated light cards; no downloaded HDRI. preview.webp comes from a real capture of this scene.

Keep the library notices during redistribution. Added third-party assets keep their separate permissions; this package's MIT file does not relicense outside material. Built-in material chunks and rendering routines provided by Three.js remain under the Three.js notice.
