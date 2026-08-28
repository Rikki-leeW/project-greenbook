🔎 GLOBAL SEARCH & SEARCHABILITY
Purpose

Sprig should never require the gardener to remember where they recorded something in order to find it again.

The gardener remembers:

“I wrote something about powdery mildew.”

not:

“Was that a Journal event, a saved tip, a note attached to peas, or something in Plant Reference?”

Sprig should find it.

Core principle

If Sprig remembers it, the gardener should be able to find it.

Search is therefore a global capability, not a feature belonging to individual pages.

Search should eventually reach across
Plant Stories and varieties
Journal entries
Calendar dates and moments
Harvests
Growing Places
Growing Recipes
Ingredients and Products
Garden Notes / Almanac
Plant Reference
Saved Tips & Sources
Garden Gallery and meaningful photo metadata
Purchases
Costs & Allocations
Supplies
Suppliers
Garden Trials
future Sprig record types
Search should understand relationships

Searching “Royal Blue” shouldn't only find the Royal Blue Plant Story.

It could eventually reveal related:

Journal entries
Harvests
photographs
Growing Places
Growing Recipes
Calendar moments
notes/reference knowledge
purchases or costs connected to that story

Likewise, searching “West Wall” could reveal the Growing Place itself and the stories/events connected to it.

Search results remain Sprig records

Search does not create copies.

A result gives enough context to understand why it matched, then follows our existing rule:

Quick Peek gives context. Full detail gives the source.

Search architecture

Individual features should not each invent their own unrelated search system.

Calendar can be our first implementation because it needs searchable gathered information anyway. After Calendar, we establish a reusable Sprig-wide search/index architecture that future features can plug into.

That is particularly important before Garden Notes / Almanac, Plant Reference and Saved Tips & Sources, because those are going to massively increase the amount of written knowledge Sprig holds. Building them without search would recreate the exact Google Keep/Notes problem we're trying to solve, just with prettier leaves. 😂