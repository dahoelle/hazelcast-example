# Start the cluster
docker-compose up --build --scale processing-unit=3

# Check cluster status
docker exec -it hazelcast-architecture-middleware-1 bin/hz-cli -c cluster