import React, { useState } from 'react';
import '../../styles/Dashboard.css';
import { formatDate, formatHour } from "../TimeFormat/FuntionTimeFormat";

const TurnoTable = ({ Turnos, handleRowClickTurno }) => {
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedNombre, setSelectedNombre] = useState('');
    const [selectedEstado, setSelectedEstado] = useState('todos'); // 'todos', 'activos', 'finalizados'

    // Filtrar turnos según búsqueda
    const filteredTurnos = Turnos.filter((turno) => {
        const laboratorioNombre = turno.laboratorio?.nombre_laboratorio || '';
        const fechaTurno = turno.fecha || '';
        const estadoTurno = turno.estado || ''; // Estado del turno (activo o finalizado)

        // Filtros
        const nombreMatch = selectedNombre ? laboratorioNombre.includes(selectedNombre) : true;
        const fechaMatch = selectedDate ? fechaTurno === selectedDate : true;
        const estadoMatch = 
            selectedEstado === 'todos' ? true :
            selectedEstado === 'activos' ? estadoTurno !== 'Finalizado' :
            estadoTurno === 'Finalizado';

        return nombreMatch && fechaMatch && estadoMatch;
    });

    return (
      <div className="table-container">
        <div className="filters">
         
          <input
            type="text"
            placeholder="Buscar por laboratorio"
            value={selectedNombre}
            maxLength={4}
            onChange={(e) => setSelectedNombre(e.target.value)}
            className="filter-input"
          />

         
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="filter-date"
          />

        
          <select 
            value={selectedEstado} 
            onChange={(e) => setSelectedEstado(e.target.value)} 
            className="filter-select"
          >
            <option value="todos">Todos</option>
            <option value="activos">Activos</option>
            <option value="finalizados">Finalizados</option>
          </select>
        </div>

      
        <table className="turnos-table">
          <thead>
            <tr>
              <th>Laboratorio</th>
              <th>Fecha</th>
              <th>Hora Inicio</th>
              <th>Hora Fin</th>
              <th>Ocupación</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {filteredTurnos.length > 0 ? (
              filteredTurnos.map((turno) => (
                <tr
                  key={turno.id_turno}
                  onClick={() => handleRowClickTurno(turno)}
                  className="turno-row"
                >
                  <td>{turno.laboratorio?.nombre_laboratorio || 'No disponible'}</td>
                  <td>{formatDate(turno.fecha)}</td>
                  <td>{formatHour(turno.hora_inicio)}</td>
                  <td>{formatHour(turno.hora_fin)}</td>
                  <td>{turno.capacidad_ocupada}</td>
                  <td>{turno.estado || "No definido"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-results">No hay turnos disponibles</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

export default TurnoTable;