import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Adresse e-mail *').fill('youssef.sample@atelier-exemple.ma')
  await page.getByLabel('Mot de passe *').fill('Password!2026')
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await expect(page).toHaveURL(/\/atelier-zellige/)
})

test('dashboard shows the ceiling gauge, action queue and monthly collections', async ({ page }) => {
  await expect(page.getByRole('heading', { name: /Bonjour .*, voici ce qui compte aujourd'hui/ })).toBeVisible()
  await expect(page.getByText('% · Vigilance')).toBeVisible()
  await expect(page.getByText('Votre cycle de facturation')).toBeVisible()
  await expect(page.getByText('À faire maintenant')).toBeVisible()
  await expect(page.getByText('Origine des encaissements')).toBeVisible()
})

test('a draft never shows a sequential number until issued', async ({ page }) => {
  await page.goto('/atelier-zellige/documents/create?type=facture')
  await expect(page.getByText("Attribué à l'émission")).toBeVisible()
  await page.getByRole('button', { name: 'Émettre et envoyer' }).click()
  await expect(page.getByText('Émettre verrouille le document et attribue le numéro')).toBeVisible()
  await page.getByRole('button', { name: 'Confirmer et verrouiller' }).click()
  await expect(page.getByText(/FAC-\d{4}-\d{4}/)).toBeVisible()
})

test('payment requires the MAD received amount', async ({ page }) => {
  await page.goto('/atelier-zellige/payments')
  await expect(page.getByRole('heading', { name: 'Paiements' })).toBeVisible()
  await expect(page.getByText('Seul le montant reçu en MAD alimente le plafond annuel.')).toBeVisible()
})
