const http = require('http');
const curl = require("curl");
const jsdom = require("jsdom");
const { ToadScheduler, SimpleIntervalJob, Task } = require('toad-scheduler')


const hostname = '127.0.0.1';
const port = 3000;



const selectors = [
  {"site": "Sony", "url": "https://store.sony.com.ar/playstation/consolas", "query": ".title.ellipsis"},
  {"site": "Fravega", "url": "https://www.fravega.com/l/?categorias=videojuegos%2Fconsolas", "query": ".PieceTitle-sc-1eg7yvt-0"},
  {"site": "Compumundo", "url": "https://www.compumundo.com.ar/productos/playstation-4/5141", "query": ".itemBox--title"},
  {"site": "Jumbo", "url": "https://www.jumbo.com.ar/electro/consolas-y-videojuegos/playstation", "query": "a.product-item__name"},
  {"site": "Carrefour", "url": "https://www.carrefour.com.ar/gaming/consolas.html", "query": ".p.title"},
  {"site": "Walmart", "url": "https://www.walmart.com.ar/gaming/consolas", "query": ".prateleira__name"},
  {"site": "Naldo", "url": "https://www.naldo.com.ar/GENERAL/TECNOLOGIA/Video-Juegos/Consolas/c/130?gclid=Cj0KCQiAgomBBhDXARIsAFNyUqMb63ZPINrI4srZEjLzRD-VQbRKuVfDTxCY3d852-v-dle9J9C3n3gaAvHAEALw_wcB", "query": ".details p a"},
  {"site": "Falabella", "url": "https://www.falabella.com.ar/falabella-ar/category/cat20050/Consolas", "query": ".pod-subTitle"}
]

const server = http.createServer((req, res) => {
    
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hola Mundo');
});

server.listen(port, hostname, () => {
  console.log(`El servidor se está ejecutando en http://${hostname}:${port}/`);

  const scheduler = new ToadScheduler()

  const task = new Task('simple task', () => { 
      selectors.forEach((selector) => {
        scrap(selector);
      });
   })
  const job = new SimpleIntervalJob({ minutes: 30, }, task)

  scheduler.addSimpleIntervalJob(job)
});

function scrap(selector){

    curl.get(selector.url, null, (err,resp,body)=>{
        const {JSDOM} = jsdom;
        const dom = new JSDOM(body);
        const $ = (require('jquery'))(dom.window);

        $.each($(selector.query), (index, field) =>{
            var title = $(field).text().toUpperCase();
            if(validateTitle(title)){
              notify(selector);
            }
        })
    })
}

function validateTitle(title){
  return (title.includes("PS5") && !(title.includes("CAMERA") || title.includes("SPIDER-MAN")))
}

function notify(selector){
  console.log("site: ", selector.site);
  console.log("link: ", selector.url)
}