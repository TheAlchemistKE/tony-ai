import { auth } from '@clerk/nextjs'
import { NextResponse } from 'next/server'
import {ChatCompletionRequestMessage, Configuration, OpenAIApi } from 'openai'

const configuration = new Configuration({
    apiKey: process.env.OPEN_API_KEY
})

const openai = new OpenAIApi(configuration)
const instructionMessage: ChatCompletionRequestMessage = {
    role: "system",
    content: "You are code generator. You have the knowledge of a Senior Software Engineer working at a FAANG Company. You must answer only in markdown code snippets. Use professionally written comments for explanations."
}

export async function POST(req: Request) {
    try {
        const {userId} = auth()
        const body = await req.json()
        const { messages } = body

        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        if (!configuration.apiKey) {
            return new NextResponse('OpenAI API Key Not Provided', { status: 500 })
        }

        if (!messages) {
            return new NextResponse('Messages are required', { status: 400 })
        }

        const response = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [instructionMessage, ...messages]
        })

        return NextResponse.json(response.data.choices[0].message)
    } catch(e) {
        console.log('Code Error: ', e)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
    
}