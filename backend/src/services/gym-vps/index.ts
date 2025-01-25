import { NodeSSH } from 'node-ssh';
import { generate } from 'random-words';
import DatabaseService from '../db/index.ts';

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
      username: options.username || 'ubuntu' // default sudo user
    };
  }

  public async initNewTrainer(
    address: string
  ): Promise<{ username: string; password: string; ip: string }> {
    // ssh in and add the new user
    const ssh = new NodeSSH();
    try {
      await ssh.connect({
        host: this.ip,
        username: this.login.username,
        privateKey: this.login.privateKey
      });
    } catch (e) {
      console.log('SSH error:', e);
    }

    console.log('Adding new user to VPS for RDP access.');

    // generate user information from the user's address
    const username = (generate({ exactly: 2, seed: address }) as string[]).join('-');
    const password = (
      generate({
        exactly: 2,
        seed: address + 'password-seed'
      }) as string[]
    ).join('-');

    // create user
    await ssh.execCommand(`sudo su root -c "useradd -m -s /bin/bash \'${username}'"`);
    // set password
    await ssh.execCommand(`sudo su root -c "echo '${username}:${password}' | chpasswd"`);
    // close the connection
    ssh.dispose();
    // todo: create a usergroup that prevents breaking the system but allows installing packages
    // add to usergroup
    // await ssh.execCommand(`usermod -aG sudo "${username}"`);
    await DatabaseService.addGymVPSUser(this.ip, username, password);
    console.log(`Added user ${username} with password ${password} to the server.`);
    return { ip: this.ip, username, password };
  }

  public async removeTrainer(username: string) {
    // ssh in and remove the user
    const ssh = new NodeSSH();
    try {
      await ssh.connect({
        host: this.ip,
        username: this.login.username,
        privateKey: this.login.privateKey
      });
    } catch (e) {
      console.log('SSH error:', e);
    }

    console.log('Removing user from server.');
    while (true) {
      const res = await ssh.execCommand(`sudo su root -c "userdel -r '${username}'"`);
      if (res.stderr.includes('is currently used by process')) {
        const sp = res.stderr.split(' ');
        const pid = sp[sp.length - 1];
        console.log(`User in use by process... Attempting to kill ${pid}.`);
        await ssh.execCommand(`sudo su root -c "kill -9 ${pid}"`);
      } else {
        break;
      }
    }
    await ssh.execCommand(`sudo rm -rf -r '/home/${username}'`);
    // close the connection
    ssh.dispose();
    // todo: create a usergroup that prevents breaking the system but allows installing packages
    // remove from usergroup
    //await ssh.execCommand(`gpasswd --delete "${username} group`)
    await DatabaseService.removeGymVPSUser(this.ip, username);
  }
}
