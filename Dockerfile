FROM ubuntu:latest
MAINTAINER Bobby Dilley "bobby_2105@hotmail.com"
RUN apt-get update -y
RUN apt-get install -y python-pip python-dev build-essential sqlite3
COPY ./requirements.txt /app/requirements.txt
WORKDIR /app
RUN pip install -r requirements.txt
COPY . /app
RUN ./utils/CreateTable.sh
ENV FLASK_APP app.py
ENTRYPOINT ["python"]
CMD ["app.py"]
