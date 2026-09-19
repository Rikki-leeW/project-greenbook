# Accessibility rules

Accessibility is part of the shared app structure. A feature is not complete when it can only be used comfortably with a mouse.

## Page structure and navigation

- Keep exactly one main landmark and one h1 on each destination.
- Use heading levels in order. A dialog begins with h2; its major sections use h3, then h4 for controls nested inside those sections.
- `GardenLayout` moves focus to the page h1 after a destination change. This announces the new page without changing its scroll position.
- Keep the `Skip to page content` link as the first keyboard stop.
- `BackToTop` moves both the viewport and keyboard focus. Do not replace it with a scroll-only control.
- Put the most-used destination first in persistent navigation. Plants is first; Today is last.

## Controls and forms

- Prefer `button`, `a`, `input`, `select` and `textarea` over clickable divs. If a non-native interactive element is unavoidable, provide its role, keyboard activation and visible focus.
- Every field needs a visible label or an equally clear accessible name. Instructions and placeholders do not replace a label.
- Toggle buttons expose state with `aria-pressed`; expanding controls use `aria-expanded` and, where practical, `aria-controls`.
- Validation must identify the field and explain how to fix it. Put an inline summary in an `aria-live` or `role="alert"` region when the problem is not handled by native required-field validation.
- Do not remove a focus outline without supplying a clear `:focus-visible` replacement.

## Dialogs and temporary layers

- Use `src/hooks/useModalDialog.ts` for custom dialogs. It moves focus inside, contains Tab and Shift+Tab, closes on Escape, hides the background from assistive technology and returns focus to the opening control.
- Give the dialog `role="dialog"`, `aria-modal="true"`, a label or `aria-labelledby`, and `tabIndex={-1}`.
- Mark the preferred opening control with `data-dialog-initial-focus`. Usually this is Close or the first field.
- Backdrop click is a convenience only; every dialog still needs a named Close button.
- Nested editors use the same hook. It preserves and restores the outer dialog state.

## Visual readability

- Normal text needs at least 4.5:1 contrast against its actual background; large text needs 3:1.
- Do not make useful dates, context or empty-state explanations faint merely because they are secondary.
- Keep interactive targets comfortably tappable on a phone. The shared controls and bottom navigation provide the baseline.
- Honour `prefers-reduced-motion`; shared layout CSS removes app animation and smooth scrolling for people who request it.
- At phone width, verify there is no horizontal page scroll and that browser text zoom does not hide controls.

## Verification

For a representative change, use only the keyboard to:

1. Follow the skip link and navigate to a destination.
2. Open the Satchel, move through it in both directions and close it with Escape.
3. Open a record form, reach every control, open any nested picker or editor, close it and confirm focus returns correctly.
4. Trigger a validation error and check that its cause and remedy are announced.
5. Open and close a photograph viewer.

Then inspect the accessibility tree for one main landmark, one h1, meaningful control names and orderly headings. Check desktop and phone layouts, visible focus, reduced motion, contrast and horizontal overflow. Finish with `npm run build`.
