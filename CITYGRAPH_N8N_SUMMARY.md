# CityGraph n8n Workflow - Project Summary

## 🎯 What Was Created

I've created a complete n8n workflow integration for your **CityGraph** project (https://github.com/InnovateGPT/cityGraph_AG_MG) - a Python-based geospatial ETL platform for extracting Australian addresses.

## 📦 Delivered Files

### 1. **Workflow Files**
- `cityGraph_n8n_workflow_v2.json` ⭐ **USE THIS** - Updated workflow tailored to your project
- `cityGraph_n8n_workflow.json` - Original generic version

### 2. **Deployment Tools**
- `deploy_n8n_workflow.py` - Automated deployment script
- `test_citygraph_workflow.py` - Comprehensive testing script

### 3. **Documentation**
- `CITYGRAPH_DEPLOYMENT_GUIDE.md` ⭐ **START HERE** - Complete deployment instructions
- `CITYGRAPH_N8N_README.md` - Quick reference guide
- `integration_examples.md` - Code examples for various frameworks
- `CITYGRAPH_N8N_SUMMARY.md` - This file

## 🚀 Quick Start (3 Steps)

### Step 1: Deploy to n8n
```bash
python3 deploy_n8n_workflow.py
# When prompted, enter your n8n instance URL
```

### Step 2: Configure GitHub Auth
1. Create GitHub Personal Access Token: https://github.com/settings/tokens
   - Scope: `repo`
2. In n8n: Credentials → Add Credential → Header Auth
   - Name: `Authorization`
   - Value: `token YOUR_GITHUB_TOKEN`

### Step 3: Test the Workflow
```bash
# Test chat functionality
python3 test_citygraph_workflow.py chat "Extract addresses for Melbourne"

# Test address extraction
curl -X POST YOUR_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"action": "extract_address", "suburb": "Melbourne"}'
```

## 🎨 Workflow Features

### 1. **Chat Interface** (`action: "chat"`)
- Natural language address extraction queries
- Intent detection (extract, batch, postcode search)
- Help and information responses
- Context-aware conversations

**Example:**
```json
{
  "action": "chat",
  "message": "Extract addresses for Mount Waverley",
  "user_id": "user123"
}
```

### 2. **Address Extraction** (`action: "extract_address"`)
- Extract by suburb name
- Extract by postcode
- Extract by SA2 code
- Access GitHub repository files

**Example:**
```json
{
  "action": "extract_address",
  "suburb": "Melbourne"
}
```

### 3. **Batch Processing** (`action: "batch_extract"`)
- Process multiple locations simultaneously
- ZIP archive output
- Progress tracking

**Example:**
```json
{
  "action": "batch_extract",
  "locations": ["Melbourne", "Sydney", "Brisbane"]
}
```

## 📊 Your CityGraph Project Analysis

### Technology Stack
- **Language:** Python 3.9+
- **Framework:** Streamlit
- **Geospatial:** GeoPandas, Shapely
- **AI:** OpenAI (optional)

### Key Services
```
services/
├── address_service.py      # Core extraction logic
├── batch_service.py        # Multi-location processing
├── postcode_service.py     # Postcode lookups
├── export_service.py       # CSV/GeoJSON/Shapefile exports
└── data_loader.py          # Cached data handling
```

### Data Sources
1. **ABS ASGS SA2 Boundaries** (50-100 MB)
   - Statistical geography standard
   - CC BY 4.0 license

2. **Geoscape G-NAF** (2-8 GB per state)
   - Geocoded national addresses
   - Latitude/longitude coordinates

### Performance
- **First run:** 30-120 seconds
- **Cached:** 2-5 seconds (95% improvement!)

## 🔗 Integration Options

### Option A: Direct Webhook Integration
Your application calls the n8n webhook directly:
```javascript
fetch('https://your-n8n.com/webhook/citygraph-webhook', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'extract_address',
    suburb: 'Melbourne'
  })
})
```

### Option B: API Bridge (Recommended for Production)
Create a middleware API between n8n and your Streamlit app:
```python
# api_bridge.py
from fastapi import FastAPI
from services.address_service import extract_addresses_by_suburb

app = FastAPI()

@app.post("/api/extract")
async def extract(suburb: str):
    result = extract_addresses_by_suburb(suburb)
    # Notify n8n for logging/monitoring
    notify_n8n("extraction_complete", result)
    return result
```

### Option C: Streamlit Integration
Modify your `app.py` to send events to n8n:
```python
import requests

def extract_with_notification(suburb):
    # Notify n8n that extraction started
    requests.post(n8n_webhook, json={
        "action": "extraction_started",
        "suburb": suburb
    })

    # Perform extraction
    result = extract_addresses_by_suburb(suburb)

    # Notify n8n that extraction completed
    requests.post(n8n_webhook, json={
        "action": "extraction_complete",
        "suburb": suburb,
        "count": len(result)
    })

    return result
```

## 📝 API Reference

### Webhook URL Format
```
https://your-n8n-instance.com/webhook/citygraph-webhook
```

### Request Format
```json
{
  "action": "chat|extract_address|batch_extract",
  // ... additional parameters based on action
}
```

### Response Format
```json
{
  "success": true|false,
  "action": "the_action_performed",
  "service": "citygraph",
  "data": {
    // ... action-specific data
  }
}
```

## 🧪 Testing Commands

