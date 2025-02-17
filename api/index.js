import express from 'express';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

const app = express();

app.get('/scrape', async (req, res) => {
  try {
    // Iniciar el navegador con Puppeteer
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.goto('https://www.promiedos.com.ar', { waitUntil: 'domcontentloaded', timeout: 10000 }); // Esperar hasta que se cargue el DOM

    // Esperamos por el selector que contiene los partidos antes de proceder
    await page.waitForSelector('.match-info_itemevent__jJv13', { timeout: 5000 });

    // Realizar el scraping
    const matches = await page.$$eval('.match-info_itemevent__jJv13', (elements) => {
      return elements.map((el) => {
        const leagueElement = el.querySelector('.event-header_left__q8kgh');
        const league = leagueElement ? leagueElement.innerText : '';

        const matchDetails = Array.from(el.querySelectorAll('.item_item__BqOgz')).map((match) => {
          const timeElement = match.querySelector('.time_time__GlBIn');
          const matchStatus = match.querySelector('.time_status___8fRm');
          const time = timeElement ? timeElement.innerText : matchStatus ? matchStatus.innerText : '';

          const homeTeamElement = match.querySelector('.team_left__S_a4n .comand-name__title');
          const homeTeam = homeTeamElement ? homeTeamElement.innerText : '';
          const homeGoalsElement = match.querySelector('.parent_span__TxfTF > div > div:nth-child(1) > span');
          const homeGoals = homeGoalsElement ? homeGoalsElement.innerText : '';

          const awayTeamElement = match.querySelector('.team_right__ePX7C .comand-name__title');
          const awayTeam = awayTeamElement ? awayTeamElement.innerText : '';
          const awayGoalsElement = match.querySelector('.parent_span__TxfTF > div > div:nth-child(3) > span');
          const awayGoals = awayGoalsElement ? awayGoalsElement.innerText : '';
          
          return { league, time, homeTeam, homeGoals, awayTeam, awayGoals };
        });

        return { league, matchDetails };
      });
    });

    await browser.close(); // Cerrar el navegador tan pronto como se obtengan los datos

    res.json({ matches });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default app;
