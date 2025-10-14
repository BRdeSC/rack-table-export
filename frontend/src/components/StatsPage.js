import React from 'react';

const StatsPage = ({ stats, loading, error, onReload }) => {
  console.log("Stats data:", stats);
  if (loading) {
    return (
      <div className="stats-page">
        <h2>Estatísticas Gerais</h2>
        <div className="loading">Carregando estatísticas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stats-page">
        <h2>Estatísticas Gerais</h2>
        <div className="error">
          <p>Erro: {error}</p>
          <button onClick={onReload} className="btn">Tentar Novamente</button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="stats-page">
        <h2>Estatísticas Gerais</h2>
        <div className="no-data">
          <p>Nenhum dado disponível</p>
          <button onClick={onReload} className="btn">Carregar Dados</button>
        </div>
      </div>
    );
  }

  // Prepara dados para exibição
  const topTypes = stats.objects_by_type ? stats.objects_by_type.slice(0, 8) : [];
  const topRacks = stats.top_racks ? stats.top_racks.slice(0, 8) : [];

  return (
    <div className="stats-page">
      <div className="stats-header">
        <h2>Estatísticas Gerais - Página em teste e desenvolvimento da Api!</h2>
        <button onClick={onReload} className="btn">Atualizar Dados</button>
      </div>
      
      {/* Cards com totais */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-number">{stats.total_racks}</div>
          <div className="stat-label">Total de Racks</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.total_equipments}</div>
          <div className="stat-label">Total de Equipamentos</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.objects_by_type ? stats.objects_by_type.length : 0}</div>
          <div className="stat-label">Tipos Diferentes de Equipamentos</div>
        </div>
      </div>

      {/* Gráfico simulado com CSS - Top Tipos */}
      <div className="chart-section">
        <h3>Distribuição por Tipo de Equipamento (Top 8)</h3>
        <div className="bar-chart">
          {topTypes.map((item, index) => {
            const percentage = (item.count / stats.total_equipments) * 100;
            return (
              <div key={item.objtype_id} className="bar-item">
                <div className="bar-label">{item.objtype_name}</div>
                <div className="bar-container">
                  <div 
                    className="bar-fill"
                    style={{ width: `${percentage}%` }}
                  ></div>
                  <div className="bar-value">{item.count}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lista de racks */}
      <div className="racks-section">
        <h3>Top Racks com Mais Equipamentos</h3>
        <div className="racks-list">
          {topRacks.map((rack, index) => (
            <div key={rack.name} className="rack-item">
              <span className="rack-rank">#{index + 1}</span>
              <span className="rack-name">{rack.name}</span>
              <span className="rack-count">{rack.object_count} equipamentos</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsPage;