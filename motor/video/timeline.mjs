// Contrato compartilhado entre transcrição/corte (T-003) e legenda/cards (T-004).
//
// Timeline {
//   fonte: string            caminho absoluto do RAW
//   duracaoFonte: number     segundos
//   palavras: Palavra[]      tempos na FONTE
//   segmentos: Segmento[]    trechos da fonte mantidos, em ordem
//   saida: { duracao: number, palavras: Palavra[] }  tempos já no vídeo cortado
// }
// Palavra  { texto: string, ini: number, fim: number }
// Segmento { ini: number, fim: number, fonte?: string }  fonte própria = montagem de vários RAW;
//          nesse caso os segmentos seguem a ordem da montagem, não a da fonte.

export const PAUSA_MAXIMA = 0.7;

export function validarTimeline(t) {
  const erros = [];
  if (typeof t?.fonte !== 'string') erros.push('fonte ausente');
  if (!(t?.duracaoFonte > 0)) erros.push('duracaoFonte inválida');
  for (const campo of ['palavras', 'segmentos']) {
    if (!Array.isArray(t?.[campo])) erros.push(`${campo} não é lista`);
  }
  if (!Array.isArray(t?.saida?.palavras)) erros.push('saida.palavras não é lista');
  const ordenado = (xs) => xs.every((x, i) => x.ini <= x.fim && (i === 0 || xs[i - 1].fim <= x.ini + 1e-6));
  const multiFonte = Array.isArray(t?.segmentos) && t.segmentos.some((s) => s.fonte);
  if (Array.isArray(t?.segmentos) && !multiFonte && !ordenado(t.segmentos)) erros.push('segmentos fora de ordem ou sobrepostos');
  if (multiFonte && !t.segmentos.every((s) => s.ini < s.fim)) erros.push('segmento com ini >= fim');
  if (Array.isArray(t?.saida?.palavras) && !ordenado(t.saida.palavras)) erros.push('saida.palavras fora de ordem');
  return erros;
}

// Mapeia um instante da fonte para o vídeo cortado; null se caiu num trecho removido.
export function fonteParaSaida(segmentos, tempo) {
  let acumulado = 0;
  for (const s of segmentos) {
    if (tempo >= s.ini && tempo <= s.fim) return acumulado + (tempo - s.ini);
    acumulado += s.fim - s.ini;
  }
  return null;
}
