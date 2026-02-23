[Setup]
AppName=Infobench Auth Service
AppVersion=1.0.0
AppPublisher=Infobench Solutions LLP
AppPublisherURL=https://infobench.in
DefaultDirName={pf}\InfobenchAuthService
DefaultGroupName=InfobenchAuthService
OutputDir=../../installers
OutputBaseFilename=InfobenchAuthService
Compression=lzma
SolidCompression=yes

[Files]
Source: "ib-auth-service.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "nssm.exe"; DestDir: "{app}"; Flags: ignoreversion

[Dirs]
Name: "{app}\logs"

[Run]

; Install service
Filename: "{app}\nssm.exe"; \
  Parameters: "install InfobenchAuthService ""{app}\ib-auth-service.exe"""; \
  Flags: runhidden

; Set working directory
Filename: "{app}\nssm.exe"; \
  Parameters: "set InfobenchAuthService AppDirectory ""{app}"""; \
  Flags: runhidden

; Set stdout log
Filename: "{app}\nssm.exe"; \
  Parameters: "set InfobenchAuthService AppStdout ""{app}\logs\output.log"""; \
  Flags: runhidden

; Set stderr log
Filename: "{app}\nssm.exe"; \
  Parameters: "set InfobenchAuthService AppStderr ""{app}\logs\error.log"""; \
  Flags: runhidden

; Rotate logs on start
Filename: "{app}\nssm.exe"; \
  Parameters: "set InfobenchAuthService AppRotateFiles 1"; \
  Flags: runhidden

; Start service
Filename: "{app}\nssm.exe"; \
  Parameters: "start InfobenchAuthService"; \
  Flags: runhidden

[UninstallRun]
Filename: "{app}\nssm.exe"; \
  Parameters: "stop InfobenchAuthService"; \
  Flags: runhidden

Filename: "{app}\nssm.exe"; \
  Parameters: "remove InfobenchAuthService confirm"; \
  Flags: runhidden
