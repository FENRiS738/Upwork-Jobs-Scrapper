FROM node

WORKDIR /app

COPY package*.json . 


RUN npm install 
RUN apt-get update && apt-get install -y wget curl unzip \
    && wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb \
    && dpkg -i google-chrome-stable_current_amd64.deb || apt-get -fy install

COPY . .

CMD [ "npm", "start" ]
