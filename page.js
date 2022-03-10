import puppeteer from "puppeteer";
import dotenv from "dotenv";
import readlineSync from "readline-sync";
import fs from "fs";

var data = new Date();

var dia = String(data.getDate()).padStart(2, "0");
var mes = String(data.getMonth() + 1).padStart(2, "0");
var ano = data.getFullYear();
var horas = data.getHours();
var minutos = data.getMinutes();
const dateCurrent = `${dia}-${mes}-${ano}`;

dotenv.config();

async function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
const account = readlineSync.question("Account da loja");
const email = readlineSync.question("Email para acesso");

const robo = async () => {
  const browser = await puppeteer.launch({ headless: false });

  const page = await browser.newPage();
  const url = `https://${account}.myvtex.com/admin/a`;
  await page.goto(url);
  // await page.setUserAgent(
  //   "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36"
  // );

  //Clicar botao logar com google
  await page.waitForSelector('[data-testid="google-oauth"]');
  await page.click('[data-testid="google-oauth"]');

  //Digita no input de email
  await page.waitForSelector(".whsOnd.zHQkBf");
  await page.type(".whsOnd.zHQkBf", email);
  await page.click(".FliLIb.DL0QTb");
  console.log("Digitando email");

  //Digita no input de senhha
  await wait(2000);
  await page.type('[type="password"]', process.env.Senha);
  await page.click(".FliLIb.DL0QTb");
  console.log("Digitando senha");

  console.log("Login Feito com sucesso");

  await page.waitForNavigation();

  await page.goto(`https://${account}.vtexcommercestable.com.br/admin/a`);
  await page.waitForNavigation();

  await page.waitForSelector(`[href="/admin/a/PortalManagement/FolderContentBody?root:/"]`);
  await page.click(`[href="/admin/a/PortalManagement/FolderContentBody?root:/"]`);

  console.log("Acessando Html Templates");

  await wait(2000);
  await page.waitForSelector(`.directory.collapsed.template-folder`);
  await page.click(`.directory.collapsed.template-folder`);

  page.on("console", async (msg) => {
    const msgArgs = msg.args();
    for (let i = 0; i < msgArgs.length; ++i) {
      console.log(await msgArgs[i].jsonValue());
    }
  });
  const subTemplate = await page.click(
    ".directory.template-folder.expanded .directory.template-folder.collapsed"
  );

  const folders = await page.$$(".directory.template-folder .file.template");

  if (!fs.existsSync(`./${account}-backup`)) {
    fs.mkdir(`./${account}-backup`, (err) => {
      if (err) {
        console.log("Criar pasta account Deu Ruim");
        return;
      } else {
        console.log("Pasta backup Criada");
      }
    });
  }

  console.log("Fazendo Copias do templates");

  for (const item of folders) {
    item.click();
    const text = await page.evaluate((el) => el.textContent, item);
    await page.waitForFunction(`document.querySelector('#templateName')?.value === "${text}"`);

    const html = await page.evaluate(() => {
      return document.querySelector("#originalTemplate").value;
    });

    const dir = `./${account}-backup/${dateCurrent}`;

    if (!fs.existsSync(dir)) {
      //Efetua a criação do diretório
      fs.mkdir(dir, (err) => {
        if (err) {
          console.log("Deu ruim...");
          return;
        }
      });
    }

    fs.writeFileSync(`${dir}/${text}.html`, html);
  }
  console.log("backup feito com sucesso");
  await browser.close();
};
robo();
