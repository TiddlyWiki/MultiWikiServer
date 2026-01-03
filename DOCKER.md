# Docker Deployment Guide for MultiWikiServer

This guide explains how to deploy MultiWikiServer using Docker and Docker Compose.

## Quick Start

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+ (or docker-compose 1.29+)

### Basic Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/TiddlyWiki/MultiWikiServer.git
   cd MultiWikiServer
   ```

2. **Build and start MWS:**
   ```bash
   docker-compose up -d
   ```
   
   This will:
   - Build a Docker image with the latest MWS from npm
   - Create necessary Docker volumes for data persistence
   - Initialize the database on first run
   - Start the MWS server

3. **Access your wiki:**
   - Open http://localhost:8080 in your browser
   - Default credentials: username `admin`, password `1234`
   - **Important:** Change the default password immediately after first login!

4. **View logs:**
   ```bash
   docker-compose logs -f mws
   ```

5. **Stop MWS:**
   ```bash
   docker-compose down
   ```

### About the Docker Image

The provided `Dockerfile` builds an image that:
- Uses Node.js 18 Alpine Linux for a small footprint
- Installs the latest stable version of MWS from npm
- Automatically initializes the database on first run
- Exposes port 8080 by default

The image installs MWS as an npm package, so you always get the official, published version. This approach:
- Ensures consistency with the standard Node.js installation
- Benefits from pre-built native modules (better-sqlite3)
- Simplifies updates through `docker-compose build --no-cache`

## Data Persistence

MWS uses Docker volumes to persist your data:

- **mws-data** (default setup): A single named volume containing all data:
  - `store/`: SQLite database with wikis and tiddlers
  - `passwords.key`: Master key for password encryption
  - `cache/`: Cache files (regenerated on startup if missing)
  
- **./data/** (production setup): A bind-mounted directory containing:
  - `store/`: SQLite database
  - `passwords.key`: Password master key
  - `cache/`: Cache files

### Important Files

- `store/`: SQLite database with all your wikis and tiddlers - **Never delete files in this folder!**
- `passwords.key`: If this file is lost or changed, all user passwords will need to be reset
- `cache/`: Can be safely deleted; will be regenerated on startup

## Configuration Options

### Using docker-compose.yml (Default)

The default `docker-compose.yml` uses named Docker volumes for data storage:

```bash
docker-compose up -d
```

Advantages:
- Docker manages storage automatically
- Works well for development and testing

### Using docker-compose.production.yml

For production deployments, use `docker-compose.production.yml` which uses bind mounts:

```bash
docker-compose -f docker-compose.production.yml up -d
```

Advantages:
- Easier to backup (data is in `./data/` directory)
- More control over file locations
- Better for production environments

### Custom Port

To run on a different port, set the `MWS_PORT` environment variable:

```bash
MWS_PORT=3000 docker-compose -f docker-compose.production.yml up -d
```

### Custom Timezone

Set the `TZ` environment variable:

```bash
TZ=America/New_York docker-compose -f docker-compose.production.yml up -d
```

## Backup and Restore

### Backup with Named Volumes (Default Setup)

```bash
# Stop the container
docker-compose down

# Backup the entire data volume (includes store, passwords.key, and cache)
docker run --rm \
  -v multiwikiserver_mws-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/mws-backup-$(date +%Y%m%d).tar.gz /data
```

### Backup with Bind Mounts (Production Setup)

```bash
# Stop the container (optional but recommended)
docker-compose -f docker-compose.production.yml down

# Simply backup the data directory
tar czf mws-backup-$(date +%Y%m%d).tar.gz ./data/
```

### Restore

For named volumes (default setup):
```bash
# Stop the container
docker-compose down

# Restore the backup
docker run --rm \
  -v multiwikiserver_mws-data:/data \
  -v $(pwd):/backup \
  alpine sh -c "cd / && tar xzf /backup/mws-backup-YYYYMMDD.tar.gz"

# Start the container
docker-compose up -d
```

For bind mounts (production setup):
```bash
# Stop the container
docker-compose -f docker-compose.production.yml down

# Restore the backup
tar xzf mws-backup-YYYYMMDD.tar.gz

# Start the container
docker-compose -f docker-compose.production.yml up -d
```

## Updates

## Updates

### Updating MWS Version

1. **Backup your data first!** (See backup section above)

2. **Update the Docker image:**
   ```bash
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

3. **Check logs for any migration messages:**
   ```bash
   docker-compose logs -f mws
   ```

### Migrating Data

If you have an existing MWS installation and want to migrate to Docker:

**For Production Setup (recommended for migration):**

1. **Copy your data:**
   ```bash
   # Create data directory
   mkdir -p ./data
   
   # Copy your entire existing data folder
   cp -r /path/to/your/mws/store ./data/
   cp /path/to/your/mws/passwords.key ./data/
   # Copy cache if you want (optional)
   cp -r /path/to/your/mws/cache ./data/ 2>/dev/null || true
   ```

2. **Start with docker-compose.production.yml:**
   ```bash
   docker-compose -f docker-compose.production.yml up -d
   ```

**For Default Setup (with named volumes):**

1. **Start the container first to create the volume:**
   ```bash
   docker-compose up -d
   docker-compose down
   ```

2. **Copy data into the volume:**
   ```bash
   # Copy store folder
   docker run --rm \
     -v multiwikiserver_mws-data:/data \
     -v /path/to/your/mws:/source \
     alpine sh -c "cp -r /source/store /data/ && cp /source/passwords.key /data/"
   ```

3. **Start the container:**
   ```bash
   docker-compose up -d
   ```

## Troubleshooting

### Container won't start

Check logs:
```bash
docker-compose logs mws
```

### Database is locked

This can happen if the container was forcefully stopped:
```bash
# Stop the container
docker-compose down

# Remove lock files (if using bind mounts)
rm -f ./data/store/*.lock

# Restart
docker-compose up -d
```

### Permission issues

If you encounter permission issues with bind mounts:
```bash
# Fix ownership (adjust UID/GID as needed)
sudo chown -R $(id -u):$(id -g) ./data/
```

### Reset to fresh installation

**Warning: This will delete all your data!**

For default setup:
```bash
# Stop and remove containers
docker-compose down

# Remove the data volume
docker volume rm multiwikiserver_mws-data

# Start fresh
docker-compose up -d
```

For production setup:
```bash
# Stop containers
docker-compose -f docker-compose.production.yml down

# Remove data directory
rm -rf ./data/

# Start fresh
docker-compose -f docker-compose.production.yml up -d
```

## Advanced Configuration

### Using HTTPS

To enable HTTPS, you'll need to:

1. Generate or obtain SSL certificates
2. Mount them into the container
3. Pass them as arguments to the MWS listen command

Example docker-compose.yml modification:
```yaml
services:
  mws:
    # ... other config ...
    volumes:
      - ./ssl/key.pem:/certs/key.pem:ro
      - ./ssl/cert.pem:/certs/cert.pem:ro
    command: >
      sh -c "
      if [ ! -f /data/store/mws.db ]; then
        npx mws init-store
      fi &&
      npx mws listen --listener host=0.0.0.0 port=8080 key=/certs/key.pem cert=/certs/cert.pem secure=true
      "
```

### Using a Reverse Proxy

For production deployments, it's recommended to use a reverse proxy like Nginx or Traefik. See `docker-compose.production.yml` for an example setup.

### Running Multiple Instances

Each instance needs its own data directory and port:

```bash
# Instance 1
MWS_PORT=8081 docker-compose -f docker-compose.production.yml -p mws1 up -d

# Instance 2
MWS_PORT=8082 docker-compose -f docker-compose.production.yml -p mws2 up -d
```

## Getting Help

- [MWS Discussions](https://github.com/TiddlyWiki/MultiWikiServer/discussions)
- [Report Issues](https://github.com/TiddlyWiki/MultiWikiServer/issues)
- [Main Documentation](../README.md)
