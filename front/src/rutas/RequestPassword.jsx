import React, { useState } from 'react';

import AlertResponse  from "../componentes_react/alert"
import '../styles/output.css'

import HoverButton from '../componentes_react/boton'




export default function RequestPasswordReset() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/requestPasswordReset', {
        method: 'POST',
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({ email }),
      });
      const json = await response.json();
      if (response.ok) {
        setError("");
        setSuccess(json.body.request);
      } 
      else{
         setSuccess(""); 
         setError(json.body.error);
        }

    } catch (error) {
      console.error("Error:", error);
    }
  }
  return (



<div  className="row container-min-width  login-page">
<div className=" max-w-[30vw] md:max-w-[20vw] lg:max-w-[5vw] bg-white rounded-lg shadow dark:border sm:max-w-sm md:max-w-md xl:max-w-lg dark:bg-gray-800 dark:border-gray-700 transition-transform duration-300 ease-in-out">

      
      <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
      <div className='card-header'>
          <img className="  h-48" src="https://www.upm.es/sfs/Rectorado/Gabinete%20del%20Rector/Logos/UPM/Logotipo/LOGOTIPO%20color%20PNG.png" alt="logo"/> 
      </div>
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              
          <form className="space-y-4 md:space-y-6 form"  onSubmit={handleSubmit} >
              <div>
              <AlertResponse  mensage={success} color= {"info"} />
              </div>
              <div>
              <AlertResponse  mensage={error} color= {"failure"}/>
              </div>


              <div>
                      <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Introduzca su Correo Electrónico</label>
                      <input type="text" name="email" id="email" onChange={(e) => setEmail(e.target.value)} value={email}  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required=""/>
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