[Setup]
AppName=Infobench SQL Report Service
AppVersion=1.0.0
AppPublisher=Infobench Solutions LLP
AppPublisherURL=https://infobench.in
DefaultDirName={pf}\InfobenchSQLReportService
DefaultGroupName=InfobenchSQLReportService
OutputDir=../../installers
OutputBaseFilename=InfobenchSQLReportService
Compression=lzma
SolidCompression=yes

[Files]
Source: "ib-sql-report-server.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "nssm.exe"; DestDir: "{app}"; Flags: ignoreversion

[Dirs]
Name: "{app}\logs"

[Run]
; Install service
Filename: "{app}\nssm.exe"; \
  Parameters: "install InfobenchSQLReportService ""{app}\ib-sql-report-server.exe"""; \
  Flags: runhidden

; Set stdout log
Filename: "{app}\nssm.exe"; \
  Parameters: "set InfobenchSQLReportService AppStdout ""{app}\logs\output.log"""; \
  Flags: runhidden

; Set stderr log
Filename: "{app}\nssm.exe"; \
  Parameters: "set InfobenchSQLReportService AppStderr ""{app}\logs\error.log"""; \
  Flags: runhidden

; Start service
Filename: "{app}\nssm.exe"; \
  Parameters: "start InfobenchSQLReportService"; \
  Flags: runhidden

[UninstallRun]
Filename: "{app}\nssm.exe"; \
  Parameters: "stop InfobenchSQLReportService"; \
  Flags: runhidden

Filename: "{app}\nssm.exe"; \
  Parameters: "remove InfobenchSQLReportService confirm"; \
  Flags: runhidden
