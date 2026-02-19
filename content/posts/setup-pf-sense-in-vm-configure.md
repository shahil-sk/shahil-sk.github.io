---

title: Setup pf-sense in VM & Configure
date: 2025-12-11
author: Shahil Ahmed
tags:
  - Setup
  - Pfsense
  - Firewall
  - VM
---
Before creating the pfSense VM, set up a custom internal network bridge for LAN traffic and link it to your main `virbr0`.​

1. Create the network definition file:
    
    bash
    `sudo nano /etc/libvirt/qemu/networks/pfsense.xml`
    
2. Use a definition similar to:
    
    bash
    `sudo virsh net-define /dev/stdin <<EOF <network>   <name>pfsense-lan</name>  <forward mode='none'/>  <bridge name='pfsense-lan' stp='on' delay='0'/> </network> EOF`
    
3. Enable and autostart the network:
    
    bash
    `sudo virsh net-start pfsense-lan sudo virsh net-autostart pfsense-lan`
    

---

## 2. Create and install the pfSense VM

Create the VM with two network interfaces: one for WAN (to the internet) and one for LAN (internal VMs).​

1. In virt-manager, create a new VM and choose “Generic Linux 2024” as the OS type, then tick “Customize before installation”.​
    
2. Add two NICs:
    
    - WAN: attach to your external network (e.g. `default` / `virbr0`).
        
    - LAN: attach to the `pfsense-lan` network created earlier via “Add Hardware → Network”.​
        
3. Start the installation and accept the default pfSense installation settings
![[pfsense-ip-setup.png]]
---

## 3. Basic pfSense configuration

After installation, perform initial setup and make sure management access and DNS work.​

1. From the pfSense console menu, select option `14` to enable SSH if you want remote shell access.​
    
2. Access the Web UI using the LAN gateway IP shown on the console (for example `https://192.168.100.1`).​
    
3. In the setup wizard, configure DNS:
    
    - Primary DNS: `1.1.1.1`
        
    - Secondary DNS: `9.9.9.9`  
        Then click through the wizard and change the admin password if desired.​
![[pfsense-web.png]]
        
1. To see connected devices, go to:  
    `Status → DHCP Leases` and verify that your LAN VMs appear with hostname and IP.​
    
2. If LAN VMs do not have internet access, add a LAN rule allowing HTTP/HTTPS outbound:
    
    - Go to `Firewall → Rules → LAN` and create a rule:
        
        - Action: Pass
            
        - Interface: LAN
            
        - Address Family: IPv4
            
        - Protocol: TCP/UDP
            
        - Source: LAN net or LAN address
            
        - Destination: Any
            
        - Destination ports: HTTP (80) and HTTPS (443) (using the port range fields).​
            
![[Pasted image 20251211084755.png]]

---

## 4. Blocking domains and countries (pfBlockerNG + DNS)

You can block specific domains via DNS overrides and block countries or IP ranges using pfBlockerNG with GeoIP.​

1. **Block a single domain via DNS Resolver** (example: youtube.com):
    
    - Go to `Services → DNS Resolver`.
        
    - Scroll down to “Domain Overrides” and add:
        
        - Domain: `youtube.com`
            
        - IP Address: `0.0.0.0`
            
        - Description: e.g. “block youtube”.
            
    - Save and apply settings. This causes lookups for that domain to resolve to `0.0.0.0`.​
    - ![[Screenshot_20251127_181726.png]]
        
2. **Install pfBlockerNG-devel**:
    
    - Go to `System → Package Manager → Available Packages` and install `pfBlockerNG-devel`.​
        
    - After installation, go to `Firewall → pfBlockerNG-devel`.​
        
3. **Configure GeoIP (MaxMind)**:
    
    - Navigate to `Firewall → pfBlockerNG-devel → IP`, then scroll to the MaxMind configuration section.​
        
    - Obtain a free MaxMind account ID and license key from the MaxMind website and enter them in the pfBlockerNG GeoIP settings.​

        ![[Screenshot_20251211_092535.png]]
		
        
    - Save changes and reboot the pfSense VM  so the GeoIP databases download.​

		![[Screenshot_20251211_082531.png]]

1. **Block traffic from/to specific countries (example: Russia)**:
    
    - Open `Firewall → pfBlockerNG-devel → IP → GeoIP`.​
        now open [www.yandex.ru](www.yandex.ru) in new tab, which is russian website we'll try to block russian websites

		![[Pasted image 20251211085836.png]]

    - In the country list (IPv4), hold `Ctrl` and select the countries you want to block, e.g. “Russia [RU]” and “Russia [RU_rep]”.​
        
    - Set “List Action” to **Deny Outbound** so outbound connections to those countries are blocked.​
        
    - Enable logging if desired and click **Save**.​

         ![[Screenshot_20251211_085305.png]]

		![[Screenshot_20251211_085526.png]]

    - Go to `Firewall → pfBlockerNG-devel → Update` and click **Run** to apply and build the rules.​
        
    - After this, connections to sites hosted in those countries (e.g. `www.yandex.ru`) should fail.​
        

---

## 5. Blocking YouTube with a firewall rule

In addition to DNS-based blocking, you can block specific IPs or networks with a firewall rule on the LAN interface.​

1. Go to `Firewall → Rules → LAN` and click **Add** (typically at the bottom).​
    
2. Create a rule similar to:
    
    - Action: Block
        
    - Interface: LAN
        
    - Address Family: IPv4
        
    - Protocol: TCP/UDP
        
    - Source: LAN net or LAN address
        
    - Destination: Single host or alias (for example, a specific YouTube IP like `74.125.130.91`, or better an alias containing YouTube IP ranges).
        
    - Destination port range: From HTTP (80) to HTTPS (443).​
        
3. Save and apply changes; traffic from LAN to that IP on ports 80/443 will now be blocked.​

	![[Screenshot_20251211_091333.png]]
    
next i'll be looking into vlans static ips.

