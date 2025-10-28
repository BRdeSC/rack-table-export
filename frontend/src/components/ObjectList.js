import React, { useState } from "react";
import { apiService } from '../services/api';
import { useApi } from '../hooks/useApi';
import "./ObjectList.css"

function ObjectList({ onSelectObject, onError }) {
  const { data: objects, loading, error } = useApi(() => apiService.getObjects());
  const [selectedType, setSelectedType] = useState('');

  if (loading) return <div className="loading">Carregando equipamentos...</div>;
  if (error) {
    onError?.(error);
    return <div className="error">Erro ao carregar equipamentos: {error}</div>;
  }

  // Contar equipamentos únicos (remover duplicatas se houver)
  const uniqueObjects = objects ? Array.from(new Map(objects.map(obj => [obj.id, obj])).values()) : [];

  // Filtrar por tipo se selecionado
  const filteredObjects = selectedType 
    ? uniqueObjects.filter(obj => obj.objtype_id.toString() === selectedType)
    : uniqueObjects;

  // Mapeamento de tipos baseado no seu object_types.py
  const objectTypes = [
    { id: '1', name: 'BlackBox' },
    { id: '2', name: 'PDU' },
    { id: '4', name: 'Server' },
    { id: '5', name: 'DiskArray' },
    { id: '6', name: 'Tape Library' },
    { id: '8', name: 'Network Switch' },
    { id: '9', name: 'Patch Panel' },
    { id: '15', name: 'Console' },
    { id: '445', name: 'KVM Switch' },
    { id: '1055', name: 'FC Switch' },
    { id: '1502', name: 'Server Chassis' },
    { id: '50022', name: 'Storage' },
    { id: '50024', name: 'Controller' }
  ];

  // Função para exportar os itens filtrados
const handleExport = () => {
  if (selectedType) {
    // Exportar apenas o tipo selecionado
    const exportUrl = `${apiService.baseURL}/search/equipments/export/xlsx?type_id=${selectedType}`;
    window.location.href = exportUrl;
  } else {
    // Exportar todos os objetos
    window.location.href = apiService.exportObjectsXLSX();
  }
};

  return (
    <div className="object-list">
      <div className="object-list-header">
        <h2>Todos os equipamentos - {filteredObjects.length}</h2>
        <button onClick={handleExport}>
          📊 Exportar XLSX {selectedType && '(Filtrado)'}
        </button>
      </div>

      {/* FILTRO POR TIPO */}
      <div className="type-filter">
        <label htmlFor="type-select">Filtrar por tipo: </label>
        <select 
          id="type-select"
          value={selectedType} 
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="">Todos os tipos</option>
          {objectTypes.map(type => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
        
        {selectedType && (
          <button 
            onClick={() => setSelectedType('')} 
            className="clear-filter-btn"
          >
            Limpar filtro
          </button>
        )}
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
          {filteredObjects.map(obj => (
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

      {/* Mensagem quando não há resultados com filtro */}
      {selectedType && filteredObjects.length === 0 && (
        <div className="no-results">
          Nenhum equipamento encontrado para o tipo selecionado.
        </div>
      )}
    </div>
  );
}

export default ObjectList;