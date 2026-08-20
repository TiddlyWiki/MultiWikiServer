# Use Node.js 22 Alpine image
FROM node:22-alpine

# Install MultiWikiServer from npm globally
RUN npm install @tiddlywiki/mws@latest -g

# Set working directory
WORKDIR /data

# Create instance package.json that references MWS
RUN echo '{"name":"@tiddlywiki/mws-instance","private":true,"version":"0.2.0"}' > package.json

# Expose default MWS port
EXPOSE 8080

# Set up volume for data persistence
VOLUME ["/data"]

ENTRYPOINT ["mws"]
# Default command - users can override this with docker-compose
CMD ["listen", "--listener", "host=0.0.0.0", "port=8080"]

# docker run --rm --network host -it node:22-alpine sh