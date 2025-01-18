import { GymVPSService } from "./index.ts";

const vps = new GymVPSService();

vps.createInstance().then((a) => console.log("success"));
