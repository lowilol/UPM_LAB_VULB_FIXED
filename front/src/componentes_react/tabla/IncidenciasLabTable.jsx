import React, { useState } from 'react';
import { Table, TextInput } from 'flowbite-react';

const IncidenciaLabTable = ({ incidencias, handleRowClickIncidencia }) => {
  const [selectedLaboratorio, setSelectedLaboratorio] = useState('');

  const filteredIncidencias = incidencias.filter((incidencia) => {
    const laboratorioNombre = incidencia.laboratorio?.nombre_laboratorio || 'No disponible';
    return selectedLaboratorio ? laboratorioNombre.includes(selectedLaboratorio) : true;
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <TextInput
          type="text"
          placeholder="Buscar por laboratorio"
          value={selectedLaboratorio}
          onChange={(e) => setSelectedLaboratorio(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell>Incidencia</Table.HeadCell>
            <Table.HeadCell>Laboratorio</Table.HeadCell>
            <Table.HeadCell>Fecha Asociada</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {filteredIncidencias.map((incidencia) => (
              <Table.Row
                key={incidencia.id_incidencia}
                className="cursor-pointer bg-white dark:border-gray-700 dark:bg-gray-800"
                onClick={() => handleRowClickIncidencia(incidencia)}
              >
                <Table.Cell
                  className="max-w-[16rem] truncate font-medium text-gray-900 dark:text-white"
                  title={incidencia.incidencia || "No disponible"}
                >
                  {incidencia.incidencia || "No disponible"}
                </Table.Cell>
                <Table.Cell>{incidencia.laboratorio?.nombre_laboratorio || "No disponible"}</Table.Cell>
                <Table.Cell>{new Date(incidencia.fecha_asociacion).toLocaleDateString("es-ES")}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
};

export default IncidenciaLabTable;
