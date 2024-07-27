#!/bin/bash

mkdir -p /run/postgresql
chown postgres:postgres /run/postgresql
su postgres -c "pg_ctl start -D /var/lib/postgresql/data"
vicr123-accounts &
dotnet dev-certs https
