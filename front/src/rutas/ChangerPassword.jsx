import '../styles/output.css' 
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import HoverButton from '../componentes_react/boton'
import AlertResponse  from "../componentes_react/alert"

export default function changerPassword() {
  const { token } = useParams();  // Extrae el token de la URL

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
     
    const minPasswordLength = 9;

    if (newPassword.length < minPasswordLength) {
      setPasswordError(`La contraseña debe tener al menos ${minPasswordLength} caracteres.`);
      return;
    } else {
      setPasswordError("");  
    }




    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      const response = await fetch(`/api/resetPassword/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
        credentials: 'include',
      });

      const json = await response.json();
      if (response.ok) {
        setSuccess("Contraseña actualizada exitosamente.");
      } else {
        setError(json.error );
      }
    } catch (error) {
      setError("Error de conexión, por favor intenta más tarde.");
    }
  }; 
  
  return ( 
  
<div  className="row container-min-width  login-page">
<div className=" max-w-[30vw] md:max-w-[20vw] lg:max-w-[5vw] bg-white rounded-lg shadow dark:border sm:max-w-sm md:max-w-md xl:max-w-lg dark:bg-gray-800 dark:border-gray-700 transition-transform duration-300 ease-in-out">

      
      <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
      <div className='card-header'>
          <img className="  h-48" src="https://www.upm.es/sfs/Rectorado/Gabinete%20del%20Rector/Logos/UPM/Logotipo/LOGOTIPO%20color%20PNG.png" alt="logo"/> 
      </div>
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
          <div>
            
              <AlertResponse  mensage={success} color= {"info"} />
              
              </div>
              <div>
              <AlertResponse  mensage={error} color={"failure"}/>
              </div>

              
              <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>


              <div>
                      <label htmlFor="NewPassword" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nueva contraseña</label>
                      <input type="password" name="NewPassword" id="NewPassword" onChange={(e) => setNewPassword(e.target.value)} value={newPassword}  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required=""/>
                      {!!passwordError && <p className="text-red-600 text-sm mt-2">{passwordError}</p>}
                  </div>
                 
                  <div>
                      <label htmlFor="ConfirmPassword" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">confimar contraseña</label>
                      <input type="password" name="ConfirmPassword" id="ConfirmPassword" onChange={(e) => setConfirmPassword(e.target.value)} value={confirmPassword}   className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required=""/>
                  </div>
                 
                  <HoverButton onClick={() => handleSubmit()}
                 label="enviar" ></HoverButton> 
                
              </form>
          </div>
      </div>
  </div>

  



</div>

  );


}

 
