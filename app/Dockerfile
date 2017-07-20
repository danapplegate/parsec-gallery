FROM ubuntu:15.10
RUN apt-get update -y
RUN apt-get install -y python python-dev python-pip libjpeg8-dev zlib1g-dev

RUN mkdir -p /opt/parsec/gallery
WORKDIR /opt/parsec/gallery

COPY requirements.txt ./
RUN pip install -r requirements.txt

VOLUME /usr/share/nginx/html/images
EXPOSE 3031

COPY . ./

ENTRYPOINT ["uwsgi"]
CMD ["--http", ":3031", "--wsgi-file", "app.py", "--mount", "/=app:app"]
