import React, { useState } from "react";
import { Modal, Button, Label, Select, TextInput, Textarea } from "flowbite-react";
import { formatDate, formatHour, normalizarFecha } from "./TimeFormat/FuntionTimeFormat";
import { generateHourOptions } from "./TimeFormat/FuntionTimeFormat";
import AlertResponse from "./alert";
import DetailIncidenciaModal from "../componentes_react/DetailsIncidenciaLabModal";

const DetailRow = ({ label, value }) => (
  <div className="flex justify-between gap-4 border-b border-gray-200 py-2 dark:border-gray-700">
    <span className="shrink-0 font-semibold text-gray-700 dark:text-gray-300">{label}</span>
    <span className="min-w-0 break-words text-right text-gray-900 dark:text-white">{value}</span>
  </div>
);

const DetailsTurnoModal = ({ turno, onClose, onDelete, onUpdate, onReserve, id_user, rol, ErrorMensageReserva, onCreateIncidencia, success }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newFecha, setNewFecha] = useState(turno.fecha || "");
  const [newHoraInicio, setNewHoraInicio] = useState(turno.hora_inicio || "");
  const [newHoraFin, setNewHoraFin] = useState(turno.hora_fin || "");
  const [incidencia, setIncidencia] = useState("");
  const [descripcionIncidencia, setDescripcionIncidencia] = useState("");
  const [Incidencias, setIncidencias] = useState([]);
  const [selectedIncidencia, setSelectedIncidencia] = useState(null);

  if (!turno) return null;
  const handleRowClickIncidencia = (incidencia) => {
    setSelectedIncidencia(incidencia);
  };

  const closeModalRoeIncidencia = () => {
    setSelectedIncidencia(null);
  };
  const handleIncidenisTurno = async (turno) => {
    try {
      const response = await fetch(`/api/incidencia/turno/${turno.id_turno}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const ResIncidencias = await response.json();
      setIncidencias(ResIncidencias);
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
    handleIncidenisTurno(turno);
  };

  const handleIncidenciaSubmit = (e) => {
    e.preventDefault();
    if (incidencia.trim() === "") {
      alert("La incidencia no puede estar vacía.");
      return;
    }
    onCreateIncidencia(turno.id_turno, incidencia, descripcionIncidencia);
    setIncidencia("");
  };

  const handleDownloadExcel = async (id_turno) => {
    try {
      const response = await fetch(`/api/turno/exportar-alumnos/${id_turno}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
        },
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
    <Modal show={!!turno} onClose={onClose} size="xl">
      <Modal.Header>Detalles del Turno</Modal.Header>
      <Modal.Body>
        <AlertResponse mensage={ErrorMensageReserva} color={"failure"} />
        <AlertResponse mensage={success} color={"success"} />

        <div className="flex flex-col">
          {!isEditing ? (
            <>
              <DetailRow label="Laboratorio:" value={laboratorioNombre} />
              <DetailRow label="Fecha:" value={formatDate(newFecha) || formatDate(turno.fecha)} />
              <DetailRow label="Hora Inicio:" value={formatHour(newHoraInicio) || formatHour(turno.hora_inicio)} />
              <DetailRow label="Hora Fin:" value={formatHour(newHoraFin) || formatHour(turno.hora_fin)} />
              <DetailRow label="Profesor:" value={profesorNombre} />
              <DetailRow label="Capacidad Total:" value={capacidadTotal} />
              <DetailRow label="Capacidad Ocupada:" value={capacidadOcupada} />
              <DetailRow label="Estado:" value={turno.estado} />

              <h4 className="mt-4 mb-2 text-lg font-semibold text-gray-900 dark:text-white">Incidencias:</h4>
              <div className="max-h-48 overflow-y-auto">
                {Incidencias && Incidencias.length > 0 ? (
                  <ul className="flex flex-col gap-2">
                    {Incidencias.map((incidencia) => (
                      <li
                        key={incidencia.id_incidencia}
                        className="flex cursor-pointer items-center justify-between rounded-md bg-gray-100 p-2 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                        onClick={() => handleRowClickIncidencia(incidencia)}
                      >
                        <div className="flex min-w-0 flex-1 flex-col">
                          <p className="break-words font-medium text-gray-900 dark:text-white">{incidencia.incidencia}</p>
                          <span className="text-sm text-gray-500 dark:text-gray-400">{normalizarFecha(incidencia.fecha_asociacion)} </span>
                        </div>
                        {rol === 'Profesor' && turno.id_profesor === id_user && (
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
                        )}
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
                <Label htmlFor="fecha" value="Fecha:" className="mb-1 block" />
                <TextInput
                  type="date"
                  id="fecha"
                  value={newFecha}
                  onChange={(e) => setNewFecha(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="horaInicio" value="Hora Inicio:" className="mb-1 block" />
                <Select
                  id="horaInicio"
                  value={newHoraInicio.split(":")[0]}
                  onChange={(e) => setNewHoraInicio(`${e.target.value}:00`)}
                  required
                >
                  <option value="">Selecciona una hora</option>
                  {generateHourOptions(9, 21)}
                </Select>
              </div>
              <div>
                <Label htmlFor="horaFin" value="Hora Fin:" className="mb-1 block" />
                <Select
                  id="horaFin"
                  value={newHoraFin.split(":")[0]}
                  onChange={(e) => setNewHoraFin(`${e.target.value}:00`)}
                  required
                >
                  <option value="">Selecciona una hora</option>
                  {newHoraInicio
                    ? generateHourOptions(9, 21, parseInt(newHoraInicio.split(":")[0]))
                    : generateHourOptions(9, 21)}
                </Select>
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
        {isOwner && !isEditing && (
          <>
            <Button color="warning" onClick={() => setIsEditing(true)}>
              Editar
            </Button>
            <Button color="failure" onClick={handleDelete}>
              Eliminar
            </Button>
            <Button color="blue" onClick={() => handleDownloadExcel(turno.id_turno)}>
              Descargar Lista de Alumnos
            </Button>
          </>
        )}
        {isEditing && (
          <>
            <Button color="success" onClick={handleUpdate}>
              Guardar Cambios
            </Button>
            <Button color="gray" onClick={() => setIsEditing(false)}>
              Cancelar
            </Button>
          </>
        )}
        {canReserve && (
          <Button color="success" onClick={handleReserve}>
            Reservar
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default DetailsTurnoModal;
