import dots from "dots-wrapper";
import sshpk from "sshpk";
import crypto, { generateKeyPairSync, randomInt } from "crypto";
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
      ssh_keypair: vpsInfo.ssh_keypair,
      vnc: vpsInfo.vnc,
    };
  }

  // destroys an instance
  public async destroyInstance(id: number) {
    await this.client.droplet.destroyDropletAndAllAssociatedResources({
      droplet_id: id,
      acknowledge: false,
    });
    //todo: update to delete from the database
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
        username: "user", // NOTE: needs to be user because the droplets automatically configures it on startup
        password: `viralmind-${randomInt(1000)}`,
      };
      const name = `gym-${GymVPSService.genId}`;

      // setup ssh keys

      const { fingerprint, private_key, public_key } = await this.createSSHKey(
        name
      );

      // create droplet
      const {
        data: { droplet },
      } = await this.client.droplet.createDroplet({
        name,
        ssh_keys: [fingerprint],
        region: "sfo2",
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
        console.log("Droplet IP Address not found. Retrying...");
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
        ssh_keypair: { public: public_key, private: private_key },
      };

      console.log("Created new VPS.");
      console.log(vps);

      // ssh into the droplet and reset the vnc password
      const ssh = new NodeSSH();
      while (true) {
        try {
          await wait(5000);
          await ssh.connect({
            host: vps.ip,
            username: "root",
            privateKey: private_key,
          });
          break;
        } catch (e) {
          // loop until ssh connection establishes
          if ((e as Error).message.includes("ECONNREFUSED")) {
            console.log(
              "Server still initializing. Retrying SSH connection..."
            );
          } else console.log("SSH error:", e);
        }
      }

      console.log("Initializing VNC server with custom password...");
      await new Promise((resolve, reject) => {
        ssh
          .requestShell()
          .then((shellStream) => {
            shellStream.on("data", async (data: any) => {
              let stringData = data.toString().trim();
              if (stringData.includes(`root@${name}`)) {
                await ssh.execCommand(
                  `x11vnc -storepasswd "${vps.login.password}" /home/user/.vnc/passwd`
                );
                await ssh.execCommand(
                  `echo "${vps.login.username}:${vps.login.password}" | chpasswd`
                );
                await ssh.execCommand(`adduser ${vps.login.username} sudo`);
                await ssh.execCommand(
                  `usermod -a -G sudo ${vps.login.username}`
                );
                resolve(true);
              }
            });

            shellStream.stderr.on("data", (data: any) => {
              console.log("Shell Stream Command Error: ", data.toString());
            });

            shellStream.on("close", () => {
              resolve(false);
            });

            shellStream.on("error", (err: Error) => {
              console.log("Shell Stream Error: ", err);
              reject(err);
            });
          })
          .catch(reject);
      });

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

  public async createSSHKey(name: string) {
    // Generate the key pair
    const { publicKey: public_key, privateKey: private_key } =
      generateKeyPairSync("rsa", {
        modulusLength: 2048, // Length of the key in bits
        publicKeyEncoding: {
          type: "pkcs1", // Recommended format for public key
          format: "pem",
        },
        privateKeyEncoding: {
          type: "pkcs1", // Recommended format for private key
          format: "pem",
        },
      });
    const res = await this.client.sshKey.createSshKey({
      name,
      public_key: sshpk.parseKey(public_key).toString("ssh"),
    });
    return { ...res.data.ssh_key, private_key };
  }

  private static genUserInit = (
    username: string,
    password: string,
    vnc_password: string
  ): string => {
    return ``;
  };

  private static get genId() {
    return "10000-4000-8000".replace(/[018]/g, (c) => {
      const random = crypto.randomBytes(1)[0];
      return (parseInt(c) ^ (random & (15 >> (parseInt(c) / 4)))).toString(16);
    });
  }
}
