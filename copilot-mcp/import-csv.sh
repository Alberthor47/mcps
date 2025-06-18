#!/bin/bash

# Wait for MongoDB to be ready
until mongosh --host localhost --port 27017 -u admin -p password123 --authenticationDatabase admin --eval "db.runCommand('ping')" >/dev/null 2>&1; do
    echo "Waiting for MongoDB to be ready..."
    sleep 2
done

echo "MongoDB is ready. Importing CSV data..."

# Import the CSV file into the users collection
mongoimport --host localhost --port 27017 \
    -u admin -p password123 --authenticationDatabase admin \
    --db testdb --collection users \
    --type csv --headerline \
    --file /docker-entrypoint-initdb.d/users.csv

echo "CSV data import completed."
