import os
import hazelcast
import threading
import time
import uuid
import json

def process_requests(request_queue, response_map):
    while True:
        try:
            # Block until a request is available
            request_data = request_queue.take()
            request = json.loads(request_data)
            
            print(f"Processing request ID: {request['id']}")
            time.sleep(2)  # Simulate processing time
            
            # Create response
            response = {
                "id": request["id"],
                "status": "processed",
                "worker": os.getpid(),
                "original_data": request["data"]
            }
            
            # Store response in the distributed map
            response_map.put(request["id"], json.dumps(response))
            print(f"Processed request {request['id']}")
            
        except Exception as e:
            print(f"Processing error: {e}")

def main():
    client = hazelcast.HazelcastClient(
        cluster_name="dev",
        cluster_members=[f"{os.getenv('HZ_HOST', 'middleware')}:{os.getenv('HZ_PORT', '5701')}"]
    )
    
    # Get distributed data structures
    request_queue = client.get_queue("http-requests").blocking()
    response_map = client.get_map("http-responses").blocking()
    
    # Start request processing thread
    processor = threading.Thread(
        target=process_requests, 
        args=(request_queue, response_map),
        daemon=True
    )
    processor.start()
    
    # Simulate request generation (replace with actual HTTP handler)
    try:
        request_id = 0
        while True:
            request_id += 1
            request = {
                "id": str(uuid.uuid4()),
                "timestamp": time.time(),
                "data": f"Request #{request_id} from {os.getpid()}"
            }
            request_queue.put(json.dumps(request))
            print(f"Submitted request {request['id']}")
            time.sleep(1)
    except KeyboardInterrupt:
        client.shutdown()

if __name__ == "__main__":
    main()