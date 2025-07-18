"use client"

import React, { useRef, useState } from "react"
import { useMutation } from "convex/react"

import { Doc } from "@/convex/_generated/dataModel"
import { api } from "@/convex/_generated/api"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface TitleProps {
  initData: Doc<"documents">
}

export const Title = ({
  initData
}: TitleProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const update = useMutation(api.documents.update)

  const [title, setTitle] = useState(initData.title || "Untitled Document")
  const [isEditing, setIsEditing] = useState(false)

  const enableInput = () => {
    setTitle(initData.title)
    setIsEditing(true)
    setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.setSelectionRange(0, inputRef.current.value.length)
    }, 0)
  }

  const disableInput = () => {
    setIsEditing(false)
  }

  const onChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTitle(event.target.value)
    update({
      id: initData._id,
      title: event.target.value || "Untitled Document"
    })
  }

  const onKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      disableInput()
    }
  }
  return (
    <div className="flex items-center gap-x-1">
      {!!initData.icon && <p>{initData.icon}</p>}
      {isEditing ? (
        <Input
          ref={inputRef}
          onClick={enableInput}
          onBlur={disableInput}
          onChange={onChange}
          onKeyDown={onKeyDown}
          value={title}
          className="h-7 px-2 focus-visible:ring-transparent"
        />
      ) : (
        <Button
          onClick={enableInput}
          variant="ghost"
          size="sm"
          className="font-normal h-auto p-1"
        >
          <span className="truncate">{initData?.title}</span>
        </Button>
      )}
    </div>
  )
}

Title.Skeleton = function TitleSkeleton() {
  return (
    <Skeleton className="h-4 w-20 rounded-md" />
  )
}
