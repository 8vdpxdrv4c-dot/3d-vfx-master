# New implementation and dependency record

The earlier 3d-hologram package is replaced here by newly authored effect code and procedural assets. The theme, public slug and lifecycle contract are preserved. Renaming alone is not the basis for this replacement: the earlier effect implementation, vendor effects and visual assets are not build inputs.

New module: demos/effects/shader-holo-vessel.js. New private scene builder: assemble3dHologramScene. The scene math, GLSL snippets, geometry and any generated texture are written for this rewrite. Shared preview/core infrastructure and generic lens math are reused from our own original 13-skill work, not from the earlier outside effect sources.

No downloaded model, photograph, image texture, HDRI, audio or bundled font is included. System fonts are used by the UI. preview.webp is generated only from a real browser capture of this new scene.

Authored content: [MIT](LICENSE.txt). Necessary unmodified libraries:

- Three.js 0.160.0 and OrbitControls: [MIT notice](demos/vendor/THREE-MIT.txt).
- lil-gui 0.19.2: [MIT notice](demos/vendor/LIL-GUI-MIT.txt).

Official npm tarballs were verified during the original infrastructure build; this package's exact file bytes are checked against the same integrity-verified [DEPENDENCIES.json](DEPENDENCIES.json). Built-in Three.js material and renderer code remains under its notice. Do not remove these notices or treat renaming as a substitute for rights to outside work.
