export interface VultrInstance {
  id: string;
  os: string;
  ram: number; // RAM in MB
  disk: number; // Disk size in GB
  main_ip: string;
  vcpu_count: number;
  region: string;
  default_password: string; // Only available for 10 minutes after deployment
  date_created: string; // ISO 8601 date format
  status: "active" | "pending" | "suspended" | "resizing";
  power_status: "running" | "stopped";
  server_status: "none" | "locked" | "installing" | "booting" | "ok";
  allowed_bandwidth: number; // Monthly bandwidth quota in GB
  netmask_v4: string; // IPv4 netmask in dot-decimal notation
  gateway_v4: string; // Gateway IP address
  v6_networks: {
    network: string;
    prefix_length: number;
  }[]; // Array of IPv6 objects
  hostname: string;
  label: string;
  tag: string; // Deprecated, use tags instead
  internal_ip?: string; // Only relevant when a VPC is attached
  kvm: string; // HTTPS link to the Vultr noVNC Web Console
  os_id: number;
  app_id: number;
  image_id: string;
  firewall_group_id: string;
  features: ("auto_backups" | "ipv6" | "ddos_protection")[];
  plan: string; // Unique ID for the Plan
  tags: string[]; // Tags to apply to the instance
  user_scheme: "root" | "limited";
}

export interface VultrListInstancesRes {
  instances: VultrInstance[];
  meta: {
    total: number; // Total objects available in the list
  };
  links: {
    prev?: string; // Cursor for the previous page
    next?: string; // Cursor for the next page
  };
}
