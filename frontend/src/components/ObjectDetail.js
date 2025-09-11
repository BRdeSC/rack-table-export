import React, { useEffect, useState } from "react";

function ObjectDetail({ objectId, onBack }) {
  const [object, setObject] = useState(null);
  const [attributes, setAttributes] = useState([]);
  const [ports, setPorts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5000/api/object/${objectId}`)
      .then(response => response.json())
      .then(data => {
        setObject(data.object);
        setAttributes(data.attributes);
        setPorts(data.ports);
        setLoading(false);
      })
      .catch(error => {
        console.error("Erro ao carregar objeto:", error);
        setLoading(false);
      });
  }, [objectId]);

  if (loading) return <div>Carregando equipamento...</div>;
  if (!object) return <div>Equipamento não encontrado</div>;

  return (
    <div className="object-detail">
      <button onClick={onBack}>← Voltar</button>
      <h2>{object.name}</h2>
      <p>ID: {object.id}</p>
      <p>Tipo: {object.objtype_id === 4 ? 'Servidor' : 'Equipamento de Rede'}</p>
      
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
  );
}

export default ObjectDetail;