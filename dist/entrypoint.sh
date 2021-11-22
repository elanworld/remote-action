#!/bin/bash

info=info.log

show() {
    cat $info
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

echo "##Install ngrok in $1"
if [ $1 == "darwin" ];then
  wget -q -nc https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-darwin-amd64.zip
  unzip ngrok-stable-darwin-amd64.zip
  user=virtual
  echo "##adduser $user"
  export USER=$user
  sh useradd.sh $user $INPUT_USER_PASSWD
else
  wget -q -nc https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-linux-386.zip
  unzip ngrok-stable-linux-386.zip
  echo "##Update user password"
  echo -e "$INPUT_USER_PASSWD\n$INPUT_USER_PASSWD\n" | sudo passwd "$USER"
fi
chmod +x ./ngrok


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
  echo "connect: $(grep -o -E "url=(tcp)://(.+)" < .ngrok.log | sed "s/url=tcp:\/\//ssh $USER@/" | sed "s/:/ -p /")" > $info
  grep -o -E "url=(http|https)://(.+)" < .ngrok.log | sed "s/url=//" >> $info
  echo "========================================" >> $info
  show
else
  echo "$HAS_ERRORS"
  exit 4
fi

