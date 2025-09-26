import React, { useEffect, useState } from "react";

function ContactDetail({ contactName, onBack, onSelectObject }) {
  const [objects, setObjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5000/api/objects/by_person/${encodeURIComponent(contactName)}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Erro na rede ou no servidor');
        }
        return response.json();
      })
      .then(data => {
        setObjects(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Erro ao carregar equipamentos do contato:", error);
        setLoading(false);
      });
  }, [contactName]);

  const handleObjectClick = (objectId) => {
    if (typeof onSelectObject === 'function') {
      onSelectObject(objectId);
    }
  };

  if (loading) return <div className="loading">Carregando equipamentos de {contactName}...</div>;

  return (
    <div className="contact-detail">
      <button onClick={onBack}>← Voltar para lista de responsáveis</button>
      <h2>Equipamentos do responsável: {contactName}</h2>
      <p>Total de equipamentos: {objects.length}</p>
      
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
            <tr key={obj.id} onClick={() => handleObjectClick(obj.id)} style={{ cursor: 'pointer' }}>
              <td>{obj.name}</td>
              <td>{obj.objtype_id === 4 ? 'Servidor' : 'Equipamento de Rede'}</td>
              <td>{obj.asset_no || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {objects.length === 0 && (
        <p>Nenhum equipamento encontrado para este responsável.</p>
      )}
    </div>
  );
}

export default ContactDetail;