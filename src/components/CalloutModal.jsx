import React from 'react'
import { createPortal } from 'react-dom'
import {
  useFloating,
  offset,
  flip,
  shift,
  arrow as arrowMw,
  autoUpdate,
  autoPlacement,
  limitShift,
} from '@floating-ui/react'

function useIsomorphicLayoutEffect(effect, deps) {
  const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined'
  return (isBrowser ? React.useLayoutEffect : React.useEffect)(effect, deps)
}

function getFocusable(container) {
  if (!container) return []
  const selectors =
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  return Array.from(container.querySelectorAll(selectors)).filter(
    (el) => !el.hasAttribute('disabled') && el.tabIndex !== -1 && !el.getAttribute('aria-hidden')
  )
}

function lockBodyScroll(lock) {
  if (typeof document === 'undefined') return
  const body = document.body
  const original = body.__callout_scroll_lock__ || { count: 0, prev: '' }
  if (lock) {
    if (original.count === 0) {
      original.prev = body.style.overflow
      body.style.overflow = 'hidden'
    }
    original.count += 1
  } else {
    original.count = Math.max(0, original.count - 1)
    if (original.count === 0) {
      body.style.overflow = original.prev || ''
    }
  }
  body.__callout_scroll_lock__ = original
}

function setSiblingsAriaHidden(target, hidden) {
  if (!target || !target.parentElement) return
  const parent = target.parentElement
  Array.from(parent.children).forEach((sib) => {
    if (sib === target) return
    if (hidden) {
      if ('inert' in HTMLElement.prototype) {
        sib.inert = true
      } else {
        sib.setAttribute('aria-hidden', 'true')
        sib.setAttribute('data-callout-aria-hidden', 'true')
      }
    } else {
      if ('inert' in HTMLElement.prototype) {
        sib.inert = false
      } else if (sib.hasAttribute('data-callout-aria-hidden')) {
        sib.removeAttribute('aria-hidden')
        sib.removeAttribute('data-callout-aria-hidden')
      }
    }
  })
}

