FROM node:18

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json .

# Only installs production dependencies when NODE_ENV=production
RUN npm ci

# Bundle app source
COPY build ./build
COPY prisma ./prisma

# Initialises primsa client using the schema.prisma
RUN primsa generate

# Sets process.env.NODE_ENV
ENV NODE_ENV production

# Sets process.env.PORT
EXPOSE 80

# Starts the app
CMD [ "node", "build/index.js" ]

# Run all subsequenct commands as this user, and not root
# for security reasons I haven't looked deeply into yet.
USER node