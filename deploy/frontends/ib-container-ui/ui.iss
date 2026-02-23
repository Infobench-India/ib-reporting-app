[Setup]
AppName=Infobench UI Container Service
AppVersion=1.0.0
AppPublisher=Infobench Solutions LLP
AppPublisherURL=https://infobench.in
DefaultDirName={pf}\InfobenchUIContainerService
DefaultGroupName=InfobenchUIContainerService
OutputDir=../../installers
OutputBaseFilename=InfobenchUIContainerService
Compression=lzma
SolidCompression=yes

[Files]
Source: "serve-ui.js"; DestDir: "{app}"; Flags: ignoreversion
Source: "package.json"; DestDir: "{app}"; Flags: ignoreversion
Source: "node_modules\*"; DestDir: "{app}\node_modules"; Flags: recursesubdirs ignoreversion
Source: "dist\*"; DestDir: "{app}\dist"; Flags: recursesubdirs ignoreversion
Source: "nssm.exe"; DestDir: "{app}"; Flags: ignoreversion

[Dirs]
Name: "{app}\logs"

[Run]
; Install the service using cmd.exe so node from PATH is used
Filename: "{app}\nssm.exe"; \
  Parameters: "install InfobenchUIContainerService ""cmd.exe"" /c node serve-ui.js"; \
  Flags: runhidden

; Set working directory
Filename: "{app}\nssm.exe"; \
  Parameters: "set InfobenchUIContainerService AppDirectory ""{app}"""; \
  Flags: runhidden

; Set stdout and stderr logs
;Filename: "{app}\nssm.exe"; \
;  Parameters: "set InfobenchUIContainerService AppStdout ""{app}\logs\output.log"""; \
;  Flags: runhidden

;Filename: "{app}\nssm.exe"; \
;  Parameters: "set InfobenchUIContainerService AppStderr ""{app}\logs\error.log"""; \
;  Flags: runhidden

; Set to rotate logs on each start (optional)
Filename: "{app}\nssm.exe"; \
  Parameters: "set InfobenchUIContainerService AppRotateFiles 1"; \
  Flags: runhidden

; ✅ Start the service
Filename: "{app}\nssm.exe"; \
  Parameters: "start InfobenchUIContainerService"; \
  Flags: runhidden

[UninstallRun]
Filename: "{app}\nssm.exe"; \
  Parameters: "stop InfobenchUIContainerService"; \
  Flags: runhidden

Filename: "{app}\nssm.exe"; \
  Parameters: "remove InfobenchUIContainerService confirm"; \
  Flags: runhidden
