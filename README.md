<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/114100d4-c5af-4439-819d-dde11c03d3aa" />

# 📍 PathFinder: Otimizador de Rotas Multi-Paradas

O **PathFinder** é uma aplicação web interativa desenvolvida em Next.js que utiliza o **Algoritmo de Dijkstra** para encontrar o caminho mais rápido e eficiente entre múltiplos pontos geográficos em uma malha de grafos, totalmente integrada sobre o mapa real de Marília/SP utilizando o Leaflet.

---

## 🚀 Funcionalidades Principais

* **Algoritmo de Dijkstra Real-Time:** Calcula de forma exata a rota com o menor peso (distância/tempo) entre os nós selecionados.
* **Múltiplos Destinos (Multi-Stop):** Permite adicionar dinamicamente paradas intermediárias (`+ Add destination`) e calcula de forma sequencial e encadeada a rota completa.
* **Interface Estilo Google Maps:** Painel de controle moderno fixado no rodapé (`footer`) com suporte a modificações dinâmicas e remoção de paradas individuais.
* **Visualização em Light Mode:** Mapa claro, limpo e de alta performance baseado na camada do OpenStreetMap, facilitando o destaque visual das rotas.
* **Feedback Visual de Rotas:** * 🔵 **Linhas Azuis:** Conexões e vias normais do grafo.
  * 🟢 **Linhas Verdes:** Rota otimizada calculada ativa.
  * 🔘 **Pontos Azuis:** Vértices/paradas mapeadas no perímetro urbano.

---

## 🛠️ Tecnologias Utilizadas

* **Framework:** [Next.js 14+](https://nextjs.org/) (React)
* **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
* **Mapas Interativos:** [Leaflet](https://leafletjs.com/) & [React-Leaflet](https://react-leaflet.js.org/)
* **Provedor de Camadas:** [OpenStreetMap](https://www.openstreetmap.org/)
* **Lógica Matemática:** Algoritmo de Dijkstra para Grafos Pesados

---

## 📊 Estrutura de Dados (Grafo)

O mapa e as conexões viárias são alimentados dinamicamente por um arquivo estruturado em JSON (`mapa.json`), onde cada vértice possui coordenadas geográficas reais e cada aresta possui um peso correspondente:

```json
{
  "vertices": [
    { "id": "A", "nome": "Centro" },
    { "id": "B", "nome": "Bairro Norte" }
  ],
  "grafo": {
    "A": [
      { "destino": "B", "peso": 4 }
    ]
  }
}
