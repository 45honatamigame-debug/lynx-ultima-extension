# v2.158 · Roll Actor Ownership

- Removed TRADE-OFF ROLL from the Roll page.
- Moved CHARACTER control into the MANUAL CHECK card so it remains at the top with LATEST RESULT.
- The selected CHARACTER now drives both Manual Check attribute dice and Suggested Check rolls.
- GM may select Player Sheets and active Monster Sheets.
- Players receive only their own Sheet option, the selector is disabled, and `resolveRollActor()` forcibly returns their own Sheet even if stale/tampered runtime state contains another actor reference.
