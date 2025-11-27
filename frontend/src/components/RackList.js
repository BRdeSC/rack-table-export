import React, { useState } from "react";
import { apiService } from '../services/api';
import { useApi } from '../hooks/useApi';
import "./RackList.css"

function RackList({ onSelectRack, onError }) {
  const { data: racks, loading, error } = useApi(() => apiService.getRacks());
  const [selectedRow, setSelectedRow] = useState('');

  // Extrair fileiras únicas dos racks
  const getUniqueRows = () => {
    if (!racks) return [];
    const rows = racks.map(rack => rack.row_name).filter(Boolean);
    return [...new Set(rows)].sort();
  };

  // Filtrar racks por fileira
  const filteredRacks = selectedRow 
    ? racks?.filter(rack => rack.row_name === selectedRow)
    : racks;

  if (loading) return <div className="loading">Carregando racks...</div>;
  if (error) {
    onError?.(error);
    return <div className="error">Erro ao carregar racks: {error}</div>;
  }

  const uniqueRows = getUniqueRows();

  return (
    <div className="rack-list">
      <div className="rack-list-header">
        <h2>Racks do Data Center - {filteredRacks?.length || 0}</h2>
        <button 
          onClick={() => window.location.href = apiService.exportRacksXLSX()}
          className="export-button"
        >
          📊 Exportar XLSX
        </button>
      </div>

      {/* FILTRO POR FILEIRA */}
      <div className="row-filter">
        <label htmlFor="row-select">Filtrar por fileira: </label>
        <select 
          id="row-select"
          value={selectedRow} 
          onChange={(e) => setSelectedRow(e.target.value)}
        >
          <option value="">Todas as fileiras</option>
          {uniqueRows.map(row => (
            <option key={row} value={row}>
              {row}
            </option>
          ))}
        </select>
        
        {selectedRow && (
          <button 
            onClick={() => setSelectedRow('')} 
            className="clear-filter-btn"
          >
            Limpar filtro
          </button>
        )}
      </div>

      <div className="racks-grid">
        {filteredRacks?.map(rack => {
          // CÁLCULO: usar slots ocupados em vez de quantidade de equipamentos
          const slotsOcupados = rack.height - rack.empty_slots;
          const ocupacaoPercentual = Math.floor((slotsOcupados / rack.height) * 100);
          
          return (
            <div 
              key={rack.id} 
              className="rack-card"
              onClick={() => onSelectRack(rack.id)}
            >
              <h3>{rack.name}</h3>
              <div className="rack-info">
                <p><strong>Localização:</strong> {rack.location_name || 'N/A'}</p>
                <p><strong>Fileira:</strong> {rack.row_name || 'N/A'}</p>
                <p><strong>Altura:</strong> {rack.height}U</p>
                <p><strong>Equipamentos:</strong> {rack.object_count}</p>
                <p><strong>Slots vazios:</strong> {rack.empty_slots}</p>
                <p><strong>Ocupação:</strong> {ocupacaoPercentual}%</p>
              </div>
              
              {/* Barra de progresso visual */}
              <div className="occupancy-bar">
                <div 
                  className="occupancy-fill"
                  style={{ width: `${ocupacaoPercentual}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mensagem quando não há racks na fileira selecionada */}
      {selectedRow && filteredRacks?.length === 0 && (
        <div className="no-results">
          Nenhum rack encontrado na fileira "{selectedRow}".
        </div>
      )}
    </div>
  );
}

export default RackList;