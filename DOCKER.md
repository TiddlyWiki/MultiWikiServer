# Docker Deployment Guide for MultiWikiServer

This guide explains how to deploy MultiWikiServer using Docker and Docker Compose.

## Quick Start

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+ (or docker-compose 1.29+)

### Basic Setup

1. **Build and start MWS:**
   ```bash
   docker-compose up -d
   ```

2. **Access your wiki:**
   - Open http://localhost:8080 in your browser
   - Default credentials: username `admin`, password `1234`
   - **Important:** Change the default password immediately after first login!

3. **View logs:**
   ```bash
   docker-compose logs -f mws
   ```

4. **Stop MWS:**
   ```bash
   docker-compose down
   ```

## Data Persistence

MWS uses Docker volumes to persist your data:

- **mws-data**: Contains your SQLite database (store folder)
- **passwords.key**: Master key for password encryption (bind-mounted to host)
- **mws-cache**: Cache files (regenerated on startup if missing)

### Important Files

- `store/`: SQLite database with all your wikis and tiddlers - **Never delete files in this folder!**
- `passwords.key`: If this file is lost or changed, all user passwords will need to be reset

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

### Backup with Named Volumes

```bash
# Stop the container
docker-compose down

# Backup the database volume
docker run --rm \
  -v multiwikiserver_mws-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/mws-backup-$(date +%Y%m%d).tar.gz /data

# Backup the passwords.key file
cp passwords.key passwords.key.backup
```

### Backup with Bind Mounts (Production)

```bash
# Simply backup the data directory
tar czf mws-backup-$(date +%Y%m%d).tar.gz ./data/
```

### Restore

For named volumes:
```bash
# Stop the container
docker-compose down

# Restore the backup
docker run --rm \
  -v multiwikiserver_mws-data:/data \
  -v $(pwd):/backup \
  alpine sh -c "cd / && tar xzf /backup/mws-backup-YYYYMMDD.tar.gz"

# Restore passwords.key
cp passwords.key.backup passwords.key

# Start the container
docker-compose up -d
```

For bind mounts (production):
```bash
docker-compose -f docker-compose.production.yml down
tar xzf mws-backup-YYYYMMDD.tar.gz
docker-compose -f docker-compose.production.yml up -d
```

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

1. **Copy your data:**
   ```bash
   # Create data directory structure
   mkdir -p ./data/store
   
   # Copy your existing store folder
   cp -r /path/to/your/mws/store/* ./data/store/
   
   # Copy passwords.key
   cp /path/to/your/mws/passwords.key ./data/passwords.key
   ```

2. **Start with docker-compose.production.yml:**
   ```bash
   docker-compose -f docker-compose.production.yml up -d
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

```bash
# Stop and remove containers
docker-compose down

# Remove volumes
docker volume rm multiwikiserver_mws-data multiwikiserver_mws-cache

# Remove passwords.key
rm -f passwords.key

# Start fresh
docker-compose up -d
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
