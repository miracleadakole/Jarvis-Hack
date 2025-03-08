import os
from dotenv import find_dotenv, load_dotenv
from flask import Flask, jsonify, request, render_template
import speech_recognition as sr
from auth import verify_signature, create_session, validate_session
from akash_manager import deploy_to_akash, get_deployment_status, terminate_deployment, get_all_deployments, ADDRESS
from voice_parser import parse_voice_command

# Load environment variables
dotenv_path = find_dotenv(usecwd=True)
loaded = load_dotenv(dotenv_path, override=True, verbose=True)  

app = Flask(__name__)
recognizer = sr.Recognizer()

@app.route('/')
def home():
    return jsonify({"OK"}), 200

@app.route('/login', methods=['POST'])
def login():
    data = request.form
    wallet_address = data.get('wallet_address')
    signature = data.get('signature')
    nonce = data.get('nonce')
    
    if verify_signature(wallet_address, nonce, signature):
        session_id = create_session(wallet_address)
        return jsonify({"session_id": session_id}), 200
    return jsonify({"msg": "Signature verification failed"}), 401

@app.route('/voice', methods=['POST'])
def voice_command():
    wallet_address, error, status = validate_session()
    if error:
        return jsonify(error), status
    
    with sr.Microphone() as source:
        print("Listening...")
        audio = recognizer.listen(source, timeout=5)
    
    command, raw_text = parse_voice_command(audio)
    response = {"raw_text": raw_text}
    
    if command["action"] == "deploy" and command["target"] == "deployment":
        deployment_id = deploy_to_akash(wallet_address, command["image"], command["cpu"], command["memory"], command["storage"], command["ports"])
        response["result"] = f"Deployed {command['image']} with ID: {deployment_id}"
    elif command["action"] == "status" and command["target"] == "deployment":
        deployment_id = command["id"] or request.args.get("id")
        if deployment_id:
            status = get_deployment_status(deployment_id)
            response["result"] = f"Status: {status}"
        else:
            response["result"] = "Please provide deployment ID"
    elif command["action"] == "terminate" and command["target"] == "deployment":
        deployment_id = command["id"] or request.args.get("id")
        if deployment_id and terminate_deployment(deployment_id):
            response["result"] = "Deployment terminated"
        else:
            response["result"] = "Termination failed or ID not found"
    else:
        response["result"] = "Command not recognized"
    
    return jsonify(response)

@app.route('/status/<deployment_id>')
def status(deployment_id):
    wallet_address, error, status = validate_session()
    if error:
        return jsonify(error), status
    status = get_deployment_status(deployment_id)
    return render_template('status.html', deployment_id=deployment_id, status=status)

@app.route('/deployments')
def deployments():
    wallet_address, error, status = validate_session()
    if error:
        return jsonify(error), status
    
    # Get pagination parameters from query string
    page = request.args.get('page', default=1, type=int)
    per_page = request.args.get('per_page', default=10, type=int)
    
    # Ensure reasonable limits
    if page < 1:
        page = 1
    if per_page < 1 or per_page > 100:
        per_page = 10
    
    # Fetch paginated deployments
    paginated_deployments = get_all_deployments(wallet_address, page, per_page)
    return jsonify(paginated_deployments), 200

if __name__ == "__main__":
    print(f"Akash Wallet Address: {ADDRESS}")
    port = os.getenv("APP_PORT")
    app.run(debug=True, host="0.0.0.0", port=port)