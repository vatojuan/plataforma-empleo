import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import axios from "axios";
import { useSession, signOut } from "next-auth/react";
<<<<<<< HEAD
import DashboardLayout from "../components/DashboardLayout";
import ProfileImage from "../components/ProfileImage";
import { IconButton, LinearProgress } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Divider,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
=======
>>>>>>> 23938c6 (Commit sibida de archivos a google y bugs del perfil)

export default function ProfileEmpleador() {
  const { data: session, status } = useSession();
  const router = useRouter();
<<<<<<< HEAD

  // Estados para el perfil
  const [name, setName] = useState(session?.user?.name || "");
  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  // Para la imagen de perfil
  const [selectedProfileImage, setSelectedProfileImage] = useState(null);
  const [profileImageMessage, setProfileImageMessage] = useState("");

  // Para los documentos legales
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Snackbar para notificaciones
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Diálogo para eliminar documento
  const [openDocDeleteDialog, setOpenDocDeleteDialog] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState(null);

  // Diálogo para eliminar cuenta
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // Cargar perfil desde la API de empleador
=======

  // Estados para el perfil
  const [name, setName] = useState(session?.user?.name || "");
  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  // Para la imagen de perfil
  const [selectedProfileImage, setSelectedProfileImage] = useState(null);
  const [profileImageMessage, setProfileImageMessage] = useState("");

  // Para los documentos legales
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [documents, setDocuments] = useState([]);

  // Cargar perfil desde la API
>>>>>>> 23938c6 (Commit sibida de archivos a google y bugs del perfil)
  useEffect(() => {
    if (session) {
      axios
        .get("/api/employer/profile")
        .then((res) => {
          const data = res.data;
          setName(data.name || "");
          setCompanyName(data.companyName || "");
          setDescription(data.description || "");
          setPhone(data.phone || "");
        })
        .catch((err) => console.error("Error al cargar el perfil:", err));
    }
  }, [session]);

  // Cargar documentos legales
  useEffect(() => {
    if (session) {
      axios
        .get("/api/employer/documents")
        .then((res) => {
          setDocuments(res.data.documents);
        })
        .catch((err) => console.error("Error al cargar documentos:", err));
    }
  }, [session]);

<<<<<<< HEAD
  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/login");
    }
  }, [session, status, router]);
=======
  if (status === "loading" || !session) {
    return <p>Cargando...</p>;
  }
>>>>>>> 23938c6 (Commit sibida de archivos a google y bugs del perfil)

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
<<<<<<< HEAD
      await axios.put("/api/employer/profile", { name, companyName, description, phone });
      setSnackbar({ open: true, message: "Perfil actualizado exitosamente", severity: "success" });
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error("Error actualizando el perfil:", error);
      setSnackbar({ open: true, message: "Error actualizando el perfil", severity: "error" });
