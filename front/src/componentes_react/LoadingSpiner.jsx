import React from "react";
import { Spinner } from "flowbite-react";

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <Spinner aria-label="Cargando" size="xl" color="info" />
    </div>
  );
};

export default LoadingSpinner;
