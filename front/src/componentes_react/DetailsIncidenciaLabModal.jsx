import React from "react";
import "../styles/ModalStyle.css";
import { normalizarFecha } from "./TimeFormat/FuntionTimeFormat";

const DetailIncidenciaModal = ({ incidencia, onClose }) => {
   if (!incidencia) return null;

   return (
      <div className="modal-overlay" onClick={onClose}>
         <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={onClose}>
               &times;
            </button>
            <h3>Detalles de la Incidencia</h3>

            <div className="incidencia-details">
               <div className="detail-row">
                  <span className="detail-label">Laboratorio:</span>
                  <span className="detail-value">{incidencia.laboratorio?.nombre_laboratorio  || "Desconocido"}</span>
               </div>
               <div className="detail-row">
                  <span className="detail-label">Fecha:</span>
                  <span className="detail-value">{normalizarFecha(incidencia.fecha_asociacion)}</span>
               </div>
               <div className="detail-row">
                  <span className="detail-label">Título:</span>
                  <span className="detail-value">{incidencia.incidencia}</span>
               </div>
               <div className="detail-row">
                  <span className="detail-label">Descripción:</span>
                  <span className="detail-value descripcion">{incidencia.descripcion_incidencia}</span>
               </div>
            </div>

            <div className="modal-actions">
               <button className="btn-close" onClick={onClose}>
                  Cerrar
               </button>
            </div>
         </div>
      </div>
   );
};

export default DetailIncidenciaModal;
