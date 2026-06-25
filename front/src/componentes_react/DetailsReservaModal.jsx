import React, { useState } from "react";
import "../styles/ModalStyle.css";
import  {normalizarFecha}  from "./TimeFormat/FuntionTimeFormat";
import AlertResponse  from "./alert"
const DetailsReservaModal = ({ reserva, onClose, onCancelReserva,errorMensage,success }) => {
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
      onCancelReserva( reserva.id_turno,reserva.id_alumno);
      setIsCancelling(false);
    }
  };


 

  
  


  return (
    <div className="turno-modal-overlay" onClick={onClose}>
      
      <div className="turno-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="turno-modal-close" onClick={onClose}>
          &times;
        </button>
        <h3>Detalles de la Reserva</h3>
         <AlertResponse mensage={errorMensage}  color={"failure"}/>
         <AlertResponse mensage={success} color={"success"}/>
        <div className="turno-details">
          <div className="detail-row">
            <span className="detail-label">Laboratorio:</span>
            <span className="detail-value">{reserva.turno?.laboratorio?.nombre_laboratorio || "N/A"}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Fecha del Turno:</span>
            <span className="detail-value">{formatDate(reserva.turno?.fecha) || "N/A"}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Hora Inicio:</span>
            <span className="detail-value">{formatHour(reserva.turno?.hora_inicio) || "N/A"}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Hora Fin:</span>
            <span className="detail-value">{formatHour(reserva.turno?.hora_fin) || "N/A"}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Fecha de la Reserva:</span>
            <span className="detail-value">{normalizarFecha(reserva?.fecha_reserva) || "N/A"}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Estado:</span>
            <span className="detail-value">{reserva.estado || "Activo"}</span>
          </div>
        </div>

        <div className="turno-actions">
          {!isCancelling && (
            <button className="btn-delete" onClick={handleCancelReserva}>
              Cancelar Reserva
            </button>
          )}
          {isCancelling && <p>Cancelando...</p>}
        </div>
      </div>
    </div>
  );
};

export default DetailsReservaModal;