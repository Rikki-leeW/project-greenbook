12/7/2026
A function we vitally need is to be able to DELETE/ REMOVE
Remove a plant completely. Remove or undo things that have been added whether by accident or just something I dont wish to remember or isnt of interest to me anymore.

_______________________________
ability to edit at any time? as an example. when growin ga tomato plant, it can be growing as 3 main stems beautiful then wind may come hrough and 2 main stems breeak off so its down to only 1 stem as  a plant. another example. I plant 3 potato seeds and 3 main stems grow but 2 clearly rott away and only 1 stem remains. I know we can make "notes" , but can how can I make key changes with clear history saying it was this but now its this?
_________________________________
## Garden Moment Photos

Allow photos to be attached to any garden moment.

Examples:
- First sprout
- First flower
- Pest damage
- Disease progression
- Fertiliser results
- Harvest
- Before / after pruning

Future ideas:
- Multiple photos per moment
- Captions
- Full-screen gallery
- Swipe through a plant's life chronologically
- AI-generated growth timelapse


___________
Plants ae in days greate. But weeks next to it in brackets.
___________________________________
General area for general gardening. 
Example I watered the entire garden. 
Example I fertislised the top deck. 
Example I had horse bedding delivered
___________________________________

A Calendar to display everything at a glance?
___________________________________

Given to Chat GPT 13/07/2026
*********************************************************************************
Delete button on home page for plants
____________________________
Journal is still in boxes I want them to be more divided by lines like a journal not inside boxes.

This is a prompt for Chat GPT to remember the time I talked about adding the features in the form to added "areas" both from from coding and from the user end
Gate - I envisage they will actually look like 1 line journal entries that I can click on for more information which will take me to the plants page of the journal. (Like an index in the front of a folder) s




Wording
No growing places yet
Sprig button
🌱 Add a growing place
And I would change the little helper text underneath as well.
Instead of:
🌱 Welcome a new garden place
I'd make Sprig sound like he's inviting you to sketch another part of the garden into his notebook.
Something like:
🌱 Sprig hasn't explored this growing place yet.
or
🌱 Add a growing place first.
or my favourite:
🌱 Let's add a new growing place.

Things become Growing Places.
Actions become Garden Activities.
Experiments become Garden Trials.
Plants become Plant Stories.
Notes become Chronicles.


Replace Dropdowns
replace every dropdown in Sprig with a reusable Sprig Picker.
Instead of a plain list, you'd tap it and get a little parchment card that unfolds over the notebook.
For example, your "How did this story begin?" picker could show:

🌰 Seed
🌱 Seedling
✂️ Cutting
🥔 Seed potato
🌿 Division
🪴 Bought plant
✨ Something else

Each with a tiny hand-drawn icon and the same paper texture as the notebook.
We'd build that component once, then use it everywhere: event types, varieties, growing places, trial outcomes, weather... everything. It would become part of Sprig's identity.


ACCOUNTANT SPRIG


----------------------------------
Library

├── 🌱 Plants
├── 📖 Recipes
├── 🌿 Ingredients
├── 🧪 Products
├── 📍 Growing Places
├── 🌾 Harvests
├── 🧪 Garden Trials
└── 📚 Journal

Recipes
🌱 Recipe Engine (internal)
The reusable architecture that stores ingredients, quantities, photos, costs, versions, notes, and relationships.

🌱 Recipe Types (future)
Growing Recipe
Potting mixes
Seed raising mixes
Soil blends
Hydroponic media

Feed Recipe
Liquid fertilisers
Compost teas
Worm teas

Compost Recipe
Hot compost
Cold compost
Leaf mould
Bokashi

Mulch Recipe
Orchard mulch
Vegetable mulch

Spray Recipe
Neem
Garlic
Milk
Seaweed

Trap Recipe
Slug traps
Fruit fly traps

Substrate Recipe
Mushroom blocks
Specialty growing substrates

Soil Improvement Recipe
Clay amendments
Raised bed recharge
Mineral blends

That gives us a beautiful separation:
Gardeners see: Growing Recipe, Feed Recipe, Compost Recipe.
Sprig's code sees: one elegant Recipe engine.
----------------------------------------------------

Every page
← Back
✏ Edit
🌱 Create a variation
⭐ Favourite
📸 Add photographs
📦 Archive
🖨 Print
📤 Export
Delete

✅Product 
✅Ingredients
✅Recipes
native Ground
Growing System
Plants
    has:
    Product creation and saving
    Purchase details captured alongside creation
    Product index/shelf
    Product Detail page
    Purchase-history architecture
    Edit Product
    Favourite
    1–5 rating
    Archive
    Restore
    Permanent delete
    Multi-photo fields retained
    Old products without a category safely handled

✅ Products
✅ Ingredients 
✅ Pricing
✅ Harvest
✅ Comparison

    Calendar

    Every Sprig screen should know both where you came from and where it lives.

******************************************************
    
    29/08/06 upgrade of Menu architecture 
    If you came from somewhere specific:
← Back to [where you came from]

If the record also has a useful home category:
← [Category]

Examples:

Ingredient opened from a Growing Recipe
← Back to My Potato Mix + Rotting Food
← Ingredients
Journal entry opened from Calendar
← Back to Calendar
← Journal
Harvest opened from a Plant Story
← Back to Royal Blue
← Harvests
Plant Story opened from Growing Place
← Back to Potato Bag 6
← Plants

If you opened the record directly from its own category, we don't need two identical buttons. Just:

← Back to Ingredients

or

← Back to Journal

That is much cleaner on mobile too. No third “Return to the garden” button hovering around asking to be useful.



