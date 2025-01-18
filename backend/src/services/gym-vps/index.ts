import dots from "dots-wrapper";
import crypto, { randomInt } from "crypto";
import DatabaseService, { GymVPSDocument } from "../db/index.ts";
import { NodeSSH } from "node-ssh";

export class GymVPSService {
  private instances: GymVPSDocument[] = [];
  private client;
  constructor() {
    if (!process.env.DIGITALOCEAN_API_KEY)
      throw Error(
        "Cannot initialize Gym VPS Service. Digital Ocean API key required."
      );
    this.client = dots.createApiClient({
      token: process.env.DIGITALOCEAN_API_KEY,
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
    console.log("Creating new open instance for the future.");
    await this.createInstance();

    return {
      id: vpsInfo.id,
      ip: vpsInfo.ip,
      login: vpsInfo.login,
      name: vpsInfo.name,
      droplet_id: vpsInfo.droplet_id,
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
        size: "s-1vcpu-2gb",
        tags: ["gym"],
        user_data: GymVPSService.genUserInit(
          login.username,
          login.password,
          login.password
        ),
      });

      // get droplet creation information that should include the IP

      const wait = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));

      while (true) {
        console.log("Droplet IP Address not found. Retrying request...");
        // wait 10 seconds
        await wait(10000);
        const res = await this.client.droplet.getDroplet({
          droplet_id: droplet.id,
        });
        if (res.data.droplet.networks.v4?.[0]?.ip_address) {
          droplet.networks.v4 = res.data.droplet.networks.v4;
          break;
        }
      }

      const vps: GymVPSDocument = {
        id: GymVPSService.genId,
        name,
        ip: droplet.networks.v4[0].ip_address,
        droplet_id: droplet.id,
        login,
        status,
        address,
        vnc: { password: login.password },
      };

      console.log("Created new VPS.");
      console.log(vps);

      // todo: if we can't figure out the script to enable the vnc server, we can just login in as root using ssh.
      // console.log("Setting VNC Password.");

      // // ssh into the droplet and reset the vnc password
      // const ssh = new NodeSSH();
      // while (true) {
      //   try {
      //     await wait(5000);
      //     await ssh.connect({
      //       host: vps.ip,
      //       username: vps.login.username,
      //       password: vps.login.password,
      //     });
      //     break;
      //   } catch (e) {
      //     // loop until ssh connection establishes
      //     console.log("SSH error:", e);
      //   }
      // }
      // const sshRes = await ssh
      //   .execCommand(
      //     `x11vnc -storepasswd ${vps.login.password} /home/user/.vnc/passwd`
      //   )
      //   .catch((e) => console.log(e));
      // console.log("ssh result:", sshRes);
      // const sshRes2 = await ssh
      //   .execCommand(
      //     `x11vnc -storepasswd ${vps.login.password} /home/tester/.vnc/passwd`
      //   )
      //   .catch((e) => console.log(e));
      // console.log("ssh result:", sshRes2);

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

  private static genUserInit = (
    username: string,
    password: string,
    vnc_password: string
  ): string => {
    // todo: figure out the correct script to enable the vnc server
    return `#!/bin/bash

# Enable SSH password authentication and root login
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/g' /etc/ssh/sshd_config
sed -i 's/#PermitRootLogin yes/PermitRootLogin yes/g' /etc/ssh/sshd_config

sudo useradd -m -s /bin/bash ${username}
echo "${username}:${password}" | chpasswd

sudo -u ${username} mkdir /home/user/.vnc
x11vnc -storepasswd ${vnc_password} /home/${username}/.vnc/passwd

systemctl enable x11vnc
systemctl enable sddm
systemctl restart sddm
systemctl restart x11vnc

cp -f /etc/skel/.bashrc /root/.bashrc

# Restart SSH service
systemctl restart sshd`;

    //     return `#cloud-config

    // # Create new user
    // users:
    //   - name: ${username}
    //     passwd: ${password}
    //     shell: /bin/bash
    //     sudo: ALL=(ALL) NOPASSWD:ALL
    //     groups: sudo

    // ssh_pwauth: true`;
  };

  private static get genId() {
    return "10000-4000-8000".replace(/[018]/g, (c) => {
      const random = crypto.randomBytes(1)[0];
      return (parseInt(c) ^ (random & (15 >> (parseInt(c) / 4)))).toString(16);
    });
  }
}
