# Use Node.js 18 Alpine image for smaller size
FROM node:18-alpine

# Set working directory
WORKDIR /data

# Create instance package.json that references MWS
RUN echo '{"name":"@tiddlywiki/mws-instance","private":true,"version":"0.1.0","scripts":{"start":"mws listen --listener"}}' > package.json

# Install TiddlyWiki and MultiWikiServer from npm
# Using --omit=dev to keep image smaller
RUN npm install --save-exact tiddlywiki@latest @tiddlywiki/mws@latest

# Expose default MWS port
EXPOSE 8080

# Set up volumes for data persistence
VOLUME ["/data/store", "/data/passwords.key"]

# Default command - users can override this with docker-compose
CMD ["npx", "mws", "listen", "--listener"]
