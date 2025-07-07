"use client"

import { Button } from "@/components/ui/button"
import { SkipBackIcon as Backspace } from "lucide-react"

interface NumericKeypadProps {
  onNumberClick: (number: string) => void
  onBackspace: () => void
  onClear: () => void
}

export default function NumericKeypad({ onNumberClick, onBackspace, onClear }: NumericKeypadProps) {
  const numbers = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["K", "0", "⌫"],
  ]

  const handleClick = (value: string) => {
    if (value === "⌫") {
      onBackspace()
    } else if (value === "C") {
      onClear()
    } else {
      onNumberClick(value)
    }
  }

  return (
    <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
      {numbers.flat().map((num, index) => (
        <Button
          key={index}
          variant="outline"
          className={`h-12 text-lg font-semibold transition-all duration-200 ${
            num === "⌫"
              ? "bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
              : num === "K"
                ? "bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200"
                : "bg-white hover:bg-gray-50 text-gray-800 border-gray-300"
          } hover:scale-105 active:scale-95 shadow-sm`}
          onClick={() => handleClick(num)}
        >
          {num === "⌫" ? <Backspace className="h-5 w-5" /> : num}
        </Button>
      ))}
    </div>
  )
}
