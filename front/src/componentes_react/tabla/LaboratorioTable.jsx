import React, { useState } from 'react';
import { Table, TextInput, Select } from 'flowbite-react';

const LaboratorioTable = ({ Laboratorios, handleRowClickLab }) => {
  const [selectedBloque, setSelectedBloque] = useState('');
  const [selectedNombre, setSelectedNombre] = useState('');

  const filteredLaboratorios = Laboratorios.filter((laboratorio) => {
    const bloqueLaboratorio = laboratorio.ubicacion || '';
    const nombreLaboratorio = laboratorio.nombre_laboratorio || '';

    const bloqueMatch = selectedBloque ? bloqueLaboratorio.includes(selectedBloque) : true;
    const nombreMatch = selectedNombre ? nombreLaboratorio.includes(selectedNombre) : true;
    return bloqueMatch && nombreMatch;
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <TextInput
          type="text"
          placeholder="Buscar por laboratorio"
          value={selectedNombre}
          maxLength={4}
          onKeyDown={(e) => {
            if (!/^\d$/.test(e.key) && e.key !== 'Backspace') {
              e.preventDefault();
              alert("Solo se permiten números de 4 dígitos.");
            }
          }}
          onChange={(e) => {
            setSelectedNombre(e.target.value);
          }}
        />

        <Select
          value={selectedBloque}
          onChange={(e) => setSelectedBloque(e.target.value)}
        >
          <option value="">Todas las ubicaciones</option>
          {Array.from(new Set(Laboratorios.map((lab) => lab.ubicacion))).map((ubicacion, idk) => {
            const key = `${ubicacion}-${idk}`;
            return (
              <React.Fragment key={key}>
                <option value={ubicacion}>{ubicacion}</option>
              </React.Fragment>
            );
          })}
        </Select>
      </div>

      <div className="overflow-x-auto">
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell>Laboratorio</Table.HeadCell>
            <Table.HeadCell>Ubicación</Table.HeadCell>
            <Table.HeadCell>Capacidad</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {filteredLaboratorios.map((laboratorio) => (
              <Table.Row
                key={`${laboratorio.id_laboratorio}-${laboratorio.nombre_laboratorio}`}
                className="cursor-pointer bg-white dark:border-gray-700 dark:bg-gray-800"
                onClick={() => handleRowClickLab(laboratorio)}
              >
                <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                  {laboratorio.nombre_laboratorio || "No disponible"}
                </Table.Cell>
                <Table.Cell>{laboratorio.ubicacion || "No disponible"}</Table.Cell>
                <Table.Cell>{laboratorio.capacidad}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
};

export default LaboratorioTable;
