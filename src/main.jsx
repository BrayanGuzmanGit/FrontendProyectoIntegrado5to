import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' /* Estilos globales y variables CSS */
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// const token="eyJhbGciOiJFUzI1NiIsImtpZCI6IjE4MTBlMTJiLTI2NDUtNGZhNy04MzRmLTNhYTRlYTBjYzkyMCIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3Fjdnpwend3dXNjdmVtdGxlcHhpLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI2OWI5ZGU3Ny05OTIwLTQ3ZDctYWYyYi1hZjliNTI3NDZlM2QiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzc4OTgwNzAwLCJpYXQiOjE3Nzg5NzcxMDAsImVtYWlsIjoiYnJheWFucHJvZHVjdG9yQGdtYWlsLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZW1haWwiOiJicmF5YW5wcm9kdWN0b3JAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic3ViIjoiNjliOWRlNzctOTkyMC00N2Q3LWFmMmItYWY5YjUyNzQ2ZTNkIn0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3Nzg5NzcxMDB9XSwic2Vzc2lvbl9pZCI6ImY3MzE5MTA2LWU5OTUtNGQyZS1hYTAwLTBkZDYzZWQ3MzNjMiIsImlzX2Fub255bW91cyI6ZmFsc2V9.Tfk4YOtR8DDhUiZpE1xvogzkkiRXsRXH2U0HGyDyYJiGWjy-t4myIL1jfy9fKnAxebhmj8CETpub2xjfg5BnjA"
// try {
//     const response = await fetch(`http://localhost:3002/api/inspections/solicitudes`, {
//       method: 'GET',
//       headers: { 'Authorization': 'Bearer ' + token }
//     });
//     const result = await response.json();
//     console.log('Perfil obtenido de Entities Service:', result);
//   } catch(e) {
//     console.error('Error de autorización:', e.message);
//   }

//   const formData = {
//     "numero_lote": "CUL-001",
//     "area": 0,
//     "cantidad_plantas": 100,
//     "uidlugarproduccion": "f07d4749-6897-4344-835a-d90bb0e74cec",
//     "uidcultivo": "CUL-001"
//   }
// try {
//     const response = await fetch(`http://localhost:3001/api/locations/lotes`, {
//       method: 'POST',
//       headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
//       body: JSON.stringify(formData),
//     });
//     const result = await response.json();
//     console.log('Solicitud registrada:', result);
//   } catch(e) {
//     console.error('Error de autorización:', e.message);
//   }