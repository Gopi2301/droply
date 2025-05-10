import {auth} from "@clerk/nextjs/server";
import {db} from "@/lib/db";
import { files } from "@/lib/db/schema";
import {and, eq, is} from "drizzle-orm";
import ImageKit from "imagekit";
import {v4 as uuidv4} from "uuid";
import { NextRequest, NextResponse } from "next/server";


// imagekit auth
const imagekit = new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
    privateKey: process.env.NEXT_PUBLIC_IMAGEKIT_PRIVATE_KEY || "",
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "",
})

export async function POST(request:NextRequest){
    try {
        const {userId} = await auth();
        if(!userId){
            return NextResponse.json({
                error: "Unauthorized"
            }, {status: 401});
        }
        // parse the form data
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const formUserId = formData.get("userId") as string;
        const parentId = formData.get("parentId") as string || null;

        if(userId !== formUserId){
            return NextResponse.json({
                error: "Unauthorized"
            }, {status: 401});
        }
            
        if(!file){
            return NextResponse.json({
                error: "No file provided"
            }, {status: 400});
        }

        if(parentId){
            const [parentFolder]=await db
                   .select()
                   .from(files)
                   .where(
                        and(
                            eq(files.id, parentId),
                            eq(files.userId, userId),
                            eq(files.isFolder, true)
                        )
                   )
        }
        if(!file.type.startsWith("image/") && file.type !== "application/pdf"){
            return NextResponse.json({
                error:"Only images and pdfs are allowed"
            }, {status: 401});
        }

        const buffer =await file.arrayBuffer();
        const fileBuffer = Buffer.from(buffer);
        const folderPath = parentId ? `/droply/${userId}/folder/${parentId}` : `/droply/${userId}`
        const originalFileName = file.name
        // const fileExtension = originalFileName.split(".").pop() || ""
        // check empty file extension
        // validation for file extension

        const uniqueFileName = `${uuidv4()}.${file}`
        const uploadResponse = await imagekit.upload({
            file:fileBuffer,
            fileName: uniqueFileName,
            folder: folderPath,
            useUniqueFileName: false
        })
        const fileData ={
            name: originalFileName,
            path:uploadResponse.filePath,
            size:file.size,
            type:file.type,
            fileUrl:uploadResponse.url,
            thumnailUrl: uploadResponse.thumbnailUrl || "",
            userId : userId,
            parentId: parentId,
            isFolder: false,
            isStared: false,
            isTrashed: false
        }
        const [newFile] = await db.insert(files).values(fileData).returning();
          return NextResponse.json(newFile);
        }
        catch (error) {
        console.error("Error uploading file", error);
        return NextResponse.json({
            error: "Failed to upload file"
        }, {status: 500});
    }
}