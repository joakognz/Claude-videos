/** Lectura de entradas: duración del audio (de verdad, del fichero) y timestamps en los formatos habituales. */
import { ALL_FORMATS, Input, UrlSource } from "mediabunny";
import type { Palabra } from "./tipos";

export const duracionAudio = async (url: string): Promise<number> => {
  const input = new Input({ source: new UrlSource(url), formats: ALL_FORMATS });
  try {
    return await input.computeDuration();
  } finally {
    input.dispose();
  }
};

type Crudo = Record<string, unknown>;

/**
 * Acepta:
 *  - el de scripts/preparar.py: { palabras: [{ texto, inicio, fin }] }
 *  - una lista de palabras con texto/text/word e inicio/start y fin/end
 *  - ElevenLabs Speech-to-Text (Scribe) o Whisper: { words: [{ text, start, end, type }] }
 *  - ElevenLabs text-to-speech «with timestamps»: { alignment: { characters, character_start_times_seconds, … } }
 */
export const leerTimestamps = (j: unknown): Palabra[] => {
  const o = j as Crudo;
  const lista = (Array.isArray(j) ? j : (o.palabras ?? o.words)) as Crudo[] | undefined;
  if (lista) {
    return lista
      .filter((w) => !w.type || w.type === "word")
      .map((w) => ({
        texto: String(w.texto ?? w.text ?? w.word ?? "").trim(),
        inicio: Number(w.inicio ?? w.start),
        fin: Number(w.fin ?? w.end),
        escena: w.escena as string | undefined,
      }))
      .filter((w) => w.texto);
  }
  const al = (o.alignment ?? o.normalized_alignment ?? o) as Crudo;
  if (Array.isArray(al.characters)) {
    const ch = al.characters as string[];
    const st = al.character_start_times_seconds as number[];
    const en = al.character_end_times_seconds as number[];
    const out: Palabra[] = [];
    let cur: Palabra | null = null;
    ch.forEach((c, i) => {
      if (/\s/.test(c)) { cur = null; return; }
      if (!cur) { cur = { texto: "", inicio: st[i], fin: en[i] }; out.push(cur); }
      cur.texto += c;
      cur.fin = en[i];
    });
    return out;
  }
  throw new Error("Formato de timestamps no reconocido");
};
