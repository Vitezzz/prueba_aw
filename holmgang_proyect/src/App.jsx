import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [reportes, setReportes] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [cuerpo, setCuerpo] = useState('');
  const [imagen, setImagen] = useState(null);
  const [editando, setEditando] = useState(null);

  const API_URL = 'http://localhost:3000/api/reportes';

  useEffect(() => {
    cargarReportes();
  }, []);

  const cargarReportes = async () => {
    const res = await fetch(API_URL);
    const data = await res.json();
    setReportes(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('cuerpo', cuerpo);
    if (imagen) {
      formData.append('imagen', imagen);
    } else if (editando) {
      formData.append('imagenActual', editando.imagen);
    }

    if (editando) {
      await fetch(`${API_URL}/${editando.id}`, {
        method: 'PUT',
        body: formData
      });
      setEditando(null);
    } else {
      await fetch(API_URL, {
        method: 'POST',
        body: formData
      });
    }

    setTitulo('');
    setCuerpo('');
    setImagen(null);
    cargarReportes();
  };

  const eliminarReporte = async (id) => {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    cargarReportes();
  };

  const editarReporte = (reporte) => {
    setEditando(reporte);
    setTitulo(reporte.titulo);
    setCuerpo(reporte.cuerpo);
    setImagen(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setTitulo('');
    setCuerpo('');
    setImagen(null);
  };

  return (
    <div className="container">
      <h1>📔 Diario de Reportes</h1>
      
      <form onSubmit={handleSubmit}>
        <h2>{editando ? '✏️ Editar Reporte' : '➕ Nuevo Reporte'}</h2>
        <input
          type="text"
          placeholder="Título"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
        />
        <textarea
          placeholder="Escribe tu reporte..."
          value={cuerpo}
          onChange={(e) => setCuerpo(e.target.value)}
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImagen(e.target.files[0])}
        />
        {editando && !imagen && editando.imagen && (
          <p className="imagen-actual">Imagen actual: {editando.imagen}</p>
        )}
        <div className="botones">
          <button type="submit">{editando ? 'Actualizar' : 'Guardar'}</button>
          {editando && (
            <button type="button" onClick={cancelarEdicion} className="btn-cancelar">
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="reportes">
        {reportes.map((reporte) => (
          <div key={reporte.id} className="reporte">
            <h2>{reporte.titulo}</h2>
            <p>{reporte.cuerpo}</p>
            {reporte.imagen && (
              <img src={`http://localhost:3000/uploads/${reporte.imagen}`} alt="Imagen del reporte" />
            )}
            <small>{new Date(reporte.fecha).toLocaleString()}</small>
            <div className="acciones">
              <button onClick={() => editarReporte(reporte)} className="btn-editar">
                Editar
              </button>
              <button onClick={() => eliminarReporte(reporte.id)}>
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;