=======
      await axios.put("/api/employer/profile", {
        name,
        companyName,
        description,
        phone,
      });
      alert("Perfil actualizado exitosamente");
      // Forzamos un reload completo de la página para refrescar la sesión y mostrar los datos actualizados
      window.location.reload();
    } catch (error) {
      console.error("Error actualizando el perfil:", error);
      alert("Error actualizando el perfil");
>>>>>>> 23938c6 (Commit sibida de archivos a google y bugs del perfil)
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  const handleProfileImageUpload = async (file) => {
    const imageFile = file || selectedProfileImage;
    if (!imageFile) {
      setProfileImageMessage("Por favor, selecciona una imagen.");
      return;
    }
    const formData = new FormData();
    formData.append("profilePicture", imageFile);
    try {
      const res = await axios.post("/api/employer/upload-profile-picture", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfileImageMessage("Imagen de perfil actualizada correctamente.");
      setSnackbar({ open: true, message: "Imagen actualizada", severity: "success" });
      setTimeout(() => window.location.reload(), 1500);
      console.log("Imagen actualizada:", res.data.user.profilePicture);
    } catch (error) {
      console.error("Error actualizando la imagen de perfil:", error);
      setProfileImageMessage("Error al actualizar la imagen de perfil.");
      setSnackbar({ open: true, message: "Error actualizando imagen", severity: "error" });
    }
  };

  // Subida automática del documento al seleccionar el archivo (documentos legales)
  const handleDocumentFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedDocument(file);
    setUploading(true);
    const formData = new FormData();
    formData.append("document", file);
    // Enviar el userId obtenido de la sesión
    if (session && session.user && session.user.id) {
      formData.append("userId", session.user.id);
    }
    try {
      const res = await axios.post("/api/employer/upload-document", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadMessage("Documento subido correctamente.");
      setSnackbar({ open: true, message: "Documento subido", severity: "success" });
      const updatedDocs = await axios.get("/api/employer/documents");
      setDocuments(updatedDocs.data.documents);
    } catch (error) {
      console.error("Error al subir el documento:", error);
      setUploadMessage("Error al subir el documento.");
      setSnackbar({ open: true, message: "Error subiendo documento", severity: "error" });
    } finally {
      setUploading(false);
    }
  };

  const handleRequestDeleteDocument = (documentId) => {
    setSelectedDocId(documentId);
    setOpenDocDeleteDialog(true);
  };

  const confirmDeleteDocument = async () => {
    try {
      await axios.delete("/api/employer/delete-document", { data: { documentId: selectedDocId } });
      const updatedDocs = await axios.get("/api/employer/documents");
      setDocuments(updatedDocs.data.documents);
      setSnackbar({ open: true, message: "Documento eliminado correctamente", severity: "success" });
    } catch (error) {
      console.error("Error al eliminar el documento:", error);
      setSnackbar({ open: true, message: "Error al eliminar el documento", severity: "error" });
    } finally {
      setOpenDocDeleteDialog(false);
      setSelectedDocId(null);
    }
  };

  const cancelDeleteDocument = () => {
    setOpenDocDeleteDialog(false);
    setSelectedDocId(null);
  };

  const handleDeleteAccount = async () => {
    if (confirm("¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.")) {
      try {
        const res = await axios.delete("/api/user/delete");
        if (res.status === 200) {
          setSnackbar({ open: true, message: "Cuenta eliminada correctamente", severity: "success" });
          await signOut({ redirect: false });
          router.push("/login");
        }
=======
  const handleProfileImageChange = (e) => {
    setSelectedProfileImage(e.target.files[0]);
  };

  const handleProfileImageUpload = async (e) => {
    e.preventDefault();
    if (!selectedProfileImage) {
      setProfileImageMessage("Por favor, selecciona una imagen.");
      return;
    }
    const formData = new FormData();
    formData.append("profilePicture", selectedProfileImage);

    try {
      const res = await axios.post("/api/employer/upload-profile-picture", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfileImageMessage("Imagen de perfil actualizada correctamente.");
      window.location.reload();
      console.log("Imagen actualizada:", res.data.user.profilePicture);
    } catch (error) {
      console.error("Error actualizando la imagen de perfil:", error);
      setProfileImageMessage("Error al actualizar la imagen de perfil.");
    }
  };

  const handleDocumentFileChange = (e) => {
    setSelectedDocument(e.target.files[0]);
  };

  const handleDocumentUpload = async (e) => {
    e.preventDefault();
    if (!selectedDocument) {
      setUploadMessage("Por favor, selecciona un archivo primero.");
      return;
    }
    const formData = new FormData();
    formData.append("document", selectedDocument);

    try {
      const res = await axios.post("/api/employer/upload-document", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadMessage("Documento subido correctamente.");
      console.log("Documento:", res.data.document);
      const updatedDocs = await axios.get("/api/employer/documents");
      setDocuments(updatedDocs.data.documents);
    } catch (error) {
      console.error("Error subiendo el documento:", error);
      setUploadMessage("Error al subir el documento.");
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (confirm("¿Estás seguro de que deseas eliminar este documento?")) {
      try {
        await axios.delete("/api/employer/delete-document", { data: { documentId } });
        const updatedDocs = await axios.get("/api/employer/documents");
        setDocuments(updatedDocs.data.documents);
        alert("Documento eliminado correctamente.");
>>>>>>> 23938c6 (Commit sibida de archivos a google y bugs del perfil)
      } catch (error) {
        console.error("Error al eliminar la cuenta:", error);
        setSnackbar({ open: true, message: "Error al eliminar la cuenta", severity: "error" });
      }
    }
  };

  // Función para eliminar la cuenta completa
  const handleDeleteAccount = async () => {
    if (
      confirm("¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.")
    ) {
      try {
        const res = await axios.delete("/api/user/delete");
        if (res.status === 200) {
          alert("Cuenta eliminada correctamente");
          await signOut({ redirect: false });
          router.push("/login");
        }
      } catch (error) {
        console.error("Error eliminando la cuenta:", error);
        alert("Error al eliminar la cuenta.");
      }
    }
  };

  return (
<<<<<<< HEAD
    <DashboardLayout userRole={session?.user?.role || "empleador"}>
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Perfil de Empleador
        </Typography>
        <Box sx={{ mb: 2 }}>
          <ProfileImage
            currentImage={session?.user?.profilePicture || "/images/default-user.png"}
            onImageSelected={(file) => handleProfileImageUpload(file)}
          />
        </Box>
        <Paper sx={{ maxWidth: 500, mx: "auto", p: 3 }}>
          <Box component="form" onSubmit={handleProfileUpdate} noValidate>
            <TextField
              label="Nombre"
              fullWidth
              margin="normal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <TextField
              label="Nombre de la Empresa"
              fullWidth
              margin="normal"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
            <TextField
              label="Descripción"
              fullWidth
              margin="normal"
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <TextField
              label="Teléfono"
              fullWidth
              margin="normal"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <Button type="submit" variant="contained" color="primary" disabled={loading} sx={{ mt: 2 }}>
              {loading ? "Actualizando..." : "Actualizar Perfil"}
            </Button>
          </Box>
        </Paper>
        <Divider sx={{ my: 3 }} />
        <Paper sx={{ maxWidth: 500, mx: "auto", p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Subir Archivo De Interes(Opcional)
          </Typography>
          <Button variant="contained" component="label" sx={{ mt: 1 }}>
            Seleccionar Archivo
            <input type="file" hidden onChange={handleDocumentFileChange} accept=".pdf,.doc,.docx,.jpg,.png" />
          </Button>
          {uploading && <LinearProgress sx={{ mt: 2 }} />}
          {uploadMessage && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {uploadMessage}
            </Typography>
          )}
        </Paper>
        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Archivos
        </Typography>
        {documents.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No hay documentos subidos.
          </Typography>
        ) : (
          <Box component="ul" sx={{ listStyle: "none", p: 0, maxWidth: 500, mx: "auto" }}>
            {documents.map((doc) => (
              <Box component="li" key={doc.id} sx={{ mb: 1, display: "flex", alignItems: "center" }}>
                <Typography variant="body2" sx={{ flexGrow: 1 }}>
                  <a
                    href="#"
                    onClick={async (e) => {
                      e.preventDefault();
                      try {
                        const res = await axios.get(
                          `/api/employer/get-signed-url?fileName=${encodeURIComponent(doc.fileKey)}`
                        );
                        if (!res.data || !res.data.url) {
                          throw new Error("Error al obtener la URL firmada");
                        }
                        window.open(res.data.url, "_blank");
                      } catch (error) {
                        console.error("Error al descargar el documento:", error);
                      }
                    }}
                    style={{ textDecoration: "none", color: "#1976d2", cursor: "pointer" }}
                  >
                    {doc.originalName || "Documento"}
                  </a>
                </Typography>
                <IconButton color="error" onClick={() => { setSelectedDocId(doc.id); setOpenDocDeleteDialog(true); }}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}
        <Divider sx={{ my: 3 }} />
        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Link href="/dashboard" style={{ textDecoration: "none" }}>
            <Button variant="contained" color="primary">
              Volver al Dashboard
            </Button>
          </Link>
        </Box>
        <Box sx={{ mt: 4, textAlign: "center", borderTop: "1px solid red", pt: 2 }}>
          <Button onClick={handleDeleteAccount} variant="contained" color="warning">
            Eliminar Cuenta
          </Button>
        </Box>
      </Box>
=======
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
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
          <label>Nombre de la Empresa:</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
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
        <div>
          <label>Teléfono:</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Actualizando..." : "Actualizar Perfil"}
        </button>
      </form>
>>>>>>> 23938c6 (Commit sibida de archivos a google y bugs del perfil)

      <Dialog open={openDocDeleteDialog} onClose={cancelDeleteDocument}>
        <DialogTitle>Confirmar Eliminación de Documento</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar este documento?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDeleteDocument} color="primary">
            Cancelar
          </Button>
          <Button onClick={confirmDeleteDocument} color="secondary" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

<<<<<<< HEAD
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            width: "100%",
            bgcolor: (theme) =>
              snackbar.severity === "success"
                ? theme.palette.secondary.main
                : snackbar.severity === "error"
                ? theme.palette.error.main
                : theme.palette.info.main,
            color: "#fff",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardLayout>
=======
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
      {/* Listado de documentos legales */}
      <h2>Documentos Legales</h2>
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
      <button onClick={() => signOut({ callbackUrl: "/login" })}>Cerrar sesión</button>

      <br />
      {/* Sección para eliminar la cuenta */}
      <div style={{ marginTop: "2rem", borderTop: "1px solid red", paddingTop: "1rem" }}>
        <button
          onClick={handleDeleteAccount}
          style={{ backgroundColor: "red", color: "white", padding: "0.5rem 1rem" }}
        >
          Eliminar Cuenta
        </button>
      </div>
    </div>
>>>>>>> 23938c6 (Commit sibida de archivos a google y bugs del perfil)
  );
}
