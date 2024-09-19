"use client"

import { useState, useEffect } from "react"

import { SettingsModal } from "@/components/modals/settings-modal"

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false)

  // This is a workaround to prevent the modal from rendering on the server
  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <>
      <SettingsModal />
    </>
  )
}