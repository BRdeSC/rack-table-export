import React, { useEffect, useState } from "react";
import "./RackList.css"

function RackList({ onSelectRack }) {
  const [racks, setRacks] = useState([]);
  const [rackDetails, setRackDetails] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Primeiro, buscar a lista básica de racks
    fetch("http://localhost:5000/api/racks")
      .then(response => response.json())
      .then(racksData => {
        setRacks(racksData);
        
        // Para cada rack, buscar os detalhes completos para calcular slots vazios
        const detailPromises = racksData.map(rack =>
          fetch(`http://localhost:5000/api/rack/${rack.id}`)
            .then(response => response.json())
            .then(rackDetail => ({
              rackId: rack.id,
              objects: rackDetail.objects || []
            }))
            .catch(error => {
              console.error(`Erro ao carregar detalhes do rack ${rack.id}:`, error);
              return { rackId: rack.id, objects: [] };
            })
        );

        Promise.all(detailPromises)
          .then(details => {
            const detailsMap = {};
            details.forEach(detail => {
              detailsMap[detail.rackId] = detail.objects;
            });
            setRackDetails(detailsMap);
            setLoading(false);
          });
      })
      .catch(error => {
        console.error("Erro ao carregar racks:", error);
        setLoading(false);
      });
  }, []);

  // Função para calcular slots vazios (mesma lógica do RackView)
  const calculateEmptySlots = (rack, objects) => {
    if (!objects || objects.length === 0) return rack.height;
    
    const occupiedSlots = new Set(objects.map(obj => obj.unit_no));
    return rack.height - occupiedSlots.size;
  };

  if (loading) return <div>Carregando racks...</div>;

  return (
    <div className="rack-list">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Racks do Data Center</h2>
        <button 
          onClick={() => window.location.href = "http://localhost:5000/api/racks/export/xlsx"}
          className="export-button"
        >
          📊 Exportar XLSX
        </button>
      </div>
      <div className="racks-grid">
        {racks.map(rack => {
          const rackObjects = rackDetails[rack.id] || [];
          const emptySlots = calculateEmptySlots(rack, rackObjects);
          
          return (
            <div 
              key={rack.id} 
              className="rack-card"
              onClick={() => onSelectRack(rack.id)}
            >
              <h3>{rack.name}</h3>
              <p>Localização: {rack.location_name}</p>
              <p>Altura: {rack.height}U</p>
              <p>Equipamentos: {rack.object_count}</p>
              <p>Slots vazios: {emptySlots}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RackList;