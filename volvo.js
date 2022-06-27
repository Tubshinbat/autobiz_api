const { Worker } = require("worker_threads");
const axios = require("axios");
const dotenv = require("dotenv");
const cheerio = require("cheerio");
const BeProducts = require("./models/BeProducts");

const connectDB = require("./config/db");
dotenv.config({ path: "./config/config.env" });
connectDB();

let workDir = __dirname + "/dbWorker.js";

const mainFunc = async (url, start_page) => {
  let res = await fetchData(url, start_page);
  if (!res.data) {
    gogo(start_page);
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

const gogo = async (page = null) => {
  let start_page = 73;
  if (page !== null) {
    start_page = page;
  }
  while (start_page >= 1) {
    const url =
      "https://www.beforward.jp/stocklist/make=57/sortkey=n/page=" +
      start_page +
      "/sortkey=n/view_cnt=25";
    await mainFunc(url, start_page).then(async (res) => {
      // start worker

      res.map(async (r) => {
        const id = r.id.toString();
        const checkId = await BeProducts.find({ id: id });
        if (checkId.length === 0) {
          await BeProducts.create({
            id: r.id,
            title: r.title,
            href: r.href,
          })
            .then((res) => console.log(res + "Success"))
            .catch((error) => console.log(error + "Error"));
        }
      });
    });
    start_page--;
    await timer(5000);
  }
  return;
};

gogo();

async function fetchData(url, page) {
  console.log("Crawling data...");

  // make http call to url
  let response = await axios(url, {
    headers: {
      Cookie:
        "wwwbf[country_code_to_display]=mn; wwwbf[SelectedCurrency]=JPY; wwwbf[country_code]=mn;",
    },
  }).catch((err) => {
    console.log(err);
    gogo(page);
  });
  if (response)
    if (response.status !== 200) {
      console.log("Error occurred while fetching data");
      gogo(page);
      return;
    }
  return response;
}

const timer = (ms) => new Promise((res) => setTimeout(res, ms));
