const { Worker } = require("worker_threads");
const axios = require("axios");
const cheerio = require("cheerio");
const mysql = require("mysql");
const util = require("util");
const fs = require("fs");
const path = require("path");

const connectDB = require("../config/db");
dotenv.config({ path: "../config/config.env" });
connectDB();

// const con = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "bizacade_cars",
// });

// const query = util.promisify(con.query).bind(con);

const gogo = async (page = null) => {
  try {
    const rows = await query(
      "select id,href from cars where is_load=0 limit 10"
    );
    for await (const item of rows) {
      let res = await fetchData(item.href);
      if (!res.data) {
        console.log("Invalid data Obj");
        return;
      }
      const html = res.data;
      const $ = cheerio.load(html);
      const underoffer = $(".list-detail-box-underoffer").text().trim();

      if (underoffer === "") {
        const mark_txt = $("#bread > li:nth-child(2)>a")
          .text()
          .trim()
          .replace(/^\s+|\s+$|\n|\t|,/gm, "");
        console.log("mark_txt");
        const type_txt = $("#bread > li:nth-child(3)>a")
          .text()
          .trim()
          .replace(/^\s+|\s+$|\n|\t|,/gm, "");
        console.log("type_txt");
        const price = $("#fn-vehicle-price-total-price")
          .text()
          .trim()
          .replace(/^\s+|\s+$|\n|\t|,/gm, "");
        console.log("price");
        const model_ref = $("div.car-info-area div.detail-specs-text")
          .text()
          .trim()
          .replace(/^\s+|\s+$|\n|\t|,/gm, "");
        const location_fob = $("#fn-vehicle-price-quote-type")
          .text()
          .replace("FOB ", "")
          .trim()
          .replace(/^\s+|\s+$|\n|\t|,/gm, "");
        const mileage = $(
          "#spec > div.pickup-specification > table > tbody > tr:nth-child(2) > td:nth-child(1)"
        )
          .text()
          .replace("km", "")
          .trim()
          .replace(/^\s+|\s+$|\n|\t|,/gm, "");
        const car_year = $(
          "#spec > div.pickup-specification > table > tbody > tr:nth-child(2) > td:nth-child(2)"
        )
          .text()
          .trim()
          .replace(/^\s+|\s+$|\n|\t|,/gm, "");
        const engine = $(
          "#spec > div.pickup-specification > table > tbody > tr:nth-child(2) > td:nth-child(3)"
        )
          .text()
          .trim()
          .replace(/^\s+|\s+$|\n|\t|,/gm, "");
        const trans = $(
          "#spec > div.pickup-specification > table > tbody > tr:nth-child(2) > td:nth-child(4)"
        )
          .text()
          .trim()
          .replace(/^\s+|\s+$|\n|\t|,/gm, "");
        const fuel = $(
          "#spec > div.pickup-specification > table > tbody > tr:nth-child(2) > td:nth-child(5)"
        )
          .text()
          .trim()
          .replace(/^\s+|\s+$|\n|\t|,/gm, "");

        let features = [];
        $(".remarks .attached_on").each(async function () {
          features.push($(this).text());
        });

        let gallery_images = [];
        $("#gallery ul.cf > li.gallery-li> a").each(async function () {
          const img_url = "https:" + $(this).attr("href");
          gallery_images.push(path.basename(img_url));
          await downloadFile(img_url, `${item.id}`);
        });

        const update_query = `UPDATE cars SET 
                                mark_txt = '${mark_txt}', 
                                type_txt = '${type_txt}', 
                                price = ${price}, 
                                model_ref = '${model_ref}', 
                                location_fob = '${location_fob}', 
                                mileage = ${mileage}, 
                                car_year = '${car_year}', 
                                engine = '${engine}', 
                                trans = '${trans}', 
                                fuel = '${fuel}', 
                                features = '${JSON.stringify(features)}', 
                                gallery_images = '${JSON.stringify(
                                  gallery_images
                                )}', 
                                is_load = 1 
                                WHERE id = ${item.id};`;
        console.log(update_query);
        await query(update_query);
      } else {
        const update_query = `UPDATE cars SET 
                is_load = 1 
                WHERE id = ${item.id};`;
        await query(update_query);
      }
    }
  } finally {
    con.end();
  }
  return;
};
gogo();

async function fetchData(url, page) {
  console.log("Crawling data...");

  // make http call to url
  let response = await axios(url).catch((err) => {
    console.log(err);
    gogo(page);

  if (response.status !== 200) {
    console.log("Error occurred while fetching data");
    gogo(page);
    return;
  }
  return response;
}

const downloadFile = async (fileUrl, downloadFolder) => {
  // Get the file name
  const fileName = path.basename(fileUrl);
  if (!fs.existsSync(path.resolve(__dirname, downloadFolder))) {
    fs.mkdirSync(path.resolve(__dirname, downloadFolder));
  }

  // The path of the downloaded file on our machine
  const localFilePath = path.resolve(__dirname, downloadFolder, fileName);
  try {
    const response = await axios({
      method: "GET",
      url: fileUrl,
      responseType: "stream",
    });

    response.data.pipe(fs.createWriteStream(localFilePath));
    // const w = response.data.pipe(fs.createWriteStream(localFilePath));
    // w.on("finish", () => {
    //   console.log("Successfully downloaded "+fileName+" file!");
    // });
  } catch (err) {
    throw new Error(err);
  }
};

const timer = (ms) => new Promise((res) => setTimeout(res, ms));
