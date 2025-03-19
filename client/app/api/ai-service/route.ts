import axios from 'axios'

export async function POST(req: Request) {
    const { prompt } = await req.json()
    
    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            }
        )
        
        return Response.json({ 
            response: response.data.candidates[0].content.parts[0].text 
        })
    } catch (error) {
        console.error('Gemini API Error:', error)
        return Response.json(
            { error: 'Failed to generate response' }, 
            { status: 500 }
        )
    }
}