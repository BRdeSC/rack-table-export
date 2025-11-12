import React from "react";
import { apiService } from '../services/api';
import { useApi } from '../hooks/useApi';
import "./ObjectDetail.css"

function ObjectDetail({ objectId, onBack, onError }) {
  const { data: objectData, loading, error } = useApi(() => apiService.getObject(objectId), [objectId]);

  if (loading) return <div className="loading">Carregando equipamento...</div>;
  if (error) {
    onError?.(error);
    return <div className="error">Erro ao carregar equipamento: {error}</div>;
  }
  if (!objectData?.object) return <div>Equipamento não encontrado</div>;

  const { object, attributes = [], ports = [] } = objectData;

  return (
    <div className="object-detail">
      <button className="back-button" onClick={onBack}>
        ← Voltar para lista de equipamentos
      </button>
      
      <div className="object-header">
        <h2>{object.name}</h2>
        <div className="object-basic-info">
          {/* <p><strong>ID:</strong> {object.id}</p> */}
          <p><strong>Object type:</strong> {object.objtype_name || 'N/A'}</p>
          <p><strong>Visible label:</strong> {object.label || 'N/A'}</p>
          <p><strong>Asset tag:</strong> {object.asset_no || 'N/A'}</p>
          <p><strong>Has_problems:</strong> {object.has_problems || 'N/A'}</p>
          <p><strong>Comments:</strong> {object.comment || 'N/A'}</p>
        </div>
      </div>
      
      {attributes.length > 0 && (
        <div className="attributes-section">
          <h3>Atributos</h3>
          <table className="attributes-table">
            <thead>
              <tr>
                <th>Atributo</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              {attributes.map((attr, index) => (
                <tr key={index}>
                  <td>{attr.attribute_name}</td>
                  <td>{attr.attribute_value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {ports.length > 0 && (
        <div className="ports-section">
          <h3>Portas de Rede</h3>
          <table className="ports-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Tipo</th>
                <th>IP</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {ports.map((port, index) => (
                <tr key={index}>
                  <td>{port.port_name}</td>
                  <td>{port.port_type}</td>
                  <td>{port.port_label || 'N/A'}</td>
                  <td>{port.port_state}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {attributes.length === 0 && ports.length === 0 && (
        <div className="no-data">
          <p>Nenhum dado adicional disponível para este equipamento.</p>
        </div>
      )}
    </div>
  );
}

export default ObjectDetail;