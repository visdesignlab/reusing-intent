#!/bin/bash

echo "Deployment started"
ssh ssh ubuntu@ec2-3-16-108-17.us-east-2.compute.amazonaws.com "
    sudo docker image prune -f
    cd reusing-intent
    sudo docker-compose down
    git reset --hard
    git checkout main
    git pull
    sudo docker-compose up -d
    "
echo "Deployment complete!"
