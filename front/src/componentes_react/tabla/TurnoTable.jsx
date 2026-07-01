import React, { useState } from 'react';
import { Table, TextInput, Select } from 'flowbite-react';
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
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <TextInput
            type="text"
            placeholder="Buscar por laboratorio"
            value={selectedNombre}
            maxLength={4}
            onChange={(e) => setSelectedNombre(e.target.value)}
          />

          <TextInput
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />

          <Select
            value={selectedEstado}
            onChange={(e) => setSelectedEstado(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="activos">Activos</option>
            <option value="finalizados">Finalizados</option>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Laboratorio</Table.HeadCell>
              <Table.HeadCell>Fecha</Table.HeadCell>
              <Table.HeadCell>Hora Inicio</Table.HeadCell>
              <Table.HeadCell>Hora Fin</Table.HeadCell>
              <Table.HeadCell>Ocupación</Table.HeadCell>
              <Table.HeadCell>Estado</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {filteredTurnos.length > 0 ? (
                filteredTurnos.map((turno) => (
                  <Table.Row
                    key={turno.id_turno}
                    onClick={() => handleRowClickTurno(turno)}
                    className="cursor-pointer bg-white dark:border-gray-700 dark:bg-gray-800"
                  >
                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                      {turno.laboratorio?.nombre_laboratorio || 'No disponible'}
                    </Table.Cell>
                    <Table.Cell>{formatDate(turno.fecha)}</Table.Cell>
                    <Table.Cell>{formatHour(turno.hora_inicio)}</Table.Cell>
                    <Table.Cell>{formatHour(turno.hora_fin)}</Table.Cell>
                    <Table.Cell>{turno.capacidad_ocupada}</Table.Cell>
                    <Table.Cell>{turno.estado || "No definido"}</Table.Cell>
                  </Table.Row>
                ))
              ) : (
                <Table.Row>
                  <Table.Cell colSpan={6} className="text-center">
                    No hay turnos disponibles
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        </div>
      </div>
    );
  };

export default TurnoTable;
