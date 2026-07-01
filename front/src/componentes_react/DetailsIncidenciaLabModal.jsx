import React from "react";
import { Modal, Button } from "flowbite-react";
import { normalizarFecha } from "./TimeFormat/FuntionTimeFormat";

const DetailRow = ({ label, value }) => (
  <div className="flex justify-between gap-4 border-b border-gray-200 py-2 dark:border-gray-700">
    <span className="shrink-0 font-semibold text-gray-700 dark:text-gray-300">{label}</span>
    <span className="min-w-0 break-words text-right text-gray-900 dark:text-white">{value}</span>
  </div>
);

const DetailIncidenciaModal = ({ incidencia, onClose }) => {
  if (!incidencia) return null;

  return (
    <Modal show={!!incidencia} onClose={onClose} size="md">
      <Modal.Header>Detalles de la Incidencia</Modal.Header>
      <Modal.Body>
        <div className="flex flex-col">
          <DetailRow label="Laboratorio:" value={incidencia.laboratorio?.nombre_laboratorio || "Desconocido"} />
          <DetailRow label="Fecha:" value={normalizarFecha(incidencia.fecha_asociacion)} />
          <DetailRow label="Título:" value={incidencia.incidencia} />
          <DetailRow label="Descripción:" value={incidencia.descripcion_incidencia} />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button color="gray" onClick={onClose}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DetailIncidenciaModal;
