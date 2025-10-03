import React, { useState } from "react";
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

  // Função para limpar todos os estados de seleção e mudar a view
  const handleNavClick = (newView) => {
    setView(newView);
    setSelectedRack(null);
    setSelectedObject(null);
    setSelectedContact(null);
  };

  // Lógica para renderizar SOMENTE a página de detalhes do objeto
  if (selectedObject) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>Data Center Management System</h1>
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
          <h1>Data Center Management System</h1>
        </header>
        <main className="app-main">
          <ContactDetail 
            contactName={selectedContact}
            onBack={() => setSelectedContact(null)}
            onSelectObject={setSelectedObject} // ← ADICIONE ESTA PROP
          />
        </main>
      </div>
    );
  }

  // Lógica para renderizar as outras páginas
  return (
    <div className="app">
       <header className="app-header">
        <h1>Data Center Management System</h1>
        <nav>
          <button onClick={() => handleNavClick("racks")}>Lista de Racks</button>
          <button onClick={() => handleNavClick("objects")}>Todos os Equipamentos</button>
          <button onClick={() => handleNavClick("contacts")}>Responsáveis por equipamentos</button>
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
          <StatsPage />
        )}
      </main>
    </div>
  );
}

export default App;