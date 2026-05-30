# Carpeta de uploads local

Las fotos con rutas `/uploads/field/...` en la base de datos se sirven desde aquí.

## Estructura

```
uploads/
  field/          ← fotos de recepción / inspección
    *.jpg
```

## Uso

1. **Desde la app:** en Nueva orden de recepción → pestaña Fotos → **Cargar imágenes**.  
   Los archivos se guardan aquí automáticamente con un nombre UUID.
2. **Manual:** coloca archivos en `uploads/field/` con el mismo nombre que `PhotoUrl` en SQL Server.
3. La app los expone en `http://localhost:3000/uploads/field/<archivo>.jpg`.

Configuración en `.env`:

```env
UPLOADS_DIR="./uploads"
```

Los archivos reales están en `.gitignore`; solo se versiona esta carpeta vacía.
