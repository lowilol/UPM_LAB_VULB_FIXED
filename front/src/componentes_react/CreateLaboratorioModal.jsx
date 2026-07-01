import React, { useState } from "react";
import { Modal, Button, Label, TextInput } from "flowbite-react";

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
        headers: { "Content-Type": "application/json" },
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

  return (
    <Modal show={showModalCreateLab} onClose={onClose} size="md" popup>
      <Modal.Header />
      <Modal.Body>
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">
            Dar de Alta Laboratorio
          </h3>

          <AlertResponse mensage={successMessage} color={"success"} />
          <AlertResponse mensage={error} color={"failure"} />

          <div>
            <Label htmlFor="nombre" value="Nombre del Laboratorio" className="mb-1 block" />
            <TextInput
              type="text"
              id="nombre"
              maxLength={4}
              onKeyDown={(e) => {
                if (!/^\d$/.test(e.key) && e.key !== "Backspace") {
                  e.preventDefault();
                }
              }}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="ubicacion" value="Ubicación" className="mb-1 block" />
            <TextInput
              type="text"
              id="ubicacion"
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
              required
              maxLength={100}
            />
          </div>
          <div>
            <Label htmlFor="capacidad" value="Capacidad" className="mb-1 block" />
            <TextInput
              type="number"
              id="capacidad"
              value={capacidad}
              onChange={(e) => setCapacidad(e.target.value)}
              required
              min="1"
            />
          </div>
          <Button type="submit" className="w-full">
            Crear Laboratorio
          </Button>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default CrearLaboratorioModal;
