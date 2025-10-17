import React from "react";
import { apiService } from '../services/api';
import { useApi } from '../hooks/useApi';
import "./RackList.css"

function RackList({ onSelectRack, onError }) {
  const { data: racks, loading, error } = useApi(() => apiService.getRacks());
  const [rackDetails, setRackDetails] = React.useState({});
  const [loadingDetails, setLoadingDetails] = React.useState(true);

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

  if (loading) return <div className="loading">Carregando racks...</div>;
  if (error) {
    onError?.(error);
    return <div className="error">Erro ao carregar racks: {error}</div>;
  }

  return (
    <div className="rack-list">
      <div className="rack-list-header">
        <h2>Racks do Data Center</h2>
        <button 
          onClick={() => window.location.href = apiService.exportRacksXLSX()}
          className="export-button"
        >
          📊 Exportar XLSX
        </button>
      </div>
      <div className="racks-grid">
        {racks?.map(rack => {
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
    </div>
  );
}

export default RackList;