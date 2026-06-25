import React, { useState } from 'react';
import '../../styles/Dashboard.css';

import { formatDate, formatHour, normalizarFecha } from "../TimeFormat/FuntionTimeFormat";

const ReservaTable = ({ reservas , handleRowClickReserva }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('Todas');

  
  const filteredReservas = reservas.filter((reserva) => {
    const fechaReserva = reserva.turno?.fecha || '';
    const estadoReserva = reserva.estado || '';

    const dateMatch = selectedDate ? fechaReserva === selectedDate : true;
    const estadoMatch = selectedEstado === 'Todas' || estadoReserva === selectedEstado;

    return dateMatch && estadoMatch;
  });

  return (
      <div className="table-container">
          <div className="filters">
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

                  <option value="Todas">Todas</option>
                  <option value="Aceptado">Aceptado</option>
                  <option value="Cancelada">Cancelada</option>
              </select>
          </div>
          <table className="turnos-table">
       <thead>
          <tr>
             <th>Laboratorio</th>
             <th>Fecha del Turno</th>
             <th>Hora Inicio</th>
             <th>Hora Fin</th>
             <th>Fecha de Reserva</th>

          </tr>
       </thead>
       <tbody>
          {filteredReservas.map((reserva) => (
             <tr key={reserva.id_reserva} className="turno-row" onClick={() => handleRowClickReserva(reserva)}>
                <td>{reserva.turno?.laboratorio?.nombre_laboratorio || "No disponible"}</td>
                <td>{formatDate(reserva.turno?.fecha) || "No disponible"}</td>
                <td>{formatHour(reserva.turno?.hora_inicio) || "No disponible"}</td>
                <td>{formatHour(reserva.turno?.hora_fin) || "No disponible"}</td>
                <td>{normalizarFecha(reserva.fecha_reserva)}</td>

             </tr>
          ))}
       </tbody>
    </table>
 </div>
  );
};

export default ReservaTable;