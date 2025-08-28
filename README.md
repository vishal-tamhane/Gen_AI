# GEN_AI Projects Collection

This repository contains various AI and Machine Learning projects focusing on different aspects of Generative AI and Language Models.

## Key Projects

### 1. Legal_EaseChatBot
A specialized chatbot built for legal assistance:
- Uses RAG (Retrieval Augmented Generation) architecture
- Integrates with legal database (`legal_database.json`)
- Provides accurate legal information and guidance
- Built with Node.js and modern AI technologies

### 2. Lecture_RAG
An advanced Document Question-Answering system:
- Implements RAG (Retrieval Augmented Generation) for accurate responses
- Features:
  - PDF document processing and chunking
  - Vector embeddings using Google's Generative AI
  - Pinecone vector database integration
  - Smart query transformation
  - Context-aware responses
- Tech Stack:
  - Google Generative AI for embeddings and text generation
  - Pinecone for vector storage and similarity search
  - LangChain for document processing

### 3. Cursor Project
An intelligent website builder assistant:
- Interactive CLI tool for website creation
- Features:
  - Natural language processing for understanding user requirements
  - Automated file and directory creation
  - HTML, CSS, and JavaScript code generation
  - Real-time command execution
- Uses Google's Gemini API for intelligent responses

### 4. Weather Application
A CLI-based weather information system:
- Real-time weather data retrieval
- Command-line interface for easy access
- Integration with weather APIs
- Built with Node.js

## Getting Started

Each project has its own dependencies and setup requirements. To run any project:

1. Navigate to the project directory:
```bash
cd project_name
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
- Create a `.env` file in the project directory
- Add required API keys and configurations

4. Run the project:
```bash
node index.js
```

## Environment Variables

Each project requires specific environment variables. Common ones include:
- `GOOGLE_API_KEY` - For Google's Generative AI
- `PINECONE_API_KEY` - For Pinecone vector database
- `PINECONE_INDEX_NAME` - Pinecone index configuration

## Project Structure

```
GEN_AI/
├── Legal_EaseChatBot/     # Legal assistance chatbot
├── Lecture_RAG/           # Document QA system
├── Cursor/                # Website builder assistant
├── Lecture_3/            # Weather application
└── ...
```

## Technologies Used

- Node.js
- Google Generative AI (Gemini)
- Pinecone Vector Database
- LangChain
- Various NPM packages

## Note

Make sure to check individual project directories for specific setup instructions and requirements.
