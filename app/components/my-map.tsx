"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Importação dinâmica do Leaflet com desativação de SSR (Server-Side Rendering)
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

// COORDENADAS REAIS SINCRONIZADAS EM MARÍLIA/SP
const coordenadasNos: {
  [key: string]: { lat: number; lng: number; nome: string };
} = {
  A: { lat: -22.2142, lng: -49.9479, nome: "Centro" },
  B: { lat: -22.1985, lng: -49.939, nome: "Bairro Norte" },
  C: { lat: -22.232, lng: -49.954, nome: "Zona Sul" },
  D: { lat: -22.225, lng: -49.918, nome: "Distrito Industrial" },
  E: { lat: -22.202, lng: -49.905, nome: "Aeroporto" },
};

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
  const [customIcon, setCustomIcon] = useState<any>(null);

  // Inicializa o ícone personalizado para evitar quebra de caminhos de imagem no Next.js
  useEffect(() => {
    if (typeof window !== "undefined") {
      const L = require("leaflet");

      // Criando um ponto (dot) moderno e brilhante via HTML/CSS nativo
      const iconePontinho = L.divIcon({
        className: "custom-div-icon",
        html: `<div style="
          background-color: #3b82f6; 
          width: 14px; 
          height: 14px; 
          border-radius: 50%; 
          border: 2px solid #ffffff; 
          box-shadow: 0 0 8px rgba(59, 130, 246, 0.8);
        "></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      setCustomIcon(iconePontinho);
    }
  }, []);

  // Força atualização de tamanho da janela gráfica para evitar o "bug do mapa cinza"
  useEffect(() => {
    if (mapa) {
      setTimeout(() => {
        mapa.invalidateSize();
      }, 250);
    }
  }, [mapa]);

  // Controle de enquadramento (FlyToBounds)
  useEffect(() => {
    if (!mapa) return;

    if (caminhoCalculado && caminhoCalculado.length >= 2) {
      const pontosDaRota = caminhoCalculado
        .map((id) => coordenadasNos[id])
        .filter(Boolean)
        .map((p) => [p.lat, p.lng] as [number, number]);

      if (pontosDaRota.length > 0) {
        mapa.flyToBounds(pontosDaRota, {
          paddingTopLeft: [40, 40],
          paddingBottomRight: [40, 180], // Margem de segurança para o rodapé
          duration: 1.2,
          animate: true,
        });
      }
    } else {
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
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution="&copy; OpenStreetMap"
        />

        {/* Renderização Segura das Arestas (Linhas) */}
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
                color: ativa ? "#10b981" : "#3b82f6",
                weight: ativa ? 6 : 3,
                opacity: ativa ? 1.0 : 0.4,
              }}
            />
          );
        })}

        {/* Renderização Segura dos Vértices (Pontinhos) */}
        {customIcon &&
          Object.entries(coordenadasNos).map(([id, no]) => (
            <Marker
              key={`no-${id}`}
              position={[no.lat, no.lng]}
              icon={customIcon}
            >
              <Popup>
                <div className="text-slate-950 p-0.5 font-sans">
                  <strong>
                    {no.nome} ({id})
                  </strong>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}
