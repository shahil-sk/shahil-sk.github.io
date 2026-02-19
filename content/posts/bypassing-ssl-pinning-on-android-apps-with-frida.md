---

title: Bypassing SSL Pinning on Android Apps with Frida
date: 2026-02-15
author: Shahil Ahmed
tags:
  - android
  - frida
  - pentesting
---

## Overview

SSL pinning is a technique used by mobile apps to prevent MITM attacks by hardcoding the server certificate (or its public key hash) inside the app itself. When the app detects a certificate it doesn't recognise — like your Burp Suite proxy cert — it terminates the connection.

This writeup covers the most reliable methods to bypass it using **Frida**.

## Prerequisites

- Rooted Android device or Genymotion emulator
- Frida server running on the device
- `frida-tools` installed on your machine
- Burp Suite configured as proxy

## Step 1 — Set Up Frida Server

Download the correct architecture binary from the [Frida releases](https://github.com/frida/frida/releases) page.

```bash
adb push frida-server /data/local/tmp/
adb shell "chmod +x /data/local/tmp/frida-server"
adb shell "/data/local/tmp/frida-server &"
```

Verify it's running:

```bash
frida-ps -U
```

## Step 2 — Use the Universal Bypass Script

The `frida-android-unpinning` script by @pcipolloni handles most pinning implementations out of the box.

```bash
frida -U -f com.target.app \
  --codeshare pcipolloni/universal-android-ssl-pinning-bypass-with-frida \
  --no-pause
```

> If the app restarts and re-pins, try `-U --attach` instead of `-f` to hook a running process.

## Step 3 — Verify Traffic in Burp

Once the script is injected, all HTTPS traffic should flow through your Burp proxy. You should see requests populating in the HTTP history tab.

## When the Universal Script Fails

Some apps use custom pinning logic. In that case:

1. Decompile the APK with `jadx-gui`
2. Search for `CertificatePinner`, `TrustManager`, `checkServerTrusted`
3. Find the exact class and method performing the check
4. Write a targeted Frida hook

```javascript
Java.perform(function() {
  var CertPinner = Java.use('com.target.app.network.CertPinner');
  CertPinner.check.overload('java.lang.String', 'java.util.List').implementation = function(host, certs) {
    console.log('[*] SSL Pinning bypassed for: ' + host);
    return; // do nothing
  };
});
```

## Notes

- Always test in a lab environment on apps you own or have permission to test.
- Newer apps may use `network_security_config.xml` — check that too.
- OkHttp3, Conscrypt, and native pinning all need different hooks.

---

*This post was written from real-world experience during Android VAPT engagements.*
