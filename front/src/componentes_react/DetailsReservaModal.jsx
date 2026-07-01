import React, { useState } from "react";
import { Modal, Button } from "flowbite-react";
import { normalizarFecha } from "./TimeFormat/FuntionTimeFormat";
import AlertResponse from "./alert";

const DetailRow = ({ label, value }) => (
  <div className="flex justify-between gap-4 border-b border-gray-200 py-2 dark:border-gray-700">
    <span className="shrink-0 font-semibold text-gray-700 dark:text-gray-300">{label}</span>
    <span className="min-w-0 break-words text-right text-gray-900 dark:text-white">{value}</span>
  </div>
);

const DetailsReservaModal = ({ reserva, onClose, onCancelReserva, errorMensage, success }) => {
  const [isCancelling, setIsCancelling] = useState(false);

  if (!reserva) return null;

  const formatHour = (hour) => hour.split(":").slice(0, 2).join(":");

  const formatDate = (date) => {
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  };

  if (!reserva || !reserva.turno) return null;

  const handleCancelReserva = () => {
    if (window.confirm("¿Estás seguro de que deseas cancelar esta reserva?")) {
      setIsCancelling(true);
      onCancelReserva(reserva.id_turno, reserva.id_alumno);
      setIsCancelling(false);
    }
  };

  return (
    <Modal show={!!reserva} onClose={onClose} size="md">
      <Modal.Header>Detalles de la Reserva</Modal.Header>
      <Modal.Body>
        <AlertResponse mensage={errorMensage} color={"failure"} />
        <AlertResponse mensage={success} color={"success"} />
        <div className="flex flex-col">
          <DetailRow label="Laboratorio:" value={reserva.turno?.laboratorio?.nombre_laboratorio || "N/A"} />
          <DetailRow label="Fecha del Turno:" value={formatDate(reserva.turno?.fecha) || "N/A"} />
          <DetailRow label="Hora Inicio:" value={formatHour(reserva.turno?.hora_inicio) || "N/A"} />
          <DetailRow label="Hora Fin:" value={formatHour(reserva.turno?.hora_fin) || "N/A"} />
          <DetailRow label="Fecha de la Reserva:" value={normalizarFecha(reserva?.fecha_reserva) || "N/A"} />
          <DetailRow label="Estado:" value={reserva.estado || "Activo"} />
        </div>
      </Modal.Body>
      <Modal.Footer>
        {!isCancelling && (
          <Button color="failure" onClick={handleCancelReserva}>
            Cancelar Reserva
          </Button>
        )}
        {isCancelling && <p>Cancelando...</p>}
      </Modal.Footer>
    </Modal>
  );
};

export default DetailsReservaModal;
