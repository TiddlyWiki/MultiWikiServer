# Docker Deployment Guide for MultiWikiServer

This guide explains how to deploy MultiWikiServer using Docker and Docker Compose.

## Quick Start

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+ (or docker-compose 1.29+)

## Two Deployment Modes

MultiWikiServer provides two Docker Compose configurations:

1. **docker-compose.volume.yml** - Uses Docker-managed volumes (simpler, data managed by Docker)
2. **docker-compose.directory.yml** - Uses a local directory bind mount (data easily accessible on host)

Choose the mode that best fits your needs.

---

## Mode 1: Docker Volumes (docker-compose.volume.yml)

This mode uses Docker-managed named volumes for data storage.

### Setup

1. **Download the required files:**
   ```bash
   curl -O https://raw.githubusercontent.com/TiddlyWiki/MultiWikiServer/main/docker-compose.volume.yml
   curl -O https://raw.githubusercontent.com/TiddlyWiki/MultiWikiServer/main/Dockerfile
   ```

2. **Start the container:**
   ```bash
   docker-compose -f docker-compose.volume.yml up -d
   ```

3. **Initialize the database (required on first run):**
   ```bash
   docker-compose -f docker-compose.volume.yml exec mws npx mws init-store
   ```
   
   This creates:
   - The default `admin` user with password `1234`
   - Initial database schema
   - Default wiki content

4. **Access your wiki:**
   - Open http://localhost:8080 in your browser
   - Default credentials: username `admin`, password `1234`
   - **Important:** Change the default password immediately after first login!

5. **View logs:**
   ```bash
   docker-compose -f docker-compose.volume.yml logs -f mws
   ```

6. **Stop MWS:**
   ```bash
   docker-compose -f docker-compose.volume.yml down
   ```

### Data Location

Data is stored in a Docker-managed volume named `mws-store`. This volume contains the `store/` directory with your SQLite database and all wikis and tiddlers.

Cache files are ephemeral and regenerated on startup as needed.

---

## Mode 2: Directory Mount (docker-compose.directory.yml)

This mode uses a local `./store` directory for data storage, making it easier to access and backup your data.

### Setup

1. **Create your MWS data directory:**
   ```bash
   mkdir my-mws-data
   cd my-mws-data
   ```

2. **Download the required files:**
   ```bash
   curl -O https://raw.githubusercontent.com/TiddlyWiki/MultiWikiServer/main/docker-compose.directory.yml
   curl -O https://raw.githubusercontent.com/TiddlyWiki/MultiWikiServer/main/Dockerfile
   ```

3. **Create the store directory:**
   ```bash
   mkdir -p store
   ```

4. **Start the container:**
   ```bash
   docker-compose -f docker-compose.directory.yml up -d
   ```

5. **Initialize the database (required on first run):**
   ```bash
   docker-compose -f docker-compose.directory.yml exec mws npx mws init-store
   ```
   
   This creates:
   - The default `admin` user with password `1234`
   - Initial database schema
   - Default wiki content

6. **Access your wiki:**
   - Open http://localhost:8080 in your browser
   - Default credentials: username `admin`, password `1234`
   - **Important:** Change the default password immediately after first login!

7. **View logs:**
   ```bash
   docker-compose -f docker-compose.directory.yml logs -f mws
   ```

8. **Stop MWS:**
   ```bash
   docker-compose -f docker-compose.directory.yml down
   ```

### Data Location

Data is stored in the `./store` directory in your current directory. This directory contains your SQLite database and all wikis and tiddlers.

Cache files are ephemeral and regenerated on startup as needed.

---

## About the Docker Image

The Docker image:
- Uses Node.js 22 Alpine Linux for a small footprint
- Installs the latest stable version of MWS from npm
- Exposes port 8080 by default

The image installs MWS as an npm package, ensuring consistency with the standard Node.js installation.

## Important Files

