"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "./button"

interface CopyButtonProps {
  text: string
  className?: string
  size?: "default" | "sm" | "lg" | "icon"
}

export function CopyButton({ text, className, size = "sm" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for browsers without clipboard API
      const el = document.createElement("textarea")
      el.value = text
      el.style.position = "fixed"
      el.style.opacity = "0"
      document.body.appendChild(el)
      el.select()
      document.execCommand("copy")
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      className={`shrink-0 gap-1.5 transition-colors ${copied ? "border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400" : ""} ${className ?? ""}`}
      onClick={handleCopy}
      aria-label={copied ? "Copied!" : "Copy to clipboard"}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      {copied ? "Copied!" : "Copy"}
    </Button>
  )
}
