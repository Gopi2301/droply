import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { user } from "@heroui/theme";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if(!userId){
            return NextResponse.json({
                error: "Unauthorized"
            }, {status: 401})
        }
        //  parse req body
        const body = await request.json()
        const {imageKit, userId: bodyUserId} = body
        // check if userId in body matches the userId from auth
        if(userId !== bodyUserId){
            return NextResponse.json({
                error: "Unauthorized"
            }, {status: 401})
        }
        // check if imageKit is present in body
        if(!imageKit || !imageKit.url){
            return NextResponse.json({
                error: "Invalid file data"
            }, {status: 400})
        }
        
        const fileData ={
            name: imageKit.name || "Untitled",
            path:imageKit.filePath || `/droply/${userId}/${imageKit.name}`,
            size: imageKit.size || 0,
            type: imageKit.fileType || "image",
            fileUrl: imageKit.url ,
            thumbnailUrl: imageKit.thumbnailUrl || null,
            userId: userId,
            parentId: null,
            isFolder: false,
            isStarred: false,
            isTrashed: false
        }

        const [newFile] = await db.insert(files).values(fileData).returning()
        return NextResponse.json(newFile, {status: 201})

    } catch (error) {
        
        return NextResponse.json({
            error: "Failed to save info to database"
        }, {status: 500})
    }
}