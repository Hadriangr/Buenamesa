import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Ticket, Settings } from "lucide-react"

export default function HomePage() {
  return (
    <div
      className="min-h-screen bg-no-repeat"
      style={{
        backgroundImage: "url('/images/background-menu.png')",
        backgroundSize: "100% 100%",
        backgroundPosition: "center center",
      }}
    >
      <div className="min-h-screen bg-black bg-opacity-10 px-4 py-8 sm:px-6 lg:px-8">
        <div className="container mx-auto flex items-center justify-center min-h-screen max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 w-full max-w-4xl mx-auto px-4">
            {/* Card para Generar Ticket */}
            <Card className="hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white/95 backdrop-blur-sm border-2 border-white/50">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-green-100 rounded-full w-20 h-20 flex items-center justify-center">
                  <Ticket className="h-10 w-10 text-green-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-800">Generar Ticket</CardTitle>
                <CardDescription className="text-gray-600">
                  Ingrese su RUT para obtener su ticket de almuerzo
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Link href="/ticket">
                  <Button className="w-full h-12 text-lg bg-green-600 hover:bg-green-700 transition-colors">
                    Ir al Generador
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Card para Administración */}
            <Card className="hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white/95 backdrop-blur-sm border-2 border-white/50">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center">
                  <Settings className="h-10 w-10 text-blue-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-800">Administración</CardTitle>
                <CardDescription className="text-gray-600">
                  Panel de control para gestionar usuarios y tickets
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Link href="/admin">
                  <Button
                    variant="outline"
                    className="w-full h-12 text-lg border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors bg-transparent"
                  >
                    Panel Admin
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
