'use client';

import { useRef, useEffect, useState } from 'react';
import { Send, Bot, User, Loader2, AlertCircle, Book, RefreshCw } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatBot() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUserMessage, setLastUserMessage] = useState<string>('');
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleRetry = () => {
    if (lastUserMessage && !isLoading) {
      setInput(lastUserMessage);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setLastUserMessage(input.trim());
    setInput('');
    setIsLoading(true);
    setError(null);

    // Timeout de 30 segundos
    const timeoutId = setTimeout(() => {
      setError(new Error('La solicitud está tardando mucho. Verifica tu conexión o intenta de nuevo.'));
      setIsLoading(false);
    }, 30000);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error || `Error del servidor (${response.status})`;
        throw new Error(errorMessage);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No se pudo establecer la conexión con el servidor');

      const decoder = new TextDecoder();
      let assistantMessage = '';
      let hasReceivedData = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        assistantMessage += chunk;
        hasReceivedData = true;

        // Update the last message (assistant's response)
        setMessages([...newMessages, { role: 'assistant', content: assistantMessage }]);
      }

      // Check if we received any data
      if (!hasReceivedData || assistantMessage.trim().length === 0) {
        throw new Error('No recibí ninguna respuesta del servidor. Puede haber un problema con la API key o el modelo seleccionado.');
      }
      
      clearTimeout(timeoutId);
    } catch (err) {
      clearTimeout(timeoutId);
      console.error('Chat error:', err);
      
      const errorObj = err instanceof Error ? err : new Error('Error desconocido al procesar el mensaje');
      setError(errorObj);
      
      // Don't add error to messages, just show error state
      // This prevents duplicate error display
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden h-[600px] flex flex-col">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 p-4 text-white">
        <div className="flex items-center gap-3">
          <Book className="w-6 h-6" />
          <div>
            <h2 className="font-semibold">AI Book Advisor</h2>
            <p className="text-xs text-blue-100">
              {isLoading ? 'Buscando libros...' : 'Listo para recomendarte libros'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
            <Book className="w-12 h-12 mx-auto mb-4 text-purple-500" />
            <h3 className="text-lg font-medium mb-2">
              ¡Hola! Soy tu asesor de libros con IA
            </h3>
            <p className="text-sm mb-4">
              Puedo ayudarte a descubrir libros, gestionar tu lista de lectura y seguir tus estadísticas
            </p>
            <div className="text-xs text-left max-w-md mx-auto bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="font-semibold mb-2">Prueba preguntando:</p>
              <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                <li>• "Recomiéndame libros de ciencia ficción"</li>
                <li>• "Busca novelas de Gabriel García Márquez"</li>
                <li>• "Agrega ese libro a mi lista"</li>
                <li>• "Muéstrame mi lista de lectura"</li>
                <li>• "Muéstrame mis estadísticas"</li>
              </ul>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="shrink-0">
                <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              </div>
            )}
            
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-linear-to-r from-blue-600 to-purple-600 text-white ml-auto'
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
              <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="max-w-[80%] rounded-lg px-4 py-2 bg-gray-100 dark:bg-gray-700">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Pensando...
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Error messages */}
        {error && (
          <div className="flex gap-3 justify-start">
            <div className="shrink-0">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="max-w-[80%] rounded-lg px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <div className="flex items-start gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-red-700 dark:text-red-300 mb-1">
                    Error de Conexión
                  </p>
                  <p className="text-red-600 dark:text-red-400">
                    {error.message || 'No pude procesar tu mensaje. Intentá de nuevo.'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200 font-medium transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Reintentar
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="border-t dark:border-gray-700 p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pregunta sobre libros, tu lista de lectura o estadísticas..."
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-all"
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
