import dots from "dots-wrapper";
import crypto, { randomInt } from "crypto";
import DatabaseService, { GymVPSDocument } from "../db/index.ts";
import { NodeSSH } from "node-ssh";

export class GymVPSService {
  private instances: GymVPSDocument[] = [];
  private client;
  constructor() {
    this.client = dots.createApiClient({
      token: process.env.DIGITALOCEAN_API_KEY!,
    });
  }

  // grabs the first open instance
  // assigns the trainer address to the instance
  // spins up a new instance for the next possible trainer
  public async assignOpenInstance(address: string): Promise<GymVPSDocument> {
    // get the open vps
    let vpsInfo = await DatabaseService.getOpenGymVPS();
    if (!vpsInfo) vpsInfo = await this.createInstance("assigned", address);
    if (!vpsInfo)
      throw Error("Error creating new open VPS instance for address.");

    // assign the vps
    await DatabaseService.assignGymVPS(vpsInfo.id, address);

    // create new open instance
    await this.createInstance();

    return {
      id: vpsInfo.id,
      ip: vpsInfo.ip,
      login: vpsInfo.login,
      name: vpsInfo.name,
      status: "assigned",
      address,
      vnc: vpsInfo.vnc,
    };
  }

  // spins up a new instance
  // saves instance information to the database
  public async createInstance(
    status: "open" | "assigned" = "open",
    address?: string
  ): Promise<GymVPSDocument | null> {
    try {
      // build droplet information
      const login = {
        username: "trainer",
        password: `password-${randomInt(1000)}`,
      };
      const name = `gym-${GymVPSService.genId}`;

      // create droplet
      const {
        data: { droplet },
      } = await this.client.droplet.createDroplet({
        name,
        region: "nyc3",
        image: "ubuntudesktopgno",
        size: "s-1vcpu-1gb",
        tags: ["gym"],
        user_data: GymVPSService.genUserInit(login.username, login.password),
      });

      const vps: GymVPSDocument = {
        id: GymVPSService.genId,
        name,
        ip: droplet.networks.v4[0].ip_address,
        login,
        status,
        address,
        vnc: { password: login.password },
      };

      // ssh into the droplet and reset the vnc password
      const ssh = new NodeSSH();
      await ssh.connect({
        host: vps.ip,
        username: vps.login.username,
        password: vps.login.password,
      });
      const sshRes = await ssh.execCommand(
        `x11vnc -storepasswd ${vps.login.password} $HOME/.vnc/passwd`
      );
      console.log("ssh result:", sshRes);

      // save new instance to the database
      const newVps = await DatabaseService.saveGymVPS(vps);

      if (!newVps) throw Error("Error saving new VPS instance to database.");

      this.instances.push(newVps);
      return newVps;
    } catch (e) {
      console.log("VPS Instance Creation Error");
      console.log(e);
      return null;
    }
  }

  private static genUserInit = (username: string, password: string): string => {
    return `#cloud-config
package_update: true
package_upgrade: true
# Create user and set password
users:
  - name: ${username}
    plain_text_passwd: ${password}
    lock_passwd: false
    shell: /bin/bash
    sudo: ['ALL=(ALL) NOPASSWD:ALL']  # Allow sudo without password
    groups: [sudo, admin]  # Add to both sudo and admin groups

# Enable password authentication globally
ssh_pwauth: true

# Configure SSH to allow password auth
write_files:
  - path: /etc/ssh/sshd_config.d/99-custom.conf
    content: |
      PasswordAuthentication yes
      PermitRootLogin no

# Run final commands
runcmd:
  - systemctl restart sshd
  - echo "${username} ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers.d/90-${username}
  - chmod 0440 /etc/sudoers.d/90-${username}`;
  };

  private static get genId() {
    return "10000-4000-8000".replace(/[018]/g, (c) => {
      const random = crypto.randomBytes(1)[0];
      return (parseInt(c) ^ (random & (15 >> (parseInt(c) / 4)))).toString(16);
    });
  }
}
