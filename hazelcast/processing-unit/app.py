import os
import hazelcast

def main():
    # Connect to Hazelcast cluster
    client = hazelcast.HazelcastClient(
        cluster_name="dev",
        cluster_members=[f"{os.getenv('HZ_HOST', 'middleware')}:{os.getenv('HZ_PORT', '5701')}"]
    )

    # Interact with distributed map
    demo_map = client.get_map("demo-map").blocking()
    demo_map.put("python-key", "Hello from Python Processing Unit!")
    
    # Retrieve value
    value = demo_map.get("python-key")
    print(f"Value from Hazelcast: {value}")

    client.shutdown()

if __name__ == "__main__":
    main()