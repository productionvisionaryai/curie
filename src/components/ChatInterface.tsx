import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { messages, telemetry } = await req.json();

    // 1. Llamada a Groq con stream: false
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { 
            role: "system", 
            content: `Eres Curie, asistente médico de Visionary AI. 
            DATOS DEL PACIENTE (Abraham):
            - Peso actual: ${telemetry?.weight || '71'}kg
            - Objetivo: 80kg (Protocolo Rikishi)
            - Estado: ${telemetry?.bpm > 100 ? 'Taquicardia leve' : 'Normal'}.
            Tu tono es técnico, clínico y motivador. Sé breve y directo.` 
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 1024,
        stream: false // <--- OBLIGATORIO: Para que devuelva un JSON sólido
      }),
    });

    const data = await response.json();

    // 2. Validación de respuesta de la API de Groq
    if (data.choices && data.choices[0]?.message?.content) {
      return NextResponse.json({ 
        content: data.choices[0].message.content 
      });
    }

    console.error("Error en formato de Groq:", data);
    return NextResponse.json(
      { content: "Error: Groq no devolvió el formato esperado." }, 
      { status: 500 }
    );

  } catch (error: any) {
    console.error("Error en API Route:", error);
    return NextResponse.json(
      { content: "Error interno del servidor: " + error.message }, 
      { status: 500 }
    );
  }
}