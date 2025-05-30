import os
import hazelcast
import uuid
import json
import time
from flask import Flask, request, jsonify

app = Flask(__name__)

#Hazelcast middleware connection
client = hazelcast.HazelcastClient(
    cluster_name="dev",
    cluster_members=[f"{os.getenv('HZ_HOST', 'middleware')}:{os.getenv('HZ_PORT', '5701')}"]
)

#Tuple Space request queue and response map (req id -> res)
request_queue = client.get_queue("http-requests").blocking()
response_map = client.get_map("http-responses").blocking()

@app.route('/submit', methods=['POST'])
def submit_request():
    """Receive HTTP request and store in tuple space"""
    try:
        request_id = str(uuid.uuid4())
        request_tuple = {
            "id": request_id,
            "data": request.json.get("data", ""),
            "timestamp": time.time(),
            "client_ip": request.remote_addr
        }
        request_queue.put(json.dumps(request_tuple))
        
        return jsonify({
            "status": "submitted",
            "id": request_id,
            "message": "Request queued for processing"
        }), 202
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/status/<request_id>', methods=['GET'])
def check_status(request_id):
    """Check processing status from tuple space"""
    response = response_map.get(request_id)
    if response:
        return jsonify(json.loads(response)), 200
    return jsonify({
        "id": request_id,
        "status": "pending",
        "message": "Request not yet processed"
    }), 200

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)