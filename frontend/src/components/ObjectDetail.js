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

  const { object, attributes = [], ports = [], rack } = objectData;

  return (
    <div className="object-detail">
      <button className="back-button" onClick={onBack}>
        ← Voltar para lista de equipamentos
      </button>
      
      <div className="object-header">
        <h2>{object.name}</h2>
      </div>

      {/* Tabela de Resumo */}
      <div className="section">
        <h3>Resumo</h3>
        <table className="data-table">
          <tbody>
            <tr>
              <td className="label-cell"><strong>Common name:</strong></td>
              <td className="value-cell">{object.name || 'N/A'}</td>
            </tr>
            <tr>
              <td className="label-cell"><strong>Object type:</strong></td>
              <td className="value-cell">{object.objtype_name || 'N/A'}</td>
            </tr>
            <tr>
              <td className="label-cell"><strong>Visible label:</strong></td>
              <td className="value-cell">{object.label || 'N/A'}</td>
            </tr>
            <tr>
              <td className="label-cell"><strong>Asset tag:</strong></td>
              <td className="value-cell">{object.asset_no || 'N/A'}</td>
            </tr>
            <tr>
              <td className="label-cell"><strong>Has problems:</strong></td>
              <td className="value-cell">{object.has_problems || 'N/A'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Tabela de Atributos */}
      {attributes.length > 0 && (
        <div className="section">
          <h3>Atributos</h3>
          <table className="data-table">
            {/* <thead>
              <tr>
                <th>Atributo</th>
                <th>Valor</th>
              </tr>
            </thead> */}
            <tbody>
              {attributes.map((attr, index) => (
                <tr key={index}>
                  <td className="label-cell">{attr.attribute_name}</td>
                  <td className="value-cell">{attr.attribute_value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tabela de Comentários */}
      {object.comment && (
        <div className="section">
          <h3>Comentários</h3>
          <table className="data-table">
            <tbody>
              <tr>
                <td className="comment-cell">
                  {object.comment.split('\n').map((line, index) => (
                    <div key={index}>{line || <br />}</div>
                  ))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Tabela de Portas
      {ports.length > 0 && (
        <div className="section">
          <h3>Portas de Rede</h3>
          <table className="data-table">
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
      )} */}

      
      {attributes.length === 0 && ports.length === 0 && !object.comment && !rack && (
        <div className="no-data">
          <p>Nenhum dado adicional disponível para este equipamento.</p>
        </div>
      )}
    </div>
  );
}

export default ObjectDetail;