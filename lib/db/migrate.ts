import {migrate} from 'drizzle-orm/neon-http/migrator';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as dotenv from 'dotenv';

dotenv.config({path:'.env.local'});
if(!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in .env.local');
}

async function runMigrations(){
    try{
        const sql = neon(process.env.DATABASE_URL!);
        const db = drizzle(sql);
         
        await migrate(db, {
            migrationsFolder:'./drizzle',
        })
        console.log("Migrations completed successfully");
    }catch(e){

        console.error("Migration failed:", e);
        process.exit(1);
    }
}
runMigrations();