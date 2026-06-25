import React, { useState } from 'react';
import '../../styles/Dashboard.css';



const LaboratorioTable = ({ Laboratorios , handleRowClickLab }) => {
  const [selectedBloque , setSelectedBloque] = useState('');
  const [selectedNombre, setSelectedNombre] = useState('');
  
 
  const filteredLaboratorios = Laboratorios.filter((laboratorio) => {
    const bloqueLaboratorio = laboratorio.ubicacion || '';
    const nombreLaboratorio = laboratorio.nombre_laboratorio || '';

    const bloqueMatch = selectedBloque ? bloqueLaboratorio.includes(selectedBloque) : true;
    const nombreMatch = selectedNombre ? nombreLaboratorio.includes(selectedNombre) : true;
    return bloqueMatch && nombreMatch;
  });
  

  return (
      <div className="table-container">
          <div className="filters">
              <input
                  type="text"
                  placeholder="Buscar por laboratorio"
                  value={selectedNombre}
                  maxLength={4}
                  onKeyDown={(e) => {
                    if (!/^\d$/.test(e.key) && e.key !== 'Backspace') {
                      e.preventDefault();
                      alert("Solo se permiten números de 4 dígitos.");
                    }
                    
                  }}
                  onChange={(e) => {

                      setSelectedNombre(e.target.value); 
                  }}
                  className="filter-input"
              />

              <select
                  value={selectedBloque}
                  onChange={(e) => setSelectedBloque(e.target.value)}
                  className="filter-select"
              >
                  <option value="">Todas las ubicaciones</option>
                    {Array.from(new Set(Laboratorios.map((lab) => lab.ubicacion))).map((ubicacion,idk) =>{
                        const key = `${ubicacion}-${idk}`;
                        console.log(`Dropdown key: ${key}`); 
                        console.log("Length of Laboratorios:", Laboratorios.length);
                        return (<React.Fragment key={ key} >
                            <option value={ubicacion}>{ubicacion}</option>
                            </React.Fragment>
                    )



                    } 
                      )}
                </select>
            </div>

            <table className="turnos-table">
                <thead>
                    <tr>
                        <th>Laboratorio</th>
                        <th>Ubicación</th>
                        <th>Capacidad</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredLaboratorios.map((laboratorio) => (
                        <tr key={`${laboratorio.id_laboratorio}-${laboratorio.nombre_laboratorio}`} className="turno-row" onClick={() => handleRowClickLab(laboratorio)}>
                            <td>{laboratorio.nombre_laboratorio || "No disponible"}</td>
                            <td>{laboratorio.ubicacion || "No disponible"}</td>
                            <td>{laboratorio.capacidad}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default LaboratorioTable;