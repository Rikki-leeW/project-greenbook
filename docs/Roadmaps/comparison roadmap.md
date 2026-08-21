Yes. And I think this is the point where Harvest stops being merely a page that records vegetables and becomes one of Sprig's analysis engines. 🌱📚

Your comparison idea is not a weird bolt-on. It actually fits the data architecture we've been building surprisingly well.

First, I would refine the Harvest actions

For the Harvest ledger page, I agree with:

Open | Edit

And I would make the whole harvest card clickable for Open, while keeping a small Edit action visible. The rubbish bin can eventually disappear from the ledger so accidental deletion is harder.

For the Harvest Detail page, I'd build:

← Back
✏ Edit
🌱 Create a variation
🖨 Print
📤 Export
Delete

I agree with removing Favourite.

📸 Add photographs: don't make this a separate action. Photographs are part of the Harvest Record, so Edit should let you add/remove photographs.

📦 Archive: I don't think a Harvest Record should be archived at all. A harvest is historical evidence. Once you've picked those five potatoes on 21 August, that record simply exists in the plant's story. Finished describes what happened to the plant after that harvest, not the Harvest Record itself. So we should not conflate those two concepts.

And now, comparison. This is much less frightening than it sounds.

The important part is that we do not bake comparison into HarvestRecord itself.

A Harvest Record should remain a factual little parcel:

My testing potato
planted X date
harvested 21 August
5 potatoes
250 g
Main harvest
Poor
Finished

Comparison is a view over existing records.

Sprig can later say:

Give me My Testing Potato + Royal Blue Bag 9 + Sebago Bag 10.

Then it pulls information from their Plant Stories, Growing Places, Journal events, Harvest Records, setups, etc., and lays selected fields side-by-side.

That architecture is enormously more powerful because comparison won't be limited to harvest.

You could eventually compare:

two broccoli plants from the same seed packet but different locations
four Sebago bags planted at different dates
potatoes grown in your warm west-wall position versus the colder pebble position
one variety across several seasons
different growing setups
days from planting → emergence → flowering → first harvest
total yield
yield per plant
harvest duration
number of harvests
quality
inputs/cost versus harvest
photographs at equivalent ages

And later Sprig intelligence could notice the comparison without you asking:

I notice these two broccoli were started together, but one formed its main head 24 days earlier. Their Growing Places were different.

That's precisely why all this slightly tedious structured-data work we're doing now matters. We're laying railway tracks for something much smarter later. 🌿

Your potato example is especially important

You said today you wanted to bring together birthdates/details for several potatoes and then show me today's photograph.

That suggests Sprig eventually needs a Compare tray.

Perhaps from Plants/Harvest you select:

☐ Sebago Bag 10
☐ Sebago Bag 11
☐ Royal Blue Bag 9

Then:

Compare 3 stories

Sprig creates a readable comparison page containing their dates, ages, varieties, location history, growing setup, significant journal events, harvests and photos.

And importantly, the gardener chooses which information matters. We shouldn't make an enormous spreadsheet permanently displaying 47 columns.

That comparison can then be printed or exported.

Export format: I strongly agree, NO CSV 😂

CSV is useful for machines and profoundly uninspiring for a gardener opening a beautiful Sprig comparison on their phone.

I actually think Sprig should ultimately offer two exports, because they serve different jobs:

PDF: "Garden Report" should be the default. Beautiful, formatted, universally readable, phone-friendly, printable and shareable. It could contain Sprig branding, plant names, photographs, timelines, tables, harvest summaries and notes. This is what someone could send to another gardener, print, save with their records, or upload here for analysis.

XLSX: "Garden Data" should be the optional analytical export. Proper Excel workbook, not CSV. It can have formatted headings, dates as real dates, measurements as numbers and separate worksheets such as Plant Stories, Harvests, Journal, and perhaps Comparison. Excel, Google Sheets, Numbers and phone spreadsheet apps can all deal with .xlsx.

I'd label them in human language rather than file jargon:

Export Garden Report (PDF)
Beautiful, readable and ready to print or share.

Export Garden Data (Excel)
Structured data for deeper analysis.

For an individual Harvest Detail page, PDF makes much more sense as the primary export. For a comparison, both PDF and XLSX become genuinely valuable.

And Print doesn't necessarily need us to generate a file first. We can build a print stylesheet so the browser produces a clean print view/PDF using the device's normal Print function.