# Deploy `location.cropgenapp.com`

## 1) Prepare server

- Ubuntu/Debian VM with DNS A record of `location.cropgenapp.com` pointing to server IP.
- Install Node.js LTS, npm, nginx, certbot.

## 2) Copy project and install

```bash
git clone <your-repo-url>
cd cropgen-world-countries-city-state
npm install
cp .env.example .env
```

Edit `.env`:

```env
PORT=3001
MONGODB_URI=mongodb://127.0.0.1:27017/geo
```

## 3) Start with PM2

```bash
npm i -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 4) Configure nginx

```bash
sudo cp config/location.cropgenapp.com.nginx.conf /etc/nginx/sites-available/location.cropgenapp.com
sudo ln -s /etc/nginx/sites-available/location.cropgenapp.com /etc/nginx/sites-enabled/location.cropgenapp.com
sudo nginx -t
sudo systemctl reload nginx
```

## 5) Enable HTTPS

```bash
sudo certbot --nginx -d location.cropgenapp.com
```

## 6) Verify

- `https://location.cropgenapp.com/` -> SSR docs page
- `https://location.cropgenapp.com/health`
- `https://location.cropgenapp.com/api/countries`

## 7) Useful ops

```bash
pm2 logs cropgen-location-api
pm2 restart cropgen-location-api
pm2 status
```
