import React, { useState, useEffect } from "react";
import RackView from "./components/RackView";
import ObjectDetail from "./components/ObjectDetail";
import RackList from "./components/RackList";
import ObjectList from "./components/ObjectList";
import ContactList from "./components/ContactList";
import ContactDetail from "./components/ContactDetail";
import StatsPage from "./components/StatsPage";
import "./App.css";

function App() {
  const [view, setView] = useState("racks");
  const [selectedRack, setSelectedRack] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [error, setError] = useState(null);

  // Função para carregar estatísticas
  const loadStats = async () => {
    setLoadingStats(true);
    setError(null);
    try {
      console.log("Carregando estatísticas...");
      
      // Use a URL correta baseada no seu ambiente
      const apiUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5000/api/stats'  // URL do Flask em desenvolvimento
        : '/api/stats';  // URL em produção
      
      console.log(`Tentando URL: ${apiUrl}`);
      
      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Resposta não é JSON: ${text.substring(0, 100)}`);
      }
      
      const data = await response.json();
      console.log("Dados recebidos:", data);
      setStats(data);
      
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
      setError(error.message);
      setStats(null);
    } finally {
      setLoadingStats(false);
    }
  };

  // Carrega estatísticas automaticamente quando a view muda para "stats"
  useEffect(() => {
    if (view === "stats") {
      loadStats();
    }
  }, [view]);

  // Função para limpar todos os estados de seleção e mudar a view
  const handleNavClick = (newView) => {
    setView(newView);
    setSelectedRack(null);
    setSelectedObject(null);
    setSelectedContact(null);
    setError(null);
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
          />
        </main>
      </div>
    );
  }

  // Lógica para renderizar as outras páginas
  return (
    <div className="app">
      <header className="app-header">
        <h1>Data Center COIDS | SESUP</h1>
        <nav>
          <button onClick={() => handleNavClick("racks")}>Racks</button>
          <button onClick={() => handleNavClick("objects")}>Equipamentos</button>
          <button onClick={() => handleNavClick("contacts")}>Responsáveis</button>
          <button onClick={() => handleNavClick("stats")}>Estatísticas</button>
        </nav>
      </header>

      <main className="app-main">
        {view === "racks" && !selectedRack && (
          <RackList onSelectRack={setSelectedRack} />
        )}
        {view === "racks" && selectedRack && (
          <RackView 
            rackId={selectedRack} 
            onBack={() => setSelectedRack(null)}
            onSelectObject={setSelectedObject}
          />
        )}

        {view === "objects" && (
          <ObjectList onSelectObject={setSelectedObject} />
        )}

        {view === "contacts" && (
          <ContactList onSelectContact={setSelectedContact} />
        )}

        {view === "stats" && (
          <StatsPage 
            stats={stats} 
            loading={loadingStats} 
            error={error}
            onReload={loadStats} 
          />
        )}
      </main>
    </div>
  );
}

export default App;