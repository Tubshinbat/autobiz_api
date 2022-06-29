const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const xss = require("xss-clean");
var path = require("path");
var rfs = require("rotating-file-stream");
const mongoSanitize = require("express-mongo-sanitize");
const fileupload = require("express-fileupload");
const hpp = require("hpp");
var morgan = require("morgan");
const logger = require("./middleware/logger");
var cookieParser = require("cookie-parser");

// Router

const newsCategoriesRouters = require("./routes/NewsCategories");
const newsRouters = require("./routes/News");
const imageUploadRouter = require("./routes/imageUpload");
const bannerRouters = require("./routes/Banners");
const faqRouters = require("./routes/Faqs");
const userRouters = require("./routes/users");
const webInfoRouters = require("./routes/WebInfo");
const pageRouters = require("./routes/Pages");
const menuRouters = require("./routes/Menu");
const socialLinkRouters = require("./routes/SocialLink");
const footerRouter = require("./routes/FooterMenu");
const beProductRouters = require("./routes/BeProducts");
const productRouters = require("./routes/Products");
const carTypeRouters = require("./routes/CarType");
const carIndustryRouters = require("./routes/CarIndustry");
const carZagvarRouters = require("./routes/CarZagvar");
const carColorRouters = require("./routes/CarColor");
const partnerRouter = require("./routes/Partners");
const hybridRouters = require("./routes/Hybrid");
const orderRouters = require("./routes/Order");
const beorderRouters = require("./routes/BeOrder");
const contactRouters = require("./routes/Contact");
const orderTypeRouters = require("./routes/OrderType");
const errorHandler = require("./middleware/error");

const connectDB = require("./config/db");

//ROUTER IMPORT a

dotenv.config({ path: "./config/config.env" });
const app = express();

connectDB();

// Манай рест апиг дуудах эрхтэй сайтуудын жагсаалт :
var whitelist = ["https://admin.autobiz.mn", "https://autobiz.mn"];

// Өөр домэйн дээр байрлах клиент вэб аппуудаас шаардах шаардлагуудыг энд тодорхойлно
var corsOptions = {
  // Ямар ямар домэйнээс манай рест апиг дуудаж болохыг заана
  origin: function (origin, callback) {
    if (origin === undefined || whitelist.indexOf(origin) !== -1) {
      // Энэ домэйнээс манай рест рүү хандахыг зөвшөөрнө
      callback(null, true);
    } else {
      // Энэ домэйнд хандахыг хориглоно.
      callback(new Error("Хандах боломжгүй."));
    }
  },
  // Клиент талаас эдгээр http header-үүдийг бичиж илгээхийг зөвшөөрнө
  allowedHeaders: "Authorization, Set-Cookie, Content-Type",
  // Клиент талаас эдгээр мэссэжүүдийг илгээхийг зөвөөрнө
  methods: "GET, POST, PUT, DELETE",
  // Клиент тал authorization юмуу cookie мэдээллүүдээ илгээхийг зөвшөөрнө
  credentials: true,
};

app.use("/uploads", express.static("public/upload"));
// Cookie байвал req.cookie рүү оруулж өгнө0
app.use(cookieParser());
// Өөр өөр домэйнтэй вэб аппуудад хандах боломж өгнө
app.use(cors(corsOptions));
// логгер
app.use(logger);
// Body дахь өгөгдлийг Json болгож өгнө
app.use(express.json());

// Клиент вэб аппуудыг мөрдөх ёстой нууцлал хамгаалалтыг http header ашиглан зааж өгнө
app.use(helmet());
// клиент сайтаас ирэх Cross site scripting халдлагаас хамгаална
app.use(xss());
// Клиент сайтаас дамжуулж буй MongoDB өгөгдлүүдийг халдлагаас цэвэрлэнэ
app.use(mongoSanitize());
// Сэрвэр рүү upload хийсэн файлтай ажиллана
app.use(fileupload());
// http parameter pollution халдлагын эсрэг books?name=aaa&name=bbb  ---> name="bbb"
app.use(hpp());

var accessLogStream = rfs.createStream("access.log", {
  interval: "1d", // rotate daily
  path: path.join(__dirname, "log"),
});
app.use(morgan("combined", { stream: accessLogStream }));

// REST API RESOURSE
app.use("/api/v1/contacts", contactRouters);
app.use("/api/v1/news-categories", newsCategoriesRouters);
app.use("/api/v1/news", newsRouters);
app.use("/api/v1/imgupload", imageUploadRouter);
app.use("/api/v1/banners", bannerRouters);
app.use("/api/v1/faqs", faqRouters);
app.use("/api/v1/users", userRouters);
app.use("/api/v1/webinfo", webInfoRouters);
app.use("/api/v1/pages", pageRouters);
app.use("/api/v1/menu", menuRouters);
app.use("/api/v1/footermenu", footerRouter);
app.use("/api/v1/beproducts", beProductRouters);
app.use("/api/v1/products", productRouters);
app.use("/api/v1/slinks", socialLinkRouters);
app.use("/api/v1/cartypes", carTypeRouters);
app.use("/api/v1/carindustrys", carIndustryRouters);
app.use("/api/v1/carzagvars", carZagvarRouters);
app.use("/api/v1/carcolors", carColorRouters);
app.use("/api/v1/hybrids", hybridRouters);
app.use("/api/v1/partners", partnerRouter);
app.use("/api/v1/orders", orderRouters);
app.use("/api/v1/typeorders", orderTypeRouters);
app.use("/api/v1/beorders", beorderRouters);
app.use(errorHandler);
// Алдаа үүсэхэд барьж авч алдааны мэдээллийг клиент тал руу автоматаар мэдээлнэ

// express сэрвэрийг асаана.a
const server = app.listen(
  process.env.PORT,
  console.log(`Express server ${process.env.PORT} порт дээр аслаа....`)
);

// Баригдалгүй цацагдсан бүх алдаануудыг энд барьж авна
process.on("unhandledRejection", (err, promise) => {
  console.log(`Алдаа гарлаа : ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});
