import React from 'react';
import { HiInformationCircle } from "react-icons/hi";
import { Alert} from 'flowbite-react';


const AlertResponse = ({ mensage, color }) => {
    return (
        <div>
            {!!mensage && (
                <Alert
                    color={color} 
                    icon={HiInformationCircle}
                >
                    <span>{mensage}</span>
                </Alert>
            )}
        </div>
    );
};

export default AlertResponse;