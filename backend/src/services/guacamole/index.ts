import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

interface GuacamoleConnection {
  name: string;
  parentIdentifier: string;
  protocol: string;
  parameters: {
    [key: string]: string;
  };
  attributes: {
    [key: string]: string;
  };
}

export class GuacamoleService {
  private baseUrl: string;
  private adminUsername: string;
  private adminPassword: string;
  private dataSource: string;
  private recordingsPath: string;
  private gymSecret: string;

  constructor() {
    this.baseUrl = process.env.GUACAMOLE_URL || 'http://guacamole:8080/guacamole';
    this.adminUsername = process.env.GUACAMOLE_USERNAME || 'guacadmin';
    this.adminPassword = process.env.GUACAMOLE_PASSWORD || 'guacadmin';
    this.dataSource = process.env.GUACAMOLE_DATASOURCE || 'mysql';
    this.recordingsPath = '/var/lib/guacamole/recordings';
    this.gymSecret = process.env.GYM_SECRET || 'guacadmin';
  }

  private encodeClientIdentifier(connectionId: string): string {
    const components = [connectionId, 'c', this.dataSource];
    const str = components.join('\0');
    return Buffer.from(str).toString('base64');
  }

  private async getAdminToken(): Promise<string> {
    try {
      const params = new URLSearchParams();
      params.append('username', this.adminUsername);
      params.append('password', this.adminPassword);

      const response = await axios.post(`${this.baseUrl}/api/tokens`, params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (!response.data?.authToken) {
        console.error('Auth response:', response.data);
        throw new Error('No auth token in response');
      }

      return response.data.authToken;
    } catch (error) {
      console.error('Auth error:', error);
      throw error;
    }
  }

  private async createUser(adminToken: string, username: string): Promise<void> {
    try {
      try {
        // Check if user exists first
        await axios.get(`${this.baseUrl}/api/session/data/${this.dataSource}/users/${username}`, {
          headers: {
            'Guacamole-Token': adminToken
          }
        });
        console.log(`User ${username} already exists`);

        // Even if user exists, ensure they have the correct permissions
        await axios.patch(
          `${this.baseUrl}/api/session/data/${this.dataSource}/users/${username}/permissions`,
          [
            {
              op: 'add',
              path: '/connectionGroupPermissions/ROOT',
              value: 'READ'
            }
          ],
          {
            headers: {
              'Content-Type': 'application/json',
              'Guacamole-Token': adminToken
            }
          }
        );
        console.log(`Updated permissions for existing user ${username}`);
        return;
      } catch (error: any) {
        // If 404, user doesn't exist, continue with creation
        if (error.response?.status !== 404) {
          throw error;
        }
      }

      // Create the user
      await axios.post(
        `${this.baseUrl}/api/session/data/${this.dataSource}/users`,
        {
          username,
          password: this.gymSecret,
          attributes: {
            disabled: '',
            expired: '',
            'access-window-start': '',
            'access-window-end': '',
            'valid-from': '',
            'valid-until': '',
            timezone: null,
            'guac-full-name': '',
            'guac-organization': '',
            'guac-organizational-role': ''
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Guacamole-Token': adminToken
          }
        }
      );

      console.log(`Created user ${username}`);

      // Grant the user basic permissions to read the ROOT connection group
      await axios.patch(
        `${this.baseUrl}/api/session/data/${this.dataSource}/users/${username}/permissions`,
        [
          {
            op: 'add',
            path: '/connectionGroupPermissions/ROOT',
            value: 'READ'
          }
        ],
        {
          headers: {
            'Content-Type': 'application/json',
            'Guacamole-Token': adminToken
          }
        }
      );

      console.log(`Granted permissions to user ${username}`);
    } catch (error) {
      console.error('Error in createUser:', error);
      throw error;
    }
  }

  private async getUserToken(username: string): Promise<string> {
    try {
      // Get admin token first to create/update user if needed
      const adminToken = await this.getAdminToken();
      await this.createUser(adminToken, username);

      // Now get the user token
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', this.gymSecret);

      const response = await axios.post(`${this.baseUrl}/api/tokens`, params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (!response.data?.authToken) {
        throw new Error('No auth token in response');
      }

      return response.data.authToken;
    } catch (error) {
      console.error('Error getting user token:', error);
      throw error;
    }
  }

  private async createOrGetRDPConnection(
    token: string,
    ip: string,
    username: string,
    password: string
  ): Promise<string> {
    try {
      const connectionName = `RDP-${ip}-${username}`;

      // First try to get existing connection
      try {
        const response = await axios.get(
          `${this.baseUrl}/api/session/data/${this.dataSource}/connections`,
          {
            headers: {
              'Guacamole-Token': token
            }
          }
        );

        // Look for existing connection with same name
        const connections = response.data;
        for (const [id, connection] of Object.entries(connections)) {
          if ((connection as any).name === connectionName) {
            console.log(`Found existing connection: ${connectionName}`);
            return id as string;
          }
        }
      } catch (error) {
        console.log('Error checking existing connections:', error);
        // Continue to create new connection if we can't check existing ones
      }

      // If we get here, create new connection
      console.log(`Creating new connection: ${connectionName}`);

      // Define the RDP connection configuration
      const connection: GuacamoleConnection = {
        name: connectionName,
        parentIdentifier: 'ROOT',
        protocol: 'rdp',
        parameters: {
          hostname: ip,
          port: '3389',
          username: username,
          password: password,
          security: '',
          'ignore-cert': 'true',
          'disable-auth': 'true',
          width: '1280',
          height: '800',
          dpi: '96',
          'recording-path': '/var/lib/guacamole/recordings',
          'recording-name': '${HISTORY_UUID}',
          'recording-include-keys': 'true',
          'create-recording-path': 'true',
          'enable-recording': 'true'
        },
        attributes: {
          'max-connections': '1',
          'max-connections-per-user': '1'
        }
      };

      // Create the connection
      const createResponse = await axios.post(
        `${this.baseUrl}/api/session/data/${this.dataSource}/connections`,
        connection,
        {
          headers: {
            'Content-Type': 'application/json',
            'Guacamole-Token': token
          }
        }
      );

      if (!createResponse.data?.identifier) {
        console.error('Connection response:', createResponse.data);
        throw new Error('No connection identifier in response');
      }

      return createResponse.data.identifier;
    } catch (error) {
      console.error('Connection creation/retrieval error:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
      }
      throw error;
    }
  }

  public async createSession(
    ip: string,
    username: string,
    password: string,
    address: string
  ): Promise<{ token: string; connectionId: string; clientId: string }> {
    try {
      // Get admin token first
      const adminToken = await this.getAdminToken();
      console.log('Got admin token');

      // Create/verify user exists and has permissions
      await this.createUser(adminToken, address);
      console.log('User created/verified');

      // Create or get existing RDP connection using admin token
      const connectionId = await this.createOrGetRDPConnection(adminToken, ip, username, password);
      console.log('Connection created/retrieved:', connectionId);

      // Grant the user access to the connection
      await axios.patch(
        `${this.baseUrl}/api/session/data/${this.dataSource}/users/${address}/permissions`,
        [
          {
            op: 'add',
            path: `/connectionPermissions/${connectionId}`,
            value: 'READ'
          }
        ],
        {
          headers: {
            'Content-Type': 'application/json',
            'Guacamole-Token': adminToken
          }
        }
      );
      console.log('Granted connection permissions to user');

      // Now get user token for the session
      const userToken = await this.getUserToken(address);
      console.log('Got user token');

      // Generate the client identifier
      const clientId = this.encodeClientIdentifier(connectionId);
      console.log('Generated client ID:', clientId);

      return {
        token: userToken,
        connectionId,
        clientId
      };
    } catch (error) {
      console.error('Error creating Guacamole session:', error);
      throw error;
    }
  }

  private async parseRecordingForImage(filePath: string): Promise<Buffer | null> {
    try {
      const content = fs.readFileSync(filePath, 'utf8');

      // Split instructions by semicolon
      const instructions = content.split(';');

      // Find the last img instruction
      for (let i = instructions.length - 1; i >= 0; i--) {
        const instruction = instructions[i].trim();
        if (!instruction) continue;

        // Parse length-prefixed values
        const parts = instruction.split(',');
        if (!parts.length) continue;

        // Check if it's an img instruction
        const [opcode] = parts[0].split('.');
        if (opcode === '3.img') {
          // Get the base64 image data
          const [_, imgData] = parts[parts.length - 1].split('.');
          if (imgData) {
            return Buffer.from(imgData, 'base64');
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Error parsing recording file:', error);
      return null;
    }
  }

  public async getScreenshot(
    token: string,
    clientId: string,
    guacUsername: string
  ): Promise<Buffer> {
    try {
      // Get connection history for the user
      const historyResponse = await axios.get(
        `${this.baseUrl}/api/session/data/${this.dataSource}/history/connections`,
        {
          headers: {
            'Guacamole-Token': token
          }
        }
      );

      // Find the latest history entry for this user
      const latestHistory = historyResponse.data?.[0];
      if (!latestHistory?.uuid) throw new Error('No connection history found');

      if (!latestHistory?.active) throw new Error('No active connection found');

      // Get the recording file path
      const recordingPath = path.join(this.recordingsPath, latestHistory.uuid);

      if (fs.existsSync(recordingPath)) {
        const stats = fs.statSync(recordingPath);
        // Only use recordings that have been modified in the last minute
        if (Date.now() - stats.mtimeMs < 60000) {
          const imageBuffer = await this.parseRecordingForImage(recordingPath);
          if (imageBuffer) {
            return imageBuffer;
          }
        }
      }

      throw new Error('No recent recording found');
    } catch (error) {
      //console.error('Error getting screenshot:', error);
      throw Error('N/a');
      //throw error;
    }
  }

  public async cleanupSession(token: string, connectionId: string) {
    try {
      // Delete the connection
      await axios.delete(
        `${this.baseUrl}/api/session/data/${this.dataSource}/connections/${connectionId}`,
        {
          headers: {
            'Guacamole-Token': token
          }
        }
      );

      // Delete the token
      await axios.delete(`${this.baseUrl}/api/tokens/${token}`, {
        headers: {
          'Guacamole-Token': token
        }
      });
    } catch (error) {
      console.error('Error cleaning up Guacamole session:', error);
      throw error;
    }
  }
}

export default GuacamoleService;
