#!/bin/bash
set -e

psql -v ON_ERROR_STOP=0 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    SELECT 'CREATE DATABASE nsi_account' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'nsi_account')\gexec
    SELECT 'CREATE DATABASE nsi_config' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'nsi_config')\gexec
    SELECT 'CREATE DATABASE nsi_policy_hub' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'nsi_policy_hub')\gexec
    SELECT 'CREATE DATABASE nsi_business' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'nsi_business')\gexec
EOSQL
