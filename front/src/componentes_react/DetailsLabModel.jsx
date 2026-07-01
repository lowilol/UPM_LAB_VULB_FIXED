import React, { useState, useEffect } from "react";
import { Modal, Button, Label, TextInput, Textarea } from "flowbite-react";
import AlertResponse from "./alert";
import DetailIncidenciaModal from "../componentes_react/DetailsIncidenciaLabModal";
import { normalizarFecha } from "./TimeFormat/FuntionTimeFormat";

const DetailRow = ({ label, value, valueClassName = "" }) => (
  <div className="flex justify-between gap-4 border-b border-gray-200 py-2 dark:border-gray-700">
    <span className="shrink-0 font-semibold text-gray-700 dark:text-gray-300">{label}</span>
    <span className={`min-w-0 break-words text-right text-gray-900 dark:text-white ${valueClassName}`}>{value}</span>
  </div>
);

const DetailsLabModel = ({ laboratorio, id_user, onClose, onDelete, onUpdate, errorMensage, onCreateIncidencia, Incidencias, success }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newCapacidad, setNewCapacidad] = useState(laboratorio.capacidad || "");
  const [incidencia, setIncidencia] = useState("");
  const [descripcionIncidencia, setDescripcionIncidencia] = useState("");
  const [labState, setLabState] = useState(laboratorio);
  const [IncidenciasActual, setIncidenciasActual] = useState([]);
  const [selectedIncidencia, setSelectedIncidencia] = useState(null);
  const handleRowClickIncidencia = (incidencia) => {
    setSelectedIncidencia(incidencia);
  };

  const closeModalRoeIncidencia = () => {
    setSelectedIncidencia(null);
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
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
          }
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
    onUpdate(laboratorio.id_laboratorio, newCapacidad);
    setIsEditing(false);
  };

  const handleIncidenciaSubmit = (e) => {
    e.preventDefault();
    if (incidencia.trim() === "") {
      alert("La incidencia no puede estar vacía.");
      return;
    }
    onCreateIncidencia(laboratorio.id_laboratorio, incidencia, descripcionIncidencia, id_user);
    setIncidencia("");
  };

  return (
    <Modal show={!!laboratorio} onClose={onClose} size="xl">
      <Modal.Header>Detalles del Laboratorio</Modal.Header>
      <Modal.Body>
        <AlertResponse mensage={errorMensage} color={"failure"} />
        <AlertResponse mensage={success} color={"success"} />

        <div className="flex flex-col">
          {!isEditing ? (
            <>
              <DetailRow label="Nombre:" value={laboratorio.nombre_laboratorio || "N/A"} />
              <DetailRow label="Ubicación:" value={laboratorio.ubicacion || "N/A"} />
              <DetailRow label="Capacidad:" value={laboratorio.capacidad || "N/A"} />
              <DetailRow label="Capacidad Ocupada:" value={laboratorio.capacidad_ocupada || "0"} />
              <DetailRow
                label="Estado:"
                value={labState?.deshabilitado === false ? "Habilitado" : "Deshabilitado"}
                valueClassName={labState?.deshabilitado === false ? "text-green-600" : "text-red-600"}
              />

              <h4 className="mt-4 mb-2 text-lg font-semibold text-gray-900 dark:text-white">Incidencias:</h4>
              <div className="max-h-48 overflow-y-auto">
                {Incidencias && Incidencias.length > 0 ? (
                  <ul className="flex flex-col gap-2">
                    {IncidenciasActual.map((incidencia) => (
                      <li
                        key={incidencia.id_incidencia}
                        className="flex cursor-pointer items-center justify-between rounded-md bg-gray-100 p-2 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                        onClick={() => handleRowClickIncidencia(incidencia)}
                      >
                        <div className="flex min-w-0 flex-1 flex-col">
                          <p className="break-words font-medium text-gray-900 dark:text-white">{incidencia.incidencia}</p>
                          <span className="text-sm text-gray-500 dark:text-gray-400">{normalizarFecha(incidencia.fecha_asociacion)} </span>
                        </div>
                        <button
                          type="button"
                          className="ml-2 shrink-0 text-red-600 hover:text-red-800"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteIncidencia(incidencia.id_incidencia);
                          }}
                        >
                          &times;
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No hay incidencias para este turno.</p>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-4">
              <div>
                <Label htmlFor="capacidad" value="Capacidad:" className="mb-1 block" />
                <TextInput
                  type="number"
                  id="capacidad"
                  value={newCapacidad}
                  onChange={(e) => setNewCapacidad(e.target.value)}
                  min="1"
                />
              </div>
              <form className="flex flex-col gap-2" onSubmit={handleIncidenciaSubmit}>
                <Label htmlFor="titulo_incidencia" value="Título de la Incidencia:" />
                <TextInput
                  type="text"
                  id="titulo_incidencia"
                  value={incidencia}
                  onChange={(e) => setIncidencia(e.target.value)}
                  placeholder="Ej: Problema con el proyector"
                  required
                  maxLength={50}
                />

                <Label htmlFor="descripcion_incidencia" value="Descripción:" />
                <Textarea
                  id="descripcion_incidencia"
                  value={descripcionIncidencia}
                  onChange={(e) => setDescripcionIncidencia(e.target.value)}
                  placeholder="Explica más detalles sobre la incidencia..."
                  required
                  maxLength={255}
                  rows={3}
                />

                <Button type="submit" color="success" className="mt-2">Registrar Incidencia</Button>
              </form>
            </div>
          )}
        </div>

        {selectedIncidencia && (
          <DetailIncidenciaModal
            incidencia={selectedIncidencia}
            onClose={closeModalRoeIncidencia}
          />
        )}
      </Modal.Body>
      <Modal.Footer>
        {!isEditing ? (
          <>
            <Button color="warning" onClick={() => setIsEditing(true)}>
              Editar
            </Button>
            <Button color="failure" onClick={handleDelete}>
              Eliminar
            </Button>
            <Button color={labState.deshabilitado ? "success" : "gray"} onClick={handleToggleLaboratorio}>
              {labState.deshabilitado ? "Habilitar" : "Deshabilitar"}
            </Button>
          </>
        ) : (
          <>
            <Button color="success" onClick={handleUpdate}>
              Guardar Cambios
            </Button>
            <Button color="gray" onClick={() => setIsEditing(false)}>
              Cancelar
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default DetailsLabModel;
