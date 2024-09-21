import { v } from 'convex/values'

import { mutation, query } from './_generated/server'
import { Doc, Id } from './_generated/dataModel'

export const getSidbar = query({
  args: {
    parentDocument: v.optional(v.id("documents"))
  },
  handler: async (ctx, args) => {
    const identify = await ctx.auth.getUserIdentity()

    if (!identify) {
      throw new Error("Unauthenticated")
    }

    const userId = identify.subject

    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user_parent", (q) =>
        q
          .eq("userId", userId)
          .eq("parentDocument", args.parentDocument)
      )
      .filter((q) =>
        q.eq(q.field("isArchived"), false)
      )
      .order("desc")
      .collect();

    return documents
  }
})

export const create = mutation({
  args: {
    title: v.string(),
    parentDocument: v.optional(v.id("documents"))
  },
  handler: async (ctx, args) => {
    const identify = await ctx.auth.getUserIdentity()

    if (!identify)
      throw new Error("Unauthenticated")

    const userId = identify.subject

    const document = await ctx.db.insert('documents', {
      title: args.title,
      parentDocument: args.parentDocument,
      userId,
      isArchived: false,
      isPublished: false
    })

    return document
  }
})

// Archive the document
export const archive = mutation({
  args: {
    id: v.id("documents")
  },
  handler: async (ctx, args) => {
    const identify = await ctx.auth.getUserIdentity()

    if (!identify)
      throw new Error("Unauthenticated")

    const userId = identify.subject

    const existingDoc = await ctx.db.get(args.id)

    if (!existingDoc)
      throw new Error("Document not found")

    if (existingDoc.userId !== userId)
      throw new Error("Unauthorized")

    const recursiveArchive = async (documentId: Id<"documents">) => {
      const children = await ctx.db
        .query("documents")
        .withIndex("by_user_parent", (q) => (
          q
            .eq("userId", userId)
            .eq("parentDocument", documentId)
        ))
        .collect()

      for (const child of children) {
        await ctx.db.patch(child._id, {
          isArchived: true
        })

        await recursiveArchive(child._id)
      }
    }

    const document = await ctx.db.patch(args.id, {
      isArchived: true
    })

    recursiveArchive(args.id)

    return document
  }
})

// Get the archived documents
export const getTrash = query({
  handler: async (ctx) => {
    const identify = await ctx.auth.getUserIdentity()

    if (!identify)
      throw new Error("Unauthenticated")

    const userId = identify.subject

    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isArchived"), true))
      .order("desc")
      .collect()

    return documents
  }
})

export const restore = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const identify = await ctx.auth.getUserIdentity()

    if (!identify)
      throw new Error("Unauthenticated")

    const userId = identify.subject

    const existingDocuments = await ctx.db.get(args.id)

    if (!existingDocuments)
      throw new Error("Document not found")

    if (existingDocuments.userId !== userId)
      throw new Error("Unauthorized")

    const recursiveRstore = async (documentId: Id<"documents">) => {
      const children = await ctx.db
        .query("documents")
        .withIndex("by_user_parent", (q) => (
          q
            .eq("userId", userId)
            .eq("parentDocument", documentId)
        ))
        .collect()

      for (const child of children) {
        await ctx.db.patch(child._id, {
          isArchived: false
        })

        await recursiveRstore(child._id)
      }
    }

    const options: Partial<Doc<"documents">> = {
      isArchived: false
    }

    if (existingDocuments.parentDocument) {
      const parent = await ctx.db.get(existingDocuments.parentDocument)
      if (parent?.isArchived) {
        options.parentDocument = undefined
      }
    }

    const document = await ctx.db.patch(args.id, options)

    recursiveRstore(args.id)

    return document
  }
})

export const remove = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const identify = await ctx.auth.getUserIdentity()

    if (!identify)
      throw new Error("Unauthenticated")

    const userId = identify.subject

    const existingDoc = await ctx.db.get(args.id)

    if (!existingDoc)
      throw new Error("Document not found")

    if (existingDoc.userId !== userId)
      throw new Error("Unauthorized")

    const document = await ctx.db.delete(args.id)

    return document
  }
})

export const getSearch = query({
  handler: async (ctx) => {
    const identify = await ctx.auth.getUserIdentity()

    if (!identify)
      throw new Error("Unauthenticated")

    const userId = identify.subject

    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) =>
        q.eq(q.field("isArchived"), false)
      )
      .order("desc")
      .collect()

    return documents
  }
})

export const getById = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const identify = await ctx.auth.getUserIdentity()

    const document = await ctx.db.get(args.documentId)

    if (!document) {
      throw new Error("Not found")
    }

    if (document.isPublished && document.isArchived) {
      return document
    }

    if (!identify) {
      throw new Error("Not Authenticated")
    }

    const userId = identify.subject

    if (document.userId !== userId) {
      throw new Error("Not Authorized")
    }

    return document
  }
})
