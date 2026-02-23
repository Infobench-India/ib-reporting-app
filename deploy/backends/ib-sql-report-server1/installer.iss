; ------------------------------------------------------------------
;  Infobench Analytics – Server + Cron  (Inno Setup 6+)
; ------------------------------------------------------------------
#define MyAppName      "Infobench Analytics Services"
#define MyAppVersion   "1.0.0"
#define MyAppPublisher "Infobench Solutions LLP"
#define MyAppURL       "https://infobench.in"
#define MyAppExeName   "server.exe"

[Setup]
PrivilegesRequired=admin
AppId={{B3F6216A-921F-4FB6-83B6-6F06B9B1C3F4}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
DefaultDirName={pf}\InfobenchSQLReportService
DefaultGroupName=InfobenchSQLReportService
OutputDir=..\..\installers
OutputBaseFilename=InfobenchSQLReportService
Compression=lzma
SolidCompression=yes
UninstallDisplayIcon={app}\{#MyAppExeName}

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Dirs]
Name: "{app}\logs"; Permissions: everyone-full

[Files]
; --- programmes ---------------------------------------------------
Source: "dist\server.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "dist\cron.exe";   DestDir: "{app}"; Flags: ignoreversion
Source: "nssm.exe";   DestDir: "{app}"; Flags: ignoreversion 

[Run]
; ----------------  SERVER SERVICE  -------------------------------
Filename: "{app}\nssm.exe"; Parameters: "install InfobenchSQLReportServer ""{app}\server.exe"""; Flags: runhidden
Filename: "{app}\nssm.exe"; Parameters: "set InfobenchSQLReportServer DisplayName ""Infobench Analytics Server"""; Flags: runhidden
Filename: "{app}\nssm.exe"; Parameters: "set InfobenchSQLReportServer Description ""Infobench REST API for analytics"""; Flags: runhidden
Filename: "{app}\nssm.exe"; Parameters: "set InfobenchSQLReportServer AppDirectory ""{app}"""; Flags: runhidden
Filename: "{app}\nssm.exe"; Parameters: "set InfobenchSQLReportServer AppStdout ""{app}\logs\server.log"""; Flags: runhidden
Filename: "{app}\nssm.exe"; Parameters: "set InfobenchSQLReportServer AppStderr ""{app}\logs\server-error.log"""; Flags: runhidden
Filename: "{app}\nssm.exe"; Parameters: "set InfobenchSQLReportServer Start SERVICE_AUTO_START"; Flags: runhidden
Filename: "{app}\nssm.exe"; Parameters: "set InfobenchSQLReportServer AppRestartDelay 5000"; Flags: runhidden

; ----------------  CRON SERVICE  ---------------------------------
Filename: "{app}\nssm.exe"; Parameters: "install InfobenchSQLReportCron ""{app}\cron.exe"""; Flags: runhidden
Filename: "{app}\nssm.exe"; Parameters: "set InfobenchSQLReportCron DisplayName ""Infobench Cron daemon"""; Flags: runhidden
Filename: "{app}\nssm.exe"; Parameters: "set InfobenchSQLReportCron Description ""Sends shift reports by e-mail"""; Flags: runhidden
Filename: "{app}\nssm.exe"; Parameters: "set InfobenchSQLReportCron AppDirectory ""{app}"""; Flags: runhidden
Filename: "{app}\nssm.exe"; Parameters: "set InfobenchSQLReportCron AppStdout ""{app}\logs\cron.log"""; Flags: runhidden
Filename: "{app}\nssm.exe"; Parameters: "set InfobenchSQLReportCron AppStderr ""{app}\logs\cron-error.log"""; Flags: runhidden
Filename: "{app}\nssm.exe"; Parameters: "set InfobenchSQLReportCron Start SERVICE_AUTO_START"; Flags: runhidden
Filename: "{app}\nssm.exe"; Parameters: "set InfobenchSQLReportCron AppRestartDelay 5000"; Flags: runhidden

; ----------------  START THEM  -----------------------------------
Filename: "{app}\nssm.exe"; Parameters: "start InfobenchSQLReportServer"; Flags: runhidden
Filename: "{app}\nssm.exe"; Parameters: "start InfobenchSQLReportCron"; Flags: runhidden

[UninstallRun]
; stop & remove both services
Filename: "{app}\nssm.exe"; Parameters: "stop   InfobenchSQLReportServer"; Flags: runhidden
Filename: "{app}\nssm.exe"; Parameters: "remove InfobenchSQLReportServer confirm"; Flags: runhidden
Filename: "{app}\nssm.exe"; Parameters: "stop   InfobenchSQLReportCron"; Flags: runhidden
Filename: "{app}\nssm.exe"; Parameters: "remove InfobenchSQLReportCron confirm"; Flags: runhidden