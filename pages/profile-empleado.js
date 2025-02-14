import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import { useSession, signOut } from 'next-auth/react';

export default function ProfileEmpleado() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  
  // Estados para el perfil
  const [name, setName] = useState(session?.user?.name || '');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [cvUrl, setCvUrl] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Para la imagen de perfil
  const [selectedProfileImage, setSelectedProfileImage] = useState(null);
  const [profileImageMessage, setProfileImageMessage] = useState('');
  
  // Para el CV
  const [selectedCV, setSelectedCV] = useState(null);
  const [cvUploadMessage, setCvUploadMessage] = useState('');

  // Cargar perfil (incluye cvUrl)
  useEffect(() => {
    if (session) {
      axios.get('/api/employee/profile')
        .then((res) => {
          const data = res.data;
          setName(data.name || '');
          setPhone(data.phone || '');
          setDescription(data.description || '');
          setCvUrl(data.cvUrl || '');
        })
        .catch((err) => console.error('Error al cargar el perfil:', err));
    }
  }, [session]);

  if (status === 'loading') return <p>Cargando...</p>;
  if (!session) {
    useEffect(() => { router.push('/login'); }, [router]);
    return null;
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put('/api/employee/profile', { name, phone, description });
      if (update) {
        await update();
      } else {
        router.replace(router.asPath);
      }
      alert('Perfil actualizado exitosamente');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error actualizando el perfil:', error);
      alert('Error actualizando el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileImageChange = (e) => {
    setSelectedProfileImage(e.target.files[0]);
  };

  const handleProfileImageUpload = async (e) => {
    e.preventDefault();
    if (!selectedProfileImage) {
      setProfileImageMessage('Por favor, selecciona una imagen.');
      return;
    }
    const formData = new FormData();
    formData.append('profilePicture', selectedProfileImage);

    try {
      const res = await axios.post('/api/employee/upload-profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfileImageMessage('Imagen de perfil actualizada correctamente.');
      if (update) {
        await update();
      } else {
        router.replace(router.asPath);
      }
      console.log('Imagen actualizada:', res.data.user.profilePicture);
    } catch (error) {
      console.error('Error actualizando la imagen de perfil:', error);
      setProfileImageMessage('Error al actualizar la imagen de perfil.');
    }
  };

  const handleCVFileChange = (e) => {
    setSelectedCV(e.target.files[0]);
  };

  const handleCVUpload = async (e) => {
    e.preventDefault();
    if (!selectedCV) {
      setCvUploadMessage('Por favor, selecciona tu CV.');
      return;
    }
    const formData = new FormData();
    formData.append('cv', selectedCV);

    try {
      const res = await axios.post('/api/employee/upload-cv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setCvUploadMessage('CV subido correctamente.');
      console.log('CV:', res.data.cv);
      // Actualizamos el estado con el nuevo URL del CV
      setCvUrl(res.data.cv);
    } catch (error) {
      console.error('Error subiendo el CV:', error);
      setCvUploadMessage('Error al subir el CV.');
    }
  };

  // Función para eliminar el CV
  const handleDeleteCV = async () => {
    if (confirm("¿Estás seguro de que deseas eliminar tu CV?")) {
      try {
        await axios.delete('/api/employee/delete-cv', { data: {} });
        alert("CV eliminado correctamente.");
        setCvUrl('');
        if (update) {
          await update();
        } else {
          router.replace(router.asPath);
        }
      } catch (error) {
        console.error("Error eliminando el CV:", error);
        alert("Error al eliminar el CV.");
      }
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h1>Perfil de Empleado</h1>
      {/* Mostrar imagen de perfil */}
      <img
        src={session.user.image || "/images/default-user.png"}
        alt="Imagen de perfil"
        style={{
          width: "100px",
          height: "100px",
          borderRadius: "50%",
          objectFit: "cover",
          border: "2px solid #ccc",
        }}
      />
      {/* Formulario para actualizar datos de perfil */}
      <form onSubmit={handleProfileUpdate}>
        <div>
          <label>Nombre:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Teléfono:</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Descripción:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Actualizando...' : 'Actualizar Perfil'}
        </button>
      </form>

      <br />
      {/* Formulario para actualizar imagen de perfil */}
      <form onSubmit={handleProfileImageUpload}>
        <div>
          <label>Actualizar Imagen de Perfil:</label>
          <input type="file" onChange={handleProfileImageChange} accept="image/*" />
        </div>
        <button type="submit">Actualizar Imagen</button>
      </form>
      {profileImageMessage && <p>{profileImageMessage}</p>}

      <br />
      {/* Formulario para subir CV */}
      <form onSubmit={handleCVUpload}>
        <div>
          <label>Subir CV:</label>
          <input type="file" onChange={handleCVFileChange} accept=".pdf,.doc,.docx" />
        </div>
        <button type="submit">Subir CV</button>
      </form>
      {cvUploadMessage && <p>{cvUploadMessage}</p>}
      
      {/* Mostrar CV actual si existe */}
      {cvUrl && (
        <div>
          <p>
            CV actual:{" "}
            <a href={cvUrl} target="_blank" rel="noopener noreferrer">
              {cvUrl}
            </a>
          </p>
          <button onClick={handleDeleteCV}>Eliminar CV</button>
        </div>
      )}

      <br />
      <Link href="/dashboard">Volver al Dashboard</Link>
      <br />
      <button onClick={() => signOut({ callbackUrl: '/login' })}>Cerrar sesión</button>
    </div>
  );
}
