CalloutModal — API

Purpose: An anchored, focus-trapping modal that blocks page interaction, auto-positions with Floating UI, supports ESC/outside dismiss (configurable), and optionally exposes a composable “Next” trigger that can scroll to another anchor and let the parent open the next callout.

Props

open: boolean
Controls visibility.

onOpenChange(next: boolean, meta?: { reason?: 'esc' | 'outside' | 'backdrop' | 'cta' })
Fired on open/close.

We pass reason = 'esc' | 'outside' | 'backdrop' for those dismisses.

Use 'cta' yourself if you close from a CTA and want to tag analytics (the component doesn’t emit 'cta' by itself).

reference: HTMLElement | null | { getBoundingClientRect(): DOMRect, contextElement?: Element | null }
Anchor element (or a Floating-UI virtual element). When null, see allowFreeFloatIfNoRef.

Positioning

placement?: Placement | 'auto' (default: 'auto')
Any Floating UI placement, e.g. 'bottom-start', 'right'. 'auto' finds the best side.

offsetPx?: number (default: 12)
Gap between anchor and panel.

shiftPadding?: number (default: 8)
Minimum viewport padding when shifting to stay visible.

showArrow?: boolean (default: true)
Renders a pointer/arrow.

Dismiss / Modal behavior

dismissible?: boolean (default: true)
Master toggle. If false, ESC and outside/backdrop do not close the modal. (Backdrop still blocks interaction.)

closeOnEsc?: boolean (default: true)
Requires dismissible to be true.

closeOnOutsideClick?: boolean (default: true)
Requires dismissible to be true.

backdrop?: 'invisible' | 'dim' | 'none' (default: 'invisible')

'invisible': fully transparent but blocks clicks behind.

'dim': semi-transparent overlay.

'none': no backdrop (still a modal; background is blocked via focus/ARIA + scroll-lock).

A11y & Focus

role?: 'dialog' | 'alertdialog' (default: 'dialog')

ariaLabel?: string, ariaLabelledby?: string, ariaDescribedby?: string

returnFocusOnClose?: boolean (default: true)
Returns focus to the previously focused element.

(Auto focus trap is built-in: first/last focusable wrap; focuses [data-autofocus] → first focusable → panel.)

Portal & layering

zIndex?: number (default: 1100)

container?: Element | DocumentFragment | null
Custom portal target (defaults to document.body).

preventBodyScroll?: boolean (default: true)
Locks body scroll while open.

allowFreeFloatIfNoRef?: boolean (default: true)
If true and reference is null, centers the panel in the viewport; if false, renders nothing.

Content

header?: ReactNode

children: ReactNode (body content)

footerActions?: { label: string; onClick: () => void | Promise<void>; primary?: boolean; disabled?: boolean; testId?: string }[]
Renders CTA buttons on the right; does not auto-close—your handler calls onOpenChange(false, {reason:'cta'}) if desired.

renderFooter?: (actions: FooterAction[]) => ReactNode
Custom footer renderer (use with your DS Button).

Composable “Next” trigger (optional)

onRequestNext?: (nextRef: HTMLElement | null) => void
If provided, a default Next button is shown (unless you hide it—see below). Clicking it:

Optionally scrolls nextReference into view, then

Calls onRequestNext(nextReference) so your parent can open the next callout.

nextReference?: HTMLElement | null
Anchor for the next callout (used for smooth scroll).

nextButtonLabel?: string (default: 'Next')

scrollIntoViewOnNext?: boolean (default: true)

showDefaultNextButton?: boolean (default: true)

Styling & test hooks

className?: string, style?: CSSProperties

testId?: string

Dismiss semantics (what happens when…)

ESC press → calls onOpenChange(false, {reason:'esc'}) only if dismissible && closeOnEsc.

Backdrop / outside click → calls onOpenChange(false, {reason:'backdrop'|'outside'}) only if dismissible && closeOnOutsideClick.

Default Next button → never dismisses by itself; it calls onRequestNext(nextReference). Your parent decides whether to close current and open the next.

Your footerActions → never auto-dismiss. In your action, call onOpenChange(false, {reason:'cta'}) if you want to close.

Usage patterns

1. Basic anchored callout (dismissible)
   const ref = useRef<HTMLButtonElement>(null);
   const [open, setOpen] = useState(false);

<button ref={ref} onClick={() => setOpen(true)}>Help</button>

<CalloutModal
open={open}
onOpenChange={(next) => setOpen(next)}
reference={ref.current}
header="Quick tip"
placement="bottom-start"
backdrop="invisible"

>

  <p>Use filters to narrow results.</p>
</CalloutModal>

