import React, { useEffect, useState } from "react";
import "./RackList.css"

function RackList({ onSelectRack }) {
  const [racks, setRacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/racks")
      .then(response => response.json())
      .then(data => {
        setRacks(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Erro ao carregar racks:", error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Carregando racks...</div>;

  return (
    <div className="rack-list">
      {/* <h2>Racks do Data Center - {new Set(racks.map(rack => rack.id)).size}</h2> */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Racks do Data Center</h2>
        <button 
          onClick={() => window.location.href = "http://localhost:5000/api/racks/export/xlsx"}
          className="export-button"
        >
          Exportar XLSX
        </button>
      </div>
      <div className="racks-grid">
        {racks.map(rack => (
          <div 
            key={rack.id} 
            className="rack-card"
            onClick={() => onSelectRack(rack.id)}
          >
            <h3>{rack.name}</h3>
            <p>Localização: {rack.location_name}</p>
            <p>Altura: {rack.height}U</p>
            <p>Equipamentos: {rack.object_count}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RackList;