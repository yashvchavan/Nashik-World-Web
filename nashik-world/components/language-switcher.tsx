"use client"

import { Globe } from "lucide-react"
import { useTranslation } from "@/components/language-provider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useTranslation()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden md:inline">{t("language")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLanguage("en")}>
          <span className={language === "en" ? "font-bold" : ""}>{t("english")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage("hi")}>
          <span className={language === "hi" ? "font-bold" : ""}>{t("hindi")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage("mr")}>
          <span className={language === "mr" ? "font-bold" : ""}>{t("marathi")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
