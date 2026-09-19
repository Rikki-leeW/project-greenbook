# Developer guide

This is the working guide for the live source. The dated tree in `docs/design/architecture 16-09.md` is a historical snapshot; this guide describes ownership and relationships rather than listing every file.

## Start here

- `src/main.tsx` mounts React and loads the base stylesheet.
- `src/App.tsx` owns garden state, record mutations, top-level destinations, relationship opens and Journey Back snapshots.
- `src/components/app/AppLibrary.tsx` owns the Growing library's recipe, ingredient and product views and editors. Growing Places and the grouped Growing destination live in `src/pages/GrowingPlaces.tsx`.
- `src/types.ts` defines records; `src/types/navigation.ts` defines page destinations.
- `src/services/storage.ts` coordinates garden saves; `src/services/sprigDatabase.ts` owns IndexedDB access and verification. `src/services/backup.ts` owns backup packages.

A normal change flows from a page callback to App (or AppLibrary), through the record mutation and storage layer, and back to the page through updated props. Do not add a second record store inside a page.

## Choose the existing template

- `MainPageTemplate`: collections and shelves, including Plants, Journal, Harvests, Gallery, Comparisons, Trials, Growing Recipes, Ingredients and Products. Pass the header and collection actions as props; put the collection content in children.
- `MultiPageTemplate`: grouped destinations, currently Growing and Knowledge. Pass grouped navigation through `subNavigation`.
- `FunctionPageTemplate`: Today, Calendar, Search, Backup & Restore and Sprig. Function-specific content remains in the page.
- `DetailPageTemplate`: saved record reading, including Plant Stories, Journal entries, Harvests, Growing Places, Growing Recipes, Ingredients, Products, Trials and Plant Comparison reports. Pass the page header and journey navigation as props. Keep record-specific sections and actions in children.
- `FormTemplate`: notebook dialog presentation used by the record editors and PurchaseEditor. The caller owns its overlay, actual form, validation, save/cancel logic and scroll lifecycle. Pass `onClose`; the template uses `useModalDialog` for opening focus, Escape, contained Tab movement, background isolation and focus return.

Templates are in `src/components/templates/`. They compose `GardenLayout` with the shared parts in `src/components/layout/GardenPage.tsx`: `GardenPage`, `GardenPageNavigation`, `GardenPageHeader` and `BackToTop`.

`GardenLayout` owns fixed Satchel access and bottom navigation. Its content wrapper is a plain div. The template supplies exactly one main landmark, either a native main or a div with `role="main"`. Avoid nesting a second page shell inside a template.

## Detail header and actions

Use `eyebrow`, `title`, `intro`, `headerActions`, `headerAfterIntro` and `headerClassName` on DetailPageTemplate. `headerAfterIntro` holds record status, favourite/archive notices or other header context. Pass React nodes when a title or date includes a relationship link. Keep one h1 per destination.

`journeyBackLabel` and `onJourneyBack` remember the route used to arrive. `homeLabel` and `onHome` return to the record's collection or Growing home. Do not mix these buttons into edit/delete/export actions. The template omits unavailable navigation automatically.

`src/components/common/RecordActions.tsx` supplies the standard recipe/ingredient/product action set. Plant Stories and Comparison reports retain their specialist action groups. Their controls still use the shared button classes. Do not force specialist actions into the standard component by discarding capabilities.

Use `BackToTop` from GardenPage for detail footers. Collection, grouped and function templates render it themselves unless `showBackToTop` is false.

## CSS ownership

- `src/css/base/index.css` and `base/variables.css`: baseline document styles and base tokens.
- `src/css/App.css`: stylesheet composition and shared application foundations. It loads the common controls after legacy/page styles.
- `src/css/components/layout.css`: page width, spacing, shared header, journey navigation, uniform detail-header presentation and Back to top geometry. It also reserves the fixed Satchel corner on small phones.
- `src/css/components/navigation.css`: shared app navigation, including the fixed Satchel button.
- `src/css/components/uniform-controls.css`: common field and button appearance, selected/focus/hover states and phone text-entry sizing. Page-level fields are covered as well as native forms. Preserve specialist controls such as photo/file, checkbox and range inputs.
- `src/css/components/forms.css`: notebook form presentation.
- `src/css/components/photos.css`: shared photo presentation.
- `src/css/pages/plant-detail.css`: Plant Story content, facts, timeline and age-picker details. Its rules are no longer injected by PlantDetail.tsx.
- `src/css/pages/journal.css`: Journal and Harvest content details, including age controls. `src/css/pages/growing.css`: Growing content and Growing Place detail rules. These static rules are no longer injected from detail pages.
- Other `src/css/pages/` files and feature stylesheets such as `garden-gallery.css`, `garden-knowledge.css` and `garden-trials.css`: feature-specific content and composition.
- `src/css/sprig-print.css`: shared print reset, screen-control hiding, photo foundations and Trial report isolation. `components/comparison.css` owns the Comparison report's landscape layout and tables; Trial feature CSS owns its report composition.

