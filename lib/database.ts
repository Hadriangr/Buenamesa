// Simulación de base de datos local para el ejemplo
// En producción, usarías SQLite o IndexedDB

export interface Usuario {
  id: number
  rut: string
  nombre: string
  curso: string
  bloqueado: boolean
  fecha_creacion: string
}

export interface Ticket {
  id: number
  usuario_id: number
  rut: string
  nombre: string // Datos desnormalizados para mantener historial
  curso: string // Datos desnormalizados para mantener historial
  fecha_emision: string
  hora_emision: string
  fecha_hora_completa: string
}

class LocalDatabase {
  private usuarios: Usuario[] = []
  private tickets: Ticket[] = []
  private nextUserId = 1
  private nextTicketId = 200000

  constructor() {
    this.loadFromStorage()
  }

  private loadFromStorage() {
    if (typeof window !== "undefined") {
      const usuariosData = localStorage.getItem("ticketera_usuarios")
      const ticketsData = localStorage.getItem("ticketera_tickets")

      if (usuariosData) {
        this.usuarios = JSON.parse(usuariosData)
        this.nextUserId = Math.max(...this.usuarios.map((u) => u.id), 0) + 1
      }

      if (ticketsData) {
        this.tickets = JSON.parse(ticketsData)
        // Migrar tickets antiguos que no tienen nombre/curso
        this.tickets = this.tickets.map((ticket) => {
          if (!ticket.nombre || !ticket.curso) {
            const usuario = this.usuarios.find((u) => u.id === ticket.usuario_id)
            return {
              ...ticket,
              nombre: usuario?.nombre || "Usuario Eliminado",
              curso: usuario?.curso || "Curso Desconocido",
            }
          }
          return ticket
        })
        this.nextTicketId = Math.max(...this.tickets.map((t) => t.id), 199999) + 1
      }
    }
  }

  private saveToStorage() {
    if (typeof window !== "undefined") {
      localStorage.setItem("ticketera_usuarios", JSON.stringify(this.usuarios))
      localStorage.setItem("ticketera_tickets", JSON.stringify(this.tickets))
    }
  }

  // Métodos para usuarios
  async crearUsuario(rut: string, nombre: string, curso: string): Promise<Usuario> {
    // Limpiar el RUT antes de guardarlo
    const rutLimpio = rut.replace(/[^0-9kK]/g, "").toLowerCase()

    const usuario: Usuario = {
      id: this.nextUserId++,
      rut: rutLimpio,
      nombre,
      curso,
      bloqueado: false,
      fecha_creacion: new Date().toISOString(),
    }

    this.usuarios.push(usuario)
    this.saveToStorage()
    return usuario
  }

  async obtenerUsuarioPorRut(rut: string): Promise<Usuario | null> {
    // Limpiar el RUT de búsqueda
    const rutLimpioBusqueda = rut.replace(/[^0-9kK]/g, "").toLowerCase()

    console.log("Buscando RUT:", rutLimpioBusqueda)

    const usuario = this.usuarios.find((u) => {
      const rutLimpioUsuario = u.rut.replace(/[^0-9kK]/g, "").toLowerCase()
      console.log("Comparando con:", rutLimpioUsuario)
      return rutLimpioUsuario === rutLimpioBusqueda
    })

    console.log("Resultado búsqueda:", usuario)
    return usuario || null
  }

  async obtenerTodosUsuarios(): Promise<Usuario[]> {
    return [...this.usuarios]
  }

  async actualizarUsuario(id: number, datos: Partial<Usuario>): Promise<Usuario | null> {
    const index = this.usuarios.findIndex((u) => u.id === id)
    if (index === -1) return null

    this.usuarios[index] = { ...this.usuarios[index], ...datos }
    this.saveToStorage()
    return this.usuarios[index]
  }

  async eliminarUsuario(id: number): Promise<boolean> {
    const index = this.usuarios.findIndex((u) => u.id === id)
    if (index === -1) return false

    this.usuarios.splice(index, 1)
    this.saveToStorage()
    return true
  }

