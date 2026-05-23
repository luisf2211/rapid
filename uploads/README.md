# Carpeta de uploads local

Las fotos con rutas `/uploads/field/...` en la base de datos se sirven desde aquí.

## Estructura

```
uploads/
  field/          ← fotos de recepción / inspección
    *.jpg
```

## Uso

1. Coloca archivos en `uploads/field/` con el mismo nombre que `PhotoUrl` en SQL Server  
   (ej. `179f9ec8-1ad3-4115-bfba-27ec75c2766e.jpg`).
2. La app los expone en `http://localhost:3000/uploads/field/<archivo>.jpg`.

Configuración en `.env`:

```env
UPLOADS_DIR="./uploads"
```

Los archivos reales están en `.gitignore`; solo se versiona esta carpeta vacía.
