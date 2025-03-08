# Akash Cloud Manager API

API documentation for the Akash Cloud Manager application, built with Flask and deployed on Akash Network.

---

## Collection Information

- **Name**: Akash Cloud Manager API
- **Version**: 1.0.0
- **Base URL**: `http://localhost:5000` (local) or `<akash-deployment-uri>` (deployed)

---

## Authentication

- **Type**: Session-based
- **Requirements**: Login via `/login` endpoint to receive a session cookie.
- **Notes**: All endpoints except `/login` require a valid session.

---

## Endpoints

### 1. Login
Authenticate a user and establish a session.

- **Method**: POST
- **URL**: `{{base_url}}/login`
- **Headers**:
  - `Content-Type: application/json`
- **Body** (raw, JSON):
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Responses**:
    200 OK:
    ```json
        {
            "session_id": "<Session_ID>",
        }
    ```

### 2. Process Voice Command
Submit a voice command for parsing and execution.

- **Method**: POST
- **URL**: `{{base_url}}/voice`
- **Headers**:
    - `Content-Type: multipart/form-data`
- **Body** (form-data):
    - Key: `audio_file`, Value: `<audio.wav>` (file upload)
- **Responses**:
    201 Created:
    ```json
        {
            "command": "string",
            "action": "deploy | status ",
            "result": "string"
        }
    ```

    400 Bad Request:
    ```json
        {
            "error": "Invalid YAML config"
        }
    ```

    401 Unauthorized:
    ```json
        {
            "error": "Authentication required"
        }
    ```

Description: Calls akash tx deployment create via subprocess in akash_manager.py, stores the deployment ID in PostgreSQL.

## Environment Variables

- DATABASE_URL: postgresql+psycopg2://akash_user:akash_pass@localhost/akash_manager
- AKASH_MNEMONIC: Akash wallet mnemonic for CLI operations.
- AKASH_KEYRING_BACKEND: test (or os for production).
- AKASH_NET: https://raw.githubusercontent.com/akash-network/networks/master/testnet
- AKASH_CHAIN_ID: akash-testnet
- AKASH_NODE: http://rpc.testnet.akash.network:26657
