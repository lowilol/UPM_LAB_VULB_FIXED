import '../styles/output.css' 
import { Modal, Label, TextInput } from 'flowbite-react';
import { useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { Navigate, useNavigate } from "react-router-dom";
import HoverButton from '../componentes_react/boton'
import AlertResponse  from "../componentes_react/alert"
export default function signup() {
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorResponse, setErrorResponse] = useState("");
  const [errorResponseVerification, setErrorResponseVerification] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');


  const auth = useAuth();
  const goTo = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault(); 
    setErrorResponse("");
    const minPasswordLength = 9;

    if (password.length < minPasswordLength & !!name & !!lastname & !!email ) {
      setErrorResponse("");
      setPasswordError(`La contraseña debe tener al menos ${minPasswordLength} caracteres.`);
      return;
    } else {
      setPasswordError("");  
    }


  
    if (password !== confirmPassword) {
      setPasswordError("");
      setErrorResponse("Las contraseñas no coinciden.");
      return;
    }

    


    console.log(name, lastname , email , password);

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({  name, lastname, email , password }),
      });
      const json = (await response.json());
      setErrorResponse("");
      if (response.ok) {
        setShowVerificationModal(true); 
      } else {
        setErrorResponse(json.body.error);
      }
  
      
      
    } catch (error) {
      console.log(error);
    }
  }


  async function handleVerificationSubmit(e){
    e.preventDefault();
    try {
      const response = await fetch("/api/verifyCode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({  name, lastname , email , password, verificationCode }),
      });
      const json = (await response.json());
      setErrorResponseVerification("");
      if (response.ok) {
        console.log(json);
        setName("");
        setLastname("");
        setEmail("");
        setPassword("");
        setShowVerificationModal(false);
        goTo("/dashboard");
      } else {
        setErrorResponseVerification(json.body.error);
      }
    } catch (error) {
      console.log(error);
    }


    
  }

  if (auth.isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  
    
  
  return (
    
 
    
  
<div  className="row container-min-width  login-page">
<div className=" max-w-[30vw] md:max-w-[20vw] lg:max-w-[5vw] bg-white rounded-lg shadow dark:border sm:max-w-sm md:max-w-md xl:max-w-lg dark:bg-gray-800 dark:border-gray-700 transition-transform duration-300 ease-in-out">
      
          
      
      <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
      <div className='card-header'>
        <img className=" h-48" src="https://www.upm.es/sfs/Rectorado/Gabinete%20del%20Rector/Logos/UPM/Logotipo/LOGOTIPO%20color%20PNG.png" alt="logo"/> 

        </div>
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            
              <form className="space-y-4 md:space-y-6 form"  onSubmit={handleSubmit} >
              <div>
              <AlertResponse  mensage={errorResponse} color={"failure"}/>
              </div>
                 <div>
                      <label htmlFor="nombre" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nombre</label>
                      <input type="text" name="nombre" id="nombre" onChange={(e) => setName(e.target.value)}  value={name} className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"  required=""/>
                  </div>

                  <div>
                      <label htmlFor="Apellidos" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Apellidos</label>
                      <input type="text" name="Apellidos" id="Apellidos" onChange={(e) => setLastname(e.target.value)} value={lastname} className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"  required="" />
                  </div>

                  <div>
                      <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"> Correo</label>
                      <input type="text" name="email" id="email" onChange={(e) => setEmail(e.target.value)} value={email} className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"  required=""/>
                  </div>
                  <div>
                      <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Contraseña</label>
                      <input type="password" name="password" id="password" onChange={(e) => setPassword(e.target.value)} value={password}  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required=""/>
                      {!!passwordError && <p className="text-red-600 text-sm mt-2">{passwordError}</p>}
                  </div>

                  <div>
                      <label htmlFor="ConfirmPassword" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Confimar contraseña</label>
                      <input type="password" name="ConfirmPassword" id="ConfirmPassword" onChange={(e) => setConfirmPassword(e.target.value)} value={confirmPassword}    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required=""/>
                      
                  </div>
                  <div className="flex items-center justify-between">
                      <div className="flex items-start">
                          
                        
                          
                          
                  
                          
                          
                      </div>
                     
                  </div>

                  <div className=" content-center">
                  <HoverButton onClick={(e) => handleSubmit(e)}
                 label="sing in" ></HoverButton> 
                  </div>
                  
                  
              </form>
              <Modal show={showVerificationModal} onClose={() => setShowVerificationModal(false)}>
        <Modal.Header>Verificación de Correo</Modal.Header>
        <Modal.Body>
          <p className="text-gray-500">
            Te hemos enviado un código de verificación a tu correo electrónico. Por favor, ingrésalo a continuación.
          </p>
          <div>
              <AlertResponse  mensage={errorResponseVerification}/>
              </div>
          <form onSubmit={handleVerificationSubmit} className="space-y-4 mt-4">
            <div>
              <Label htmlFor="verificationCode" value="Código de Verificación" />
              <TextInput
                id="verificationCode"
                name="code"
                type="text"
                placeholder="Ingresa el código de verificación"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
              />
            </div>
            <HoverButton onClick={(e) => handleVerificationSubmit(e)}
                 label="Verificar" ></HoverButton>
          
          </form>
        </Modal.Body>
      </Modal>
          </div>
      </div>
  </div>

  



</div>

  );


}

 
