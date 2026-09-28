# v3.0.21 · Companion Flow Reliability

- Fixes intermittent Companion Flow splash hangs on Roll / Study / Use.
- Commands are embedded directly in the Flow URL and also stored under a per-command backup key.
- Replaces the single fragile pending-slot dependency with ID-scoped recovery.
- Retries Flow command consumption after transient Owlbear/Scene sync failures.
- Player bootstrap uses `Promise.allSettled` so one failed room read no longer aborts the entire Flow startup.
- Background repeats the ready signal to avoid BroadcastChannel timing races while the popover iframe is loading.
- Adds visible RETRY / CLOSE recovery controls if a command still cannot start after repeated attempts.
