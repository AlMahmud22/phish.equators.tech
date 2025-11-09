#!/bin/bash
cd /var/www/html/phish.equators.tech
git fetch --all
git reset --hard origin/main
npm ci --no-audit --no-fund
npm run build
pm2 restart phish_site || PORT=3001 pm2 start npm --name phish_site -- start --update-env
pm2 save
echo "DEPLOY_OK: $(date -u)"
