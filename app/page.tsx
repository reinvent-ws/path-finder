// app/page.tsx
"use client";

import { useState } from "react";
import dadosMapa from "./mapa.json";
import MeuMapa from "./components/my-map";
import Logo from "./components/Logo";

export default function Roteador() {
  const [origem, setOrigem] = useState<string>("A");
  const [destinos, setDestinos] = useState<string[]>(["E"]);
  const [resultado, setResultado] = useState<{
    caminho: string[];
    custoTotal: number;
  } | null>(null);

  const dijkstraSimples = (
    pontoA: string,
    pontoB: string,
  ): { caminho: string[]; custo: number } => {
    const distancias: { [key: string]: number } = {};
    const anteriores: { [key: string]: string | null } = {};
    const visitados = new Set<string>();

    dadosMapa.vertices.forEach((v) => {
      distancias[v.id] = Infinity;
      anteriores[v.id] = null;
    });
    distancias[pontoA] = 0;

    while (visitados.size < dadosMapa.vertices.length) {
      let noAtual: string | null = null;
      let menorDistancia = Infinity;

      dadosMapa.vertices.forEach((v) => {
        if (!visitados.has(v.id) && distancias[v.id] < menorDistancia) {
          menorDistancia = distancias[v.id];
          noAtual = v.id;
        }
      });

      if (noAtual === null || distancias[noAtual] === Infinity) break;
      visitados.add(noAtual);

      const vizinhos = (dadosMapa.grafo as any)[noAtual] || [];
      for (const vizinho of vizinhos) {
        if (!visitados.has(vizinho.destino)) {
          const novaDista = distancias[noAtual] + vizinho.peso;
          if (novaDista < distancias[vizinho.destino]) {
            distancias[vizinho.destino] = novaDista;
            anteriores[vizinho.destino] = noAtual;
          }
        }
      }
    }

    const caminho: string[] = [];
    let atual: string | null = pontoB;
    while (atual !== null) {
      caminho.unshift(atual);
      atual = anteriores[atual];
    }

    return {
      caminho: caminho[0] === pontoA ? caminho : [],
      custo: distancias[pontoB] === Infinity ? 0 : distancias[pontoB],
    };
  };

  const calcularRotaCompleta = () => {
    if (destinos.length === 0) return;

    let caminhoCompleto: string[] = [];
    let custoTotalacumulado = 0;
    let pontoDePartidaAtual = origem;

    for (let i = 0; i < destinos.length; i++) {
      const proximoDestino = destinos[i];
      const trecho = dijkstraSimples(pontoDePartidaAtual, proximoDestino);

      if (trecho.caminho.length === 0) {
        setResultado(null);
        alert(
          `Não foi possível encontrar um caminho até o vértice ${proximoDestino}`,
        );
        return;
      }

      if (caminhoCompleto.length > 0) {
        caminhoCompleto.pop();
      }

      caminhoCompleto = [...caminhoCompleto, ...trecho.caminho];
      custoTotalacumulado += trecho.custo;
      pontoDePartidaAtual = proximoDestino;
    }

    setResultado({
      caminho: caminhoCompleto,
      custoTotal: custoTotalacumulado,
    });
  };

  const adicionarDestino = () => {
    if (destinos.length < dadosMapa.vertices.length - 1) {
      setDestinos([...destinos, "E"]);
    }
  };

  const removerDestino = (indexItem: number) => {
    const novaLista = destinos.filter((_, idx) => idx !== indexItem);
    setDestinos(novaLista);
  };

  const atualizarDestino = (indexItem: number, valor: string) => {
    const novaLista = [...destinos];
    novaLista[indexItem] = valor;
    setDestinos(novaLista);
  };

  return (
    <main className="w-full h-screen font-sans text-slate-100 relative overflow-hidden bg-slate-950">
      <MeuMapa caminhoCalculado={resultado?.caminho} />

      {/* Painel Centralizado Retornado com Sucesso para o Rodapé (Footer) */}
      <div className="absolute left-1/2 bottom-8 -translate-x-1/2 w-[92%] max-w-4xl p-5 flex flex-col z-10 rounded-xl bg-slate-900/90 backdrop-blur-md shadow-2xl border border-white/10 transition-all max-h-[40vh] overflow-y-auto">
        {/* Topo do Painel */}
        <div className="w-full flex flex-row items-center justify-between mb-4 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-3">
            <Logo />
            <h1 className="text-md font-semibold text-white tracking-wide">
              PathFinder: Otimizador Multi-Paradas
            </h1>
          </div>

          {resultado && (
            <div className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-md font-medium">
              Rota Ativa: {resultado.caminho.join(" → ")} — Total:{" "}
              {resultado.custoTotal} km/min
            </div>
          )}
        </div>

        {/* Formulário de Seleções */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* Campo Origem */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
              Ponto de Origem:
            </label>
            <select
              className="w-full p-2 border border-slate-700 rounded-lg bg-slate-800 text-slate-200 text-xs focus:outline-none focus:border-blue-500 transition"
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

          {/* Lista Dinâmica de Destinos (Preparado para scroll horizontal no futuro) */}
          <div className="md:col-span-2 flex flex-col gap-2">
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
              Destinos e Paradas Intermediárias:
            </label>
            <div className="flex flex-wrap gap-3 items-center">
              {destinos.map((destinoId, index) => (
                <div
                  key={index}
                  className="flex flex-row items-center gap-1.5 bg-slate-800/80 p-1.5 rounded-lg border border-slate-700"
                >
                  <span className="text-[10px] uppercase font-bold text-slate-400 px-1">
                    {index === destinos.length - 1 ? "Fim" : `P${index + 1}`}
                  </span>
                  <select
                    className="p-1 border border-slate-600 rounded bg-slate-900 text-slate-200 text-xs focus:outline-none transition"
                    value={destinoId}
                    onChange={(e) => atualizarDestino(index, e.target.value)}
                  >
                    {dadosMapa.vertices.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.nome}
                      </option>
                    ))}
                  </select>
                  {destinos.length > 1 && (
                    <button
                      onClick={() => removerDestino(index)}
                      className="text-red-400 hover:text-white hover:bg-red-600/50 px-1.5 rounded text-xs transition"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}

              {/* Botão de Adicionar Campo */}
              <button
                onClick={adicionarDestino}
                className="py-1 px-2.5 border border-dashed border-slate-600 rounded-lg text-xs font-medium text-slate-400 hover:border-blue-500 hover:text-blue-400 transition bg-slate-800/40"
              >
                + Add destination
              </button>
            </div>
          </div>
        </div>

        {/* Botão de Ação Inferior */}
        <button
          onClick={calcularRotaCompleta}
          className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded-lg transition text-xs tracking-wide shadow-md"
        >
          Calcular Melhor Rota
        </button>
      </div>
    </main>
  );
}
