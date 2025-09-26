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

  // Criar slots vazios para o rack
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

  // Filtra a lista de objetos para remover duplicatas
  const seenObjectIds = new Set();
    const uniqueObjects = objects.filter(obj => {
    if (seenObjectIds.has(obj.id)) {
      return false; // Se o ID já foi visto, descarte
    }
    seenObjectIds.add(obj.id);
    return true; // Se o ID é novo, mantenha-o
  });

  return (
    <div className="rack-view">
      {/* <button className="back-button" onClick={onBack}>
        ← Voltar para lista de racks
      </button> */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="back-button" onClick={onBack}>
          ← Voltar para lista de racks
        </button>
        <button 
          onClick={() => window.location.href = `http://localhost:5000/api/objects/rack/${rack.id}/export/xlsx`}
          className="export-button"
        >
          Exportar XLSX
        </button>

        {/* <button 
          onClick={() => window.location.href = `http://localhost:5000/api/objects/rack/${rack.id}/export/pdf`}
          className="export-button"
        >
          Exportar PDF
        </button>  */}
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
            {/* <span>{objects.length} instalados</span>  */}
            <span>{new Set(objects.map(obj => obj.id)).size} instalados</span>
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

      {objects.length > 0 && (
        <div className="rack-objects-list">
          {/* <h3>Lista de Equipamentos ({objects.length})</h3> */}
          <h3>Lista de Equipamentos - {new Set(objects.map(obj => obj.id)).size}</h3>
          <table className="objects-table">
            <thead>
              <tr>
                <th>Unit</th>
                <th>Nome</th>
                <th>Asset</th>
                <th>Posição</th>
                <th>Estado</th>
                <th>Tipo</th>
              </tr>
            </thead>
            {/* <tbody>
              {objects.map(obj => (
                <tr key={obj.id} onClick={() => onSelectObject(obj.id)}>
                  <td><strong>{obj.unit_no}U</strong></td>
                  <td>{obj.name}</td>
                  <td>{obj.asset_no || 'N/A'}</td>
                  <td>{getAtomPosition(obj.atom)}</td>
                  <td>{getStateBadge(obj.state)}</td>
                  <td>Tipo {obj.objtype_id}</td>
                </tr>
              ))}
            </tbody> */}

            <tbody>
              {uniqueObjects.map(obj => (
                <tr key={obj.id} onClick={() => onSelectObject(obj.id)}>
                  <td><strong>{obj.unit_no}U</strong></td>
                  <td>{obj.name}</td>
                  <td>{obj.asset_no || 'N/A'}</td>
                  <td>{getAtomPosition(obj.atom)}</td>
                  <td>{getStateBadge(obj.state)}</td>
                  <td>Tipo {obj.objtype_id}</td>
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