Sprig’s two interface families
1. Form controls

Use the parchment assets here.

These are for making a choice, not browsing large amounts of information:

One Place
Several Places
Entire Garden
One Plant
Plant Type
selected plant tags
selected Growing Place tags
info prompts
submit and secondary actions

These can feel tactile, layered, and slightly decorative because there are only a handful on screen.

2. Indexes and long collections

Do not use cards or parchment tags for every item.

For anything that could grow into dozens or hundreds of records, use a notebook-style index:

Plant list
Journal archive
Plant categories
Growing Places index
Harvest history
Garden Trials archive
Library contents

The entries should feel written directly onto the notebook page, with restrained separators, headings, dates, alphabetical groups, perhaps tiny status marks or a modest thumbnail only where useful.

More like:

POTATOES

Royal Blue ................ Growing
Dutch Cream ............... Harvesting
Nadine .................... Finished
Red Lady .................. Growing

or:

JULY 2026

25 Jul   Fertilised the potatoes
24 Jul   Added Royal Blue
19 Jul   Began Ayote winter trial

Not:

[card] [card] [card] [card]

That would become a parchment traffic jam.

The design principle

Cards are for decisions. Pages are for collections.

And I would add:

Tags show what has been chosen, not everything that could be chosen.

So when choosing several plants, the expandable selector can initially show a clean searchable notebook list. Once chosen, those selected plants can appear as parchment tags underneath the form.

That gives us both:

scalable browsing for hundreds of plants
beautiful tactile confirmation for the few selected items
What this means for the component system

We should build separate reusable components:

SelectionCard.tsx
ParchmentTag.tsx
InfoCard.tsx

for forms, and later:

NotebookIndex.tsx
NotebookIndexRow.tsx
NotebookSectionHeading.tsx

for large collections.



Sprig’s two interface families
1. Form controls

Use the parchment assets here.

These are for making a choice, not browsing large amounts of information:

One Place
Several Places
Entire Garden
One Plant
Plant Type
selected plant tags
selected Growing Place tags
info prompts
submit and secondary actions

These can feel tactile, layered, and slightly decorative because there are only a handful on screen.

2. Indexes and long collections

Do not use cards or parchment tags for every item.

For anything that could grow into dozens or hundreds of records, use a notebook-style index:

Plant list
Journal archive
Plant categories
Growing Places index
Harvest history
Garden Trials archive
Library contents

The entries should feel written directly onto the notebook page, with restrained separators, headings, dates, alphabetical groups, perhaps tiny status marks or a modest thumbnail only where useful.

More like:

POTATOES

Royal Blue ................ Growing
Dutch Cream ............... Harvesting
Nadine .................... Finished
Red Lady .................. Growing

or:

JULY 2026

25 Jul   Fertilised the potatoes
24 Jul   Added Royal Blue
19 Jul   Began Ayote winter trial

Not:

[card] [card] [card] [card]

That would become a parchment traffic jam.

The design principle

Cards are for decisions. Pages are for collections.

And I would add:

Tags show what has been chosen, not everything that could be chosen.

So when choosing several plants, the expandable selector can initially show a clean searchable notebook list. Once chosen, those selected plants can appear as parchment tags underneath the form.

That gives us both:

scalable browsing for hundreds of plants
beautiful tactile confirmation for the few selected items
What this means for the component system

We should build separate reusable components:

SelectionCard.tsx
ParchmentTag.tsx
InfoCard.tsx

for forms, and later:

NotebookIndex.tsx
NotebookIndexRow.tsx
NotebookSectionHeading.tsx

for large collections.

The form assets you created remain exactly what they are: form controls only. They should not quietly colonise the whole app like tiny beige rabbits. 🌿
