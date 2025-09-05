export function numberFormat(val: number, local = 'ru') {
  if (!val) return
  return new Intl.NumberFormat(local).format(val)
}
