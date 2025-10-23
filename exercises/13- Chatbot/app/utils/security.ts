/**
 * Utilidades de seguridad para validación y sanitización de inputs
 * Siguiendo las mejores prácticas de seguridad para aplicaciones web
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitized?: string;
}

export class SecurityValidator {
  private static readonly MAX_MESSAGE_LENGTH = 4000;
  private static readonly MIN_MESSAGE_LENGTH = 1;
  
  // Patrones peligrosos que debemos evitar
  private static readonly DANGEROUS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // Scripts
    /javascript:/gi, // JavaScript URLs
    /on\w+\s*=/gi, // Event handlers
    /<iframe\b[^>]*>/gi, // iframes
    /<object\b[^>]*>/gi, // Objects
    /<embed\b[^>]*>/gi, // Embeds
    /<link\b[^>]*>/gi, // Links
    /<meta\b[^>]*>/gi, // Meta tags
  ];

  /**
   * Sanitiza el input del usuario removiendo caracteres peligrosos
   */
  static sanitizeInput(input: unknown): ValidationResult {
    // Verificar que el input sea string
    if (typeof input !== 'string') {
      return {
        isValid: false,
        error: 'El input debe ser texto'
      };
    }

    // Remover espacios al inicio y final
    let sanitized = input.trim();

    // Verificar longitud mínima
    if (sanitized.length < this.MIN_MESSAGE_LENGTH) {
      return {
        isValid: false,
        error: 'El mensaje no puede estar vacío'
      };
    }

    // Verificar longitud máxima
    if (sanitized.length > this.MAX_MESSAGE_LENGTH) {
      sanitized = sanitized.slice(0, this.MAX_MESSAGE_LENGTH);
    }

    // Detectar y remover patrones peligrosos
    for (const pattern of this.DANGEROUS_PATTERNS) {
      if (pattern.test(sanitized)) {
        return {
          isValid: false,
          error: 'El mensaje contiene contenido no permitido'
        };
      }
    }

    // Escapar caracteres HTML básicos
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');

    return {
      isValid: true,
      sanitized
    };
  }

  /**
   * Valida un array de mensajes
   */
  static validateMessages(messages: unknown): ValidationResult {
    if (!Array.isArray(messages)) {
      return {
        isValid: false,
        error: 'Los mensajes deben ser un array'
      };
    }

    if (messages.length === 0) {
      return {
        isValid: false,
        error: 'Debe haber al menos un mensaje'
      };
    }

    if (messages.length > 50) {
      return {
        isValid: false,
        error: 'Demasiados mensajes en la conversación'
      };
    }

    for (const message of messages) {
      const messageValidation = this.validateMessage(message);
      if (!messageValidation.isValid) {
        return messageValidation;
      }
    }

    return { isValid: true };
  }

  /**
   * Valida un mensaje individual
   */
  static validateMessage(message: unknown): ValidationResult {
    if (typeof message !== 'object' || message === null) {
      return {
        isValid: false,
        error: 'Formato de mensaje inválido'
      };
    }

    const msg = message as any;

    // Verificar que tenga las propiedades requeridas
    if (!msg.role || !msg.content) {
      return {
        isValid: false,
        error: 'El mensaje debe tener role y content'
      };
    }

    // Verificar roles válidos
    if (!['user', 'assistant', 'system'].includes(msg.role)) {
      return {
        isValid: false,
        error: 'Role de mensaje inválido'
      };
    }

    // Validar el contenido
    const contentValidation = this.sanitizeInput(msg.content);
    if (!contentValidation.isValid) {
      return contentValidation;
    }

    return { isValid: true };
  }

  /**
   * Rate limiting básico (en memoria - para producción usar Redis o similar)
   */
  private static requestCounts = new Map<string, { count: number; resetTime: number }>();
  
  static checkRateLimit(clientId: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const clientData = this.requestCounts.get(clientId);

    if (!clientData || now > clientData.resetTime) {
      this.requestCounts.set(clientId, {
        count: 1,
        resetTime: now + windowMs
      });
      return true;
    }

    if (clientData.count >= maxRequests) {
      return false;
    }

    clientData.count++;
    return true;
  }
}

/**
 * Middleware para logging seguro
 */
export class SecurityLogger {
  static logSecurityEvent(event: string, details: any, level: 'info' | 'warn' | 'error' = 'info') {
    // Remover información sensible antes de loggear
    const sanitizedDetails = this.sanitizeLogData(details);
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      level,
      details: sanitizedDetails
    };

    console.log(`[SECURITY-${level.toUpperCase()}]`, JSON.stringify(logEntry));
  }

  private static sanitizeLogData(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const sanitized = { ...data };
    
    // Remover campos sensibles
    const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'authorization'];
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}
