'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, AlertCircle } from 'lucide-react';
import { SecurityValidator } from '../utils/security';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatBot() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Manejar cambios en el input con validación en tiempo real
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Validación básica del lado del cliente
    if (value.length > 500) {
      setValidationError('Mensaje demasiado largo (máximo 500 caracteres)');
      return;
    }
    
    // Limpiar error de validación si existe
    if (validationError) {
      setValidationError('');
    }
    
    setInput(value);
  };

  // Función para hacer streaming del response
  const streamResponse = async (reader: ReadableStreamDefaultReader<Uint8Array>, userMessage: Message) => {
    const decoder = new TextDecoder();
    let assistantMessage: Message = {
      id: Date.now().toString() + '-assistant',
      role: 'assistant',
      content: ''
    };
    
    // Agregar mensaje del asistente vacío
    setMessages(prev => [...prev, assistantMessage]);
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        console.log('Received chunk:', chunk); // Debug log
        
        // El AI SDK envía texto plano en chunks, no JSON
        if (chunk.trim()) {
          assistantMessage.content += chunk;
          
          // Actualizar el mensaje del asistente
          setMessages(prev => 
            prev.map(msg => 
              msg.id === assistantMessage.id 
                ? { ...msg, content: assistantMessage.content }
                : msg
            )
          );
        }
      }
    } catch (streamError) {
      console.error('Stream error:', streamError);
      setError('Error al recibir la respuesta');
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (isLoading || !input.trim()) return;
    
    // Validación del lado del cliente antes de enviar
    const validation = SecurityValidator.sanitizeInput(input);
    if (!validation.isValid) {
      setValidationError(validation.error || 'Input inválido');
      return;
    }
    
    // Limpiar errores previos
    setValidationError('');
    setError('');
    
    // Crear mensaje del usuario
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    };
    
    // Agregar mensaje del usuario
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    
    try {
      // Hacer request al API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      // Verificar si la respuesta es streaming
      if (response.body) {
        const reader = response.body.getReader();
        await streamResponse(reader, userMessage);
      }
      
    } catch (err) {
      console.error('Chat error:', err);
      setError(err instanceof Error ? err.message : 'Error al enviar mensaje');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden h-[600px] flex flex-col">
      {/* Header */}
      <div className="bg-blue-600 dark:bg-blue-700 p-4 text-white">
        <div className="flex items-center gap-3">
          <Bot className="w-6 h-6" />
          <div>
            <h2 className="font-semibold">AI Assistant</h2>
            <p className="text-xs text-blue-100">
              {isLoading ? 'Escribiendo...' : 'En línea'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
            <Bot className="w-12 h-12 mx-auto mb-4 text-blue-500" />
            <h3 className="text-lg font-medium mb-2">
              ¡Hola! Soy tu asistente de IA
            </h3>
            <p className="text-sm">
              Haceme cualquier pregunta para comenzar la conversación
            </p>
          </div>
        )}

        {messages.map((message: any) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              </div>
            )}
            
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white ml-auto'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>

            {message.role === 'user' && (
              <div className="shrink-0">
                <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="max-w-[80%] rounded-lg px-4 py-2 bg-gray-100 dark:bg-gray-700">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Pensando...
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Error messages */}
        {error && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4" />
              <span><strong>Error:</strong> {error || 'No pude procesar tu mensaje. Intentá de nuevo.'}</span>
            </div>
          </div>
        )}
        
        {validationError && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 px-4 py-2 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{validationError}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="border-t dark:border-gray-700 p-4">
        <form onSubmit={onSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Escribe tu mensaje aquí..."
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        
        {/* Character counter */}
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right">
          {input.length}/500 caracteres
        </div>
      </div>
    </div>
  );
}
