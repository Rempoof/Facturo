export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

export function money(value: number | string, currency = 'MAD', withDecimals = true): string {
  return `${new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: withDecimals ? 2 : 0,
    maximumFractionDigits: withDecimals ? 2 : 0,
  }).format(Number(value || 0))} ${currency}`
}

export function amountOnly(value: number | string, withDecimals = false): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: withDecimals ? 2 : 0,
    maximumFractionDigits: withDecimals ? 2 : 0,
  }).format(Number(value || 0))
}
