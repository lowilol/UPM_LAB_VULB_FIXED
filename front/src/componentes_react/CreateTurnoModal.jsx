import React, { useState, useEffect } from "react";
import { Modal, Button, Label, Select, TextInput } from "flowbite-react";

import AlertResponse from "./alert";
const CreateTurnoModal = ({ showModalCreateTurno, onClose }) => {
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
      fetch("/api/laboratorio")
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
    const userData = JSON.parse(sessionStorage.getItem("user"));
    const idUser = userData?.id_user || null;

    if (!laboratorio || !fecha || !horaInicio || !horaFin || !idUser) {
      setError("Por favor, completa todos los campos");
      return;
    }

    try {
      const response = await fetch("/api/turno", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        setSuccess(Data.message);
      } else {
        setSuccess("");
        setError(Data.error || "Error al crear el turno");
      }
    } catch (err) {
      setError("Error de conexión al crear el turno");
    }
  };

  return (
    <Modal show={showModalCreateTurno} onClose={onClose} size="md" popup>
      <Modal.Header />
      <Modal.Body>
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">Crear Turno</h3>

          <AlertResponse mensage={success} color={"success"} />
          <AlertResponse mensage={error} color={"failure"} />

          <div>
            <Label htmlFor="laboratorio" value="Laboratorio" className="mb-1 block" />
            <Select
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
            </Select>
          </div>
          <div>
            <Label htmlFor="fecha" value="Fecha" className="mb-1 block" />
            <TextInput
              type="date"
              id="fecha"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="horaInicio" value="Hora de Inicio" className="mb-1 block" />
            <Select
              id="horaInicio"
              value={horaInicio.split(":")[0]}
              onChange={(e) => setHoraInicio(`${e.target.value}:00`)}
              required
            >
              <option value="">Selecciona una hora</option>
              {generateHourOptions(9, 21)}
            </Select>
          </div>

          <div>
            <Label htmlFor="horaFin" value="Hora de Fin" className="mb-1 block" />
            <Select
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
            </Select>
          </div>
          <Button type="submit" className="w-full">
            Crear Turno
          </Button>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default CreateTurnoModal;
