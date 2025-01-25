#!/bin/bash


# Create salt
SALT=$(openssl rand -hex 16)
# Hash the GUACAMOLE_PASSWORD
PASSWORD_HASH=$(echo -n "$GUACAMOLE_PASSWORD" | sha256sum | cut -d' ' -f1)

echo "Initalizing with..."
echo $GUACAMOLE_USERNAME
echo $GUACAMOLE_PASSWORD

mysql -u root -p$MYSQL_ROOT_PASSWORD $MYSQL_DATABASE --execute \
"

CREATE TABLE \`guacamole_connection_group\` (

  \`connection_group_id\`   int(11)      NOT NULL AUTO_INCREMENT,
  \`parent_id\`             int(11),
  \`connection_group_name\` varchar(128) NOT NULL,
  \`type\`                  enum('ORGANIZATIONAL',
                               'BALANCING') NOT NULL DEFAULT 'ORGANIZATIONAL',

  -- Concurrency limits
  \`max_connections\`          int(11),
  \`max_connections_per_user\` int(11),
  \`enable_session_affinity\`  boolean NOT NULL DEFAULT 0,

  PRIMARY KEY (\`connection_group_id\`),
  UNIQUE KEY \`connection_group_name_parent\` (\`connection_group_name\`, \`parent_id\`),

  CONSTRAINT \`guacamole_connection_group_ibfk_1\`
    FOREIGN KEY (\`parent_id\`)
    REFERENCES \`guacamole_connection_group\` (\`connection_group_id\`) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE \`guacamole_connection\` (

  \`connection_id\`       int(11)      NOT NULL AUTO_INCREMENT,
  \`connection_name\`     varchar(128) NOT NULL,
  \`parent_id\`           int(11),
  \`protocol\`            varchar(32)  NOT NULL,
  
  -- Guacamole proxy (guacd) overrides
  \`proxy_port\`              integer,
  \`proxy_hostname\`          varchar(512),
  \`proxy_encryption_method\` enum('NONE', 'SSL'),

  -- Concurrency limits
  \`max_connections\`          int(11),
  \`max_connections_per_user\` int(11),
  
  -- Load-balancing behavior
  \`connection_weight\`        int(11),
  \`failover_only\`            boolean NOT NULL DEFAULT 0,

  PRIMARY KEY (\`connection_id\`),
  UNIQUE KEY \`connection_name_parent\` (\`connection_name\`, \`parent_id\`),

  CONSTRAINT \`guacamole_connection_ibfk_1\`
    FOREIGN KEY (\`parent_id\`)
    REFERENCES \`guacamole_connection_group\` (\`connection_group_id\`) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE \`guacamole_entity\` (

  \`entity_id\`     int(11)            NOT NULL AUTO_INCREMENT,
  \`name\`          varchar(128)       NOT NULL,
  \`type\`          enum('USER',
                       'USER_GROUP') NOT NULL,

  PRIMARY KEY (\`entity_id\`),
  UNIQUE KEY \`guacamole_entity_name_scope\` (\`type\`, \`name\`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE \`guacamole_user\` (

  \`user_id\`       int(11)      NOT NULL AUTO_INCREMENT,
  \`entity_id\`     int(11)      NOT NULL,

  -- Optionally-salted password
  \`password_hash\` binary(32)   NOT NULL,
  \`password_salt\` binary(32),
  \`password_date\` datetime     NOT NULL,

  -- Account disabled/expired status
  \`disabled\`      boolean      NOT NULL DEFAULT 0,
  \`expired\`       boolean      NOT NULL DEFAULT 0,

  -- Time-based access restriction
  \`access_window_start\`    TIME,
  \`access_window_end\`      TIME,

  -- Date-based access restriction
  \`valid_from\`  DATE,
  \`valid_until\` DATE,

  -- Timezone used for all date/time comparisons and interpretation
  \`timezone\` VARCHAR(64),

  -- Profile information
  \`full_name\`           VARCHAR(256),
  \`email_address\`       VARCHAR(256),
  \`organization\`        VARCHAR(256),
  \`organizational_role\` VARCHAR(256),

  PRIMARY KEY (\`user_id\`),

  UNIQUE KEY \`guacamole_user_single_entity\` (\`entity_id\`),

  CONSTRAINT \`guacamole_user_entity\`
    FOREIGN KEY (\`entity_id\`)
    REFERENCES \`guacamole_entity\` (\`entity_id\`)
    ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE \`guacamole_user_group\` (

  \`user_group_id\` int(11)      NOT NULL AUTO_INCREMENT,
  \`entity_id\`     int(11)      NOT NULL,

  -- Group disabled status
  \`disabled\`      boolean      NOT NULL DEFAULT 0,

  PRIMARY KEY (\`user_group_id\`),

  UNIQUE KEY \`guacamole_user_group_single_entity\` (\`entity_id\`),

  CONSTRAINT \`guacamole_user_group_entity\`
    FOREIGN KEY (\`entity_id\`)
    REFERENCES \`guacamole_entity\` (\`entity_id\`)
    ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE \`guacamole_user_group_member\` (

  \`user_group_id\`    int(11)     NOT NULL,
  \`member_entity_id\` int(11)     NOT NULL,

  PRIMARY KEY (\`user_group_id\`, \`member_entity_id\`),

  -- Parent must be a user group
  CONSTRAINT \`guacamole_user_group_member_parent_id\`
    FOREIGN KEY (\`user_group_id\`)
    REFERENCES \`guacamole_user_group\` (\`user_group_id\`) ON DELETE CASCADE,

  -- Member may be either a user or a user group (any entity)
  CONSTRAINT \`guacamole_user_group_member_entity_id\`
    FOREIGN KEY (\`member_entity_id\`)
    REFERENCES \`guacamole_entity\` (\`entity_id\`) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE guacamole_sharing_profile (

  \`sharing_profile_id\`    int(11)      NOT NULL AUTO_INCREMENT,
  \`sharing_profile_name\`  varchar(128) NOT NULL,
  \`primary_connection_id\` int(11)      NOT NULL,

  PRIMARY KEY (\`sharing_profile_id\`),
  UNIQUE KEY \`sharing_profile_name_primary\` (sharing_profile_name, primary_connection_id),

  CONSTRAINT \`guacamole_sharing_profile_ibfk_1\`
    FOREIGN KEY (\`primary_connection_id\`)
    REFERENCES \`guacamole_connection\` (\`connection_id\`)
    ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE \`guacamole_connection_parameter\` (

  \`connection_id\`   int(11)       NOT NULL,
  \`parameter_name\`  varchar(128)  NOT NULL,
  \`parameter_value\` varchar(4096) NOT NULL,

  PRIMARY KEY (\`connection_id\`,\`parameter_name\`),

  CONSTRAINT \`guacamole_connection_parameter_ibfk_1\`
    FOREIGN KEY (\`connection_id\`)
    REFERENCES \`guacamole_connection\` (\`connection_id\`) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE guacamole_sharing_profile_parameter (

  \`sharing_profile_id\` integer       NOT NULL,
  \`parameter_name\`     varchar(128)  NOT NULL,
  \`parameter_value\`    varchar(4096) NOT NULL,

  PRIMARY KEY (\`sharing_profile_id\`, \`parameter_name\`),

  CONSTRAINT \`guacamole_sharing_profile_parameter_ibfk_1\`
    FOREIGN KEY (\`sharing_profile_id\`)
    REFERENCES \`guacamole_sharing_profile\` (\`sharing_profile_id\`) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE guacamole_user_attribute (

  \`user_id\`         int(11)       NOT NULL,
  \`attribute_name\`  varchar(128)  NOT NULL,
  \`attribute_value\` varchar(4096) NOT NULL,

  PRIMARY KEY (user_id, attribute_name),
  KEY \`user_id\` (\`user_id\`),

  CONSTRAINT guacamole_user_attribute_ibfk_1
    FOREIGN KEY (user_id)
    REFERENCES guacamole_user (user_id) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE guacamole_user_group_attribute (

  \`user_group_id\`   int(11)       NOT NULL,
  \`attribute_name\`  varchar(128)  NOT NULL,
  \`attribute_value\` varchar(4096) NOT NULL,

  PRIMARY KEY (\`user_group_id\`, \`attribute_name\`),
  KEY \`user_group_id\` (\`user_group_id\`),

  CONSTRAINT \`guacamole_user_group_attribute_ibfk_1\`
    FOREIGN KEY (\`user_group_id\`)
    REFERENCES \`guacamole_user_group\` (\`user_group_id\`) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE guacamole_connection_attribute (

  \`connection_id\`   int(11)       NOT NULL,
  \`attribute_name\`  varchar(128)  NOT NULL,
  \`attribute_value\` varchar(4096) NOT NULL,

  PRIMARY KEY (connection_id, attribute_name),
  KEY \`connection_id\` (\`connection_id\`),

  CONSTRAINT guacamole_connection_attribute_ibfk_1
    FOREIGN KEY (connection_id)
    REFERENCES guacamole_connection (connection_id) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE guacamole_connection_group_attribute (

  \`connection_group_id\` int(11)       NOT NULL,
  \`attribute_name\`      varchar(128)  NOT NULL,
  \`attribute_value\`     varchar(4096) NOT NULL,

  PRIMARY KEY (connection_group_id, attribute_name),
  KEY \`connection_group_id\` (\`connection_group_id\`),

  CONSTRAINT guacamole_connection_group_attribute_ibfk_1
    FOREIGN KEY (connection_group_id)
    REFERENCES guacamole_connection_group (connection_group_id) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE guacamole_sharing_profile_attribute (

  \`sharing_profile_id\` int(11)       NOT NULL,
  \`attribute_name\`     varchar(128)  NOT NULL,
  \`attribute_value\`    varchar(4096) NOT NULL,

  PRIMARY KEY (sharing_profile_id, attribute_name),
  KEY \`sharing_profile_id\` (\`sharing_profile_id\`),

  CONSTRAINT guacamole_sharing_profile_attribute_ibfk_1
    FOREIGN KEY (sharing_profile_id)
    REFERENCES guacamole_sharing_profile (sharing_profile_id) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE \`guacamole_connection_permission\` (

  \`entity_id\`     int(11) NOT NULL,
  \`connection_id\` int(11) NOT NULL,
  \`permission\`    enum('READ',
                       'UPDATE',
                       'DELETE',
                       'ADMINISTER') NOT NULL,

  PRIMARY KEY (\`entity_id\`,\`connection_id\`,\`permission\`),

  CONSTRAINT \`guacamole_connection_permission_ibfk_1\`
    FOREIGN KEY (\`connection_id\`)
    REFERENCES \`guacamole_connection\` (\`connection_id\`) ON DELETE CASCADE,

  CONSTRAINT \`guacamole_connection_permission_entity\`
    FOREIGN KEY (\`entity_id\`)
    REFERENCES \`guacamole_entity\` (\`entity_id\`) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE \`guacamole_connection_group_permission\` (

  \`entity_id\`           int(11) NOT NULL,
  \`connection_group_id\` int(11) NOT NULL,
  \`permission\`          enum('READ',
                             'UPDATE',
                             'DELETE',
                             'ADMINISTER') NOT NULL,

  PRIMARY KEY (\`entity_id\`,\`connection_group_id\`,\`permission\`),

  CONSTRAINT \`guacamole_connection_group_permission_ibfk_1\`
    FOREIGN KEY (\`connection_group_id\`)
    REFERENCES \`guacamole_connection_group\` (\`connection_group_id\`) ON DELETE CASCADE,

  CONSTRAINT \`guacamole_connection_group_permission_entity\`
    FOREIGN KEY (\`entity_id\`)
    REFERENCES \`guacamole_entity\` (\`entity_id\`) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE guacamole_sharing_profile_permission (

  \`entity_id\`          integer NOT NULL,
  \`sharing_profile_id\` integer NOT NULL,
  \`permission\`         enum('READ',
                            'UPDATE',
                            'DELETE',
                            'ADMINISTER') NOT NULL,

  PRIMARY KEY (\`entity_id\`, \`sharing_profile_id\`, \`permission\`),

  CONSTRAINT \`guacamole_sharing_profile_permission_ibfk_1\`
    FOREIGN KEY (\`sharing_profile_id\`)
    REFERENCES \`guacamole_sharing_profile\` (\`sharing_profile_id\`) ON DELETE CASCADE,

  CONSTRAINT \`guacamole_sharing_profile_permission_entity\`
    FOREIGN KEY (\`entity_id\`)
    REFERENCES \`guacamole_entity\` (\`entity_id\`) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE \`guacamole_system_permission\` (

  \`entity_id\`  int(11) NOT NULL,
  \`permission\` enum('CREATE_CONNECTION',
                    'CREATE_CONNECTION_GROUP',
                    'CREATE_SHARING_PROFILE',
                    'CREATE_USER',
                    'CREATE_USER_GROUP',
                    'ADMINISTER') NOT NULL,

  PRIMARY KEY (\`entity_id\`,\`permission\`),

  CONSTRAINT \`guacamole_system_permission_entity\`
    FOREIGN KEY (\`entity_id\`)
    REFERENCES \`guacamole_entity\` (\`entity_id\`) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE \`guacamole_user_permission\` (

  \`entity_id\`        int(11) NOT NULL,
  \`affected_user_id\` int(11) NOT NULL,
  \`permission\`       enum('READ',
                          'UPDATE',
                          'DELETE',
                          'ADMINISTER') NOT NULL,

  PRIMARY KEY (\`entity_id\`,\`affected_user_id\`,\`permission\`),

  CONSTRAINT \`guacamole_user_permission_ibfk_1\`
    FOREIGN KEY (\`affected_user_id\`)
    REFERENCES \`guacamole_user\` (\`user_id\`) ON DELETE CASCADE,

  CONSTRAINT \`guacamole_user_permission_entity\`
    FOREIGN KEY (\`entity_id\`)
    REFERENCES \`guacamole_entity\` (\`entity_id\`) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE \`guacamole_user_group_permission\` (

  \`entity_id\`              int(11) NOT NULL,
  \`affected_user_group_id\` int(11) NOT NULL,
  \`permission\`             enum('READ',
                                'UPDATE',
                                'DELETE',
                                'ADMINISTER') NOT NULL,

  PRIMARY KEY (\`entity_id\`, \`affected_user_group_id\`, \`permission\`),

  CONSTRAINT \`guacamole_user_group_permission_affected_user_group\`
    FOREIGN KEY (\`affected_user_group_id\`)
    REFERENCES \`guacamole_user_group\` (\`user_group_id\`) ON DELETE CASCADE,

  CONSTRAINT \`guacamole_user_group_permission_entity\`
    FOREIGN KEY (\`entity_id\`)
    REFERENCES \`guacamole_entity\` (\`entity_id\`) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE \`guacamole_connection_history\` (

  \`history_id\`           int(11)      NOT NULL AUTO_INCREMENT,
  \`user_id\`              int(11)      DEFAULT NULL,
  \`username\`             varchar(128) NOT NULL,
  \`remote_host\`          varchar(256) DEFAULT NULL,
  \`connection_id\`        int(11)      DEFAULT NULL,
  \`connection_name\`      varchar(128) NOT NULL,
  \`sharing_profile_id\`   int(11)      DEFAULT NULL,
  \`sharing_profile_name\` varchar(128) DEFAULT NULL,
  \`start_date\`           datetime     NOT NULL,
  \`end_date\`             datetime     DEFAULT NULL,

  PRIMARY KEY (\`history_id\`),
  KEY \`user_id\` (\`user_id\`),
  KEY \`connection_id\` (\`connection_id\`),
  KEY \`sharing_profile_id\` (\`sharing_profile_id\`),
  KEY \`start_date\` (\`start_date\`),
  KEY \`end_date\` (\`end_date\`),
  KEY \`connection_start_date\` (\`connection_id\`, \`start_date\`),

  CONSTRAINT \`guacamole_connection_history_ibfk_1\`
    FOREIGN KEY (\`user_id\`)
    REFERENCES \`guacamole_user\` (\`user_id\`) ON DELETE SET NULL,

  CONSTRAINT \`guacamole_connection_history_ibfk_2\`
    FOREIGN KEY (\`connection_id\`)
    REFERENCES \`guacamole_connection\` (\`connection_id\`) ON DELETE SET NULL,

  CONSTRAINT \`guacamole_connection_history_ibfk_3\`
    FOREIGN KEY (\`sharing_profile_id\`)
    REFERENCES \`guacamole_sharing_profile\` (\`sharing_profile_id\`) ON DELETE SET NULL

) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE guacamole_user_history (

  \`history_id\`           int(11)      NOT NULL AUTO_INCREMENT,
  \`user_id\`              int(11)      DEFAULT NULL,
  \`username\`             varchar(128) NOT NULL,
  \`remote_host\`          varchar(256) DEFAULT NULL,
  \`start_date\`           datetime     NOT NULL,
  \`end_date\`             datetime     DEFAULT NULL,

  PRIMARY KEY (history_id),
  KEY \`user_id\` (\`user_id\`),
  KEY \`start_date\` (\`start_date\`),
  KEY \`end_date\` (\`end_date\`),
  KEY \`user_start_date\` (\`user_id\`, \`start_date\`),

  CONSTRAINT guacamole_user_history_ibfk_1
    FOREIGN KEY (user_id)
    REFERENCES guacamole_user (user_id) ON DELETE SET NULL

) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE guacamole_user_password_history (

  \`password_history_id\` int(11) NOT NULL AUTO_INCREMENT,
  \`user_id\`             int(11) NOT NULL,

  -- Salted password
  \`password_hash\` binary(32) NOT NULL,
  \`password_salt\` binary(32),
  \`password_date\` datetime   NOT NULL,

  PRIMARY KEY (\`password_history_id\`),
  KEY \`user_id\` (\`user_id\`),

  CONSTRAINT \`guacamole_user_password_history_ibfk_1\`
    FOREIGN KEY (\`user_id\`)
    REFERENCES \`guacamole_user\` (\`user_id\`) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Create default user with placeholders
INSERT INTO guacamole_entity (name, type) VALUES ('${GUACAMOLE_USERNAME}', 'USER');

INSERT INTO guacamole_user (entity_id, password_hash, password_date)
SELECT
    entity_id,
    x'${PASSWORD_HASH}', -- Replace with dynamically generated hash
    NOW()
FROM guacamole_entity WHERE name = '${GUACAMOLE_USERNAME}';

-- Grant this user all system permissions
INSERT INTO guacamole_system_permission (entity_id, permission)
SELECT entity_id, permission
FROM (
    SELECT '${GUACAMOLE_USERNAME}' AS username, 'CREATE_CONNECTION'       AS permission
    UNION SELECT '${GUACAMOLE_USERNAME}' AS username, 'CREATE_CONNECTION_GROUP' AS permission
    UNION SELECT '${GUACAMOLE_USERNAME}' AS username, 'CREATE_SHARING_PROFILE'  AS permission
    UNION SELECT '${GUACAMOLE_USERNAME}' AS username, 'CREATE_USER'             AS permission
    UNION SELECT '${GUACAMOLE_USERNAME}' AS username, 'CREATE_USER_GROUP'       AS permission
    UNION SELECT '${GUACAMOLE_USERNAME}' AS username, 'ADMINISTER'              AS permission
) permissions
JOIN guacamole_entity ON permissions.username = guacamole_entity.name AND guacamole_entity.type = 'USER';

-- Grant admin permission to read/update/administer self
INSERT INTO guacamole_user_permission (entity_id, affected_user_id, permission)
SELECT guacamole_entity.entity_id, guacamole_user.user_id, permission
FROM (
    SELECT '${GUACAMOLE_USERNAME}' AS username, '${GUACAMOLE_USERNAME}' AS affected_username, 'READ'       AS permission
    UNION SELECT '${GUACAMOLE_USERNAME}' AS username, '${GUACAMOLE_USERNAME}' AS affected_username, 'UPDATE'     AS permission
    UNION SELECT '${GUACAMOLE_USERNAME}' AS username, '${GUACAMOLE_USERNAME}' AS affected_username, 'ADMINISTER' AS permission
) permissions
JOIN guacamole_entity          ON permissions.username = guacamole_entity.name AND guacamole_entity.type = 'USER'
JOIN guacamole_entity affected ON permissions.affected_username = affected.name AND guacamole_entity.type = 'USER'
JOIN guacamole_user            ON guacamole_user.entity_id = affected.entity_id;

SELECT 'Guacamole DB initialization complete.' AS Message;
"