"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Importação dinâmica com desativação de SSR para o Leaflet funcionar perfeitamente no Next.js
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false },
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});
const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false },
);

// COORDENADAS REAIS SINCRONIZADAS PARA MARÍLIA/SP
// Corrigido: Movidas de Presidente Prudente de volta para o perímetro urbano de Marília
const coordenadasNos: {
  [key: string]: { lat: number; lng: number; nome: string };
} = {
  A: { lat: -22.2142, lng: -49.9479, nome: "Centro" },
  B: { lat: -22.1985, lng: -49.939, nome: "Bairro Norte" },
  C: { lat: -22.232, lng: -49.954, nome: "Zona Sul" },
  D: { lat: -22.225, lng: -49.918, nome: "Distrito Industrial" },
  E: { lat: -22.202, lng: -49.905, nome: "Aeroporto" },
};

// Estrutura de caminhos do grafo (mapa.json)
const conexoesRuas = [
  { de: "A", para: "B" },
  { de: "A", para: "C" },
  { de: "B", para: "E" },
  { de: "C", para: "D" },
  { de: "C", para: "E" },
  { de: "D", para: "E" },
];

interface MeuMapaProps {
  caminhoCalculado?: string[];
}

export default function MeuMapa({ caminhoCalculado = [] }: MeuMapaProps) {
  const [mapa, setMapa] = useState<any>(null);

  // Corrige os caminhos dos marcadores padrão do Leaflet no ecossistema do Next.js
  useEffect(() => {
    if (typeof window !== "undefined") {
      const L = require("leaflet");
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });
    }
  }, []);

  // Força o mapa a recalcular o tamanho da div e atualizar as imagens de satélite
  useEffect(() => {
    if (mapa) {
      setTimeout(() => {
        mapa.invalidateSize();
      }, 300);
    }
  }, [mapa]);

  // Controla o movimento inteligente de zoom nas rotas
  useEffect(() => {
    if (!mapa) return;

    if (caminhoCalculado && caminhoCalculado.length >= 2) {
      const pontosDaRota = caminhoCalculado
        .map((id) => coordenadasNos[id])
        .filter(Boolean)
        .map((p) => [p.lat, p.lng] as [number, number]);

      if (pontosDaRota.length > 0) {
        mapa.flyToBounds(pontosDaRota, {
          paddingTopLeft: [50, 50],
          paddingBottomRight: [50, 220], // Garante que a rota fique visível acima do painel flutuante inferior
          duration: 1.5,
          animate: true,
        });
      }
    } else {
      // Centro geométrico inicial de Marília/SP
      mapa.setView([-22.2142, -49.935], 13, { animate: true });
    }
  }, [caminhoCalculado, mapa]);

  const ruaEstaNoCaminho = (de: string, para: string) => {
    if (!caminhoCalculado || caminhoCalculado.length < 2) return false;
    for (let i = 0; i < caminhoCalculado.length - 1; i++) {
      if (caminhoCalculado[i] === de && caminhoCalculado[i + 1] === para)
        return true;
      if (caminhoCalculado[i] === para && caminhoCalculado[i + 1] === de)
        return true;
    }
    return false;
  };

  return (
    <div className="absolute inset-0 w-full h-full m-0 p-0 block z-0 bg-slate-950">
      <MapContainer
        center={[-22.2142, -49.935]}
        zoom={13}
        className="w-full h-full"
        zoomControl={false}
        ref={setMapa}
      >
        {/* Camada de visualização escura estável para destacar os grafos */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution="&copy; OpenStreetMap"
        />

        {/* Renderização das Polylines (Arestas do Grafo) */}
        {conexoesRuas.map((rua, idx) => {
          const p1 = coordenadasNos[rua.de];
          const p2 = coordenadasNos[rua.para];
          if (!p1 || !p2) return null;

          const ativa = ruaEstaNoCaminho(rua.de, rua.para);

          return (
            <Polyline
              key={`rua-${rua.de}-${rua.para}-${ativa}`}
              positions={[
                [p1.lat, p1.lng],
                [p2.lat, p2.lng],
              ]}
              pathOptions={{
                color: ativa ? "#10b981" : "#3b82f6", // Verde esmeralda para rota ativa, Azul para conexões normais
                weight: ativa ? 7 : 4,
                opacity: ativa ? 1.0 : 0.5,
              }}
            />
          );
        })}

        {/* Renderização dos Marcadores (Vértices do Grafo) */}
        {Object.entries(coordenadasNos).map(([id, no]) => (
          <Marker key={`no-${id}`} position={[no.lat, no.lng]}>
            <Popup>
              <div className="text-slate-900 p-1 font-sans">
                <strong className="block text-sm">{no.nome}</strong>
                <span className="text-xs text-slate-500">
                  ID do Vértice: {id}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
