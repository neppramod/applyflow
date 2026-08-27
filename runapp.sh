#!/bin/sh
docker compose down

# ADDED -d to run in the background permanently
docker compose up --build -d 

