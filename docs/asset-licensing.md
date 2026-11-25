# Asset attribution and licensing

## Reference material

The official [Persona 30th Anniversary website](https://asia.sega.com/p30th/en/) was studied for visual rhythm, typography, composition, navigation, and observed motion. Persona, ATLUS, and SEGA names and associated franchise material belong to their respective rights holders. This independent portfolio is not an official or endorsed franchise site.

The 13 supplied JPG, PNG, and WebP images remain unchanged in the workspace root. They include franchise screenshots, anime/game artwork, third-party collages, and photographs with unverified subject identity. No reuse license or source-provenance record was provided. They were inspected and informed the research; they are not included in the production `public/` directory or referenced by application code. The contact sheet under `docs/evidence/` is also research material rather than a shipped website asset. See [the complete asset inventory](asset-analysis.md).

Do not deploy the entire workspace. Deploy only the generated `dist/` directory so that research imagery and the original resume remain outside the public site.

## Original artwork and interface

The signal-mask emblem in `src/main.ts`, the `KM` identity, `public/favicon.svg`, stars, paper silhouettes, project workflow diagrams, waveform treatment, CSS halftones, and layouts were authored for this portfolio. They are original geometric/interface compositions rather than extracted Persona game artwork or traced franchise logos. The mask is an abstract graphic, not a portrait of Kunal.

The project illustrations are labeled **conceptual**. They are not presented as authentic screenshots of employer products. Chirpn and FrugalX are credited with their professional work, and the application does not distribute employer source code or imply public repository access.

No general open-source license has been assigned to the portfolio application source by this project. Dependencies retain their own licenses; the documentation does not grant rights to the supplied third-party reference material.

## Web fonts

The application self-hosts Latin WOFF2 subsets supplied by Fontsource. The complete, unmodified license notices from the installed packages are copied into the publicly distributed license directory.

| Typeface | Attribution | License notice |
| --- | --- | --- |
| Barlow Condensed | Copyright 2017 The Barlow Project Authors; [upstream project](https://github.com/jpt/barlow) | [SIL Open Font License 1.1](../public/licenses/Barlow-Condensed-OFL.txt) |
| Space Grotesk | Copyright 2020 The Space Grotesk Project Authors; [upstream project](https://github.com/floriankarsten/space-grotesk) | [SIL Open Font License 1.1](../public/licenses/Space-Grotesk-OFL.txt) |

`src/fonts.css` declares only the weights used: Barlow Condensed 700/800 and Space Grotesk 400/500/600. The fonts use `font-display: swap`. Preserve the complete notices when redistributing the bundled font files. The live static-site copies are available at `/licenses/Barlow-Condensed-OFL.txt` and `/licenses/Space-Grotesk-OFL.txt`.

The downloadable resume is separately typeset as a PDF with embedded subset Arial fonts from the document-authoring environment. It does not ship a standalone Arial webfont. Web typefaces and PDF typography are separate assets.

## Audio

**After Hours / Original instrumental** is a procedural composition authored in `src/audio.ts` using oscillator tones and a generated deterministic noise buffer. It includes no third-party samples, Persona recording, franchise melody, or transcription. The title is interface metadata for this original composition, not a claim to any similarly titled commercial recording.

No audio file was present among the supplied assets, and no game soundtrack was downloaded. The player supports an authorized replacement via `public/audio/track.json`. The `license` field is descriptive metadata; writing permission text into JSON does not itself establish rights. The owner must supply a valid authorization for any replacement track before public redistribution. See [audio configuration](audio.md).

## Resume and public contact information

`public/Kunal-Maurya-Resume.pdf` is a sanitized, freshly typeset derivative of the owner's supplied resume. The original PDF remains unchanged outside the deployed bundle. The derivative omits the phone number, includes only the general city and professional contact destinations, and contains no residential street address or identification number. Its factual claims come from the source resume.

Professional email, GitHub, LinkedIn, project repository, and credential links are supplied by the owner through the resume. Linking to a certificate does not redistribute the certificate document. No testimonial, private identity document, or fabricated achievement has been added.

## Development tools

Vite, TypeScript, axe-core, browser automation, PDF authoring/rendering, and image inspection are development or verification tools, not visual assets copied from the reference site. Their installed packages retain their own copyright and license notices. Production output contains the compiled portfolio code, declared fonts, original public assets, configuration, and public resume; development screenshots and research documents are not copied into `dist/` by Vite.
