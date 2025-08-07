# Overview

This is a KYC (Know Your Customer) client onboarding platform that provides a secure, automated document verification system. The application allows clients to submit their basic information and upload identity documents (PAN and Aadhaar cards), which are then processed through OCR extraction and government API verification. The system includes real-time status tracking and a comprehensive dashboard for monitoring all onboarding activities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The client-side application is built using React with TypeScript, providing a modern single-page application experience. The UI leverages Radix UI components styled with Tailwind CSS for a consistent, accessible design system. The application follows a component-based architecture with:

- **Multi-step Form Flow**: A guided onboarding process with progress indicators
- **State Management**: React Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe forms
- **File Upload**: Custom drag-and-drop file upload components with validation

## Backend Architecture

The server follows a REST API pattern built on Express.js with TypeScript. The architecture includes:

- **API Layer**: RESTful endpoints for onboarding creation, document upload, and status tracking
- **Storage Abstraction**: Interface-based storage layer supporting both in-memory and future database implementations
- **File Processing**: Multer for handling multipart file uploads with size and type validation
- **External Integration**: HTTP client for communicating with N8N workflow automation platform
- **Development Tools**: Vite integration for hot reloading and development server

## Data Storage

The application uses a flexible storage pattern with Drizzle ORM configured for PostgreSQL. The schema defines:

- **KYC Onboardings Table**: Comprehensive tracking of client data, document URLs, validation statuses, and verification results
- **JSON Fields**: Flexible storage for OCR data, verification results, and error details
- **Status Tracking**: Multi-stage validation flags for basic info, OCR processing, and API verification

## Workflow Integration

The system integrates with N8N for automated document processing workflows. The workflow handles:

- **Document Upload**: Files are uploaded to Google Drive for secure storage
- **OCR Processing**: Mindee API extracts text data from uploaded documents
- **Government Verification**: PAN and Aadhaar validation through official APIs
- **Status Updates**: Real-time status callbacks to update the application database

## Authentication and Security

File upload security is implemented through:

- **File Type Validation**: Only JPEG, PNG, and PDF files are accepted
- **Size Limits**: 5MB maximum file size to prevent abuse
- **Memory Storage**: Files are processed in memory without disk storage
- **Input Validation**: Comprehensive validation for PAN format, Aadhaar format, and personal information

# External Dependencies

## Database
- **Neon Database**: Serverless PostgreSQL database for production deployment
- **Drizzle ORM**: Type-safe database queries and migrations

## UI Components
- **Radix UI**: Accessible component primitives for building the user interface
- **Tailwind CSS**: Utility-first CSS framework for styling
- **shadcn/ui**: Pre-built component library based on Radix UI

## File Processing
- **Multer**: Node.js middleware for handling file uploads
- **React Dropzone**: Drag-and-drop file upload functionality

## Workflow Automation
- **N8N**: External workflow automation platform for document processing
- **Mindee API**: OCR service for extracting data from identity documents
- **Google Drive API**: Document storage and management

## Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across the entire application
- **React Query**: Server state management and caching
- **Zod**: Runtime type validation and schema definition

## Form Management
- **React Hook Form**: Performant form handling with minimal re-renders
- **Hookform Resolvers**: Integration between React Hook Form and Zod validation