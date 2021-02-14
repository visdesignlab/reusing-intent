#!/bin/bash

echo "Deployment started"
if ! ssh ubuntu@ec2-3-131-141-97.us-east-2.compute.amazonaws.com "
    echo 'Pruning Images'
    sudo docker image prune -f
    echo 'Images pruned'
    cd reusing-intent
    sudo docker-compose down
    echo 'docker-compose down -- completed'
    git reset --hard
    git checkout main
    echo 'Switched to main'
    git pull
    echo 'Pulled latest'
    sudo docker-compose up -d
    "
then
    echo "Failure"
    exit 1
else
    echo "Deployment complete!"
fi
