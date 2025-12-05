import httpx
import sys
import random
import string
import time

BASE_URL = "http://localhost:8000"

def generate_random_string(length=8):
    return ''.join(random.choices(string.ascii_lowercase, k=length))

def wait_for_server(retries=5, delay=1):
    print("Waiting for server to be ready...")
    for i in range(retries):
        try:
            response = httpx.get(f"{BASE_URL}/")
            if response.status_code == 200:
                print("Server is ready!")
                return True
        except httpx.ConnectError:
            pass
        except Exception as e:
            print(f"Error checking server: {e}")
        
        time.sleep(delay)
    return False

def main():
    print("Starting API verification...")
    
    if not wait_for_server():
        print("❌ Server not reachable")
        sys.exit(1)

    # 1. Health Check
    try:
        response = httpx.get(f"{BASE_URL}/")
        if response.status_code == 200:
            print("✅ Health check passed")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            sys.exit(1)
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        sys.exit(1)

    # Generate random user
    username = f"user_{generate_random_string()}"
    email = f"{username}@example.com"
    password = "password123"

    # 2. Signup
    print(f"Attempting signup for {email}...")
    response = httpx.post(f"{BASE_URL}/auth/signup", json={
        "email": email,
        "username": username,
        "password": password
    })
    if response.status_code == 201 and response.json()["success"]:
        print("✅ Signup passed")
    else:
        print(f"❌ Signup failed: {response.text}")
        sys.exit(1)

    # 3. Login
    print("Attempting login...")
    response = httpx.post(f"{BASE_URL}/auth/login", json={
        "email": email,
        "password": password
    })
    if response.status_code == 200 and response.json()["success"]:
        print("✅ Login passed")
        # In this mock, we use email as the token for subsequent requests
        token = email 
    else:
        print(f"❌ Login failed: {response.text}")
        sys.exit(1)

    headers = {"Authorization": f"Bearer {token}"}

    # 4. Get Current User
    print("Getting current user...")
    response = httpx.get(f"{BASE_URL}/auth/me", headers=headers)
    if response.status_code == 200 and response.json()["success"]:
        print("✅ Get current user passed")
    else:
        print(f"❌ Get current user failed: {response.text}")
        sys.exit(1)

    # 5. Submit Score
    print("Submitting score...")
    response = httpx.post(f"{BASE_URL}/leaderboard", json={
        "score": 100,
        "mode": "walls"
    }, headers=headers)
    if response.status_code == 201 and response.json()["success"]:
        print("✅ Submit score passed")
    else:
        print(f"❌ Submit score failed: {response.text}")
        sys.exit(1)

    # 6. Get Leaderboard
    print("Getting leaderboard...")
    response = httpx.get(f"{BASE_URL}/leaderboard")
    if response.status_code == 200 and response.json()["success"]:
        print("✅ Get leaderboard passed")
    else:
        print(f"❌ Get leaderboard failed: {response.text}")
        sys.exit(1)

    # 7. Get Active Players
    print("Getting active players...")
    response = httpx.get(f"{BASE_URL}/players")
    if response.status_code == 200 and response.json()["success"]:
        print("✅ Get active players passed")
    else:
        print(f"❌ Get active players failed: {response.text}")
        sys.exit(1)

    # 8. Logout
    print("Logging out...")
    response = httpx.post(f"{BASE_URL}/auth/logout", headers=headers)
    if response.status_code == 200 and response.json()["success"]:
        print("✅ Logout passed")
    else:
        print(f"❌ Logout failed: {response.text}")
        sys.exit(1)

    print("\n🎉 All tests passed!")

if __name__ == "__main__":
    main()
