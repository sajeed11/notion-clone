"use client"

import { useRouter } from "next/navigation"
import { useUser } from "@clerk/clerk-react"
import { useMutation } from "convex/react"

import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { toast } from "sonner"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface MenuProps {
  documentId: Id<"documents">
}

export const Menu = ({ documentId }: MenuProps) => {
  const router = useRouter()
  const { user } = useUser()
  const archive = useMutation(api.documents.archive)

  const onArchive = () => {
    const promise = archive({ id: documentId })

    toast.promise(promise, {
      loading: "Moving to trash...",
      success: "Document moved to trash!",
      error: "Failed to move document to trash",
    })

    router.push("/documents")
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button size="icon" variant="ghost">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60" align="end" alignOffset={8} forceMount>
        <DropdownMenuItem>
          <Trash className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="text-xs text-muted-foreground px-2">
          Last edited by: {user?.fullName}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

Menu.Skeleton = function MenuSkeleton() {
  return (
    <Skeleton className="h-10 w-10" />
  )
}
