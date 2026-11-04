/** Registro de tipos de imagen: cada uno sabe medirse (para el plan) y pintarse (para la vista). */
import React from "react";
import type { Ctx } from "../plan";
import type { Episodio, Imagen, Medida } from "../tipos";
import { VistaAntesAhora, medirAntesAhora } from "./antesAhora";
import { VistaCiclo, medirCiclo } from "./ciclo";
import { VistaCta, medirCta } from "./cta";
import { VistaClip, VistaDato, medirClip, medirDato } from "./dato";
import { VistaLista, medirLista } from "./lista";
import { VistaMapa, medirMapa } from "./mapa";
import { VistaOpciones, medirOpciones } from "./opciones";
import { VistaRevision, medirRevision } from "./revision";
import { VistaSerie, medirSerie } from "./serie";
import { VistaTerminal, medirTerminal } from "./terminal";
import { VistaTitular, medirTitular } from "./titular";

type Medidor = (img: never, ctx: Ctx) => Medida;

export const MEDIDORES: Record<string, Medidor> = {
  serie: medirSerie,
  titular: medirTitular,
  mapa: medirMapa,
  antesAhora: medirAntesAhora,
  opciones: medirOpciones,
  terminal: medirTerminal,
  revision: medirRevision,
  ciclo: medirCiclo,
  lista: medirLista,
  cta: medirCta,
  dato: medirDato,
  clip: medirClip,
};

export const VistaImagen: React.FC<{ img: Imagen; m: Medida; t: number; ep: Episodio; fps: number }> = ({ img, m, t, ep, fps }) => {
  switch (img.tipo) {
    case "serie": return <VistaSerie img={img} m={m} t={t} ep={ep} />;
    case "titular": return <VistaTitular img={img} m={m} t={t} />;
    case "mapa": return <VistaMapa img={img} m={m} t={t} />;
    case "antesAhora": return <VistaAntesAhora img={img} m={m} t={t} />;
    case "opciones": return <VistaOpciones img={img} m={m} t={t} />;
    case "terminal": return <VistaTerminal img={img} m={m} t={t} />;
    case "revision": return <VistaRevision img={img} m={m} t={t} />;
    case "ciclo": return <VistaCiclo img={img} m={m} t={t} />;
    case "lista": return <VistaLista img={img} m={m} t={t} />;
    case "cta": return <VistaCta img={img} m={m} t={t} usuario={ep.usuario} pregunta={ep.cta?.pregunta} palabra={(ep.cta?.comenta ?? "AUDITORIA").toUpperCase()} />;
    case "dato": return <VistaDato img={img} m={m} t={t} />;
    case "clip": return <VistaClip img={img} m={m} t={t} fps={fps} />;
    default: return null;
  }
};
