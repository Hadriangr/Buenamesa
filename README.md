# Sistema de Ticketera Escolar - Buenamesa

Sistema offline de gestión de tickets de almuerzo para instituciones educativas, desarrollado con Next.js y diseñado para funcionar sin conexión a internet.

## 📋 Descripción

Este sistema permite a los estudiantes generar tickets de almuerzo mediante la validación de su RUT chileno, con un límite de un ticket por día por usuario. Incluye un panel administrativo completo para la gestión de usuarios y el seguimiento de tickets emitidos.

## 🚀 Características Principales

### Para Estudiantes
- ✅ Generación de tickets mediante RUT
- ✅ Validación automática de RUT chileno
- ✅ Teclado numérico virtual para dispositivos táctiles
- ✅ Impresión automática de tickets
- ✅ Límite de 1 ticket por día por usuario
- ✅ Interfaz intuitiva y responsive

### Para Administradores
- ✅ Panel de administración protegido por contraseña
- ✅ Importación masiva de usuarios via CSV
- ✅ Gestión de usuarios (bloquear/desbloquear/eliminar)
- ✅ Exportación de datos en formato CSV
- ✅ Visualización de estadísticas en tiempo real
- ✅ Sistema de sesiones con timeout automático
- ✅ Guía de uso integrada

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Next.js 15 (App Router)
- **UI**: React 18, Tailwind CSS, shadcn/ui
- **Validación**: Algoritmo de validación de RUT chileno
- **Almacenamiento**: LocalStorage (navegador)
- **Impresión**: API nativa del navegador
- **Tipado**: TypeScript

## 📁 Estructura del Proyecto

\`\`\`
ticketera-offline/
├── app/                          # App Router de Next.js
│   ├── page.tsx                 # Página principal (menú)
│   ├── ticket/page.tsx          # Página de generación de tickets
│   ├── admin/page.tsx           # Página del panel administrativo
│   ├── layout.tsx               # Layout principal
│   └── globals.css              # Estilos globales
├── components/                   # Componentes React
│   ├── admin-login.tsx          # Componente de login administrativo
│   ├── admin-panel.tsx          # Panel de administración principal
│   ├── ticket-generator.tsx     # Generador de tickets
│   ├── ticket-preview.tsx       # Vista previa de tickets
│   ├── numeric-keypad.tsx       # Teclado numérico virtual
│   ├── home-button.tsx          # Botón de navegación al inicio
│   └── ui/                      # Componentes UI de shadcn
├── lib/                         # Librerías y utilidades
│   ├── database.ts              # Simulación de base de datos
│   ├── rut-validator.ts         # Validador de RUT chileno
│   ├── csv-handler.ts           # Manejo de archivos CSV
│   └── utils.ts                 # Utilidades generales
├── hooks/                       # Custom hooks
│   └── use-admin-auth.ts        # Hook de autenticación administrativa
├── public/images/               # Imágenes de fondo
│   ├── background.png           # Fondo general
│   ├── background-menu.png      # Fondo del menú principal
│   └── background-ticket.png    # Fondo del generador de tickets
└── scripts/                     # Scripts SQL
    └── create-tables.sql        # Estructura de base de datos
\`\`\`

## 🔧 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Navegador web moderno

### Instalación

1. **Clonar el repositorio**
\`\`\`bash
git clone [URL_DEL_REPOSITORIO]
cd ticketera-offline
\`\`\`

2. **Instalar dependencias**
\`\`\`bash
npm install
# o
yarn install
\`\`\`

3. **Ejecutar en desarrollo**
\`\`\`bash
npm run dev
# o
yarn dev
\`\`\`

4. **Acceder al sistema**
- Aplicación: `http://localhost:3000`
- Panel Admin: `http://localhost:3000/admin`

### Configuración de Producción

