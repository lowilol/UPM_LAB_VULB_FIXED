import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { Navbar, Footer, Button } from 'flowbite-react'
import { HiUserCircle } from 'react-icons/hi'

import HoverButton from '../componentes_react/boton'
import CreateTurnoModal from "../componentes_react/CreateTurnoModal"
import CrearLaboratorioModal from '../componentes_react/CreateLaboratorioModal'
import DetailsTurnoModal from "../componentes_react/DetailsTurnoModal"
import DetailsLabModel from "../componentes_react/DetailsLabModel"
import DetailsReservaModal from "../componentes_react/DetailsReservaModal"

import DetailIncidenciaModal from "../componentes_react/DetailsIncidenciaLabModal"

import ReservaTable from "../componentes_react/tabla/ReservaTable"
import LaboratorioTable from "../componentes_react/tabla/LaboratorioTable"
import TurnoTable from "../componentes_react/tabla/TurnoTable"
import IncidenciasLabTable from "../componentes_react/tabla/IncidenciasLabTable"

import Perfil from "./profile"
import { ToastContainer } from "react-toastify";


export default function Dashboard(  ) {

   const [name, setName] = useState("");
   const [email, setEmail] = useState("");
   const [rol, setRol] = useState("");
   const [id_user,setId_user] = useState("");
   const [error, setError] = useState("");
   const { isAuthenticated, logout,checkAuth, getAccessToken} = useAuth();


   const[success,setSuccess ] = useState("");
   const[usuario,setUsuario]= useState(null)

   const [showModalCreateTurno, setShowModalCreateTurno] = useState(false);
   const [showModalCreateLab, setShowModalCreateLab] = useState(false);

   const [content, setContent] = useState("");

   const [turnosDisponibles, setTurnosDisponibles] = useState([]);
   const [MisTurnos, setMisTurnos] = useState([]);
   const [selectedTurno, setSelectedTurno] = useState(null);
   const [selectedLaboratorio, setSelectedLaboratorio] = useState(null);
   const [reservas, setReservas] = useState([]);
   const [selectedReserva, setSelectedReserva] = useState(null);
   const [Laboratorios, setLaboratorios] = useState([]);

   const[ErrorMensageReserva,setErrorMensageReserva] = useState("");
   const[ErrorMensageLab,setErrorMensageLab] = useState("");

   const[MensageActTurno,setMensageActTurno] = useState("")


   const [IncidenciasLab, setIncidenciasLab] = useState([]);
   const [IncidenciasLabAll, setIncidenciasLabAll] = useState([]);

   const [selectedIncidencia, setSelectedIncidencia] = useState(null);
   const navigate = useNavigate();


   useEffect(() => {
      console.log(isAuthenticated)
      if (!isAuthenticated) {

         navigate('/');
         return;
      }
      checkAuth();
      const interval = setInterval(checkAuth, 480000);
      console.log("escaneando...")

      const userDataRaw = sessionStorage.getItem('user');
      const accessToken = getAccessToken()

      if (userDataRaw) {
         try {
            const userData = JSON.parse(userDataRaw);
            const rol_ = userData.rol
            const name_ =`${userData.FirstName} ${userData.LastName}`
            const email_ = userData.email
            const id_ = userData.id_user
            setId_user(id_)
            setName(name_)
            setEmail(email_)
            setRol(rol_)

            fetchDashboardMessage(accessToken, email_);

            return () => clearInterval(interval);
         } catch (error) {
            console.error("Error al parsear user data:", error);
            setError("Error al recuperar los datos del usuario");
         }
      } else {
         setError("No se encontró la información del usuario en sessionStorage.");
      }
   }, [isAuthenticated, navigate]);
   const fetchMisTurnos = async (id_profesor) => {
      try {
        const response = await fetch(`/api/turno/${id_profesor}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',

          },
        });

        const data = await response.json();

        if (response.ok) {
         setSuccess("")
          console.log("Turnos del profesor obtenidos:", data);
          setMisTurnos(data);
        } else {
          console.error("Error al obtener turnos del profesor:", data.message || "Error no especificado.");
        }
      } catch (error) {
        console.error("Error de conexión al obtener turnos del profesor:", error);
      }
    }



    const handleCancelReserva = async (id_turno,id_usuario) => {
      const id_alumno = id_usuario;
      try {
        const response = await fetch(`/api/reserva/cancelar/${id_turno}/${id_alumno}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
          },
        });
        const updatedReserva = await response.json();
        if (response.ok) {
         setReservas((prevReservas) =>
            prevReservas.map((r) =>
              r.id_turno === id_turno && r.id_alumno === id_alumno ? { ...r, estado: "Cancelada" } : r
            )
          );


          console.log("Reserva cancelada:", updatedReserva);

          setSuccess(updatedReserva.message)

          console.log(success)
        } else {
          console.error("Error al cancelar la reserva");
          setErrorMensageReserva(updatedReserva.error)
          console.log(ErrorMensageReserva)
          console.log(updatedReserva.error)
        }
      } catch (error) {
        console.error("Error al cancelar la reserva:", error);
      }
    };





   const fetchTurnosDisponibles = async () => {
    try {
      console.log("Iniciando solicitud para obtener turnos disponibles");
       const response = await fetch('/api/turno', {
          method: 'GET',
          headers: {
             'Content-Type': 'application/json',
             'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`,
          },
       });
       console.log("Respuesta del servidor:", response);
       const data = await response.json();
       console.log("Respuesta del servidor:", data);
       if (response.ok) {
          setSuccess("")
          setTurnosDisponibles(data);
       } else {
          console.error("Error al obtener turnos:", data.error);
       }
    } catch (error) {
       console.error("Error de conexión:", error);
    }
 };

 const fetchHistorialReservas = async (id_usuario) => {

   const id_alumno = id_usuario
   try {
      const response = await fetch(`/api/reserva/${id_alumno}`, {
         method: 'GET',
         headers: {
            'Content-Type': 'application/json',

         },
      });

      const data = await response.json();
      if (response.ok) {

         setReservas(data);

      } else {
         if (response.status === 404) {
            console.warn('No se encontraron reservas para este alumno.');
            setReservas([]);
            return;
         }
         throw new Error(`Error al obtener historial: ${error.statusText}`);
      }
   } catch (error) {
      console.error('Error de conexión:', error);
   }
};






