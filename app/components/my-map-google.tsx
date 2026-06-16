import React from "react";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";

export default function MeuMapa() {
  const position = { lat: -22.122, lng: -51.383 }; // Coordenadas de Marília/SP

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      {/* Insira sua chave de API do Google aqui */}
      <APIProvider apiKey="AIzaSyAVr3f0WZUW5jI5nfvPWSeu8KSxC17iDdY">
        <Map defaultZoom={13} defaultCenter={position} mapId="DEMO_MAP_ID">
          <Marker position={position} />
        </Map>
      </APIProvider>
    </div>
  );
}
