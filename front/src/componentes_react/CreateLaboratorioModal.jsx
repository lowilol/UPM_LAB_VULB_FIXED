import React, { useState } from "react";
import '../styles/ModalStyle.css';
import AlertResponse from "./alert";

const CrearLaboratorioModal = ({ showModalCreateLab, onClose }) => {
  const [nombre, setNombre] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [capacidad, setCapacidad] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

   
    if (!nombre || !ubicacion || !capacidad) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    try {
      const response = await fetch("/api/laboratorio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({
          nombre_laboratorio: nombre,
          ubicacion: ubicacion,
          capacidad: parseInt(capacidad, 10),
        }),
      });

      if (response.ok) {
        setSuccessMessage("Laboratorio creado exitosamente.");
        setNombre("");
        setUbicacion("");
        setCapacidad("");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Error al crear el laboratorio.");
      }
    } catch (err) {
      setError("Error de conexión al servidor.");
    }
  };

  if (!showModalCreateLab) {
    return null; // No renderiza el modal si no está activo
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target.classList.contains("modal-overlay") && onClose()}>
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <h3>Dar de Alta Laboratorio</h3>
        <div>
              <AlertResponse  mensage={successMessage} color={"success"}/>
              </div>
              <div>
              <AlertResponse  mensage={error}  color={"failure"} />
              </div>


        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="nombre">Nombre del Laboratorio</label>
            <input
              type="text"
              id="nombre"
              maxLength={4}
              onKeyDown={(e) => {
                    if (!/^\d$/.test(e.key) && e.key !== 'Backspace') {
                      e.preventDefault();
                    }
                    
                  }}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="ubicacion">Ubicación</label>
            <input
              type="text"
              id="ubicacion"
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="capacidad">Capacidad</label>
            <input
              type="number"
              id="capacidad"
              value={capacidad}
              onChange={(e) => setCapacidad(e.target.value)}
              required
              min="1"
            />

          </div>
          <button type="submit" className="modal-submit">Crear Laboratorio</button>
        </form>
      </div>
    </div>
  );
};

export default CrearLaboratorioModal;
