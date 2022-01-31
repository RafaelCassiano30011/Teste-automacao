import puppeteer from "puppeteer";
import dotenv from "dotenv";
import readlineSync from "readline-sync";
import fs from "fs";

dotenv.config();

async function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const robo = async () => {
  const browser = await puppeteer.launch({ headless: false, devtools: true });
  const page = await browser.newPage();
  const url = `https://guiadomarceneiro.myvtex.com/admin/a`;
  await page.goto(url);

  await page.waitForNavigation();
  setTimeout(async () => {
    await page.click('[data-testid="google-oauth"]');
    await page.waitForNavigation();
    await page.type(".whsOnd.zHQkBf", `rafael.souza@agenciaeplus.com.br`);
    await page.click(".FliLIb.DL0QTb");
    await wait(2000);
    await page.type('[type="password"]', process.env.Senha);
    await page.click(".FliLIb.DL0QTb");
    await page.waitForNavigation();

    await page.goto("https://guiadomarceneiro.vtexcommercestable.com.br/admin/a");
    await page.waitForNavigation();
    await page.click(`[href="/admin/a/PortalManagement/FolderContentBody?root:/"]`);

    await wait(2000);
    await page.click(`.directory.collapsed.template-folder`);

    page.on("console", async (msg) => {
      const msgArgs = msg.args();
      for (let i = 0; i < msgArgs.length; ++i) {
        console.log(await msgArgs[i].jsonValue());
      }
    });

    const teste = await page.$$(".directory.template-folder .file.template");

    for (const item of teste) {
      item.click();
      const text = await page.evaluate((el) => el.textContent, item);
      await page.waitForFunction(`document.querySelector('#templateName')?.value === "${text}"`);
      // await page.waitForSelector("#originalTemplate");

      const html = await page.evaluate(() => {
        return document.querySelector("#originalTemplate").value;
      });

      fs.writeFileSync(`backup/${text}.html`, html);
    }

    // const teste = await page.evaluate(async () => {
    // async function wait(ms) {
    //   return new Promise((resolve) => {
    //     setTimeout(resolve, ms);
    //   });
    // }
    // const $parent = document.querySelector(".directory.template-folder");

    // const foldes = $parent.querySelectorAll(".file.template");
    // const array = [];
    // for (const item of Array.from(foldes)) {
    //   const $a = item.querySelector("a");

    //   item.click();

    //   const input = document.querySelector("#originalTemplate");

    //   array.push({
    //     nameFolder: $a.textContent,
    //     html: input.value,
    //   });
    // }

    // return array;
    // });
  }, 1000);

  //   await browser.close();
};
robo();
