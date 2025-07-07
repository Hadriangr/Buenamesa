"use client"

import { Card, CardContent } from "@/components/ui/card"
import { formatearRut } from "@/lib/rut-validator"
import type { Usuario } from "@/lib/database"

interface TicketPreviewProps {
  usuario: Usuario
  ticketId: number
  fecha: string
  hora: string
  onClose: () => void
}

export default function TicketPreview({ usuario, ticketId, fecha, hora, onClose }: TicketPreviewProps) {
  const imprimirTicket = () => {
    // Crear una ventana de impresión
    const ventanaImpresion = window.open("", "_blank", "width=400,height=600")
    if (!ventanaImpresion) return

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
          <div class="header">TICKET DE ALMUERZO</div>
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
          // Auto-imprimir después de cargar
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 500);
          }
        </script>
      </body>
      </html>
    `

    ventanaImpresion.document.write(contenidoHTML)
    ventanaImpresion.document.close()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold mb-2">Vista Previa del Ticket</h2>
            <p className="text-gray-600">Así se verá el ticket impreso</p>
          </div>

          {/* Simulación del ticket */}
          <div className="border-2 border-dashed border-gray-400 p-4 bg-gray-50 font-mono text-sm">
            <div className="text-center border-b border-gray-400 pb-2 mb-3">
              <div className="font-bold">TICKET DE ALMUERZO</div>
            </div>

            <div className="text-center mb-3">
              <div className="text-lg font-bold">#{ticketId.toString().padStart(6, "0")}</div>
            </div>

            <div className="space-y-1 text-xs">
              <div>
                <strong>Nombre:</strong> {usuario.nombre}
              </div>
              <div>
                <strong>RUT:</strong> {formatearRut(usuario.rut)}
              </div>
              <div>
                <strong>Curso:</strong> {usuario.curso}
              </div>
              <div>
                <strong>Fecha:</strong> {fecha}
              </div>
              <div>
                <strong>Hora:</strong> {hora}
              </div>
            </div>

            <div className="text-center border-t border-gray-400 pt-2 mt-3 text-xs">
              <div>Sistema de Ticketera Escolar</div>
              <div>Válido solo para el día de emisión</div>
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              onClick={imprimirTicket}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
            >
              Imprimir Ticket
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition-colors"
            >
              Cerrar
            </button>
          </div>

          <div className="mt-4 text-xs text-gray-500 text-center">
            <p>• El botón "Imprimir" abrirá una ventana de impresión</p>
            <p>• Funciona con cualquier impresora conectada</p>
            <p>• Para Epson TM-T20II usar driver específico</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