2. Non-dismissible until action completes
   <CalloutModal
   open={open}
   onOpenChange={(next) => setOpen(next)}
   reference={ref.current}
   header="Confirm settings"
   dismissible={false} // ESC/outside disabled
   footerActions={[
   { label: 'Cancel', onClick: () => setOpen(false) }, // programmatic close
   {
   label: 'Apply',
   primary: true,
   onClick: async () => { await save(); setOpen(false); }
   }
   ]}
   />

3. Composable “Next” (parent manages what opens next)
   const [openId, setOpenId] = useState<'a'|'b'|'c'|null>('a');
   const refA = useRef<HTMLButtonElement>(null);
   const refB = useRef<HTMLDivElement>(null);
   const refC = useRef<HTMLAnchorElement>(null);

const openNext = (from: 'a'|'b'|'c') => {
if (from === 'a') setOpenId('b');
else if (from === 'b') setOpenId('c');
else setOpenId(null);
};

{/_ A _/}
<CalloutModal
open={openId === 'a'}
onOpenChange={(next, meta) => { if (!next) setOpenId(null); }}
reference={refA.current}
header="Welcome"
onRequestNext={() => { setOpenId('b'); }}
nextReference={refB.current}
scrollIntoViewOnNext
/>

{/_ B _/}
<CalloutModal
open={openId === 'b'}
onOpenChange={(next, meta) => { if (!next) setOpenId(null); }}
reference={refB.current}
header="Card actions"
dismissible={false}
onRequestNext={() => { setOpenId('c'); }}
nextReference={refC.current}
/>

{/_ C with Done _/}
<CalloutModal
open={openId === 'c'}
onOpenChange={(next) => setOpenId(next ? 'c' : null)}
reference={refC.current}
header="Learn more"
footerActions={[
{ label: 'Done', primary: true, onClick: () => setOpenId(null) }
]}
/>

4. Open first callout once on load (no re-open on dismiss)
   const [openId, setOpenId] = useState<'a'|'b'|'c'|null>(null);
   const [autoOpened, setAutoOpened] = useState(false);
   const refA = useRef(null); const refB = useRef(null); const refC = useRef(null);

useEffect(() => {
if (!autoOpened && refA.current && refB.current && refC.current) {
setOpenId('a');
setAutoOpened(true); // prevents re-open after dismiss
}
}, [autoOpened]);

Accessibility notes

aria-modal and focus trap are included. Screen readers will announce a new dialog each time you mount it (good for clarity).

Provide either ariaLabel or ariaLabelledby pointing to your header text.

Backdrop “invisible” blocks interaction without visual dimming (meets your “non-interactive background” requirement).

Tips & gotchas

If an anchor might not exist yet, keep allowFreeFloatIfNoRef = true to center the callout, or don’t render until the ref is non-null (parent check).

The default Next button appears only when you pass onRequestNext. Hide it via showDefaultNextButton={false} and render your own in footerActions if you want full control.

Dismiss handling is explicit:

ESC/outside/backdrop → reason: 'esc' | 'outside' | 'backdrop'

Your CTA → call onOpenChange(false, {reason: 'cta'}) if you want to close and tag analytics.

If you want, I can convert the inline styles to your design tokens (spacing, radii, elevation) and swap the footer CTAs to your DS <Button /> API so teams get the exact look/feel out of the box.

You said:
can onRequestNext get any other callback function to perform something else?
ChatGPT said:

Yes — onRequestNext in this design isn’t limited to opening another callout.
It’s just a callback you own, so you can use it for any side effect you need when the user clicks the default “Next” button (or when you call it from a custom CTA).

For example, besides opening the next callout, you could:

Trigger analytics events

onRequestNext={(nextRef) => {
analytics.track('Callout Step Completed', { step: 'a' });
setOpenId('b');
}}

Scroll and focus a different element

onRequestNext={() => {
document.querySelector('#form-section')?.scrollIntoView({ behavior: 'smooth' });
document.querySelector('#first-input')?.focus();
}}

Trigger form validation or API calls before continuing

onRequestNext={async () => {
const valid = await validateStepA();
if (valid) setOpenId('b');
}}

Chain to completely different UI (e.g., show a toast, open a sidebar)

onRequestNext={() => {
toast.success('Tutorial step complete!');
openSidebar('help');
}}

Basically, the component’s default “Next” button will call whatever you give onRequestNext, passing nextReference if you provided it.
The component itself doesn’t enforce “must open another callout” — that’s just the common use case.

# CalloutModal Component

A reusable, anchored modal for guided tours and callouts using Floating UI.

## Live Demo

[View on Vercel](https://your-vercel-link.vercel.app)

## Features

- Anchored positioning with Floating UI
- Optional backdrop (`invisible` or `dim`)
- ESC / outside click dismiss (configurable)
- Composable "Next" callback for multi-step tours
- Accessibility: focus trap, aria attributes
- Portal rendering with scroll lock
