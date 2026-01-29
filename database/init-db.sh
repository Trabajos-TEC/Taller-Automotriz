#!/bin/bash

# Script para inicializar la base de datos en Neon
# Este script ejecuta los archivos SQL para crear el schema e insertar datos iniciales

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Inicializando Base de Datos Neon ===${NC}\n"

# Verificar que exista la variable de entorno
if [ -z "$NETLIFY_DATABASE_URL" ]; then
    echo -e "${RED}Error: NETLIFY_DATABASE_URL no está configurada${NC}"
    echo "Por favor, configura las variables de entorno antes de ejecutar este script"
    exit 1
fi

echo -e "${GREEN}✓ Variable de entorno encontrada${NC}\n"

# Ejecutar schema.sql
echo -e "${BLUE}1. Creando tablas...${NC}"
psql "$NETLIFY_DATABASE_URL" -f database/schema.sql

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Tablas creadas exitosamente${NC}\n"
else
    echo -e "${RED}✗ Error al crear tablas${NC}"
    exit 1
fi

# Ejecutar seed.sql
echo -e "${BLUE}2. Insertando datos iniciales...${NC}"
psql "$NETLIFY_DATABASE_URL" -f database/seed.sql

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Datos iniciales insertados${NC}\n"
else
    echo -e "${RED}✗ Error al insertar datos${NC}"
    exit 1
fi

echo -e "${GREEN}=== Base de datos inicializada correctamente ===${NC}"
echo -e "\nPuedes verificar la base de datos en el dashboard de Neon"
