"use client"

import { useState } from "react"
import { Star } from "lucide-react"

interface StarRatingProps {
  name: string
  label: string
  required?: boolean
  defaultValue?: number
}

export function StarRating({ name, label, required, defaultValue = 0 }: StarRatingProps) {
  const [value, setValue] = useState(defaultValue)
  const [hovered, setHovered] = useState(0)

  const display = hovered || value

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
        {display > 0 && (
          <span className="text-xs text-zinc-400">
            {["", "Poor", "Fair", "Good", "Very good", "Excellent"][display]}
          </span>
        )}
      </div>
      <div className="flex gap-1" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star !== 1 ? "s" : ""}`}
            onClick={() => setValue(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded"
          >
            <Star
              className={`h-7 w-7 transition-colors ${
                star <= display
                  ? "fill-amber-400 text-amber-400"
                  : "fill-zinc-200 text-zinc-200 dark:fill-zinc-700 dark:text-zinc-700"
              }`}
            />
          </button>
        ))}
      </div>
      {/* Hidden input carries the value for the form action */}
      <input type="hidden" name={name} value={value} required={required} />
      {required && value === 0 && (
        <p className="text-xs text-zinc-400">Required — click to rate</p>
      )}
    </div>
  )
}
