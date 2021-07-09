#!/usr/bin/env bash

if [[ $1 == "--ecr" ]]; then
  registry=886185890074.dkr.ecr.us-east-2.amazonaws.com/
fi

docker build -t ${registry}lekt-frontend-image .
