## CalloutModal — API

Purpose: An anchored, focus-trapping modal that blocks page interaction, auto-positions with Floating UI, supports ESC/outside dismiss (configurable), and optionally exposes a composable “Next” trigger that can scroll to another anchor and let the parent open the next callout.

## Props

| Prop                      | Type                                                                                               | Default         | Description                                                                                                                               |
| ------------------------- | -------------------------------------------------------------------------------------------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **open**                  | `boolean`                                                                                          | —               | Controls visibility of the callout modal.                                                                                                 |
| **onOpenChange**          | `(next: boolean, meta?: { reason?: 'esc' \| 'outside' \| 'backdrop' \| 'cta' }) => void`           | —               | Fired when the modal is opened or closed. `meta.reason` indicates how it was triggered.                                                   |
| **reference**             | `HTMLElement \| null \| VirtualElement`                                                            | —               | The anchor element or Floating UI virtual element to position against.                                                                    |
| **placement**             | `Placement \| 'auto'`                                                                              | `'auto'`        | Placement of the callout relative to the anchor. `'auto'` picks the best side.                                                            |
| **offsetPx**              | `number`                                                                                           | `12`            | Space (in px) between the anchor and callout.                                                                                             |
| **shiftPadding**          | `number`                                                                                           | `8`             | Minimum padding between the callout and viewport edge when shifting.                                                                      |
| **showArrow**             | `boolean`                                                                                          | `true`          | Shows or hides the arrow pointer.                                                                                                         |
| **dismissible**           | `boolean`                                                                                          | `true`          | Enables ESC and outside click to close.                                                                                                   |
| **closeOnEsc**            | `boolean`                                                                                          | `true`          | Closes on ESC key press (requires `dismissible`).                                                                                         |
| **closeOnOutsideClick**   | `boolean`                                                                                          | `true`          | Closes when clicking outside (requires `dismissible`).                                                                                    |
| **backdrop**              | `'invisible' \| 'dim' \| 'none'`                                                                   | `'invisible'`   | Backdrop style: invisible but blocks clicks, dim overlay, or none.                                                                        |
| **role**                  | `'dialog' \| 'alertdialog'`                                                                        | `'dialog'`      | ARIA role for accessibility.                                                                                                              |
| **ariaLabel**             | `string`                                                                                           | —               | Accessible label if no visible heading is provided.                                                                                       |
| **ariaLabelledby**        | `string`                                                                                           | —               | ID of the element labeling the dialog.                                                                                                    |
| **ariaDescribedby**       | `string`                                                                                           | —               | ID of the element describing the dialog.                                                                                                  |
| **returnFocusOnClose**    | `boolean`                                                                                          | `true`          | Restores focus to the previously focused element when closed.                                                                             |
| **zIndex**                | `number`                                                                                           | `1100`          | CSS z-index of the modal.                                                                                                                 |
| **container**             | `Element \| DocumentFragment \| null`                                                              | `document.body` | Portal target for rendering the callout.                                                                                                  |
| **preventBodyScroll**     | `boolean`                                                                                          | `true`          | Locks background scroll while open.                                                                                                       |
| **allowFreeFloatIfNoRef** | `boolean`                                                                                          | `true`          | If `true`, centers callout when no `reference` is provided.                                                                               |
| **header**                | `ReactNode`                                                                                        | —               | Optional header content.                                                                                                                  |
| **children**              | `ReactNode`                                                                                        | —               | The body content of the callout.                                                                                                          |
| **footerActions**         | `{ label: string; onClick: () => void; primary?: boolean; disabled?: boolean; testId?: string }[]` | —               | Array of footer CTA buttons. Does not close automatically.                                                                                |
| **renderFooter**          | `(actions: FooterAction[]) => ReactNode`                                                           | —               | Custom footer rendering function.                                                                                                         |
| **onRequestNext**         | `(nextRef?: HTMLElement \| null) => void`                                                          | —               | Called when the default Next button is clicked. Can perform **any action**, such as opening another callout or running a custom function. |
| **nextReference**         | `HTMLElement \| null`                                                                              | —               | Anchor for the next callout (used for scroll positioning).                                                                                |
| **nextButtonLabel**       | `string`                                                                                           | `'Next'`        | Label text for the default Next button.                                                                                                   |
| **scrollIntoViewOnNext**  | `boolean`                                                                                          | `true`          | Scrolls `nextReference` into view before calling `onRequestNext`.                                                                         |
| **showDefaultNextButton** | `boolean`                                                                                          | `true`          | Shows the default Next button when `onRequestNext` is provided.                                                                           |
| **className**             | `string`                                                                                           | —               | Optional custom class name.                                                                                                               |
| **style**                 | `CSSProperties`                                                                                    | —               | Inline styles.                                                                                                                            |
| **testId**                | `string`                                                                                           | —               | Testing identifier.                                                                                                                       |

