import { db } from "@/lib/db";
import { file, files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import {eq, and} from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
    request: NextRequest,
    props: {params: Promise < {fileId: string}>}
){
    try {
        const {userId} = await auth();
        if(!userId){
            return NextResponse.json({error: "Unauthorized"}, {status: 401})
        }
        const {fileId}=await props.params;
        if(!fileId){
            return NextResponse.json({error: "file Id is required"}, {status: 400})
        }
        const [file]=await db.select().from(files).where(
            and(
                eq(files.id, fileId),
                eq(files.userId, userId)
            )
        )
        if(!file){
            return NextResponse.json({error: "File not found"}, {status: 404})
        }
        // toggle star status 
        const updatedFiles=await db.update(files).set({isStared : !file.isStared}).where(
            and(
                eq(files.id, fileId),
                eq(files.userId, userId)
            )
        ).returning();
        // log the wholeupdated file

        const updatedFile = updatedFiles[0];
        return NextResponse.json(updatedFile);
        }
     catch (error) {
        console.log(error);
        return NextResponse.json({error: "Failed to update file"}, {status: 500})
    }
}