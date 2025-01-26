docker cp guacamole/initdb.sql guac_mysql:/initdb.sql
docker exec -it guac_mysql bash -c 'mysql -u guacamole_user -pguacamole_user_pw guacamole_db < /initdb.sql'