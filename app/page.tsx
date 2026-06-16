// app/page.tsx
"use client";

import { useState } from "react";
import dadosMapa from "./mapa.json";
import MeuMapa from "./components/my-map"; // Importa o componente do mapa que criamos
import Logo from "./components/Logo";

export default function Roteador() {
  const [origem, setOrigem] = useState("A");
  const [destino, setDestino] = useState("E");
  const [resultado, setResultado] = useState<{
    caminho: string[];
    custo: number;
  } | null>(null);

  const calcularRota = () => {
    // ... (Toda aquela sua lógica do algoritmo de Dijkstra que já funciona perfeitamente)
    // No final dela, você dá o setResultado({ caminho, custo })
  };

  return (
    <main className="w-full h-screen font-sans text-slate-100 relative">
      <MeuMapa caminhoCalculado={resultado?.caminho} />

      <div className="absolute left-[50%] translate-x-[-50%] w-fit p-4 flex flex-col justify-center items-center bottom-20 rounded-lg bg-white/5 backdrop-blur shadow-black/25 border border-white/10">
        <div className="w-full flex flex-row justify-start items-center mb-6 gap-4">
          <Logo />
          <h1 className="text-2xl text-white">
            PathFinder: Otimizador de Rotas
          </h1>
        </div>

        <div className="flex flex-row justify-evenly items-end gap-10">
          <div>
            <label className="block text-sm font-semibold text-slate-400 mb-1">
              Ponto de Origem:
            </label>
            <select
              className="w-full p-2.5 border border-slate-700 rounded-lg bg-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
              value={origem}
              onChange={(e) => setOrigem(e.target.value)}
            >
              {dadosMapa.vertices.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-400 mb-1">
              Ponto de Destino:
            </label>
            <select
              className="w-full p-2.5 border border-slate-700 rounded-lg bg-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
              value={destino}
              onChange={(e) => setDestino(e.target.value)}
            >
              {dadosMapa.vertices.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.nome}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={calcularRota}
            className="h-fit bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition duration-200 shadow-md"
          >
            Calcular Melhor Rota
          </button>
        </div>
      </div>

      {resultado && resultado.custo !== Infinity && (
        <div className="p-4 bg-emerald-950/40 rounded-xl border border-emerald-800/60 text-emerald-300">
          <h3 className="font-bold mb-1 text-emerald-400">Rota Encontrada!</h3>
          <p className="text-sm">
            <span className="font-semibold text-slate-300">
              Caminho Eficiente:
            </span>{" "}
            {resultado.caminho.join(" → ")}
          </p>
          <p className="text-sm mt-1">
            <span className="font-semibold text-slate-300">Tempo Total:</span>{" "}
            {resultado.custo} minutos
          </p>
        </div>
      )}
    </main>
  );
}
