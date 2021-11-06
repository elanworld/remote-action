sudo dscl . -create /Users/$1
sudo dscl . -create /Users/$1 UserShell /bin/bash
sudo dscl . -create /Users/$1 RealName "Use real name"
sudo dscl . -create /Users/$1 UniqueID "1010"
sudo dscl . -create /Users/$1 PrimaryGroupID 80
sudo dscl . -create /Users/$1 NFSHomeDirectory /Users/luser
sudo dscl . -passwd /Users/$1 $2
sudo mkdir /Users/$1
sudo dscl . -append /Groups/admin GroupMembership $1
sudo su
echo $1  ALL=(ALL:ALL) NOPASSWD: ALL >> /etc/sudoers