import axios from 'axios';

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
  private username: string;
  private password: string;
  private dataSource: string;

  constructor() {
    this.baseUrl = process.env.GUACAMOLE_URL || 'http://guacamole:8080/guacamole';
    this.username = process.env.GUACAMOLE_USERNAME || 'guacadmin';
    this.password = process.env.GUACAMOLE_PASSWORD || 'guacadmin';
    this.dataSource = process.env.GUACAMOLE_DATASOURCE || 'mysql';
  }

  private encodeClientIdentifier(connectionId: string): string {
    // Create the connection string with NULL characters between components
    // Format: connectionId + NULL + "c" + NULL + dataSource
    const components = [connectionId, 'c', this.dataSource];
    const str = components.join('\0');
    
    // Convert to Base64
    return Buffer.from(str).toString('base64');
  }

  private async getAuthToken(): Promise<string> {
    try {
      // Create URLSearchParams object with the credentials
      const params = new URLSearchParams();
      params.append('username', this.username);
      params.append('password', this.password);

      // Make the request exactly like the working curl command
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

  private async createRDPConnection(token: string, ip: string, username: string, password: string): Promise<string> {
    try {
      // Define the RDP connection configuration
      const connection: GuacamoleConnection = {
        name: `RDP-${ip}-${Date.now()}`,
        parentIdentifier: "ROOT",
        protocol: "rdp",
        parameters: {
          'hostname': ip,
          'port': '3389',
          'username': username,
          'password': password,
          'security': '',
          'ignore-cert': 'true',
          'disable-auth': 'true',
          'width': '1280',
          'height': '800',
          'dpi': '96'
        },
        attributes: {
          'max-connections': '1',
          'max-connections-per-user': '1'
        }
      };

      // Create the connection using token
      const response = await axios.post(
        `${this.baseUrl}/api/session/data/${this.dataSource}/connections`, 
        connection,
        {
          headers: {
            'Content-Type': 'application/json',
            'Guacamole-Token': token
          }
        }
      );

      if (!response.data?.identifier) {
        console.error('Connection response:', response.data);
        throw new Error('No connection identifier in response');
      }

      return response.data.identifier;
    } catch (error) {
      console.error('Connection creation error:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
      }
      throw error;
    }
  }

  public async createSession(ip: string = '18.119.106.179', username: string = 'user', password: string = 'password'): Promise<{token: string, connectionId: string, clientId: string}> {
    try {
      // Get auth token
      const token = await this.getAuthToken();
      console.log('Got auth token:', token);

      // Create RDP connection
      const connectionId = await this.createRDPConnection(token, ip, username, password);
      console.log('Created connection:', connectionId);

      // Generate the client identifier
      const clientId = this.encodeClientIdentifier(connectionId);
      console.log('Generated client ID:', clientId);

      return {
        token,
        connectionId,
        clientId
      };
    } catch (error) {
      console.error('Error creating Guacamole session:', error);
      throw error;
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
      await axios.delete(
        `${this.baseUrl}/api/tokens/${token}`,
        {
          headers: {
            'Guacamole-Token': token
          }
        }
      );
    } catch (error) {
      console.error('Error cleaning up Guacamole session:', error);
      throw error;
    }
  }
}

export default GuacamoleService;