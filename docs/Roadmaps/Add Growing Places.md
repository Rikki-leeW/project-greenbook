
What kind of place is it?
Deck
Balcony
Patio
Concrete area
Grass area
Rock wall
Retaining wall
Indoor room

Which way does this place greet the sun?
aspect?: GrowingPlaceAspect
North
North-East
East
South-East
South
South-West
West
North-West
More than one direction
It moves around
Not sure

It moves around matters for pots, grow bags and portable planters.

How much sunshine usually finds it?
sunExposure?: GrowingPlaceSunExposure
Full sun
Mostly sunny
Morning sun
Afternoon sun
Dappled light
Mostly shaded
Deep shade
Changes with the season
Not sure

How tucked away is it from the weather?
weatherExposure?: GrowingPlaceWeatherExposure
Very exposed
Some shelter
Well sheltered
Fully protected
Changes with the season
Not sure

For Indoor room, this can be hidden and stored as fully protected.
For Greenhouse, I would hide the weather question too, but not the sunshine question. A greenhouse can still be shaded, sun-soaked, shade-clothed, or seasonally different.
The soil section needs more than one field
A single “soil type” dropdown would be too blunt for what you actually record.

I recommend:
What lies beneath?
This describes the existing foundation:
soilBase?: GrowingPlaceSoilBase
My own blend...
Bought Potting Mix
Bought Top Soil
Bought Seedling Mix
Native clay
Loam
Hugelkultur
Sandy soil
Rocky soil
Imported topsoil
Potting mix
Raised-bed mix
Compost-based mix
Soilless growing mix
Layered bed
Native Soil
Water or hydroponic medium
Homemade Blend
Aquaponics
Peat soil
Pine needles
coco coir
Straw
Peat moss
Sphagnum moss
Something Else
Not sure

How was this growing ground made?
This captures the method:
soilMethod?: GrowingPlaceSoilMethod
Existing ground
Dug and amended
No-dig
Lasagne or sheet-layered
Hügelkultur or woody-layered
Filled raised bed
Container mix
Seed-raising mix
Custom blend
Something else

Layered and woody-bed methods are meaningfully different from ordinary amended soil, so they deserve separate choices rather than being folded into “dirt.”

What is in this mix?
For the first version, this should be an optional multiline field:
soilRecipeNotes?: string
Visible wording:

What went into this growing growing medium / ground?
Placeholder:
Compost, aged horse bedding, potting mix, sand, perlite, manure, fertiliser… include amounts or ratios if they matter.
This lets you record:
2 parts compost
1 part aged horse bedding
1 part potting mix
handful of blood and bone
sand for drainage

That information is already central to how you garden, and it will eventually let Sprig compare outcomes against your real mixtures.

🌱 Growing Ground

Each saved blend or method could have:
Name
Purpose
Ingredients
Amounts or ratios
Preparation method
Amendments
Suitable crops
Places currently using it
Changes made over time
Results and observations

Examples:
Rikki’s Winter Potato Mix
Carrot Root Blend
Seed-Raising Mix
Ayote Pot Mix
Pool Deck Container Blend
Layered Vegetable Bed
Native Clay Improvement


-----------------------------------------------
7/8/26
My suggested build order now would be:
✅ Expand the GrowingPlace types (we've planned this).
🌿 Replace the "What kind of place is it?" dropdown with the Sprig notebook picker.
🌱 Add the Growing Ground section with:
"What is this place growing in?" (notebook picker)
"How was this growing ground made?" (notebook picker)
"What went into this growing ground?" (multiline notes)
☀️ Add Aspect.
🌤 Add Sunlight.
🌧 Add Shelter.
📝 General notes.

I think that order reflects how you naturally think about your own garden. When we've talked about your potatoes, tomatoes, or ayote, we've almost always started by talking about what they're growing in before we talked about which direction the bed faces. That tells me Growing Ground belongs near the top of the form, right after identifying the place itself. 🌿

⬜ My Own Mix 
🌿 It's a growing system
Hügelkultur
No Dig
Wicking Bed
Hydroponics
Aquaponics
Layered Bed

🪴 It grows in natural ground
Native soil
Native clay
Sandy soil
Rocky soil
Loam
Peat

🌾 I bought a growing mix
Potting mix
Seed raising mix
Raised bed mix
Compost blend

What are you growing in? 
⬜ My Own Mix 
⬜ I bought a mix 
⬜ Straight into the ground 
⬜ It's a growing system


So the first time, the workflow should be:

What are you growing in?

☑ My Own Mix

↓

What would you like to call this mix?

_____________________

Example:

My Compost & Guinea Pig Mix

or

Potato Blend V1

or

Rich Veggie Mix

or

Winter Raised Bed Mix

Whatever the gardener naturally calls it.

Then...

Sprig asks

What went into this mix?

You write:

2 parts compost
1 part aged horse bedding
handful GP manure
1 part basic potting mix
Here's the clever part

The next time you choose My Own Mix, Sprig doesn't start from scratch.

Instead it quietly asks:

Have you made this mix before?

Then shows:

📖 My Compost & Guinea Pig Mix

📖 Potato Blend V1

📖 Seedling Mix

📖 Winter Raised Bed Mix

➕ Create a new mix

That is exactly how a gardener's notebook works.

You're not recreating recipes.

You're reusing knowledge.

Even better...

Imagine a few years from now.

You decide to improve your potato mix.

Instead of editing the old one, Sprig could suggest:

Potato Blend V1

Create a new version?

↓

Potato Blend V2

Now your journal automatically knows which plants grew in V1 and which grew in V2.

Later Sprig could even help answer questions like:

"Which version produced the biggest potatoes?"

That's not something we'd build now, but if we store the data this way from the beginning, we'll already have the foundation.

The bought mix can work the same way

Choose:

🪴 I bought a mix

↓

What type of mix?

Potting Mix
Seed Raising Mix
Raised Bed Mix
...

↓

Which brand?

Richgro
Rocky Point
Osmocote
Brunnings
Other...