const { series, src, dest, parallel, watch } = require("gulp");
const browsersync = require("browser-sync");
const cleanCSS = require("clean-css");
const del = require("del");
const fileinclude = require("gulp-file-include");
const imagemin = require("gulp-imagemin");
const npmdist = require("gulp-npm-dist");
const newer = require("gulp-newer");
const rename = require("gulp-rename");
const sourcemaps = require("gulp-sourcemaps");
const sass = require("gulp-sass")(require("sass"));
const uglify = require("gulp-uglify");
const postcss = require('gulp-postcss');
const autoprefixer = require("autoprefixer");
const gulpautoprefixer = require("gulp-autoprefixer");
const tailwindcss = require('tailwindcss');

const paths = {
    baseSrc: "src/",
    baseDist: "dist/",
    baseSrcAssets: "src/assets/",
    baseDistAssets: "dist/assets/",
    configTailwind: "./tailwind.config.js",
};

const clean = function (done) {
    del.sync(paths.baseDist, done());
};

const vendor = function () {
    const out = paths.baseDistAssets + "libs/";
    return src(npmdist(), { base: "./node_modules" })
        .pipe(rename(function (path) {
            path.dirname = path.dirname.replace(/\/dist/, '').replace(/\\dist/, '');
        }))
        .pipe(dest(out));
};

const html = function () {
    const srcPath = paths.baseSrc + "/";
    const out = paths.baseDist;
    return src([srcPath + "*.html", srcPath + "*.ico", srcPath + "*.png",])
        .pipe(
            fileinclude({
                prefix: "@@",
                basepath: "@file",
                indent: true,
            })
        )
        .pipe(dest(out));
};

const data = function () {
    const out = paths.baseDistAssets + "data/";
    return src(paths.baseSrcAssets + "data/**/*")
        .pipe(dest(out));
};

const fonts = function () {
    const out = paths.baseDistAssets + "fonts/";
    return src(paths.baseSrcAssets + "fonts/**/*")
        .pipe(newer(out))
        .pipe(dest(out));
};

const images = function () {
    var out = paths.baseDistAssets + "images";
    return src(paths.baseSrcAssets + "images/**/*")
        .pipe(newer(out))
        .pipe(imagemin())
        .pipe(dest(out));
};

const javascript = function () {
    const out = paths.baseDistAssets + "js/";

    return src(paths.baseSrcAssets + "js/**/*.js")
        .pipe(dest(out))
        .pipe(uglify())
        .pipe(rename({ suffix: ".min" }))
        .pipe(dest(out));
};

const scss = function () {
    const out = paths.baseDistAssets + "css/";

    return src(paths.baseSrcAssets + "scss/theme.scss")
        .pipe(sourcemaps.init())
        .pipe(sass.sync()) // scss to css
        .pipe(postcss([
            tailwindcss(paths.configTailwind),
            autoprefixer({
                overrideBrowserslist: ["last 2 versions"],
            })
        ]))
        .pipe(dest(out))
        .on("data", function (file) {
            const buferFile = new cleanCSS({ compatibility: "*", inline: ["all"], level: 2, }).minify(file.contents);
            return (file.contents = Buffer.from(buferFile.styles));
        })
        .pipe(rename({ suffix: ".min" }))
        .pipe(sourcemaps.write("./")) // source maps
        .pipe(dest(out));
};

const icons = function () {
    const out = paths.baseDistAssets + "css/";

    return src(paths.baseSrcAssets + "scss/icons.scss")
        .pipe(sourcemaps.init())
        .pipe(sass.sync()) // scss to css
        .pipe(
            gulpautoprefixer({
                overrideBrowserslist: ["last 2 versions"],
            })
        )
        .pipe(dest(out))
        .on("data", function (file) {
            const buferFile = new cleanCSS({ compatibility: "*", inline: ["all"], level: 2, }).minify(file.contents);
            return (file.contents = Buffer.from(buferFile.styles));
        })
        .pipe(rename({ suffix: ".min" }))
        .pipe(sourcemaps.write("./")) // source maps
        .pipe(dest(out));
};

const initBrowserSync = function (done) {
    const startPath = "/index.html";
    browsersync.init({
        startPath: startPath,
        server: {
            baseDir: paths.baseDist,
            middleware: [
                function (req, res, next) {
                    req.method = "GET";
                    next();
                },
            ],
        },
    });
    done();
}

const reloadBrowserSync = function (done) {
    browsersync.reload();
    done();
}

function watchFiles() {
    watch(paths.baseSrc + "**/*.html", series([html, scss], reloadBrowserSync));
    watch(paths.baseSrcAssets + "data/**/*", series(data, reloadBrowserSync));
    watch(paths.baseSrcAssets + "fonts/**/*", series(fonts, reloadBrowserSync));
    watch(paths.baseSrcAssets + "images/**/*", series(images, reloadBrowserSync));
    watch(paths.baseSrcAssets + "js/**/*", series(javascript, reloadBrowserSync));
    watch([paths.baseSrcAssets + "scss/icons.scss", + paths.baseSrcAssets + "scss/icons/**/*.scss"], series(icons, reloadBrowserSync));
    watch([paths.baseSrcAssets + "scss/**/*.scss", paths.configTailwind, "!" + paths.baseSrcAssets + "scss/icons.scss", "!" + paths.baseSrcAssets + "scss/icons/*.scss"], series(scss, reloadBrowserSync));
}

exports.default = series(
    html,
    vendor,
    parallel(data, fonts, images, javascript, scss, icons),
    parallel(watchFiles, initBrowserSync)
);

exports.clean = series(
    clean
);

exports.build = series(
    clean,
    html,
    vendor,
    parallel(data, fonts, images, javascript, scss, icons)
);