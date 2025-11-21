# Contract Autofill Service

A comprehensive contract analysis and autofill service for real estate documents that uses LLM-powered extraction to automatically populate contract fields with confidence scoring and manual review capabilities.

## Features

- **PDF Document Processing**: Upload and extract text from real estate contracts
- **LLM-Powered Analysis**: Uses OpenAI GPT-4 or Claude to analyze contracts and extract structured data
- **Property Data Integration**: Auto-fill known fields from property information
- **Confidence Scoring**: Each extracted field includes confidence scores and source tracking
- **Review UI**: Interactive interface for reviewing, editing, and validating extracted fields
- **RESTful API**: Complete backend API for contract analysis operations
- **Database Persistence**: SQLite database for storing documents, properties, and contract drafts

## Architecture

### Backend (Node.js/TypeScript)
- **Express.js** server with REST API
- **SQLite** database with better-sqlite3
- **PDF processing** with pdf-parse
- **LLM integration** with OpenAI and Anthropic APIs
- **File upload** handling with multer

### Frontend (React/TypeScript)
- **Material-UI** components for responsive design
- **React Query** for data fetching and caching
- **React Dropzone** for file uploads
- **Confidence indicators** and field editors
- **Step-by-step workflow** for contract analysis

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- OpenAI API key (optional)
- Anthropic API key (optional)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd contract-autofill-service
```

2. Install dependencies:
```bash
npm install
cd client && npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys and configuration
```

4. Start the development servers:
```bash
npm run dev
```

This will start both the backend server (port 3001) and frontend development server (port 3000).

## API Endpoints

### Documents
- `POST /api/documents/upload` - Upload a PDF document
- `GET /api/documents/:documentId` - Get document details
- `DELETE /api/documents/:documentId` - Delete a document

### Properties
- `POST /api/documents/properties` - Create a property record
- `GET /api/documents/properties/:propertyId` - Get property details
- `PUT /api/documents/properties/:propertyId` - Update property

### Contract Analysis
- `POST /api/contracts/analyze` - Analyze a contract document
- `GET /api/contracts/drafts/:draftId` - Get contract draft
- `PUT /api/contracts/drafts/:draftId/fields/:fieldName` - Update a field
- `POST /api/contracts/drafts/:draftId/complete` - Mark contract as completed
- `GET /api/contracts/documents/:documentId/drafts` - Get all drafts for a document

## Usage

1. **Upload Document**: Use the UI to upload a PDF contract document
2. **Enter Property Information**: Provide property details (address, price, etc.)
3. **Analyze Contract**: Choose LLM provider and trigger analysis
4. **Review Results**: Review extracted fields with confidence scores
5. **Edit Fields**: Manually correct or update any fields as needed
6. **Complete Contract**: Mark the analysis as complete when satisfied

## Configuration

### Environment Variables

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database
DATABASE_PATH=./data/contracts.db

# LLM API Keys
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# API Configuration
API_BASE_URL=http://localhost:3001
```

## Database Schema

The service uses SQLite with three main tables:

- **documents**: Stores uploaded PDF files and extracted text
- **properties**: Stores property information
- **contract_drafts**: Stores contract analysis results and extracted fields

## Contract Fields

The system extracts and validates the following fields:

### Required Fields
- Property Address
- Purchase Price
- Buyer Name
- Seller Name
- Closing Date

### Optional Fields
- Possession Date
- Earnest Money
- Financing Type
- Contingency Period
- Inspection Period
- Appraisal Contingency
- Loan Contingency
- Property Type
- Square Footage
- Bedrooms/Bathrooms
- Parcel ID
- Legal Description
- HOA Information
- Property Taxes
- Seller Credits
- Closing Costs
- Title Company
- Escrow Officer
- Broker Name
- Special Conditions

## Development

### Backend Development
```bash
npm run server:dev
```

### Frontend Development
```bash
npm run client:dev
```

### Building
```bash
npm run build
```

### Testing
```bash
npm test
```

## LLM Integration

The service supports both OpenAI and Anthropic models:

- **OpenAI GPT-4**: Default provider, excellent for structured data extraction
- **Anthropic Claude**: Alternative provider with strong reasoning capabilities

The system uses function calling and structured JSON schemas to ensure consistent output formatting.

## File Structure

```
├── src/
│   ├── controllers/     # API route handlers
│   ├── services/        # Business logic services
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Express middleware
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
├── client/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API service functions
│   │   ├── types/       # TypeScript types
│   │   └── hooks/       # Custom React hooks
│   └── public/          # Static assets
└── data/                # SQLite database directory
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.