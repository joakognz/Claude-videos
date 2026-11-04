import React, { createContext, useContext } from "react";
import { ESTILO_BASE } from "../tema";
import type { Estilo } from "../tipos";

const Ctx = createContext<Estilo>(ESTILO_BASE);

export const EstiloProvider: React.FC<{ estilo?: Partial<Estilo>; children: React.ReactNode }> = ({ estilo, children }) => (
  <Ctx.Provider value={{ ...ESTILO_BASE, ...estilo }}>{children}</Ctx.Provider>
);

export const useEstilo = () => useContext(Ctx);
