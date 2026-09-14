import { zodResolver } from '@hookform/resolvers/zod'
import * as React from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { AutoGrowTextarea } from '@/components/form/AutoGrowTextarea'
import { DatePickerField } from '@/components/form/DatePickerField'
import { ImportPdfButton } from '@/components/form/ImportPdfButton'
import { ParticipantsField } from '@/components/form/ParticipantsField'
import { PresetCombobox } from '@/components/form/PresetCombobox'
import { SignaturePad } from '@/components/form/SignaturePad'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { presets } from '@/config/presets'
import { clearDraft, loadDraft, saveDraft } from '@/lib/draftStorage'
import { downloadBlob } from '@/lib/downloadBlob'
import { buildSessionNotesFilename } from '@/lib/filename'
import {
  type Participant,
  type SessionNotesFormValues,
  sessionNotesDefaultValues,
  sessionNotesSchema,
} from '@/schemas/sessionNotesSchema'

const CHILD_ROLE = 'Child'

/**
 * Whether the auto-added "child" participant should stay suppressed: true
 * only when the child's name is already known but no Child-role entry is
 * present, i.e. someone deliberately removed it (rather than it just never
 * having been added yet on a blank form).
 */
function computeChildDismissed(values: Partial<SessionNotesFormValues>) {
  const hasChildName = Boolean(values.childFirstName?.trim() || values.childSurname?.trim())
  const hasChildParticipant = values.presentParticipants?.some((p) => p.role === CHILD_ROLE) ?? false
  return hasChildName && !hasChildParticipant
}

export function SessionNotesForm() {
  const [status, setStatus] = React.useState<'idle' | 'generating' | 'success' | 'error'>('idle')
  const initialValues = React.useMemo(() => ({ ...sessionNotesDefaultValues, ...loadDraft() }), [])
  const [childDismissed, setChildDismissed] = React.useState(() => computeChildDismissed(initialValues))

  const form = useForm<SessionNotesFormValues>({
    resolver: zodResolver(sessionNotesSchema),
    defaultValues: initialValues,
    mode: 'onBlur',
  })

  const childFirstName = useWatch({ control: form.control, name: 'childFirstName' })
  const childSurname = useWatch({ control: form.control, name: 'childSurname' })

  React.useEffect(() => {
    if (childDismissed) return
    const childName = `${childFirstName} ${childSurname}`.trim()
    if (!childName) return

    const current = form.getValues('presentParticipants')
    const index = current.findIndex((p) => p.role === CHILD_ROLE)
    if (index === -1) {
      form.setValue('presentParticipants', [...current, { role: CHILD_ROLE, name: childName }])
    } else if (current[index].name !== childName) {
      const next = [...current]
      next[index] = { ...next[index], name: childName }
      form.setValue('presentParticipants', next)
    }
  }, [childFirstName, childSurname, childDismissed, form])

  React.useEffect(() => {
    const timeout = { current: undefined as ReturnType<typeof setTimeout> | undefined }
    const unsubscribe = form.watch((values) => {
      clearTimeout(timeout.current)
      // form.watch() types its callback's values as deeply partial (nested
      // array items can be partial too); saveDraft only needs a shallow
      // Partial and handles missing/malformed data as best-effort anyway.
      timeout.current = setTimeout(() => saveDraft(values as Partial<SessionNotesFormValues>), 400)
    })
    return () => {
      clearTimeout(timeout.current)
      unsubscribe.unsubscribe()
    }
  }, [form])

  const handleImport = (values: SessionNotesFormValues) => {
    form.reset(values)
    setChildDismissed(computeChildDismissed(values))
    setStatus('idle')
  }

  const onSubmit = async (values: SessionNotesFormValues) => {
    setStatus('generating')
    try {
      // Lazy-loaded: @react-pdf/renderer + its font/layout engine are heavy
      // and only needed once the user actually generates a PDF.
      const [{ pdf }, { SessionNotesPdf }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('@/components/pdf/SessionNotesPdf'),
      ])
      const blob = await pdf(<SessionNotesPdf data={values} />).toBlob()
      downloadBlob(blob, buildSessionNotesFilename(values))
      clearDraft()
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-2xl space-y-6 py-8">
        <div>
          <h1 className="text-2xl font-semibold">Speech Pathology Session Notes</h1>
          <p className="text-sm text-muted-foreground">
            A free tool for speech pathologists to write up session notes and turn them into a
            clean PDF. Made for my wife&apos;s caseload, shared in case it helps other clinicians
            — and the kids they work with.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Your notes never leave your computer. Everything — typing, the signature, and
            building the PDF — happens right in your browser, with nothing sent to a server. The
            only thing that talks to the internet is a quick &quot;prove you&apos;re not a
            robot&quot; check when the page loads, and it doesn&apos;t see anything you type.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Feedback or feature requests? Reach out at{' '}
            <a href="mailto:admin@996workers.org" className="underline">
              admin@996workers.org
            </a>
            .
          </p>
        </div>

        <ImportPdfButton onImport={handleImport} />

        <Card>
          <CardHeader>
            <CardTitle>Child &amp; Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="childFirstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Child's first name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="childSurname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Child's surname</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="sessionDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Session date</FormLabel>
                  <FormControl>
                    <DatePickerField
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      aria-invalid={!!form.formState.errors.sessionDate}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="finishTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Finish time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Participants &amp; Visit Type</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="presentParticipants"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Present participants</FormLabel>
                  <FormControl>
                    <ParticipantsField
                      value={field.value}
                      onChange={(next: Participant[]) => {
                        if (next.length < field.value.length && !next.some((p) => p.role === CHILD_ROLE)) {
                          setChildDismissed(true)
                        }
                        field.onChange(next)
                      }}
                      onBlur={field.onBlur}
                      roleOptions={presets.participantRoles}
                      aria-invalid={!!form.formState.errors.presentParticipants}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="typeOfVisit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type of visit</FormLabel>
                  <FormControl>
                    <PresetCombobox
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      options={presets.typeOfVisit}
                      placeholder="Pick or type a visit type…"
                      aria-invalid={!!form.formState.errors.typeOfVisit}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Goals &amp; Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="sessionGoals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Session goals</FormLabel>
                  <FormControl>
                    <AutoGrowTextarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <AutoGrowTextarea rows={5} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Follow-up Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="betweenVisitsPlan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Between-visits plan</FormLabel>
                  <FormControl>
                    <AutoGrowTextarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nextVisitPlan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Next visit plan</FormLabel>
                  <FormControl>
                    <AutoGrowTextarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nextVisitDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Next visit date</FormLabel>
                    <FormControl>
                      <DatePickerField value={field.value} onChange={field.onChange} onBlur={field.onBlur} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nextVisitTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Next visit time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sign-off</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="signatureDataUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Signature</FormLabel>
                  <FormControl>
                    <SignaturePad
                      value={field.value}
                      onChange={field.onChange}
                      aria-invalid={!!form.formState.errors.signatureDataUrl}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="clinicianEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clinician email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col items-end gap-2">
          {status === 'error' && (
            <p className="text-sm text-destructive">
              Something went wrong generating the PDF. Please try again.
            </p>
          )}
          {status === 'success' && (
            <p className="text-sm text-muted-foreground">PDF downloaded.</p>
          )}
          <Button type="submit" size="lg" disabled={status === 'generating'}>
            {status === 'generating' ? 'Generating…' : 'Generate & Download PDF'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
