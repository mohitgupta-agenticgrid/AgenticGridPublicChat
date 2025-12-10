# CityGraph n8n Integration - Complete Deployment Guide

## Project Overview

**CityGraph** is a production-ready geospatial ETL platform for extracting Australian addresses using:
- **ABS ASGS SA2 Boundaries** (Statistical geography)
- **Geoscape G-NAF Address Data** (Geocoded national addresses)

### Key Features
1. **Quick Extract** - Single suburb address extraction
2. **Batch Processing** - Multiple locations simultaneously
3. **AI Chat Interface** - Natural language queries (OpenAI integration)
4. **Multiple Export Formats** - CSV, GeoJSON, Shapefile

## Repository Structure

```
InnovateGPT/cityGraph_AG_MG/
├── app.py                          # Main Streamlit application
├── services/                       # Business logic layer
│   ├── data_loader.py             # Cached data handling
│   ├── address_service.py         # Core extraction logic
│   ├── postcode_service.py        # Postcode-suburb mapping
│   ├── batch_service.py           # Multi-location processing
│   └── export_service.py          # Export functionality
├── scripts/                        # CLI tools
│   ├── fetch_latest_data.py       # Data downloads
│   ├── extract_addresses_by_sa2.py
│   └── extract_by_postcode.py
├── data/                           # Geospatial datasets
└── outputs/                        # Extracted results
```

## n8n Workflow Architecture

### Version 2.0 (Recommended)

The updated workflow includes:
- **Chat Interface** - AI-powered address extraction queries
- **Single Address Extraction** - Suburb, postcode, or SA2 code
- **Batch Processing** - Multiple locations
- **GitHub Integration** - Access repository files
- **Error Handling** - Comprehensive validation

## Installation Steps

### Step 1: Prerequisites

#### System Requirements
- n8n instance (cloud or self-hosted)
- Python 3.9+ (for cityGraph)
- 8-16 GB RAM
- 10-20 GB disk space

#### API Keys Needed
1. **GitHub Personal Access Token**
   - Go to: GitHub Settings → Developer Settings → Personal Access Tokens
   - Scope: `repo` (full repository access)

2. **OpenAI API Key** (optional, for chat)
   - Get from: https://platform.openai.com/api-keys

### Step 2: Deploy n8n Workflow

#### Option A: Using Deployment Script

```bash
# 1. Make script executable
chmod +x deploy_n8n_workflow.py

# 2. Update the script with your n8n URL
# Edit deploy_n8n_workflow.py and change:
N8N_BASE_URL = "https://your-n8n-instance.com/api/v1"

# 3. Run deployment
python3 deploy_n8n_workflow.py

# Follow the prompts to confirm your n8n URL
```

#### Option B: Manual Import

```bash
# 1. Log in to your n8n instance
# 2. Click "Add Workflow" → "Import from File"
# 3. Select: cityGraph_n8n_workflow_v2.json
# 4. Click "Import"
```

### Step 3: Configure GitHub Authentication

1. **In n8n UI:**
   - Go to **Credentials** → **Add Credential**
   - Select **Header Auth**
   - Name: `GitHub Auth`

2. **Configuration:**
   ```
   Name: Authorization
   Value: token YOUR_GITHUB_PERSONAL_ACCESS_TOKEN
   ```

3. **Link to Workflow Nodes:**
   - Open `cityGraph_n8n` workflow
   - Click on "Fetch GitHub File" node
   - Select the "GitHub Auth" credential
   - Do the same for "Get Repository Structure" node

### Step 4: Activate Workflow

1. Open the workflow in n8n
2. Click **Save**
3. Click **Activate** (toggle switch in top-right)
4. **Copy the Webhook URL** from the "Webhook Trigger" node
   - Format: `https://your-n8n.com/webhook/citygraph-webhook`

## API Usage Examples

### Webhook Base URL
```
https://your-n8n-instance.com/webhook/citygraph-webhook
```

### 1. Chat Interface

#### Example 1: Extract by Suburb
```bash
curl -X POST https://your-n8n-instance.com/webhook/citygraph-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "action": "chat",
    "message": "Extract addresses for Mount Waverley",
    "user_id": "user123",
    "session_id": "session456"
  }'
```

**Response:**
```json
{
  "success": true,
  "action": "chat",
  "service": "citygraph",
  "data": {
    "user_id": "user123",
    "session_id": "session456",
    "user_message": "Extract addresses for Mount Waverley",
    "bot_response": "I'll help you extract addresses for Mount Waverley...",
    "context": {
      "intent": "extract_addresses",
      "suburb": "Mount Waverley",
      "needs_confirmation": true
    },
    "timestamp": "2024-12-10T10:30:00.000Z"
  }
}
```

