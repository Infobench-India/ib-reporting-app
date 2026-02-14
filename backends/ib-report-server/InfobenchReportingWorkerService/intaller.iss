[Setup]
AppName=Infobench Reporting Worker Service
AppVersion=1.0
DefaultDirName={pf}\InfobenchReportingWorkerService
DefaultGroupName=Infobench Reporting Worker Service
OutputDir=.\Output
OutputBaseFilename=Setup_InfobenchReportingWorkerService
PrivilegesRequired=admin
DisableWelcomePage=no
DisableProgramGroupPage=no

[Files]
; Include files from the PublishOutput directory
Source: ".\PublishOutput\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: ".\templates\*"; DestDir: "{app}\templates"; Flags: ignoreversion recursesubdirs createallsubdirs

[Run]
; Install the service after copying files
Filename: "{sys}\sc.exe"; Parameters: "create InfobenchReportingWorkerService binPath= ""{app}\InfobenchReportingWorkerService.exe"" start= auto"; StatusMsg: "Installing service..."; Flags: runhidden
; Start the service
Filename: "{sys}\sc.exe"; Parameters: "start InfobenchReportingWorkerService"; StatusMsg: "Starting service..."; Flags: runhidden

[UninstallRun]
; Stop the service
Filename: "{sys}\sc.exe"; Parameters: "stop InfobenchReportingWorkerService"; StatusMsg: "Stopping service..."; Flags: runhidden; RunOnceId: "StopService"
; Delete the service
Filename: "{sys}\sc.exe"; Parameters: "delete InfobenchReportingWorkerService"; StatusMsg: "Removing service..."; Flags: runhidden; RunOnceId: "DeleteService"
