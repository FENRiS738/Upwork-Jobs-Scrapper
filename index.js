import express from 'express';
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import * as cheerio from 'cheerio';

const app = express();
app.use(express.json());

puppeteer.use(StealthPlugin());

const get_job_urls = (pageSourceHTML) => {
    const JOBS = [];
    const $ = cheerio.load(pageSourceHTML);

    $('.air3-link').each(function () {
        const jobUrl = $(this).attr('href');
        if (jobUrl) {
            JOBS.push("https://www.upwork.com" + jobUrl);
        }
    });

    return JOBS;
}

app.get("/", async (req, res) => {
    const baseUrl = "https://www.upwork.com/nx/search/jobs";

    const allowedParams = [
        "q", "sort", "contractor_tier", "t", "hourly_rate",
        "amount", "client_hires", "location", "duration_v3",
        "workload", "contract_to_hire", "page", "per_page"
    ];

    const queryParams = {};
    for (const key of allowedParams) {
        if (req.query[key]) {
            queryParams[key] = req.query[key];
        }
    }

    const searchParams = new URLSearchParams(queryParams).toString();
    const finalUrl = searchParams ? `${baseUrl}?${searchParams}` : baseUrl;

    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",
                "--disable-features=IsolateOrigins,site-per-process",
                "--disable-blink-features=AutomationControlled",
            ],
        });

        const page = await browser.newPage();

        await page.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        );
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
        });

        await page.goto(finalUrl, { waitUntil: "networkidle2" });

        const pageSourceHTML = await page.content();
        await browser.close();

        const job_urls = get_job_urls(pageSourceHTML);

        res.json({ success: true, message: "Automation completed", job_urls: job_urls });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running...`);
});
