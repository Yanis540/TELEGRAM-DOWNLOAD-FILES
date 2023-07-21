import {configure as configureTdl, createClient} from "tdl"

// this is used to download the file from the link
export const client = createClient({
    apiId: parseInt(process.env.APP_API_ID as string)!, // Your api_id
    apiHash: process.env.APP_API_HASH! // Your api_hash
})