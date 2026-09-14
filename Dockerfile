FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --no-audit --no-fund

COPY . .

ARG VITE_APP_NAME=CampusCareer
ARG VITE_API_BASE_URL=https://dbfvug-elgew.slsblx.com
ARG VITE_BLOCKS_API_URL=https://blocksapi.slsblx.com
ARG VITE_BLOCKS_PROJECT_KEY
ARG VITE_BLOCKS_X_BLOCKS_KEY=D8fb34a0fb75740f0b8a479a550807393
ARG VITE_BLOCKS_OIDC_URL=https://iam.seliseblocks.com
ARG VITE_BLOCKS_OIDC_CLIENT_ID
ARG VITE_BLOCKS_OIDC_SCOPE="openid profile"
ARG VITE_BLOCKS_APP_DOMAIN=https://dbfvug-elgew.slsblx.com
ARG VITE_BLOCKS_REDIRECT_URI=https://dbfvug-elgew.slsblx.com/login/callback
ARG VITE_BLOCKS_HOSTED_LOGIN=false

ENV VITE_APP_NAME=$VITE_APP_NAME \
    VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_BLOCKS_API_URL=$VITE_BLOCKS_API_URL \
    VITE_BLOCKS_PROJECT_KEY=$VITE_BLOCKS_PROJECT_KEY \
    VITE_BLOCKS_X_BLOCKS_KEY=$VITE_BLOCKS_X_BLOCKS_KEY \
    VITE_BLOCKS_OIDC_URL=$VITE_BLOCKS_OIDC_URL \
    VITE_BLOCKS_OIDC_CLIENT_ID=$VITE_BLOCKS_OIDC_CLIENT_ID \
    VITE_BLOCKS_OIDC_SCOPE=$VITE_BLOCKS_OIDC_SCOPE \
    VITE_BLOCKS_APP_DOMAIN=$VITE_BLOCKS_APP_DOMAIN \
    VITE_BLOCKS_REDIRECT_URI=$VITE_BLOCKS_REDIRECT_URI \
    VITE_BLOCKS_HOSTED_LOGIN=$VITE_BLOCKS_HOSTED_LOGIN

RUN npm run build

FROM nginxinc/nginx-unprivileged:1.29-alpine AS runtime

COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
