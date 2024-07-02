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

    const document = await ctx.db.patch(args.id, {
      isArchived: true
    })

    return document
  }
})