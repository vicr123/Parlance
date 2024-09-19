#!/bin/bash

export DEBIAN_FRONTEND=noninteractive
export LANGUAGE="en_US.UTF-8"
export LC_ALL="en_US.UTF-8"

curl -fsSL https://deb.nodesource.com/setup_20.x | bash - &&\
apt-get update && apt-get install -y --no-install-recommends git cmake postgresql postgresql-contrib libqt6core6 qt6-base-dev build-essential nodejs libqt6sql6-psql dbus-daemon libssh2-1-dev openssh-client

echo "en_US.UTF-8 UTF-8" > /etc/locale.gen
locale-gen

service postgresql start
su postgres -c "createuser -s root"
su postgres -c "createuser -s accountsservice"
su postgres -c "createuser -s parlance"
su postgres -c "createdb root"
su postgres -c "createdb accounts"
su postgres -c "createdb parlancedb"

psql -c "ALTER USER accountsservice WITH PASSWORD 'secret'"
psql -c "ALTER USER parlance WITH PASSWORD 'secret'"

cd ..
git clone --recursive https://github.com/vicr123/vicr123-accounts
pushd vicr123-accounts
mkdir build
cd build
cmake ..
cmake --build .
cmake --install .
popd

git clone --recursive https://github.com/libgit2/libgit2
pushd libgit2
git checkout v1.8.1
mkdir build
cd build
cmake .. -DUSE_SSH=ON -DBUILD_TESTS=OFF -DBUILD_CLI=OFF
cmake --build .
cmake --install .
popd


mkdir /var/vicr123-accounts
echo /usr/local/lib > /etc/ld.so.conf.d/libgit2.conf
ldconfig

cat << \EOF >> ~/.bash_profile
# Add .NET Core SDK tools
export PATH="$PATH:/root/.dotnet/tools"
EOF
dotnet tool install --global dotnet-ef
