FROM nginx

RUN mkdir -p /usr/share/nginx/html/images
VOLUME /usr/share/nginx/html/images
COPY html /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