\`\`\`bash
# Construir para producción
npm run build

# Ejecutar en producción
npm start
\`\`\`

## 💾 Base de Datos

El sistema utiliza **LocalStorage** del navegador como base de datos, simulando una estructura SQL:

### Tabla: usuarios
\`\`\`sql
CREATE TABLE usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rut VARCHAR(12) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    curso VARCHAR(100) NOT NULL,
    bloqueado BOOLEAN DEFAULT FALSE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

### Tabla: tickets
\`\`\`sql
CREATE TABLE tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    rut VARCHAR(12) NOT NULL,
    fecha_emision DATE NOT NULL,
    hora_emision TIME NOT NULL,
    fecha_hora_completa DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    UNIQUE(rut, fecha_emision)
);
\`\`\`

## 📊 Formato de Datos CSV

### Importación de Usuarios
\`\`\`csv
Tickets totales: 150
ID,Fecha y hora,RUT,Nombre,Curso
1,"2024-01-15 12:30","12345678-9","Juan Pérez","8° Básico"
2,"2024-01-15 12:31","98765432-1","María González","7° Básico"
\`\`\`

### Exportación de Tickets
\`\`\`csv
3
ID,Fecha y Hora,RUT,Nombre,Curso
1,"2024-01-15 12:30","12.345.678-9","Juan Pérez","8° Básico"
2,"2024-01-15 12:31","98.765.432-1","María González","7° Básico"
\`\`\`

## 🔐 Seguridad

### Autenticación Administrativa
- **Contraseña**: `Bu3names425*`
- **Sesión**: Expira tras 1 minuto de inactividad
- **Detección de actividad**: Mouse, teclado, scroll, touch
- **Notificación**: Alert automático al expirar sesión

### Validaciones
- **RUT**: Algoritmo de validación chileno completo
- **Unicidad**: Un ticket por día por usuario
- **Formato**: Validación estricta de datos CSV

## 🖨️ Compatibilidad de Impresión

### Impresoras Soportadas
- ✅ Epson TM-T20II (recomendada)
- ✅ Cualquier impresora térmica compatible
- ✅ Impresoras de escritorio estándar

### Configuración de Impresión
- **Formato**: Ticket de 300px de ancho
- **Fuente**: Courier New (monospace)
- **Contenido**: ID, Nombre, RUT, Curso, Fecha, Hora
- **Auto-impresión**: Se ejecuta automáticamente

## 🎨 Personalización Visual

### Fondos Personalizables
- `background.png`: Fondo general del sistema
- `background-menu.png`: Fondo del menú principal  
- `background-ticket.png`: Fondo del generador de tickets

### Colores de Marca
- **Verde**: `#16a34a` (botones principales)
- **Azul**: `#2563eb` (administración)
- **Rojo**: `#dc2626` (alertas y bloqueos)

## 🔍 Debugging y Troubleshooting

### Herramientas de Debug
1. **Consola del navegador**: `F12 > Console`
2. **Debug RUTs**: Botón en panel admin > Configuración
3. **LocalStorage**: `F12 > Application > Local Storage`

### Problemas Comunes

| Problema | Causa | Solución |
|----------|-------|----------|
| Usuario no encontrado | RUT no está en BD | Verificar importación CSV |
| RUT inválido | Formato incorrecto | Validar dígito verificador |
| Ticket ya retirado | Límite diario alcanzado | Esperar al día siguiente |
| Error de impresión | Impresora no configurada | Verificar conexión |
| Sesión expirada | Inactividad > 1 minuto | Volver a iniciar sesión |

### Logs del Sistema
\`\`\`javascript
// Ver usuarios cargados
console.log(JSON.parse(localStorage.getItem('ticketera_usuarios')))

// Ver tickets emitidos
console.log(JSON.parse(localStorage.getItem('ticketera_tickets')))

// Limpiar datos (¡CUIDADO!)
localStorage.removeItem('ticketera_usuarios')
localStorage.removeItem('ticketera_tickets')
\`\`\`

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

### Características Móviles
- Teclado numérico virtual
- Botones táctiles optimizados
- Navegación simplificada
- Fondos adaptativos

## 🚀 Deployment

### Vercel (Recomendado)
\`\`\`bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
\`\`\`

### Otros Proveedores
- **Netlify**: Compatible con build estático
- **GitHub Pages**: Requiere configuración adicional
- **Servidor propio**: Usar `npm run build` + servidor web

## 🔄 Actualizaciones y Mantenimiento

### Backup de Datos
\`\`\`javascript
// Exportar datos completos
const backup = {
  usuarios: JSON.parse(localStorage.getItem('ticketera_usuarios') || '[]'),
  tickets: JSON.parse(localStorage.getItem('ticketera_tickets') || '[]'),
  fecha: new Date().toISOString()
}
console.log(JSON.stringify(backup, null, 2))
\`\`\`

### Migración de Datos
1. Exportar datos actuales via CSV
2. Actualizar sistema
3. Reimportar datos via panel admin

## 📞 Soporte

### Para Administradores
- Consultar pestaña "Uso" en el panel administrativo
- Revisar esta documentación
- Usar herramientas de debug integradas

### Para Desarrolladores
- Revisar código fuente comentado
- Consultar logs en consola del navegador
- Verificar estructura de datos en LocalStorage

## 📄 Licencia

Este proyecto está desarrollado para uso interno de instituciones educativas.

---

**Desarrollado para Buenamesa - Peñalolén**  
*Sistema de Ticketera Escolar v1.0*
