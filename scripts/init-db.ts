import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Initializing database...')

  // Test database connection
  try {
    await prisma.$connect()
    console.log('✓ Database connection successful')
  } catch (error) {
    console.error('✗ Database connection failed:', error)
    process.exit(1)
  }

  // Check if tables exist
  try {
    const documentCount = await prisma.document.count()
    console.log(`✓ Found ${documentCount} existing documents`)
  } catch (error) {
    console.log('! Documents table may not exist yet - run migrations first')
  }

  console.log('Database initialization complete')
}

main()
  .catch((e) => {
    console.error('Database initialization failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })