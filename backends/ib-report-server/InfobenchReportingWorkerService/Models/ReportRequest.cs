using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace InfobenchReportingWorkerService.Models
{
    public class ReportRequest
    {
        public string TemplatePath { get; set; }
        public string SheetName { get; set; }
        public string FromDate { get; set; }
        public string ToDate { get; set; }

        public string[][] Data { get; set; }
    }
}
