# v3.0.19 — Main Window Click Shield Fix + STATUS Shortcut

- Fixed Companion popover race that could leave transparent iframe popovers above the main Fabula action window and intercept all pointer clicks.
- Companion surfaces are now destroyed before `OBR.action.open()` and closed again by watchdog passes while the main window is open.
- Popover closes run in parallel rather than sequentially.
- Renamed the shortcut `SHEET` to `STATUS`.
- STATUS is a focused quick editor for DEF / M.DEF, base Attributes, status conditions, and temporary Attribute step modifiers.
- STATUS writes through the same player metadata + persistent Scene sheet pipeline used by the extension.
