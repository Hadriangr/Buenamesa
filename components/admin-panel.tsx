"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Upload,
  Download,
  Users,
  Ticket,
  Lock,
  Unlock,
  Trash2,
  AlertCircle,
  LogOut,
  Home,
  HelpCircle,
  Database,
} from "lucide-react"
import { db, type Usuario, type Ticket as TicketType } from "@/lib/database"
import { formatearRut } from "@/lib/rut-validator"
import { parsearCSVUsuarios, generarCSVTickets, descargarCSV } from "@/lib/csv-handler"
import AdminLogin from "./admin-login"
import { useAdminAuth } from "@/hooks/use-admin-auth"
import Link from "next/link"

export default function AdminPanel() {
  const { isAuthenticated, loading, login, logout, updateActivity, sessionExpired } = useAdminAuth()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [tickets, setTickets] = useState<TicketType[]>([])
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState("")
  const [fechaExportacion, setFechaExportacion] = useState("")
  const [mostrarCalendario, setMostrarCalendario] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      cargarDatos()
    }
  }, [isAuthenticated])

  // Si está cargando la verificación de autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  // Si no está autenticado, mostrar login
  if (!isAuthenticated) {
    return <AdminLogin onLogin={login} />
  }

  const cargarDatos = async () => {
    try {
      const [usuariosData, ticketsData] = await Promise.all([db.obtenerTodosUsuarios(), db.obtenerTodosTickets()])
      setUsuarios(usuariosData)
      setTickets(ticketsData)
      updateActivity() // Actualizar actividad al cargar datos
    } catch (error) {
      setMensaje("Error al cargar datos")
    }
  }

  const toggleBloqueoUsuario = async (usuario: Usuario) => {
    try {
      await db.actualizarUsuario(usuario.id, { bloqueado: !usuario.bloqueado })
      await cargarDatos()
      setMensaje(`Usuario ${usuario.bloqueado ? "desbloqueado" : "bloqueado"} exitosamente`)
      updateActivity()
    } catch (error) {
      setMensaje("Error al actualizar usuario")
    }
  }

  const eliminarUsuario = async (id: number) => {
    if (!confirm("¿Está seguro de eliminar este usuario?")) return

    try {
      await db.eliminarUsuario(id)
      await cargarDatos()
      setMensaje("Usuario eliminado exitosamente")
      updateActivity()
    } catch (error) {
      setMensaje("Error al eliminar usuario")
    }
  }

  const handleImportarCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setCargando(true)
    setMensaje("")

    try {
      const text = await file.text()
      console.log("Contenido del CSV:", text.substring(0, 500)) // Para debug

      const usuariosCSV = parsearCSVUsuarios(text)
      console.log("Usuarios parseados:", usuariosCSV) // Para debug

      if (usuariosCSV.length === 0) {
        setMensaje("No se encontraron usuarios válidos en el archivo CSV. Verifique el formato.")
        return
      }

      await db.importarUsuarios(usuariosCSV)
      await cargarDatos()

      setMensaje(`${usuariosCSV.length} usuarios importados exitosamente`)
      updateActivity()
    } catch (error) {
      console.error("Error al importar CSV:", error)
      setMensaje(`Error al importar CSV: ${error instanceof Error ? error.message : "Error desconocido"}`)
    } finally {
      setCargando(false)
      event.target.value = ""
    }
  }

  const exportarTicketsCSV = async (fechaEspecifica?: string) => {
    try {
      let ticketsAExportar = tickets
      let nombreArchivo = "tickets_todos"

      if (fechaEspecifica) {
        ticketsAExportar = tickets.filter((t) => t.fecha_emision === fechaEspecifica)
        const [año, mes, dia] = fechaEspecifica.split("-")
        nombreArchivo = `tickets_${dia}-${mes}-${año}`
      } else {
        const hoy = new Date()
        const dia = hoy.getDate().toString().padStart(2, "0")
        const mes = (hoy.getMonth() + 1).toString().padStart(2, "0")
        const año = hoy.getFullYear()
        nombreArchivo = `tickets_${dia}-${mes}-${año}`
      }

      const csvContent = generarCSVTickets(ticketsAExportar, usuarios)
      descargarCSV(csvContent, `${nombreArchivo}.csv`)
      setMensaje(`CSV exportado exitosamente: ${ticketsAExportar.length} tickets`)
      setMostrarCalendario(false)
      updateActivity()
    } catch (error) {
      setMensaje("Error al exportar CSV")
    }
  }

  const limpiarUsuarios = async () => {
    if (
      !confirm(
        "¿Está seguro de eliminar TODOS los usuarios?\n\nLos tickets se mantendrán con todos sus datos completos (nombre, curso, etc.).\n\nEsta acción no se puede deshacer.",
      )
    )
      return

    try {
      // Usar el método correcto de la base de datos
      await db.limpiarSoloUsuarios()
      await cargarDatos()
      setMensaje("Todos los usuarios han sido eliminados. Los tickets se mantuvieron con datos completos.")
      updateActivity()
    } catch (error) {
      setMensaje("Error al limpiar usuarios")
    }
  }

  const ticketsHoy = tickets.filter((t) => {
    const hoy = new Date().toISOString().split("T")[0]
    return t.fecha_emision === hoy
  })

  return (
    <div
      className="min-h-screen bg-no-repeat"
      style={{
        backgroundImage: "url('/images/background.png')",
        backgroundSize: "100% 100%",
        backgroundPosition: "center center",
      }}
    >
      <div className="min-h-screen bg-black bg-opacity-20 px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
              <p className="text-gray-600">Gestión de usuarios y tickets del sistema</p>
            </div>
            <div className="flex items-center space-x-3">
              {/* Botón Home reubicado */}
              <Link href="/">
                <Button variant="outline" className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm">
                  <Home className="h-4 w-4" />
                  <span>Inicio</span>
                </Button>
              </Link>
              <Button variant="outline" onClick={logout} className="flex items-center space-x-2 bg-transparent">
                <LogOut className="h-4 w-4" />
                <span>Cerrar Sesión</span>
              </Button>
            </div>
          </div>

          {mensaje && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{mensaje}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="shadow-xl bg-white/95 backdrop-blur-sm border-2 border-white/50">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                    <p className="text-2xl font-bold text-gray-900">{usuarios.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl bg-white/95 backdrop-blur-sm border-2 border-white/50">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Ticket className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tickets Hoy</p>
                    <p className="text-2xl font-bold text-gray-900">{ticketsHoy.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl bg-white/95 backdrop-blur-sm border-2 border-white/50">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Lock className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Usuarios Bloqueados</p>
                    <p className="text-2xl font-bold text-gray-900">{usuarios.filter((u) => u.bloqueado).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="usuarios" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white/90 backdrop-blur-sm border-2 border-white/50 shadow-lg rounded-lg p-1">
              <TabsTrigger
                value="usuarios"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 rounded-md font-semibold"
              >
                Usuarios
              </TabsTrigger>
              <TabsTrigger
                value="tickets"
                className="data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 rounded-md font-semibold"
              >
                Tickets
              </TabsTrigger>
              <TabsTrigger
                value="uso"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 rounded-md font-semibold"
              >
                Instrucciones
              </TabsTrigger>
              <TabsTrigger
                value="configuracion"
                className="data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 rounded-md font-semibold"
              >
                Configuración
              </TabsTrigger>
            </TabsList>

            <TabsContent value="usuarios">
              <Card className="shadow-xl bg-white/95 backdrop-blur-sm border-2 border-white/50">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Gestión de Usuarios</CardTitle>
                      <CardDescription>Administre los usuarios del sistema</CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" onClick={() => document.getElementById("csv-input")?.click()}>
                        <Upload className="h-4 w-4 mr-2" />
                        Importar CSV
                      </Button>
                      <input id="csv-input" type="file" accept=".csv" onChange={handleImportarCSV} className="hidden" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>RUT</TableHead>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Curso</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {usuarios.map((usuario) => (
                          <TableRow key={usuario.id}>
                            <TableCell className="font-mono">{formatearRut(usuario.rut)}</TableCell>
                            <TableCell>{usuario.nombre}</TableCell>
                            <TableCell>{usuario.curso}</TableCell>
                            <TableCell>
                              <Badge variant={usuario.bloqueado ? "destructive" : "default"}>
                                {usuario.bloqueado ? "Bloqueado" : "Activo"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline" onClick={() => toggleBloqueoUsuario(usuario)}>
                                  {usuario.bloqueado ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => eliminarUsuario(usuario.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tickets">
              <Card className="shadow-xl bg-white/95 backdrop-blur-sm border-2 border-white/50">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Registro de Tickets</CardTitle>
                      <CardDescription>Historial de tickets generados</CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={() => exportarTicketsCSV()}>
                        <Download className="h-4 w-4 mr-2" />
                        Exportar Hoy
                      </Button>
                      <Button variant="outline" onClick={() => setMostrarCalendario(!mostrarCalendario)}>
                        <Download className="h-4 w-4 mr-2" />
                        Exportar Fecha
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Fecha y Hora</TableHead>
                          <TableHead>RUT</TableHead>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Curso</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tickets
                          .slice(-50)
                          .reverse()
                          .map((ticket) => (
                            <TableRow key={ticket.id}>
                              <TableCell>#{ticket.id}</TableCell>
                              <TableCell>
                                {ticket.fecha_emision} {ticket.hora_emision}
                              </TableCell>
                              <TableCell className="font-mono">{formatearRut(ticket.rut)}</TableCell>
                              <TableCell>{ticket.nombre}</TableCell>
                              <TableCell>{ticket.curso}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
                {mostrarCalendario && (
                  <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seleccionar fecha para exportar:
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="date"
                        value={fechaExportacion}
                        onChange={(e) => setFechaExportacion(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2"
                      />
                      <Button
                        onClick={() => exportarTicketsCSV(fechaExportacion)}
                        disabled={!fechaExportacion}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Exportar
                      </Button>
                      <Button variant="outline" onClick={() => setMostrarCalendario(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="uso">
              <Card className="shadow-xl bg-white/95 backdrop-blur-sm border-2 border-white/50">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <HelpCircle className="h-5 w-5 mr-2" />
                    Instrucciones de Uso del Sistema
                  </CardTitle>
                  <CardDescription>Manual de instrucciones para administradores</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Información sobre la base de datos */}
                  <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                    <h3 className="font-semibold text-green-800 mb-3 flex items-center">
                      <Database className="h-4 w-4 mr-2" />📊 Estructura de la Base de Datos
                    </h3>
                    <div className="text-sm text-green-700 space-y-2">
                      <p>
                        <strong>Base de datos normalizada con LocalStorage:</strong>
                      </p>
                      <div className="bg-white p-3 rounded border font-mono text-xs space-y-1">
                        <div>
                          <strong>Tabla usuarios:</strong> id, rut, nombre, curso, bloqueado, fecha_creacion
                        </div>
                        <div>
                          <strong>Tabla tickets:</strong> id, usuario_id, rut, nombre*, curso*, fecha_emision,
                          hora_emision
                        </div>
                        <div className="text-green-600">* Datos desnormalizados para mantener historial completo</div>
                      </div>
                      <p>
                        <strong>Ventaja:</strong> Al eliminar usuarios, los tickets mantienen todos los datos (nombre,
                        curso) para el historial completo.
                      </p>
                    </div>
                  </div>

                  {/* Sección: Importar Usuarios */}
                  <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                    <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                      <Upload className="h-4 w-4 mr-2" />
                      1. Importar Usuarios desde CSV
                    </h3>
                    <div className="text-sm text-blue-700 space-y-2">
                      <p>
                        <strong>Formato requerido del CSV:</strong>
                      </p>
                      <div className="bg-white p-2 rounded border font-mono text-xs">
                        Tickets totales: X<br />
                        ID,Fecha y hora,RUT,Nombre,Curso
                        <br />
                        1,"2024-01-15 12:30","12345678-9","Juan Pérez","8° Básico"
                      </div>
                      <p>
                        <strong>Pasos:</strong>
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Vaya a la pestaña "Usuarios"</li>
                        <li>Haga clic en "Importar CSV"</li>
                        <li>Seleccione su archivo CSV</li>
                        <li>El sistema validará y cargará los usuarios automáticamente</li>
                      </ul>
                    </div>
                  </div>

                  {/* Sección: Gestión de Usuarios */}
                  <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                    <h3 className="font-semibold text-green-800 mb-3 flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      2. Gestión de Usuarios
                    </h3>
                    <div className="text-sm text-green-700 space-y-2">
                      <p>
                        <strong>Acciones disponibles:</strong>
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>
                          <strong>Bloquear/Desbloquear:</strong> Use el ícono de candado para bloquear usuarios que no
                          han pagado
                        </li>
                        <li>
                          <strong>Eliminar:</strong> Use el ícono de papelera para eliminar usuarios (¡Cuidado! No se
                          puede deshacer)
                        </li>
                        <li>
                          <strong>Estados:</strong> Verde = Activo, Rojo = Bloqueado
                        </li>
                      </ul>
                      <p>
                        <strong>Nota:</strong> Los usuarios bloqueados no pueden generar tickets.
                      </p>
                    </div>
                  </div>

                  {/* Sección: Tickets */}
                  <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                    <h3 className="font-semibold text-purple-800 mb-3 flex items-center">
                      <Ticket className="h-4 w-4 mr-2" />
                      3. Sistema de Tickets
                    </h3>
                    <div className="text-sm text-purple-700 space-y-2">
                      <p>
                        <strong>Funcionamiento:</strong>
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>
                          Cada usuario puede generar <strong>solo 1 ticket por día</strong>
                        </li>
                        <li>Los tickets se imprimen automáticamente al generarse</li>
                        <li>El sistema valida RUT chileno automáticamente</li>
                        <li>Los tickets incluyen: ID, Nombre, RUT, Curso, Fecha y Hora</li>
                        <li>
                          <strong>Los tickets guardan datos completos del usuario al momento de creación</strong>
                        </li>
                      </ul>
                      <p>
                        <strong>Exportar datos:</strong> Use "Exportar CSV" para descargar el registro de tickets.
                      </p>
                    </div>
                  </div>

                  {/* Sección: Seguridad */}
                  <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                    <h3 className="font-semibold text-orange-800 mb-3 flex items-center">
                      <Lock className="h-4 w-4 mr-2" />
                      4. Seguridad del Sistema
                    </h3>
                    <div className="text-sm text-orange-700 space-y-2">
                      <p>
                        <strong>Sesión administrativa:</strong>
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>
                          La sesión se cierra automáticamente tras <strong>1 minuto de inactividad</strong>
                        </li>
                        <li>Cualquier actividad (clic, tecla, scroll) resetea el timer</li>
                        <li>Recibirá una notificación cuando la sesión expire</li>
                        <li>
                          Contraseña: <code className="bg-white px-1 rounded">Bu3names425*</code>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Sección: Solución de Problemas */}
                  <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <h3 className="font-semibold text-red-800 mb-3 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      5. Solución de Problemas Comunes
                    </h3>
                    <div className="text-sm text-red-700 space-y-2">
                      <p>
                        <strong>Problemas frecuentes:</strong>
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>
                          <strong>Usuario no encontrado:</strong> Verifique que el RUT esté en la base de datos y bien
                          escrito
                        </li>
                        <li>
                          <strong>Error al importar CSV:</strong> Verifique el formato exacto del archivo
                        </li>
                        <li>
                          <strong>Ticket ya retirado:</strong> Cada usuario solo puede retirar 1 ticket por día
                        </li>
                        <li>
                          <strong>Usuario bloqueado:</strong> Desbloquee al usuario desde la pestaña Usuarios
                        </li>
                        <li>
                          <strong>Problemas de impresión:</strong> Verifique que la impresora esté conectada y
                          configurada
                        </li>
                      </ul>
                      <p>
                        <strong>Debug:</strong> Use el botón "Debug RUTs en Consola" en Configuración para ver todos los
                        RUTs cargados.
                      </p>
                    </div>
                  </div>

                  {/* Sección: Datos del Sistema */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <Database className="h-4 w-4 mr-2" />
                      6. Información Técnica
                    </h3>
                    <div className="text-sm text-gray-700 space-y-2">
                      <ul className="list-disc list-inside space-y-1">
                        <li>
                          <strong>Almacenamiento:</strong> LocalStorage del navegador (normalizado)
                        </li>
                        <li>
                          <strong>Funcionamiento offline:</strong> No requiere conexión a internet
                        </li>
                        <li>
                          <strong>Compatibilidad:</strong> Funciona con impresoras Epson TM-T20II y otras
                        </li>
                        <li>
                          <strong>Respaldo:</strong> Exporte regularmente los datos en CSV
                        </li>
                        <li>
                          <strong>Límites:</strong> Sin límite de usuarios o tickets
                        </li>
                        <li>
                          <strong>Historial:</strong> Los tickets mantienen datos completos aunque se eliminen usuarios
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="configuracion">
              <Card className="shadow-xl bg-white/95 backdrop-blur-sm border-2 border-white/50">
                <CardHeader>
                  <CardTitle>Configuración del Sistema</CardTitle>
                  <CardDescription>Opciones avanzadas de administración</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <h3 className="font-semibold text-red-800 mb-2">Zona de Peligro</h3>
                    <p className="text-sm text-red-700 mb-4">
                      Esta acción eliminará todos los usuarios del sistema.{" "}
                      <strong>Los tickets se mantendrán con todos sus datos completos</strong> (nombre, curso, RUT,
                      etc.) para preservar el historial.
                    </p>
                    <Button
                      variant="destructive"
                      onClick={limpiarUsuarios}
                      disabled={cargando}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar Todos los Usuarios
                    </Button>
                  </div>

                  <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                    <h3 className="font-semibold text-blue-800 mb-2">Información del Sistema</h3>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p>• Total usuarios cargados: {usuarios.length}</p>
                      <p>• Total tickets creados: {tickets.length}</p>
                      <p>• Sesión administrativa: se cierra automáticamente tras 1 minuto de inactividad</p>
                      <p>• Límite: 1 ticket por día por usuario</p>
                      <p>
                        • <strong>Base de datos normalizada con datos desnormalizados en tickets</strong>
                      </p>
                    </div>

                    {/* Botón de debug */}
                    <Button
                      variant="outline"
                      className="mt-4 bg-transparent"
                      onClick={() => {
                        console.log("=== DEBUG USUARIOS ===")
                        usuarios.forEach((u, index) => {
                          console.log(`${index + 1}. RUT: "${u.rut}" | Nombre: "${u.nombre}" | Curso: "${u.curso}"`)
                        })
                        console.log("=== DEBUG TICKETS ===")
                        tickets.slice(-10).forEach((t, index) => {
                          console.log(
                            `${index + 1}. ID: ${t.id} | RUT: "${t.rut}" | Nombre: "${t.nombre}" | Curso: "${t.curso}"`,
                          )
                        })
                        setMensaje("Información de debug enviada a la consola del navegador")
                        updateActivity()
                      }}
                    >
                      Debug RUTs y Tickets en Consola
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
