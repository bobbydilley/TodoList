FROM ubuntu:latest
MAINTAINER Bobby Dilley "bobby_2105@hotmail.com"
RUN apt-get update -y
RUN apt-get install -y python-pip python-dev build-essential
COPY . /app
WORKDIR /app
RUN pip install -r requirements.txt
RUN /utils/CreateTable.sh
ENTRYPOINT ["python"]
CMD ["app.py"]
