#!/bin/bash

echo "🚀 Setting up PDF Ingestion System for Development"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Start services
echo "📦 Starting PostgreSQL and MinIO services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Services are running!"
else
    echo "❌ Failed to start services. Check docker-compose logs."
    exit 1
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma migrate dev --name init

# Create MinIO bucket if it doesn't exist
echo "🪣 Creating MinIO bucket..."
docker exec pdf-ingestion-minio-1 mc alias set local http://localhost:9000 minioadmin minioadmin || true
docker exec pdf-ingestion-minio-1 mc mb local/pdf-ingestion --ignore-existing || true

echo ""
echo "🎉 Development setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Copy .env.local.example to .env.local and configure as needed"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Visit http://localhost:3000 to access the application"
echo "4. Visit http://localhost:9001 to access MinIO console (minioadmin/minioadmin)"
echo ""
echo "🛑 To stop services: docker-compose down"