- **store/** - SQLite database with all your wikis and tiddlers
  - **Never delete files in this folder!** All files are data files.
  - Contains the database and all tiddler content
  
- **cache/** - Cache files (ephemeral)
  - Automatically regenerated on startup if missing
  - Not persisted in Docker deployments

---

## Backup and Restore

### Backup with Docker Volumes Mode

```bash
# Stop the container
docker-compose -f docker-compose.volume.yml down

# Backup the store volume
docker run --rm \
  -v multiwikiserver_mws-store:/data/store \
  -v $(pwd):/backup \
  alpine tar czf /backup/mws-backup-$(date +%Y%m%d).tar.gz /data/store
```

### Backup with Directory Mode

```bash
# Stop the container (optional but recommended)
docker-compose -f docker-compose.directory.yml down

# Simply backup the store directory
tar czf mws-backup-$(date +%Y%m%d).tar.gz ./store/
```

### Restore from Backup

For Docker volumes mode:
```bash
# Stop the container
docker-compose -f docker-compose.volume.yml down

# Restore the backup
docker run --rm \
  -v multiwikiserver_mws-store:/data/store \
  -v $(pwd):/backup \
  alpine sh -c "cd / && tar xzf /backup/mws-backup-YYYYMMDD.tar.gz"

# Start the container (no need to run init-store again)
docker-compose -f docker-compose.volume.yml up -d
```

For directory mode:
```bash
# Stop the container
docker-compose -f docker-compose.directory.yml down

# Restore the backup
tar xzf mws-backup-YYYYMMDD.tar.gz

# Start the container (no need to run init-store again)
docker-compose -f docker-compose.directory.yml up -d
```

---

## Updates

### Updating MWS Version

1. **Backup your data first!** (See backup section above)

2. **Update the Docker image:**
   ```bash
   # For volumes mode
   docker-compose -f docker-compose.volume.yml down
   docker-compose -f docker-compose.volume.yml build --no-cache
   docker-compose -f docker-compose.volume.yml up -d
   
   # For directory mode
   docker-compose -f docker-compose.directory.yml down
   docker-compose -f docker-compose.directory.yml build --no-cache
   docker-compose -f docker-compose.directory.yml up -d
   ```

3. **Check logs for any migration messages:**
   ```bash
   # For volumes mode
   docker-compose -f docker-compose.volume.yml logs -f mws
   
   # For directory mode
   docker-compose -f docker-compose.directory.yml logs -f mws
   ```

---

## Migrating from Existing Node.js Installation

If you have an existing MWS installation and want to migrate to Docker:

### Using Directory Mode (Recommended for Migration)

1. **Create your MWS data directory and copy your store:**
   ```bash
   mkdir my-mws-data
   cd my-mws-data
   
   # Copy your existing store folder
   cp -r /path/to/your/mws/store ./
   ```

2. **Download the required files:**
   ```bash
   curl -O https://raw.githubusercontent.com/TiddlyWiki/MultiWikiServer/main/docker-compose.directory.yml
   curl -O https://raw.githubusercontent.com/TiddlyWiki/MultiWikiServer/main/Dockerfile
   ```

3. **Start the container (no need to run init-store):**
   ```bash
   docker-compose -f docker-compose.directory.yml up -d
   ```

### Using Volumes Mode

1. **Download the required files:**
   ```bash
   curl -O https://raw.githubusercontent.com/TiddlyWiki/MultiWikiServer/main/docker-compose.volume.yml
   curl -O https://raw.githubusercontent.com/TiddlyWiki/MultiWikiServer/main/Dockerfile
   ```

2. **Start the container first to create the volume:**
   ```bash
   docker-compose -f docker-compose.volume.yml up -d
   docker-compose -f docker-compose.volume.yml down
   ```

3. **Copy store folder into the volume:**
   ```bash
   docker run --rm \
     -v multiwikiserver_mws-store:/data/store \
     -v /path/to/your/mws:/source \
     alpine sh -c "cp -r /source/store/* /data/store/"
   ```

4. **Start the container (no need to run init-store):**
   ```bash
   docker-compose -f docker-compose.volume.yml up -d
   ```

---

## Troubleshooting

### Container won't start

Check logs:
```bash
# For volumes mode
docker-compose -f docker-compose.volume.yml logs mws

# For directory mode
docker-compose -f docker-compose.directory.yml logs mws
```

### Permission issues

If you encounter permission issues with directory mode:
```bash
# Fix ownership (adjust UID/GID as needed)
sudo chown -R $(id -u):$(id -g) ./store/
```

### Forgot to run init-store

If you started the container without running init-store:
```bash
# For volumes mode
docker-compose -f docker-compose.volume.yml exec mws npx mws init-store

# For directory mode
docker-compose -f docker-compose.directory.yml exec mws npx mws init-store
```

### Reset to fresh installation

**Warning: This will delete all your data!**

For volumes mode:
```bash
# Stop and remove containers
docker-compose -f docker-compose.volume.yml down

# Remove the store volume
docker volume rm multiwikiserver_mws-store

# Start fresh and initialize
docker-compose -f docker-compose.volume.yml up -d
docker-compose -f docker-compose.volume.yml exec mws npx mws init-store
```

For directory mode:
```bash
# Stop containers
docker-compose -f docker-compose.directory.yml down

# Remove store directory
rm -rf ./store/

# Start fresh and initialize
mkdir -p ./store
docker-compose -f docker-compose.directory.yml up -d
docker-compose -f docker-compose.directory.yml exec mws npx mws init-store
```

---

## Advanced Configuration

### Using HTTPS

To enable HTTPS, you'll need to generate or obtain SSL certificates and pass them to MWS:

1. Generate certificates (example using openssl):
   ```bash
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout ./certs/key.pem -out ./certs/cert.pem
   ```

2. Mount the certificates and modify the command in your docker-compose file:
   ```yaml
   volumes:
     - ./store:/data/store
     - ./certs:/certs:ro
   command: >
     sh -c "npx mws listen --listener host=0.0.0.0 port=8080 
     key=/certs/key.pem cert=/certs/cert.pem secure=true"
   ```

### Custom Port

To change the exposed port, modify the `ports` section in your docker-compose file:

```yaml
ports:
  - "3000:8080"  # Host port 3000 -> Container port 8080
```

### Environment Variables

You can set additional environment variables in your docker-compose file:

```yaml
environment:
  - NODE_ENV=production
  - TZ=America/New_York  # Set timezone
```

---

## Getting Help

- [MWS Discussions](https://github.com/TiddlyWiki/MultiWikiServer/discussions)
- [Report Issues](https://github.com/TiddlyWiki/MultiWikiServer/issues)
- [Main Documentation](README.md)
