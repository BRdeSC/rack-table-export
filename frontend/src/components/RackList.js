import React, { useState } from "react";
import { apiService } from '../services/api';
import { useApi } from '../hooks/useApi';
import "./RackList.css"

function RackList({ onSelectRack, onError }) {
  const { data: racks, loading, error } = useApi(() => apiService.getRacks());
  const [rackDetails, setRackDetails] = React.useState({});
  const [loadingDetails, setLoadingDetails] = React.useState(true);
  const [selectedRow, setSelectedRow] = useState('');

  // Buscar detalhes completos de cada rack para calcular slots vazios
  React.useEffect(() => {
    const fetchRackDetails = async () => {
      if (!racks) return;

      try {
        setLoadingDetails(true);
        const detailPromises = racks.map(rack =>
          apiService.getRack(rack.id)
            .then(rackDetail => ({
              rackId: rack.id,
              objects: rackDetail.objects || []
            }))
            .catch(error => {
              console.error(`Erro ao carregar detalhes do rack ${rack.id}:`, error);
              return { rackId: rack.id, objects: [] };
            })
        );

        const details = await Promise.all(detailPromises);
        const detailsMap = {};
        details.forEach(detail => {
          detailsMap[detail.rackId] = detail.objects;
        });
        setRackDetails(detailsMap);
      } catch (err) {
        onError?.(`Erro ao carregar detalhes dos racks: ${err.message}`);
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchRackDetails();
  }, [racks, onError]);

  // Função para calcular slots vazios (mesma lógica do RackView original)
  const calculateEmptySlots = (rack, objects) => {
    if (!objects || objects.length === 0) return rack.height;
    
    const occupiedSlots = new Set(objects.map(obj => obj.unit_no));
    return rack.height - occupiedSlots.size;
  };

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
          const rackObjects = rackDetails[rack.id] || [];
          const emptySlots = calculateEmptySlots(rack, rackObjects);
          const equipmentCount = new Set(rackObjects.map(obj => obj.id)).size; // Equipamentos únicos
          
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
                <p><strong>Equipamentos:</strong> {equipmentCount}</p>
                <p><strong>Slots vazios:</strong> {emptySlots}</p>
                {loadingDetails && rackDetails[rack.id] === undefined && (
                  <p><em>Calculando slots...</em></p>
                )}
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