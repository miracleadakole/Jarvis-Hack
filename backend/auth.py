import os
import uuid
import hashlib
import requests
from datetime import datetime, timedelta
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from ecdsa import SECP256k1, VerifyingKey
from flask import request
from ecdsa import VerifyingKey, SECP256k1, BadSignatureError
from bech32 import bech32_decode, convertbits
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)
Base = declarative_base()

class Session(Base):
    __tablename__ = "sessions"
    id = Column(Integer, primary_key=True)
    session_id = Column(String(64), unique=True)
    wallet_address = Column(String(64), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, default=lambda: datetime.utcnow() + timedelta(hours=1))

Base.metadata.create_all(engine)
SessionMaker = sessionmaker(bind=engine)

def create_session(wallet_address):
    session = SessionMaker()
    session_id = str(uuid.uuid4())
    new_session = Session(session_id=session_id, wallet_address=wallet_address)
    session.add(new_session)
    session.commit()
    session.close()
    return session_id

def validate_session():
    session_id = request.headers.get("X-Session-ID")
    if not session_id:
        return None, {"msg": "Session ID required"}, 401
    
    session = SessionMaker()
    sess = session.query(Session).filter_by(session_id=session_id).first()
    if sess and sess.expires_at > datetime.now(datetime.timezone.utc):
        wallet_address = sess.wallet_address
        session.close()
        return wallet_address, None, 200
    session.close()
    return None, {"msg": "Invalid or expired session"}, 401


def fetch_akash_public_key(wallet_address: str) -> str:
    """
    Fetch the public key for an Akash address from an Akash LCD endpoint.
    
    Args:
        wallet_address (str): Akash address (e.g., 'akash1...')
    
    Returns:
        str: Hex-encoded public key (33 bytes, compressed), or None if failed
    """
    try:
        # Using a public Akash LCD endpoint (e.g., from a node like https://rest-akash.ecostake.com)
        endpoint = f"https://rest-akash.ecostake.com/cosmos/auth/v1beta1/accounts/{wallet_address}"
        response = requests.get(endpoint, timeout=5)
        response.raise_for_status()  # Raise exception for bad HTTP status
        
        account_data = response.json()
        # Extract pubkey from response (Cosmos SDK format)
        pubkey_base64 = account_data['account'].get('pub_key', {}).get('key')
        if not pubkey_base64:
            print("Public key not found in account data")
            return None
        
        # Decode base64 pubkey to bytes and convert to hex
        import base64
        pubkey_bytes = base64.b64decode(pubkey_base64)
        pubkey_hex = pubkey_bytes.hex()
        return pubkey_hex
    
    except requests.RequestException as e:
        print(f"Failed to fetch public key from Akash endpoint: {e}")
        return None
    except Exception as e:
        print(f"Error processing public key: {e}")
        return None

def verify_signature(wallet_address: str, nonce: str, signature: str) -> bool:
    """
    Verify an Akash signature using the public key derived from the wallet address.
    
    Args:
        wallet_address (str): Akash address (e.g., 'akash1...')
        nonce (str): Message/nonce that was signed
        signature (str): Hex-encoded signature (64 bytes: 32 bytes r + 32 bytes s)
    
    Returns:
        bool: True if signature is valid, False otherwise
    """
    try:
        # Decode the Akash bech32 address to get the account hash
        hrp, data = bech32_decode(wallet_address)
        if hrp != 'akash' or not data:
            print("Invalid Akash address (must start with 'akash1...')")
            return False
        
        # Convert 5-bit data to 8-bit bytes (account hash is 20 bytes)
        account_hash = bytes(convertbits(data, 5, 8, False))

        # Fetch the public key from Akash endpoint
        pubkey_hex = fetch_akash_public_key(wallet_address)
        if not pubkey_hex:
            print("Could not retrieve public key")
            return False
        
        # Convert public key from hex to bytes
        pubkey_bytes = bytes.fromhex(pubkey_hex)
        if len(pubkey_bytes) != 33:  # Akash uses compressed pubkeys (33 bytes)
            print("Invalid public key length (expected 33 bytes for compressed key)")
            return False

        # Signature should be 64 bytes (r,s) in Cosmos/Akash format
        sig_bytes = bytes.fromhex(signature)
        if len(sig_bytes) != 64:
            print("Signature must be 64 bytes (r,s components)")
            return False

        # Hash the nonce/message with SHA-256 (Cosmos/Akash standard)
        message_hash = hashlib.sha256(nonce.encode('utf-8')).digest()

        # Create VerifyingKey from the fetched public key
        vk = VerifyingKey.from_string(pubkey_bytes, curve=SECP256k1, hashfunc=hashlib.sha256)

        # Verify the signature
        is_valid = vk.verify(sig_bytes, message_hash)

        # Verify the public key matches the address
        pubkey_hash = hashlib.new('ripemd160', hashlib.sha256(vk.to_string()).digest()).digest()
        if pubkey_hash != account_hash:
            print("Public key does not match the provided address")
            return False

        return is_valid

    except BadSignatureError:
        print("Invalid signature format or verification failed")
        return False
    except Exception as e:
        print(f"Signature verification failed: {e}")
        return False