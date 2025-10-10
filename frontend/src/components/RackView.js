import React, { useEffect, useState } from "react";
import "./RackView.css"

function RackView({ rackId, onBack, onSelectObject, onError }) {
  const [rack, setRack] = useState(null);
  const [objects, setObjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5000/api/rack/${rackId}`)
      .then(response => response.json())
      .then(data => {
        setRack(data.rack);
        setObjects(data.objects || []);
        setLoading(false);
      })
      .catch(error => {
        onError("Erro ao carregar rack: " + error.message);
        setLoading(false);
      });
  }, [rackId, onError]);

  const getAtomPosition = (atom) => {
    const positions = {
      1: 'Esq',
      2: 'Centro', 
      3: 'Dir',
      4: 'Esq-Ctrl',
      5: 'Dir-Ctrl'
    };
    return positions[atom] || `Pos ${atom}`;
  };

  const getStateBadge = (state) => {
    const states = {
      'A': { class: 'state-active', text: 'Ativo' },
      'U': { class: 'state-unknown', text: 'Desconhecido' },
      'D': { class: 'state-inactive', text: 'Desativado' },
      '': { class: 'state-unknown', text: 'N/A' }
    };
    const stateInfo = states[state] || states[''];
    return <span className={`state-badge ${stateInfo.class}`}>{stateInfo.text}</span>;
  };

  if (loading) return <div className="loading">Carregando rack...</div>;
  if (!rack) return <div>Rack não encontrado</div>;

  // Processar objetos para calcular slots por equipamento
  const equipmentMap = new Map();
  
  objects.forEach(obj => {
    if (!equipmentMap.has(obj.id)) {
      equipmentMap.set(obj.id, {
        id: obj.id,
        name: obj.name,
        asset_no: obj.asset_no,
        state: obj.state,
        objtype_id: obj.objtype_id,
        slots: new Set(),
        atoms: new Set()
      });
    }
    
    const equipment = equipmentMap.get(obj.id);
    equipment.slots.add(obj.unit_no);
    equipment.atoms.add(obj.atom);
  });

  // Converter para array e calcular informações
  const equipmentList = Array.from(equipmentMap.values()).map(equipment => {
    const slots = Array.from(equipment.slots).sort((a, b) => a - b);
    const minSlot = Math.min(...slots);
    const maxSlot = Math.max(...slots);
    const slotCount = slots.length;
    
    return {
      ...equipment,
      slots,
      minSlot,
      maxSlot,
      slotCount,
      slotRange: slotCount > 1 ? `${minSlot}-${maxSlot}U` : `${minSlot}U`,
      atomPositions: Array.from(equipment.atoms).map(getAtomPosition).join(', ')
    };
  });

  // Criar slots vazios para o rack (visualização original)
  const rackHeight = rack.height || 42;
  const rackSlots = Array.from({ length: rackHeight }, (_, i) => {
    const slotNumber = rackHeight - i;
    const obj = objects.find(o => o.unit_no === slotNumber);
    
    return {
      slot: slotNumber,
      object: obj,
      atom: obj ? obj.atom : null,
      state: obj ? obj.state : null
    };
  });

  // Calcular slots vazios
  const occupiedSlots = new Set(objects.map(obj => obj.unit_no));
  const emptySlots = rackHeight - occupiedSlots.size;

  return (
    <div className="rack-view">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="back-button" onClick={onBack}>
          ← Voltar para lista de racks
        </button>
      </div>
      
      <div className="rack-header">
        <h2>Rack: {rack.name}</h2>
        <div className="rack-info-grid">
          <div className="info-item">
            <strong>Localização</strong>
            <span>{rack.location_name || 'Não especificado'}</span>
          </div>
          <div className="info-item">
            <strong>Row</strong>
            <span>{rack.row_name || 'Não especificado'}</span>
          </div>
          <div className="info-item">
            <strong>Altura</strong>
            <span>{rack.height}U</span>
          </div>
          <div className="info-item">
            <strong>Equipamentos</strong>
            <span>{equipmentList.length} instalados</span>
          </div>
          <div className="info-item">
            <strong>Slots vazios</strong>
            <span>{emptySlots}</span>
          </div>
        </div>
      </div>

      <div className="rack-visualization">
        <h3>Visualização do Rack ({rack.height}U)</h3>
        <div className="rack-frame">
          {rackSlots.map((slot, index) => (
            <div 
              key={index} 
              className={`rack-slot ${slot.object ? 'occupied' : 'empty'}`}
              onClick={() => slot.object && onSelectObject(slot.object.id)}
            >
              <div className="slot-number">{slot.slot}U</div>
              
              {slot.object ? (
                <div className="slot-content">
                  <strong title={slot.object.name}>
                    {slot.object.name}
                  </strong>
                  <div className="slot-details">
                    <span className="slot-detail-item">
                      Asset: {slot.object.asset_no || 'N/A'}
                    </span>
                    <span className="slot-detail-item">
                      Pos: {getAtomPosition(slot.atom)}
                    </span>
                  </div>
                  {getStateBadge(slot.state)}
                </div>
              ) : (
                <div className="slot-empty">Slot vazio</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {equipmentList.length > 0 && (
        <div className="rack-objects-list">
          <h3>Lista de Equipamentos - {equipmentList.length}</h3>
          <table className="objects-table">
            <thead>
              <tr>
                <th>Slots</th>
                <th>Nome</th>
                <th>Asset</th>
                <th>Posição</th>
                <th>Estado</th>
                <th>Tipo</th>
                <th>Altura</th>
              </tr>
            </thead>
            <tbody>
              {equipmentList.map(equipment => (
                <tr key={equipment.id} onClick={() => onSelectObject(equipment.id)}>
                  <td><strong>{equipment.slotRange}</strong></td>
                  <td>{equipment.name}</td>
                  <td>{equipment.asset_no || 'N/A'}</td>
                  <td>{equipment.atomPositions}</td>
                  <td>{getStateBadge(equipment.state)}</td>
                  <td>{equipment.objtype_id}</td>
                  <td>{equipment.slotCount}U</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default RackView;