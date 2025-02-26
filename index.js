import express from 'express';
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import * as cheerio from 'cheerio';

const app = express();
app.use(express.json());

puppeteer.use(StealthPlugin());

const get_job_urls = async (pageSourceHTML) => {
    const JOBS = [];
    const $ = cheerio.load(pageSourceHTML);

    $('article.job-tile').each(function () {
        const jobTitle = $(this).find('h2 a').text().trim();
        const description = $(this).find('p.text-body-sm').text().trim();
        const skills = $(this).find('.air3-token').map((i, el) => $(el).text().trim()).get();
        const jobUrl = "https://www.upwork.com" + $(this).find('h2 a').attr('href');
        const rateType = $(this).find('ul > [data-test=job-type-label]').text().trim();
        const experience = $(this).find('ul > [data-test=experience-level]').text().trim();
        const postedTime = $(this).find('[data-test=job-pubilshed-date] span').map((i, el) => $(el).text().trim()).get().join(" ");

        const job =  {
            jobTitle,
            description,
            skills,
            jobUrl,
            rateType,
            experience,
            postedTime,
        }

        if(rateType === "Fixed price"){
            const estBudget = $(this).find('ul > [data-test=is-fixed-price] strong').map((i, el) => $(el).text().trim()).get().join(" ");
            job['estBudget'] = estBudget;
        }
        else{
            const estTime = $(this).find('ul > [data-test=duration-label] strong').map((i, el) => $(el).text().trim()).get().join(" ");
            job['estTime'] = estTime;
        }
        JOBS.push(job);
    });

    return JOBS;
}

const get_source_html = async (finalUrl) => {
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

    await page.goto(finalUrl, { waitUntil: 'domcontentloaded' });

    const htmlContent = await page.content();
    await browser.close();

    return htmlContent;
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
        const pageSourceHTML = await get_source_html(finalUrl);
        const jobs = await get_job_urls(pageSourceHTML);

        res.json({ success: true, message: "Automation completed" ,jobs });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running...`);
});
