#!/bin/bash
curl -s "https://haiq-api.onrender.com/v1/auth/login" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Origin: https://haiqweb.vercel.app" \
  -d '{"email":"aaronmugumya04@gmail.com","password":"1234@!"}'
