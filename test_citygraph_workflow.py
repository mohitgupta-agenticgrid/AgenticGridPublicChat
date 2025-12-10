#!/usr/bin/env python3
"""
Test cityGraph n8n Workflow
This script tests the deployed workflow with sample requests.
"""

import requests
import json
import sys
from datetime import datetime

# Configuration
WEBHOOK_URL = "https://your-n8n-instance.com/webhook/citygraph-webhook"

def print_header(title):
    """Print a formatted header"""
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)

def print_response(response):
    """Pretty print the response"""
    print(f"\n📊 Status Code: {response.status_code}")
    print(f"📝 Response:")
    print(json.dumps(response.json(), indent=2))

def test_chat(message, user_id="test_user", session_id=None):
    """Test the chat functionality"""
    if session_id is None:
        session_id = f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

    print_header("Testing Chat Functionality")
    print(f"\n💬 Message: {message}")
    print(f"👤 User ID: {user_id}")
    print(f"🔑 Session ID: {session_id}")

    payload = {
        "action": "chat",
        "message": message,
        "user_id": user_id,
        "session_id": session_id
    }

    try:
        response = requests.post(WEBHOOK_URL, json=payload, timeout=30)
        response.raise_for_status()
        print_response(response)
        return True
    except requests.exceptions.RequestException as e:
        print(f"\n❌ Error: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")
        return False

def test_extract_address(file_path):
    """Test the address extraction functionality"""
    print_header("Testing Address Extraction")
    print(f"\n📁 File Path: {file_path}")

    payload = {
        "action": "extract_address",
        "file_path": file_path
    }

    try:
        response = requests.post(WEBHOOK_URL, json=payload, timeout=30)
        response.raise_for_status()
        print_response(response)
        return True
    except requests.exceptions.RequestException as e:
        print(f"\n❌ Error: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")
        return False

def test_invalid_action():
    """Test with an invalid action"""
    print_header("Testing Invalid Action (Error Handling)")

    payload = {
        "action": "invalid_action",
        "data": "test"
    }

    try:
        response = requests.post(WEBHOOK_URL, json=payload, timeout=30)
        print_response(response)
        return True
    except requests.exceptions.RequestException as e:
        print(f"\n❌ Error: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")
        return False

def run_all_tests():
    """Run all test scenarios"""
    print_header("cityGraph n8n Workflow Test Suite")
    print(f"Webhook URL: {WEBHOOK_URL}")

    results = {
        "passed": 0,
        "failed": 0
    }

    # Test 1: Chat - Greeting
    print("\n\n🧪 Test 1: Chat - Greeting")
    if test_chat("Hello, how are you?"):
        results["passed"] += 1
    else:
        results["failed"] += 1

    # Test 2: Chat - Help
    print("\n\n🧪 Test 2: Chat - Help Request")
    if test_chat("I need help with this system"):
        results["passed"] += 1
    else:
        results["failed"] += 1

    # Test 3: Chat - Address Query
    print("\n\n🧪 Test 3: Chat - Address Query")
    if test_chat("Can you help me extract addresses?"):
        results["passed"] += 1
    else:
        results["failed"] += 1

    # Test 4: Address Extraction
    print("\n\n🧪 Test 4: Address Extraction")
    if test_extract_address("README.md"):  # Replace with actual file
        results["passed"] += 1
    else:
        results["failed"] += 1

    # Test 5: Invalid Action
    print("\n\n🧪 Test 5: Invalid Action Handling")
    if test_invalid_action():
        results["passed"] += 1
    else:
        results["failed"] += 1

    # Print summary
    print_header("Test Summary")
    print(f"\n✅ Passed: {results['passed']}")
    print(f"❌ Failed: {results['failed']}")
    print(f"📊 Total: {results['passed'] + results['failed']}")

    success_rate = (results['passed'] / (results['passed'] + results['failed'])) * 100
    print(f"🎯 Success Rate: {success_rate:.1f}%\n")

def interactive_mode():
    """Interactive testing mode"""
    print_header("Interactive Testing Mode")

    while True:
        print("\n📋 Options:")
        print("  1. Test Chat")
        print("  2. Test Address Extraction")
        print("  3. Test Invalid Action")
        print("  4. Run All Tests")
        print("  5. Exit")

        choice = input("\n👉 Select an option (1-5): ").strip()

        if choice == "1":
            message = input("Enter chat message: ").strip()
            user_id = input("Enter user ID (or press Enter for default): ").strip() or "test_user"
            test_chat(message, user_id)

        elif choice == "2":
            file_path = input("Enter file path in GitHub repo: ").strip()
            test_extract_address(file_path)

        elif choice == "3":
            test_invalid_action()

        elif choice == "4":
            run_all_tests()

        elif choice == "5":
            print("\n👋 Goodbye!")
            break

        else:
            print("\n❌ Invalid option. Please select 1-5.")

def main():
    """Main function"""
    global WEBHOOK_URL

    # Check if webhook URL is provided
    if len(sys.argv) > 1 and sys.argv[1] not in ["chat", "extract", "test", "interactive"]:
        WEBHOOK_URL = sys.argv[1]

    # Check for custom webhook URL
    if WEBHOOK_URL == "https://your-n8n-instance.com/webhook/citygraph-webhook":
        print("⚠️  Default webhook URL detected.")
        custom_url = input("Enter your n8n webhook URL (or press Enter to use default): ").strip()
        if custom_url:
            WEBHOOK_URL = custom_url

    if len(sys.argv) < 2:
        print("Usage:")
        print("  python3 test_citygraph_workflow.py <webhook_url>")
        print("  python3 test_citygraph_workflow.py chat <message>")
        print("  python3 test_citygraph_workflow.py extract <file_path>")
        print("  python3 test_citygraph_workflow.py test")
        print("  python3 test_citygraph_workflow.py interactive")
        print("\nStarting interactive mode...\n")
        interactive_mode()
        return

    command = sys.argv[1].lower()

    if command == "chat":
        if len(sys.argv) < 3:
            print("❌ Error: Message required for chat command")
            print("Usage: python3 test_citygraph_workflow.py chat <message>")
            sys.exit(1)

        message = " ".join(sys.argv[2:])
        test_chat(message)

    elif command == "extract":
        if len(sys.argv) < 3:
            print("❌ Error: File path required for extract command")
            print("Usage: python3 test_citygraph_workflow.py extract <file_path>")
            sys.exit(1)

        file_path = sys.argv[2]
        test_extract_address(file_path)

    elif command == "test":
        run_all_tests()

    elif command == "interactive":
        interactive_mode()

    else:
        print(f"❌ Unknown command: {command}")
        print("Valid commands: chat, extract, test, interactive")
        sys.exit(1)

if __name__ == "__main__":
    main()
