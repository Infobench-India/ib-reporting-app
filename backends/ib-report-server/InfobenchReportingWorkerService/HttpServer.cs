using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
namespace InfobenchReportingWorkerService
{
    public class HttpServer
    {
        private IWebHost _host;

        public Task StartAsync(CancellationToken token)
        {
            _host = new WebHostBuilder()
                .UseKestrel(o =>
                {
                    o.Limits.MaxRequestBodySize = 500 * 1024 * 1024; // 500 MB
                })
                .UseUrls("http://+:5005")
                .ConfigureServices(services =>
                {
                    services.AddMvc()
         .SetCompatibilityVersion(Microsoft.AspNetCore.Mvc.CompatibilityVersion.Version_2_0);
                })
                .Configure(app =>
                {
                    app.UseMvc();

                    app.Map("/status", a => a.Run(ctx =>
                        ctx.Response.WriteAsync("Status: Running")));
                })
                .Build();

            return _host.RunAsync(token);
        }
    }
}
