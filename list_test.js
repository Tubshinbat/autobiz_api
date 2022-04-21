// const { Worker } = require("worker_threads");
const axios = require("axios");
const dotenv = require("dotenv");
const cheerio = require("cheerio");
const BeProducts = require("./models/BeProducts");

const connectDB = require("./config/db");
dotenv.config({ path: "./config/config.env" });
connectDB();

let workDir = __dirname + "/dbWorker.js";

const mainFunc = async (url) => {
  let res = await fetchData(url);
  if (!res.data) {
    console.log("Invalid data Obj");
    return;
  }
  const html = res.data;
  let dataArr = new Array();

  // mount html page to the root element
  const $ = cheerio.load(html);

  // select table classes, all table rows inside table body
  const statsTable = $("#list-content p.make-model > a.vehicle-url-link");

  //loop through all table rows and get table data
  statsTable.each(function () {
    let title = $(this)
      .text()
      .trim()
      .replace(/^\s+|\s+$|\n|\t/gm, ""); // get the text in all the td elements
    let href = "https://www.beforward.jp" + $(this).attr("href");
    let id = parseInt(href.split("/").slice(1, -1).pop());
    dataArr.push({ id, title, href });
  });

  return dataArr;
};

const gogo = async () => {
  let start_page = 1;
  while (start_page < 3) {
    const url =
      "https://www.beforward.jp/stocklist/make=/model=/mfg_year_from=/mfg_year_to=/showmore=/veh_type=/steering=/sortkey=n/keyword=/kmode=and/page=" +
      start_page;
    await mainFunc(url).then(async (res) => {
      // start worker
      //   const worker = new Worker(workDir);
      let insertData = [];
      res.map(async (r) => {
        insertData.push({
          id: r.id,
          title: r.title,
          href: r.href,
        });
      });

      await BeProducts.insertMany(insertData)
        .then((res) => console.log(res + "Success"))
        .catch((error) => console.log(error + "Error"));

      //   let insert_sql = `INSERT IGNORE INTO cars (id, title, href) VALUES `;
      //   insert_sql =
      //     insert_sql +
      //     res.map((r) => `(${r.id}, '${r.title}', '${r.href}')`).join(",") +
      //     ";";

      // send formatted data to worker thread
      //   worker.postMessage(insert_sql);

      // listen to message from worker thread
      //   worker.on("message", (message) => {
      //     console.log(message);
      //   });
    });
    start_page++;
    await timer(5000);
  }
  return;
};

gogo();

async function fetchData(url) {
  console.log("Crawling data...");

  // make http call to url
  let response = await axios(url).catch((err) => console.log(err));

  if (response.status !== 200) {
    console.log("Error occurred while fetching data");
    return;
  }
  return response;
}

const timer = (ms) => new Promise((res) => setTimeout(res, ms));
