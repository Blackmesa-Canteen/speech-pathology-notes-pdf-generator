import { SessionNotesForm } from '@/components/form/SessionNotesForm'
import { TurnstileGate } from '@/components/TurnstileGate'

function App() {
  return (
    <TurnstileGate>
      <main className="min-h-screen bg-muted/30 px-4">
        <SessionNotesForm />
      </main>
    </TurnstileGate>
  )
}

export default App
