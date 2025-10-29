import React, { useState, useEffect } from "react";
import RackView from "./components/RackView";
import ObjectDetail from "./components/ObjectDetail";
import RackList from "./components/RackList";
import ObjectList from "./components/ObjectList";
import ContactList from "./components/ContactList";
import ContactDetail from "./components/ContactDetail";
import StatsPage from "./components/StatsPage";
import GlobalSearch from "./components/GlobalSearch";
import { apiService } from "./services/api";
import { useApi } from "./hooks/useApi";
import "./App.css";

function App() {
  const [view, setView] = useState("racks");
  const [selectedRack, setSelectedRack] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);

  // Usando o hook personalizado para estatísticas
  const { 
    data: stats, 
    loading: loadingStats, 
    error: statsError, 
    refetch: refetchStats 
  } = useApi(() => apiService.getStats(), [view === "stats"]);

  // Função para carregar estatísticas (mantida para compatibilidade)
  const loadStats = async () => {
    await refetchStats();
  };

  // Função para limpar todos os estados de seleção e mudar a view
  const handleNavClick = (newView) => {
    setView(newView);
    setSelectedRack(null);
    setSelectedObject(null);
    setSelectedContact(null);
  };

  // Função para tratar a seleção de resultados da busca
  const handleSearchSelect = (result) => {
    console.log("Resultado da busca selecionado:", result);
    
    switch (result.type) {
      case 'rack':
        setView("racks");
        setSelectedRack(result.id);
        setSelectedObject(null);
        setSelectedContact(null);
        break;
      
      case 'equipment':
        setView("objects");
        setSelectedObject(result.id);
        setSelectedRack(null);
        setSelectedContact(null);
        break;
      
      case 'contact':
        setView("contacts");
        setSelectedContact(result.name || result.id);
        setSelectedRack(null);
        setSelectedObject(null);
        break;
      
      default:
        console.warn("Tipo de resultado desconhecido:", result.type);
    }
  };


  // Função para tratar erros (pode ser passada para componentes filhos)
  const handleError = (errorMessage) => {
    console.error("Erro na aplicação:", errorMessage);
    // pode adicionar aqui um sistema de notificação/toast
  };

  // Lógica para renderizar SOMENTE a página de detalhes do objeto
  if (selectedObject) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>Data Center COIDS | SESUP</h1>
        </header>
        <main className="app-main">
          <ObjectDetail 
            objectId={selectedObject}
            onBack={() => setSelectedObject(null)}
            onError={handleError}
          />
        </main>
      </div>
    );
  }

  // Lógica para renderizar SOMENTE a página de detalhes do contato
  if (selectedContact) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>Data Center COIDS | SESUP</h1>
        </header>
        <main className="app-main">
          <ContactDetail 
            contactName={selectedContact}
            onBack={() => setSelectedContact(null)}
            onSelectObject={setSelectedObject}
            onError={handleError}
          />
        </main>
      </div>
    );
  }

  // Lógica para renderizar as outras páginas
  return (
    <div className="app">
      <header className="app-header">
        <div className="header-top">
          <h1>Data Center COIDS | SESUP</h1>
          <div className="search-container">
            <GlobalSearch onSearchSelect={handleSearchSelect} />
          </div>
        </div>
        <nav>
          <button 
            onClick={() => handleNavClick("racks")}
            className={view === "racks" ? "active" : ""}
          >
            🗄️ Racks
          </button>
          <button 
            onClick={() => handleNavClick("objects")}
            className={view === "objects" ? "active" : ""}
          >
            💻 Equipamentos
          </button>
          <button 
            onClick={() => handleNavClick("contacts")}
            className={view === "contacts" ? "active" : ""}
          >
            👤 Responsáveis
          </button>
          <button 
            onClick={() => handleNavClick("stats")}
            className={view === "stats" ? "active" : ""}
          >
            📊 Estatísticas
          </button>
        </nav>
      </header>

      <main className="app-main">
        {view === "racks" && !selectedRack && (
          <RackList 
            onSelectRack={setSelectedRack}
            onError={handleError}
          />
        )}
        {view === "racks" && selectedRack && (
          <RackView 
            rackId={selectedRack} 
            onBack={() => setSelectedRack(null)}
            onSelectObject={setSelectedObject}
            onError={handleError}
          />
        )}

        {view === "objects" && (
          <ObjectList 
            onSelectObject={setSelectedObject}
            onError={handleError}
          />
        )}

        {view === "contacts" && (
          <ContactList 
            onSelectContact={setSelectedContact}
            onError={handleError}
          />
        )}

        {view === "stats" && (
          <StatsPage 
            stats={stats} 
            loading={loadingStats} 
            error={statsError}
            onReload={loadStats} 
          />
        )}
      </main>
    </div>
  );
}

export default App;