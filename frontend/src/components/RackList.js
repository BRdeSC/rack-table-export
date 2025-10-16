import { apiService } from '../services/api';
import { useApi } from '../hooks/useApi';
import "./RackList.css"

function RackList({ onSelectRack }) {
  const { data: racks, loading, error } = useApi(() => apiService.getRacks());

  if (loading) return <div>Carregando racks...</div>;
  if (error) return <div>Erro ao carregar racks: {error}</div>;

  return (
    <div className="rack-list">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Racks do Data Center</h2>
        <button 
          onClick={() => window.location.href = apiService.exportRacksXLSX()}
          className="export-button"
        >
          📊 Exportar XLSX
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