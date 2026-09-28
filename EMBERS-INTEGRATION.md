# Fabula + Embers DM Spell FX

This package starts from your Fabula version with the draggable initiative tracker. It embeds the Embers 0.2.0 spell tool and editor from the supplied embers-main.zip. Original Embers project: https://github.com/ArmindoFlores/embers.

## DM setup

1. Host this entire folder at one HTTPS origin and install the root `/manifest.json` in Owlbear Rodeo. Keep `/embers/` beside `background.html`.
2. In a scene, click the movable SPELL FX shortcut (GM only) to open Custom Spells. Click the spell tool in the Owlbear toolbar (Shift+C) to activate targeting and immediately open the spell picker.
3. In Custom Spells, set **Effect video library** to the HTTP(S) URL of your hosted JB2A Library directory, e.g. `https://your-host.example/Library`, then Save URL. The configuration syncs through scene metadata to players.
4. Choose a built-in spell template, click Use template, enter your own name and unique ID, edit effects as needed, and save. New/imported/removed custom spells sync to players. The original detailed editor and JSON import/export remain available.
5. With the spell tool active, use `.` to choose a spell, click targets, and press Enter to cast. By default only the GM can cast; the Embers Settings tab can enable players.

## Assets and source

The provided Embers ZIP contains effect indexes and targeting WebMs, but not the spell video Library itself. Video spells need compatible JB2A WebM assets hosted at the configured base URL. Follow the applicable [JB2A terms](https://jb2a.com/) and CC BY-NC-SA attribution described in `embers-source/README.md` when supplying assets. No third party video Library was added to this archive.

Editable integration source is in `embers-source/` (node_modules omitted). To rebuild: `cd embers-source && npm ci && npm run build`, then copy `dist/` to `../embers/` and update the generated background script URL in `../background.html`. Fabula files remain at package root.
