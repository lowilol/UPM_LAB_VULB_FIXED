import React, { useState , useEffect } from "react";
import "../styles/ModalStyle.css";
import AlertResponse from "./alert";
import DetailIncidenciaModal from "../componentes_react/DetailsIncidenciaLabModal";
import { normalizarFecha } from "./TimeFormat/FuntionTimeFormat";

const DetailsLabModel = ({ laboratorio,id_user, onClose, onDelete, onUpdate,errorMensage, onCreateIncidencia, Incidencias,success }) => {
   const [isEditing, setIsEditing] = useState(false);
   const [newCapacidad, setNewCapacidad] = useState(laboratorio.capacidad || "");
   const [incidencia, setIncidencia] = useState("");
   const [descripcionIncidencia, setDescripcionIncidencia] = useState("");
   const [labState, setLabState] = useState(laboratorio);
   const [IncidenciasActual, setIncidenciasActual] = useState([]);
   const [selectedIncidencia, setSelectedIncidencia] = useState(null);
   const handleRowClickIncidencia= (incidencia) => {
      setSelectedIncidencia(incidencia); 
      
   };
   console.log(laboratorio)
   
   const closeModalRoeIncidencia= () => {
      setSelectedIncidencia(null)
      setErrorMensageIncidencia("") 
    };

   useEffect(() => {
      if (laboratorio && laboratorio.id_laboratorio) {
         setIncidenciasActual(Incidencias); 
      }
   }, [Incidencias, laboratorio]); 


   const handleToggleLaboratorio = async () => {
      const action = laboratorio.deshabilitado ? "habilitar" : "deshabilitar";
      const confirmMessage = laboratorio.deshabilitado
        ? "¿Estás seguro de que deseas habilitar este laboratorio?"
        : "¿Estás seguro de que deseas deshabilitar este laboratorio? Se eliminará en una semana.";
      
      if (window.confirm(confirmMessage)) {
        try {
          const response = await fetch(`/api/laboratorio/${action}/${laboratorio.id_laboratorio}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: 'include',
            body: JSON.stringify({ id_user }),
          });
    
          if (response.ok) {
            const result = await response.json();
            alert(result.message);
    
            setLabState((prev) => ({
               ...prev,
               deshabilitado: action === "deshabilitar",
             }));
     
            laboratorio.deshabilitado = action === "deshabilitar";
            setIsEditing(false);
          } else {
            const errorData = await response.json();
            console.error(`Error al ${action} el laboratorio:`, errorData.error);
            alert(`Error al ${action} el laboratorio: ${errorData.error}`);
          }
        } catch (error) {
          console.error(`Error al ${action} el laboratorio:`, error);
        }
      }
    };


  

  
    
   if (!laboratorio) return null;



   const handleDeleteIncidencia = async (id_incidencia) => {
      if (window.confirm("¿Estás seguro de que deseas eliminar esta incidencia?")) {
        try {
          const response = await fetch(`/api/incidencia/laboratorio/${id_incidencia}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: 'include'
          });
    
          if (response.ok) {
            
            setIncidenciasActual((prevIncidencias) => 
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

   const handleDelete = () => {
      if (window.confirm("¿Estás seguro de que deseas eliminar este laboratorio?")) {
         onDelete(laboratorio.id_laboratorio); // Llama a la función de eliminación
      }
   };

   const handleUpdate = () => {
      
    console.log(laboratorio)
    onUpdate(laboratorio.id_laboratorio,newCapacidad );
    setIsEditing(false); 
    handleIncidenislaboratorio(laboratorio)
 };


 const handleIncidenciaSubmit = (e) => {
   e.preventDefault();
   if (incidencia.trim() === "") {
     alert("La incidencia no puede estar vacía.");
     return;
   }
   onCreateIncidencia(laboratorio.id_laboratorio, incidencia,descripcionIncidencia ,id_user);
   setIncidencia(""); 
 };

 ;

   return (
      <div className="laboratorio-modal-overlay" onClick={onClose}>
         
         <div className="laboratorio-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="laboratorio-modal-close" onClick={onClose}>
               &times;
            </button>
            <h3>Detalles del Laboratorio</h3>
            <AlertResponse mensage={errorMensage} color={"failure"}/>
            <AlertResponse mensage={success} color={"success"}/>
            
            <div className="laboratorio-details">
               {!isEditing ? (
                  <>
                     <div className="detail-row">
                        <span className="detail-label">Nombre:</span>
                        <span className="detail-value">{laboratorio.nombre_laboratorio || "N/A"}</span>
                     </div>
                     <div className="detail-row">
                        <span className="detail-label">Ubicación:</span>
                        <span className="detail-value">{laboratorio.ubicacion || "N/A"}</span>
                     </div>
                     <div className="detail-row">
                        <span className="detail-label">Capacidad:</span>
                        <span className="detail-value">{laboratorio.capacidad || "N/A"}</span>
                     </div>
                     <div className="detail-row">
                        <span className="detail-label">Capacidad Ocupada:</span>
                        <span className="detail-value">{laboratorio.capacidad_ocupada || "0"}</span>
                     </div>

                     <div className="detail-row">
                        <span className="detail-label">Estado:</span>
                        <span className={`detail-value ${labState?.deshabilitado === false ? "habilitado" : "deshabilitado"}`}>
                           {labState?.deshabilitado === false ? "Habilitado" : "Deshabilitado"}
                        </span>
                     </div>

                     <h4>Incidencias:</h4>
                     <div className="incidencias-container">
                        {Incidencias && Incidencias.length > 0 ? (
                           <ul className="incidencias-list">
                              {IncidenciasActual.map((incidencia) => (
                                 <li key={incidencia.id_incidencia} className="incidencia-item"  onClick={() => handleRowClickIncidencia(incidencia)}>
                                    <div className="incidencia-content">
                                       <p className="incidencia-text">{incidencia.incidencia}</p>
                                       <span className="incidencia-date">{normalizarFecha(incidencia.fecha_asociacion)} </span>
                                    </div>
                                    <button
                                       className="delete-incidencia-button"
                                       onClick={() => handleDeleteIncidencia(incidencia.id_incidencia)}
                                    >
                                       &times;
                                    </button>
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
                        <label className="detail-label" htmlFor="capacidad">
                           Capacidad:
                        </label>
                        <input
                           type="number"
                           id="capacidad"
                           value={newCapacidad}
                           onChange={(e) => setNewCapacidad(e.target.value)}
                           min="1"
                        />
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
            

            <div className="laboratorio-actions">
               {!isEditing ? (
                  <>
                     <button className="btn-edit" onClick={() => setIsEditing(true)}>
                        Editar
                     </button>
                     <button className="btn-delete" onClick={handleDelete}>
                        Eliminar
                     </button>
                     <button
                        className={labState.deshabilitado ? "btn-enable" : "btn-disable"}
                        onClick={handleToggleLaboratorio}
                     >
                        {labState.deshabilitado ? "Habilitar" : "Deshabilitar"}
                     </button>
                  </>
               ) : (
                  <>
                     <button className="btn-save" onClick={handleUpdate}>
                        Guardar Cambios
                     </button>
                     <button className="btn-cancel" onClick={() => setIsEditing(false)}>
                        Cancelar
                     </button>
                  </>
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

export default DetailsLabModel;
