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
  const [loading, setLoading] = useState(false);

  // Para la imagen de perfil
  const [selectedProfileImage, setSelectedProfileImage] = useState(null);
  const [profileImageMessage, setProfileImageMessage] = useState('');

  // Para los documentos (CV, certificados, etc.)
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentUploadMessage, setDocumentUploadMessage] = useState('');
  const [documents, setDocuments] = useState([]);

  // Cargar datos del perfil
  useEffect(() => {
    if (session) {
      axios.get('/api/employee/profile')
        .then((res) => {
          const data = res.data;
          setName(data.name || '');
          setPhone(data.phone || '');
          setDescription(data.description || '');
        })
        .catch((err) => console.error('Error al cargar el perfil:', err));
    }
  }, [session]);

  // Cargar documentos subidos
  useEffect(() => {
    if (session) {
      axios.get('/api/employee/documents')
        .then((res) => {
          setDocuments(res.data.documents);
        })
        .catch((err) => console.error('Error al cargar documentos:', err));
    }
  }, [session]);

  if (status === 'loading' || !session) {
    return <p>Cargando...</p>;
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put('/api/employee/profile', { name, phone, description });
      alert('Perfil actualizado exitosamente');
      // Forzamos reload para que la sesión se recargue con los datos actualizados
      window.location.reload();
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
      window.location.reload();
      console.log('Imagen actualizada:', res.data.user.profilePicture);
    } catch (error) {
      console.error('Error actualizando la imagen de perfil:', error);
      setProfileImageMessage('Error al actualizar la imagen de perfil.');
    }
  };

  const handleDocumentFileChange = (e) => {
    setSelectedDocument(e.target.files[0]);
  };

  const handleDocumentUpload = async (e) => {
    e.preventDefault();
    if (!selectedDocument) {
      setDocumentUploadMessage('Por favor, selecciona un archivo primero.');
      return;
    }
    const formData = new FormData();
    formData.append('document', selectedDocument);
    try {
      const res = await axios.post('/api/employee/upload-document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setDocumentUploadMessage('Documento subido correctamente.');
      console.log('Documento:', res.data.document);
      const updatedDocs = await axios.get('/api/employee/documents');
      setDocuments(updatedDocs.data.documents);
    } catch (error) {
      console.error('Error subiendo el documento:', error);
      setDocumentUploadMessage('Error al subir el documento.');
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (confirm("¿Estás seguro de que deseas eliminar este documento?")) {
      try {
        await axios.delete('/api/employee/delete-document', { data: { documentId } });
        const updatedDocs = await axios.get('/api/employee/documents');
        setDocuments(updatedDocs.data.documents);
        alert("Documento eliminado correctamente.");
      } catch (error) {
        console.error("Error eliminando el documento:", error);
        alert("Error al eliminar el documento.");
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm("¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.")) {
      try {
        const res = await axios.delete('/api/user/delete');
        if (res.status === 200) {
          alert("Cuenta eliminada correctamente");
          await signOut({ redirect: false });
          router.push('/login');
        }
      } catch (error) {
        console.error("Error eliminando la cuenta:", error);
        alert("Error al eliminar la cuenta.");
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
          marginBottom: "1rem",
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
      {/* Formulario para subir documento */}
      <form onSubmit={handleDocumentUpload}>
        <div>
          <label>Subir Documento:</label>
          <input type="file" onChange={handleDocumentFileChange} accept=".pdf,.doc,.docx,.jpg,.png" />
        </div>
        <button type="submit">Subir Documento</button>
      </form>
      {documentUploadMessage && <p>{documentUploadMessage}</p>}

      <br />
      {/* Listado de documentos */}
      <h2>Mis Documentos</h2>
      {documents.length === 0 ? (
        <p>No hay documentos subidos.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {documents.map((doc) => (
            <li key={doc.id} style={{ marginBottom: "0.5rem" }}>
              <a href={doc.url} target="_blank" rel="noopener noreferrer">
                {doc.originalName || doc.url}
              </a>{" "}
              <button onClick={() => handleDeleteDocument(doc.id)}>Eliminar</button>
            </li>
          ))}
        </ul>
      )}

      <br />
      <Link href="/dashboard">Volver al Dashboard</Link>
      <br />
      <button onClick={() => signOut({ callbackUrl: '/login' })}>Cerrar sesión</button>

      <br />
      {/* Sección para eliminar la cuenta */}
      <div style={{ marginTop: '2rem', borderTop: '1px solid red', paddingTop: '1rem' }}>
        <button onClick={handleDeleteAccount} style={{ backgroundColor: 'red', color: 'white', padding: '0.5rem 1rem' }}>
          Eliminar Cuenta
        </button>
      </div>
    </div>
  );
}