const fetchReservaTurno = async (id_usuario, id_turno) => {
   const id_alumno = id_usuario;
   try {
      const response = await fetch(`/api/reserva/${id_turno}/${id_alumno}`, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',

         },
      });

      if (!response.ok) {
         const data = await response.json()
         if (response.status === 400) {
            setSuccess("")
            console.warn('La reserva ya existe o no se puede completar.');
            console.warn(data.error)
            setErrorMensageReserva(data.error)
            console.warn(data.error)

         }


      }
      else{
         const data = await response.json()
         setErrorMensageReserva("")
         console.log("mensaje"+data.message)
         setSuccess(data.message)
        console.log('Reserva creada exitosamente:', data);
      }


   } catch (error) {
      console.error('Error de conexión o en la solicitud:', error);
   }
}


const handleCreateIncidenciaLab = async (id_laboratorio, incidencia , descripcion_incidencia ,id_user) => {
   try {
     const response = await fetch("/api/incidencia/laboratorio", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ id_laboratorio, incidencia,id_user,descripcion_incidencia }),
     });


     const data = await response.json();
     console.log(data)
     if (!response.ok) {

       alert(data.error || "Error al registrar la incidencia.");
     } else {
       alert("Incidencia registrada exitosamente.");
     }
   } catch (error) {
     console.error("Error al registrar la incidencia:", error);
   }
 };

 const handleCreateIncidenciaTurno = async (id_turno, incidencia, descripcion_incidencia) => {
   try {
     const response = await fetch("/api/incidencia/turno", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ id_turno, incidencia,descripcion_incidencia}),
     });


     const data = await response.json();
     console.log(data)
     if (!response.ok) {

       alert(data.error || "Error al registrar la incidencia.");
     } else {
       alert("Incidencia registrada exitosamente.");
     }
   } catch (error) {
     console.error("Error al registrar la incidencia:", error);
   }
 };




