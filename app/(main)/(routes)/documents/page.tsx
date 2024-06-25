"use client"

import Image from "next/image"
import { useUser } from "@clerk/clerk-react"
import { PlusCircle } from "lucide-react"
import { useMutation } from "convex/react"
import { toast } from "sonner"

import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"

const DocumentPage = () => {
  const { user } = useUser()

  // Create a new document
  const create = useMutation(api.documents.create)

  const onCreate = () => {
    const promise = create({ title: "Untitled" })

    toast.promise(promise, {
      loading: "Creating document...",
      success: "Document created!",
      error: "Failed to create document :("
    })
  }

  return (
    <div className="h-full flex flex-col items-center justify-center space-y-4">
      <Image
        src='/sammy-line-thoughtful-man-with-empty-list.png'
        height="300"
        width="300"
        alt="Empty"
      />
      <h2 className="text-lg font-medium">
        Welcome to {user?.firstName}&apos;s Sotion
      </h2>
      <Button onClick={onCreate}>
        <PlusCircle className="h-4 w-4 mr-2" />
        Create a note
      </Button>
    </div>
  )
}

export default DocumentPage