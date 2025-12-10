#!/usr/bin/env python3
"""
Deploy cityGraph n8n Workflow
This script deploys the cityGraph workflow to your n8n instance.
"""

import requests
import json
import sys

# n8n API Configuration
N8N_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiNzRjN2NmZC1lZGY5LTRkMWQtOGI2Mi01YzhlYWMwYzYxMTQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY1MzQ5MzM5LCJleHAiOjE3Njc4NzcyMDB9.omHHguW0zF9fts2H1mts9JYj7-1TaYzYwAD-eixCpoo"
N8N_BASE_URL = "https://your-n8n-instance.com/api/v1"  # Update this with your n8n instance URL

WORKFLOW_FILE = "cityGraph_n8n_workflow.json"

def load_workflow():
    """Load the workflow JSON file"""
    try:
        with open(WORKFLOW_FILE, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Error: {WORKFLOW_FILE} not found!")
        sys.exit(1)
    except json.JSONDecodeError:
        print(f"Error: {WORKFLOW_FILE} is not valid JSON!")
        sys.exit(1)

def get_headers():
    """Get API headers with authentication"""
    return {
        "X-N8N-API-KEY": N8N_API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

def check_existing_workflow(workflow_name):
    """Check if a workflow with the same name exists"""
    url = f"{N8N_BASE_URL}/workflows"

    try:
        response = requests.get(url, headers=get_headers())
        response.raise_for_status()

        workflows = response.json().get('data', [])
        for workflow in workflows:
            if workflow.get('name') == workflow_name:
                return workflow.get('id')

        return None
    except requests.exceptions.RequestException as e:
        print(f"Error checking existing workflows: {e}")
        return None

def create_workflow(workflow_data):
    """Create a new workflow"""
    url = f"{N8N_BASE_URL}/workflows"

    try:
        response = requests.post(url, headers=get_headers(), json=workflow_data)
        response.raise_for_status()

        result = response.json()
        print(f"✅ Workflow created successfully!")
        print(f"   Workflow ID: {result.get('id')}")
        print(f"   Workflow Name: {result.get('name')}")
        return result
    except requests.exceptions.RequestException as e:
        print(f"❌ Error creating workflow: {e}")
        if hasattr(e.response, 'text'):
            print(f"   Response: {e.response.text}")
        sys.exit(1)

def update_workflow(workflow_id, workflow_data):
    """Update an existing workflow"""
    url = f"{N8N_BASE_URL}/workflows/{workflow_id}"

    try:
        response = requests.put(url, headers=get_headers(), json=workflow_data)
        response.raise_for_status()

        result = response.json()
        print(f"✅ Workflow updated successfully!")
        print(f"   Workflow ID: {result.get('id')}")
        print(f"   Workflow Name: {result.get('name')}")
        return result
    except requests.exceptions.RequestException as e:
        print(f"❌ Error updating workflow: {e}")
        if hasattr(e.response, 'text'):
            print(f"   Response: {e.response.text}")
        sys.exit(1)

def activate_workflow(workflow_id):
    """Activate the workflow"""
    url = f"{N8N_BASE_URL}/workflows/{workflow_id}/activate"

    try:
        response = requests.post(url, headers=get_headers())
        response.raise_for_status()
        print(f"✅ Workflow activated successfully!")
    except requests.exceptions.RequestException as e:
        print(f"⚠️  Warning: Could not activate workflow: {e}")

def main():
    """Main deployment function"""
    print("=" * 60)
    print("cityGraph n8n Workflow Deployment")
    print("=" * 60)

    # Load workflow
    print("\n📂 Loading workflow configuration...")
    workflow_data = load_workflow()
    workflow_name = workflow_data.get('name', 'cityGraph_n8n')

    # Check if workflow exists
    print(f"\n🔍 Checking for existing workflow: {workflow_name}")
    existing_id = check_existing_workflow(workflow_name)

    if existing_id:
        print(f"   Found existing workflow with ID: {existing_id}")
        print(f"\n🔄 Updating existing workflow...")
        result = update_workflow(existing_id, workflow_data)
    else:
        print(f"   No existing workflow found")
        print(f"\n➕ Creating new workflow...")
        result = create_workflow(workflow_data)

    # Activate workflow
    workflow_id = result.get('id')
    if workflow_id:
        print(f"\n🚀 Activating workflow...")
        activate_workflow(workflow_id)

    print("\n" + "=" * 60)
    print("Deployment Complete!")
    print("=" * 60)
    print(f"\n📋 Next Steps:")
    print(f"   1. Go to your n8n instance and open the '{workflow_name}' workflow")
    print(f"   2. Configure GitHub authentication (add your GitHub token)")
    print(f"   3. Test the webhook endpoints")
    print(f"   4. Integrate with your application")
    print(f"\n📡 Webhook URL will be:")
    print(f"   {N8N_BASE_URL.replace('/api/v1', '')}/webhook/citygraph-webhook")
    print()

if __name__ == "__main__":
    # Check if custom n8n URL is provided
    if len(sys.argv) > 1:
        N8N_BASE_URL = sys.argv[1].rstrip('/') + '/api/v1'

    print(f"Using n8n instance: {N8N_BASE_URL}")

    # Prompt user to confirm or update URL
    user_input = input(f"\nIs this the correct n8n URL? (y/n, or enter new URL): ").strip()

    if user_input.lower() != 'y':
        if user_input.lower() != 'n' and user_input:
            N8N_BASE_URL = user_input.rstrip('/') + '/api/v1'
        else:
            new_url = input("Enter your n8n instance URL (e.g., https://n8n.yourdomain.com): ").strip()
            N8N_BASE_URL = new_url.rstrip('/') + '/api/v1'

    main()