const handleReserva = async (id_turno) => {
   await fetchReservaTurno(id_user, id_turno);
   //closeModalRoeTurno();
   handleOptionClickShowReserva("Historial de Reservas");
};

const handleOptionClickShowReserva = (option) => {
   setContent(option);
   if (option === "Historial de Reservas") {
      fetchHistorialReservas(id_user);
   }
};

 const handleDeleteTurno = async (id_turno) => {
   try {
      const id_profesor = id_user;
      if (!id_profesor) {
         console.error("El ID del profesor no está disponible.");
         return;
      }
      const response = await fetch(`/api/turno/${id_profesor}/${id_turno}`, {
         method: "DELETE",
         headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
         },
      });
      const data = await response.json();
      if (response.ok) {
         setTurnosDisponibles(turnosDisponibles.filter((t) => t.id_turno !== id_turno));
         setMisTurnos(MisTurnos.filter((t) => t.id_turno !== id_turno));
         console.log("Turno eliminado correctamente");
         //closeModalRoeTurno();
         console.log(data)
         setSuccess(data.message)
         handleOptionClickMisTurno("Mis Turnos")
      } else {
         console.error("Error al eliminar el turno");
      }
   } catch (error) {
      console.error("Error al eliminar el turno:", error);
   }
};

const handleUpdateTurno = async (id_turno, newFecha, newHoraInicio , newHoraFin) => {
   try {
      const id_profesor = id_user;
      if (!id_profesor) {
         console.error("El ID del profesor no está disponible.");
         return;
      }
      const response = await fetch(`/api/turno/${id_profesor}/${id_turno}`, {
         method: "PUT",
         headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
         },
         body: JSON.stringify(newFecha, newHoraInicio ,newHoraFin),
      });
        const data = await response.json()
      if (response.ok) {

         setSuccess(data.message)
         setTurnosDisponibles((prev) =>
            prev.map((turno) =>
              turno.id_turno === id_turno
                ? {
                    ...turno,
                    fecha: newFecha || turno.fecha,
                    hora_inicio: newHoraInicio || turno.hora_inicio,
                    hora_fin: newHoraFin || turno.hora_fin,
                  }
                : turno
            )
          );
         setMisTurnos((prev) =>
            prev.map((turno) =>
               turno.id_turno === id_turno
                 ? {
                     ...turno,
                     fecha: newFecha || turno.fecha,
                     hora_inicio: newHoraInicio || turno.hora_inicio,
                     hora_fin: newHoraFin || turno.hora_fin,
                   }
                 : turno
             )
         );



      } else {
         setMensageActTurno("Error al actualizar el turno")
      }
   } catch (error) {
      console.error("Error al actualizar el turno:", error);
   }
};


