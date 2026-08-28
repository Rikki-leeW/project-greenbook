ackup Phase 1

I want to keep the first phase deliberately small:

Step 1: Make storage safer and create one reusable normalisation function.

Step 2: Create the Sprig backup format and backup service.

Step 3: Give the gardener a Backup & Restore destination/interface.

Step 4: Test an actual round trip:
current garden → backup file → deliberately change garden → restore backup → verify original garden returns.

Then we stop and assess before adding automatic snapshots, backup histories or anything clever.