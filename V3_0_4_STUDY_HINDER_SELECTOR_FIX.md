# V3.0.4 Study / Hinder Target Selector Fix

The TARGET MONSTER select uses `data-hinder-target` without a value. The previous handler checked `el.dataset.hinderTarget`, which evaluates to an empty string and therefore never ran.

V3.0.4 uses `el.hasAttribute("data-hinder-target")`, canonicalizes the selected Scene Monster instance, updates `runtime.hinderTargetId`, then re-renders the Study/Hinder panel.
