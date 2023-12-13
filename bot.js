const url = "https://robots.farm/leaderboard";
//theses are the selectors for the values innertext
const infos = [
	"#app main div.main.container.svelte-1gig4d7 div:nth-child(3) div:nth-child(2) div.grid.svelte-1rs6xdk div:nth-child(3) div.glow-epic.stat.svelte-1rs6xdk",
	"#app main div.main.container.svelte-1gig4d7 div:nth-child(3) div:nth-child(2) div.grid.svelte-1rs6xdk div:nth-child(2) div.glow.stat.svelte-1rs6xdk",
	"#app main div.main.container.svelte-1gig4d7 div:nth-child(3) div:nth-child(2) div.grid.svelte-1rs6xdk div:nth-child(1) div.glow-blue.stat.svelte-1rs6xdk",
];
//discord chanel id for the robots.farm general channel `1109212307688542289`
const guildId = `1149813222728278046`;
//clicking on stats link to toggle the stats div
const stats =
	"#app main div.main.container.svelte-1gig4d7 div:nth-child(3) div.tabs.svelte-1em9m26 div:nth-child(9) button";
//the array to display values for activity
let display = [];
const puppeteer = require("puppeteer");
const Discord = require("discord.js");
//log to bot
const client = new Discord.Client({
	intents: [
		Discord.Intents.FLAGS.GUILDS,
		Discord.Intents.FLAGS.GUILD_MESSAGES,
		Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
	],
});
//starting the bot firt action
client.on("ready", async () => {
	console.log(`Logged in as jumi's Robots.farm/leaderbord-stats getter bot!`);
	client.user.setStatus();
	try {
		browser = await puppeteer.launch({ headless: "new" });
		await getStats();
	} catch (e) {
		console.error("Error in main function:", e);
	}
});
// I use puppeter to open the page, click on stats and get the info
const getStats = async () => {
	display = [];
	try {
		const page = await browser.newPage();
		await page.goto(url, { waitUntil: "networkidle2" });
		await page.waitForSelector(stats);
		await page.click(stats);
		for (let index = 0; index < infos.length; index++) {
			await fetchAndPushInfos(page, infos[index]);
		}
		await page.close();
	} catch (e) {
		console.error(e);
	} finally {
		//then i iterate throw the array of infos to display a status
		iterateInDisplay();
	}
};
//this get the info
const fetchAndPushInfos = async (page, info) => {
	try {
		await page.waitForSelector(info, { timeout: 8000 });
		display.push(await page.$eval(info, (el) => el.innerText));
	} catch (e) {
		console.error("Error in updateStatus:", e);
	}
};
// this is mostly to not do the fetcing process a lot and those numbers are not that dynamic too
// this change the nickname in a certain discord channel and the activity
const iterateInDisplay = async () => {
	const tokenNames = ["Tokens", "Crates", "Items"];
	const guild = client.guilds.cache.get(guildId);
	for (let i = 0; i < 100; i++) {
		await displayChanges(tokenNames, guild);
	}
	getStats();
};

const displayChanges = async (tokenNames, guild) => {
	const member = guild.members.cache.get(client.user.id);
    for (let index = 0; index < display.length; index++) {
		await member.setNickname(`${index>0?'Found:':'Earned:'} ${display[index]}`);
		await client.user.setActivity({ name: `: ${tokenNames[index]}` }, { type: "WATCHING" });
		await new Promise((resolve) => setTimeout(resolve, 8000));
	}
};

const auth = require("./auth.json");
client.login(auth.token);
