The biggest unfinished things from today are these:

Navigation needs one final confidence pass. The Satchel and Return buttons are working again, but we only just repaired the “selected detail record swallows navigation” problem. I’d test the main routes once more before adding more linked navigation.
Plant Story deep-linking is the next structural improvement. You established the new Sprig rule that anything displayed as an existing record should be clickable from where you are. So Journal → Sebago should open Sebago, Growing Recipe → linked plant should open that plant, Growing Place → recipe should open/peek that recipe, etc. This is not fluff. It is how Sprig becomes navigable as a web of garden knowledge rather than a stack of pages.
The ingredient picker bug is still unresolved. We proved older recipe ingredient links work, which is important. The newer recipe creation flow may either not be selecting clearly or may be losing the selected ingredient on save. Before touching save logic, I’d make the selected state visually obvious in SprigPicker, then run one clean test.
Plant Story completion/archive behaviour exists conceptually and partly functionally, but the downstream “Completed Plant Stories” destination is not built yet. That is okay for now, but we should not pretend the lifecycle is complete.
Add Plant itself is now good enough to be the next major polish target. That is still the heart of the app. We should keep improving that before drifting back into finances.

So if I were setting the roadmap from this exact moment, I would do it in this order:

Finish navigation integrity
Test Satchel, bottom nav, Back, detail-page exits, and opening pages from pages.
Implement linked-record navigation
Start with the most valuable case: Journal entry → Plant Story. Then apply the same pattern to Growing Recipes, Growing Places, Ingredients, etc.
Fix picker selected-state visibility and retest recipe ingredient saving
This gives us confidence that “what it is growing in” is being saved correctly.
Return to Add Plant and Plant Story as the main product work
Make that flow robust enough that you can start entering your real plants without feeling like you are still in laboratory mode.
Only then build the next missing practical page
I’d probably choose Completed Plant Stories or Today in the Garden before finances, because both support actual daily use more directly.

Rikki-'s notes
* Add Headings to the pages: so I know what page I am on!


Creating a new plant and creating new mix. cant add new bought items to mix