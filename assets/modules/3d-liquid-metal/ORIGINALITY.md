# New implementation and dependency record

Independently authored for the 3Dfans 特效大师 collection. Effect code, scene geometry, shader math and all procedural assets are written specifically for this module. No outside liquid-metal, mercury or fluid effect source was used as a build input.

New module: demos/effects/fluid-liquid-metal.js. New private scene builder: assembleLiquidMetal. The displacement math, instanced-droplet animation, blob morph and pool ripple are written for this module. Shared preview/core infrastructure (lib/core.js, lib/cloud-tools.js, lib/lens-pass.js and lib harness files) are reused from the collection's own original infrastructure work.

No downloaded model, photograph, image texture, HDRI, audio or bundled font is included. System fonts are used by the UI. preview.webp is generated only from a real browser capture of this scene.

Authored content: [MIT](LICENSE.txt). Necessary unmodified libraries:

- Three.js 0.160.0 and OrbitControls: [MIT notice](demos/vendor/THREE-MIT.txt).
- lil-gui 0.19.2: [MIT notice](demos/vendor/LIL-GUI-MIT.txt).

Official npm tarballs were verified during the original infrastructure build; this package's exact file bytes are checked against the same integrity-verified [DEPENDENCIES.json](DEPENDENCIES.json). Built-in Three.js material and renderer code remains under its notice. Do not remove these notices or treat renaming as a substitute for rights to outside work.
