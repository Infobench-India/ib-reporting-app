using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System.Threading;
using System.Threading.Tasks;

namespace InfobenchReportingWorkerService
{
    public class Worker : BackgroundService
    {
        private readonly ILogger<Worker> _logger;
        private readonly HttpServer _server;

        public Worker(ILogger<Worker> logger, HttpServer server)
        {
            _logger = logger;
            _server = server;
        }

        protected override Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Starting HTTP Server...");
            return _server.StartAsync(stoppingToken);
        }
    }
}