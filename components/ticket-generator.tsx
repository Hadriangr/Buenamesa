"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Printer, AlertTriangle, CheckCircle } from "lucide-react"
import { db, type Usuario } from "@/lib/database"
import { validarRut, formatearRut, limpiarRut } from "@/lib/rut-validator"
import NumericKeypad from "./numeric-keypad"
import HomeButton from "./home-button"

export default function TicketGenerator() {
  const [rut, setRut] = useState("")
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [mensaje, setMensaje] = useState("")
  const [tipoMensaje, setTipoMensaje] = useState<"success" | "error" | "warning">("success")
  const [cargando, setCargando] = useState(false)
  const [mostrarTeclado, setMostrarTeclado] = useState(true)

  const buscarUsuario = async () => {
    if (!rut.trim()) {
      setMensaje("Por favor ingrese un RUT")
      setTipoMensaje("error")
      return
    }

    if (!validarRut(rut)) {
      setMensaje("RUT inválido. Verifique el formato.")
      setTipoMensaje("error")
      return
    }

    setCargando(true)
    try {
      const rutLimpio = limpiarRut(rut)
      console.log("RUT ingresado:", rut)
      console.log("RUT limpio para búsqueda:", rutLimpio)

      const usuarioEncontrado = await db.obtenerUsuarioPorRut(rutLimpio)
      console.log("Usuario encontrado:", usuarioEncontrado)

      if (!usuarioEncontrado) {
        setMensaje("Usuario no encontrado. Verifique el RUT o contacte al administrador.")
        setTipoMensaje("error")
        setUsuario(null)
        return
      }

      if (usuarioEncontrado.bloqueado) {
        setMensaje("Usuario bloqueado por falta de pago. Contacte administración.")
        setTipoMensaje("error")
        setUsuario(usuarioEncontrado)
        return
      }

      // Verificar si ya tiene ticket hoy - CRÍTICO
      const yaRetirado = await db.verificarTicketHoy(rutLimpio)
      if (yaRetirado) {
        setMensaje("Ya retiró su ticket del día. Solo se permite un ticket por día.")
        setTipoMensaje("warning")
        setUsuario(usuarioEncontrado)
        return
      }

      setUsuario(usuarioEncontrado)
      setMensaje("")

      // Generar ticket automáticamente
      await generarTicket(usuarioEncontrado)
    } catch (error) {
      console.error("Error en búsqueda:", error)
      setMensaje("Error al buscar usuario")
      setTipoMensaje("error")
    } finally {
      setCargando(false)
    }
  }

  const generarTicket = async (usuarioParam?: Usuario) => {
    const usuarioAUsar = usuarioParam || usuario
    if (!usuarioAUsar) return

    setCargando(true)
    try {
      // Verificar nuevamente antes de generar (doble verificación)
      const rutLimpio = limpiarRut(usuarioAUsar.rut)
      const yaRetirado = await db.verificarTicketHoy(rutLimpio)

      if (yaRetirado) {
        setMensaje("Ya retiró su ticket del día. Solo se permite un ticket por día.")
        setTipoMensaje("warning")
        setCargando(false)
        return
      }

      const ticket = await db.crearTicket(usuarioAUsar.id, usuarioAUsar.rut)

      // Imprimir directamente sin vista previa
      await imprimirTicketDirecto(usuarioAUsar, ticket.id)

      setMensaje(`Ticket #${ticket.id} generado e impreso exitosamente para ${usuarioAUsar.nombre}`)
      setTipoMensaje("success")

      // Limpiar formulario después de un momento
      setTimeout(() => {
        setRut("")
        setUsuario(null)
        setMensaje("")
      }, 3000)
    } catch (error) {
      console.error("Error al generar ticket:", error)
      setMensaje("Error al generar ticket")
      setTipoMensaje("error")
    } finally {
      setCargando(false)
    }
  }

  const imprimirTicketDirecto = async (usuario: Usuario, ticketId: number) => {
    // Simular tiempo de impresión
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Crear ventana de impresión directa
    const ventanaImpresion = window.open("", "_blank", "width=400,height=600")
    if (!ventanaImpresion) return

    const ahora = new Date()
    const fecha = ahora.toLocaleDateString("es-CL")
    const hora = ahora.toLocaleTimeString("es-CL", {
      hour: "2-digit",
      minute: "2-digit",
    })

    const contenidoHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Ticket #${ticketId}</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            margin: 0;
            padding: 20px;
            background: white;
            font-size: 12px;
            line-height: 1.4;
          }
          .ticket {
            width: 300px;
            margin: 0 auto;
            border: 2px dashed #333;
            padding: 15px;
            text-align: center;
          }
          .header {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
            border-bottom: 1px solid #333;
            padding-bottom: 5px;
          }
          .info {
            margin: 8px 0;
            text-align: left;
          }
          .info strong {
            display: inline-block;
            width: 80px;
          }
          .footer {
            margin-top: 15px;
            border-top: 1px solid #333;
            padding-top: 10px;
            font-size: 10px;
          }
          .ticket-id {
            font-size: 18px;
            font-weight: bold;
            margin: 10px 0;
          }
          @media print {
            body { margin: 0; padding: 0; }
            .ticket { border: none; }
          }
        </style>
      </head>
      <body>
        <div class="ticket">
          <div class="header">BUENAMESA - PEÑALOLÉN</div>
          <div class="ticket-id">#${ticketId.toString().padStart(6, "0")}</div>
          
          <div class="info">
            <strong>Nombre:</strong> ${usuario.nombre}
          </div>
          <div class="info">
            <strong>RUT:</strong> ${formatearRut(usuario.rut)}
          </div>
          <div class="info">
            <strong>Curso:</strong> ${usuario.curso}
          </div>
          <div class="info">
            <strong>Fecha:</strong> ${fecha}
          </div>
          <div class="info">
            <strong>Hora:</strong> ${hora}
          </div>
          
          <div class="footer">
            <div>Sistema de Ticketera Escolar</div>
            <div>Válido solo para el día de emisión</div>
          </div>
        </div>
        
        <script>
          // Auto-imprimir inmediatamente sin diálogo
          window.onload = function() {
            setTimeout(function() {
              // Usar comando directo de impresión
              if (window.print) {
                window.print();
              }
              // Cerrar ventana después de imprimir
              setTimeout(function() {
                window.close();
              }, 1000);
            }, 100);
          }
        </script>
      </body>
      </html>
    `

    ventanaImpresion.document.write(contenidoHTML)
    ventanaImpresion.document.close()
  }

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value
    setRut(formatearRut(valor))
    setMensaje("")
    setUsuario(null)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      buscarUsuario()
    }
  }

  const handleNumberClick = (number: string) => {
    const rutSinFormato = rut.replace(/[^0-9kK]/g, "")
    if (rutSinFormato.length < 9) {
      const nuevoRut = rutSinFormato + number.toLowerCase()
      setRut(formatearRut(nuevoRut))
      setMensaje("")
      setUsuario(null)
    }
  }

  const handleBackspace = () => {
    const rutSinFormato = rut.replace(/[^0-9kK]/g, "")
    if (rutSinFormato.length > 0) {
      const nuevoRut = rutSinFormato.slice(0, -1)
      setRut(formatearRut(nuevoRut))
      setMensaje("")
      setUsuario(null)
    }
  }

  const handleClear = () => {
    setRut("")
    setMensaje("")
    setUsuario(null)
  }

  return (
    <>
      <HomeButton />
      <div
        className="min-h-screen bg-no-repeat"
        style={{
          backgroundImage: "url('/images/background-ticket.png')",
          backgroundSize: "100% 100%",
          backgroundPosition: "center center",
        }}
      >
        <div className="min-h-screen bg-black bg-opacity-20 px-4 py-8 sm:px-6 lg:px-8 flex items-center justify-center">
          <div className="w-full max-w-md mx-auto">
            <Card className="shadow-2xl bg-white/95 backdrop-blur-sm border-2 border-white/50">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-gray-800">Ticket de Almuerzo</CardTitle>
                <CardDescription className="text-gray-600">
                  Ingrese su RUT para generar su ticket de almuerzo
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="rut" className="text-sm font-medium text-gray-700">
                    RUT
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      id="rut"
                      type="text"
                      placeholder="12.345.678-9"
                      value={rut}
                      onChange={handleRutChange}
                      onKeyPress={handleKeyPress}
                      className="flex-1 h-12 text-lg text-center font-mono"
                      maxLength={12}
                    />
                    <Button
                      onClick={buscarUsuario}
                      disabled={cargando}
                      className="h-12 px-6 bg-green-600 hover:bg-green-700"
                    >
                      {cargando ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <Printer className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Teclado numérico - siempre visible */}
                <div className="space-y-3">
                  <NumericKeypad
                    onNumberClick={handleNumberClick}
                    onBackspace={handleBackspace}
                    onClear={handleClear}
                  />
                </div>

                {mensaje && (
                  <Alert
                    className={
                      tipoMensaje === "error"
                        ? "border-red-200 bg-red-50"
                        : tipoMensaje === "warning"
                          ? "border-yellow-200 bg-yellow-50"
                          : "border-green-200 bg-green-50"
                    }
                  >
                    {tipoMensaje === "error" && <AlertTriangle className="h-4 w-4 text-red-600" />}
                    {tipoMensaje === "warning" && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                    {tipoMensaje === "success" && <CheckCircle className="h-4 w-4 text-green-600" />}
                    <AlertDescription
                      className={
                        tipoMensaje === "error"
                          ? "text-red-800"
                          : tipoMensaje === "warning"
                            ? "text-yellow-800"
                            : "text-green-800"
                      }
                    >
                      {mensaje}
                    </AlertDescription>
                  </Alert>
                )}

                {usuario && !usuario.bloqueado && !mensaje.includes("Ya retiró") && (
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="pt-4">
                      <div className="space-y-2 text-sm">
                        <div>
                          <strong>Nombre:</strong> {usuario.nombre}
                        </div>
                        <div>
                          <strong>Curso:</strong> {usuario.curso}
                        </div>
                        <div>
                          <strong>RUT:</strong> {formatearRut(usuario.rut)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
