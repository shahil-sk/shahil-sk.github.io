---
title: How to Root Genymotion Emulator and Set Up BurpSuite for HTTPS Interception
date: 2025-06-19
author: Shahil Ahmed
tags:
  - android
  - burpsuite
  - pentesting
---


## **Step 1: Create a Virtual Device**

1. Open **Genymotion** and create a new virtual device.
2. Select **Android** Version.
	 *( In this blog i'm going to use Android 12 has a base )*
1. Start the newly created virtual device.

## **Step 2: Enable Root Access**

Make sure **ADB** is installed and configured. Once the emulator starts, run the following command to enable root access:

```sh
adb shell setprop persist.sys.root_access 3
```
 _(This command needs to be executed every time you start the emulator. in order to maintain the root access inside the emulator)_
## **Step 3: Install Magisk**

1. **Drag and drop** the [Magisk.apk](https://github.com/topjohnwu/magisk/releases) onto the emulator.
2. Open the Magisk app and **grant root access** when prompted.
3. Restart the Magisk app.
4. Inside the Magisk app, install Magisk using the **Direct Install** method.
5. Drag and drop the [Magisk_rebuilt_1c8ebfac_x86_64.zip](https://drive.google.com/file/d/1OF8zx6p46t8BcKuO5A6Ncq46zLpFfps-/view) file into the emulator.
6. Reboot the emulator.
7. Once the emulator restarts, **run the root access command again**:
    
    ```sh
    adb shell setprop persist.sys.root_access 3
    ```
    
    _(This command needs to be executed every time you start the emulator. in order to maintain the root access inside the emulator)_

## **Step 4: Setting Up BurpSuite**

1. **Ensure BurpSuite is running.**
2. Open BurpSuite and navigate to **Proxy > Options** to find the **CA certificate**.
3. Download the BurpSuite certificate from:
    
    ```
    http://localhost:8080
    ```
    

## **Step 5: Install the BurpSuite Certificate**

1. Drag and drop the **cacert.der** file into the emulator.
2. Install the certificate manually:
    - **Settings** > **Security** > **Encryption & Credentials** > **Install a certificate** > **CA certificate**.

## **Step 6: Install AlwaysTrustUserCerts Module**

1. Drag and drop the [AlwaysTrustUserCerts.zip](https://github.com/NVISOsecurity/MagiskTrustUserCerts/releases/tag/v0.4.1) file into the emulator.
2. Open the **Magisk app** and install the **AlwaysTrustUserCerts** module.
3. Restart the emulator.
4. Verify the certificate installation:
    - **Settings** > **Security** > **Encryption & Credentials** > **Trusted Credentials**.
    - Check if **PortSwigger** is listed.

## **Step 7: Forward Emulator Traffic to BurpSuite**

To capture network traffic from the emulator, forward its **TCP:3333** port to BurpSuite's **8080** port:

```sh
adb shell settings put global http_proxy localhost:3333
adb reverse tcp:3333 tcp:8080
```

## **Step 8: Verify HTTPS Traffic Interception**

1. Open a browser on the emulator and visit a website.
2. Check the **BurpSuite Proxy History** to confirm that requests are being captured.

---

## **Conclusion**

By following these steps, you now have a **rooted Genymotion emulator** with **Magisk** installed and **BurpSuite configured for HTTPS traffic interception**. This setup is useful for **security testing, app pentesting, and network analysis**.

If you restart the emulator, remember to re-run:

```sh
adb shell setprop persist.sys.root_access 3
```

to regain root access.