// app/page.tsx
"use client";

import { useState } from "react";
import dadosMapa from "./mapa.json"; // Importa o arquivo JSON
import Logo from "./components/Logo";
import MyMap from "./components/my-map";

export default function Roteador() {
  const [origem, setOrigem] = useState("A");
  const [destino, setDestino] = useState("E");
  const [resultado, setResultado] = useState<{
    caminho: string[];
    custo: number;
  } | null>(null);

  // Implementação básica do Algoritmo de Dijkstra
  const calcularRota = () => {
    const { grafo } = dadosMapa;
    const custos: { [key: string]: number } = {};
    const pais: { [key: string]: string | null } = {};
    const processados: string[] = [];

    // Inicializa os custos
    Object.keys(grafo).forEach((vertice) => {
      custos[vertice] = vertice === origem ? 0 : Infinity;
      pais[vertice] = null;
    });

    const encontrarNoMaisBarato = (custos: any, processados: string[]) => {
      return Object.keys(custos).reduce((maisBarato: string | null, no) => {
        if (maisBarato === null || custos[no] < custos[maisBarato]) {
          if (!processados.includes(no)) {
            maisBarato = no;
          }
        }
        return maisBarato;
      }, null);
    };

    let noAtual = encontrarNoMaisBarato(custos, processados);

    while (noAtual) {
      const custoAtual = custos[noAtual];
      const vizinhos = grafo[noAtual as keyof typeof grafo] || [];

      for (let vizinho of vizinhos) {
        const novoCusto = custoAtual + vizinho.peso;
        if (novoCusto < custos[vizinho.destino]) {
          custos[vizinho.destino] = novoCusto;
          pais[vizinho.destino] = noAtual;
        }
      }

      processados.push(noAtual);
      noAtual = encontrarNoMaisBarato(custos, processados);
    }

    // Reconstroi o caminho
    const caminho: string[] = [];
    let pai = destino;
    while (pai) {
      caminho.unshift(pai);
      pai = pais[pai]!;
    }

    setResultado({
      caminho,
      custo: custos[destino],
    });
  };

  return (
    <main className="min-h-screen bg-slate-50 p-8 flex flex-col items-center justify-center">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        <div className="flex flex-row justify-between items-center mb-6">
          <Logo />
          <h1 className="text-2xl font-bold text-slate-800 text-center">
            Otimizador de Rotas Urbanas
          </h1>
        </div>

        <div className="space-y-4 mb-6">
          <MyMap />
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">
              Ponto de Origem:
            </label>
            <select
              className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-blue-500"
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
            <label className="block text-sm font-semibold text-slate-600 mb-1">
              Ponto de Destino:
            </label>
            <select
              className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-blue-500"
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
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition duration-200 shadow-md"
          >
            Calcular Melhor Rota
          </button>
        </div>

        {resultado && resultado.custo !== Infinity && (
          <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-900">
            <h3 className="font-bold mb-1">Rota Encontrada!</h3>
            <p className="text-sm">
              <span className="font-semibold">Caminho:</span>{" "}
              {resultado.caminho.join(" → ")}
            </p>
            <p className="text-sm mt-1">
              <span className="font-semibold">Tempo Estimado:</span>{" "}
              {resultado.custo} minutos
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
