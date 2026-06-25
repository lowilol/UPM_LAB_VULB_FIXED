import React, { useState } from "react";
import "../styles/ModalStyle.css";
import { formatDate, formatHour, normalizarFecha } from "./TimeFormat/FuntionTimeFormat";
import { generateHourOptions } from "./TimeFormat/FuntionTimeFormat";
import AlertResponse from "./alert";
import DetailIncidenciaModal from "../componentes_react/DetailsIncidenciaLabModal";

const DetailsTurnoModal = ({ turno, onClose, onDelete, onUpdate, onReserve, id_user, rol,ErrorMensageReserva,onCreateIncidencia,success }) => {
   const [isEditing, setIsEditing] = useState(false);
   const [newFecha, setNewFecha] = useState(turno.fecha || "");
   const [newHoraInicio, setNewHoraInicio] = useState(turno.hora_inicio || "");
   const [newHoraFin, setNewHoraFin] = useState(turno.hora_fin || "");
  const [incidencia, setIncidencia] = useState("");
  const [descripcionIncidencia, setDescripcionIncidencia] = useState("");
const [Incidencias, setIncidencias] = useState([]);
const [selectedIncidencia, setSelectedIncidencia] = useState(null);



if (!turno) return null;
const handleRowClickIncidencia= (incidencia) => {
   setSelectedIncidencia(incidencia); 
   
};


const closeModalRoeIncidencia= () => {
   setSelectedIncidencia(null)
   setErrorMensageIncidencia("") 
 };
  const handleIncidenisTurno =  async (turno) => {
   
   try {
       const response = await fetch(`/api/incidencia/turno/${turno.id_turno}`, {
         method: 'GET',
         headers: {
            'Content-Type': 'application/json',
         },
         credentials: 'include',
      });
       const ResIncidencias = await response.json();
       setIncidencias( ResIncidencias );
       console.log(Incidencias)
       setIncidencia(""); 
     
       
   } catch (err) {
       console.error('Error al obtener incidencias:', err);
   }
};
React.useEffect(() => {
   if (turno && turno.id_turno) {
      handleIncidenisTurno(turno);
   }
}, [turno]);

  

   
   const handleDeleteIncidencia = async (id_incidencia) => {
      if (window.confirm("¿Estás seguro de que deseas eliminar esta incidencia?")) {
        try {
          const response = await fetch(`/api/incidencia/turno/${id_incidencia}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: 'include',
          });
    
          if (response.ok) {
            
            setIncidencias((prevIncidencias) => 
              prevIncidencias.filter((incidencia) => incidencia.id_incidencia !== id_incidencia)
            );
            
            
          } else {
            console.error("Error al eliminar la incidencia.");
          }
        } catch (error) {
          console.error("Error al eliminar la incidencia:", error);
        }
      }
    };
   

   const laboratorioNombre = turno?.laboratorio?.nombre_laboratorio || "N/A";
   const capacidadTotal = turno?.laboratorio?.capacidad || "N/A";
   const capacidadOcupada = turno.capacidad_ocupada;
   const profesorNombre = turno?.profesor
      ? `${turno?.profesor?.usuario?.FirstName} ${turno?.profesor?.usuario?.LastName}`
      : "Desconocido";

   const isOwner = rol === "Profesor" && turno.id_profesor === id_user;
   const canReserve = rol === "Alumno" && capacidadOcupada < capacidadTotal;

   const handleDelete = () => {
      if (window.confirm("¿Estás seguro de que deseas eliminar este turno?")) {
         onDelete(turno.id_turno);
      }
   };

   const handleReserve = () => {
      onReserve(turno.id_turno);
      

   };

   

   const handleUpdate = () => {
      onUpdate(turno.id_turno, {
         fecha: newFecha,
         hora_inicio: newHoraInicio,
         hora_fin: newHoraFin,
      });
      setIsEditing(false);
      handleIncidenisTurno(turno)
   };


   const handleIncidenciaSubmit = (e) => {
      e.preventDefault();
      if (incidencia.trim() === "") {
        alert("La incidencia no puede estar vacía.");
        return;
      }
      onCreateIncidencia(turno.id_turno, incidencia,descripcionIncidencia);
      setIncidencia(""); 
    };


    const handleDownloadExcel = async (id_turno) => {
      try {
        const response = await fetch(`/api/turno/exportar-alumnos/${id_turno}`, {
          method: "GET",
          headers: {},
          credentials: 'include',
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          alert(`Error: ${errorData.error}`);
          return;
        }
  
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Lista_Alumnos_Turno_${id_turno}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        console.error("Error al descargar el archivo:", error);
      }
    };
   

   return (
      <div className="turno-modal-overlay" onClick={onClose }>
         
         <div className="turno-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="turno-modal-close" onClick={onClose}>
               &times;
            </button>
            <h3>Detalles del Turno</h3>
            <div><AlertResponse mensage={ErrorMensageReserva} color={"failure"}/></div>
            <div><AlertResponse mensage={success} color={"success"}/></div>
            
            <div className="turno-details">
               {!isEditing ? (
                  <>
                     <div className="detail-row">
                        <span className="detail-label">Laboratorio:</span>
                        <span className="detail-value">{laboratorioNombre}</span>
                     </div>
                     <div className="detail-row">
                        <span className="detail-label">Fecha:</span>
                        <span className="detail-value">{formatDate(newFecha) || formatDate(turno.fecha)}</span>
                     </div>
                     <div className="detail-row">
                        <span className="detail-label">Hora Inicio:</span>
                        <span className="detail-value">{formatHour(newHoraInicio) || formatHour(turno.hora_inicio)}</span>
                     </div>
                     <div className="detail-row">
                        <span className="detail-label">Hora Fin:</span>
                        <span className="detail-value">{formatHour(newHoraFin) || formatHour(turno.hora_fin)}</span>
                     </div>
                     <div className="detail-row">
                        <span className="detail-label">Profesor:</span>
                        <span className="detail-value">{profesorNombre}</span>
                     </div>
                     <div className="detail-row">
                        <span className="detail-label">Capacidad Total:</span>
                        <span className="detail-value">{capacidadTotal}</span>
                     </div>
                     <div className="detail-row">
                        <span className="detail-label">Capacidad Ocupada:</span>
                        <span className="detail-value">{capacidadOcupada}</span>
                     </div>

                     <div className="detail-row">
                        <span className="detail-label">Estado:</span>
                        <span className="detail-value">{turno.estado}</span>
                     </div>
                     
                     <h4>Incidencias:</h4>
                     <div className="incidencias-container">
                        {Incidencias && Incidencias.length > 0 ? (
                           <ul className="incidencias-list">
                              {Incidencias.map((incidencia) => (
                                 <li key={incidencia.id_incidencia} className="incidencia-item"  onClick={() => handleRowClickIncidencia(incidencia)}>
                                    <div className="incidencia-content">
                                       <p className="incidencia-text">{incidencia.incidencia}</p>
                                       <span className="incidencia-date">{normalizarFecha(incidencia.fecha_asociacion)} </span>
                                    </div>
                                    {rol === 'Profesor' && turno.id_profesor === id_user && (
                                       <button
                                          className="delete-incidencia-button"
                                          onClick={() => handleDeleteIncidencia(incidencia.id_incidencia)}
                                       >
                                          &times;
                                       </button>
                                    )}
                                 </li>
                              ))}
                           </ul>
                        ) : (
                           <p>No hay incidencias para este turno.</p>
                        )}
                     </div>


                  </>
               ) : (
                  <>
                     <div className="detail-row">
                        <label className="detail-label" htmlFor="fecha">
                           Fecha:
                        </label>
                        <input
                           type="date"
                           id="fecha"
                           value={newFecha}
                           onChange={(e) => setNewFecha(e.target.value)}
                        />
                     </div>
                     <div className="detail-row">
                        <label className="detail-label" htmlFor="horaInicio">
                           Hora Inicio:
                        </label>
                        <select
                           id="horaInicio"
                           value={newHoraInicio.split(":")[0]}
                           onChange={(e) => setNewHoraInicio(`${e.target.value}:00`)}
                           required
                        >
                           <option value="">Selecciona una hora</option>
                           {generateHourOptions(9, 21)}
                        </select>
                     </div>
                     <div className="detail-row">
                        <label className="detail-label" htmlFor="horaFin">
                           Hora Fin:
                        </label>
                        <select
                           id="horaFin"
                           value={newHoraFin.split(":")[0]}
                           onChange={(e) => setNewHoraFin(`${e.target.value}:00`)}
                           required
                        >
                           <option value="">Selecciona una hora</option>
                           {newHoraInicio
                              ? generateHourOptions(9, 21, parseInt(newHoraInicio.split(":")[0]))
                              : generateHourOptions(9, 21)}
                        </select>
                        
                     </div>
                     <form className="incidencia-form" onSubmit={handleIncidenciaSubmit}>
                           <label htmlFor="titulo_incidencia">Título de la Incidencia:</label>
                           <input
                              type="text"
                              id="titulo_incidencia"
                              value={incidencia}
                              onChange={(e) => setIncidencia(e.target.value)}
                              placeholder="Ej: Problema con el proyector"
                              required
                              maxLength={50} 
                           />

                           <label htmlFor="descripcion_incidencia">Descripción:</label>
                           <textarea
                              id="descripcion_incidencia"
                              value={descripcionIncidencia}
                              onChange={(e) => setDescripcionIncidencia(e.target.value)}
                              placeholder="Explica más detalles sobre la incidencia..."
                              required
                              maxLength={255} 
                           />

                           <button type="submit" className="btn-save">Registrar Incidencia</button>
                        </form>
                  </>
               )}
            </div>

            <div className="turno-actions">
               {isOwner && !isEditing && (
                  <>
                     <button className="btn-edit" onClick={() => setIsEditing(true)}>
                        Editar
                     </button>
                     <button className="btn-delete" onClick={handleDelete}>
                        Eliminar
                     </button>

                     <button onClick={() => handleDownloadExcel(turno.id_turno)} className="btn-download">
                        Descargar Lista de Alumnos
                     </button>

                  </>

               )}
               {isEditing && (
                  <>
                     <button className="btn-save" onClick={handleUpdate}>
                        Guardar Cambios
                     </button>
                     <button className="btn-cancel" onClick={() => setIsEditing(false) }>
                        Cancelar
                     </button>
                  </>
               )}
               {canReserve && (
                  <button className="btn-reserve" onClick={handleReserve}>
                     Reservar
                  </button>
               )}
            </div>
         </div>


         {selectedIncidencia && (
            <DetailIncidenciaModal
               incidencia={selectedIncidencia}
               onClose={closeModalRoeIncidencia}
            />
         )}
      </div>
   );
};

export default DetailsTurnoModal;
