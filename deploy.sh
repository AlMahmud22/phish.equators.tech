cd /var/www/html/phish.equators.tech
git fetch origin main
git reset --hard origin/main   # overwrite everything with repo
npm install --no-audit --no-fund   # install deps, regenerates node_modules if needed
npm run build
pm2 restart phish_site || pm2 start npm --name phish_site -- start --update-env
pm2 save
echo "DEPLOY_OK: $(date -u)"
