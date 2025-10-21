import React, { useState, useEffect, useRef } from 'react';
import './GlobalSearch.css';

function GlobalSearch({ onSearchSelect }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);

  // Fechar resultados ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Busca com debounce
  useEffect(() => {
    if (searchTerm.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    const delaySearch = setTimeout(() => {
      fetch(`http://localhost:5000/api/search/global?q=${encodeURIComponent(searchTerm)}`)
        .then(response => response.json())
        .then(data => {
          setResults(data);
          setShowResults(true);
          setLoading(false);
        })
        .catch(error => {
          console.error('Erro na busca:', error);
          setLoading(false);
        });
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  const handleResultClick = (result) => {
    onSearchSelect(result);
    setShowResults(false);
    setSearchTerm('');
    setResults([]);
  };

  const handleInputFocus = () => {
    if (results.length > 0) {
      setShowResults(true);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'rack': return '🗄️';
      case 'equipment': return '💻';
      case 'contact': return '👤';
      default: return '🔍';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'rack': return '#007bff';
      case 'equipment': return '#28a745';
      case 'contact': return '#ffc107';
      default: return '#6c757d';
    }
  };

  return (
    <div className="global-search" ref={searchRef}>
      <div className="search-input-container">
        <input
          type="text"
          placeholder="Buscar racks, equipamentos, contatos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={handleInputFocus}
          className="search-input"
        />
        {loading && <div className="search-spinner">⟳</div>}
        {searchTerm && !loading && (
          <button 
            className="clear-button"
            onClick={() => setSearchTerm('')}
          >
            ×
          </button>
        )}
      </div>
      
      {showResults && (
        <div className="search-results">
          {results.length > 0 ? (
            results.map(result => (
              <div 
                key={`${result.type}-${result.id}`}
                className="search-result-item"
                onClick={() => handleResultClick(result)}
              >
                <div 
                  className="result-type-badge"
                  style={{ backgroundColor: getTypeColor(result.type) }}
                >
                  {getTypeIcon(result.type)} {result.type}
                </div>
                <div className="result-content">
                  <div className="result-name">{result.display_text}</div>
                  {result.rack_name && (
                    <div className="result-detail">
                      <small>Rack: {result.rack_name}</small>
                    </div>
                  )}
                  {result.has_problems === 'yes' && (
                    <div className="problem-indicator">⚠️ Com problemas</div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              Nenhum resultado encontrado para "{searchTerm}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GlobalSearch;