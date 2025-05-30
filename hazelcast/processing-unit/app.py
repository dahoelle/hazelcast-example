import os
import hazelcast
import json
import time
time.sleep(15)
# Connect to Hazelcast middleware
client = hazelcast.HazelcastClient(
    cluster_name="dev",
    cluster_members=[f"{os.getenv('HZ_HOST', 'middleware')}:{os.getenv('HZ_PORT', '5701')}"]
)

# Get distributed tuple space
request_queue = client.get_queue("http-requests").blocking()
response_map = client.get_map("http-responses").blocking()

print("Worker started. Waiting for requests...")

while True:
    try:
        # Get request from tuple space
        request_data = request_queue.take()
        req = json.loads(request_data)
        
        print(f"Processing request {req['id']}")
        
        # SIMULATE PROCESS TODO
        time.sleep(2)
        
        # Create response
        response = {
            "id": req["id"],
            "status": "processed",
            "worker": os.getpid(),
            "result": f"Processed: {req['data']}",
            "timestamp": time.time()
        }
        
        # Store response in tuple space
        response_map.put(req["id"], json.dumps(response))
        
        print(f"Completed request {req['id']}")
        
    except Exception as e:
        print(f"Processing error: {e}")