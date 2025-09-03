# Plataforma de Descubrimiento y Reseñas de Libros

## Deploy en Producción

La aplicación está deployada en: [URL_DE_TU_APP](https://tu-app.vercel.app)

## Deploy Local

1. Instala dependencias:
   ```sh
   npm install
   ```
2. Crea un archivo `.env.local` con las variables de entorno necesarias.
3. Ejecuta en desarrollo:
   ```sh
   npm run dev
   ```
4. Abre [http://localhost:3000](http://localhost:3000)

## Variables de Entorno

- `NEXT_PUBLIC_API_URL`: URL de la API backend
- Otras variables necesarias según tu app

## Ejecutar con Docker

1. Construye la imagen:
   ```sh
   docker build -t mi-next-app .
   ```
2. Ejecuta el contenedor:
   ```sh
   docker run -p 3000:3000 mi-next-app
   ```

## GitHub Actions

- **build.yml**: Hace build en cada Pull Request.
- **test.yml**: Corre los tests en cada Pull Request.
- **docker.yml**: Construye y publica la imagen Docker al mergear en main/master.

Los workflows están en `.github/workflows/` y usan cache de dependencias para acelerar los builds.

## Tests

Para correr los tests localmente:
```sh
npm test
```

## Notas
- Configura las variables de entorno en Vercel y en los secrets de GitHub si es necesario.
- La imagen Docker se publica en GitHub Container Registry (ghcr.io) automáticamente.

Descripción del Proyecto:
Construir una plataforma de descubrimiento y reseñas de libros donde los usuarios pueden buscar libros, ver detalles y compartir reseñas con votación comunitaria.
Características Principales:

Buscar Libros: Búsqueda por título, autor o ISBN usando la API de Google Books
Detalles del Libro: Mostrar imagen de portada, descripción, info del autor, detalles de publicación
Escribir Reseñas: Los usuarios pueden agregar calificaciones (1-5 estrellas) y reseñas escritas
Votación Comunitaria: Votar a favor/en contra de las reseñas para destacar el mejor contenido

APIs Externas a Usar
Principal: **Google Books API**

- **URL:** https://www.googleapis.com/books/v1/volumes
- **Nivel gratuito:** 1,000 requests/día (más que suficiente para proyectos de clase)
- **Autenticación:** No se requiere clave API para uso básico

**Ejemplos de Búsqueda:**

- Por título: `?q=harry+potter`
- Por ISBN: `?q=isbn:9780439708180`
- Por autor: `?q=inauthor:rowling`

**Características:**

- Datos completos: Portadas, descripciones, cantidad de páginas, categorías, info de publicación
- Imágenes de alta calidad: Múltiples tamaños de portada disponibles

**Unit Testing**

- Agregar pruebas unitarias que cubran completamente la lógica de negocios de su aplicación.
- Utilizar vitest en conjunto con testing-library para esto.
- Asegurense de probar todos los edge cases.
- Distinguir claramente qué debe ser mockeado y qué debe probarse directamente.
