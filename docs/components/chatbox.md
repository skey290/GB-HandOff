# Chatbox

> Figma: [📌 GB_Design-System — Atom](https://www.figma.com/design/G9YNa2vjdqDjnML9y5hXJ4/%F0%9F%93%8C-GB_Design-System--Atom-?node-id=7219-5418) · node-id `7219:5418`
> Code: `components/ui/chatbox/chatbox.tsx`

## Overview

The atom for prompt entry. A `<textarea>` that starts one line tall sits under a **free-form slot**, with a row of two icon buttons — attach (+) and send (sparkles) — below it. The DOM mirrors Figma's own two-level structure: the root has two children, the `Slot` and a `Wrapper` containing both the text and the button row. The two levels use different gaps — 16px between the slot and the wrapper, 28px between the text and the button row inside the wrapper — which is why they can't be flattened into one shared gap.

It renders dark by default: a `dark` class is forced on the root so descendant semantic tokens resolve to their dark values regardless of the site theme. `shouldForceDark={false}` opts out of that for contexts where Figma draws this instance light instead (e.g. `PostingModal`'s generation/rewrite boxes).

**Responsibility boundary**: the atom's job ends at _choosing_ a file. Pressing attach opens the native file dialog and hands the chosen `File` objects up through `onAttachFiles`. **How those files are displayed** — thumbnails, file chips, text previews — belongs to whoever fills the slot. The composition bundling the image thumbnail row and the filter chips row lives in `components/app/chatbox-composer/`.

## When to use

- When the user needs a prompt area to type and send free text.
- When something must float above the input — attachment previews, filter chips, option rows. That is what `children` is for.
- When file references are needed. Constrain the accepted types with `accept` / `multiple` and receive the result through `onAttachFiles`.

## When not to use

- **For a single-line text field** — use the `Input` family. Chatbox always includes the slot and the attach/send row.
- **When multi-line text entry itself is the point** — use `Textarea`. Chatbox's textarea is `rows={1}` with `resize: none`, tuned for prompt entry.
- **When slot content is also needed**, check `components/app/chatbox-composer/` before composing the atom yourself.

## How to use

```tsx
// Basic — no slot
<Chatbox onSend={handleSend} />

// Controlled
<Chatbox value={prompt} onValueChange={setPrompt} onSend={handleSend} />

// Images-only attach button
<Chatbox
  accept="image/*"
  multiple
  onAttachFiles={(files) => setAttachments((prev) => [...prev, ...files])}
/>

// Injecting slot content
<Chatbox onSend={handleSend}>
  <AttachmentPreview items={attachments} />
</Chatbox>
```

For a composition that already includes slot content, use `ChatboxComposer`:

```tsx
import { ChatboxComposer } from "@/components/app/chatbox-composer";

<ChatboxComposer
  variant="chips"
  onChipChange={setFilter}
  onSend={handleSend}
/>;
```

## Structure

Five files per the project component rule: `chatbox.tsx` / `chatbox.module.css` / `chatbox.stories.tsx` / `chatbox.test.tsx` / `index.ts`.

The DOM mirrors Figma's own two-level grouping:

```
<div class="dark">                              root (radius 2xl, border, background, gap 16)
  {children}                                    Figma `Slot`
  <div>                                          Figma `Wrapper` (always rendered, gap 28)
    <label class="sr-only">                     accessible name for the textarea
    <textarea rows={1}>                          Figma text
    <div>                                        button row
      <input type="file" class="sr-only">        hidden input triggered by the attach button
      <Button variant="icon-rounded" icon={<Plus />}>     toggled by showAttachButton
      <Button variant="icon" icon={<Sparkles />}>         Figma `aiButton` — toggled by showAiButton
```

- **Neither the slot nor the root constrains height on its own.** Figma sets both to hug in each direction, so the root grows with whatever the slot contains. Figma's generated CSS does export fixed `min-h-[112px]` / `h-[28px]` values for this state, so calling them "not a spec" isn't fully grounded — but they aren't hardcoded in the component either way, since both numbers simply fall out of `rows={1}` plus the gap and padding tokens once the slot is empty.
- **When a consumer stretches the root taller than its own content** (e.g. `PostingModal` giving it `flex: 1 1 auto` so the composer fills whatever room is left beside a taller sibling column), the textarea — not empty space below the button row — absorbs the extra height: `.textWrapper` and `.textarea` are both `flex: 1 1 auto; min-height: 0`, so the attach/send row still ends up flush with the root's bottom edge instead of floating right under a short textarea with a gap underneath. This only activates when something external makes the root taller than its hugged content; a plain `<Chatbox />` with no such wrapper is unaffected.
- The hidden `<input type="file">` is `sr-only` with `tabIndex={-1}` so it stays out of the focus order; the attach button's `onClick` triggers it through a ref.
- The send button clears the value after calling `onSend` in uncontrolled mode. In controlled mode it only calls `onValueChange("")`, leaving the clearing to the parent.

## Props

| Prop                 | Type                      | Default                      | Description                                                                                                                                                                                     |
| -------------------- | ------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `value`              | `string`                  | —                            | Value when controlled                                                                                                                                                                           |
| `defaultValue`       | `string`                  | `""`                         | Initial value when uncontrolled                                                                                                                                                                 |
| `onValueChange`      | `(value: string) => void` | —                            | Called when the value changes, including once with `""` right after sending                                                                                                                     |
| `onAttachFiles`      | `(files: File[]) => void` | —                            | Called when files are chosen through the attach button                                                                                                                                          |
| `accept`             | `string`                  | —                            | File types the attach button accepts (the native `accept`). Unrestricted by default                                                                                                             |
| `multiple`           | `boolean`                 | `false`                      | Allow choosing several files at once                                                                                                                                                            |
| `onSend`             | `() => void`              | —                            | Called when the send button is clicked                                                                                                                                                          |
| `disabled`           | `boolean`                 | `false`                      | Disabled (Figma `Status=disabled`)                                                                                                                                                              |
| `placeholder`        | `string`                  | `"Please share your ideas."` | Textarea placeholder, reused as the `sr-only` label text. The default is Figma's own `TEXT` property default for the text layer — this mapping isn't noted in Figma's own component description |
| `children`           | `React.ReactNode`         | —                            | The slot above the text input (Figma `Slot`)                                                                                                                                                    |
| `showAiButton`       | `boolean`                 | `true`                       | Whether to show the send button (Figma `aiButton`)                                                                                                                                              |
| `showAttachButton`   | `boolean`                 | `true`                       | Whether to show the attach ("+") button that opens the native file picker. Figma's button row always shows it — this prop is a code-only escape hatch for contexts with no file attach flow     |
| `shouldFitContainer` | `boolean`                 | `false`                      | Fill the parent width instead of the fixed 700px                                                                                                                                                |
| `shouldForceDark`    | `boolean`                 | `true`                       | Forces the dark look regardless of the site theme. `false` opts out where Figma draws this instance light instead                                                                               |
| `className`          | `string`                  | —                            | Merged onto the root `<div>`                                                                                                                                                                    |

The rest of `React.TextareaHTMLAttributes<HTMLTextAreaElement>` is inherited (minus `value`, `defaultValue`, `onChange`, `children`) and forwarded to the `<textarea>`.

## Variants

The Figma component set has **one axis, `Status`** (`default` / `active` / `disabled` / `filled`), so there is no variant prop in code. All four states are derived rather than passed:

| Figma `Status` | How the code reaches it                 |
| -------------- | --------------------------------------- |
| `default`      | no value, not focused                   |
| `active`       | `:hover` or `:focus-within` (see below) |
| `filled`       | `value` / `defaultValue` has content    |
| `disabled`     | the `disabled` prop                     |

| Target                        | Token                                                                                                                                                                                                                                                       |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Root background / border      | `--gb-background-default` / `--gb-border-default` (1px)                                                                                                                                                                                                     |
| Root radius / padding / gap   | `--gb-radius-scale-2xl` / `--gb-spacing-4` / `--gb-spacing-4` (slot↔wrapper)                                                                                                                                                                                |
| Wrapper gap (text↔button row) | `--gb-spacing-7`                                                                                                                                                                                                                                            |
| Active border / focus ring    | `--gb-border-static-gray` / `--gb-shadow-focus-ring`                                                                                                                                                                                                        |
| Input text / placeholder      | `--gb-text-default` / `--gb-text-subtle`                                                                                                                                                                                                                    |
| Disabled placeholder          | `--gb-text-static-gray`                                                                                                                                                                                                                                     |
| Typography                    | matches Figma `Text-xs/Regular`. The code declares the five properties individually in `chatbox.module.css` rather than referencing a `text-xs-regular` utility class — the same pattern as every other `components/ui/` module, not a Chatbox-specific gap |

The root is 700px wide by default. It is not responsive by itself — unlike `shouldFitContainer`-supporting siblings such as `Slider` (435px) and `ButtonGroup` (344px), whose fixed widths are independently confirmed as real specs, Chatbox's 700px traces back only to the Figma example frame with no other reuse to confirm it as a spec rather than a canvas artifact. `shouldFitContainer` is available to stretch it to the parent's width via `data-fit-container="true"`, matching the same pattern used across the rest of `components/ui/`. The button row (`Wrapper`) has no radius, shadow, background, or border — Figma agrees.

## States and behaviors

- **Disabled is expressed purely by swapping tokens.** No opacity is applied to the root, because Figma's `Status=disabled` root background and border are identical to `default`. The dimmed appearance comes from the placeholder switching to `--gb-text-static-gray` and the two buttons taking Button's own disabled style. There is a test named for this claim, but it only asserts `data-disabled="true"` on the root — it does not check `opacity` or any computed style, so the "no opacity" behavior itself is currently unverified by the test suite.
- **The buttons' disabled style belongs to Button.** Chatbox passes `disabled` down and never overrides the colors — Button's `icon` variant already applies the same tokens Figma uses.
- **No hover change when disabled** — `pointer-events: none` on the root stops the hover and focus-within rules from firing at all.
- **`active` maps to both hover and focus-within.** Figma's `Status` axis has no `hover` value, only `active`, so pointer-over and textarea focus show the same style (border `--gb-border-static-gray` plus the focus ring). This mapping is a code-side interpretation.
- **The placeholder hides on focus**, the same convention as the shared `Input`. Figma's `Status=active` (node `7219:5435`) is designed with real placeholder text visible, bound to `--gb-text-subtle` — Figma draws the placeholder there deliberately, not because a static mockup "can't express focus". In Storybook, the `active` story doesn't trigger real DOM focus (no `pseudo-focus` class applied), so what's visible on the canvas there matches Figma's drawn state; the divergence only shows up at actual runtime focus, which this bullet describes.
- **Controlled / uncontrolled** — `value` of `undefined` means internal state; otherwise fully controlled. Only uncontrolled mode clears itself on send.
- **The file input resets every time.** The change handler ends with `event.target.value = ""` so choosing the same file twice in a row still fires a `change` event.
- **Enter sends; Shift+Enter inserts a newline.** Only a plain Enter is intercepted, preventing default and calling the same handler as the send button. Shift+Enter is left to the browser. An Enter during IME composition (`event.nativeEvent.isComposing`) is also left alone, so committing a Korean or Japanese character never sends.
- **Newlines grow the textarea rather than scrolling it.** It starts at `rows=1`, and on every value change an effect resets `style.height` to `auto` and then to `scrollHeight`, so it grows with the content and has no maximum.
- **Clicking anywhere in the box starts typing.** The root's `onMouseDown` forwards focus to the textarea unless the click landed on or inside a genuinely interactive element (`button` / `input` / `textarea` / `a` / `role="button"`). That covers the padding, the gap between slot and textarea, the `justify-between` empty space between the attach and send buttons, and the gaps between slot items. Checking only "was the root itself clicked" would miss empty space inside full-width children such as the button row. When the value is empty, the caret is pinned to position 0, following the shared Input convention.

## Composition with other components

- **Button**: the attach button uses `variant="icon-rounded"` (no border/background, matching Figma's plain circular icon) and the send button uses `variant="icon"` (bordered square). Chatbox forwards `disabled` only and leaves styling to Button.
- **ChatboxComposer** (`components/app/chatbox-composer/`): bundles the two kinds of slot content — the image thumbnail row (with remove badges) and the filter chips row (reusing `Chips` with no remove badge, since filters are not deletable) — selected through its own `variant` prop. It consumes the atom's `onAttachFiles`, builds blob-URL thumbnails, and revokes them on removal. See [`chatbox-composer.md`](./chatbox-composer.md).

## Slot width and alignment

The Figma slot is `layoutAlign: STRETCH` (filling the root width) with `MIN` content alignment. The root shares that `MIN` only on its cross axis (horizontal) — its primary axis (vertical) is `CENTER`, not `MIN`. The code sets `align-items: flex-start` on the root, matching the cross-axis `MIN`, and **leaves width to the slot owner** — a consumer passing `w-full` resolves to the container width and produces the same result as Figma's STRETCH (the image row in `ChatboxComposer` does this). The chips row, which need not fill, stays hugged and only follows the left alignment. Note that `shouldFitContainer` on the root itself (added since this section was written) is the more direct way to stretch the _root's own_ width — the `w-full`-on-slot pattern above is about the slot filling the root, a separate concern.

## The slot's contents are not the atom's business

Figma's `Slot` being empty is a finished decision, not an unfinished one — the description calls it an empty slot that hugs whatever is placed in it, and the atom owns only width, alignment, and hugging. Thumbnail sizes, row heights, and badge offsets inside the slot are decided by whoever fills it (the app component), against their own Figma frame, and documented there.