  // Métodos para tickets
  async crearTicket(usuario_id: number, rut: string): Promise<Ticket> {
    const ahora = new Date()
    const fechaHoy = ahora.toISOString().split("T")[0]

    // Obtener datos completos del usuario
    const usuario = this.usuarios.find((u) => u.id === usuario_id)
    if (!usuario) {
      throw new Error("Usuario no encontrado para crear ticket")
    }

    // Limpiar el RUT antes de guardarlo
    const rutLimpio = rut.replace(/[^0-9kK]/g, "").toLowerCase()

    const ticket: Ticket = {
      id: this.nextTicketId++,
      usuario_id,
      rut: rutLimpio,
      nombre: usuario.nombre, // Guardar datos completos
      curso: usuario.curso, // Guardar datos completos
      fecha_emision: fechaHoy,
      hora_emision: ahora.toTimeString().split(" ")[0],
      fecha_hora_completa: ahora.toISOString(),
    }

    this.tickets.push(ticket)
    this.saveToStorage()
    return ticket
  }

  async verificarTicketHoy(rut: string): Promise<boolean> {
    const fechaHoy = new Date().toISOString().split("T")[0]
    const rutLimpio = rut.replace(/[^0-9kK]/g, "").toLowerCase()

    console.log("=== VERIFICACIÓN TICKET DIARIO ===")
    console.log("RUT a verificar:", rutLimpio)
    console.log("Fecha de hoy:", fechaHoy)

    const ticketsHoy = this.tickets.filter((t) => {
      const ticketRutLimpio = t.rut.replace(/[^0-9kK]/g, "").toLowerCase()
      const mismaFecha = t.fecha_emision === fechaHoy
      const mismoRut = ticketRutLimpio === rutLimpio

      console.log(
        `Ticket ${t.id}: RUT=${ticketRutLimpio}, Fecha=${t.fecha_emision}, MismaFecha=${mismaFecha}, MismoRut=${mismoRut}`,
      )

      return mismaFecha && mismoRut
    })

    console.log("Tickets encontrados para hoy:", ticketsHoy.length)
    console.log("¿Ya tiene ticket?", ticketsHoy.length > 0)

    return ticketsHoy.length > 0
  }

  async obtenerTicketsDelDia(fecha?: string): Promise<Ticket[]> {
    const fechaBuscar = fecha || new Date().toISOString().split("T")[0]
    return this.tickets.filter((t) => t.fecha_emision === fechaBuscar)
  }

  async obtenerTodosTickets(): Promise<Ticket[]> {
    return [...this.tickets]
  }

  // Métodos para importar/exportar
  async importarUsuarios(usuarios: Omit<Usuario, "id" | "fecha_creacion">[]): Promise<void> {
    for (const userData of usuarios) {
      const existeUsuario = await this.obtenerUsuarioPorRut(userData.rut)
      if (!existeUsuario) {
        await this.crearUsuario(userData.rut, userData.nombre, userData.curso)
      }
    }
  }

  async limpiarDatos(): Promise<void> {
    this.usuarios = []
    this.tickets = []
    this.nextUserId = 1
    this.nextTicketId = 200000
    this.saveToStorage()
  }

  // Método para limpiar solo usuarios (mantener tickets con datos completos)
  async limpiarSoloUsuarios(): Promise<void> {
    console.log("=== ELIMINANDO USUARIOS ===")
    console.log("Usuarios antes:", this.usuarios.length)
    console.log("Tickets antes:", this.tickets.length)

    // Los tickets ya tienen nombre y curso guardados, no necesitan usuarios
    this.usuarios = []
    this.nextUserId = 1

    console.log("Usuarios después:", this.usuarios.length)
    console.log("Tickets después:", this.tickets.length)

    this.saveToStorage()
  }
}

export const db = new LocalDatabase()