export function CalloutModal({
  open,
  onOpenChange,
  reference,
  placement = 'auto',
  offsetPx = 12,
  shiftPadding = 8,
  showArrow = true,
  closeOnEsc = true,
  closeOnOutsideClick = true,
  backdrop = 'invisible',
  zIndex = 1100,
  preventBodyScroll = true,
  returnFocusOnClose = true,
  allowFreeFloatIfNoRef = true,
  dismissible = true,
  role = 'dialog',
  ariaLabel,
  ariaLabelledby,
  ariaDescribedby,
  header,
  children,
  footerActions = [],
  renderFooter,
  className,
  style,
  container,
  testId,
  // new: optional next trigger props
  onRequestNext,
  nextReference,
  nextButtonLabel = 'Next',
  scrollIntoViewOnNext = true,
  showDefaultNextButton = true,
}) {
  const panelRef = React.useRef(null)
  const arrowRef = React.useRef(null)
  const lastFocused = React.useRef(null)
  const [portalNode, setPortalNode] = React.useState(null)

  useIsomorphicLayoutEffect(() => {
    setPortalNode(container || (typeof document !== 'undefined' ? document.body : null))
  }, [container])

  const middleware = React.useMemo(() => {
    const base = [
      offset(offsetPx),
      placement === 'auto' ? autoPlacement({ alignment: 'start' }) : flip(),
      shift({ padding: shiftPadding, limiter: limitShift() }),
    ]
    if (showArrow) base.push(arrowMw({ element: arrowRef }))
    return base
  }, [placement, offsetPx, shiftPadding, showArrow])

  const { x, y, strategy: posStrategy, refs, placement: finalPlacement, middlewareData, update } =
    useFloating({
      placement: placement === 'auto' ? 'top' : placement,
      strategy: 'fixed',
      whileElementsMounted: (refEl, floEl, cleanup) => autoUpdate(refEl, floEl, update),
      middleware,
    })

  React.useEffect(() => {
    refs.setReference(reference)
  }, [reference, refs])

  React.useEffect(() => {
    if (!open) return
    if (preventBodyScroll) lockBodyScroll(true)
    if (portalNode) setSiblingsAriaHidden(portalNode, true)
    return () => {
      if (preventBodyScroll) lockBodyScroll(false)
      if (portalNode) setSiblingsAriaHidden(portalNode, false)
    }
  }, [open, preventBodyScroll, portalNode])

  React.useEffect(() => {
    if (!open) return
    lastFocused.current = document.activeElement || null
    const node = panelRef.current
    if (!node) return
    const autofocus =
      node.querySelector('[data-autofocus]') ||
      getFocusable(node)[0] ||
      node
    autofocus.focus({ preventScroll: true })
    return () => {
      if (returnFocusOnClose && lastFocused.current) {
        lastFocused.current.focus({ preventScroll: true })
      }
    }
  }, [open, returnFocusOnClose])

  React.useEffect(() => {
    if (!open) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && closeOnEsc && dismissible) {
        e.stopPropagation()
        onOpenChange(false, { reason: 'esc' })
        return
      }
      if (e.key === 'Tab') {
        const node = panelRef.current
        if (!node) return
        const focusables = getFocusable(node)
        if (focusables.length === 0) {
          e.preventDefault()
          node.focus()
          return
        }
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKeyDown, true)
    return () => document.removeEventListener('keydown', onKeyDown, true)
  }, [open, closeOnEsc, onOpenChange])

  React.useEffect(() => {
    if (!open || !closeOnOutsideClick || !dismissible) return
    const onDocPointer = (e) => {
      const target = e.target
      const panel = panelRef.current
      if (!panel) return
      if (panel.contains(target)) return
      const refEl = refs.reference?.current
      if (refEl && refEl.contains?.(target)) return
      onOpenChange(false, { reason: 'outside' })
    }
    document.addEventListener('pointerdown', onDocPointer, true)
    return () => document.removeEventListener('pointerdown', onDocPointer, true)
  }, [open, closeOnOutsideClick, onOpenChange, refs.reference])

  if (!open || !portalNode) return null

  const noRef = !reference
  const allowCenter = allowFreeFloatIfNoRef
  const arrowData = middlewareData.arrow || {}
  const side = (finalPlacement?.split('-')[0]) || 'top'
  const staticSide = { top: 'bottom', right: 'left', bottom: 'top', left: 'right' }[side]

  const panelNode = (
    <div data-testid={testId} aria-hidden={false} style={{ position: 'fixed', inset: 0, zIndex }}>
      {backdrop !== 'none' && (
        <div
          onClick={() => { if (dismissible) onOpenChange(false, { reason: 'backdrop' }) }}
          aria-hidden
          style={{
            position: 'fixed',
            inset: 0,
            background: backdrop === 'dim' ? 'rgba(0,0,0,0.45)' : 'transparent',
            pointerEvents: 'auto',
          }}
        />
      )}

      <div
        role='dialog'
        aria-modal='true'
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        aria-describedby={ariaDescribedby}
        ref={noRef && allowCenter ? undefined : refs.setFloating}
        style={{
          position: noRef && allowCenter ? 'fixed' : posStrategy,
          top: noRef && allowCenter ? '50%' : (y ?? 0),
          left: noRef && allowCenter ? '50%' : (x ?? 0),
          transform: noRef && allowCenter ? 'translate(-50%, -50%)' : undefined,
          outline: 'none',
          pointerEvents: 'auto',
        }}
      >
        <div ref={panelRef} tabIndex={-1} className={className || 'callout-panel'} style={style}>
          {header ? <div className='callout-header'>{header}</div> : null}
          <div className='callout-body'>{children}</div>
          {(onRequestNext || footerActions.length > 0 || renderFooter) && (
            <div className='callout-footer'>
              {renderFooter
                ? renderFooter(footerActions)
                : (
                    <>
                      {footerActions.map((a, i) => (
                        <button
                          key={i}
                          onClick={async () => { await a.onClick() }}
                          disabled={a.disabled}
                          data-testid={a.testId}
                          className={`callout-btn ${a.primary ? 'primary' : ''}`}
                          style={{ marginInlineStart: i > 0 ? 8 : 0 }}
                        >
                          {a.label}
                        </button>
                      ))}
                      {onRequestNext && showDefaultNextButton && (
                        <button
                          className='callout-btn primary'
                          style={{ marginInlineStart: footerActions.length ? 8 : 0 }}
                          onClick={async () => {
                            const target = nextReference;
                            if (scrollIntoViewOnNext && target && 'scrollIntoView' in target) {
                              try { target.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
                              catch {}
                              // give the browser a tick to layout after scroll
                              await new Promise(r => setTimeout(r, 250));
                            }
                            onRequestNext(target || null);
                          }}
                        >{nextButtonLabel}</button>
                      )}
                    </>
                  )}
            </div>
          )}
        </div>

        {showArrow && !noRef && (
          <div
            ref={arrowRef}
            aria-hidden
            style={{
              position: 'absolute',
              width: 10,
              height: 10,
              transform: 'rotate(45deg)',
              background: 'white',
              boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
              left: arrowData.x != null ? `${arrowData.x}px` : '',
              top: arrowData.y != null ? `${arrowData.y}px` : '',
              [staticSide]: '-5px',
            }}
          />
        )}
      </div>
    </div>
  )

  return createPortal(panelNode, portalNode)
}
