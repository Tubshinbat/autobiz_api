const { Worker } = require("worker_threads");
const axios = require("axios");
const cheerio = require("cheerio");
const mysql = require("mysql");
const util = require("util");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const BeProducts = require("./models/BeProducts");

const connectDB = require("./config/db");
dotenv.config({ path: "./config/config.env" });
connectDB();

// const con = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "bizacade_cars",
// });

// const query = util.promisify(con.query).bind(con);

const gogo = async () => {
  try {
    const rows = await BeProducts.find({})
      .select("id href")
      .where("is_load")
      .equals(0)
      .limit(10);

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
          await downloadFile(
            img_url,
            `${process.env.FILE_PRODUCT_UPLOAD_PATH}/${item.id}`
          );
        });

        updateData = {
          mark_txt,
          type_txt,
          price,
          model_ref,
          location_fob,
          mileage,
          car_year,
          engine,
          trans,
          fuel,
          features: features,
          gallery_images: gallery_images,
          is_load: 1,
        };
        console.log(updateData);
        await BeProducts.updateOne({ id: item.id }, { $set: updateData });
      } else {
        await BeProducts.updateOne({ id: item.id }, { $set: { is_load: 1 } });
      }
    }
  } finally {
    con.end();
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