Change a shared appearance in its shared owner. Add page CSS only for a feature's content. Do not copy the whole page shell, header or a general input rule into a new stylesheet. Keep asset URLs relative to their stylesheet; the woodland asset is in `src/images/backgrounds/`.

## Navigation and scroll

`src/hooks/useNavigationScroll.ts` applies a requested position after React commits, then reapplies it after the frame settles. Its cleanup cancels stale requests. App and AppLibrary use this same mechanism.

App's `rememberCurrentJourneyState()` saves destination selections and the current `window.scrollY` before opening a relationship. A forward open requests zero. `handleJourneyBack()` restores the saved state and position. A same-page record open must still remember the journey and request top; changing only activePage would miss it.

AppLibrary's internal view setter requests top for local transitions. Its initial-destination synchronisation uses the underlying state setter, allowing App's Journey Back position to remain authoritative. Library-local origin navigation is distinct from App's journey history; it currently does not store a reading position of its own.

The Satchel's canonical destinations and order live in `src/components/navigation/appNavigation.ts`. `SatchelMenu` renders Search as a compact doorway above the ordered sections. Garden of Mine begins with Plants, then Growing, Comparisons and Garden Library. Sprig contains Ask Sprig and What Sprig Has Noticed. The time-based records section is named Garden Record. Settings and Safety is near the bottom, followed by Today.

Accessibility rules and the audit checklist live in `docs/development/accessibility.md`. Use native controls first, preserve one main landmark and one h1 per destination, and use `useModalDialog` for every custom modal surface.

`src/pages/AskSprig.tsx` is a private question layer over `src/utils/sprigInsights.ts`. It does not call an external AI service. Questions select derived observations by intent, record wording and stable Plant Story IDs. The answer preserves each insight's evidence strength, reasoning, evidence links and supported actions. An unmatched question must return the no-evidence response rather than unrelated high-priority observations. Garden records remain the source of truth.

Do not add an unconditional mount-time scroll reset to a detail page: it would compete with Journey Back. Editors and photo viewers own their temporary scroll locks; they must release only locks they acquired.

## Records, photos and exports

Keep garden records in IndexedDB. Do not replace them with localStorage. The storage layer includes legacy migration and queued asynchronous writes; work through its existing entry points.

Use the shared photo picker, gallery and photo utilities. Stable photo identifiers and metadata connect the photographic history across records. Do not derive identity solely from a current array index.

Use `src/utils/exportUtils.ts` for shared download and escaping helpers, including Unicode-safe RTF. Preserve each feature's output contract: JSON packages include photo data; Comparison ExcelJS exports include actual photographs; Knowledge HTML/PDF retains rich content while RTF is text. Comparison PDF temporarily shows all report sections and then restores the chosen lens. `src/utils/comparisonPrint.ts` builds disposable native tables from those rendered grids for Export PDF, preserving row content and photos, enabling repeated column headings and removing fixed scroll-cell heights. Its cleanup removes the temporary tables after the print dialog returns. Comparison print styling stays in `components/comparison.css`.

Printing is a separate presentation. Screen controls must stay out of reports; long records, page breaks and photo captions need an actual print-preview/PDF check. A successful build alone does not verify printed pagination.

## Verify a change

Run `npm run build`. Then inspect the affected destination at desktop and phone widths. Check that the title, journey links, home link, record actions and content remain available; inspect browser errors and horizontal overflow. For template changes, check one main landmark and one h1.

For navigation changes, open a relationship from deep within a long record: the destination should start at zero, and Journey Back should restore the former reading position. Check a main-menu transition too.

For edits to record operations, exercise the appropriate save/cancel path with disposable test data in a separate browser profile. Do not seed or erase the gardener's live records for visual checks. Empty collections cannot validate populated detail states, archive/favourite branches or photographs.

## Remaining verification

The template pass migrated the remaining page headers and Plant Story navigation, corrected the shared frame landmarks and moved static detail CSS to page stylesheets and consolidated detail Back to top controls. It preserved specialist report and action content.

Actual PDF pagination with photographs and long Trial/Comparison reports remains outstanding. The in-app browser has no print-preview/PDF capture capability, so actual print pagination still needs exported PDFs. Populated Growing Recipe (active/favourite/archived), Growing Place and completed Trial pages were checked with temporary in-memory fixtures, long text and test images. The fixtures never write to IndexedDB. This verifies those display states; it does not replace checking real exported PDFs.

The supplied 10-page Comparison PDF was visually inspected on 18 September 2026. It revealed clipped rightmost photo-column captions and scrolling photo cells that omitted images. Export PDF now prepares native tables; browser checks verified equal row/column counts, preservation of every source image and cleanup. A fresh exported PDF is still required to confirm the revised pagination.

The shared print follow-up removes screen shell minimum heights/padding for record exports. Trials now print in normal flow, omit screen siblings and permit long sections/observations to continue while keeping headings and photo figures together. Standalone Knowledge/Reference documents embed `readingPrintStyles` from exportUtils for common page-break rules. These source-level fixes still require representative exported PDFs for final visual validation.
