// Validador de RUT chileno
export function validarRut(rut: string): boolean {
  if (!rut) return false

  // Limpiar el RUT
  const rutLimpio = rut.replace(/[^0-9kK]/g, "").toLowerCase()

  if (rutLimpio.length < 2) return false

  const cuerpo = rutLimpio.slice(0, -1)
  const dv = rutLimpio.slice(-1)

  // Calcular dígito verificador
  let suma = 0
  let multiplicador = 2

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number.parseInt(cuerpo[i]) * multiplicador
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1
  }

  const resto = suma % 11
  const dvCalculado = resto === 0 ? "0" : resto === 1 ? "k" : (11 - resto).toString()

  return dv === dvCalculado
}

export function formatearRut(rut: string): string {
  if (!rut) return ""

  const rutLimpio = rut.replace(/[^0-9kK]/g, "")
  if (rutLimpio.length < 2) return rut

  const cuerpo = rutLimpio.slice(0, -1)
  const dv = rutLimpio.slice(-1)

  // Formatear con puntos
  const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".")

  return `${cuerpoFormateado}-${dv.toUpperCase()}`
}

export function limpiarRut(rut: string): string {
  return rut.replace(/[^0-9kK]/g, "").toLowerCase()
}
