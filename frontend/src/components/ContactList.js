import React, { useState, useEffect } from "react";
import "./ContactList.css"

function ContactList({ onSelectContact }) {
  const [contacts, setContacts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [equipmentCounts, setEquipmentCounts] = useState({});

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5000/api/contacts");
        
        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        setContacts(data);

        const counts = {};
        for (const contact of data) {
          const resp = await fetch(
            `http://localhost:5000/api/objects/by_person/${encodeURIComponent(contact.contact_name)}`
          );
          if (resp.ok) {
            const objs = await resp.json();
            counts[contact.contact_name] = objs.length;
          } else {
            counts[contact.contact_name] = 0;
          }
        }
        setEquipmentCounts(counts);

      } catch (err) {
        setError(err.message);
        console.error("Erro ao buscar contatos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  const handleContactClick = (contactName) => {
    if (typeof onSelectContact === 'function') {
      onSelectContact(contactName);
    }
  };

  if (loading) {
    return <div className="loading">Carregando responsáveis...</div>;
  }

  if (error) {
    return <div className="error">Erro ao carregar responsáveis: {error}</div>;
  }

  if (!contacts || contacts.length === 0) {
    return <div className="no-data">Nenhum responsável encontrado.</div>;
  }
  
  return (
    <div className="contact-list">
      <div className="contact-list-header">
        <h2>Todos os contatos - {contacts.length} </h2>

        <button onClick={() => window.location.href = "http://localhost:5000/api/contacts/export/xlsx"}>
          Exportar XLSX
        </button>
      </div>
      <table className="contacts-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Total de equipamentos</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map(cto => (
            <tr key={cto.id} onClick={() => handleContactClick(cto.contact_name)}>
              <td>{cto.contact_name}</td>
              <td>
                {equipmentCounts[cto.contact_name] !== undefined
                  ? equipmentCounts[cto.contact_name]
                  : "Carregando..."}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ContactList;