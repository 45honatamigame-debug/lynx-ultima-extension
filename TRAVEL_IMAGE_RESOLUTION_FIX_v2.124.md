# Travel Image Resolution Fix v2.124

- Travel Blank displays now adopt the linked source/snapshot native pixel width and height.
- The display scale is inversely compensated so MAIN/A/B Blank world-space size and position remain unchanged.
- Existing active displays with the correct URL but stale low-resolution dimensions are repaired because width/height are part of the sync equality check.
- Both the foreground GM direct-sync path and background worker path use the same resolution-aware behavior.
- Saved Node background snapshots keep working after the original Owlbear MAP image is deleted.