---

### Notes

- `onRequestNext` can perform **any callback logic**: open another callout, trigger analytics, scroll to an element, start an animation, etc.
- When `dismissible={false}`, ESC and outside clicks will not close the modal. Use `onOpenChange` in a button or other event to close programmatically.
- `backdrop="invisible"` still blocks interaction with the background but is visually transparent.
- Accessibility: ensure you set either `ariaLabel` or `ariaLabelledby` for screen readers.

---

### Example

```tsx
<CalloutModal
  open={open}
  onOpenChange={(next) => setOpen(next)}
  reference={buttonRef.current}
  header="Quick tip"
  backdrop="dim"
  dismissible
  onRequestNext={(nextRef) => {
    console.log('Step complete');
    setOpenNextCallout(true);
  }}
>
  <p>Use filters to narrow your results.</p>
</CalloutModal>


# CalloutModal Component

A reusable, anchored modal for guided tours and callouts using Floating UI.

## Live Demo

[View on Vercel](https://poc-ivory-phi.vercel.app/)

## Features

- Anchored positioning with Floating UI
- Optional backdrop (`invisible` or `dim`)
- ESC / outside click dismiss (configurable)
- Composable "Next" callback for multi-step tours
- Accessibility: focus trap, aria attributes
- Portal rendering with scroll lock

## FlowChart
flowchart TD
  classDef step fill:#f7f9fc,stroke:#4a90e2,stroke-width:2px,color:#000,rx:6,ry:6
  classDef decision fill:#fffbe6,stroke:#f5a623,stroke-width:2px,color:#000,rx:6,ry:6

  A([Page / Feature Mounts]):::step --> B([Create Anchor Refs<br/>(refA, refB, refC, ... )]):::step
  B --> C([Hold Open State<br/>openId = 'a' | 'b' | null]):::step
  C --> D{Auto-open first once<br/>refs are ready?}:::decision
  D -- Yes --> E([setOpenId('a')]):::step
  D -- No --> F([Wait for User Action]):::step

  E --> G([Render CalloutModal A<br/>reference=refA, header/body/CTAs,<br/>dismissible?, onOpenChange]):::step
  F --> G

  G --> H{User clicks Next?}:::decision
  G --> I{Esc / Outside Click / Backdrop?}:::decision

  H -- Yes --> J([Optional: scroll nextReference<br/>into view]):::step
  J --> K([onRequestNext(nextReference)]):::step
  K --> L{Open next callout?}:::decision
  L -- Yes --> M([setOpenId('b') → Render CalloutModal B]):::step
  L -- No --> N([Run other callback<br/>(analytics, focus, etc.)]):::step

  I -- Yes & dismissible --> O([onOpenChange(false, reason)]):::step
  O --> P([Close current callout only<br/>(no auto-open next)]):::step
  I -- Not dismissible --> Q([Ignore dismiss, wait for CTA]):::step

  M --> R{Last callout?}:::decision
  R -- Yes --> S([Provide Done CTA<br/>setOpenId(null)]):::step
  R -- No --> T([Repeat Next Flow]):::step

```
