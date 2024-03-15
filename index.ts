// import axios from "axios";

import puppeteer from 'puppeteer';
import { writeFile } from 'fs';

const INSTAGRAM_BASE_URL = 'https://www.instagram.com';

const profileList = [
	'diabloguitarsseattle',
	'thunderroadguitars',
	'ecguitars',
	'mmguitarbar',
	'quimpersoundguitars',
];

const main = async () => {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();

	const fetchProfile = async (profile: string) => {
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

	let csvData: string[] = [];

	const writeProfilesToFiles = (profiles: string[]) => {
		profiles.forEach((profile, index) => {
			// pull out onlu the bit inside the first <ul> tag
			// let profileMetrics = profile.split('<ul')[1].split('</ul')[0];
			// //remove everything before the first <li> tag
			// let profileMetricsArr = profileMetrics.split('<li');
			// profileMetricsArr.shift();
			// profileMetrics = '<li' + profileMetricsArr.join('<li');
			//remove the class attribute from all tags
			let profileMetrics = profile.replace(/class=".*?"/g, '');

			const postsCount = (profileMetrics.match(/<span ><span >(.+?)<\/span><\/span>/) ?? [''])[0];
			const followersCount = (profileMetrics.match(/title="(.+?)"/) ?? [''])[0];

			csvData.push('');
			csvData.push('');
			csvData.push(postsCount);
			csvData.push(followersCount);
			csvData.push('');
			csvData.push('');

			console.log(`Profile: ${profileList[index]}`);

			// write the profile to a file
			writeFile(`./profiles/${profileList[index]}.html`, profileMetrics, (err) => {
				if (err) {
					console.error(err);
				}
			});
		});

		writeFile(`./profiles/metrics.csv`, csvData.join(','), (err) => {
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
