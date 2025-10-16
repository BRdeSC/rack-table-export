import React from "react";
import { apiService } from '../services/api';
import { useApi } from '../hooks/useApi';
import "./ContactDetail.css"

function ContactDetail({ contactName, onBack, onSelectObject, onError }) {
  const { data: objects, loading, error } = useApi(
    () => apiService.getObjectsByPerson(contactName), 
    [contactName]
  );

  const handleObjectClick = (objectId) => {
    if (typeof onSelectObject === 'function') {
      onSelectObject(objectId);
    }
  };

  const handleExport = () => {
    window.open(apiService.exportContactXLSX(contactName), '_blank');
  };

  if (loading) return <div className="loading">Carregando equipamentos de {contactName}...</div>;
  if (error) {
    onError?.(error);
    return <div className="error">Erro ao carregar equipamentos: {error}</div>;
  }

  return (
    <div className="contact-detail">
      <div className="contact-detail-header">
        <button className="back-button" onClick={onBack}>
          ← Voltar para lista de responsáveis
        </button>
        <button onClick={handleExport} className="export-button">
          📊 Exportar para Excel
        </button>
      </div>
      
      <div className="contact-info">
        <h2>Equipamentos do responsável: {contactName}</h2>
        <p className="equipment-count">Total de equipamentos: {objects?.length || 0}</p>
      </div>
      
      {objects && objects.length > 0 ? (
        <table className="objects-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Tipo</th>
              <th>Asset No.</th>
            </tr>
          </thead>
          <tbody>
            {objects.map(obj => (
              <tr key={obj.id} onClick={() => handleObjectClick(obj.id)} className="clickable-row">
                <td>{obj.name}</td>
                <td>{obj.objtype_name || 'N/A'}</td>
                <td>{obj.asset_no || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="no-data">
          <p>Nenhum equipamento encontrado para este responsável.</p>
        </div>
      )}
    </div>
  );
}

export default ContactDetail;