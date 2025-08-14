import React from 'react'
import { CalloutModal } from './CalloutModal.jsx'

export function ChainedCallouts({
  steps,
  open,
  onOpenChange,
  dismissMode = 'next',
  onFinish,
  backdrop = 'invisible',
  zIndex = 1100,
  closeOnEsc = true,
  closeOnOutsideClick = true,
  placement = 'auto',
  className,
  style,
  waitForAnchor = true, // NEW: don't render until reference exists
}) {
  const [index, setIndex] = React.useState(0)

  React.useEffect(() => {
    if (index > steps.length - 1) setIndex(0)
  }, [steps, index])

  if (!open || steps.length === 0) return null
  const step = steps[index]
  const isLast = index >= steps.length - 1

  // If the current step's anchor ref isn't ready yet, don't render the modal.
  if (waitForAnchor && !step.reference) {
    return null;
  }

  const goNext = async () => {
    if (isLast) {
      onOpenChange(false)
      onFinish?.()
    } else {
      setIndex((i) => i + 1)
    }
  }

  const handleOpenChange = (next, meta) => {
    if (next) {
      onOpenChange(true)
      return
    }
    if (dismissMode === 'next') {
      goNext()
    } else {
      onOpenChange(false)
      onFinish?.()
    }
  }

  const actions = [
    ...(step.footerActions || []),
    { label: isLast ? 'Done' : 'Next', primary: true, onClick: goNext },
  ]

  return (
    <CalloutModal
      key={step.id}
      open={true}
      onOpenChange={handleOpenChange}
      reference={step.reference}
      placement={step.placement || placement}
      backdrop={backdrop}
      zIndex={zIndex}
      closeOnEsc={closeOnEsc}
      closeOnOutsideClick={closeOnOutsideClick}
      header={step.title}
      footerActions={actions}
      className={className}
      style={style}
    >
      {step.content}
    </CalloutModal>
  )
}
