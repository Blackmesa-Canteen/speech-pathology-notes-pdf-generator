import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import { format } from 'date-fns'

import { pdfTheme } from '@/components/pdf/pdfTheme'
import { buildPdfMetadataKeywords } from '@/lib/pdfMetadata'
import type { SessionNotesFormValues } from '@/schemas/sessionNotesSchema'

const styles = StyleSheet.create({
  page: { ...pdfTheme.page },
  header: {
    marginBottom: pdfTheme.spacing.sectionGap,
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    color: pdfTheme.colors.heading,
    marginBottom: 6,
  },
  headerRule: {
    borderBottomWidth: 1,
    borderBottomColor: pdfTheme.colors.rule,
  },
  metaBlock: {
    marginBottom: pdfTheme.spacing.sectionGap,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: pdfTheme.spacing.fieldGap,
  },
  metaLabel: {
    width: 110,
    color: pdfTheme.colors.muted,
  },
  metaValue: {
    flex: 1,
  },
  section: {
    marginBottom: pdfTheme.spacing.sectionGap,
  },
  sectionHeading: {
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 0.5,
    color: pdfTheme.colors.heading,
    marginBottom: pdfTheme.spacing.fieldGap,
    textTransform: 'uppercase',
  },
  sectionBody: {
    whiteSpace: 'pre-wrap',
  },
  signOffRule: {
    borderTopWidth: 1,
    borderTopColor: pdfTheme.colors.rule,
    marginTop: 4,
    marginBottom: 12,
  },
  signatureRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: pdfTheme.spacing.fieldGap,
  },
  signatureLabel: {
    width: 110,
    color: pdfTheme.colors.muted,
  },
  signatureImage: {
    height: 40,
    maxWidth: 200,
    objectFit: 'contain',
  },
})

function Section({ title, body }: { title: string; body: string }) {
  if (!body.trim()) return null
  // @react-pdf/renderer's text layout can choke on one very long Text node
  // (thousands of characters) — splitting on blank lines into separate
  // Text nodes keeps each measurement small and avoids that failure mode.
  const paragraphs = body.split(/\n{2,}/).filter((p) => p.trim())
  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeading}>{title}</Text>
      {paragraphs.map((paragraph, index) => (
        <Text key={index} style={index > 0 ? [styles.sectionBody, { marginTop: 6 }] : styles.sectionBody}>
          {paragraph}
        </Text>
      ))}
    </View>
  )
}

export function SessionNotesPdf({ data }: { data: SessionNotesFormValues }) {
  const dateLabel = format(data.sessionDate, 'd MMMM yyyy')
  const nextVisitLabel = data.nextVisitDate ? format(data.nextVisitDate, 'd MMMM yyyy') : ''

  return (
    <Document
      title={`Session Notes - ${data.childFirstName} ${data.childSurname} - ${dateLabel}`}
      keywords={buildPdfMetadataKeywords(data)}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header} fixed>
          <Text style={styles.title}>Speech Pathology Session Notes</Text>
          <View style={styles.headerRule} />
        </View>

        <View style={styles.metaBlock}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Child</Text>
            <Text style={styles.metaValue}>
              {data.childFirstName} {data.childSurname}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Date</Text>
            <Text style={styles.metaValue}>
              {dateLabel} · {data.startTime} – {data.finishTime}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Present</Text>
            <Text style={styles.metaValue}>{data.presentParticipants.join(', ')}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Type of visit</Text>
            <Text style={styles.metaValue}>{data.typeOfVisit}</Text>
          </View>
        </View>

        <Section title="Session Goals" body={data.sessionGoals} />
        <Section title="Notes" body={data.notes} />
        <Section title="Between-Visit Plan" body={data.betweenVisitsPlan} />

        {(data.nextVisitPlan.trim() || nextVisitLabel) && (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>Next Visit Plan</Text>
            {data.nextVisitPlan.trim() && <Text style={styles.sectionBody}>{data.nextVisitPlan}</Text>}
            {nextVisitLabel && (
              <Text style={{ marginTop: pdfTheme.spacing.fieldGap }}>
                Next visit: {nextVisitLabel}
                {data.nextVisitTime ? `, ${data.nextVisitTime}` : ''}
              </Text>
            )}
          </View>
        )}

        <View style={styles.signOffRule} />
        <View style={styles.signatureRow}>
          <Text style={styles.signatureLabel}>Signature</Text>
          <Image src={data.signatureDataUrl} style={styles.signatureImage} />
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Clinician email</Text>
          <Text style={styles.metaValue}>{data.clinicianEmail}</Text>
        </View>

      </Page>
    </Document>
  )
}
