#!/bin/bash
cd ~/forum-api
git pull
npm run migrate up
npx pm2 restart npm -- start
