#!/bin/bash

export LANGUAGE="en_US.UTF-8"
export LC_ALL="en_US.UTF-8"

# Rider support
apk add libxext libxrender libxtst libxi freetype procps gcompat

apk add git cmake nodejs postgresql postgresql-contrib qt6-qtbase qt6-qtbase-dev qt6-qtbase-postgresql libssh2-dev openssh cmake build-base ninja dbus dbus-libs

#echo "en_US.UTF-8 UTF-8" > /etc/locale.gen
#locale-gen

mkdir -p /run/postgresql
chown postgres:postgres /run/postgresql
su postgres -c "initdb -D /var/lib/postgresql/data"
su postgres -c "pg_ctl start -D /var/lib/postgresql/data"

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
cmake -S . -B build -GNinja
cmake --build build
cmake --install build
popd

git clone --recursive https://github.com/libgit2/libgit2
pushd libgit2
git checkout v1.8.1
cmake -S . -B build -GNinja -DUSE_SSH=ON -DBUILD_TESTS=OFF -DBUILD_CLI=OFF
cmake --build build
cmake --install build
popd

mkdir /var/vicr123-accounts
#ln -s /usr/local/lib/libgit2.so /usr/lib/x86_64-linux-gnu/libgit2.so
