---

title: Android emulator detection bypass
date: 2025-06-04
author: Shahil Ahmed
tags:
  - Android
  - Frida
  - Pentesting
---

# Emulator Bypass
## The Application that I'm using is [AndroGoat](https://github.com/satishpatnayak/MyTest/tree/master)

One of the best techniques to Bypass emulator detection is to modify the RETRUN_VALUE of the function that check for Emulator Activities. In AndroGoat Application There is Function (isEmulator) Responsible for emulator detection inside EmulatorDetectionActivity Activity.


> [!note]
> You can View the Source code Using [JADX-gui](https://github.com/skylot/jadx/releases)

I will be Using Objection Tool to Modify the RETURN_VALUE of the isEmulator Function by hooking the Objection tool to the function call.

1) First I'll start the application using Objection tool.
	-  `objection -g owasp.sat.agoat explore`
2) Modifying the RETURN_VALUE
	-  `android hooking set return_valuowasp.sat.agoat.EmulatorDetectionActivity.isEmulator true`
	(single line command)
3) Check for emulation Detection in AndroGoat AppEmulator Bypass

---
# Access Control Bypass

AndroGoat App Contains a section called "Unprotected Android Components" which a has PIN Security feature hiding some secret file maybe who knows?... to bypass this security check we scan the app with drozer to scan for any insecure Android Activities

>Make sure you set a pin first and verify the functioning

1) Make sure the [Drozer Agent](https://github.com/WithSecureLabs/drozer-agent/releases/tag/3.1.0) is running on your base device.
2) forward the port to '31415'
	-  via `adb forward tcp:31415 tcp:31415`
3) Start the Drozer Console
	- run `drozer console connect`
4) Find the package name of your application
	- run `run app.package.list -f agoat`
5) scan for any insecure activites
	- run `run app.activity.info -a owasp.sat.agoat`
	

6) Once the scanning is done, in order to know more about the vulnerability we need to reverse engineer the workings of the Application via JADX or any other decompiler
	1) let do a quick search for the activity in JADX

As we can see that the Activity "AccessControl1ViewActivity" is mentioned in some sort of verifyPIN function double click on that go to the code.


Here if statement is used to verify the inserted PIN and start the activity if the PIN matches. NOTICE that the AccessControl1ViewActivity intent is started directly without any security measures
which makes it vulnerable and it is Access Control Bypass bug

7) we'll use drozer to bypass PIN verification and start the AccessControl1ViewActivity intent without any checks.
	- run `run app.activity.start --component owasp.sat.agoat owasp.sat.agoat.AccessControl1ViewActivity`
		(single line command)
8) Now it should load the activity directly without any checks