// app/page.tsx
"use client";

import { useState } from "react";
import dadosMapa from "./mapa.json";
import MeuMapa from "./components/my-map";
import Logo from "./components/Logo";

export default function Roteador() {
  const [origem, setOrigem] = useState<string>("A");
  // Agora guardamos uma lista dinâmica de destinos organizados por ordem de parada
  const [destinos, setDestinos] = useState<string[]>(["E"]);

  const [resultado, setResultado] = useState<{
    caminho: string[];
    custoTotal: number;
  } | null>(null);

  // Função auxiliar do algoritmo de Dijkstra para um único segmento
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

  // Calcula a rota multiparadas encadeando os trechos sequencialmente
  const calcularRotaCompleta = () => {
    if (destinos.length === 0) return;

    let caminhoCompleto: string[] = [];
    let custoTotalacumulado = 0;
    let pontoDePartidaAtual = origem;

    for (let i = 0; i < destinos.length; i++) {
      const proximoDestino = destinos[i];
      const trecho = dijkstraSimples(pontoDePartidaAtual, proximoDestino);

      if (trecho.caminho.length === 0) {
        // Se um dos trechos for impossível, quebra o cálculo por segurança
        setResultado(null);
        alert(
          `Não foi possível encontrar um caminho até o vértice ${proximoDestino}`,
        );
        return;
      }

      // Evita duplicar o nó de conexão na junção dos caminhos
      if (caminhoCompleto.length > 0) {
        caminhoCompleto.pop();
      }

      caminhoCompleto = [...caminhoCompleto, ...trecho.caminho];
      custoTotalacumulado += trecho.custo;
      pontoDePartidaAtual = proximoDestino; // O destino atual vira a origem do próximo trecho
    }

    setResultado({
      caminho: caminhoCompleto,
      custoTotal: custoTotalacumulado,
    });
  };

  // Funções para manipulação dinâmica dos inputs de destinos
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
      {/* Componente do mapa renderizado ao fundo */}
      <MeuMapa caminhoCalculado={resultado?.caminho} />

      {/* Painel Flutuante Estilo Google Maps */}
      <div className="absolute left-6 top-6 w-96 max-h-[calc(100vh-48px)] overflow-y-auto p-5 flex flex-col z-10 rounded-xl bg-slate-900/90 backdrop-blur-md shadow-2xl border border-slate-800 transition-all">
        <div className="w-full flex flex-row items-center mb-5 gap-3 border-b border-slate-800 pb-3">
          <Logo />
          <h1 className="text-lg font-semibold text-white tracking-wide">
            PathFinder Multi-Stop
          </h1>
        </div>

        <div className="flex flex-col gap-4">
          {/* Input de Origem */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
              Ponto de Partida:
            </label>
            <select
              className="w-full p-2.5 border border-slate-700 rounded-lg bg-slate-800/80 text-slate-200 focus:outline-none focus:border-blue-500 text-sm transition"
              value={origem}
              onChange={(e) => setOrigem(e.target.value)}
            >
              {dadosMapa.vertices.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.nome} ({v.id})
                </option>
              ))}
            </select>
          </div>

          {/* Renderização Dinâmica da Lista de Destinos/Paradas */}
          <div className="flex flex-col gap-3.5 relative pl-2 border-l border-dashed border-slate-700">
            {destinos.map((destinoId, index) => (
              <div key={index} className="flex flex-row items-end gap-2 group">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                    {index === destinos.length - 1
                      ? "Destino Final:"
                      : `Parada ${index + 1}:`}
                  </label>
                  <select
                    className="w-full p-2.5 border border-slate-700 rounded-lg bg-slate-800/80 text-slate-200 focus:outline-none focus:border-blue-500 text-sm transition"
                    value={destinoId}
                    onChange={(e) => atualizarDestino(index, e.target.value)}
                  >
                    {dadosMapa.vertices.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.nome} ({v.id})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Botão de Remover Destino (visível se tiver mais de 1 destino na lista) */}
                {destinos.length > 1 && (
                  <button
                    onClick={() => removerDestino(index)}
                    className="p-2.5 mb-0.5 rounded-lg bg-red-950/40 text-red-400 border border-red-900/60 hover:bg-red-900 hover:text-white transition"
                    title="Remover esta parada"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Botão para Adicionar Destino Intermediário */}
          <button
            onClick={adicionarDestino}
            className="w-full mt-1 py-2 px-3 border border-dashed border-slate-700 rounded-lg text-xs font-medium text-slate-400 hover:border-blue-500 hover:text-blue-400 transition bg-slate-800/20"
          >
            + Add destination
          </button>

          {/* Disparador do Cálculo de Otimização */}
          <button
            onClick={calcularRotaCompleta}
            className="w-full mt-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition shadow-lg shadow-blue-950/50 text-sm"
          >
            Calcular Melhor Rota
          </button>
        </div>

        {/* Quadro Informativo de Resultados */}
        {resultado && (
          <div className="mt-5 p-4 bg-emerald-950/40 rounded-xl border border-emerald-800/60 text-emerald-300 animate-fadeIn">
            <h3 className="font-bold text-sm mb-2 text-emerald-400 flex items-center gap-1.5">
              <span>✓</span> Rota Otimizada Encontrada!
            </h3>
            <div className="space-y-1.5 text-xs">
              <p>
                <span className="font-semibold text-slate-400 block mb-0.5">
                  Caminho Gerado:
                </span>
                <span className="bg-slate-950/50 px-2 py-1 rounded inline-block text-slate-200 border border-slate-800 font-mono">
                  {resultado.caminho.join(" → ")}
                </span>
              </p>
              <p className="pt-1 flex justify-between items-center border-t border-emerald-900/40 mt-2">
                <span className="font-semibold text-slate-400">
                  Distância/Tempo Total:
                </span>
                <span className="text-sm font-bold text-emerald-400">
                  {resultado.custoTotal} km / min
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
