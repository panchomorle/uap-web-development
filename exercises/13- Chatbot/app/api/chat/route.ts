import { NextRequest, NextResponse } from 'next/server';
import { SecurityValidator, SecurityLogger } from '../../utils/security';
import OpenAI from 'openai';

// Configuración del runtime para Edge (más rápido para streaming)
export const runtime = 'edge';

// Configurar el cliente OpenAI para usar OpenRouter
const openai = new OpenAI({
  baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  dangerouslyAllowBrowser: false,
});

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let clientId = 'unknown';
  
  try {
    // Obtener IP para rate limiting (en producción usar headers como X-Forwarded-For)
    clientId = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'localhost';
    
    // Rate limiting básico
    if (!SecurityValidator.checkRateLimit(clientId, 10, 60000)) {
      SecurityLogger.logSecurityEvent('rate_limit_exceeded', { clientId }, 'warn');
      return NextResponse.json(
        { error: 'Demasiadas requests. Intentá de nuevo en un minuto.' },
        { status: 429 }
      );
    }

    // Verificar que la API key esté configurada
    if (!process.env.OPENROUTER_API_KEY) {
      SecurityLogger.logSecurityEvent('missing_api_key', {}, 'error');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Parsear el body de la request
    const body = await req.json();
    const { messages } = body;

    // Validar los mensajes usando SecurityValidator
    const messagesValidation = SecurityValidator.validateMessages(messages);
    if (!messagesValidation.isValid) {
      SecurityLogger.logSecurityEvent('invalid_messages', { 
        clientId, 
        error: messagesValidation.error 
      }, 'warn');
      return NextResponse.json(
        { error: messagesValidation.error },
        { status: 400 }
      );
    }

    // Sanitizar cada mensaje
    const sanitizedMessages = messages.map((message: any) => {
      const contentValidation = SecurityValidator.sanitizeInput(message.content);
      if (!contentValidation.isValid) {
        throw new Error(contentValidation.error);
      }
      
      return {
        role: message.role,
        content: contentValidation.sanitized,
      };
    });

    // Obtener el modelo de las variables de entorno o usar uno por defecto
    const model = process.env.OPENROUTER_MODEL || 'anthropic/claude-3-haiku';

    // Realizar la request de streaming al LLM usando OpenAI client directamente
    const stream = await openai.chat.completions.create({
      model: model,
      messages: sanitizedMessages as any,
      temperature: 0.7,
      stream: true,
    });

    // Log de request exitosa
    SecurityLogger.logSecurityEvent('successful_chat_request', {
      clientId,
      messageCount: sanitizedMessages.length,
      model,
      duration: Date.now() - startTime
    });

    // Crear un ReadableStream para el streaming
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        }
      },
    });

    // Retornar la respuesta de streaming
    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    
    // Log del error de forma segura
    SecurityLogger.logSecurityEvent('chat_api_error', {
      clientId,
      duration,
      errorType: error instanceof Error ? error.constructor.name : 'unknown',
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    }, 'error');
    
    // Manejar diferentes tipos de errores
    if (error instanceof Error) {
      if (error.message.includes('Invalid') || 
          error.message.includes('Empty') || 
          error.message.includes('no permitido') ||
          error.message.includes('debe ser') ||
          error.message.includes('formato')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }
    
    // Error genérico para no exponer detalles internos
    return NextResponse.json(
      { error: 'Error interno del servidor. Intentá de nuevo.' },
      { status: 500 }
    );
  }
}

// Manejar métodos HTTP no permitidos
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
