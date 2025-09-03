# Plataforma de Descubrimiento y Reseñas de Libros

## Deploy en Producción

La aplicación está deployada en: [https://libros-facheros.vercel.app](https://libros-facheros.vercel.app)

---

## Deploy Local

1. Instala dependencias:
   ```sh
   npm install
   ```
2. Crea un archivo `.env.local` con las variables de entorno necesarias (ver sección siguiente).
3. Ejecuta en desarrollo:
   ```sh
   npm run dev
   ```
4. Abre [http://localhost:3000](http://localhost:3000)

---

## Variables de Entorno

- `NEXT_PUBLIC_API_URL`: URL de la API backend (ejemplo: https://api.miapp.com)
- Otras variables necesarias según tu app (agrega aquí si usas autenticación, claves, etc.)

**Importante:** Configura estas variables tanto en Vercel (Production) como en los secrets de GitHub para los workflows.

---

## Ejecutar con Docker

1. Construye la imagen:
   ```sh
   docker build -t mi-next-app .
   ```
2. Ejecuta el contenedor:
   ```sh
   docker run -p 3000:3000 mi-next-app
   ```

---

## GitHub Actions

Los workflows de CI/CD están en `.github/workflows/`:

- **build.yml**: Hace build en cada Pull Request. Instala dependencias, usa cache para acelerar el proceso y falla si el build no es exitoso.
- **test.yml**: Corre los tests unitarios en cada Pull Request. Usa cache y reporta el resultado de los tests.
- **docker.yml**: Cuando se mergea en main/master, construye y publica la imagen Docker en GitHub Container Registry (`ghcr.io`). Usa tags `latest`, versión y commit hash. Utiliza secrets para credenciales sensibles.

Todos los workflows están documentados en sus archivos y usan las versiones más recientes de las actions oficiales.

---

## Cómo funcionan los GitHub Actions

- **Automatización en Pull Requests:** Cada PR dispara los workflows de build y test. Si falla alguno, el PR no puede mergearse.
- **Docker automático:** Al mergear en main/master, se construye y publica la imagen Docker optimizada usando multi-stage build.
- **Cache de dependencias:** Se implementa cache para acelerar builds y tests.
- **Secrets:** Las credenciales y variables sensibles se gestionan con GitHub Secrets.

---

## Demostración de Workflows

- Los checks de GitHub Actions aparecen en cada Pull Request y en los merges a main/master.
- Puedes ver los logs y resultados en la pestaña "Actions" del repositorio.

---

## Tests

Para correr los tests localmente:
```sh
npm test
```
Se usan **vitest** y **testing-library** para cubrir la lógica de negocio y los edge cases.

---

## Proyecto

Plataforma de descubrimiento y reseñas de libros donde los usuarios pueden buscar libros, ver detalles y compartir reseñas con votación comunitaria.

**Características:**
- Buscar libros por título, autor o ISBN (Google Books API)
- Ver detalles completos del libro
- Escribir y votar reseñas (1-5 estrellas)
- Votación comunitaria de reseñas

**API externa:** [Google Books API](https://www.googleapis.com/books/v1/volumes)

---

## Recursos

- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
