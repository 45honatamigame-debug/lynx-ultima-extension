# v3.0.13 — Admin Player in Travel Group

Built directly on v3.0.12.

- The current GM/Admin is included as a Travel Group member.
- The Admin uses the character sheet owned by the current GM account.
- After ASK PLAYERS, the GM Tools member list shows the Admin row as ADMIN PLAYER · YOU.
- The Admin chooses Group A or B directly from that row.
- The Admin choice counts toward RESPONDED and is required before CONFIRM SPLIT.
- The Admin assignment is written to `memberGroups` exactly like other players, so linked-token movement follows the selected group.
- Other GM accounts remain excluded; only the current room GM is added as the playable Admin member.
