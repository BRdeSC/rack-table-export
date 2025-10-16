import React from "react";
import { apiService } from '../services/api';
import { useApi } from '../hooks/useApi';
import "./ObjectList.css"

function ObjectList({ onSelectObject, onError }) {
  const { data: objects, loading, error } = useApi(() => apiService.getObjects());

  if (loading) return <div className="loading">Carregando equipamentos...</div>;
  if (error) {
    onError?.(error);
    return <div className="error">Erro ao carregar equipamentos: {error}</div>;
  }

  // Contar equipamentos únicos (remover duplicatas se houver)
  const uniqueObjects = objects ? Array.from(new Map(objects.map(obj => [obj.id, obj])).values()) : [];

  return (
    <div className="object-list">
      <div className="object-list-header">
        <h2>Todos os equipamentos - {uniqueObjects.length}</h2>
        <button onClick={() => window.location.href = apiService.exportObjectsXLSX()}>
          📊 Exportar XLSX
        </button>
      </div>
      <table className="objects-table">
        <thead>
          <tr>
            <th>Nome</th>           
            <th>Localização</th>
            <th>Racks</th>
            <th>Tipo</th>
            <th>Asset No.</th>
          </tr>
        </thead>
        <tbody>
          {uniqueObjects.map(obj => (
            <tr key={obj.id} onClick={() => onSelectObject(obj.id)}>
              <td>{obj.name}</td>
              <td>{obj.location_names || 'N/A'}</td>
              <td>{obj.rack_names || 'N/A'}</td>
              <td>{obj.objtype_name}</td>
              <td>{obj.asset_no || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ObjectList;