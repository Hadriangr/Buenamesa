import type { Usuario, Ticket } from "./database"
import { limpiarRut } from "./rut-validator"

export interface CSVUsuario {
  rut: string
  nombre: string
  curso: string
}

export function parsearCSVUsuarios(csvContent: string): CSVUsuario[] {
  const lineas = csvContent.trim().split("\n")
  const usuarios: CSVUsuario[] = []

  if (lineas.length < 3) {
    throw new Error("El archivo CSV debe tener al menos 3 líneas")
  }

  // Saltar la primera línea que contiene "Tickets totales:X"
  // La segunda línea contiene los headers: "ID Fecha y hora RUT Nombre Curso"
  // Los datos empiezan desde la tercera línea

  for (let i = 2; i < lineas.length; i++) {
    const columnas = lineas[i].split(",").map((col) => col.trim().replace(/"/g, ""))

    if (columnas.length >= 5) {
      // Formato: ID, Fecha y hora, RUT, Nombre, Curso
      const rut = limpiarRut(columnas[2].trim())
      const nombre = columnas[3].trim()
      const curso = columnas[4].trim()

      if (rut && nombre && curso) {
        usuarios.push({
          rut: rut,
          nombre: nombre,
          curso: curso,
        })
      }
    }
  }

  return usuarios
}

export function generarCSVTickets(tickets: Ticket[], usuarios: Usuario[]): string {
  // Ya no necesitamos el mapa de usuarios porque los tickets tienen los datos completos

  // Primera línea: cantidad de tickets
  let csv = `${tickets.length}\n`

  // Headers
  csv += "ID,Fecha y Hora,RUT,Nombre,Curso\n"

  // Datos - usar los datos del ticket directamente
  tickets.forEach((ticket) => {
    // Convertir fecha de AAAA-MM-DD a DD-MM-AAAA
    const [año, mes, dia] = ticket.fecha_emision.split("-")
    const fechaFormateada = `${dia}-${mes}-${año}`
    const fechaHora = `${fechaFormateada} ${ticket.hora_emision}`

    csv += `${ticket.id},"${fechaHora}","${ticket.rut}","${ticket.nombre}","${ticket.curso}"\n`
  })

  return csv
}

export function descargarCSV(contenido: string, nombreArchivo: string) {
  const blob = new Blob([contenido], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", nombreArchivo)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}
