import React, { useEffect, useState } from "react";
import { PieChart, Pie, Tooltip, Legend, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF0000'];

function StatsPage({ stats }) { // Recebe stats como prop do App.js
  // O fetch foi movido para o App.js. Usamos useEffect para formatação interna se necessário, mas aqui só usamos a prop.
  
  if (!stats) return <div>Carregando estatísticas...</div>;

  // Formata os dados para o gráfico de pizza (o App.js já fez o fetch, mas precisamos formatar)
  const objectsByType = stats.objects_by_type.map(item => ({
    name: `Tipo ${item.objtype_id}`,
    value: item.count
  }));
  
  // Formata os dados para o gráfico de barras
  const topRacks = stats.top_racks.map(item => ({
    name: item.name,
    count: item.object_count
  }));


  return (
    <div className="stats-page">
      <h2>Estatísticas Gerais</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total de Racks</h3>
          <p>{stats.total_racks}</p>
        </div>
        <div className="stat-card">
          <h3>Total de Equipamentos</h3>
          <p>{stats.total_objects}</p>
        </div>
      </div>
      
      <div className="charts-container">
        <div className="chart-item">
          <h3>Equipamentos por Tipo</h3>
          <PieChart width={400} height={300}>
            <Pie
              data={objectsByType}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {objectsByType.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>

        <div className="chart-item">
          <h3>Top 10 Racks com Mais Equipamentos</h3>
          <BarChart width={500} height={300} data={topRacks}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8884d8" name="Nº de Equipamentos" />
          </BarChart>
        </div>
      </div>
    </div>
  );
}

export default StatsPage;