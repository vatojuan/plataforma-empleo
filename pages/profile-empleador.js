import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import { useSession, signOut } from 'next-auth/react';

export default function ProfileEmpleador() {
  const { data: session, status, update } = useSession(); // Intentamos obtener 'update'
  const router = useRouter();
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const [selectedProfileImage, setSelectedProfileImage] = useState(null);
  const [profileImageMessage, setProfileImageMessage] = useState('');

  useEffect(() => {
    if (session) {
      axios.get('/api/employer/profile')
        .then((res) => {
          const data = res.data;
          setCompanyName(data.companyName || '');
          setDescription(data.description || '');
          setPhone(data.phone || '');
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
      await axios.put('/api/employer/profile', { companyName, description, phone });
      alert('Perfil actualizado exitosamente');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error actualizando el perfil:', error);
      alert('Error actualizando el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentFileChange = (e) => {
    setSelectedDocument(e.target.files[0]);
  };

  const handleDocumentUpload = async (e) => {
    e.preventDefault();
    if (!selectedDocument) {
      setUploadMessage('Por favor, selecciona un archivo primero.');
      return;
    }
    const formData = new FormData();
    formData.append('document', selectedDocument);

    try {
      const res = await axios.post('/api/employer/upload-document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadMessage('Documento subido correctamente.');
      console.log('Documento:', res.data.document);
    } catch (error) {
      console.error('Error subiendo el documento:', error);
      setUploadMessage('Error al subir el documento.');
    }
  };

  const handleProfileImageChange = (e) => {
    setSelectedProfileImage(e.target.files[0]);
  };

  const handleProfileImageUpload = async (e) => {
    e.preventDefault();
    if (!selectedProfileImage) {
      setProfileImageMessage('Por favor, selecciona una imagen primero.');
      return;
    }
    const formData = new FormData();
    formData.append('profilePicture', selectedProfileImage);

    try {
      const res = await axios.post('/api/employer/upload-profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfileImageMessage('Imagen de perfil actualizada correctamente.');

      // Actualizar la sesión automáticamente:
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

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h1>Perfil de Empleador</h1>
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
      <form onSubmit={handleProfileUpdate}>
        <div>
          <label>Nombre de la Empresa:</label>
          <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
        </div>
        <div>
          <label>Descripción:</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <div>
          <label>Teléfono:</label>
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Actualizando...' : 'Actualizar Perfil'}
        </button>
      </form>

      <br />
      {/* Formulario para actualizar la imagen de perfil */}
      <form onSubmit={handleProfileImageUpload}>
        <div>
          <label>Actualizar Imagen de Perfil:</label>
          <input type="file" onChange={handleProfileImageChange} accept="image/*" />
        </div>
        <button type="submit">Actualizar Imagen</button>
      </form>
      {profileImageMessage && <p>{profileImageMessage}</p>}

      <br />
      {/* Formulario para subir documento legal */}
      <form onSubmit={handleDocumentUpload}>
        <div>
          <label>Subir Documento Legal:</label>
          <input type="file" onChange={handleDocumentFileChange} accept=".pdf,.jpg,.png,.doc,.docx" />
        </div>
        <button type="submit">Subir Documento</button>
      </form>
      {uploadMessage && <p>{uploadMessage}</p>}
      <br />
      <Link href="/dashboard">Volver al Dashboard</Link>
      <br />
      <button onClick={() => signOut({ callbackUrl: '/login' })}>Cerrar sesión</button>
    </div>
  );
}
