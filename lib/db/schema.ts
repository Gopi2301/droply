import { integer, pgTable, varchar,text, uuid, boolean, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const files = pgTable("files",{
    id:uuid("id").defaultRandom().primaryKey(),
    // basic file and folder info
    name: text("name").notNull(),
    path: text("path").notNull(),
    size: integer("size").notNull(),
    type: text("type").notNull(), //"folder" or "file",
    // storage info
    fileUrl: text("file_url").notNull(),
    thumnailUrl: text("thumbnail_url"),
    // owner info
    userId:text("user_id").notNull(),
    parentId:uuid("parent_id"), // parent folder if (null => root folder)
    // file/folder flags
    isFolder: boolean("isfolder").default(false).notNull(),
    isStared: boolean("is_stared").default(false).notNull(),
    isTrash: boolean("is_trash").default(false).notNull(),
    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull()
})

export const filesRelations = relations(files, ({one, many})=>({
    parent: one(files,{
        fields: [files.parentId],
        references: [files.id],
    }),
    children: many(files)
}))

export const file =  typeof files.$inferSelect;
export const NewFile = typeof files.$inferInsert;
