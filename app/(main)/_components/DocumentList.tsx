"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery } from "convex/react"

import { Doc, Id } from "@/convex/_generated/dataModel"
import { api } from "@/convex/_generated/api"
import { Item } from "./Item"
import { cn } from "@/lib/utils"
import { FileIcon } from "lucide-react"

interface DocumentListProps {
  parentDocumentId: Id<"documents">
  level?: number
  data?: Doc<"documents">[]
}

export const DocumentList = ({
  parentDocumentId,
  level = 0,
}: DocumentListProps) => {
  const params = useParams()
  const router = useRouter()
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const onExpand = (documentId: string) => {
    setExpanded(prevExpanded => ({
      ...prevExpanded,
      [documentId]: !prevExpanded[documentId]
    }))
  }

  const documents = useQuery(api.documents.getSidbar, {
    parentDocument: parentDocumentId
  })

  const onredirect = (documentId: string) => {
    router.push(`/documents/${documentId}`)
  }

  if (documents === undefined) {
    return (
      <>
        <Item.Skeleton level={level} />
        {level === 0 && (
          <>
            <Item.Skeleton level={level} />
            <Item.Skeleton level={level} />
          </>
        )}
      </>
    )
  }

  return (
    <>
      <p
        style={{
          paddingLeft: level ? `${(level * 12) + 25}px` : undefined
        }}
        className={cn(
          "hidden text-sm font-medium text-muted-foreground",
          expanded && "last:black",
          level === 0 && "hidden"
        )}
      >
        No pages inside
      </p>
      {documents.map((doc) => (
        <div key={doc._id}>
          <Item
            id={doc._id}
            onClick={() => onredirect(doc._id)}
            label={doc.title}
            icon={FileIcon}
            documentIcon={doc.icon}
            active={params.documentId === doc._id}
            level={level}
            onExpand={() => onExpand(doc._id)}
            expanded={expanded[doc._id]}
          />
          {expanded[doc._id] && (
            <DocumentList
              parentDocumentId={doc._id}
              level={level + 1}
            />
          )}
        </div>
      ))}
    </>
  )
}