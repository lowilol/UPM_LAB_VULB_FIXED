import { useState } from "react";
import { Card, Label, TextInput, Button } from "flowbite-react";

const Perfil = ({ usuario, onUpdate }) => {
  // Hooks SIEMPRE primero, sin condiciones (reglas de hooks de React)
  const initialData = usuario?.specificData ? usuario.specificData.toString() : "";
  const [matricula, setMatricula] = useState(initialData);
  const [departamento, setDepartamento] = useState(initialData);

  // Guarda: si aún no hay datos del usuario, mostramos un placeholder
  if (!usuario || usuario.id_user === undefined) {
    return (
      <Card className="max-w-md mx-auto">
        <p className="text-center text-gray-500 dark:text-gray-400">
          Cargando información del perfil...
        </p>
      </Card>
    );
  }

  const id_user = usuario.id_user;
  const rol = usuario.rol;

  const handleUpdate = () => {
    onUpdate({ id_user, rol, matricula, departamento });
  };

  return (
    <Card className="max-w-md mx-auto">
      <h3 className="text-2xl font-bold text-center text-gray-800 dark:text-white">
        Información del Perfil
      </h3>

      <div>
        <Label className="mb-1 block" value="Nombre:" />
        <p className="break-words rounded-md bg-gray-100 p-2.5 text-gray-800 dark:bg-gray-700 dark:text-gray-100">
          {usuario.FirstName} {usuario.LastName}
        </p>
      </div>

      <div>
        <Label className="mb-1 block" value="Correo:" />
        <p className="break-all rounded-md bg-gray-100 p-2.5 text-gray-800 dark:bg-gray-700 dark:text-gray-100">
          {usuario.email}
        </p>
      </div>

      {rol === "Alumno" && (
        <div>
          <Label htmlFor="matricula" className="mb-1 block" value="Matrícula:" />
          <TextInput
            id="matricula"
            type="text"
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
            placeholder="Ingresa tu matrícula"
          />
        </div>
      )}

      {rol === "Profesor" && (
        <div>
          <Label htmlFor="departamento" className="mb-1 block" value="Departamento:" />
          <TextInput
            id="departamento"
            type="text"
            value={departamento}
            onChange={(e) => setDepartamento(e.target.value)}
            placeholder="Ingresa tu departamento"
          />
        </div>
      )}

      <Button onClick={handleUpdate} className="w-full">
        Actualizar Perfil
      </Button>
    </Card>
  );
};

export default Perfil;
