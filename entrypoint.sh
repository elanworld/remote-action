#!/bin/bash


show() {
    echo "=========================================="
    echo "connect: $(grep -o -E "url=(tcp)://(.+)" < .ngrok.log | sed "s/url=tcp:\/\//ssh $USER@/" | sed "s/:/ -p /")"
    grep -o -E "url=(http|https)://(.+)" < .ngrok.log | sed "s/url=//"
    echo "=========================================="
}

if [ "$1" == "show" ]; then
    show
    exit
fi

if [[ -z "$INPUT_NGROK_TOKEN" ]]; then
  echo "Please set 'NGROK_TOKEN'"
  exit 2
fi

if [[ -z "$INPUT_USER_PASSWD" ]]; then
  echo "Please set 'USER_PASS' for user: $USER"
  exit 3
fi

echo "### Install ngrok ###"
wget -q https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-linux-386.zip
unzip ngrok-stable-linux-386.zip
chmod +x ./ngrok

echo "### Update user: $USER password ###"
echo -e "$INPUT_USER_PASSWD\n$INPUT_USER_PASSWD\n" | sudo passwd "$USER"


if [[ "http" == "$INPUT_NGROK_TYPE" ]]; then
  echo "### Start ngrok proxy for 80 port ###"
  rm -f .ngrok.log
  ./ngrok authtoken "$INPUT_NGROK_TOKEN"
  ./ngrok http 80 --log ".ngrok.log" &
else
  echo "### Start ngrok proxy for 22 port ###"
  rm -f .ngrok.log
  ./ngrok authtoken "$INPUT_NGROK_TOKEN"
  ./ngrok tcp 22 --log ".ngrok.log" &
fi

sleep 10
HAS_ERRORS=$(grep "command failed" <.ngrok.log)

if [[ -z "$HAS_ERRORS" ]]; then
  show
else
  echo "$HAS_ERRORS"
  exit 4
fi
