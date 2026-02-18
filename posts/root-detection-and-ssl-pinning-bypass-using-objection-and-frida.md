---

title: Root detection and ssl-pinning bypass using Objection And Frida
date: 2026-02-15
author: Shahil Ahmed
tags:
  - android
  - frida
  - pentesting
---

# Objection

> [!IMPORTANT]
> 1) Make sure adb is installed.
> 2) Use a quality USB cable.
> 3) Install frida
### The Application that I'm using today is [AndroGoat](https://github.com/satishpatnayak/MyTest/tree/master)

which is purposely made vulnerable for testing and learning

Objection run's upon frida, So make sure the frida server is installed and running

1)  Use `frida-ps -Uai` to list all the applications installed on the devices.
2)  Attach the application using objection has shown below and A console should appear.
	1) `objection -g com.example.app explore`
		- `-g` : to specify application Package name.
		-  `explore` : this flag provides interactive console for the application

## Root detection

Go to "Root detection" section of the app and check for the status. if should show toast telling "Device is rooted"
- Use `android root disable` to disable root detection.
- Use `android root stimulate` to enable root detection

## SSL pinning Bypass

>[!NOTE]
>Make sure the device is connected to Burpsuite Proxy


Go to "Network intercepting" section of the app.
	You can find 3 buttons indicating HTTP, HTTPS, CERTIFICATE PINNING.

Try sending HTTP AND HTTPS request, you should be able to capture those request via burpsuite
but the CERTIFICATE PINNING request may not appear on the proxy history, it is because of the SSL pinning is a security technique to bypass it we can Use
-  Use `android sslpinning disable`

# Frida

>[!IMPORTANT]
>Make Sure The Frida-server is Up and  Running

## Frida Script Injection Process.

Step 1:
	**Find the package name of the app.
- use `frida-ps -Uia` to list installed application

Step 2:
	**Injecting the frida script and starting the application.
- use `frida -l <script-Path> -f <package-name> -U` to list installed application

>[!important]
> You  have to save your cacert.crt certificate file your emulator `/data/local/tmp`  folder as "cert-der.crt" for SSL-pinning bypass 

some basic script:
1) [RootBypass](https://codeshare.frida.re/@dzonerzy/fridantiroot/)
2) [SSL-pinning](https://codeshare.frida.re/@pcipolloni/universal-android-ssl-pinning-bypass-with-frida/)

make sure save the script locally in your computer

>[!note]
>You can use multiple script inside a single file by copy pasting both or multiple script in side a single txt file

