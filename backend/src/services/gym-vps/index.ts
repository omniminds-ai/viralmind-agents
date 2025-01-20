import { NodeSSH } from "node-ssh";
import { generate } from "random-words";
import DatabaseService from "../db/index.ts";

export class GymVPSService {
  private ip: string;
  private login: {
    privateKey: string;
    username: string;
  };
  constructor(options: { ip: string; username?: string; privateKey: string }) {
    this.ip = options.ip;
    this.login = {
      privateKey: options.privateKey,
      username: options.username || "ubuntu", // default sudo user
    };
  }

  public async initNewTrainer(
    address: string
  ): Promise<{ username: string; password: string }> {
    // ssh in and add the new user
    const ssh = new NodeSSH();
    try {
      await ssh.connect({
        host: this.ip,
        username: this.login.username,
        privateKey: this.login.privateKey,
      });
    } catch (e) {
      console.log("SSH error:", e);
    }

    console.log("Adding new user to VPS for RDP access.");

    // generate user information from the user's address
    const username = (generate({ exactly: 2, seed: address }) as string[]).join(
      "-"
    );
    const password = (
      generate({
        exactly: 2,
        seed: address + "password-seed",
      }) as string[]
    ).join("-");

    // create user
    await ssh.execCommand(`sudo useradd em -s /bin/bash "${username}`);
    // set password
    await ssh.execCommand(`sudo echo "${username}:${password}" | chpasswd`);
    // todo: create a usergroup that prevents breaking the system but allows installing packages
    // add to usergroup
    // await ssh.execCommand(`usermod -aG sudo "${username}"`);
    await DatabaseService.addGymVPSUser(this.ip, username, password);
    console.log(
      `Added user ${username} with password ${password} to the server.`
    );
    return { username, password };
  }

  public async removeTrainer(username: string) {
    // ssh in and remove the user
    const ssh = new NodeSSH();
    try {
      await ssh.connect({
        host: this.ip,
        username: this.login.username,
        privateKey: this.login.privateKey,
      });
    } catch (e) {
      console.log("SSH error:", e);
    }

    console.log("Removing user from server.");
    await ssh.execCommand(`sudo userdel -r "${username}"`);
    // todo: create a usergroup that prevents breaking the system but allows installing packages
    // remove from usergroup
    //await ssh.execCommand(`gpasswd --delete "${username} group`)
    await DatabaseService.removeGymVPSUser(this.ip, username);
  }
}
