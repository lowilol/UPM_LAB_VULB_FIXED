import React, { useState, useEffect } from "react";
import '../styles/ModalStyle.css';
import AlertResponse from "./alert";
import { useAuth } from "../auth/AuthProvider";

const CreateTurnoModal = ({ showModalCreateTurno, onClose }) => {
  const { getUser } = useAuth();
  const [laboratorios, setLaboratorios] = useState([]);
  const [laboratorio, setLaboratorio] = useState("");
  const [fecha, setFecha] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Obtener laboratorios disponibles desde el backend
  useEffect(() => {
    if (showModalCreateTurno) {
      fetch("/api/laboratorio", {
        headers: {},
        credentials: 'include',
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && Array.isArray(data)) {
            const laboratoriosHabilitados = data.filter(lab => !lab.deshabilitado);
          setLaboratorios(laboratoriosHabilitados);
          } else {
            setError("Error al cargar laboratorios");
          }
        })
        .catch(() => setError("Error de conexión con el servidor"));



    }
  }, [showModalCreateTurno]);

  if (!showModalCreateTurno) {
    return null;
  }

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      onClose();
    }
  };
  const generateHourOptions = (start, end, filterAfter = null) => {
    const options = [];
    for (let hour = start; hour <= end; hour++) {
      if (filterAfter !== null && hour <= filterAfter) continue; // Filtrar horas menores o iguales a filterAfter
      const hourString = hour < 10 ? `0${hour}` : `${hour}`; // Formato HH
      options.push(
        <option key={hour} value={`${hourString}`}>
          {hourString}:00
        </option>
      );
    }
    return options;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const userData = getUser() || JSON.parse(sessionStorage.getItem("user") || "null");
    const idUser = userData?.id_user || null;

    if (!laboratorio || !fecha || !horaInicio || !horaFin || !idUser) {
      setError("Por favor, completa todos los campos");
      return;
    }

    try {
      const response = await fetch("/api/turno", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({
          id_laboratorio: laboratorio,
          id_user: idUser,
          fecha,
          hora_inicio: horaInicio,
          hora_fin: horaFin,
          
        }),
      });
      const Data = await response.json();

      if (response.ok) {
        setError("");
        setSuccess(Data.message)
        
      } else {
        setSuccess("")
        setError(Data.error || "Error al crear el turno");
      }
    } catch (err) {
      setError("Error de conexión al crear el turno");
    }
  };

  return (
    showModalCreateTurno && (
      <div className="modal-overlay"
        onClick={handleOverlayClick}>
        <div className="modal-content">
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
          <h3>Crear Turno</h3>
          <div>
              <AlertResponse  mensage={success} color={"success"}/>
              </div>
              <div>
              <AlertResponse  mensage={error}  color={"failure"} />
              </div>
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="laboratorio">Laboratorio</label>
              <select
                id="laboratorio"
                value={laboratorio}
                onChange={(e) => setLaboratorio(e.target.value)}
                required
              >
                <option value="">Selecciona un laboratorio</option>
                {laboratorios.map((lab) => (
                  <option key={lab.id_laboratorio} value={lab.id_laboratorio}>
                    {lab.nombre_laboratorio}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="fecha">Fecha</label>
              <input
                type="date"
                id="fecha"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="horaInicio">Hora de Inicio</label>
              <select
                id="horaInicio"
                value={horaInicio.split(":")[0]}
                onChange={(e) => setHoraInicio(`${e.target.value}:00`)}
                required
              >
                <option value="">Selecciona una hora</option>
                {generateHourOptions(9, 21)} 
              </select>
            </div>

            <div>
              <label htmlFor="horaFin">Hora de Fin</label>
              <select
                id="horaFin"
                value={horaFin.split(":")[0]}
                onChange={(e) => setHoraFin(`${e.target.value}:00`)}
                required
                disabled={!horaInicio}
              >
                <option value="">Selecciona una hora</option>
                {horaInicio
                  ? generateHourOptions(9, 21, parseInt(horaInicio.split(":")[0]))

                  : generateHourOptions(9, 21)}
              </select>
            </div>
            <button type="submit" className="modal-submit">Crear Turno</button>
          </form>
        </div>
      </div>
    )
  );
};

export default CreateTurnoModal;
