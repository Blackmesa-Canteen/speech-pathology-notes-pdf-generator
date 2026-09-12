import { zodResolver } from '@hookform/resolvers/zod'
import * as React from 'react'
import { useForm } from 'react-hook-form'

import { AutoGrowTextarea } from '@/components/form/AutoGrowTextarea'
import { DatePickerField } from '@/components/form/DatePickerField'
import { PresetCombobox, PresetTagInput } from '@/components/form/PresetCombobox'
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
  type SessionNotesFormValues,
  sessionNotesDefaultValues,
  sessionNotesSchema,
} from '@/schemas/sessionNotesSchema'

export function SessionNotesForm() {
  const [status, setStatus] = React.useState<'idle' | 'generating' | 'success' | 'error'>('idle')

  const form = useForm<SessionNotesFormValues>({
    resolver: zodResolver(sessionNotesSchema),
    defaultValues: { ...sessionNotesDefaultValues, ...loadDraft() },
    mode: 'onBlur',
  })

  React.useEffect(() => {
    const timeout = { current: undefined as ReturnType<typeof setTimeout> | undefined }
    const unsubscribe = form.watch((values) => {
      clearTimeout(timeout.current)
      timeout.current = setTimeout(() => saveDraft(values), 400)
    })
    return () => {
      clearTimeout(timeout.current)
      unsubscribe.unsubscribe()
    }
  }, [form])

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
            Fill in the details below, then generate the PDF. Nothing you type here leaves your
            browser.
          </p>
        </div>

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
                    <PresetTagInput
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      options={presets.presentParticipants}
                      placeholder="Type to add or pick from list…"
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
