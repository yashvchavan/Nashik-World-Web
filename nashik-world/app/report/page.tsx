"use client"

import { useState } from "react"
import { useTranslation } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { ReportIssueModal } from "@/components/report-issue-modal"

export default function ReportIssuePage() {
  const { t } = useTranslation()
  const [isModalOpen, setIsModalOpen] = useState(true)

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-6">{t("reportIssue")}</h1>
        <p className="text-muted-foreground mb-8">
          Report civic issues in your area for quick resolution. Your contribution helps make Nashik better.
        </p>
        <Button size="lg" onClick={() => setIsModalOpen(true)} className="w-full">
          {t("reportIssue")}
        </Button>
      </div>

      <ReportIssueModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
