import React, { useState } from 'react';
import '../../styles/Dashboard.css';

const IncidenciaLabTable = ({ incidencias, handleRowClickIncidencia }) => {
  const [selectedLaboratorio, setSelectedLaboratorio] = useState('');
  
  
  const filteredIncidencias = incidencias.filter((incidencia) => {
    const laboratorioNombre = incidencia.laboratorio?.nombre_laboratorio || 'No disponible';
    return selectedLaboratorio ? laboratorioNombre.includes(selectedLaboratorio) : true;
  });

  return (
    <div className="table-container">
      <div className="filters">
        
        <input
          type="text"
          placeholder="Buscar por laboratorio"
          value={selectedLaboratorio}
          onChange={(e) => setSelectedLaboratorio(e.target.value)}
          className="filter-input"
        />
      </div>

      <table className="turnos-table">
        <thead>
          <tr>
            <th>Incidencia</th>
            <th>Laboratorio</th>
            <th>Fecha Asociada</th>
          </tr>
        </thead>
        <tbody>
          {filteredIncidencias.map((incidencia) => (
            <tr key={incidencia.id_incidencia} className="turno-row" onClick={() => handleRowClickIncidencia(incidencia)}>
              <td>{incidencia.incidencia || "No disponible"}</td>
              <td>{incidencia.laboratorio?.nombre_laboratorio || "No disponible"}</td>
              <td>{new Date(incidencia.fecha_asociacion).toLocaleDateString("es-ES")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default IncidenciaLabTable;