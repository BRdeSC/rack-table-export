import React, { useState, useEffect } from "react";
import { apiService } from '../services/api';
import { useApi } from '../hooks/useApi';
import "./ContactList.css"

function ContactList({ onSelectContact, onError }) {
  const { data: contacts, loading, error } = useApi(() => apiService.getContacts());
  const [equipmentCounts, setEquipmentCounts] = useState({});

  // Carregar contagens de equipamentos para cada contato
  useEffect(() => {
    const fetchEquipmentCounts = async () => {
      if (!contacts) return;

      const counts = {};
      
      try {
        await Promise.all(
          contacts.map(async (contact) => {
            try {
              const objects = await apiService.getObjectsByPerson(contact.contact_name);
              counts[contact.contact_name] = objects.length;
            } catch (err) {
              console.error(`Erro ao carregar equipamentos para ${contact.contact_name}:`, err);
              counts[contact.contact_name] = 0;
            }
          })
        );
        
        setEquipmentCounts(counts);
      } catch (err) {
        onError?.(`Erro ao carregar contagens de equipamentos: ${err.message}`);
      }
    };

    fetchEquipmentCounts();
  }, [contacts, onError]);

  const handleContactClick = (contactName) => {
    if (typeof onSelectContact === 'function') {
      onSelectContact(contactName);
    }
  };

  if (loading) return <div className="loading">Carregando responsáveis...</div>;
  if (error) {
    onError?.(error);
    return <div className="error">Erro ao carregar responsáveis: {error}</div>;
  }
  if (!contacts || contacts.length === 0) {
    return <div className="no-data">Nenhum responsável encontrado.</div>;
  }

  return (
    <div className="contact-list">
      <div className="contact-list-header">
        <h2>Todos os contatos - {contacts.length}</h2>
        <button onClick={() => window.location.href = apiService.exportContactsXLSX()}>
          📊 Exportar XLSX
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
          {contacts.map(contact => (
            <tr key={contact.id} onClick={() => handleContactClick(contact.contact_name)}>
              <td>{contact.contact_name}</td>
              <td>
                {equipmentCounts[contact.contact_name] !== undefined
                  ? equipmentCounts[contact.contact_name]
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