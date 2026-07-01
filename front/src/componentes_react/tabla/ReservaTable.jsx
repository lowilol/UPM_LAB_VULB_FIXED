import React, { useState } from 'react';
import { Table, TextInput, Select } from 'flowbite-react';
import { formatDate, formatHour, normalizarFecha } from "../TimeFormat/FuntionTimeFormat";

const ReservaTable = ({ reservas, handleRowClickReserva }) => {
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
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <TextInput
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />

        <Select
          value={selectedEstado}
          onChange={(e) => setSelectedEstado(e.target.value)}
        >
          <option value="Todas">Todas</option>
          <option value="Aceptado">Aceptado</option>
          <option value="Cancelada">Cancelada</option>
        </Select>
      </div>

      <div className="overflow-x-auto">
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell>Laboratorio</Table.HeadCell>
            <Table.HeadCell>Fecha del Turno</Table.HeadCell>
            <Table.HeadCell>Hora Inicio</Table.HeadCell>
            <Table.HeadCell>Hora Fin</Table.HeadCell>
            <Table.HeadCell>Fecha de Reserva</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {filteredReservas.map((reserva) => (
              <Table.Row
                key={reserva.id_reserva}
                className="cursor-pointer bg-white dark:border-gray-700 dark:bg-gray-800"
                onClick={() => handleRowClickReserva(reserva)}
              >
                <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                  {reserva.turno?.laboratorio?.nombre_laboratorio || "No disponible"}
                </Table.Cell>
                <Table.Cell>{formatDate(reserva.turno?.fecha) || "No disponible"}</Table.Cell>
                <Table.Cell>{formatHour(reserva.turno?.hora_inicio) || "No disponible"}</Table.Cell>
                <Table.Cell>{formatHour(reserva.turno?.hora_fin) || "No disponible"}</Table.Cell>
                <Table.Cell>{normalizarFecha(reserva.fecha_reserva)}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
};

export default ReservaTable;
