import React, { useState } from "react";

export default function LavaJatoDashboard() {
  const [registros, setRegistros] = useState([]);
  const [funcionario, setFuncionario] = useState("");
  const [veiculo, setVeiculo] = useState("carro");

  const valores = { carro: 20, moto: 10, caminhao: 50 };

  function adicionarRegistro() {
    if (!funcionario) return;
    setRegistros([...registros, { funcionario, veiculo }]);
    setFuncionario("");
  }

  const ganhos = registros.reduce((acc, r) => {
    acc[r.funcionario] = (acc[r.funcionario] || 0) + valores[r.veiculo];
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">
        Lava Jato do Di 🚗🧼
      </h1>

      <div className="flex gap-2 mb-4">
        <input
          className="border p-2 flex-1"
          value={funcionario}
          onChange={(e) => setFuncionario(e.target.value)}
          placeholder="Nome do funcionário"
        />
        <select
          className="border p-2"
          value={veiculo}
          onChange={(e) => setVeiculo(e.target.value)}
        >
          <option value="carro">Carro</option>
          <option value="moto">Moto</option>
          <option value="caminhao">Caminhão</option>
        </select>
        <button onClick={adicionarRegistro} className="bg-blue-500 text-white p-2 rounded">
          Adicionar
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-2">Registros</h2>
      <ul className="mb-4">
        {registros.map((r, i) => (
          <li key={i}>
            {r.funcionario} lavou um {r.veiculo} (+R$ {valores[r.veiculo]})
          </li>
        ))}
      </ul>

      <h2 className="text-xl font-semibold mb-2">Ganhos por funcionário</h2>
      <ul>
        {Object.entries(ganhos).map(([nome, total]) => (
          <li key={nome}>
            {nome}: R$ {total}
          </li>
        ))}
      </ul>
    </div>
  );
}