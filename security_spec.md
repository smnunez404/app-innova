# Security Specification for UnMinuto

## Data Invariants
1. A user can only access and modify their own profile.
2. Activity logs must belong to the authenticated user.
3. Users cannot edit or delete activity logs (per business rules for the MVP, though rules will allow owner write for initial creation).
4. Users cannot modify their own `streakCount` or `createdAt` directly (system-managed logic, though in rules we'll ensure they can't spoof it).
5. MicroTips are read-only for all users.

## The "Dirty Dozen" Payloads (Expect PERMISSION_DENIED)

1. **Identity Spoofing**: Create a user profile for a different UID.
   - Path: `users/attacker_uid`
   - Payload: `{ "email": "victim@example.com", "createdAt": "...", "streakCount": 0 }` (Auth UID = `my_uid`)
2. **Resource Poisoning**: Create an activity log with a 1MB string in `moodBefore`.
3. **ID Poisoning**: Create a user with a document ID that is a very long junk string.
4. **State Shortcutting**: Directly update `streakCount` in user profile.
5. **PII Leak**: Read `users/victim_uid` as a different user.
6. **Orphaned Write**: Create an activity log with a `userId` that doesn't match the auth UID.
7. **Backfill Attack**: Create an activity log with a `loggedAt` date in the past (Rules must check `request.time`).
8. **Shadow Field**: Create a user profile with an extra field `isAdmin: true`.
9. **Tip Modification**: Attempt to delete a document in `micro_tips`.
10. **Global Read**: Attempt to list all documents in `users/` collection.
11. **Email Spoofing**: Write to a profile where the email matches but `email_verified` is false (if enforced).
12. **Recursive Cost Attack**: A query that doesn't filter by `userId` to force full collection scan.

## Test Runner (Conceptual)
The `firestore.rules.test.ts` would verify that all these operations fail.