#### Example 2: Get Help
```bash
curl -X POST https://your-n8n-instance.com/webhook/citygraph-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "action": "chat",
    "message": "help",
    "user_id": "user123"
  }'
```

#### Example 3: Ask About Data Sources
```bash
curl -X POST https://your-n8n-instance.com/webhook/citygraph-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "action": "chat",
    "message": "What data sources do you use?",
    "user_id": "user123"
  }'
```

### 2. Address Extraction

#### Extract by Suburb
```bash
curl -X POST https://your-n8n-instance.com/webhook/citygraph-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "action": "extract_address",
    "suburb": "Melbourne",
    "file_path": "services/address_service.py"
  }'
```

**Response:**
```json
{
  "success": true,
  "action": "extract_address",
  "service": "citygraph",
  "data": {
    "extraction_type": "suburb",
    "input_parameter": "Melbourne",
    "addresses": [
      {
        "full_address": "123 Example Street, Melbourne, VIC 3000",
        "latitude": -37.8136,
        "longitude": 144.9631,
        "locality_name": "Melbourne",
        "postcode": "3000",
        "street_name": "Example",
        "street_type": "Street",
        "address_detail_pid": "GAVIC123456789",
        "geocode_type": "PROPERTY CENTROID"
      }
    ],
    "address_count": 1,
    "extraction_timestamp": "2024-12-10T10:30:00.000Z",
    "data_source": "Geoscape G-NAF",
    "boundary_source": "ABS ASGS SA2",
    "export_formats_available": ["csv", "geojson", "shapefile"]
  }
}
```

#### Extract by Postcode
```bash
curl -X POST https://your-n8n-instance.com/webhook/citygraph-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "action": "extract_address",
    "postcode": "3000"
  }'
```

#### Extract by SA2 Code
```bash
curl -X POST https://your-n8n-instance.com/webhook/citygraph-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "action": "extract_address",
    "sa2_code": "209031139"
  }'
```

### 3. Batch Processing

```bash
curl -X POST https://your-n8n-instance.com/webhook/citygraph-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "action": "batch_extract",
    "locations": [
      "Melbourne",
      "Sydney",
      "Brisbane",
      "Perth",
      "Adelaide"
    ]
  }'
```

**Response:**
```json
{
  "success": true,
  "action": "batch_extract",
  "service": "citygraph",
  "data": {
    "batch_id": "batch_1702209000000",
    "total_locations": 5,
    "locations": [
      {
        "location": "Melbourne",
        "status": "processing",
        "estimated_addresses": 3456,
        "processing_started": "2024-12-10T10:30:00.000Z"
      }
    ],
    "status": "initiated",
    "timestamp": "2024-12-10T10:30:00.000Z",
    "estimated_completion": "2-5 minutes per location (first run), 2-5 seconds (cached)",
    "output_format": "ZIP archive with individual CSV files"
  }
}
```

## Integration with Streamlit App

### Option 1: API Bridge (Recommended)

Create a FastAPI or Flask bridge between n8n and your Streamlit app:

```python
# api_bridge.py
from fastapi import FastAPI, HTTPException
import requests
from services.address_service import extract_addresses_by_suburb
from services.batch_service import process_batch

app = FastAPI()

N8N_WEBHOOK = "https://your-n8n.com/webhook/citygraph-webhook"

@app.post("/api/extract")
async def extract_addresses(suburb: str):
    """Bridge n8n webhook with actual cityGraph service"""
    try:
        # Call actual cityGraph service
        result = extract_addresses_by_suburb(suburb)

        # Optionally notify n8n
        requests.post(N8N_WEBHOOK, json={
            "action": "extract_complete",
            "suburb": suburb,
            "result": result
        })

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/batch")
async def batch_extract(locations: list):
    """Batch processing bridge"""
    try:
        result = process_batch(locations)

        # Notify n8n
        requests.post(N8N_WEBHOOK, json={
            "action": "batch_complete",
            "batch_id": result['batch_id'],
            "status": result['status']
        })

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

Run the bridge:
```bash
uvicorn api_bridge:app --host 0.0.0.0 --port 8000
```

### Option 2: Direct Integration

Modify your `app.py` to send notifications to n8n:

```python
# In your app.py
import requests

N8N_WEBHOOK = "https://your-n8n.com/webhook/citygraph-webhook"

