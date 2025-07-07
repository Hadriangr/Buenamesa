"use client"

import { useState, useEffect, useCallback } from "react"

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sessionExpired, setSessionExpired] = useState(false)

  const logout = useCallback(() => {
    localStorage.removeItem("admin_session")
    localStorage.removeItem("admin_session_time")
    localStorage.removeItem("admin_last_activity")
    setIsAuthenticated(false)

    // Redirigir automáticamente al home
    if (typeof window !== "undefined") {
      window.location.href = "/"
    }
  }, [])

  const updateActivity = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("admin_last_activity", Date.now().toString())
    }
  }, [])

  const checkAuthStatus = useCallback(() => {
    if (typeof window === "undefined") {
      setLoading(false)
      return
    }

    const session = localStorage.getItem("admin_session")
    const sessionTime = localStorage.getItem("admin_session_time")
    const lastActivity = localStorage.getItem("admin_last_activity")

    if (session === "authenticated" && sessionTime) {
      const timeElapsed = Date.now() - Number.parseInt(sessionTime)
      const sessionDuration = 4 * 60 * 60 * 1000 // 4 horas en milisegundos

      // Verificar inactividad (1 minuto = 60000 ms)
      const inactivityLimit = 60000 // 1 minuto
      const timeSinceActivity = lastActivity ? Date.now() - Number.parseInt(lastActivity) : 0

      if (timeElapsed < sessionDuration && timeSinceActivity < inactivityLimit) {
        setIsAuthenticated(true)
        updateActivity() // Actualizar actividad al verificar
      } else {
        // Sesión expirada por tiempo o inactividad
        setSessionExpired(true)
        logout()
      }
    }

    setLoading(false)
  }, [logout, updateActivity])

  useEffect(() => {
    checkAuthStatus()
  }, [checkAuthStatus])

  // Timer silencioso para verificar inactividad cada 10 segundos
  useEffect(() => {
    if (!isAuthenticated) return

    const interval = setInterval(() => {
      const lastActivity = localStorage.getItem("admin_last_activity")
      if (lastActivity) {
        const timeSinceActivity = Date.now() - Number.parseInt(lastActivity)
        const inactivityLimit = 60000 // 1 minuto

        if (timeSinceActivity >= inactivityLimit) {
          setSessionExpired(true)
          logout() // Esto ahora redirigirá automáticamente
        }
      }
    }, 10000) // Verificar cada 10 segundos

    return () => clearInterval(interval)
  }, [isAuthenticated, logout])

  // Detectar actividad del usuario
  useEffect(() => {
    if (!isAuthenticated) return

    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"]

    const handleActivity = () => {
      updateActivity()
    }

    events.forEach((event) => {
      document.addEventListener(event, handleActivity, true)
    })

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity, true)
      })
    }
  }, [isAuthenticated, updateActivity])

  const login = () => {
    localStorage.setItem("admin_session", "authenticated")
    localStorage.setItem("admin_session_time", Date.now().toString())
    updateActivity()
    setIsAuthenticated(true)
    setSessionExpired(false)
  }

  return {
    isAuthenticated,
    loading,
    login,
    logout,
    updateActivity,
    sessionExpired,
  }
}
