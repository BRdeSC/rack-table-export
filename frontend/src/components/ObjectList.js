import React, { useEffect, useState } from "react";

function ObjectList({ onSelectObject }) {
  const [objects, setObjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/objects")
      .then(response => {
        if (!response.ok) {
          throw new Error('Erro na rede ou no servidor');
        }
        return response.json();
      })
      .then(data => {
        setObjects(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Erro ao carregar objetos:", error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loading">Carregando equipamentos...</div>;

  return (
    <div className="object-list">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Todos os equipamentos - {new Set(objects.map(obj => obj.id)).size}</h2>
        <button onClick={() => window.location.href = "http://localhost:5000/api/objects/export/csv"}>
          Exportar CSV
        </button>
        <button onClick={() => window.location.href = "http://localhost:5000/api/objects/export/xlsx"}>
          Exportar XLSX
        </button>
      </div>
      <table className="objects-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Tipo</th>
            <th>Localização</th>
            <th>Racks</th>
            <th>Asset No.</th>
          </tr>
        </thead>
        <tbody>
          {objects.map(obj => (
            <tr key={obj.id} onClick={() => onSelectObject(obj.id)}>
              <td>{obj.name}</td>
              <td>Tipo {obj.objtype_id}</td>
              <td>{obj.location_names || 'N/A'}</td>
              <td>{obj.rack_names || 'N/A'}</td>
              <td>{obj.asset_no || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ObjectList;