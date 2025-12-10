# cityGraph n8n Workflow Integration Examples

This document provides examples of how to integrate the cityGraph n8n workflow with various applications and frameworks.

## Table of Contents
1. [JavaScript/Node.js Integration](#javascriptnodejs-integration)
2. [Python Integration](#python-integration)
3. [React Frontend Integration](#react-frontend-integration)
4. [cURL Examples](#curl-examples)
5. [Postman Collection](#postman-collection)

---

## JavaScript/Node.js Integration

### Basic Setup
```javascript
const axios = require('axios');

const N8N_WEBHOOK_URL = 'https://your-n8n-instance.com/webhook/citygraph-webhook';

class CityGraphClient {
  constructor(webhookUrl) {
    this.webhookUrl = webhookUrl;
  }

  async sendChatMessage(message, userId, sessionId = null) {
    try {
      const response = await axios.post(this.webhookUrl, {
        action: 'chat',
        message: message,
        user_id: userId,
        session_id: sessionId || `session_${Date.now()}`
      });

      return response.data;
    } catch (error) {
      console.error('Chat error:', error.message);
      throw error;
    }
  }

  async extractAddresses(filePath) {
    try {
      const response = await axios.post(this.webhookUrl, {
        action: 'extract_address',
        file_path: filePath
      });

      return response.data;
    } catch (error) {
      console.error('Address extraction error:', error.message);
      throw error;
    }
  }
}

// Usage
const client = new CityGraphClient(N8N_WEBHOOK_URL);

// Example 1: Send chat message
client.sendChatMessage('Hello!', 'user123')
  .then(result => console.log('Chat response:', result))
  .catch(err => console.error(err));

// Example 2: Extract addresses
client.extractAddresses('data/addresses.txt')
  .then(result => console.log('Extracted addresses:', result.data.extracted_addresses))
  .catch(err => console.error(err));
```

### Express.js API Integration
```javascript
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const N8N_WEBHOOK_URL = 'https://your-n8n-instance.com/webhook/citygraph-webhook';

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, userId, sessionId } = req.body;

    const response = await axios.post(N8N_WEBHOOK_URL, {
      action: 'chat',
      message: message,
      user_id: userId,
      session_id: sessionId
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Address extraction endpoint
app.post('/api/extract-addresses', async (req, res) => {
  try {
    const { filePath } = req.body;

    const response = await axios.post(N8N_WEBHOOK_URL, {
      action: 'extract_address',
      file_path: filePath
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

---

## Python Integration

### Basic Setup
```python
import requests
from typing import Optional, Dict, Any
from datetime import datetime

class CityGraphClient:
    def __init__(self, webhook_url: str):
        self.webhook_url = webhook_url

    def send_chat_message(
        self,
        message: str,
        user_id: str,
        session_id: Optional[str] = None
    ) -> Dict[Any, Any]:
        """Send a chat message to the n8n workflow"""
        if session_id is None:
            session_id = f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

        payload = {
            "action": "chat",
            "message": message,
            "user_id": user_id,
            "session_id": session_id
        }

        response = requests.post(self.webhook_url, json=payload, timeout=30)
        response.raise_for_status()

        return response.json()

    def extract_addresses(self, file_path: str) -> Dict[Any, Any]:
        """Extract addresses from a GitHub file"""
        payload = {
            "action": "extract_address",
            "file_path": file_path
        }

        response = requests.post(self.webhook_url, json=payload, timeout=30)
        response.raise_for_status()

        return response.json()

# Usage
if __name__ == "__main__":
    client = CityGraphClient("https://your-n8n-instance.com/webhook/citygraph-webhook")

    # Example 1: Send chat message
    result = client.send_chat_message("Hello!", "user123")
    print("Chat response:", result['data']['bot_response'])

    # Example 2: Extract addresses
    result = client.extract_addresses("data/addresses.txt")
    print("Extracted addresses:", result['data']['extracted_addresses'])
```

### FastAPI Integration
```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests

app = FastAPI()

N8N_WEBHOOK_URL = "https://your-n8n-instance.com/webhook/citygraph-webhook"

class ChatRequest(BaseModel):
    message: str
    user_id: str
    session_id: str = None

class AddressExtractionRequest(BaseModel):
    file_path: str

@app.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        response = requests.post(N8N_WEBHOOK_URL, json={
            "action": "chat",
            "message": request.message,
            "user_id": request.user_id,
            "session_id": request.session_id
        })
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/extract-addresses")
async def extract_addresses(request: AddressExtractionRequest):
    try:
        response = requests.post(N8N_WEBHOOK_URL, json={
            "action": "extract_address",
            "file_path": request.file_path
        })
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=str(e))
```

---

## React Frontend Integration

### Custom Hook
```javascript
import { useState, useCallback } from 'react';
import axios from 'axios';

const N8N_WEBHOOK_URL = 'https://your-n8n-instance.com/webhook/citygraph-webhook';

export const useCityGraph = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendChatMessage = useCallback(async (message, userId, sessionId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(N8N_WEBHOOK_URL, {
        action: 'chat',
        message,
        user_id: userId,
        session_id: sessionId || `session_${Date.now()}`
      });

      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, []);

  const extractAddresses = useCallback(async (filePath) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(N8N_WEBHOOK_URL, {
        action: 'extract_address',
        file_path: filePath
      });

      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, []);

  return {
    loading,
    error,
    sendChatMessage,
    extractAddresses
  };
};
```

### Chat Component Example
```javascript
import React, { useState, useEffect } from 'react';
import { useCityGraph } from './hooks/useCityGraph';

const ChatComponent = ({ userId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId] = useState(`session_${Date.now()}`);
  const { loading, error, sendChatMessage } = useCityGraph();

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message to UI
    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      // Send to n8n workflow
      const result = await sendChatMessage(input, userId, sessionId);

      // Add bot response to UI
      const botMessage = {
        role: 'assistant',
        content: result.data.bot_response,
        timestamp: result.data.timestamp
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <p>{msg.content}</p>
            <span className="timestamp">{new Date(msg.timestamp).toLocaleTimeString()}</span>
          </div>
        ))}
      </div>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSendMessage}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default ChatComponent;
```

### Address Extraction Component
```javascript
import React, { useState } from 'react';
import { useCityGraph } from './hooks/useCityGraph';

const AddressExtractor = () => {
  const [filePath, setFilePath] = useState('');
  const [addresses, setAddresses] = useState([]);
  const { loading, error, extractAddresses } = useCityGraph();

  const handleExtract = async (e) => {
    e.preventDefault();
    if (!filePath.trim()) return;

    try {
      const result = await extractAddresses(filePath);
      setAddresses(result.data.extracted_addresses || []);
    } catch (err) {
      console.error('Failed to extract addresses:', err);
    }
  };

  return (
    <div className="address-extractor">
      <h2>Address Extraction</h2>

      <form onSubmit={handleExtract}>
        <input
          type="text"
          value={filePath}
          onChange={(e) => setFilePath(e.target.value)}
          placeholder="Enter file path (e.g., data/addresses.txt)"
          disabled={loading}
        />
        <button type="submit" disabled={loading || !filePath.trim()}>
          {loading ? 'Extracting...' : 'Extract Addresses'}
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      {addresses.length > 0 && (
        <div className="results">
          <h3>Extracted Addresses ({addresses.length})</h3>
          <ul>
            {addresses.map((address, idx) => (
              <li key={idx}>{address}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AddressExtractor;
```

---

## cURL Examples

### Chat Request
```bash
# Basic chat
curl -X POST https://your-n8n-instance.com/webhook/citygraph-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "action": "chat",
    "message": "Hello, how are you?",
    "user_id": "user123",
    "session_id": "session456"
  }'

# Chat with help query
curl -X POST https://your-n8n-instance.com/webhook/citygraph-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "action": "chat",
    "message": "I need help with address extraction",
    "user_id": "user123"
  }'
```

### Address Extraction
```bash
# Extract addresses from a file
curl -X POST https://your-n8n-instance.com/webhook/citygraph-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "action": "extract_address",
    "file_path": "data/addresses.txt"
  }'

# Extract from README
curl -X POST https://your-n8n-instance.com/webhook/citygraph-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "action": "extract_address",
    "file_path": "README.md"
  }'
```

### Error Handling
```bash
# Test invalid action
curl -X POST https://your-n8n-instance.com/webhook/citygraph-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "action": "invalid_action"
  }'
```

---

## Postman Collection

### Creating a Postman Collection

1. **Import Collection**:
   - Create a new collection named "cityGraph n8n Workflow"
   - Add the base webhook URL as a variable

2. **Chat Request**:
   - Method: POST
   - URL: `{{webhook_url}}`
   - Body (JSON):
     ```json
     {
       "action": "chat",
       "message": "Hello!",
       "user_id": "{{user_id}}",
       "session_id": "{{session_id}}"
     }
     ```

3. **Address Extraction Request**:
   - Method: POST
   - URL: `{{webhook_url}}`
   - Body (JSON):
     ```json
     {
       "action": "extract_address",
       "file_path": "data/sample.txt"
     }
     ```

### Environment Variables
```json
{
  "webhook_url": "https://your-n8n-instance.com/webhook/citygraph-webhook",
  "user_id": "test_user_123",
  "session_id": "test_session_456"
}
```

---

## Advanced Integration Patterns

### Webhook with Authentication
```javascript
// Add API key authentication to your webhook calls
const headers = {
  'Content-Type': 'application/json',
  'X-API-Key': 'your-api-key'
};

axios.post(webhookUrl, payload, { headers });
```

### Batch Processing
```javascript
// Process multiple files in parallel
async function extractAddressesFromMultipleFiles(filePaths) {
  const promises = filePaths.map(filePath =>
    axios.post(N8N_WEBHOOK_URL, {
      action: 'extract_address',
      file_path: filePath
    })
  );

  const results = await Promise.all(promises);
  return results.map(r => r.data);
}
```

### WebSocket Integration (for real-time chat)
```javascript
// This requires modifying the n8n workflow to support WebSocket
// For now, use polling or Server-Sent Events (SSE)

async function pollForResponse(sessionId) {
  // Implement polling logic
  const interval = setInterval(async () => {
    const response = await checkForNewMessages(sessionId);
    if (response.hasNew) {
      displayMessage(response.message);
      clearInterval(interval);
    }
  }, 1000);
}
```

---

## Error Handling Best Practices

```javascript
async function safeApiCall(payload) {
  try {
    const response = await axios.post(N8N_WEBHOOK_URL, payload, {
      timeout: 30000, // 30 second timeout
      validateStatus: (status) => status < 500 // Don't throw on 4xx
    });

    if (response.status >= 400) {
      console.error('API Error:', response.data);
      return { error: response.data, status: response.status };
    }

    return { data: response.data, status: response.status };
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
      return { error: 'Request timeout', status: 408 };
    }

    console.error('Network error:', error.message);
    return { error: error.message, status: 500 };
  }
}
```

---

## Monitoring and Logging

```javascript
// Log all API calls for debugging
const originalPost = axios.post;
axios.post = function(...args) {
  console.log('API Call:', {
    url: args[0],
    payload: args[1],
    timestamp: new Date().toISOString()
  });

  return originalPost.apply(this, args)
    .then(response => {
      console.log('API Response:', {
        status: response.status,
        data: response.data
      });
      return response;
    })
    .catch(error => {
      console.error('API Error:', error.message);
      throw error;
    });
};
```

---

## Next Steps

1. Choose the integration method that fits your stack
2. Implement error handling and retry logic
3. Add authentication if needed
4. Monitor API usage and performance
5. Implement caching for frequently accessed data
6. Add rate limiting to prevent abuse
