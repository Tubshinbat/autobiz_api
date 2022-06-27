const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const BeProducts = require("./models/BeProducts");

const connectDB = require("./config/db");
dotenv.config({ path: "./config/config.env" });
connectDB();

const gogo = async (page = null) => {
  try {
    const rows = await BeProducts.find({})
      .select("id href")
      .where("is_load")
      .equals(0)
      .limit(10);

    for await (const item of rows) {
      await BeProducts.updateMany({ id: item.id }, { $set: { is_load: 1 } });
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
        const model = $("#bread > li:nth-child(4)>a")
          .text()
          .trim()
          .replace(/^\s+|\s+$|\n|\t|,/gm, "");
        console.log("model");
        const price = $("#fn-vehicle-price-total-price")
          .text()
          .trim()
          .replace(/^\s+|\s+$|\n|\t|,/gm, "");

        console.log("price");
        console.log(price);

        const model_ref = $("div.car-info-area div.detail-specs-text")
          .text()
          .trim()
          .replace(/^\s+|\s+$|\n|\t|,/gm, "");
        const icon = $(".specs-pickup-h-text > .specs-pickup-icon > i").attr(
          "class"
        );
        const location = $(".specs-pickup-h-text > .specs-pickup-icon > b")
          .text()
          .trim()
          .replace(/^\s+|\s+$|\n|\t|,/gm, "");

        const mileage = $(
          "#spec > div.pickup-specification > table > tbody > tr:nth-child(2) > td:nth-child(1)"
        )
          .text()
          .replace("km", "")
          .trim()
          .replace(/^\s+|\s+$|\n|\t|,/gm, "");
        let car_year = $(
          "#spec > div.pickup-specification > table > tbody > tr:nth-child(2) > td:nth-child(2)"
        )
          .text()
          .trim()
          .replace(/^\s+|\s+$|\n|\t|,/gm, "");

        const carYearArray = car_year.split("/");
        const mount = parseInt(carYearArray[1]) || nul
        car_year = carYearArray[0] || nul

        if (typeof mount === "string") mount = nul

        console.log(mount);
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
          gallery_images.push(img_url);
        });

        updateData = {
          mark_txt,
          type_txt,
          price: price,
          model,
          model_ref,
          location_fob: icon + " " + location,
          mileage: mileage,
          car_year,
          mount,
          engine,
          trans,
          fuel,
          features: features,
          gallery_images: gallery_images,
          is_load: 1,
        };
        console.log(updateData);

        await BeProducts.updateMany({ id: item.id }, { $set: updateData });
      } else {
        await BeProducts.updateMany({ id: item.id }, { $set: { is_load: 1 } });
      }
    }
  } finally {
    gogo();
  }
  return;
};
gogo();

async function fetchData(url, page) {
  console.log("Crawling data...");
console.log(url);
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
