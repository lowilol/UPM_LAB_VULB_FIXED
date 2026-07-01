
import { Link } from 'react-router-dom';
import { useState} from "react";
import { useAuth} from "../auth/AuthProvider";
import { Navigate } from "react-router-dom";
import AlertResponse  from "../componentes_react/alert"
import HoverButton from '../componentes_react/boton'
export default function login() {



  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorResponse, setErrorResponse] = useState("");

  const [redirect, setRedirect] = useState(null);



  const auth = useAuth();



  async function handleSubmit(e) {
    e.preventDefault();
    //auth.SetisAuthenticated(true);
    try {

      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      const json = await response.json();
      if (response.ok && json.accessToken ) {


           auth.saveUser(json.user);
           sessionStorage.setItem('user', JSON.stringify(json.user));
           setRedirect({
            pathname: '/dashboard',
            state: { userRole: json.user.rol },
          });



      }
      else {

        setErrorResponse(json.body.error || "Ha ocurrido un error.");
      }




    } catch (error) {
      console.log("Error:", error);
      setErrorResponse(" Error de conexión. Inténtelo de nuevo más tarde.");
    }
  }

  if (redirect) {
    return <Navigate to={redirect.pathname} state={redirect.state} />;
  }

  if (auth.isAuthenticated) {
    return <Navigate to="/dashboard" />;

  }


  return (





    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">

      <div className="w-full max-w-md rounded-lg bg-white shadow transition-transform duration-300 ease-in-out dark:border dark:border-gray-700 dark:bg-gray-800">
        <div className="flex justify-center pt-6">
          <img className="h-40" src="https://www.upm.es/sfs/Rectorado/Gabinete%20del%20Rector/Logos/UPM/Logotipo/LOGOTIPO%20color%20PNG.png" alt="logo" />
        </div>
        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">

          <form className=" space-y-4 md:space-y-6" onSubmit={handleSubmit}  >

            <div>
              <AlertResponse  mensage={errorResponse} color={"failure"}/>
              </div>


              <div>
              <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Correo </label>
              <input type="text" name="email" id="email"  onChange={(e) => setEmail(e.target.value)} value={email}className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
            </div>
            <div>
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Contraseña</label>
              <input type="password" name="password" id="password" onChange={(e) => setPassword(e.target.value)} value={password} className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-start">


              </div>
              <Link to="/requestPassword" className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-500">¿Olvidó la contaseña?</Link>
            </div>
            <HoverButton onClick={(e) => handleSubmit(e)}
                 label="login" ></HoverButton>
            <p className="text-sm font-light text-gray-500 dark:text-gray-400">
              ¿Aún no tienes una cuenta ya creada? <Link to="/signup" className="font-medium text-primary-600 hover:underline dark:text-primary-500">Registrarse</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