const fetchMostrarLab = async () => {
   try {
      const response = await fetch('/api/laboratorio', {
         method: 'GET',
         headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`,
         },
      });
      const data = await response.json();
      console.log("Laboratorios obtenidos:", data);
      if (response.ok) {
         setSuccess("")
         setLaboratorios(data);
         console.log("Laboratorios obtenidos:", Laboratorios);
         closeModalRoeTurno()
      } else {
         console.error("Error al obtener laboratorios:", data.error);
      }
   } catch (error) {
      console.error("Error de conexión:", error);
   }


}


const handleDeleteLaboratorio = async (id_laboratorio) => {
   try {

      const response = await fetch(`/api/laboratorio/${id_laboratorio}X${id_user}`, {
         method: "DELETE",
         headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
         },
      });
      if (response.ok) {
         setSuccess("Laboratorio eliminado con éxito");
         setLaboratorios(Laboratorios.filter((lab) => lab.id_laboratorio !== id_laboratorio));
         console.log("Turno eliminado correctamente");

         closeModalRoeLab();
      } else {
         console.error("Error al eliminar el laboratorio");
      }
   } catch (error) {
      console.error("Error de conexión:", error);
   }
};

const handleUpdateLaboratorio = async (id_laboratorio, nuevaCapacidad) => {
   try {
      const response = await fetch(`/api/laboratorio/${id_laboratorio}`, {
         method: "PUT",
         headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
         },
         body: JSON.stringify({ id_laboratorio:id_laboratorio,capacidad: nuevaCapacidad}),
      });

       const data = response.json();
      if (response.ok) {
          setSuccess("")
         setLaboratorios((prev) =>
            prev.map((lab) =>
               lab.id_laboratorio === id_laboratorio
                  ? { ...lab, capacidad: nuevaCapacidad }
                  : lab
            )
         );

         setSuccess(data.message)
         //closeModalRoeLab();
        if(response.status === 404){
           setErrorMensageLab(data.error)
        }



      } else {
         console.error("Error al actualizar el laboratorio");
         setErrorMensageLab("Error al actualizar el laboratorio")
      }
   } catch (error) {
      console.error("Error de conexión:", error);
   }
};



 // Manejar clic en "Turnos Disponibles"
 const handleOptionClickTurnoDisp = (option) => {
    setContent(option);
    if (option === "Turnos Disponibles") {
       fetchTurnosDisponibles();
    }
 };



 const handleOptionClickincidenciasLabAll = (option) => {
   setContent(option);
   if (option === "Incidencias laboratorio") {
      fletchIncidenislaboratorioAll();
   }
};


 const handleOptionClickMostrarLab = (option) => {
   setContent(option);
   if (option === "Mostrar Laboratorios") {
      fetchMostrarLab();
   }
};




 const handleOptionClickMisTurno = (option) => {
   setContent(option);
   if (option === "Mis Turnos") {
      const id_profesor = id_user;
      if (!id_profesor) {
         console.error("El ID del profesor no está disponible.");
         return;
      }
      fetchMisTurnos(id_profesor);
   }
};


   const fetchDashboardMessage = async (accessToken,email) => {
      try {
         const response = await fetch('/api/dashboard', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({email}),
            credentials: 'include'
         });

         const data = await response.json();
         if (response.ok) {
            console.log(data.missingData)
            setUsuario(data.user)

         }
      } catch (error) {
         console.error('Error al obtener datos del dashboard:', error);
         setError("Error de conexión con el servidor");
      }
   };

   useEffect(() => {
      if (usuario) {
         console.log("Usuario actualizado:", usuario);
      }
   }, [usuario]);

   const handleRowClickTurno = (turno) => {
    setSelectedTurno(turno);
    setErrorMensageReserva("")
 };


 const handleRowClickLab = (Lab) => {
   setErrorMensageLab("")
   setSelectedLaboratorio(Lab);
};

const handleRowClickReserva= (reserva) => {
   setErrorMensageReserva("");
   setSuccess("")
   setSelectedReserva(reserva);

};
const handleRowClickIncidencia= (incidencia) => {
   setSelectedIncidencia(incidencia);

};

 const closeModalRoeTurno = () => {
   const id_profesor = id_user
  setSelectedTurno(null)
  setMensageActTurno("")
  fetchMisTurnos(id_profesor);
  fetchTurnosDisponibles();

};


const closeModalRoeLab= () => {
   setSelectedLaboratorio(null)
   setErrorMensageReserva("")
 };

 const closeModalRoeIncidencia= () => {
   setSelectedIncidencia(null)
 };

 const closeModalRoeReserva= () => {
   setSelectedReserva(null)
   setErrorMensageReserva("")
 };

   const handleLogout = () => {
      logout()
      navigate('/');
   };
   const handleOptionClickCreateTurno = (option) => {
      setContent(option);
      setShowModalCreateTurno(true);
    };

    const handleOptionClickCreateLab = (option) => {
      setContent(option);
      setShowModalCreateLab(true);
    };


    const closeModalTurno = () => setShowModalCreateTurno(false);
    const closeModalLab = () => setShowModalCreateLab(false);

 const fletchIncidenislaboratorio =  async (laboratorio) => {

      try {
          const response = await fetch(`/api/incidencia/laboratorio/${laboratorio.id_laboratorio}`, {
            method: 'GET',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`,
            },
         });
          const ResIncidencias = await response.json();
          setIncidenciasLab( ResIncidencias );
          console.log(IncidenciasLab)
          //setIncidenciasLab("");


      } catch (err) {
          console.error('Error al obtener incidencias:', err);
      }
   };
   const handleUpdateProfile = async (id_user, rol, matricula, departamento) => {
      try {
         const accessToken = getAccessToken();
   console.log(accessToken)
         const response = await fetch("/api/user/updateProfile", {
            method: "PUT",
            headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ id_user, rol, matricula,departamento }),
         });

         const data = await response.json();
         if (response.ok) {
            console.log("Perfil actualizado:", data.message);
            alert(data.message); // Mostrar mensaje de éxito
         } else {
            console.error("Error al actualizar el perfil:", data.error);
            alert(`Error: ${data.error}`);
         }
      } catch (error) {
         console.error("Error al actualizar el perfil:", error);
         alert("Error de conexión con el servidor.");
      }
   };



   const fletchIncidenislaboratorioAll =  async () => {

      try {
          const response = await fetch(`/api/incidencia/laboratorio`, {
            method: 'GET',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`,
            },
         });
          const ResIncidencias = await response.json();
          setIncidenciasLabAll( ResIncidencias );
          console.log("tututu"+IncidenciasLabAll)
          //setIncidenciasLab("");


      } catch (err) {
          console.error('Error al obtener incidencias:', err);
      }
   };

   React.useEffect(() => {
      if (selectedLaboratorio && selectedLaboratorio.id_laboratorio) {
         fletchIncidenislaboratorio(selectedLaboratorio);
         console.log(IncidenciasLab)
      }
   }, [selectedLaboratorio])



   const handleViewProfile = () => {
      setContent("Perfil");
    };


   return (
      <div className="flex h-screen w-screen flex-col">
        <ToastContainer />

        {/* Header */}
        <Navbar fluid className="bg-[#00468b] dashboard-nav">
          <Navbar.Brand href="#">
            <img
              src="https://www.upm.es/sfs/Rectorado/Gabinete%20del%20Rector/Logos/UPM/Logotipo/LOGOTIPO%20color%20PNG.png"
              alt="Logo UPM"
              className="h-12 w-auto rounded-lg bg-white p-1"
            />
          </Navbar.Brand>
          <div className="flex items-center gap-3">
            <Button color="light" size="sm" className="btn-profile" onClick={handleViewProfile}>
              <HiUserCircle className="mr-2 h-5 w-5" />
              Perfil
            </Button>
            <Button color="light" size="sm" onClick={handleLogout}>
              Cerrar sesión
            </Button>
          </div>
        </Navbar>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Aside */}
          <aside className="dashboard-aside flex w-64 flex-shrink-0 flex-col gap-4 bg-[#1f82c0] p-4 text-white">
            <div>
              <h3 className="text-lg font-semibold">Opciones</h3>
            </div>
            <nav className="flex-1">
              <ul className="flex flex-col gap-2">
                {rol !== "PAS" && (
                  <li>
                    <HoverButton onClick={() => handleOptionClickTurnoDisp("Turnos Disponibles")}
                      label="Turnos Disponibles" ></HoverButton>
                  </li>
                )}
                {rol === "Alumno" && (
                  <li>
                    <HoverButton onClick={() => handleOptionClickShowReserva("Historial de Reservas")}
                      label="Historial de Reservas" ></HoverButton>
                  </li>
                )}
                {rol === "PAS" && (
                  <li>
                    <HoverButton onClick={() => handleOptionClickMostrarLab("Mostrar Laboratorios")}
                      label="Mostrar Laboratorios" ></HoverButton>
                  </li>
                )}

                {rol === "Profesor" && (
                  <li>
                    <HoverButton onClick={() => handleOptionClickMisTurno("Mis Turnos")}
                      label="Mis Turnos" ></HoverButton>
                  </li>
                )}
                {rol === "Profesor" && (
                  <li>
                    <HoverButton onClick={() => handleOptionClickincidenciasLabAll("Incidencias laboratorio")}
                      label="Incidencias laboratorio" ></HoverButton>
                  </li>
                )}
              </ul>
            </nav>

            {rol === "Profesor" && (
              <div className="mt-auto">
                <HoverButton
                  onClick={() => handleOptionClickCreateTurno("Crear Turnos")}
                  label="Crear Turnos"
                  styleOverrides={{
                    backgroundColor: "#28a745",
                    color: "white",
                    boxShadow: "none",
                    transform: "none",
                  }}
                ></HoverButton>
              </div>
            )}
            {rol === "PAS" && (
              <div className="mt-auto">
                <HoverButton
                  onClick={() => handleOptionClickCreateLab("Dar alta Laboratorios")}
                  label="Dar alta Laboratorios"
                  styleOverrides={{
                    backgroundColor: "#28a745",
                    color: "white",
                    boxShadow: "none",
                    transform: "none",
                  }}
                ></HoverButton>
              </div>
            )}
          </aside>

          {/* Main Section */}
          <section className="flex-1 overflow-y-auto p-6">
            <h2 className="mb-4 text-2xl font-bold text-gray-800">Bienvenido, {rol} : {name}</h2>
            <div>
              {content === "Turnos Disponibles" && <TurnoTable Turnos={turnosDisponibles} handleRowClickTurno={handleRowClickTurno}/>}
              {content === "Mis Turnos" && <TurnoTable Turnos={MisTurnos} handleRowClickTurno={handleRowClickTurno}/>}
              {content === "Mostrar Laboratorios" && <LaboratorioTable Laboratorios={Laboratorios} handleRowClickLab={handleRowClickLab} />}
              {content === "Historial de Reservas" && <ReservaTable reservas={reservas} handleRowClickReserva={handleRowClickReserva} />}
              {content === "Incidencias laboratorio" && <IncidenciasLabTable incidencias={IncidenciasLabAll} handleRowClickIncidencia={handleRowClickIncidencia} />}
              {content === "Perfil" && <Perfil usuario={usuario} onUpdate={handleUpdateProfile} />}
              {!content && <p className="text-gray-600">Selecciona una opción del menú para empezar</p>}
            </div>
          </section>
        </div>

        {/* Footer */}
        <Footer container className="rounded-none dashboard-footer">
          <Footer.Copyright by="Universidad Politécnica de Madrid" year={2025} />
        </Footer>

        {/* Modal */}
        {showModalCreateTurno && <CreateTurnoModal showModalCreateTurno={showModalCreateTurno} onClose={closeModalTurno } />}
        {showModalCreateLab && <CrearLaboratorioModal showModalCreateLab={showModalCreateLab} onClose={closeModalLab } />}
        {selectedTurno && (
          <DetailsTurnoModal
            turno={selectedTurno}
            onClose={closeModalRoeTurno}
            onDelete={handleDeleteTurno}
            onUpdate={handleUpdateTurno}
            id_user={id_user}
            rol={rol}
            onReserve={handleReserva}
            errorMensage ={MensageActTurno}
            ErrorMensageReserva={ErrorMensageReserva}
            onCreateIncidencia = {handleCreateIncidenciaTurno}
            success= {success}
          />
        )}
        {selectedLaboratorio && (
          <DetailsLabModel
            laboratorio={selectedLaboratorio}
            id_user={id_user}
            onClose={closeModalRoeLab}
            onDelete={ handleDeleteLaboratorio }
            onUpdate={handleUpdateLaboratorio }
            errorMensage={ErrorMensageLab}
            onCreateIncidencia= {handleCreateIncidenciaLab }
            Incidencias ={IncidenciasLab}
            success ={success}
          />
        )}


        {selectedReserva && (
          <DetailsReservaModal
            reserva={selectedReserva}
            onClose={closeModalRoeReserva}
            onCancelReserva={handleCancelReserva}
            errorMensage = {ErrorMensageReserva}
            success = {success}
          />
        )}



        {selectedIncidencia && (
          <DetailIncidenciaModal
            incidencia={selectedIncidencia}
            onClose={closeModalRoeIncidencia}
          />
        )}
      </div>
   );
}
