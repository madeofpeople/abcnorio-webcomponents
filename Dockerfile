FROM node:lts-trixie AS astrocomponents
ARG SHARED_GID=2000
ARG SHARED_GROUP=abcnorio
WORKDIR /app

RUN apt-get update \
	&& apt-get install -y --no-install-recommends \
	&& existing_group="$(getent group ${SHARED_GID} | cut -d: -f1 || true)" \
	&& if [ -n "${existing_group}" ] && [ "${existing_group}" != "${SHARED_GROUP}" ]; then groupmod -n ${SHARED_GROUP} "${existing_group}"; elif ! getent group ${SHARED_GROUP} >/dev/null; then groupadd -g ${SHARED_GID} ${SHARED_GROUP}; fi \
	&& usermod -a -G ${SHARED_GID} node \
	&& rm -rf /var/lib/apt/lists/*

ENV HOST=0.0.0.0
ENV PORT=3033
EXPOSE 3033
CMD ["bash", "-c", "umask 0002 && cd /app && \
for path in \"${DEV_BUILD_PATH:-}\" \"${STAGING_BUILD_PATH:-}\" \"${PRODUCTION_BUILD_PATH:-}\" ./build-archives; do \
	[ -n \"$path\" ] || continue; \
	mkdir -p \"$path\"; \
	chmod 2775 \"$path\" 2>/dev/null || true; \
done && \
npx astro telemetry disable && \
npm install && \
npm run docker-dev"]
