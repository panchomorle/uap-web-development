import { NextRequest, NextResponse } from 'next/server';
import { SecurityValidator, SecurityLogger } from '../../utils/security';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { tools } from '@/lib/tools';

// Configuración del runtime para Edge (más rápido para streaming)
export const runtime = 'edge';

// Maximum duration for serverless function
export const maxDuration = 30;

// Configurar el cliente OpenAI para usar OpenRouter
const openrouter = createOpenAI({
  name: 'openrouter',
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
  headers: {
    'HTTP-Referer': 'http://localhost:3000',
    'X-Title': 'AI Book Advisor',
  },
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
    const model = process.env.OPENROUTER_MODEL || 'google/gemini-flash-1.5';

    // Realizar la request con tool calling usando Vercel AI SDK
    const result = streamText({
      model: openrouter(model),
      messages: sanitizedMessages,
      tools,
      system: `You are an AI Book Advisor assistant. You help users discover books, manage their reading lists, and track their reading habits.

You have access to the following tools:
1. searchBooks - Search for books by title, author, subject, or keywords
2. getBookDetails - Get detailed information about a specific book
3. addToReadingList - Add a book to the user's reading list
4. getReadingList - View the user's reading list
5. markAsRead - Mark a book as read with optional rating and review
6. getReadingStats - View reading statistics and analytics

When users ask about books:
- Use searchBooks to find books based on their interests
- Use getBookDetails to provide more information about specific books
- Proactively suggest adding books to their reading list
- Help them track their reading progress

Be conversational, friendly, and helpful. When presenting book information, highlight interesting details like ratings, page count, and descriptions. Always confirm actions like adding books to lists or marking them as read.

Respond in Spanish when the user writes in Spanish, and in English when they write in English.`,
    });

    // Log de request exitosa
    SecurityLogger.logSecurityEvent('successful_chat_request', {
      clientId,
      messageCount: sanitizedMessages.length,
      model,
      duration: Date.now() - startTime
    });

    // Retornar la respuesta de streaming
    return result.toTextStreamResponse();
    
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
      // Errores de validación
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
      
      // Errores de API de OpenRouter
      if (error.message.includes('API') || 
          error.message.includes('endpoints') ||
          error.message.includes('No endpoints found')) {
        return NextResponse.json(
          { 
            error: 'Error de configuración del modelo de IA. Verifica que el modelo esté disponible en OpenRouter.',
            details: error.message
          },
          { status: 503 }
        );
      }
      
      // Errores de autenticación
      if (error.message.includes('auth') || 
          error.message.includes('API key') ||
          error.message.includes('unauthorized')) {
        return NextResponse.json(
          { error: 'Error de autenticación. Verifica que la API key sea válida.' },
          { status: 401 }
        );
      }
    }
    
    // Error genérico para no exponer detalles internos
    return NextResponse.json(
      { 
        error: 'Error interno del servidor. Intentá de nuevo más tarde.',
        type: error instanceof Error ? error.constructor.name : 'UnknownError'
      },
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
