using System;
using System.Net;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace InfobenchReportingWorkerService
{
    public class Router
    {
        private readonly HttpListener _listener;
        private CancellationTokenSource _cts;

        public Router(string prefix)
        {
            _listener = new HttpListener();
            _listener.Prefixes.Add(prefix);
        }

        public void Start()
        {
            _cts = new CancellationTokenSource();
            _listener.Start();
            Console.WriteLine($"Server started at {string.Join(", ", _listener.Prefixes)}");
            Task.Run(() => ProcessRequests(_cts.Token));
        }

        public void Stop()
        {
            _cts.Cancel();
            _listener.Stop();
            Console.WriteLine("Server stopped.");
        }

        private async Task ProcessRequests(CancellationToken token)
        {
            while (!token.IsCancellationRequested)
            {
                try
                {
                    var context = await _listener.GetContextAsync();
                    string responseString = "<html><body><h1>Hello from Windows Service HTTP Server!</h1></body></html>";

                    byte[] buffer = Encoding.UTF8.GetBytes(responseString);
                    context.Response.ContentLength64 = buffer.Length;

                    await context.Response.OutputStream.WriteAsync(buffer, 0, buffer.Length);
                    context.Response.OutputStream.Close();
                }
                catch (Exception ex)
                {
                    if (!token.IsCancellationRequested)
                        Console.WriteLine($"Request error: {ex.Message}");
                }
            }
        }
    }
}
