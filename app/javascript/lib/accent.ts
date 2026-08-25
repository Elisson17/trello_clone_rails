/**
 * Cor de acento derivada do slug: o mesmo workspace tem sempre a mesma cor, em toda
 * tela, sem coluna no banco. Luminosidade e croma são fixos e o tema só troca a
 * luminosidade, então o contraste fica parecido no claro e no escuro.
 */
const HUES = [12, 48, 96, 152, 196, 232, 268, 312]

export function accentHue(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0
  return HUES[Math.abs(hash) % HUES.length]
}

/** Variáveis inline consumidas pelas classes utilitárias `bg-(--accent-solid)` etc. */
export function accentStyle(seed: string) {
  const hue = accentHue(seed)

  return {
    '--accent-solid': `oklch(0.62 0.17 ${hue})`,
    '--accent-soft': `oklch(0.62 0.17 ${hue} / 0.12)`,
  } as React.CSSProperties
}
