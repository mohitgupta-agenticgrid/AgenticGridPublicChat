# cityGraph n8n Workflow Documentation

## Overview

This n8n workflow integrates with your cityGraph GitHub repository and provides two main functionalities:
1. **Chat Interface** - Process chat messages and provide responses
2. **Address Extraction** - Extract addresses from files in your GitHub repository

## Workflow Architecture

```
Webhook Trigger
    ├── Is Chat Request? ──> Process Chat ──> Respond Chat
    ├── Is Address Extract? ──> Fetch GitHub Files ──> Decode ──> Extract Addresses ──> Respond
    └── Invalid Action ──> Respond Error
```

## Setup Instructions

### Prerequisites
- n8n instance (cloud or self-hosted)
- GitHub Personal Access Token
- Python 3.x (for deployment script)

### Step 1: Deploy the Workflow

#### Option A: Using Python Script (Recommended)
```bash
# Make the script executable
chmod +x deploy_n8n_workflow.py

# Run the deployment script
python3 deploy_n8n_workflow.py
# Or specify your n8n URL directly
python3 deploy_n8n_workflow.py https://your-n8n-instance.com
```

#### Option B: Manual Import
1. Log in to your n8n instance
2. Click "Add Workflow" → "Import from File"
3. Select `cityGraph_n8n_workflow.json`
4. Click "Import"

### Step 2: Configure GitHub Authentication

1. In n8n, go to **Credentials** → **Add Credential**
2. Select **Header Auth**
3. Name it: `GitHub Auth`
4. Configure:
   - **Name**: `Authorization`
   - **Value**: `token YOUR_GITHUB_TOKEN`

   To get a GitHub token:
   - Go to GitHub Settings → Developer Settings → Personal Access Tokens
   - Generate new token with `repo` scope
   - Copy the token

### Step 3: Activate the Workflow

1. Open the `cityGraph_n8n` workflow
2. Click **Save**
3. Click **Activate** (toggle in top-right)
4. Copy the **Webhook URL** (it will be shown in the Webhook Trigger node)

## API Usage

### Webhook URL Format
```
https://your-n8n-instance.com/webhook/citygraph-webhook
```

### 1. Chat Request

Send a POST request to interact with the chat functionality:

```bash
curl -X POST https://your-n8n-instance.com/webhook/citygraph-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "action": "chat",
    "message": "Hello, I need help with address extraction",
    "user_id": "user123",
    "session_id": "session456"
  }'
```

**Response:**
```json
{
  "success": true,
  "action": "chat",
  "data": {
    "user_id": "user123",
    "session_id": "session456",
    "user_message": "Hello, I need help with address extraction",
    "bot_response": "I can help you extract addresses from files...",
    "timestamp": "2024-12-10T10:30:00.000Z",
    "context": "citygraph_chat"
  }
}
```

### 2. Address Extraction Request

Extract addresses from a file in your GitHub repository:

```bash
curl -X POST https://your-n8n-instance.com/webhook/citygraph-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "action": "extract_address",
    "file_path": "data/addresses.txt"
  }'
```

**Response:**
```json
{
  "success": true,
  "action": "extract_address",
  "data": {
    "file_name": "addresses.txt",
    "file_path": "data/addresses.txt",
    "extracted_addresses": [
      "123 Main St, New York, NY 10001",
      "456 Oak Avenue, Los Angeles, CA 90001"
    ],
    "address_count": 2,
    "extraction_timestamp": "2024-12-10T10:30:00.000Z"
  }
}
```

## Workflow Features

### Chat Processing
- Handles user messages
- Provides contextual responses
- Maintains session tracking
- Can be extended with LLM integration (OpenAI, Anthropic, etc.)

### Address Extraction
- Fetches files from GitHub repository
- Decodes base64 content
- Uses regex patterns to extract addresses
- Supports multiple address formats:
  - Street addresses (123 Main St, City, ST 12345)
  - City, State ZIP (New York, NY 10001)
  - Full addresses

### GitHub Integration
- Reads repository structure
- Fetches file contents
- Supports all file types
- Works with private repositories (with proper authentication)

## Extending the Workflow

### Adding LLM Integration for Chat

1. Add an **OpenAI** or **Anthropic** node after "Process Chat"
2. Connect it to process the user message
3. Update the response logic

Example for OpenAI:
```javascript
// In the Process Chat node
const openAIPrompt = `You are a helpful assistant for cityGraph.
User question: ${userMessage}
Provide a helpful response.`;
```

### Custom Address Patterns

Edit the "Extract Addresses" node to add custom regex patterns:

```javascript
const customPatterns = [
  /your-custom-pattern/gi,
  // Add more patterns here
];
```

### Adding Database Storage

1. Add a database node (PostgreSQL, MySQL, MongoDB, etc.)
2. Connect after processing nodes
3. Store chat history or extracted addresses

## Testing the Workflow

### Test Chat Functionality
```bash
# Test with the provided script
python3 test_citygraph_workflow.py chat "Hello, how are you?"
```

### Test Address Extraction
```bash
# Extract addresses from a specific file
python3 test_citygraph_workflow.py extract data/sample.txt
```

## Troubleshooting

### Issue: Webhook not responding
- Check if workflow is activated
- Verify webhook URL is correct
- Check n8n logs

### Issue: GitHub authentication fails
- Verify GitHub token is valid
- Check token has `repo` scope
- Ensure credential name matches in nodes

### Issue: No addresses extracted
- Verify file path is correct
- Check file contains text data
- Review regex patterns in Extract Addresses node

## Security Considerations

1. **API Key Protection**: Never commit API keys to version control
2. **GitHub Token**: Use tokens with minimal required scopes
3. **Webhook Security**: Consider adding authentication to webhook
4. **Data Privacy**: Be cautious with sensitive address data

## Support

For issues or questions:
1. Check n8n execution logs
2. Review node configurations
3. Test with manual execution in n8n UI

## File Structure

```
.
├── cityGraph_n8n_workflow.json     # Main workflow definition
├── deploy_n8n_workflow.py          # Deployment script
├── test_citygraph_workflow.py      # Testing script
└── CITYGRAPH_N8N_README.md         # This documentation
```

## Next Steps

1. ✅ Deploy the workflow
2. ✅ Configure GitHub authentication
3. ✅ Test chat functionality
4. ✅ Test address extraction
5. 🔄 Integrate with your application
6. 🔄 Add LLM for smarter chat responses
7. 🔄 Add database for persistence
8. 🔄 Implement error handling and logging
