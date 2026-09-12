import { expect, type Page, test } from '@playwright/test'

async function fillEssentialFields(page: Page) {
  await page.getByLabel("Child's first name").fill('Ava')
  await page.getByLabel("Child's surname").fill('Smith')

  await page.getByLabel('Session date').click()
  // Pick the first day belonging to the currently-displayed month (not a
  // leading/trailing day from the previous/next month) — robust regardless
  // of what day it is when the test happens to run.
  await page.locator('[data-slot="popover-content"] td:not(.opacity-50) button').first().click()

  await page.getByLabel('Start time').fill('09:30')
  await page.getByLabel('Finish time').fill('10:15')

  // Child's first/last name (filled above) auto-adds an "Ava Smith (Child)"
  // participant; this adds a second one via the role/name add-row.
  await page.getByRole('button', { name: 'Add participant' }).click()
  const roleInput = page.getByLabel('Participant role')
  await roleInput.click()
  await roleInput.fill('Mother')
  await page.locator('[data-slot="command-item"]').filter({ hasText: 'Mother' }).first().click()
  await page.getByLabel('Participant name').fill('Jane Smith')
  await page.getByRole('button', { name: 'Confirm add participant' }).click()

  const visitTypeInput = page.getByLabel('Type of visit')
  await visitTypeInput.click()
  await visitTypeInput.fill('Therapy session')
  await page.keyboard.press('Escape')

  await page.getByLabel('Session goals').fill('Improve /s/ sound production.')

  const canvas = page.locator('canvas')
  await canvas.scrollIntoViewIfNeeded()
  const box = await canvas.boundingBox()
  if (!box) throw new Error('signature canvas not found')
  await page.mouse.move(box.x + 20, box.y + 20)
  await page.mouse.down()
  await page.mouse.move(box.x + 80, box.y + 60, { steps: 5 })
  await page.mouse.move(box.x + 140, box.y + 20, { steps: 5 })
  await page.mouse.up()

  await page.getByLabel('Clinician email').fill('jane@example.com')
}

test('shows validation errors when submitting an empty form', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Generate & Download PDF/ }).click()
  await expect(page.getByText('Signature is required')).toBeVisible()
  await expect(page.getByText('Add at least one participant')).toBeVisible()
})

test('auto-adds the child as a participant, and respects removing it', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel("Child's first name").fill('Ava')
  await page.getByLabel("Child's surname").fill('Smith')
  await expect(page.getByText('Ava Smith (Child)')).toBeVisible()

  await page.getByRole('button', { name: /Remove Ava Smith/ }).click()
  await expect(page.getByText('Ava Smith (Child)')).toHaveCount(0)

  // Further edits to the child's name shouldn't resurrect a dismissed entry.
  await page.getByLabel("Child's surname").fill('Smithson')
  await expect(page.getByText('Ava Smithson (Child)')).toHaveCount(0)
})

test('fills the essential fields and downloads a PDF', async ({ page }) => {
  await page.goto('/')
  await fillEssentialFields(page)

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: /Generate & Download PDF/ }).click()
  const download = await downloadPromise

  expect(download.suggestedFilename()).toMatch(/^SessionNotes_Smith_Ava_\d{4}-\d{2}-\d{2}\.pdf$/)
})

test('re-imports a previously generated PDF to prefill the form', async ({ page }) => {
  await page.goto('/')
  await fillEssentialFields(page)

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: /Generate & Download PDF/ }).click()
  const download = await downloadPromise
  const pdfPath = await download.path()
  if (!pdfPath) throw new Error('downloaded PDF has no local path')

  // Clear the autosaved draft first — otherwise the next page load would
  // already show these same values from the draft, and the test wouldn't
  // actually prove the *import* is what prefilled the form.
  await page.evaluate(() => localStorage.clear())
  await page.goto('/')
  await expect(page.getByLabel("Child's first name")).toHaveValue('')

  await page.locator('input[type="file"]').setInputFiles(pdfPath)

  await expect(page.getByLabel("Child's first name")).toHaveValue('Ava')
  await expect(page.getByLabel("Child's surname")).toHaveValue('Smith')
  await expect(page.getByLabel('Clinician email')).toHaveValue('jane@example.com')
  await expect(page.getByText('Jane Smith (Mother)')).toBeVisible()
  await expect(page.getByText('Ava Smith (Child)')).toBeVisible()
})
