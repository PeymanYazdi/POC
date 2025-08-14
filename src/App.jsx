import React from 'react'
import { CalloutModal } from './components/CalloutModal.jsx'

export default function App() {
  // three independent callouts controlled here
  const [openId, setOpenId] = React.useState(null) // 'a' | 'b' | 'c' | null

  const refA = React.useRef(null)
  const refB = React.useRef(null)
  const refC = React.useRef(null)

  // Auto-open first callout ONCE after all refs are mounted
  const [autoOpened, setAutoOpened] = React.useState(false);
  React.useEffect(() => {
    if (!autoOpened && refA.current && refB.current && refC.current) {
      setOpenId('a');
      setAutoOpened(true)  
    }
  }, [autoOpened]);

  // On page load, open the first callout once refs are mounted
  const openNext = (current) => {
    if (current === 'a') setOpenId('b')
    else if (current === 'b') setOpenId('c')
    else setOpenId(null)
  }

  return (
    <div className="container">
      <h1>Simple Callout Modal (Composable “Next”)</h1>
      <p>Each callout is a standalone modal. The parent chooses what to open next via a callback.</p>

      <div className="row">
        <button className="btn" ref={refA} onClick={() => setOpenId('a')}>Open A</button>
        <button className="btn secondary" onClick={() => setOpenId(null)}>Close all</button>
      </div>

      <div ref={refB} className="anchor-card">
        <strong>Card B (Anchor)</strong>
        <p style={{ margin: 0 }}>Resize the viewport to see auto placement/flip/shift.</p>
      </div>

      <a ref={refC} href="#" style={{ display: 'inline-block', marginTop: 80, color: '#a5b4fc' }}>
        Help link (Anchor C)
      </a>

      {/* Callout A */}
      <CalloutModal
        open={openId === 'a'}
        onOpenChange={(next) => setOpenId(next ? 'a' : null)}
        reference={refA.current}
        placement="bottom-start"
        backdrop="invisible"
        header="Welcome to the dashboard"
        dismissible={true}
        // Pass a function to trigger the next callout and (optionally) scroll to it
        onRequestNext={() => openNext('a')}
        nextReference={refB.current}
        nextButtonLabel="Next"
        scrollIntoViewOnNext={true}
      >
        <p>Start here. Clicking Next will scroll to Card B and open the next callout.</p>
      </CalloutModal>

      {/* Callout B */}
      <CalloutModal
        open={openId === 'b'}
        onOpenChange={(next) => setOpenId(next ? 'b' : null)}
        reference={refB.current}
        placement="auto"
        backdrop="invisible"
        header="Card actions"
        dismissible={false}
        onRequestNext={() => openNext('b')}
        nextReference={refC.current}
        nextButtonLabel="Next"
        scrollIntoViewOnNext={true}
      >
        <p>This callout auto-places to stay on-screen. Hit Next to go to the Help link.</p>
      </CalloutModal>

      {/* Callout C */}
      <CalloutModal
        open={openId === 'c'}
        onOpenChange={(next) => setOpenId(next ? 'c' : null)}
        reference={refC.current}
        placement="right"
        backdrop="invisible"
        header="Learn more"
        footerActions={[{ label: 'Done', primary: true, onClick: () => setOpenId(null) }]}
      >
        <p>Final callout. Click Done to close.</p>
      </CalloutModal>
    </div>
  )
}
