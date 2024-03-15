"use strict";
// import axios from "axios";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
const fs_1 = require("fs");
const INSTAGRAM_BASE_URL = 'https://www.instagram.com';
const profileList = [
    'diabloguitarsseattle',
    'thunderroadguitars',
    'ecguitars',
    'mmguitarbar',
    'quimpersoundguitars',
];
const main = async () => {
    const browser = await puppeteer_1.default.launch();
    const page = await browser.newPage();
    const fetchProfile = async (profile) => {
        console.log(`Fetching profile: ${profile}`);
        await page.goto(`${INSTAGRAM_BASE_URL}/${profile}`);
        console.log(`Waiting for profile: ${profile}`);
        await page.setViewport({ width: 1080, height: 1024 });
        await page.waitForNetworkIdle();
        console.log(`Profile: ${profile} loaded`);
        const profileContent = await page.content();
        console.log(`Profile: ${profile} content fetched`);
        return profileContent;
    };
    const fetchProfiles = async () => {
        let profiles = [];
        for (let i = 0; i < profileList.length; i++) {
            profiles.push(await fetchProfile(profileList[i]));
        }
        return profiles;
    };
    let csvData = [];
    const writeProfilesToFiles = (profiles) => {
        profiles.forEach((profile, index) => {
            var _a, _b;
            // pull out onlu the bit inside the first <ul> tag
            // let profileMetrics = profile.split('<ul')[1].split('</ul')[0];
            // //remove everything before the first <li> tag
            // let profileMetricsArr = profileMetrics.split('<li');
            // profileMetricsArr.shift();
            // profileMetrics = '<li' + profileMetricsArr.join('<li');
            //remove the class attribute from all tags
            let profileMetrics = profile.replace(/class=".*?"/g, '');
            const postsCount = ((_a = profileMetrics.match(/<span ><span >(.+?)<\/span><\/span>/)) !== null && _a !== void 0 ? _a : [''])[0];
            const followersCount = ((_b = profileMetrics.match(/title="(.+?)"/)) !== null && _b !== void 0 ? _b : [''])[0];
            csvData.push('');
            csvData.push('');
            csvData.push(postsCount);
            csvData.push(followersCount);
            csvData.push('');
            csvData.push('');
            console.log(`Profile: ${profileList[index]}`);
            // write the profile to a file
            (0, fs_1.writeFile)(`./profiles/${profileList[index]}.html`, profileMetrics, (err) => {
                if (err) {
                    console.error(err);
                }
            });
        });
        (0, fs_1.writeFile)(`./profiles/metrics.csv`, csvData.join(','), (err) => {
            if (err) {
                console.error(err);
            }
        });
    };
    fetchProfiles()
        .then(writeProfilesToFiles)
        .then(() => {
        console.log('Profiles fetched and written to files');
        browser.close();
    });
};
main();
