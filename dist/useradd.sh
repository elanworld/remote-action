dscl . -create /Users/$1
dscl . -create /Users/$1 UserShell /bin/bash
dscl . -create /Users/$1 RealName "Use real name"
dscl . -create /Users/$1 UniqueID "1010"
dscl . -create /Users/$1 PrimaryGroupID 80
dscl . -create /Users/$1 NFSHomeDirectory /Users/$1
dscl . -passwd /Users/$1 $2
mkdir /Users/$1
dscl . -append /Groups/admin GroupMembership $1
echo "$1  ALL=(ALL:ALL) NOPASSWD: ALL" >> /etc/sudoers