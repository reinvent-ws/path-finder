"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { useMap } from "react-leaflet";

// Importações dinâmicas cruciais para o Next.js
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

// Coordenadas geográficas reais de Marília/SP
const coordenadasNos: {
  [key: string]: { lat: number; lng: number; nome: string };
} = {
  A: { lat: -22.2201, lng: -51.3802, nome: "Centro (A)" },
  B: { lat: -22.2055, lng: -51.365, nome: "Bairro Norte (B)" },
  C: { lat: -22.238, lng: -51.392, nome: "Zona Sul (C)" },
  D: { lat: -22.229, lng: -51.351, nome: "Distrito Industrial (D)" },
  E: { lat: -22.212, lng: -51.339, nome: "Aeroporto (E)" },
};

const conexoesRuas = [
  { de: "A", para: "B", peso: 4 },
  { de: "A", para: "C", peso: 2 },
  { de: "B", para: "E", peso: 8 },
  { de: "C", para: "D", peso: 3 },
  { de: "C", para: "E", peso: 9 },
  { de: "D", para: "E", peso: 2 },
];

interface MeuMapaProps {
  caminhoCalculado?: string[];
}

// ─── COMPONENTE CONTROLADOR (EFEITO DE ATUALIZAÇÃO EM TEMPO REAL) ───
// Este componente precisa estar DENTRO do MapContainer para ter acesso ao hook useMap()
function AtualizadorDeMapa({ caminho }: { caminho: string[] }) {
  const mapaInstance = useMap();

  useEffect(() => {
    // Só age se houver uma rota válida calculada com início e fim
    if (caminho && caminho.length > 0) {
      const coordenadasCaminho = caminho
        .map((id) => coordenadasNos[id])
        .filter(Boolean);

      if (coordenadasCaminho.length > 0) {
        // Importa o Leaflet dinamicamente para calcular os limites geométricos da rota
        const L = require("leaflet");
        const bounds = L.latLngBounds(
          coordenadasCaminho.map((p) => [p.lat, p.lng]),
        );

        // Enquadra o mapa perfeitamente na tela contendo todos os pontos da rota com um efeito sutil de voo
        mapaInstance.flyToBounds(bounds, {
          padding: [50, 50],
          duration: 1.5, // Duração da animação em segundos
        });
      }
    }
  }, [caminho, mapaInstance]); // O useEffect monitora em tempo real sempre que o "caminho" muda!

  return null;
}

export default function MeuMapa({ caminhoCalculado = [] }: MeuMapaProps) {
  const centroMarilia: [number, number] = [-22.2201, -51.365];

  // Correção de ícones padrão do Leaflet no ecossistema Next.js
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

  const ruaEstaNoCaminho = (de: string, para: string) => {
    if (!caminhoCalculado || caminhoCalculado.length < 2) return false;
    const indexDe = caminhoCalculado.indexOf(de);
    return indexDe !== -1 && caminhoCalculado[indexDe + 1] === para;
  };

  return (
    <div className="w-full bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-4">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Navegação e Roteamento em Tempo Real
        </span>
        <div className="flex gap-4 text-xs text-slate-300">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block"></span>{" "}
            Rota Otimizada
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 block"></span>{" "}
            Vias Secundárias
          </span>
        </div>
      </div>

      <div className="w-full aspect-[4/3] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden z-0 relative">
        <MapContainer
          center={centroMarilia}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution="&copy; OpenStreetMap &copy; CARTO"
          />

          {/* Ativa o monitor reativo passando o caminho vindo do seu page.tsx */}
          <AtualizadorDeMapa caminho={caminhoCalculado} />

          {/* Desenha os caminhos */}
          {conexoesRuas.map((rua, idx) => {
            const p1 = coordenadasNos[rua.de];
            const p2 = coordenadasNos[rua.para];
            const ativa = ruaEstaNoCaminho(rua.de, rua.para);

            return (
              <Polyline
                key={idx}
                positions={[
                  [p1.lat, p1.lng],
                  [p2.lat, p2.lng],
                ]}
                pathOptions={{
                  color: ativa ? "#10b981" : "#3b82f6",
                  weight: ativa ? 6 : 2.5,
                  opacity: ativa ? 1.0 : 0.35,
                }}
              />
            );
          })}

          {/* Desenha os marcadores */}
          {Object.entries(coordenadasNos).map(([id, no]) => {
            return (
              <Marker key={id} position={[no.lat, no.lng]}>
                <Popup>
                  <div className="text-slate-900 p-1">
                    <strong className="block text-sm">{no.nome}</strong>
                    <span className="text-xs text-slate-500">
                      Ponto de Controle: {id}
                    </span>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