```bash
# Interactive testing
python3 test_citygraph_workflow.py interactive

# Chat test
python3 test_citygraph_workflow.py chat "Hello, extract addresses for Melbourne"

# Extract test
python3 test_citygraph_workflow.py extract Melbourne

# Run all tests
python3 test_citygraph_workflow.py test

# Manual cURL test
curl -X POST https://your-n8n.com/webhook/citygraph-webhook \
  -H "Content-Type: application/json" \
  -d '{"action": "chat", "message": "help"}'
```

## 🔐 Security Checklist

- [ ] GitHub token configured in n8n (not in code)
- [ ] OpenAI API key in .env file (not committed)
- [ ] n8n webhook URL kept private
- [ ] Rate limiting configured
- [ ] Add webhook authentication (optional but recommended)

## 📈 Next Steps

### Immediate (Required)
1. ✅ Deploy workflow to n8n using `deploy_n8n_workflow.py`
2. ✅ Configure GitHub authentication in n8n
3. ✅ Test all three actions using test script
4. ✅ Get webhook URL from n8n

### Short-term (Recommended)
5. 🔄 Integrate webhook with your Streamlit app
6. 🔄 Add error handling and logging
7. 🔄 Configure OpenAI for smarter chat responses
8. 🔄 Set up monitoring/analytics

### Long-term (Optional)
9. 🔄 Create API bridge for production
10. 🔄 Add authentication to webhook
11. 🔄 Implement rate limiting
12. 🔄 Set up automated testing
13. 🔄 Deploy to production environment

## 🛠️ Customization Guide

### Adding New Actions

Edit the workflow JSON or add new nodes in n8n:

```javascript
// Add to workflow
{
  "parameters": {
    "conditions": {
      "string": [{
        "value1": "={{ $json.action }}",
        "operation": "equals",
        "value2": "your_new_action"
      }]
    }
  },
  "name": "Is Your New Action?",
  "type": "n8n-nodes-base.if"
}
```

### Integrating with Your Services

Map n8n actions to your Python services:

```python
# Create api_bridge.py
from services.address_service import extract_addresses_by_suburb
from services.batch_service import process_batch
from services.postcode_service import get_suburbs_by_postcode

ACTION_MAP = {
    'extract_suburb': extract_addresses_by_suburb,
    'batch_extract': process_batch,
    'postcode_search': get_suburbs_by_postcode
}

def handle_n8n_webhook(action, params):
    handler = ACTION_MAP.get(action)
    if handler:
        return handler(**params)
    else:
        return {"error": "Unknown action"}
```

### Adding Export Formats

Extend the workflow to support your export service:

```javascript
// In Extract Addresses node
const exportFormat = $json.body?.export_format || 'csv';
const exportService = require('./services/export_service');

const result = exportService.export({
  data: addresses,
  format: exportFormat // csv, geojson, shapefile
});
```

## 🐛 Troubleshooting

### Common Issues

**Problem:** Webhook returns 404
- **Solution:** Ensure workflow is activated in n8n

**Problem:** GitHub authentication fails
- **Solution:** Check token has `repo` scope and is not expired

**Problem:** Slow response times
- **Solution:** Ensure G-NAF data is cached in your Python app

**Problem:** No addresses extracted
- **Solution:** Verify suburb name spelling and data availability

### Debug Mode

Enable debug logging in test script:
```bash
# Add verbose flag
python3 test_citygraph_workflow.py --verbose chat "test message"
```

## 📚 Additional Resources

### Documentation
- **Full Deployment Guide:** `CITYGRAPH_DEPLOYMENT_GUIDE.md`
- **Quick Reference:** `CITYGRAPH_N8N_README.md`
- **Integration Examples:** `integration_examples.md`

### Your Project
- **Repository:** https://github.com/InnovateGPT/cityGraph_AG_MG
- **Main App:** `app.py` (Streamlit)
- **Services:** `services/` directory

### External Resources
- **n8n Docs:** https://docs.n8n.io
- **G-NAF Data:** https://geoscape.com.au/data/g-naf/
- **ABS ASGS:** https://www.abs.gov.au/statistics/standards/asgs

## 💡 Pro Tips

1. **Use Version 2:** Always use `cityGraph_n8n_workflow_v2.json` - it's tailored to your project

2. **Cache Everything:** Your Python app already caches data - leverage this in n8n

3. **Monitor Performance:** Add timing nodes to track execution time

4. **Test Locally First:** Use test script before deploying to production

5. **Secure Your Tokens:** Never commit API keys - use environment variables

6. **Start Simple:** Get basic chat working first, then add address extraction

## 🎉 What You Can Build

With this n8n workflow, you can:

1. **Chatbot Interface** - Add conversational AI to your Streamlit app
2. **API Gateway** - Expose cityGraph as a REST API
3. **Webhook Notifications** - Get alerts when extractions complete
4. **Data Pipeline** - Automate address extraction workflows
5. **Integration Hub** - Connect cityGraph to other tools (Slack, email, etc.)

## 🤝 Support

If you encounter issues:
1. Check the deployment guide
2. Run test script in verbose mode
3. Review n8n execution logs
4. Check GitHub issues

---

**Created:** December 10, 2024
**Version:** 2.0
**n8n API Key:** Configured (eyJhbG...)
**Target Workflow:** cityGraph_n8n
**Repository:** InnovateGPT/cityGraph_AG_MG

✨ **You're all set! Start with the deployment script and refer to the guides as needed.**
