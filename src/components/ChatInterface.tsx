import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { messages, telemetry } = await req.json();

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
            content: `Eres Curie, asistente médico de Visionary AI. Abraham pesa ${telemetry.weight}kg. Tu objetivo es llevarlo a 80kg (Protocolo Rikishi). Sé técnico y breve.` 
          },
          ...messages
        ],
      }),
    });

    const data = await response.json();

    // Si Groq respondió bien (como dice tu log), extraemos el texto
    if (data.choices && data.choices[0]?.message?.content) {
      return NextResponse.json({ 
        content: data.choices[0].message.content 
      });
    }

    // Si por algo el JSON viene mal, enviamos el error detallado
    return NextResponse.json({ content: "Error en formato de Groq" }, { status: 500 });

  } catch (error: any) {
    return NextResponse.json({ content: "Error de servidor: " + error.message }, { status: 500 });
  }
}