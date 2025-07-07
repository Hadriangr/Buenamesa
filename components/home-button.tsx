"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"

export default function HomeButton() {
  return (
    <Link href="/">
      <Button
        variant="outline"
        className="fixed top-4 left-4 z-50 bg-white/90 backdrop-blur-sm border-2 border-white/50 hover:bg-white/100 shadow-lg"
      >
        <Home className="h-4 w-4 mr-2" />
        Inicio
      </Button>
    </Link>
  )
}
