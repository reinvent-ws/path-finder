export default function Logo() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="invert text-black hover:text-blue-700 transition-colors" // Estilização suave com Tailwind
    >
      {/* Caminho/Rota Suave de fundo */}
      <path
        d="M2 15C5 15 5 5 10 5C15 5 15 15 18 15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />
      {/* O Ponto/Vértice Central (O "Destino") */}
      <circle cx="10" cy="5" r="2" fill="currentColor" />
      {/* Auréola delicada em volta do ponto central */}
      <circle
        cx="10"
        cy="5"
        r="4.25"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeDasharray="2 1"
      />
    </svg>
  );
}
