using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace pmac_demo.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        [Route("search/{query}")]
        [HttpGet]
        public JsonResult Demo(string query)
        {
            var result = Enumerable.Range(1, 6).Select(_ => new { value = _, name = query + _ }).ToArray();
            return new JsonResult
                   {
                       JsonRequestBehavior = JsonRequestBehavior.AllowGet,
                       Data = result
                   };
        }
    }
}