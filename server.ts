import {config} from "dotenv"
config(); 
import express, {NextFunction, Request, Response} from "express"; 
import {configure as configureTdl, createClient} from "tdl"
import { getTdjson } from 'prebuilt-tdlib'
import asyncHandler from "express-async-handler"
configureTdl({ tdjson: getTdjson() })
import { client } from "./tdl-client";

const PORT = 5000; 
const app = express(); 

app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.get('/',asyncHandler(async(req:Request,res:Response)=>{
    await client.login()
    const me = await client.invoke({ _: 'getMe' })
    res.status(201).json({message:"Hilaw",user:me}); 
})); 
app.get('/chats',asyncHandler(async(req:Request,res:Response)=>{
    const chats = await client.invoke({ 
        _: 'getChats',
        chat_list: { _: 'chatListMain' },
        limit: 10
    })
    res.status(201).json({chats}); 
})); 



const CHAT_ID = 1820619211 // should be passed in req body normally 

app.get('/chat/:id',asyncHandler(async(req:Request,res:Response)=>{
    const chat = await client.invoke({
        _:"getChat",
        chat_id: CHAT_ID
    })
    res.status(201).json({chat}); 
})); 
app.get('/chat/:id/messages',asyncHandler(async(req:Request,res:Response)=>{
    // normally you should get this CHAT_ID FROM HERE 
    const number_messages = await client.invoke({
        _:"getMessages",
        chat_id: CHAT_ID, 

    })
    let i = 0 ; 
    let files:any[] = []; 
    let id = 0 ; 
  
    while(i<=1000){
        const messages = await client.invoke({
            _:"getChatHistory",
            chat_id: CHAT_ID ,
            limit:1000, 
            from_message_id:id, 
        }); 
        for(const message of messages.messages){
            if(message?.content?._=="messageVideo" || message?.content?._=="messagePhoto"){
                const file_id = 
                    message.content._=="messageVideo"
                    ? message.content.video.video.id
                    : message.content.photo.sizes[message.content.photo.sizes.length-1].photo.id
                ;
                const file = await client.invoke({
                    _: "getFile", 
                    file_id : file_id
                })
                files.push(file); 
                await client.invoke({
                    _:"downloadFile", 
                    priority:1, 
                    file_id: file_id
                })
            }
            id = message!.id
        }
        i++; 
    }

  
    res.status(201).json({files}); 
})); 
app.use((err:any,req:Request,res:Response,next:NextFunction)=>{
    console.log(err)
    res.status(500).json({message:err.message,stack:err.stack})
})

app.listen(PORT,()=>console.log(`Server Running On PORT ${PORT}`))


