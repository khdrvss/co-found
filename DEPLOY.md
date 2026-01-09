# Deployment Guide — co-found.uz

## 1. Server Preparation

**Prerequisites:** Ubuntu 20.04+ (Recommended)

1. **Update System & Install Docker**
   ```bash
   sudo apt update && sudo apt upgrade -y
   sudo apt install -y docker.io docker-compose-plugin git
   # or for standalone docker-compose
   # sudo apt install -y docker-compose
   
   sudo systemctl enable --now docker
   ```

2. **Verify Installation**
   ```bash
   docker --version
   docker compose version
   ```

## 2. Transfer Project Files

Since this is a private project, transfer files directly from your local machine to the VPS using `scp`.

**On Local Machine (PowerShell/Terminal):**
```bash
# Transfer the project folder (excluding node_modules due to size)
scp -r d:/projects/co-found root@45.138.159.4:/root/co-found
```
*Note: Make sure `.dockerignore` exists locally to avoid uploading unnecessary files if you build locally, but for source transfer, exclude `node_modules` manually or via rsync if possible.*

Alternatively, if you have a Git repository:
```bash
git clone <your-repo-url> /root/co-found
cd /root/co-found
```

## 3. Configuration

1. **SSH into VPS**
   ```bash
   ssh root@45.138.159.4
   cd /root/co-found
   ```

2. **Setup Environment Variables**
   Create the production `.env` file.
   ```bash
   cp .env.example .env
   nano .env
   ```
   
   **Required Variables:**
   ```env
   # Database (Internal)
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=strong_password_here
   POSTGRES_DB=cofound_prod
   
   # App
   NODE_ENV=production
   JWT_SECRET=complex_secret_key_here
   JWT_EXPIRES_IN=7d
   
   # Google Auth
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_ID=your_google_client_id
   ```

## 4. Build & Run

1. **Build and Start Containers**
   ```bash
   docker compose up -d --build
   ```
   *This will build the frontend and backend images, start the database, and setup Nginx with SSL automatically.*

2. **Check Status**
   ```bash
   docker compose ps
   docker compose logs -f
   ```

## 5. SSL & Domain Verification

The `nginx-proxy` and `acme-companion` containers handle SSL automatically for:
- `co-found.uz`
- `www.co-found.uz`

**Verify:**
1. Open https://co-found.uz in your browser.
2. Ensure the lock icon appears (Let's Encrypt certificate).

## 6. Maintenance

- **View App Logs:** `docker compose logs -f app`
- **View Nginx Logs:** `docker compose logs -f nginx-proxy`
- **Restart App:** `docker compose restart app`
- **Update Application:**
  1. Upload new code used `scp`.
  2. Run `docker compose up -d --build`.

## 7. Troubleshooting

- **Database Connection:** The app connects to `db` host internally. Ensure `DB_HOST=db` is NOT overridden incorrectly (the docker-compose sets it via network, but app uses `db` hostname).
- **Backend Errors:** Check `docker compose logs app`.
- **Nginx Errors:** Check `docker compose logs nginx-proxy`.
