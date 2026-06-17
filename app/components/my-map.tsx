"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Importação dinâmica com desativação de SSR para evitar quebra de tiles no Next.js
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

// Suas coordenadas mapeadas (Exemplo base: Marília/SP)
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

  // Recria os pontinhos usando HTML/CSS puro para que fiquem fixos nos quadradinhos
  useEffect(() => {
    if (typeof window !== "undefined") {
      const L = require("leaflet");
      const iconePontinho = L.divIcon({
        className: "custom-grafo-node",
        html: `<div style="
          background-color: #2563eb; 
          width: 14px; 
          height: 14px; 
          border-radius: 50%; 
          border: 2.5px solid #ffffff; 
          box-shadow: 0 2px 6px rgba(37, 99, 235, 0.4);
        "></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      setCustomIcon(iconePontinho);
    }
  }, []);

  // Força o Leaflet a recalcular o mosaico de imagens caso a tela mude de tamanho
  useEffect(() => {
    if (mapa) {
      setTimeout(() => {
        mapa.invalidateSize();
      }, 250);
    }
  }, [mapa, caminhoCalculado]);

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
    <div className="absolute inset-0 w-full h-full block z-0 bg-[#ccc]">
      <MapContainer
        center={[-22.2142, -49.935]}
        zoom={13}
        className="w-full h-full"
        zoomControl={false}
        ref={setMapa}
      >
        {/* Usando o Tile do OpenStreetMap Light para carregar rápido e sem fragmentação */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {/* Linhas Azuis e Verdes */}
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
                color: ativa ? "#10b981" : "#2563eb", // Verde na rota, Azul nas outras
                weight: ativa ? 6 : 3,
                opacity: ativa ? 1.0 : 0.6,
              }}
            />
          );
        })}

        {/* Pontinhos do Grafo */}
        {customIcon &&
          Object.entries(coordenadasNos).map(([id, no]) => (
            <Marker
              key={`no-${id}`}
              position={[no.lat, no.lng]}
              icon={customIcon}
            >
              <Popup>
                <div className="text-slate-900 font-sans font-medium text-xs">
                  {no.nome} ({id})
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}