def notify_n8n(action, data):
    """Send notifications to n8n workflow"""
    try:
        requests.post(N8N_WEBHOOK, json={
            "action": action,
            "data": data,
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        print(f"Failed to notify n8n: {e}")

# In your extraction function
def extract_with_notification(suburb):
    notify_n8n("extraction_started", {"suburb": suburb})

    result = extract_addresses_by_suburb(suburb)

    notify_n8n("extraction_complete", {
        "suburb": suburb,
        "address_count": len(result)
    })

    return result
```

## Testing the Workflow

### Using Test Script

```bash
# Make executable
chmod +x test_citygraph_workflow.py

# Test chat
python3 test_citygraph_workflow.py chat "Extract addresses for Melbourne"

# Test address extraction
python3 test_citygraph_workflow.py extract --suburb Melbourne

# Run all tests
python3 test_citygraph_workflow.py test

# Interactive mode
python3 test_citygraph_workflow.py interactive
```

### Manual Testing with cURL

```bash
# 1. Test chat
curl -X POST https://your-n8n.com/webhook/citygraph-webhook \
  -H "Content-Type: application/json" \
  -d '{"action": "chat", "message": "hello"}'

# 2. Test extraction
curl -X POST https://your-n8n.com/webhook/citygraph-webhook \
  -H "Content-Type: application/json" \
  -d '{"action": "extract_address", "suburb": "Melbourne"}'

# 3. Test batch
curl -X POST https://your-n8n.com/webhook/citygraph-webhook \
  -H "Content-Type: application/json" \
  -d '{"action": "batch_extract", "locations": ["Melbourne", "Sydney"]}'
```

## Production Considerations

### 1. Environment Variables

Create a `.env` file in your n8n workflow directory:

```bash
# .env
GITHUB_TOKEN=your_github_token_here
OPENAI_API_KEY=your_openai_key_here  # Optional
N8N_WEBHOOK_URL=https://your-n8n.com/webhook/citygraph-webhook
CITYGRAPH_API_URL=http://localhost:8501  # Your Streamlit app
```

### 2. Error Handling

The workflow includes comprehensive error handling:
- Invalid action detection
- GitHub API failures
- Missing parameters
- Timeout handling

### 3. Performance Optimization

CityGraph v2.0 features:
- **95% performance improvement** for cached queries
- First run: 30-120 seconds
- Cached run: 2-5 seconds

Configure caching in your workflow:
```javascript
// Add to relevant nodes
const cache = new Map();
const cacheKey = `${suburb}_${Date.now()}`;

if (cache.has(suburb)) {
  return cache.get(suburb);
}
```

### 4. Security

- **Never commit API keys** to version control
- Use **n8n environment variables** for sensitive data
- Implement **rate limiting** on webhooks
- Add **authentication** to public webhooks

### 5. Monitoring

Add monitoring nodes in n8n:
```javascript
// Logging node
const log = {
  timestamp: new Date().toISOString(),
  action: $json.action,
  status: 'success',
  duration: Date.now() - startTime
};

// Send to monitoring service
await sendToMonitoring(log);
```

## Troubleshooting

### Issue: Webhook Returns 404
**Solution:**
- Verify workflow is activated
- Check webhook URL is correct
- Ensure n8n instance is running

### Issue: GitHub Authentication Fails
**Solution:**
- Verify token has `repo` scope
- Check token hasn't expired
- Ensure credential is linked to nodes

### Issue: No Addresses Extracted
**Solution:**
- Verify suburb name is correct
- Check G-NAF data is downloaded
- Review logs in Streamlit app

### Issue: Slow Performance
**Solution:**
- Ensure data is cached (use data_loader.py)
- Check RAM availability (8-16 GB needed)
- Review logs for bottlenecks

## Next Steps

1. ✅ Deploy workflow to n8n
2. ✅ Configure GitHub authentication
3. ✅ Test all three actions (chat, extract, batch)
4. 🔄 Set up API bridge (optional)
5. 🔄 Integrate with Streamlit app
6. 🔄 Add OpenAI for smarter chat
7. 🔄 Implement monitoring and logging
8. 🔄 Deploy to production

## Support & Resources

- **CityGraph Repository**: https://github.com/InnovateGPT/cityGraph_AG_MG
- **n8n Documentation**: https://docs.n8n.io
- **G-NAF Data**: https://geoscape.com.au/data/g-naf/
- **ABS ASGS**: https://www.abs.gov.au/statistics/standards/australian-statistical-geography-standard-asgs

## File Structure

```
deployment/
├── cityGraph_n8n_workflow_v2.json       # Updated workflow (use this)
├── cityGraph_n8n_workflow.json          # Original workflow
├── deploy_n8n_workflow.py               # Deployment script
├── test_citygraph_workflow.py           # Testing script
├── CITYGRAPH_DEPLOYMENT_GUIDE.md        # This guide
├── CITYGRAPH_N8N_README.md              # Quick reference
└── integration_examples.md              # Code examples
```

---

**Version:** 2.0
**Last Updated:** December 10, 2024
**Repository:** InnovateGPT/cityGraph_AG_MG
