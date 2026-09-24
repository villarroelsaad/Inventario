// Íconos de trazo simple usados en toda la app. Son decorativos: el texto o el
// aria-label del control que los contiene es lo que se lee en voz alta.
const TRAZOS = {
  caja: <><path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" /><path d="m3 8 9 5 9-5M12 13v8" /></>,
  alerta: <><path d="M10.3 3.9 2.4 17.5A2 2 0 0 0 4.1 20.5h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" /></>,
  proveedor: <><path d="M3 7h18l-1.5 11a2 2 0 0 1-2 1.8H6.5a2 2 0 0 1-2-1.8L3 7Z" /><path d="M8 7V5a4 4 0 0 1 8 0v2" /></>,
  dinero: <><rect x="2.5" y="6" width="19" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /><path d="M6 12h.01M18 12h.01" /></>,
  categoria: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  codigo: <><path d="M4 6v12M8 6v12M11 6v12M15 6v12M17.5 6v12M20 6v12" /></>,
  texto: <><path d="M4 7V5h16v2M9 19h6M12 5v14" /></>,
  entrada: <><path d="M12 4v12m0 0-5-5m5 5 5-5" /><path d="M5 20h14" /></>,
  salida: <><path d="M12 20V8m0 0-5 5m5-5 5 5" /><path d="M5 4h14" /></>,
  cerrar: <><path d="M6 6l12 12M18 6 6 18" /></>,
  camara: <><rect x="3" y="7" width="18" height="12" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><circle cx="12" cy="13" r="2.5" /></>,
  foto: <><rect x="3" y="4" width="18" height="16" rx="2.5" /><circle cx="9" cy="10" r="2" /><path d="m21 16-5-5-9 9" /></>,
  telefono: <><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z" /></>,
  nota: <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z" /><path d="M14 3v6h6M8 13h8M8 17h5" /></>,
  check: <><path d="m5 12.5 4.5 4.5L19 7.5" /></>,
  mas: <><path d="M12 5v14M5 12h14" /></>,
  menos: <><path d="M5 12h14" /></>,
  editar: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></>,
  exportar: <><path d="M12 3v13m0 0-4-4m4 4 4-4M4 19h16" /></>
}

export default function Icono ({ nombre, className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {TRAZOS[nombre]}
    </svg>
  )
}
