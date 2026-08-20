# Use Node.js 22 Alpine image
FROM node:22-alpine

# The data-folder format is independent from the MWS package version. This
# matches create-package/files/package.json, which is the template used by
# `npm init @tiddlywiki/mws`.
ARG MWS_VERSION=0.2.4
WORKDIR /data
RUN echo '{"name":"@tiddlywiki/mws-instance","private":true,"version":"0.2.0","scripts":{"start":"mws listen --listener"}}' > package.json

# Install the published MWS package for the target container platform. The
# build tools are only needed when a native dependency has no prebuilt binary.
# The create script then downloads TiddlyWiki with `mws update-tiddlywiki`.
RUN apk add --no-cache --virtual .build-deps python3 make g++ \
    && npm install --save-exact "@tiddlywiki/mws@${MWS_VERSION}" \
    && npm exec mws update-tiddlywiki \
    && apk del .build-deps

# Expose default MWS port
EXPOSE 8080

# Set up volume for data persistence
VOLUME ["/data/store"]

# Default command - users can override this with docker-compose
CMD ["npx", "mws", "listen", "--listener", "host=0.0.0.0", "port=8080"]
