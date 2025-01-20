import { GymVPSService } from "./index.ts";

const vps = new GymVPSService({
  ip: process.env.GYM_VPS_IP!,
  username: "ubuntu", // default sudo user
  privateKey: process.env.GYM_VPS_PRIVATE_KEY!,
});

vps.initNewTrainer("0x020302032302032").then((r) => console.log(r));
