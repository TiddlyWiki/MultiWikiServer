# Use Node.js 22 Alpine image
FROM node:22-alpine

# Set working directory
WORKDIR /data

# Create instance package.json that references MWS
RUN echo '{"name":"@tiddlywiki/mws-instance","private":true,"version":"0.1.0","scripts":{"start":"mws listen --listener"}}' > package.json

# Install TiddlyWiki and MultiWikiServer from npm
# Using --omit=dev to keep image smaller
RUN npm install --save-exact tiddlywiki@latest @tiddlywiki/mws@latest

# Expose default MWS port
EXPOSE 8080

# Set up volume for data persistence
# This includes store/, cache/, and passwords.key
VOLUME ["/data"]

# Default command - users can override this with docker-compose
CMD ["npx", "mws", "listen", "--listener", "host=0.0.0.0", "port=8080"]
