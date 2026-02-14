using System;
using System.IO;
using System.Diagnostics;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using log4net;

namespace InfobenchReportingWorkerService
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var baseDir = AppDomain.CurrentDomain.BaseDirectory;
            Directory.SetCurrentDirectory(baseDir);

            var logRepository = log4net.LogManager.GetRepository(System.Reflection.Assembly.GetEntryAssembly());
            log4net.Config.XmlConfigurator.Configure(logRepository, new System.IO.FileInfo(Path.Combine(baseDir, "log4net.config")));
            
            var log = log4net.LogManager.GetLogger(typeof(Program));
            log.Info("Service is starting up...");

            // Environmental Fixes for Excel COM and Services
            EnsureEnvironment(log);
            CleanupExcelProcesses(log);
            
            CreateHostBuilder(args).Build().Run();
        }

        private static void EnsureEnvironment(ILog log)
        {
            string[] paths = {
                @"C:\Windows\System32\config\systemprofile\Desktop",
                @"C:\Windows\SysWOW64\config\systemprofile\Desktop"
            };

            foreach (var path in paths)
            {
                try
                {
                    if (!Directory.Exists(path))
                    {
                        Directory.CreateDirectory(path);
                        log.Info($"Created missing environment folder: {path}");
                    }
                }
                catch (Exception ex)
                {
                    log.Warn($"Failed to create environment folder {path}: {ex.Message}");
                }
            }
        }

        private static void CleanupExcelProcesses(ILog log)
        {
            try
            {
                foreach (var proc in Process.GetProcessesByName("EXCEL"))
                {
                    // Kill Excel processes running in Session 0 (Services session)
                    if (proc.SessionId == 0)
                    {
                        log.Info($"Killing hung Excel process {proc.Id} in Session 0");
                        try { proc.Kill(); } catch { }
                    }
                }
            }
            catch (Exception ex)
            {
                log.Warn($"Error during Excel cleanup: {ex.Message}");
            }
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .UseWindowsService()
                .ConfigureLogging(logging =>
                {
                    logging.ClearProviders();
                    logging.AddConsole();
                })
                .ConfigureServices(services =>
                {
                    services.AddSingleton<HttpServer>();
                    services.AddHostedService<Worker>();
                });
    }
}